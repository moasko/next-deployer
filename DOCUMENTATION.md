# Universal Next.js Deployment System - Complete Documentation

## Table of Contents
1. [Overview](#overview)
2. [Features](#features)
3. [System Requirements](#system-requirements)
4. [Installation](#installation)
5. [Configuration](#configuration)
   - [Basic Configuration](#basic-configuration)
   - [Database Configuration](#database-configuration)
   - [SSL Configuration](#ssl-configuration)
   - [Nginx Configuration](#nginx-configuration)
   - [Health Check Configuration](#health-check-configuration)
   - [Backup Configuration](#backup-configuration)
6. [Usage](#usage)
   - [CLI Commands](#cli-commands)
   - [Deployment Process](#deployment-process)
7. [Advanced Features](#advanced-features)
   - [Environment Variables](#environment-variables)
   - [Custom Build Commands](#custom-build-commands)
   - [Dry Run Mode](#dry-run-mode)
8. [Database Support](#database-support)
   - [SQLite](#sqlite)
   - [MySQL](#mysql)
   - [PostgreSQL](#postgresql)
9. [CI/CD Integration](#ci-cd-integration)
   - [GitHub Actions](#github-actions)
   - [Docker Support](#docker-support)
   - [CI/CD CLI Commands](#ci-cd-cli-commands)
   - [Configuration Validation](#configuration-validation)
10. [Deployment Scenario](#deployment-scenario)
11. [Security Considerations](#security-considerations)
12. [Troubleshooting](#troubleshooting)
13. [Examples](#examples)

## Overview

The Universal Next.js Deployment System is a comprehensive solution for deploying Next.js applications to a VPS with minimal configuration. It automates the entire deployment process, including installing necessary tools, configuring databases, setting up reverse proxies, and managing environment variables.

## Features

- **Automatic Tool Installation**: Installs Node.js, PM2, Nginx, and database clients
- **Multi-Database Support**: SQLite, MySQL, PostgreSQL
- **Environment Management**: Automatic .env file generation
- **Nginx Configuration**: Automatic reverse proxy setup
- **SSL Support**: HTTPS configuration
- **Health Checks**: Automated monitoring with auto-recovery
- **Automated Backups**: Scheduled backup system with retention policy
- **Cross-Platform Support**: Works on Debian/Ubuntu, CentOS/RHEL/Fedora, and Arch Linux
- **Dry Run Mode**: Test deployments without making changes
- **Customizable**: Flexible configuration for different deployment scenarios
- **CI/CD Ready**: Full support for continuous integration and deployment pipelines
- **Containerization**: Docker support for containerized deployments

## System Requirements

- A fresh VPS or server with one of the following operating systems:
  - Debian 9+
  - Ubuntu 18.04+
  - CentOS 7+
  - RHEL 7+
  - Fedora 28+
  - Arch Linux
- Root or sudo access
- Internet connectivity for package installation

## Installation

1. Clone or copy the universal-deploy directory to your project:
   ```bash
   git clone https://github.com/your-repo/universal-nextjs-deploy.git
   ```

2. Navigate to the deployment directory:
   ```bash
   cd universal-deploy
   ```

3. Install Node.js dependencies (if not already installed):
   ```bash
   npm install
   ```

## Configuration

### Basic Configuration

The deployment system uses a JSON configuration file. You can create one using:

```bash
node cli.js init my-app
```

This creates a `my-app.config.json` file with the following structure:

```json
{
  "app_name": "my-app",
  "port": 3000,
  "instances": 2,
  "max_memory": "2G",
  "deploy_path": "/var/www/my-app",
  "database": {
    "type": "sqlite",
    "path": "/var/lib/my-app/database.db",
    "host": "localhost",
    "port": 3306,
    "name": "my_app",
    "username": "",
    "password": ""
  },
  "env_file": ".env.production",
  "build_command": "npm run build",
  "start_command": "npm start",
  "node_version": "18",
  "ssl": {
    "enabled": false,
    "cert_path": "/etc/ssl/certs/myapp.crt",
    "key_path": "/etc/ssl/private/myapp.key"
  },
  "nginx": {
    "enabled": true,
    "domain": "my-app.example.com",
    "ssl_enabled": false,
    "proxy_pass": "http://localhost"
  },
  "health_check": {
    "enabled": true,
    "path": "/api/health",
    "interval": 5
  },
  "backup": {
    "enabled": true,
    "path": "/backup/my-app",
    "schedule": "0 2 * * *"
  }
}
```

### Database Configuration

#### SQLite (Default)
```json
"database": {
  "type": "sqlite",
  "path": "/var/lib/my-app/database.db",
  "host": "localhost",
  "port": 3306,
  "name": "my_app",
  "username": "",
  "password": ""
}
```

#### MySQL
```json
"database": {
  "type": "mysql",
  "path": "/var/lib/my-app/database.db",
  "host": "localhost",
  "port": 3306,
  "name": "my_app_db",
  "username": "db_user",
  "password": "secure_password"
}
```

#### PostgreSQL
```json
"database": {
  "type": "postgresql",
  "path": "/var/lib/my-app/database.db",
  "host": "localhost",
  "port": 5432,
  "name": "my_app_db",
  "username": "db_user",
  "password": "secure_password"
}
```

### SSL Configuration

To enable SSL, set the following in your configuration:

```json
"ssl": {
  "enabled": true,
  "cert_path": "/etc/ssl/certs/my-app.crt",
  "key_path": "/etc/ssl/private/my-app.key"
},
"nginx": {
  "enabled": true,
  "domain": "my-app.example.com",
  "ssl_enabled": true,
  "proxy_pass": "http://localhost"
}
```

### Nginx Configuration

Nginx is enabled by default. To disable it:

```json
"nginx": {
  "enabled": false,
  "domain": "my-app.example.com",
  "ssl_enabled": false,
  "proxy_pass": "http://localhost"
}
```

### Health Check Configuration

Health checks are enabled by default and run every 5 minutes. To customize:

```json
"health_check": {
  "enabled": true,
  "path": "/api/health",
  "interval": 10  // minutes
}
```

### Backup Configuration

Backups are enabled by default and run daily at 2 AM. To customize:

```json
"backup": {
  "enabled": true,
  "path": "/backup/my-app",
  "schedule": "0 3 * * *"  // cron format: every day at 3 AM
}
```

## Usage

### CLI Commands

1. **Initialize Configuration**
   ```bash
   node cli.js init [app-name]
   ```

2. **Interactive Setup**
   ```bash
   node cli.js setup
   ```

3. **Generate Deployment Files**
   ```bash
   node cli.js generate [config-file]
   ```

4. **Deploy Application**
   ```bash
   node cli.js deploy [config-file]
   ```

5. **Show CI/CD Status**
   ```bash
   node cli.js ci-status
   ```

6. **Validate Configuration for CI/CD**
   ```bash
   node cli.js ci-validate [config-file]
   ```

7. **Show Help**
   ```bash
   node cli.js help
   ```

### Deployment Process

1. **Generate Deployment Files**
   ```bash
   node cli.js generate my-app.config.json
   ```

2. **Navigate to Generated Directory**
   ```bash
   cd generated
   ```

3. **Run Deployment Script**
   ```bash
   ./deploy.sh
   ```

## Advanced Features

### Environment Variables

The deployment system automatically generates a `.env` file with the following variables:

```
DATABASE_URL=postgresql://db_user:secure_password@localhost:5432/my_app_db
AUTH_SECRET=auto_generated_secret
NEXT_PUBLIC_BASE_URL=http://my-app.example.com:3000
NODE_ENV=production
PORT=3000
APP_NAME=my-app
DB_TYPE=postgresql
DB_HOST=localhost
DB_PORT=5432
DB_NAME=my_app_db
DB_USERNAME=db_user
DB_PASSWORD=secure_password
```

### Custom Build Commands

You can customize the build and start commands in your configuration:

```json
"build_command": "yarn build",
"start_command": "yarn start"
```

### Dry Run Mode

Test your deployment without making any changes:

```bash
node cli.js generate my-app.config.json --dry-run
./deploy.sh --dry-run
```

## Database Support

### SQLite

SQLite is the default database option. The deployment system will:
- Create the database directory with proper permissions
- Generate the appropriate DATABASE_URL
- Set up automated backups

### MySQL

For MySQL databases, the deployment system will:
- Install MySQL client tools
- Create the database and user
- Grant appropriate privileges
- Set up automated backups using mysqldump

### PostgreSQL

For PostgreSQL databases, the deployment system will:
- Install PostgreSQL client tools
- Create the database and user
- Grant appropriate privileges
- Set up automated backups using pg_dump

## CI/CD Integration

### GitHub Actions

The repository includes a comprehensive GitHub Actions workflow that automates the deployment process:

1. **Testing**: Runs tests across multiple Node.js versions
2. **Building**: Generates deployment packages
3. **Staging Deployment**: Deploys to staging environment
4. **Production Deployment**: Deploys to production environment on release
5. **Artifact Packaging**: Packages deployment files for distribution

### Docker Support

The system includes Docker support for containerized deployments:

1. **Dockerfile**: For building container images
2. **docker-compose.yml**: For local development and testing with database services
3. **Multi-service Testing**: Includes PostgreSQL and MySQL services for integration testing

### CI/CD CLI Commands

The CLI includes special commands for CI/CD environments:

1. **ci-status**: Shows CI environment information
   ```bash
   node cli.js ci-status
   ```

2. **ci-validate**: Validates configurations for CI/CD pipelines
   ```bash
   node cli.js ci-validate my-app.config.json
   ```

### Configuration Validation

The CI/CD validation system checks:

1. **Required Fields**: Ensures all required configuration fields are present
2. **Database Configuration**: Validates database connection settings
3. **Security Practices**: Warns about sensitive data handling
4. **Environment Variables**: Checks for proper use of environment variables

## Deployment Scenario

For a complete example of deploying an existing Next.js project, see [SCENARIO.md](SCENARIO.md) which demonstrates:
- Deploying a real-world e-commerce application
- Configuring PostgreSQL database
- Setting up SSL/HTTPS
- Implementing health checks and backups
- Post-deployment maintenance operations
- Troubleshooting common issues

## Security Considerations

1. **Authentication Secrets**: The system generates secure random secrets for AUTH_SECRET
2. **File Permissions**: Proper permissions are set for sensitive directories
3. **Database Security**: Database users are created with minimal required privileges
4. **SSL Support**: HTTPS can be enabled for secure connections
5. **Firewall**: Consider configuring a firewall to restrict access to necessary ports only

## Troubleshooting

### Common Issues

1. **Permission Denied Errors**
   - Ensure you're not running as root
   - Check that your user has sudo privileges

2. **Database Connection Failures**
   - Verify database credentials in configuration
   - Ensure database server is running
   - Check firewall settings

3. **Nginx Configuration Issues**
   - Verify domain DNS settings
   - Check SSL certificate paths
   - Ensure Nginx is installed

### Logs

- Application logs: `pm2 logs [app-name]`
- Deployment logs: Check terminal output during deployment
- System logs: `/var/log/` directory

## Examples

### Example 1: Basic SQLite Deployment

```json
{
  "app_name": "blog-app",
  "port": 3000,
  "instances": 2,
  "max_memory": "1G",
  "deploy_path": "/var/www/blog-app",
  "database": {
    "type": "sqlite",
    "path": "/var/lib/blog-app/blog.db"
  },
  "nginx": {
    "enabled": true,
    "domain": "blog.example.com"
  }
}
```

### Example 2: PostgreSQL Deployment with SSL

```json
{
  "app_name": "ecommerce-app",
  "port": 3000,
  "instances": 4,
  "max_memory": "2G",
  "deploy_path": "/var/www/ecommerce-app",
  "database": {
    "type": "postgresql",
    "host": "localhost",
    "port": 5432,
    "name": "ecommerce_db",
    "username": "ecommerce_user",
    "password": "secure_password"
  },
  "ssl": {
    "enabled": true,
    "cert_path": "/etc/ssl/certs/ecommerce-app.crt",
    "key_path": "/etc/ssl/private/ecommerce-app.key"
  },
  "nginx": {
    "enabled": true,
    "domain": "shop.example.com",
    "ssl_enabled": true
  },
  "backup": {
    "enabled": true,
    "path": "/backup/ecommerce-app",
    "schedule": "0 1 * * *"  // Daily at 1 AM
  }
}
```

### Example 3: MySQL Deployment with Custom Commands

```json
{
  "app_name": "api-server",
  "port": 4000,
  "instances": 3,
  "max_memory": "1.5G",
  "deploy_path": "/var/www/api-server",
  "database": {
    "type": "mysql",
    "host": "db.example.com",
    "port": 3306,
    "name": "api_db",
    "username": "api_user",
    "password": "secure_password"
  },
  "build_command": "yarn build",
  "start_command": "yarn start",
  "nginx": {
    "enabled": true,
    "domain": "api.example.com"
  },
  "health_check": {
    "enabled": true,
    "path": "/health",
    "interval": 2
  }
}
```

### Example 4: CI/CD Configuration

```json
{
  "app_name": "ci-cd-deployer",
  "port": 3000,
  "instances": 1,
  "max_memory": "1G",
  "deploy_path": "/var/www/ci-cd-deployer",
  "database": {
    "type": "sqlite",
    "path": "/var/lib/ci-cd-deployer/database.db"
  },
  "env_file": ".env.ci",
  "build_command": "npm run build",
  "start_command": "npm start",
  "node_version": "18",
  "ssl": {
    "enabled": false,
    "cert_path": "",
    "key_path": ""
  },
  "nginx": {
    "enabled": true,
    "domain": "deployer.ci-cd.local",
    "ssl_enabled": false,
    "proxy_pass": "http://localhost"
  },
  "health_check": {
    "enabled": true,
    "path": "/api/health",
    "interval": 5
  },
  "backup": {
    "enabled": false,
    "path": "",
    "schedule": ""
  }
}
```

This documentation provides a comprehensive guide to using the Universal Next.js Deployment System. For additional help, refer to the example configuration files included in the project or run `node cli.js help` for CLI usage information.