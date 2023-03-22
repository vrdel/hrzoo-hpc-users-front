#!/bin/bash

RUNASROOT="su -m -s /bin/bash root -c"
PIDS=$(pgrep -f runserver | tr '\n' ' ')
$RUNASROOT "kill -9 $PIDS 2>/dev/null"

$RUNASROOT ". /opt/hrzoo-signup/bin/activate && hzsi-manage runserver --settings=hrzoosignup.settings-devserver 0.0.0.0:8001"
