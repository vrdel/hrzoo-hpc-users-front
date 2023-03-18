container_name = hrzoo-web

py-audit-view:
	docker exec -t $(container_name) ./safety.sh

test-front:
	rm -rf coverage
	npm test

js-audit-view:
	npm audit

js-audit-fix:
	npm audit fix
