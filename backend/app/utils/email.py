import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
import os
import logging

logger = logging.getLogger(__name__)

def send_otp_email(to_email: str, otp: str, subject: str = "Your Verification Code"):
    """
    Sends an OTP email using standard smtplib.
    Reads SMTP config from environment variables.
    """
    smtp_host = os.getenv("SMTP_HOST", "smtp.gmail.com")
    smtp_port = int(os.getenv("SMTP_PORT", 587))
    smtp_user = os.getenv("SMTP_USER")
    smtp_password = os.getenv("SMTP_PASSWORD")
    email_from = os.getenv("EMAIL_FROM", smtp_user)
    email_from_name = os.getenv("EMAIL_FROM_NAME", "FleetFlow")
    
    if not smtp_user or not smtp_password:
        logger.warning("SMTP credentials not configured. Skipping email send.")
        print(f"\n[DEV MODE] Mock Email to {to_email}: OTP is {otp}\n")
        return False
        
    try:
        msg = MIMEMultipart("alternative")
        msg["Subject"] = subject
        msg["From"] = f"{email_from_name} <{email_from}>"
        msg["To"] = to_email

        html = f"""
        <html>
          <body>
            <h2>Hello!</h2>
            <p>Your verification code is: <strong>{otp}</strong></p>
            <p>This code is valid for 5 minutes. Please do not share this code with anyone.</p>
          </body>
        </html>
        """
        
        part = MIMEText(html, "html")
        msg.attach(part)
        
        with smtplib.SMTP(smtp_host, smtp_port) as server:
            server.starttls()
            server.login(smtp_user, smtp_password)
            server.send_message(msg)
            
        logger.info(f"OTP email successfully sent to {to_email}")
        return True
    except Exception as e:
        logger.error(f"Failed to send email to {to_email}: {e}")
        return False
