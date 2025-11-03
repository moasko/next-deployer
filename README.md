# Universal Next.js Deployment System

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js](https://img.shields.io/badge/node->=14.0.0-blue.svg)](https://nodejs.org/)

A comprehensive deployment solution for Next.js applications that automatically configures your VPS with all necessary tools and services.

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

## Prerequisites

- A fresh VPS or server with one of the following operating systems:
  - Debian 9+
  - Ubuntu 18.04+
  - CentOS 7+
  - RHEL 7+
  - Fedora 28+
  - Arch Linux
- Root or sudo access
- Internet connectivity for package installation

## Quick Start

1. Clone the repository:
   ```bash
   git clone https://github.com/your-username/universal-nextjs-deploy.git
   cd universal-nextjs-deploy
   ```

2. Initialize your deployment configuration:
   ```bash
   node cli.js init my-app
   ```

3. Customize the generated `my-app.config.json` file with your settings

4. Generate deployment files:
   ```bash
   node cli.js generate my-app.config.json
   ```

5. Deploy your application:
   ```bash
   cd generated
   ./deploy.sh
   ```

## Configuration Examples

### Minimal Configuration (SQLite)
```json
{
  "app_name": "my-app",
  "port": 3000,
  "deploy_path": "/var/www/my-app",
  "database": {
    "type": "sqlite",
    "path": "/var/lib/my-app/database.db"
  },
  "nginx": {
    "enabled": true,
    "domain": "my-app.example.com"
  }
}
```

### Full Configuration (PostgreSQL with SSL)
```json
{
  "app_name": "full-app",
  "port": 3000,
  "instances": 2,
  "max_memory": "2G",
  "deploy_path": "/var/www/full-app",
  "database": {
    "type": "postgresql",
    "host": "localhost",
    "port": 5432,
    "name": "full_app_db",
    "username": "db_user",
    "password": "secure_password"
  },
  "ssl": {
    "enabled": true,
    "cert_path": "/etc/ssl/certs/full-app.crt",
    "key_path": "/etc/ssl/private/full-app.key"
  },
  "nginx": {
    "enabled": true,
    "domain": "full-app.example.com",
    "ssl_enabled": true
  },
  "health_check": {
    "enabled": true,
    "path": "/api/health",
    "interval": 5
  },
  "backup": {
    "enabled": true,
    "path": "/backup/full-app",
    "schedule": "0 2 * * *"
  }
}
```

## CLI Commands

- `node cli.js init [app-name]` - Initialize a new deployment configuration
- `node cli.js setup` - Interactive setup wizard
- `node cli.js generate [config-file]` - Generate deployment files
- `node cli.js deploy [config-file]` - Generate and deploy application
- `node cli.js ci-status` - Show CI/CD environment information
- `node cli.js ci-validate [config-file]` - Validate configuration for CI/CD
- `node cli.js help` - Show help message

## Database Support

### SQLite (Default)
No additional setup required. The system will automatically create the database file.

### MySQL
The system will automatically:
- Install MySQL client tools
- Create the database and user
- Grant appropriate privileges

### PostgreSQL
The system will automatically:
- Install PostgreSQL client tools
- Create the database and user
- Grant appropriate privileges

## CI/CD Integration

The Universal Next.js Deployment System is designed for seamless CI/CD integration:

### GitHub Actions
The repository includes a comprehensive GitHub Actions workflow ([.github/workflows/ci.yml](.github/workflows/ci.yml)) that:
- Tests the deployment system across multiple Node.js versions
- Validates configuration files
- Generates deployment packages for staging and production
- Automatically packages releases

### Docker Support
- Dockerfile for containerized deployments
- docker-compose.yml for local development and testing
- Multi-service testing environment (PostgreSQL, MySQL)

### CI/CD Commands
- `node cli.js ci-status` - Shows CI environment information
- `node cli.js ci-validate` - Validates configurations for CI/CD pipelines

### Makefile Targets
The Makefile includes CI/CD specific targets:
- `make ci-test` - Run CI tests
- `make ci-build` - Run CI build process
- `make ci-deploy-staging` - Run staging deployment
- `make ci-deploy-production` - Run production deployment

## Security Features

- Automatic generation of secure authentication secrets
- Proper file permissions for sensitive directories
- SSL certificate configuration support
- Database users created with minimal required privileges

## Documentation

For complete documentation, see:
- [DOCUMENTATION.md](DOCUMENTATION.md) - Complete documentation
- [QUICKSTART.md](QUICKSTART.md) - Quick start guide
- Example configuration files:
  - [MINIMAL_EXAMPLE.config.json](MINIMAL_EXAMPLE.config.json)
  - [FULL_EXAMPLE.config.json](FULL_EXAMPLE.config.json)
  - [mysql-example.config.json](mysql-example.config.json)
  - [postgresql-example.config.json](postgresql-example.config.json)
  - [ci-cd.config.json](ci-cd.config.json)

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Support

If you encounter any issues or have questions, please file an issue on the GitHub repository.