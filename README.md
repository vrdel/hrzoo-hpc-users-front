# hrzoo-hpc-users-front

## Development

### Container environment

Development environment is based on Docker containers and building procedure and helper scripts are provided in `docker/` folder. Environment is implemented as multi-container Docker application that is bootstrapped with `docker compose` utility. Application is built from two containers:
* `web-hzsi` - container based on Rockylinux 8 Linux that will have preinstalled supervisord, Node.js 18, Python 3.9 and virtual environment with the latest application code installed from this Github repository
* `db-hzsi` - PostgreSQL 15 container pulled from Docker hub `postgres:15`

`web-hzsi` needs to be manually built so once code from Github repository is cloned, one should be pointed to `docker/` folder, edit the `compose.env` to tweak the settings (mainly IMAGE and PSQLDATA) and run:
```
docker build . -t <registry>/hrzoo-web
```
Name of the image specified on `docker build` should be the same as one defined in `IMAGE` environment variable as it will be passed to `docker compose` bootstrap context.

Backend Django code and relevant Python modules of the application will be installed in `docker build` step. Frontend ReactJS code is also pulled, however to build a Webpack bundled code, all React/Javascript dependency packages are needed - popular `node_modules` directory. Node.js is installed in container image as relying on host installation was not an option. Therefore Docker application should be started at this point to continue with the frontend code building.

Docker application multi-container bootstrap:
```
docker/$ docker compose up
```

Now `node_modules` directory can be easily recreated from `hrzoosignup/frontend` folder:
```
hrzoosignup/frontend/$ make npm ARGS="install"
```
