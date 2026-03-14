#!/bin/bash

SITEPACK=$(python3 -c "import sysconfig; print(sysconfig.get_paths()['purelib'])")

printf "**** sync sitepkg64\n"
rsync -avz --exclude='*node_modules*' $(echo $SITEPACK/ | sed "s/lib\//lib64\//" ) /home/user/pysitepkg/sitepkg64

# printf "**** sync sitepkg32\n"
# rsync -avz --exclude='*node_modules*' $SITEPACK/ /root/pysitepkg/sitepkg32
