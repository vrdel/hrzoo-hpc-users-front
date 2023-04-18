from distutils.sysconfig import get_python_lib
from configparser import ConfigParser

import saml2
from saml2.config import SPConfig

from django.conf import settings


def get_hostname(request):
    return request.get_host().split(':')[0]


def get_saml_config(request):
    hostname = get_hostname(request)

    config = {
        'xmlsec_binary': '/usr/bin/xmlsec1',
        'entityid': 'https://{}{}/saml2/metadata/'.format(hostname, settings.RELATIVE_PATH),
        'allow_unknown_attributes': True,
        'debug': 1,
        'service': {
            'sp': {
                'name': 'HRZOO Signup',
                'want_assertions_signed': False,
                'force_authn': False,
                'name_id_format_allow_create': False,
                'want_response_signed': False,
                'endpoints': {
                    'assertion_consumer_service': [
                        ('https://{}{}/saml2/acs/'.format(hostname, settings.RELATIVE_PATH),
                         saml2.BINDING_HTTP_POST),
                    ],
                    'single_logout_service': [
                        ('https://{}{}/saml2/ls/'.format(hostname, settings.RELATIVE_PATH),
                         saml2.BINDING_HTTP_REDIRECT),
                    ],
                },
                'attribute_map_dir': '{}/saml2/attributemaps/'.format(get_python_lib()),
            },
        },
        'key_file': settings.HOST_KEY,  # private part
        'cert_file': settings.HOST_CERT,  # public part
        'metadata': {
            'local': [settings.SAML_METADATA]
        }
    }

    return SPConfig().load(config)
