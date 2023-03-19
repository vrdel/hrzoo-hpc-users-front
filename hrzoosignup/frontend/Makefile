container_name = hrzoo-web

py-audit-view:
	docker exec -t $(container_name) ./safety.sh

js-audit-view:
	docker exec -t $(container_name) cd /home/user/frontend && npm audit

js-audit-fix:
	docker exec -t $(container_name) cd /home/user/frontend && npm audit fix
