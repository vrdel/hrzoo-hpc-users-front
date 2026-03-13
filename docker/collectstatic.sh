#!/bin/bash

. /opt/hrzoo-signup/bin/activate
rm -rf $VIRTUAL_ENV/share/hrzoosignup/static/reactbundle/* ; \
python $VIRTUAL_ENV/lib/python3.12/site-packages/hrzoosignup/manage.py collectstatic --noinput ; \
rm -rf $VIRTUAL_ENV/share/hrzoosignup/static/admin
