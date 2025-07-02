class Config():
    DEBUG = False
    SQL_ALCHEMY_TRACK_MODIFICATIONS = False

class LocalDevelopmentConfig(Config):
    SQLALCHEMY_DATABASE_URI = 'sqlite:///database.sqlite3'
    DEBUG = True
    SECURITY_PASSWORD_HASH = 'bcrypt'
    SECURITY_PASSWORD_SALT = 'this-is-a-salt-very-long-and-unique'
    SECRET_KEY = 'thisshouldbekepthidden'

    WTF_CSRF_ENABLED = False
    #csrf can be used to protect against cross-site request forgery attacks
    #it is enabled by default in flask-wtf, but we are disabling it here for
    #development purposes. In production, it should be enabled, for higher security.