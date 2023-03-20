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

# Config parse
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

# SECURITY WARNING: keep the secret key used in production secret!
SECRET_KEY = 'django-insecure-^%=4b@x)kd4mc=@de%8gyzabe_-z915iof%am@@p4ad6&i$ggg'

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

# Application definition

INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
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
]

ROOT_URLCONF = 'hrzoosignup.urls'

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [],
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

# explicitly enabled
# -vrdel
SESSION_COOKIE_SECURE = True
