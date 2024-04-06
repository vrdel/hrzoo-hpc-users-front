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
import json
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
    REALM_MAP = config.get('GENERAL', 'RealmMap')
    INSTITUTION_MAP = config.get('GENERAL', 'InstitutionMap')
    PROJECT_IDENTIFIER_MAP = config.get('GENERAL', 'IdentifierMap')

    ALLOWED_HOSTS = config.get('SECURITY', 'AllowedHosts')
    HOST_CERT = config.get('SECURITY', 'HostCert')
    HOST_KEY = config.get('SECURITY', 'HostKey')
    SECRET_KEY_FILE = config.get('SECURITY', 'SecretKeyFile')
    CAFILE = config.get('SECURITY', 'CaFile')

    SAML_METADATA = config.get('SAML2', 'Metadata')
    SAML_METADATAEDUGAIN = config.get('SAML2', 'MetadataEduGain')
    SAML_EDUGAINALLOWAAIEDUHR = config.getboolean('SAML2', 'EduGainAllowAAIEduHR')
    SAML_EDUGAINIDPMATCH = config.get('SAML2', 'EduGainIdPMatch')

    CONNECTION_TIMEOUT = config.getint('CONNECTION', 'Timeout')
    CONNECTION_RETRY = config.getint('CONNECTION', 'Retry')
    CONNECTION_SLEEPRETRY = config.getint('CONNECTION', 'SleepRetry')

    DBNAME = config.get('DATABASE', 'Name')
    DBUSER = config.get('DATABASE', 'User')
    DBPASSWORD = config.get('DATABASE', 'Password')
    DBHOST = config.get('DATABASE', 'Host')

    MAILINGLIST_NAME = config.get('MAILINGLIST', 'Name')
    MAILINGLIST_CREDENTIALS = config.get('MAILINGLIST', 'Credentials')
    MAILINGLIST_SERVER = config.get('MAILINGLIST', 'Server')

    API_PERSONLEAD = config.get('CRORIS', 'API_PersonLead')
    API_PERSONPROJECT = config.get('CRORIS', 'API_PersonProject')
    API_PROJECT = config.get('CRORIS', 'API_Project')
    API_PERSON = config.get('CRORIS', 'API_Person')
    API_INSTITUTIONACTIVE = config.get('CRORIS', 'API_InstitutionActive')
    API_INSTITUTIONINACTIVE = config.get('CRORIS', 'API_InstitutionInactive')
    CRORIS_USER = config.get('CRORIS', 'Username')
    CRORIS_PASSWORD = config.get('CRORIS', 'Password')
    GRACE_DAYS = config.getint('CRORIS', 'Grace_Days', fallback=0)

    SUPERUSER_FIRSTNAME = config.get('SUPERUSER', 'FirstName')
    SUPERUSER_USERNAME = config.get('SUPERUSER', 'Username')
    SUPERUSER_LASTNAME = config.get('SUPERUSER', 'LastName')
    SUPERUSER_PASS = config.get('SUPERUSER', 'Password')
    SUPERUSER_EMAIL = config.get('SUPERUSER', 'Email')

    PERMISSIONS_STAFF = config.get('PERMISSIONS', 'Staff')

    EMAIL_SEND = config.getboolean('EMAIL', 'Send')
    EMAILFROM = config.get('EMAIL', 'From')
    EMAILUS = config.get('EMAIL', 'Us')
    EMAILSIGNATURE = config.get('EMAIL', 'Signature')
    EMAILHOST = config.get('EMAIL', 'Host')
    EMAILPORT = config.getint('EMAIL', 'Port')
    EMAILUSER = config.get('EMAIL', 'User')
    EMAILUPASSWORD = config.get('EMAIL', 'Password')
    EMAILTLS = config.getboolean('EMAIL', 'TLS')
    EMAILSSL = config.getboolean('EMAIL', 'SSL')
    EMAILTIMEOUT = config.getint('EMAIL', 'TIMEOUT')

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

# have PERMISSIONS_STAFF as array usernames
if ',' in PERMISSIONS_STAFF:
    PERMISSIONS_STAFF = [u.strip() for u in PERMISSIONS_STAFF.split(',')]
else:
    PERMISSIONS_STAFF = [PERMISSIONS_STAFF]

try:
    SECRET_KEY = open(SECRET_KEY_FILE, 'r').read()
except FileNotFoundError as e:
    print(SECRET_KEY_FILE + ': %s' % repr(e))
    raise SystemExit(1)

try:
    with open(REALM_MAP, mode='r', encoding='utf-8') as fp:
        MAP_REALMS = json.loads(fp.read())
except FileNotFoundError as e:
    print(REALM_MAP + ': %s' % repr(e))
    raise SystemExit(1)

try:
    with open(INSTITUTION_MAP, mode='r', encoding='utf-8') as fp:
        MAP_INSTITUTIONS = json.loads(fp.read())
except FileNotFoundError as e:
    print(INSTITUTION_MAP + ': %s' % repr(e))
    raise SystemExit(1)

try:
    with open(PROJECT_IDENTIFIER_MAP, mode='r', encoding='utf-8') as fp:
        PROJECT_IDENTIFIER_MAP = json.loads(fp.read())
        PROJECT_IDENTIFIER_MAP = [field for field in PROJECT_IDENTIFIER_MAP if field.get('field').startswith('project.')]
except FileNotFoundError as e:
    print(PROJECT_IDENTIFIER_MAP + ': %s' % repr(e))
    raise SystemExit(1)

try:
    EMAILSIGNATURE = open(EMAILSIGNATURE, 'r', encoding='utf-8').read()
