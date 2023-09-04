#!/bin/bash

latest=$(ls -t1 bundles/reactbundle/main*.js | head -n1)

for f in bundles/reactbundle/main*.js;
do
	if [[ $f != $latest ]]
	then
		rm -f $f
	fi
done

latest=$(ls -t1 bundles/reactbundle/vendors*.js | head -n1)

for f in bundles/reactbundle/vendors*.js;
do
	if [[ $f != $latest ]]
	then
		rm -f $f
	fi
done

latest=$(ls -t1 bundles/reactbundle/runtime*.js | head -n1)

for f in bundles/reactbundle/runtime*.js;
do
	if [[ $f != $latest ]]
	then
		rm -f $f
	fi
done
