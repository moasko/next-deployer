# Deployment Scenario: Existing Next.js Project

## Project Overview

This scenario demonstrates how to deploy an existing Next.js project using the Universal Next.js Deployment System. The example project is a typical e-commerce application with the following characteristics:

- Built with Next.js 14
- Uses Prisma ORM with PostgreSQL database
- Implements user authentication with NextAuth.js
- Has API routes for product management and user orders
- Requires environment variables for configuration
- Uses TypeScript

## Project Structure

```
my-nextjs-ecommerce/
├── app/
│   ├── api/
│   ├── components/
│   ├── lib/
│   ├── pages/
│   └── styles/
├── prisma/
│   ├── schema.prisma
│   └── seed.ts
├── public/
├── .env.local
├── next.config.js
├── package.json
├── tsconfig.json
└── README.md
```

## Deployment Requirements

1. **Production Environment**:
   - Domain: shop.example.com
   - SSL/HTTPS enabled
   - PostgreSQL database
   - 2 PM2 instances for load balancing
   - 2GB memory limit per instance
   - Automated daily backups
   - Health checks every 5 minutes

2. **Database Configuration**:
   - PostgreSQL 15
   - Host: postgres.example.com
   - Port: 5432
   - Database name: ecommerce_prod
   - Username: ecommerce_app
   - Password: (to be provided via environment variable)

3. **Environment Variables**:
   - NEXTAUTH_SECRET
   - NEXTAUTH_URL
   - DATABASE_URL
   - STRIPE_SECRET_KEY
   - STRIPE_WEBHOOK_SECRET

## Deployment Steps

### 1. Prepare the Deployment System

```bash
# Clone the deployment system
git clone https://github.com/your-username/universal-nextjs-deploy.git
cd universal-nextjs-deploy

# Install dependencies
npm install
```

### 2. Create Configuration File

Create `ecommerce.config.json`:

```json
{
  "app_name": "ecommerce-app",
  "port": 3000,
  "instances": 2,
  "max_memory": "2G",
  "deploy_path": "/var/www/ecommerce-app",
  "database": {
    "type": "postgresql",
    "host": "postgres.example.com",
    "port": 5432,
    "name": "ecommerce_prod",
    "username": "ecommerce_app",
    "password": "${DB_PASSWORD}"
  },
  "env_file": ".env.production",
  "build_command": "npm run build",
  "start_command": "npm start",
  "node_version": "18",
  "ssl": {
    "enabled": true,
    "cert_path": "/etc/ssl/certs/shop-example-com.crt",
    "key_path": "/etc/ssl/private/shop-example-com.key"
  },
  "nginx": {
    "enabled": true,
    "domain": "shop.example.com",
    "ssl_enabled": true,
    "proxy_pass": "http://localhost"
  },
  "health_check": {
    "enabled": true,
    "path": "/api/health",
    "interval": 5
  },
  "backup": {
    "enabled": true,
    "path": "/backup/ecommerce-app",
    "schedule": "0 2 * * *" 
  }
}
```

### 3. Prepare Environment File

Create `.env.production`:

```env
NEXTAUTH_SECRET=your-super-secret-key-change-in-production
NEXTAUTH_URL=https://shop.example.com
DATABASE_URL=postgresql://ecommerce_app:${DB_PASSWORD}@postgres.example.com:5432/ecommerce_prod
STRIPE_SECRET_KEY=sk_live_your_stripe_secret_key
STRIPE_WEBHOOK_SECRET=whsec_your_stripe_webhook_secret
NODE_ENV=production
```

### 4. Generate Deployment Files

```bash
# Generate deployment files
node cli.js generate ecommerce.config.json

# Check generated files
ls -la generated/
```

### 5. Deploy to Production Server

```bash
# Copy files to production server
scp -r generated/* user@production-server:/tmp/deployment/

# SSH into production server
ssh user@production-server

# Navigate to deployment directory
cd /tmp/deployment

# Run deployment script
./deploy.sh
```

## Post-Deployment Steps

### 1. Verify Deployment

```bash
# Check PM2 processes
pm2 list

# Check application logs
pm2 logs ecommerce-app

# Test health check endpoint
curl https://shop.example.com/api/health
```

### 2. Configure DNS

Update DNS records to point `shop.example.com` to your server's IP address.

### 3. Test SSL Certificate

Verify that HTTPS is working correctly:
```bash
openssl s_client -connect shop.example.com:443 -servername shop.example.com
```

### 4. Set Up Monitoring

Configure additional monitoring if needed:
- Set up alerts for health check failures
- Configure log aggregation
- Set up performance monitoring

## Maintenance Operations

### Database Migrations

```bash
# SSH into server
ssh user@production-server

# Navigate to app directory
cd /var/www/ecommerce-app

# Run Prisma migrations
npx prisma migrate deploy
```

### Application Updates

```bash
# Regenerate deployment files with updated configuration if needed
node cli.js generate ecommerce.config.json

# Copy new deployment files to server
scp -r generated/* user@production-server:/tmp/deployment/

# SSH into server and run deployment
ssh user@production-server "cd /tmp/deployment && ./deploy.sh"
```

### Backup Management

```bash
# List backups
ls -la /backup/ecommerce-app/

# Restore from backup (if needed)
# This would typically involve stopping the app, restoring the database,
# and copying application files from the backup
```

## Troubleshooting

### Common Issues

1. **Database Connection Failed**:
   - Verify database credentials in configuration
   - Check network connectivity to database server
   - Ensure database user has proper permissions

2. **SSL Certificate Issues**:
   - Verify certificate and key file paths
   - Check certificate validity
   - Ensure proper file permissions (600 for private key)

3. **Nginx Configuration Errors**:
   - Check Nginx error logs: `/var/log/nginx/error.log`
   - Test configuration: `sudo nginx -t`
   - Reload Nginx: `sudo systemctl reload nginx`

4. **PM2 Process Failures**:
   - Check application logs: `pm2 logs ecommerce-app`
   - Restart process: `pm2 restart ecommerce-app`
   - Check system resources: `htop`, `df -h`

### Log Locations

- Application logs: `/var/www/ecommerce-app/logs/`
- Nginx logs: `/var/log/nginx/`
- System logs: `/var/log/syslog`
- PM2 logs: `~/.pm2/logs/`

## Security Considerations

1. **Environment Variables**:
   - Store sensitive values in environment variables
   - Never commit secrets to version control
   - Use a secrets management system in production

2. **File Permissions**:
   - Ensure private keys have 600 permissions
   - Limit access to configuration files
   - Run application with minimal required privileges

3. **Network Security**:
   - Configure firewall rules to restrict access
   - Use SSH keys instead of passwords
   - Keep system and dependencies updated

4. **Database Security**:
   - Use strong database passwords
   - Limit database user permissions
   - Enable database connection encryption

## Scaling Considerations

1. **Horizontal Scaling**:
   - Increase PM2 instances based on CPU usage
   - Use a load balancer for multiple servers
   - Implement session storage (Redis) for sticky sessions

2. **Vertical Scaling**:
   - Increase memory limits for larger applications
   - Optimize database queries
   - Implement caching strategies

3. **Database Scaling**:
   - Consider read replicas for high-read workloads
   - Implement connection pooling
   - Optimize database indexes

This scenario demonstrates a complete deployment workflow for a real-world Next.js application with all the features and considerations needed for production deployment.