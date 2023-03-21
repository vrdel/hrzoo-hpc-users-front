container_name = hzsi-web

devel-django-server:
	docker exec -ti $(container_name) /home/user/run-django-server.sh

py-audit-view:
	docker exec -t $(container_name) ./safety.sh

vitedev:
	docker exec -t $(container_name) bash -c 'cd /home/user/frontend && npm run vitedev'

vitebuild:
	docker exec -t $(container_name) bash -c 'cd /home/user/frontend && npm run vitebuild'

js-audit-view:
	docker exec -t $(container_name) bash -c 'cd /home/user/frontend && npm audit'

js-audit-fix:
	docker exec -t $(container_name) bash -c 'cd /home/user/frontend && npm audit fix'

devel-webpack-server:
	docker exec -t $(container_name) bash -c 'cd /home/user/frontend && node_modules/.bin/webpack-dev-server --config webpack.devserver.config.js --progress'

devel-webpack-server-hmr:
	docker exec -t $(container_name) bash -c 'cd /home/user/frontend && node_modules/.bin/webpack-dev-server --config webpack.devserver.config.js --progress --hot'

npm:
	docker exec -t $(container_name) bash -c 'cd /home/user/frontend && npm $(ARGS)'
