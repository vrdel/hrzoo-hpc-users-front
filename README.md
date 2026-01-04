# hrzoo-hpc-users-front

## Development

### Container environment

Development environment is based on Docker containers and building procedure and helper scripts are provided in `docker/` folder. Environment is implemented as multi-container Docker application that is bootstrapped with `docker compose` utility. Application is built from two containers:
* `web-hzsi` - container based on Rocky Linux 8 that will have preinstalled supervisord, Node.js 18, Python 3.9 and virtual environment
* `db-hzsi` - PostgreSQL 15 container pulled from Docker hub `postgres:15`

`web-hzsi` needs to be manually built so once code from Github repository is cloned, one should be pointed to `docker/` folder, edit the `compose.env` to tweak the settings (mainly IMAGE and PSQLDATA) and run:
```
docker build . -t <registry>/hrzoo-web
```
Name of the image specified on `docker build` should be the same as one defined in `IMAGE` environment variable as it will be passed to `docker compose` bootstrap context.

Afterward, it's ready to bootstrap Docker application multi-container:
```
docker/$ docker compose up
```

#### Application dependencies installation

Application dependencies are not installed during bootstrap of development container enviroment and need to be installed separately, both backend Python/Django and frontend ReactJS dependencies.

Dependencies of backend Python code is handled with `poetry`. Application code is mapped from host into created virtual environment emulating its installation in virtual environment, but for successfull application run, all of its dependencies need to be part of virtual environment as well. For the backend Python code, that can be done with:
```
docker exec -t -u user -i hzsi-web /bin/zsh
cd ~/hrzoosignup-source
sudo sh -c '. /opt/hrzoo-signup/bin/activate; /usr/local/bin/poetry sync --no-root --with devel'
sudo mkdir -p /opt/hrzoo-signup/var/log
```
So commands are run in the context of container. `Makefile` targets will be introduced shortly after to simplify this step.

Save the changes of virtual enviroment in container:
```
docker commit hzsi-web <registry>/hrzoo-web
```

Dependencies of frontend ReactJS code are as well and they can be installed from host source tree:

```
cd hrzoo-hpc-front/hrzoosignup/frontend
make npm ARGS="install"
```
`npm install` is called in the `web-hzsi` container context using Node.js installation there. Generated `node_modules/` is stored and mapped from host so `docker commit` is not needed here.

### Django development server and webpack-dev-server

During the development of the application, backend code is run on Django's development server (`runserver`) and frontend is served via `webpack-dev-server`. Both have hot module reload (HMR) functionality enabled ensuring that code is recompiled and transpiled as changes have been made to it so developer always sees the latest changes in browser.

Both can be easily started with provided `Makefile` targets:
```
cd hrzoo-hpc-front/hrzoosignup/frontend
make devel-django-server
make devel-webpack-server-hmr
```

Development web application is now served at: http://localhost:8001
