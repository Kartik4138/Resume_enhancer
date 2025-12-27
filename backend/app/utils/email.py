import os
import requests

RESEND_API_KEY = os.getenv("RESEND_API_KEY")
EMAIL_FROM = os.getenv("EMAIL_FROM", "Resume Enhancer <onboarding@resend.dev>")

def send_otp_email(email: str, otp: str):
    if not RESEND_API_KEY:
        raise RuntimeError("RESEND_API_KEY not configured")

    payload = {
        "from": EMAIL_FROM,
        "to": [email],
        "subject": "Your OTP Code",
        "html": f"""
        <div style="font-family: Arial, sans-serif;">
            <h2>Your OTP</h2>
            <p>Use the following OTP to continue:</p>
            <h1 style="letter-spacing: 4px;">{otp}</h1>
            <p>This OTP expires in 5 minutes.</p>
        </div>
        """
    }

    response = requests.post(
        "https://api.resend.com/emails",
        headers={
            "Authorization": f"Bearer {RESEND_API_KEY}",
            "Content-Type": "application/json"
        },
        json=payload,
        timeout=10
    )

    if response.status_code >= 400:
        raise RuntimeError(
            f"Resend error {response.status_code}: {response.text}"
        )
