# Universal Next.js Deployment System Makefile

# Variables
APP_NAME := universal-deploy
VERSION := 1.2.0
NODE_VERSION := 18

# Default target
.PHONY: help
help: ## Show this help
	@awk 'BEGIN {FS = ":.*?## "} /^[a-zA-Z_-]+:.*?## / {printf "\033[36m%-30s\033[0m %s\n", $$1, $$2}' $(MAKEFILE_LIST)

# Development targets
.PHONY: install
install: ## Install dependencies
	npm install

.PHONY: test
test: ## Run tests
	node -c cli.js
	node -c deploy.js
	node cli.js help

.PHONY: test-all
test-all: ## Run all tests including example configurations
	node -c cli.js
	node -c deploy.js
	node cli.js help
	node cli.js generate example.config.json --dry-run
	node cli.js generate mysql-example.config.json --dry-run
	node cli.js generate postgresql-example.config.json --dry-run

# Docker targets
.PHONY: docker-build
docker-build: ## Build Docker image
	docker build -t $(APP_NAME):$(VERSION) .
	docker build -t $(APP_NAME):latest .

.PHONY: docker-run
docker-run: ## Run Docker container
	docker run --rm -it $(APP_NAME):latest

.PHONY: docker-compose-up
docker-compose-up: ## Start all services with docker-compose
	docker-compose up -d

.PHONY: docker-compose-down
docker-compose-down: ## Stop all services with docker-compose
	docker-compose down

# CI/CD targets
.PHONY: ci-test
ci-test: ## Run CI tests
	npm install
	node -c cli.js
	node -c deploy.js
	node cli.js help

.PHONY: ci-build
ci-build: ## Run CI build
	npm install
	node cli.js init test-app
	node cli.js generate test-app.config.json --dry-run

.PHONY: ci-deploy-staging
ci-deploy-staging: ## Run CI staging deployment
	npm install
	echo '{"app_name": "staging-app","port": 3001,"deploy_path": "/var/www/staging-app","database": {"type": "sqlite","path": "/var/lib/staging-app/database.db"},"nginx": {"enabled": true,"domain": "staging.example.com"}}' > staging.config.json
	node cli.js generate staging.config.json --dry-run

.PHONY: ci-deploy-production
ci-deploy-production: ## Run CI production deployment
	npm install
	echo '{"app_name": "production-app","port": 3000,"instances": 2,"max_memory": "2G","deploy_path": "/var/www/production-app","database": {"type": "postgresql","host": "localhost","port": 5432,"name": "production_db","username": "prod_user","password": "${DB_PASSWORD}"},"nginx": {"enabled": true,"domain": "production.example.com","ssl_enabled": true},"ssl": {"enabled": true,"cert_path": "/etc/ssl/certs/production-app.crt","key_path": "/etc/ssl/private/production-app.key"}}' > production.config.json
	node cli.js generate production.config.json --dry-run

# Utility targets
.PHONY: clean
clean: ## Clean generated files
	rm -rf generated/*
	rm -f *.config.json
	rm -f deployment-package
	rm -f *.tar.gz

.PHONY: lint
lint: ## Run code linting
	@echo "No linting configured"

.PHONY: fmt
fmt: ## Format code
	@echo "No formatting configured"

# Release targets
.PHONY: release-major
release-major: ## Bump major version
	@echo "Bumping major version"
	# Implementation would go here

.PHONY: release-minor
release-minor: ## Bump minor version
	@echo "Bumping minor version"
	# Implementation would go here

.PHONY: release-patch
release-patch: ## Bump patch version
	@echo "Bumping patch version"
	# Implementation would go here