container_name = hzsi-web

place-new-bundle:
	./keep-latest-bundle.sh
	docker exec -u user -t $(container_name) /home/user/collectstatic.sh

devel-django-server:
	docker exec -u user -ti $(container_name) /home/user/run-django-server.sh

devel-bundle:
	rm -rf bundles/reactbundle/* ; \
	docker exec -u user -t $(container_name) bash -c 'cd /home/user/frontend; node_modules/.bin/webpack --config webpack.config.js --progress --mode development'

prod-bundle:
	rm -rf bundles/reactbundle/* ; \
	docker exec -u user -t $(container_name) bash -c 'cd /home/user/frontend; node_modules/.bin/webpack --config webpack.config.js --progress --mode production'

devel-wheel:
	docker exec -u user -t $(container_name) bash -c 'source /opt/hrzoo-signup/bin/activate && cd /home/user/hrzoosignup-source && make clean && make wheel-devel'

prod-wheel:
	docker exec -u user -t $(container_name) bash -c 'source /opt/hrzoo-signup/bin/activate && cd /home/user/hrzoosignup-source && make clean && make wheel-prod'

py-audit-view:
	docker exec -u user -t $(container_name) /home/user/safety.sh

vitedev:
	docker exec -u user -t $(container_name) bash -c 'cd /home/user/frontend && npm run vitedev'

vitebuild:
	docker exec -u user -t $(container_name) bash -c 'cd /home/user/frontend && npm run vitebuild'

js-audit-view:
	docker exec -u user -t $(container_name) bash -c 'cd /home/user/frontend && npm audit'

js-audit-fix:
	docker exec -u user -t $(container_name) bash -c 'cd /home/user/frontend && npm audit fix'

devel-webpack-server:
	docker exec -u user -t $(container_name) /home/user/run-frontdev-server.sh

devel-webpack-server-hmr:
	docker exec -u user -t $(container_name) bash -c '/home/user/run-frontdev-server.sh --hot'

npm:
	docker exec -t $(container_name) bash -c 'cd /home/user/frontend && npm $(ARGS)'

formatjs-extract:
	docker exec -t $(container_name) bash -c "cd /home/user/frontend/ && npm run extract -- 'src/**/*.jsx' --out-file src/lang/hr.json --id-interpolation-pattern '[sha512:contenthash:base64:6]'"

formatjs-compile:
	docker exec -t $(container_name) bash -c "cd /home/user/frontend/ && npm run compile -- src/lang/hr.json --out-file src/compiled-lang/hr.json"

formatjs-compile-en:
	docker exec -t $(container_name) bash -c "cd /home/user/frontend/ && npm run compile -- src/lang/en.json --out-file src/compiled-lang/en.json"

