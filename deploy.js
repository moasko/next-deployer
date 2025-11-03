#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Colors for output
const colors = {
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m'
};

// Logging functions
const log = {
  info: (msg) => console.log(`${colors.green}[INFO]${colors.reset} ${msg}`),
  warn: (msg) => console.log(`${colors.yellow}[WARN]${colors.reset} ${msg}`),
  error: (msg) => console.log(`${colors.red}[ERROR]${colors.reset} ${msg}`),
  debug: (msg) => console.log(`${colors.blue}[DEBUG]${colors.reset} ${msg}`)
};

// Production-ready default configuration with database support
const defaultConfig = {
  app_name: 'my-next-app',
  port: 3000,
  instances: 2,
  max_memory: '2G',
  deploy_path: '/var/www/my-next-app',
  database: {
    type: 'sqlite',
    path: '/var/lib/my-next-app/database.db',
    host: 'localhost',
    port: 3306,
    name: 'my_next_app',
    username: '',
    password: ''
  },
  env_file: '.env.production',
  build_command: 'npm run build',
  start_command: 'npm start',
  node_version: '18',
  ssl: {
    enabled: false,
    cert_path: '/etc/ssl/certs/myapp.crt',
    key_path: '/etc/ssl/private/myapp.key'
  },
  nginx: {
    enabled: true,
    domain: 'my-next-app.example.com',
    ssl_enabled: false,
    proxy_pass: 'http://localhost'
  },
  health_check: {
    enabled: true,
    path: '/api/health',
    interval: 5
  },
  backup: {
    enabled: true,
    path: '/backup/my-next-app',
    schedule: '0 2 * * *' // Daily at 2 AM
  }
};

// Parse command line arguments
function parseCommandLineArgs() {
  const args = process.argv.slice(2);
  const options = {};
  
  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    if (arg.startsWith('--')) {
      const key = arg.slice(2);
      if (i + 1 < args.length && !args[i + 1].startsWith('--')) {
        options[key] = args[i + 1];
        i++; // Skip next argument as it's the value
      } else {
        options[key] = true;
      }
    }
  }
  
  return {
    configPath: args[0] || './config.json',
    templateDir: args.find((arg, index) => index > 0 && !arg.startsWith('--')) || './templates',
    outputDir: options['output-dir'] || './generated',
    envFile: options.env,
    skipBuild: !!options['skip-build'],
    skipDeps: !!options['skip-deps'],
    skipMigrations: !!options['skip-migrations'],
    dryRun: !!options['dry-run']
  };
}

// Load configuration from file or use defaults
function loadConfig(configPath) {
  try {
    if (fs.existsSync(configPath)) {
      const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
      return { ...defaultConfig, ...config };
    }
  } catch (err) {
    log.warn(`Could not load config file: ${err.message}`);
  }
  return defaultConfig;
}

// Replace placeholders in template
function replacePlaceholders(template, replacements) {
  let result = template;
  for (const [key, value] of Object.entries(replacements)) {
    const placeholder = `{{${key}}}`;
    // Handle boolean values properly
    const replacementValue = typeof value === 'boolean' ? value.toString() : value;
    result = result.replace(new RegExp(placeholder.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), replacementValue);
  }
  return result;
}

// Generate database connection string based on type
function generateDatabaseUrl(config) {
  const db = config.database;
  
  switch (db.type) {
    case 'sqlite':
      return `file:${db.path}`;
    case 'mysql':
      return `mysql://${db.username}:${db.password}@${db.host}:${db.port}/${db.name}`;
    case 'postgresql':
      return `postgresql://${db.username}:${db.password}@${db.host}:${db.port}/${db.name}`;
    case 'other':
      // For other databases, we'll use a generic approach
      return `${db.type}://${db.username}:${db.password}@${db.host}:${db.port}/${db.name}`;
    default:
      return `file:${db.path}`; // fallback to sqlite
  }
}

// Generate PM2 configuration
function generatePM2Config(config, templateDir, outputDir) {
  const templatePath = path.join(templateDir, 'ecosystem.config.template');
  const outputPath = path.join(outputDir, 'ecosystem.config.js');
  
  if (!fs.existsSync(templatePath)) {
    log.error(`Template not found: ${templatePath}`);
    return false;
  }
  
  const template = fs.readFileSync(templatePath, 'utf8');
  const replacements = {
    APP_NAME: config.app_name,
    PORT: config.port,
    INSTANCES: config.instances,
    MAX_MEMORY: config.max_memory,
    NODE_VERSION: config.node_version,
    START_COMMAND: config.start_command
  };
  
  const generatedConfig = replacePlaceholders(template, replacements);
  fs.writeFileSync(outputPath, generatedConfig);
  log.info(`PM2 configuration generated: ${outputPath}`);
  return true;
}

// Generate Nginx configuration
function generateNginxConfig(config, templateDir, outputDir) {
  const templatePath = path.join(templateDir, 'nginx.config.template');
  const outputPath = path.join(outputDir, 'nginx.config.generated');
  
  if (!fs.existsSync(templatePath)) {
    log.error(`Template not found: ${templatePath}`);
    return false;
  }
  
  const template = fs.readFileSync(templatePath, 'utf8');
  const replacements = {
    DOMAIN: config.nginx.domain,
    PORT: config.port,
    SSL_ENABLED: config.nginx.ssl_enabled,
    CERT_PATH: config.ssl.cert_path,
    KEY_PATH: config.ssl.key_path,
    PROXY_PASS: config.nginx.proxy_pass,
    HEALTH_CHECK_PATH: config.health_check.path
  };
  
  const generatedConfig = replacePlaceholders(template, replacements);
  fs.writeFileSync(outputPath, generatedConfig);
  log.info(`Nginx configuration generated: ${outputPath}`);
  return true;
}

