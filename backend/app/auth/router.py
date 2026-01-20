from datetime import datetime, timedelta
import random

from fastapi import APIRouter, Depends, HTTPException
from jose import jwt, JWTError
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import delete, select

from app.auth.otp import hash_otp, verify_otp
from app.db.session import get_session
from app.db.model import User, RefreshToken, EmailOTP
from app.auth.jwt import (
    SECRET_KEY,
    ALGORITHM,
    create_access_token,
    create_refresh_token
)
from app.auth.deps import get_current_user
from app.auth.schema import EmailInput, OTPVerifyInput
from app.utils.email import send_otp_email

router = APIRouter(prefix="/auth", tags=["Auth"])

@router.post("/request-otp")
async def request_otp(
    payload: EmailInput,
    db: AsyncSession = Depends(get_session)
):
    await db.execute(
        delete(EmailOTP).where(EmailOTP.email == payload.email)
    )

    otp = str(random.randint(100000, 999999))
    otp_hash = hash_otp(otp)

    db.add(
        EmailOTP(
            email=payload.email,
            otp_hash=otp_hash,
            expires_at=datetime.utcnow() + timedelta(minutes=5),
            used=False
        )
    )
    
    await db.commit()

    send_otp_email(payload.email, otp)

    return {"message": "OTP sent to email. Previous codes have been invalidated."}

@router.post("/verify-otp")
async def verify_otp(
    payload: OTPVerifyInput,
    db: AsyncSession = Depends(get_session)
):
    res = await db.execute(
        select(EmailOTP)
        .where(
            EmailOTP.email == payload.email,
            EmailOTP.used == False,
            EmailOTP.expires_at > datetime.utcnow()
        )
        .order_by(EmailOTP.created_at.desc())
    )
    otp_entry = res.scalar_one_or_none()

    if not otp_entry or not verify_otp(payload.otp, otp_entry.otp_hash):
        raise HTTPException(status_code=401, detail="Invalid or expired OTP")

    otp_entry.used = True

    # Get or create user
    res = await db.execute(select(User).where(User.email == payload.email))
    user = res.scalar_one_or_none()

    if not user:
        user = User(email=payload.email)
        db.add(user)
        await db.flush()

    access_token = create_access_token({"sub": str(user.id)})
    refresh_token = create_refresh_token({"sub": str(user.id)})

    db.add(
        RefreshToken(
            user_id=user.id,
            token_hash=hash_otp(refresh_token),
            expires_at=datetime.utcnow() + timedelta(days=7),
            revoked=False
        )
    )

    await db.commit()

    return {
        "access_token": access_token,
        "refresh_token": refresh_token,
        "token_type": "bearer"
    }

@router.post("/refresh")
async def refresh(
    refresh_token: str,
    db: AsyncSession = Depends(get_session)
):
    try:
        payload = jwt.decode(
            refresh_token,
            SECRET_KEY,
            algorithms=[ALGORITHM]
        )
        if payload.get("type") != "refresh":
            raise HTTPException(status_code=401)
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid refresh token")

    user_id = payload["sub"]
    refresh_hash = hash_otp(refresh_token)

    res = await db.execute(
        select(RefreshToken).where(
            RefreshToken.user_id == user_id,
            RefreshToken.token_hash == refresh_hash,
            RefreshToken.revoked == False
        )
    )
    token = res.scalar_one_or_none()

    if not token:
        raise HTTPException(status_code=401, detail="Refresh token revoked")

    token.revoked = True

    new_access = create_access_token({"sub": str(user_id)})
    new_refresh = create_refresh_token({"sub": str(user_id)})

    db.add(
        RefreshToken(
            user_id=user_id,
            token_hash=hash_otp(new_refresh),
            expires_at=datetime.utcnow() + timedelta(days=7),
            revoked=False
        )
    )

    await db.commit()

    return {
        "access_token": new_access,
        "refresh_token": new_refresh
    }


@router.post("/logout")
async def logout(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_session)
):
    res = await db.execute(
        select(RefreshToken)
        .where(RefreshToken.user_id == current_user.id)
    )

    for token in res.scalars():
        token.revoked = True

    await db.commit()

    return {"message": "Logged out"}
