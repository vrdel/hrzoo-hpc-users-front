#!/bin/bash

declare -a paths

paths=("$HOME/my_work/srce/git.hrzoo-hpc-users-front/hrzoo-hpc-users-front/docker/pysitepkg/sitepkg32" \
	"$HOME/my_work/srce/git.hrzoo-hpc-users-front/hrzoo-hpc-users-front/docker/pysitepkg/sitepkg64")

# additional manual append
paths[${#paths[@]}+1]="/home/dvrcic/my_work/srce/git.hrzoo-hpc-users-front/hrzoo-hpc-users-front/docker/pysitepkg/sitepkg64/hrzoosignup/"

for f in ${paths[@]}
do
	PYTHONPATH="$PYTHONPATH:$f"
done

export PYTHONPATH
