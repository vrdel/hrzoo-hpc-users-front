container_name = hzsi-web

devel-django-server:
	docker exec -ti $(container_name) /home/user/run-django-server.sh

py-audit-view:
	docker exec -t $(container_name) ./safety.sh

js-audit-view:
	docker exec -t $(container_name) cd /home/user/frontend && npm audit

js-audit-fix:
	docker exec -t $(container_name) cd /home/user/frontend && npm audit fix