// Generate deployment script
function generateDeployScript(config, templateDir, outputDir, options) {
  const templatePath = path.join(templateDir, 'deploy.sh.template');
  const outputPath = path.join(outputDir, 'deploy.sh');
  
  if (!fs.existsSync(templatePath)) {
    log.error(`Template not found: ${templatePath}`);
    return false;
  }
  
  // Read nginx config for embedding
  const nginxConfigPath = path.join(outputDir, 'nginx.config.generated');
  let nginxConfig = '';
  if (fs.existsSync(nginxConfigPath)) {
    nginxConfig = fs.readFileSync(nginxConfigPath, 'utf8')
      .replace(/\$/g, '\\$')  // Escape $ for shell
      .replace(/`/g, '\\`');  // Escape backticks
  }
  
  const template = fs.readFileSync(templatePath, 'utf8');
  const replacements = {
    APP_NAME: config.app_name,
    PORT: config.port,
    DEPLOY_PATH: config.deploy_path,
    DB_PATH: config.database.path,
    DB_TYPE: config.database.type,
    DB_HOST: config.database.host,
    DB_PORT: config.database.port,
    DB_NAME: config.database.name,
    DB_USERNAME: config.database.username,
    DB_PASSWORD: config.database.password,
    DATABASE_URL: generateDatabaseUrl(config),
    ENV_FILE: config.env_file,
    BUILD_COMMAND: config.build_command,
    START_COMMAND: config.start_command,
    NGINX_ENABLED: config.nginx.enabled.toString(),
    DOMAIN: config.nginx.domain,
    SSL_ENABLED: config.ssl.enabled.toString(),
    NGINX_CONFIG: nginxConfig,
    SKIP_BUILD: options.skipBuild.toString(),
    SKIP_DEPS: options.skipDeps.toString(),
    SKIP_MIGRATIONS: options.skipMigrations.toString(),
    DRY_RUN: options.dryRun.toString(),
    BACKUP_ENABLED: config.backup.enabled.toString(),
    BACKUP_PATH: config.backup.path,
    BACKUP_SCHEDULE: config.backup.schedule,
    HEALTH_CHECK_ENABLED: config.health_check.enabled.toString(),
    HEALTH_CHECK_PATH: config.health_check.path,
    HEALTH_CHECK_INTERVAL: config.health_check.interval.toString()
  };
  
  const generatedScript = replacePlaceholders(template, replacements);
  fs.writeFileSync(outputPath, generatedScript);
  
  // Make script executable
  try {
    fs.chmodSync(outputPath, '755');
    log.info(`Deployment script generated and made executable: ${outputPath}`);
  } catch (err) {
    log.warn(`Could not make script executable: ${err.message}`);
  }
  
  return true;
}

// Validate configuration
function validateConfig(config) {
  const errors = [];
  
  if (!config.app_name) {
    errors.push('app_name is required');
  }
  
  if (!config.deploy_path) {
    errors.push('deploy_path is required');
  }
  
  if (config.nginx.enabled && !config.nginx.domain) {
    errors.push('nginx.domain is required when nginx is enabled');
  }
  
  if (config.backup.enabled && !config.backup.path) {
    errors.push('backup.path is required when backup is enabled');
  }
  
  // Database validation
  if (config.database.type !== 'sqlite') {
    if (!config.database.host) {
      errors.push('database.host is required for non-sqlite databases');
    }
    if (!config.database.username) {
      errors.push('database.username is required for non-sqlite databases');
    }
    if (!config.database.name) {
      errors.push('database.name is required for non-sqlite databases');
    }
  }
  
  return errors;
}

// Main function
function main() {
  const options = parseCommandLineArgs();
  const { configPath, templateDir, outputDir } = options;
  
  log.info('Starting universal Next.js deployment setup...');
  
  if (options.dryRun) {
    log.info('DRY RUN MODE: Showing what would be done without executing');
  }
  
  // Load configuration
  const config = loadConfig(configPath);
  
  // Validate configuration
  const validationErrors = validateConfig(config);
  if (validationErrors.length > 0) {
    log.error('Configuration validation failed:');
    validationErrors.forEach(err => log.error(`  - ${err}`));
    process.exit(1);
  }
  
  log.debug(`Loaded configuration: ${JSON.stringify(config, null, 2)}`);
  
  // Create output directory if it doesn't exist
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }
  
  // Generate configurations
  const success = generatePM2Config(config, templateDir, outputDir) &&
                  generateNginxConfig(config, templateDir, outputDir) &&
                  generateDeployScript(config, templateDir, outputDir, options);
  
  if (success) {
    log.info('All configuration files generated successfully!');
    log.info(`Output directory: ${outputDir}`);
    log.info('To deploy your application, run:');
    log.info(`  cd ${outputDir}`);
    log.info('  ./deploy.sh');
    
    if (options.dryRun) {
      log.info('\nNote: This was a dry run. No actual deployment was performed.');
    }
  } else {
    log.error('Failed to generate some configuration files');
    process.exit(1);
  }
}

// Run main function if this script is executed directly
if (require.main === module) {
  main();
}

module.exports = {
  loadConfig,
  replacePlaceholders,
  generatePM2Config,
  generateNginxConfig,
  generateDeployScript
};