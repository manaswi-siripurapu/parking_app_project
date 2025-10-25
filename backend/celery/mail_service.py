# import smtplib
# from email.mime.multipart import MIMEMultipart
# from email.mime. text import MIMEText

# SMTP_SERVER = "localhost"
# SMTP_PORT = 1025
# SENDER_EMAIL = 'parkeasyadmin@gmail.com'
# SENDER_PASSWORD = ''

# def send_email(to, subject, content):
#     msg = MIMEMultipart()

#     msg['To'] = to
#     msg['Subject'] = subject
#     msg['From'] = SENDER_EMAIL

#     msg.attach(MIMEText(content,'html'))

#     with smtplib.SMTP(host=SMTP_SERVER, port=SMTP_PORT) as client:
#         client.send_message(msg)
#         client.quit()

# # send_email('fortesting@gmail.com', 'Test email', '<h1> this is from parkeasy web admin <h1>')

import os
import smtplib
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText

# Load config from environment or defaults
MAIL_SERVER = os.environ.get('MAIL_SERVER', 'smtp.sendgrid.net')
MAIL_PORT = int(os.environ.get('MAIL_PORT', 587))
MAIL_USE_TLS = os.environ.get('MAIL_USE_TLS', 'true').lower() in ['true', 'on', '1']
MAIL_USERNAME = os.environ.get('MAIL_USERNAME', 'apikey')  # 'apikey' is literal for SendGrid
MAIL_PASSWORD = os.environ.get('SENDGRID_API_KEY')
MAIL_DEFAULT_SENDER = os.environ.get('MAIL_DEFAULT_SENDER', 'your-email@example.com')

def send_email(to, subject, content):
    msg = MIMEMultipart()
    msg['To'] = to
    msg['Subject'] = subject
    msg['From'] = MAIL_DEFAULT_SENDER

    msg.attach(MIMEText(content, 'html'))

    # Create SMTP connection
    with smtplib.SMTP(MAIL_SERVER, MAIL_PORT) as client:
        if MAIL_USE_TLS:
            client.starttls()
        if MAIL_USERNAME and MAIL_PASSWORD:
            client.login(MAIL_USERNAME, MAIL_PASSWORD)
        client.send_message(msg)
        client.quit()

# Example usage:
# send_email('fortesting@gmail.com', 'Test email', '<h1> this is from parkeasy web admin <h1>')