DOCKERX=yes
VERSION := $(shell cat package.json | grep version | head -1 | grep -Po '([0-9]+\.[0-9]+\.[0-9]+)')

.EXPORT_ALL_VARIABLES:
#NODE_OPTIONS=--max_old_space_size=256
REACT_APP_KEYCLOAK_REALM=master
REACT_APP_KEYCLOAK_URL=https://sso.medinvention.dev/auth
REACT_APP_KEYCLOAK_APP=marker-ui
REACT_APP_API_URL_BASE=https://marker-server.medinvention.dev
PATH=$(shell printenv PATH):$(shell printenv NODEJS_HOME)/bin

all: mostlyclean clean build-ui build-server

build-ui: clean	
	@echo MARKER BUILDED APP VERSION IS $(VERSION)
	npm install	
	npm run-script build
ifeq ($(DOCKERX),yes)
	docker buildx build -f ./docker/Dockerfile.ui --push --platform linux/arm64/v8,linux/amd64,linux/arm/v7 --tag medinvention/marker-ui:latest .
	docker buildx build -f ./docker/Dockerfile.ui --push --platform linux/arm64/v8,linux/amd64,linux/arm/v7 --tag medinvention/marker-ui:$(VERSION) .
else
	docker build -f ./docker/Dockerfile.ui -t medinvention/marker-ui:latest .
	docker build -f ./docker/Dockerfile.ui -t medinvention/marker-ui:$(VERSION) .
	docker push medinvention/marker-ui:latest
	docker push medinvention/marker-ui:$(VERSION)
endif

build-server: clean
ifeq ($(DOCKERX),yes)		
	docker buildx build -f ./docker/Dockerfile.server --push --platform linux/arm64/v8,linux/amd64,linux/arm/v7 --tag medinvention/marker-server:latest .
	docker buildx build -f ./docker/Dockerfile.server --push --platform linux/arm64/v8,linux/amd64,linux/arm/v7 --tag medinvention/marker-server:$(VERSION) .
else
	docker build -f ./docker/Dockerfile.server -t medinvention/marker-server:latest .
	docker build -f ./docker/Dockerfile.server -t medinvention/marker-server:$(VERSION) .
	docker push medinvention/marker-server:latest
	docker push medinvention/marker-server:$(VERSION)
endif
	
clean:
	rm -rf build

mostlyclean:
	rm -rf node_modules

.PHONY: build-ui build-server

