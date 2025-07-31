class Config():
    DEBUG = False
    SQLALCHEMY_TRACK_MODIFICATIONS = False

class LocalDevelopmentConfig(Config):
    SQLALCHEMY_DATABASE_URI = 'sqlite:///database_parking_app.sqlite3'
    DEBUG = True
    SECURITY_PASSWORD_HASH = 'bcrypt'
    SECURITY_PASSWORD_SALT = 'this-is-a-salt-very-long-and-unique'
    SECRET_KEY = 'thisshouldbekepthidden'
    SECURITY_TOKEN_AUTHENTICATION_HEADER = 'Authentication-Token'

    CACHE_TYPE = "RedisCache"
    CACHE_DEFAULT_TIMEOUT = 30
    CACHE_REDIS_PORT = 6379

    WTF_CSRF_ENABLED = False
    #csrf can be used to protect against cross-site request forgery attacks
