#!/bin/bash

if [ "$1" == "devel" ]
then
	rm -rf frontend/bundles/reactbundle/* ; \
		node_modules/.bin/webpack --config webpack.config.js --progress --mode development
elif [ "$1" == "prod" ]
then
	rm -rf frontend/bundles/reactbundle/* ; \
		node_modules/.bin/webpack --config webpack.config.js --progress --mode production
fi
