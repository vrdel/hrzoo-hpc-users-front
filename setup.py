from setuptools import setup, find_packages
import os
import glob
import sys

NAME = 'hrzoosignup'


def get_files(install_prefix, directory):
    files = []
    for root, _, filenames in os.walk(directory):
        subdir_files = []
        for filename in filenames:
            subdir_files.append(os.path.join(root, filename))
        if filenames and subdir_files:
            files.append((os.path.join(install_prefix, root), subdir_files))
    return files


setup(name=NAME,
      version='0.1.0',
      description='HRZOO Signup - web application for registration of users on Computing service of SRCE',
      author='SRCE',
      author_email='dvrcic@srce.hr',
      license='Apache License 2.0',
      long_description=open('README.md').read(),
      long_description_content_type='text/markdown',
      url='https://github.com/vrdel/hrzoo-hpc-users-front',
      classifiers=(
          "Programming Language :: Python :: 3",
          "License :: OSI Approved :: Apache Software License",
          "Operating System :: POSIX :: Linux",
      ),
      install_requires=[
        'aiohttp',
        'Django==4.*',
        'dj-rest-auth==5.*',
        'django-invitations',
        'django-webpack-loader',
        'djangorestframework',
        'djangorestframework-api-key',
        'djangosaml2',
        'psycopg2-binary',
        'pymemcache',
        'unidecode',
        'pandas==2.2.2'
      ],
      scripts=['bin/hzsi-db', 'bin/hzsi-genseckey', 'bin/hzsi-manage'],
      data_files=[
          ('bin/', glob.glob('bin/*')),
          ('etc/httpd/conf.d/', ['apache/vhost-hrzoosignup.conf']),
          ('etc/hrzoosignup', ['etc/email_invite_message.txt',
                               'etc/email_invite_subject.txt',
                               'etc/email_invite_en_message.txt',
                               'etc/email_invite_en_subject.txt',
                               'etc/hzsi.conf.template', 'etc/signature',
                               'etc/signature_en',
                               'etc/institution_map.json',
                               'etc/edugain_user_map.json.template',
                               'etc/replacestring_map.json',
                               'helpers/deploy-config.sh',
                               'etc/realm_map.json']),
          ('etc/cron.d/', ['cron/hzsi-clearsessions',
                           'cron/hzsi-clearexpiredinvitations',
                           'cron/hzsi-resetprojectcounter',
                           'cron/hzsi-mailinglist-subscribe',
                           'cron/hzsi-flaginactiveusers']),
          ('var/log/hrzoosignup', ['helpers/empty']),
          ('var/lib/hrzoosignup', ['helpers/empty']),
          ('', ['requirements.txt']),
      ] + get_files('share/', 'hrzoosignup/static/'),
      include_package_data=True,
      packages=find_packages(),
      package_data={
          'hrzoosignup': ['templates/*'] + ['backend/fixtures/*'] + ['frontend/*.json'],
      },
      package_dir={'hrzoosignup': 'hrzoosignup/'}
)
