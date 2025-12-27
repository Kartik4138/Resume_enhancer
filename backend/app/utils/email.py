import os
import smtplib
from email.message import EmailMessage
from dotenv import load_dotenv

load_dotenv()

SMTP_HOST = os.getenv("SMTP_HOST")
SMTP_PORT = int(os.getenv("SMTP_PORT", "587"))
SMTP_USER = os.getenv("SMTP_USER")
SMTP_PASS = os.getenv("SMTP_PASS")
FROM_EMAIL = os.getenv("FROM_EMAIL")


def send_otp_email(email: str, otp: str):
    if not all([SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, FROM_EMAIL]):
        raise RuntimeError("SMTP environment variables are not properly set")

    msg = EmailMessage()
    msg["Subject"] = "Your Login OTP"
    msg["From"] = FROM_EMAIL
    msg["To"] = email

    msg.set_content(
        f"""
Your One-Time Password (OTP) is:

{otp}

This OTP is valid for 5 minutes.
Do not share this code with anyone.

If you did not request this, please ignore this email.
"""
    )

    try:
        with smtplib.SMTP(SMTP_HOST, SMTP_PORT) as server:
            server.starttls()
            server.login(SMTP_USER, SMTP_PASS)
            server.send_message(msg)
    except Exception as e:
        raise RuntimeError(f"Failed to send OTP email: {str(e)}")
