# Quick Start Guide

## Getting Started in 5 Minutes

### Step 1: Initialize Configuration
```bash
node cli.js init my-app
```

### Step 2: Customize Configuration
Edit `my-app.config.json`:
```json
{
  "app_name": "my-app",
  "port": 3000,
  "nginx": {
    "enabled": true,
    "domain": "my-app.example.com"
  },
  "database": {
    "type": "sqlite",
    "path": "/var/lib/my-app/database.db"
  }
}
```

### Step 3: Generate Deployment Files
```bash
node cli.js generate my-app.config.json
```

### Step 4: Deploy
```bash
cd generated
./deploy.sh
```

That's it! Your app is now deployed and running.