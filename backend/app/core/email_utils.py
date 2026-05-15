import os
import smtplib
from email.message import EmailMessage

def send_verification_email(email: str, verification_link: str) -> bool:
    smtp_host = os.getenv("SMTP_HOST", "smtp.gmail.com")
    smtp_port = int(os.getenv("SMTP_PORT", "465"))
    smtp_user = os.getenv("SMTP_USER", "")
    smtp_password = os.getenv("SMTP_PASSWORD", "")
    email_from = os.getenv("EMAIL_FROM", smtp_user)

    print(f"[email] Attempting Gmail send to {email} via port {smtp_port}...")

    if not smtp_user or not smtp_password:
        print("[email] ❌ SMTP credentials missing in .env")
        return False

    message = EmailMessage()
    message["Subject"] = "Verify your account"
    message["From"] = email_from
    message["To"] = email
    message.set_content(f"Click here to verify your account: {verification_link}")

    try:
        # Port 465 is for SMTP_SSL
        if smtp_port == 465:
            server = smtplib.SMTP_SSL(smtp_host, smtp_port, timeout=15)
        else:
            server = smtplib.SMTP(smtp_host, smtp_port, timeout=15)
            server.starttls()

        server.login(smtp_user, smtp_password)
        server.send_message(message)
        server.quit()
        print(f"[email] ✅ Email sent to {email}!")
        return True
    except Exception as e:
        print(f"[email] ❌ Error: {str(e)}")
        return False
