# import os
# from celery import Celery, Task
# from flask import Flask

# class CeleryConfig():
#     broker_url = 'redis://localhost:6379/0'
#     result_backend = 'redis://localhost:6379/1'
#     timezone = 'Asia/Kolkata'

# redis_url = os.environ.get('REDIS_URL', 'redis://localhost:6379/0')
# celery_app = Celery(__name__, broker=redis_url, backend=redis_url)

# def celery_init_app(app: Flask) -> Celery:
#     class FlaskTask(Task):
#         def __call__(self, *args: object, **kwargs: object) -> object:
#             with app.app_context():
#                 return self.run(*args, **kwargs)

#     celery_app = Celery(app.name, task_cls=FlaskTask)
#     celery_app.config_from_object(CeleryConfig)
#     celery_app.set_default()
#     app.extensions["celery"] = celery_app
#     return celery_app

import os
from celery import Celery, Task
from flask import Flask

def celery_init_app(app: Flask) -> Celery:
    redis_url = os.environ.get('REDIS_URL', 'redis://localhost:6379/0')

    class FlaskTask(Task):
        def __call__(self, *args: object, **kwargs: object) -> object:
            with app.app_context():
                return self.run(*args, **kwargs)

    celery_app = Celery(
        app.name,
        broker=redis_url,
        backend=redis_url,
        task_cls=FlaskTask
    )
    celery_app.config_from_object('your_project.celeryconfig')  
    celery_app.set_default()
    app.extensions["celery"] = celery_app
    return celery_app