#!/bin/bash

IMAGE="ipanema:5000/hrzoo-web"
VENV=/opt/hrzoosignup
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
-v $HOME:/mnt/ \
-v $HOME/.ssh:/home/user/.ssh/ \
-v $WORKDIR/hrzoosignup/frontend:/home/user/frontend \
-v $WORKDIR/docker/pysitepkg:/home/user/pysitepkg \
-v /tmp/.X11-unix:/tmp/.X11-unix \
-h docker-hrzooweb \
--net host \
--name hrzoo-web \
--rm -ti \
$IMG \
$SH
