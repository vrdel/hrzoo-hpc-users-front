#!/bin/bash

IMAGE="ipanema:5000/hrzoo-web"
VENV=/opt/hrzoo-signup
WORKDIR=$HOME/my_work/srce/git.hrzoo-hpc-users-front/hrzoo-hpc-users-front/
SHELL="/bin/zsh"

test -z $1 && IMG="$IMAGE" || IMG="$1"
test -z $2 && SH="$SHELL" || SH="$2"

docker run \
-e "DISPLAY=unix$DISPLAY" \
--log-driver json-file \
--log-opt max-size=10m \
-v /dev/log:/dev/log \
-v /etc/localtime:/etc/localtime \
-v /tmp/.X11-unix:/tmp/.X11-unix \
-v $HOME:/mnt/ \
-v $HOME/.ssh:/home/user/.ssh/ \
-v $WORKDIR/bin/hzsi-db:$VENV/bin/hzsi-db \
-v $WORKDIR/bin/hzsi-genseckey:$VENV/bin/hzsi-genseckey \
-v $WORKDIR/bin/hzsi-manage:$VENV/bin/hzsi-manage \
-v $WORKDIR/docker/pysitepkg:/home/user/pysitepkg \
-v $WORKDIR/docker/run-django-server.sh:/home/user/run-django-server.sh \
-v $WORKDIR/docker/syncsite.sh:/home/user/syncsite.sh \
-v $WORKDIR/etc/:$VENV/etc/hrzoosignup/ \
-v $WORKDIR/hrzoosignup/frontend:/home/user/frontend \
-v $WORKDIR/hrzoosignup/static:$VENV/share/hrzoosignup/static \
-v $WORKDIR/hrzoosignup:$VENV/lib64/python3.9/site-packages/hrzoosignup \
-h docker-hrzooweb \
--net host \
--name hrzoo-web \
--rm -ti \
$IMG \
$SH
