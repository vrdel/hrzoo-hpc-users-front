"""
Django settings for hrzoosignup project.

Generated by 'django-admin startproject' using Django 4.1.7.

For more information on this file, see
https://docs.djangoproject.com/en/4.1/topics/settings/

For the full list of settings and their values, see
https://docs.djangoproject.com/en/4.1/ref/settings/
"""

from pathlib import Path

# Build paths inside the project like this: BASE_DIR / 'subdir'.
BASE_DIR = Path(__file__).resolve().parent.parent

# config parse
# -vrdel
import os
from configparser import ConfigParser, NoSectionError
from django.core.exceptions import ImproperlyConfigured

VENV = '/opt/hrzoo-signup/'
APP_PATH = os.path.abspath(os.path.split(__file__)[0])
CONFIG_FILE = '{}/etc/hrzoosignup/hzsi.conf'.format(VENV)

try:
    config = ConfigParser()

    if not config.read([CONFIG_FILE], encoding='utf-8'):
        raise ImproperlyConfigured('Unable to parse config file %s' % CONFIG_FILE)

    # General
    DEBUG_OPTION = bool(config.getboolean('GENERAL', 'Debug'))
    RELATIVE_PATH = config.get('GENERAL', 'RelativePath')

    ALLOWED_HOSTS = config.get('SECURITY', 'AllowedHosts')
    HOST_CERT = config.get('SECURITY', 'HostCert')
    HOST_KEY = config.get('SECURITY', 'HostKey')
    SECRET_KEY_FILE = config.get('SECURITY', 'SecretKeyFile')

    SAML_METADATA = config.get('SAML2', 'Metadata')

    DBNAME = config.get('DATABASE', 'Name')
    DBUSER = config.get('DATABASE', 'User')
    DBPASSWORD = config.get('DATABASE', 'Password')
    DBHOST = config.get('DATABASE', 'Host')

    SUPERUSER_NAME = config.get('SUPERUSER', 'Name')
    SUPERUSER_PASS = config.get('SUPERUSER', 'Password')
    SUPERUSER_EMAIL = config.get('SUPERUSER', 'Email')

    PERMISSIONS_STAFF = config.get('PERMISSIONS', 'Staff')
    PERMISSIONS_APPROVE = config.get('PERMISSIONS', 'Approve')

    MAIL_SEND = config.getboolean('EMAIL', 'Send')
    SRCE_SMTP = config.get('EMAIL', 'SrceSmtp')
    ADMIN_MAIL = config.get('EMAIL', 'AdminMail')

except NoSectionError as e:
    print(e)
    raise SystemExit(1)

except ImproperlyConfigured as e:
    print(e)
    raise SystemExit(1)

# Quick-start development settings - unsuitable for production
# See https://docs.djangoproject.com/en/4.1/howto/deployment/checklist/


# SECURITY WARNING: don't run with debug turned on in production!
DEBUG = DEBUG_OPTION

if ',' in ALLOWED_HOSTS:
    ALLOWED_HOSTS = [h.strip() for h in ALLOWED_HOSTS.split(',')]
else:
    ALLOWED_HOSTS = [ALLOWED_HOSTS]

try:
    SECRET_KEY = open(SECRET_KEY_FILE, 'r').read()
except FileNotFoundError as e:
    print(SECRET_KEY_FILE + ': %s' % repr(e))
    raise SystemExit(1)

# SECURITY WARNING: keep the secret key used in production secret!
SECRET_KEY = SECRET_KEY_FILE

# Application definition

INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    'djangosaml2',
    'rest_framework',
    'rest_framework.authtoken',
    'rest_framework_api_key',
    'dj_rest_auth',
    'webpack_loader',
    'frontend',
    'backend',
]

MIDDLEWARE = [
    'django.middleware.security.SecurityMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
    'djangosaml2.middleware.SamlSessionMiddleware'
]


ROOT_URLCONF = 'hrzoosignup.urls'

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': ['{}/templates/'.format(BASE_DIR)],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.debug',
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]

WSGI_APPLICATION = 'hrzoosignup.wsgi.application'


# Database
# https://docs.djangoproject.com/en/4.1/ref/settings/#databases

DATABASES = {
    'default': {
        'NAME': DBNAME,
        'HOST': DBHOST,
        'ENGINE': 'django.db.backends.postgresql',
        'USER': DBUSER,
        'PASSWORD': DBPASSWORD,

    },

}


# Password validation
# https://docs.djangoproject.com/en/4.1/ref/settings/#auth-password-validators

AUTH_PASSWORD_VALIDATORS = [
    {
        'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator',
    },
]


# Internationalization
# https://docs.djangoproject.com/en/4.1/topics/i18n/

LANGUAGE_CODE = 'en-us'

TIME_ZONE = 'UTC'

USE_I18N = True

USE_TZ = True


# Static files (CSS, JavaScript, Images)
# https://docs.djangoproject.com/en/4.1/howto/static-files/

STATIC_URL = 'static/'

# Default primary key field type
# https://docs.djangoproject.com/en/4.1/ref/settings/#default-auto-field

DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'

# explicitly disabled
# -vrdel
SESSION_COOKIE_SECURE = False
CSRF_COOKIE_SECURE = False

# custom user model
# -vrdel
AUTH_USER_MODEL = 'backend.User'
#AUTHENTICATION_BACKENDS = ['django.contrib.auth.backends.ModelBackend',
#                           'backend.auth.saml2.backends.SAML2Backend']
AUTHENTICATION_BACKENDS = ['django.contrib.auth.backends.ModelBackend']
# load SAML settings
LOGIN_REDIRECT_URL = '{}/ui/proxy'.format(RELATIVE_PATH)
LOGOUT_REDIRECT_URL = '{}/ui/proxy'.format(RELATIVE_PATH)
# SAML_CONFIG_LOADER = 'backend.auth.saml2.config.get_saml_config'
SESSION_EXPIRE_AT_BROWSER_CLOSE = True
SESSION_COOKIE_SAMESITE = None

STATIC_URL = '{}/static/'.format(RELATIVE_PATH)
STATIC_ROOT = '{}/usr/share/hrzoosignup/static/'.format(VENV)
STATICFILES_DIRS = [os.path.join(BASE_DIR, 'frontend/bundles/')]

WEBPACK_LOADER = {
    'DEFAULT': {
        'CACHE': not DEBUG,
        'POLL_INTERVAL': 0.1,
        'BUNDLE_DIR_NAME': 'reactbundle/',
        'STATS_FILE': os.path.join(BASE_DIR, 'frontend/webpack-stats.json'),
    }
}
SECURE_SSL_REDIRECT = False