except FileNotFoundError as e:
    print(EMAILSIGNATURE + ': %s' % repr(e))
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
    'django.contrib.sites',
    'djangosaml2',
    'invitations',
    'rest_framework',
    'rest_framework.authtoken',
    'rest_framework_api_key',
    'dj_rest_auth',
    'webpack_loader',
    'frontend',
    'backend',
]

SITE_ID = 1

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


INVITATIONS_INVITATION_MODEL = 'backend.CustomInvitation'
INVITATIONS_INVITATION_EXPIRY = 7
INVITATIONS_SIGNUP_REDIRECT = '/api/v1/internal/invites-userlink/'

DEFAULT_FROM_EMAIL = 'Napredno računanje <computing@srce.hr>'
INVITATIONS_EMAIL_SUBJECT_PREFIX = "[Napredno računanje] "
EMAIL_HOST = EMAILHOST
EMAIL_PORT = EMAILPORT
EMAIL_HOST_USER = EMAILUSER
EMAIL_HOST_PASSWORD = EMAILUPASSWORD
EMAIL_USE_TLS = EMAILTLS
EMAIL_USE_SSL = EMAILSSL
EMAIL_TIMEOUT = EMAILTIMEOUT


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

TIME_ZONE = 'Europe/Zagreb'

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
SAML_SESSION_COOKIE_NAME = 'saml_session'
SESSION_COOKIE_SAMESITE = False
CSRF_COOKIE_SAMESITE = False
CSRF_COOKIE_SECURE = False
CSRF_USE_SESSIONS = True

# custom user model
# -vrdel
AUTH_USER_MODEL = 'backend.User'
AUTHENTICATION_BACKENDS = ['django.contrib.auth.backends.ModelBackend',
                           'backend.auth.saml2.backends.SAML2Backend']
                           # 'djangosaml2.backends.Saml2Backend']
# AUTHENTICATION_BACKENDS = ['django.contrib.auth.backends.ModelBackend']
# load SAML settings
LOGIN_REDIRECT_URL = '{}/ui/saml2-login-redirect'.format(RELATIVE_PATH)
LOGOUT_REDIRECT_URL = '{}/ui/prijava'.format(RELATIVE_PATH)
SAML_CONFIG_LOADER = 'backend.auth.saml2.config_dev.get_saml_config'
SESSION_EXPIRE_AT_BROWSER_CLOSE = False
# SESSION_COOKIE_SAMESITE = None
LOGIN_URL = '/saml2/login/'
SAML_ATTRIBUTE_MAPPING = {
    'hrEduPersonUniqueID': ('username', 'person_uniqueid', ),
    'mail': ('person_mail', ),
    # 'o': ('person_institution', ),
    'hrEduPersonOIB': ('person_oib', ),
    'hrEduOrgOIB': ('person_institution_oib', ),
    'hrEduPersonHomeOrg': ('person_institution_realm', ),
    'ou': ('person_organisation', ),
    'hrEduPersonAffiliation': ('person_affiliation', ),
    'givenName': ('first_name', ),
    'sn': ('last_name', ),
}
SAML_CREATE_UNKNOWN_USER = True
#SAML_DJANGO_USER_MAIN_ATTRIBUTE = 'person_oib'

STATIC_URL = '{}/static/'.format(RELATIVE_PATH)
STATIC_ROOT = '{}/share/hrzoosignup/static/'.format(VENV)
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


REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': (
        'rest_framework.authentication.SessionAuthentication',
        'rest_framework.authentication.TokenAuthentication',
    ),
    'DEFAULT_PERMISSION_CLASSES': (
        'rest_framework.permissions.IsAuthenticated',
    ),
}


CACHES = {
    'default': {
        'BACKEND': 'django.core.cache.backends.memcached.PyMemcacheCache',
        'LOCATION': '127.0.0.1:11211',
        'OPTIONS': {
            'no_delay': True,
            'ignore_exc': True,
            'max_pool_size': 4,
            'use_pooling': True,
        }
    }
}

import os
import logging

LOGGING = {
    'version': 1,
    'disable_existing_loggers': False,
    'formatters': {
        'verbose': {
            'format': '{levelname} {asctime} {module} {message}',
            'style': '{',
        },
    },
    'handlers': {
        # 'file_debug': {
            # 'level': 'DEBUG',
            # 'class': 'logging.FileHandler',
            # 'filename':  '{}var/log/debug.log'.format(VENV),
            # 'formatter': 'verbose',
        # },
        'file_info': {
            'level': 'INFO',
            'class': 'logging.FileHandler',
            'filename': '{}var/log/info.log'.format(VENV),
            'formatter': 'verbose',
        },
        'file_error': {
            'level': 'ERROR',
            'class': 'logging.FileHandler',
            'filename': '{}var/log/error.log'.format(VENV),
            'formatter': 'verbose',
        },
        'file_views': {
            'level': 'DEBUG',
            'class': 'logging.FileHandler',
            'filename': '{}var/log/views.log'.format(VENV),
            'formatter': 'verbose',
        },
        'file_tasks': {
            'level': 'DEBUG',
            'class': 'logging.FileHandler',
            'filename': '{}var/log/tasks.log'.format(VENV),
            'formatter': 'verbose',
        },
    },
    'loggers': {
        # 'django': {
            # 'handlers': ['file_debug'],
            # 'level': 'DEBUG',
            # 'propagate': True,
        # },
        'django': {
            'handlers': ['file_error'],
            'level': 'ERROR',
            'propagate': True,
        },
        'hrzoosignup.views': {
            'handlers': ['file_views'],
            'level': 'DEBUG',
            'propagate': True,
        },
        'hrzoosignup.tasks': {
            'handlers': ['file_tasks'],
            'level': 'DEBUG',
            'propagate': True,
        },
    },
}
