import secrets
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from app.core.config import settings

def generate_random_token(length: int = 32) -> str:
    """Generates a cryptographically secure random token string."""
    return secrets.token_urlsafe(length)

def send_email_via_smtp(to_email: str, subject: str, html_body: str) -> bool:
    """
    Sends an email using standard SMTP server settings.
    """
    if not settings.SMTP_USER or not settings.SMTP_PASSWORD:
        print(f"[SMTP] SMTP_USER or SMTP_PASSWORD not configured. Skipping email send for {to_email}.")
        return False

    try:
        sender_email = settings.EMAILS_FROM or settings.SMTP_USER
        clean_password = settings.SMTP_PASSWORD.replace(" ", "").strip()

        msg = MIMEMultipart("alternative")
        msg["Subject"] = subject
        msg["From"] = f"Support <{sender_email}>"
        msg["To"] = to_email

        html_part = MIMEText(html_body, "html")
        msg.attach(html_part)

        with smtplib.SMTP(settings.SMTP_HOST, settings.SMTP_PORT, timeout=15) as server:
            server.ehlo()
            server.starttls()
            server.login(settings.SMTP_USER.strip(), clean_password)
            server.sendmail(sender_email, to_email, msg.as_string())

        print(f"[SMTP SUCCESS] Real email successfully delivered to {to_email} via Gmail SMTP!")
        return True
    except Exception as e:
        print(f"[SMTP ERROR] Failed to send email to {to_email}: {str(e)}")
        return False

def send_verification_email(email: str, token: str):
    """Sends a human, friendly email verification link."""
    verify_link = f"http://localhost:3000/verify-email?token={token}"
    subject = "Please confirm your email address"
    
    html_body = f"""
    <div style="font-family: Arial, sans-serif; max-width: 520px; margin: 0 auto; padding: 24px; color: #1e293b; background-color: #ffffff; border: 1px solid #e2e8f0; border-radius: 8px;">
        <h3 style="margin-top: 0; color: #0f172a;">Hi there,</h3>
        <p style="font-size: 14px; line-height: 1.6; color: #334155;">
            Thanks for creating an account with us. Please confirm your email address by clicking the link below so we know it's really you:
        </p>
        <p style="margin: 24px 0; text-align: center;">
            <a href="{verify_link}" style="background-color: #4f46e5; color: #ffffff; padding: 10px 20px; text-decoration: none; border-radius: 6px; font-size: 14px; font-weight: 600; display: inline-block;">
                Confirm Email
            </a>
        </p>
        <p style="font-size: 13px; color: #64748b; line-height: 1.5;">
            If you didn't sign up for an account, you can simply ignore this email.
        </p>
        <hr style="border: none; border-top: 1px solid #f1f5f9; margin: 20px 0;" />
        <p style="font-size: 12px; color: #94a3b8; word-break: break-all;">
            Or copy and paste this URL into your browser: <br />
            <a href="{verify_link}" style="color: #4f46e5;">{verify_link}</a>
        </p>
    </div>
    """

    print(f"\n[Verification Link for {email}]: {verify_link}\n")
    send_email_via_smtp(email, subject, html_body)

def send_password_reset_email(email: str, token: str):
    """Sends a human, friendly password reset link."""
    reset_link = f"http://localhost:3000/reset-password?token={token}"
    subject = "Reset your password"
    
    html_body = f"""
    <div style="font-family: Arial, sans-serif; max-width: 520px; margin: 0 auto; padding: 24px; color: #1e293b; background-color: #ffffff; border: 1px solid #e2e8f0; border-radius: 8px;">
        <h3 style="margin-top: 0; color: #0f172a;">Hi there,</h3>
        <p style="font-size: 14px; line-height: 1.6; color: #334155;">
            We received a request to reset your password. You can set a new password by clicking the link below:
        </p>
        <p style="margin: 24px 0; text-align: center;">
            <a href="{reset_link}" style="background-color: #4f46e5; color: #ffffff; padding: 10px 20px; text-decoration: none; border-radius: 6px; font-size: 14px; font-weight: 600; display: inline-block;">
                Reset Password
            </a>
        </p>
        <p style="font-size: 13px; color: #64748b; line-height: 1.5;">
            This link will expire in 15 minutes. If you didn't ask to reset your password, no worries—your account is safe and you can ignore this email.
        </p>
        <hr style="border: none; border-top: 1px solid #f1f5f9; margin: 20px 0;" />
        <p style="font-size: 12px; color: #94a3b8; word-break: break-all;">
            Or copy and paste this URL into your browser: <br />
            <a href="{reset_link}" style="color: #4f46e5;">{reset_link}</a>
        </p>
    </div>
    """

    print(f"\n[Reset Link for {email}]: {reset_link}\n")
    send_email_via_smtp(email, subject, html_body)
