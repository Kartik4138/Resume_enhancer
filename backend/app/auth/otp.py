import hashlib
import hmac
import os

OTP_SECRET = os.getenv("OTP_SECRET", "dev-secret-change-me")

def hash_otp(otp: str) -> str:
    return hmac.new(
        OTP_SECRET.encode(),
        otp.encode(),
        hashlib.sha256
    ).hexdigest()

def verify_otp(otp: str, otp_hash: str) -> bool:
    return hmac.compare_digest(
        hash_otp(otp),
        otp_hash
    )
