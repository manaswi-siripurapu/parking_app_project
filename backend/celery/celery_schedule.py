from celery.schedules import crontab
from flask import current_app as app
from backend.celery.tasks import email_reminder

celery_app = app.extensions['celery']

@celery_app.on_after_configure.connect
def setup_periodic_tasks(sender, **kwargs):
    # every 10 seconds
    # sender.add_periodic_task(10.0, email_reminder.s('students@gmail', 'reminder to login', '<h1> hello everyone </h1>') )

    # daily message at 2:45 pm, everyday
    sender.add_periodic_task(
        crontab(hour=18, minute=35),
        email_reminder.s(
            'Customer@gmail.com',
            'Daily Parking Reminder ',
            '''
            <h2 style="color:#2c3e50;">Good Afternoon from ParkEasy!</h2>
            <p>Don't forget to reserve your parking spot today to avoid the last-minute rush </p>
            <p>Just log in and book your spot with a few clicks. Hassle-free parking is one tap away!</p>
            <p><a href="http://localhost:5000/login" style="color:#2980b9;">Login & Book Now</a></p>
            <br>
            <small style="color:gray;">This is an automated daily reminder from ParkEasy.</small>
            '''
        ),
        name='daily reminder'
    )

    # weekly message, at 2:55 every sunday
    sender.add_periodic_task(
        crontab(hour=14, minute=55, day_of_week='sunday'),
        email_reminder.s(
            'Customer@gmail.com',
            'Your Weekly ParkEasy Recap ',
            '''
            <h2 style="color:#34495e;">Hey there!</h2>
            <p>Hope your week went smooth. ParkEasy has been keeping things stress-free for your vehicle! 🚗</p>
            <ul>
                <li> Check your past bookings</li>
                <li> View your usage summary</li>
                <li> Pre-book for a busy week ahead</li>
            </ul>
            <p><a href="http://localhost:5000/login" style="color:#27ae60;">Login & View Your Dashboard</a></p>
            <p>We’re always here to make your parking experience better.</p>
            <br>
            <small style="color:gray;">Sent to you by the ParkEasy team – Your smart parking buddy.</small>
            '''
        ),
        name='weekly reminder'
    )


