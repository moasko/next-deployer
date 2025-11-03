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

// Show help message
function showHelp() {
  console.log(`
Universal Next.js Deployment CLI
===============================

Usage:
  node cli.js [command] [options]

Commands:
  init [config-name]     Initialize a new deployment configuration
  generate [config]      Generate deployment files from configuration
  deploy [config]        Generate and deploy the application
  setup                  Interactive setup wizard
  ci-status              Show CI/CD status and environment info
  ci-validate            Validate configuration for CI/CD
  help                   Show this help message

Options for generate and deploy:
  --env <file>           Specify environment file to use
  --skip-build           Skip building the application
  --skip-deps            Skip installing dependencies
  --skip-migrations      Skip database migrations
  --dry-run              Show what would be done without executing
  --output-dir <dir>     Specify output directory for generated files

CI/CD Commands:
  ci-status              Show CI environment information
  ci-validate [config]   Validate configuration for CI/CD pipeline

Examples:
  node cli.js init myapp
  node cli.js setup
  node cli.js generate myapp.config.json
  node cli.js generate myapp.config.json --env .env.production
  node cli.js deploy myapp.config.json --skip-build
  node cli.js deploy myapp.config.json --dry-run
  node cli.js ci-status
  node cli.js ci-validate myapp.config.json
  `);
}

// Show CI/CD status
function showCIStatus() {
  log.info('CI/CD Environment Status');
  log.info('======================');
  
  // Check if running in CI environment
  const ciEnv = process.env.CI || process.env.GITHUB_ACTIONS || process.env.GITLAB_CI || process.env.JENKINS_URL;
  log.info(`CI Environment: ${ciEnv ? 'Detected' : 'Not Detected'}`);
  
  // Show environment variables
  log.info('Environment Variables:');
  Object.keys(process.env).filter(key => 
    key.startsWith('GITHUB_') || 
    key.startsWith('CI') || 
    key.startsWith('NODE_') ||
    key === 'HOME' ||
    key === 'PATH'
  ).forEach(key => {
    log.info(`  ${key}: ${process.env[key]}`);
  });
  
  // Check Node.js version
  const nodeVersion = process.version;
  log.info(`Node.js Version: ${nodeVersion}`);
  
  // Check current working directory
  const cwd = process.cwd();
  log.info(`Working Directory: ${cwd}`);
  
  // Check available tools
  log.info('Available Tools:');
  ['node', 'npm', 'docker', 'git'].forEach(tool => {
    try {
      const version = execSync(`${tool} --version`, { encoding: 'utf8' }).trim();
      log.info(`  ${tool}: ${version}`);
    } catch (err) {
      log.warn(`  ${tool}: Not available`);
    }
  });
}

// Validate configuration for CI/CD
function validateCIConfig(configPath) {
  log.info(`Validating configuration for CI/CD: ${configPath}`);
  
  if (!fs.existsSync(configPath)) {
    log.error(`Configuration file not found: ${configPath}`);
    return false;
  }
  
  try {
    const configContent = fs.readFileSync(configPath, 'utf8');
    const config = JSON.parse(configContent);
    
    log.info('Configuration Validation Results:');
    log.info('================================');
    
    // Check required fields
    const requiredFields = ['app_name', 'port', 'deploy_path'];
    const missingFields = requiredFields.filter(field => !config[field]);
    
    if (missingFields.length > 0) {
      log.error(`Missing required fields: ${missingFields.join(', ')}`);
      return false;
    }
    
    log.info('✓ Required fields present');
    
    // Check database configuration
    if (config.database) {
      if (config.database.type === 'sqlite') {
        log.info('✓ SQLite database configuration');
      } else if (config.database.type === 'mysql' || config.database.type === 'postgresql') {
        const dbRequired = ['host', 'port', 'name', 'username'];
        const missingDbFields = dbRequired.filter(field => !config.database[field]);
        if (missingDbFields.length > 0) {
          log.warn(`Missing database fields for ${config.database.type}: ${missingDbFields.join(', ')}`);
        } else {
          log.info(`✓ ${config.database.type} database configuration`);
        }
      }
    }
    
    // Check for environment variables in sensitive fields
    const sensitiveFields = ['DB_PASSWORD', 'DATABASE_URL', 'AUTH_SECRET'];
    let hasEnvVars = false;
    
    if (config.database && config.database.password && config.database.password.startsWith('$')) {
      log.info('✓ Database password uses environment variable');
      hasEnvVars = true;
    }
    
    if (!hasEnvVars) {
      log.warn('Consider using environment variables for sensitive data in CI/CD');
    }
    
    log.info('Configuration validation completed successfully');
    return true;
    
  } catch (err) {
    log.error(`Failed to parse configuration file: ${err.message}`);
    return false;
  }
}

// Interactive setup wizard
function setupWizard() {
  const readline = require('readline');
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  log.info('Welcome to the Universal Next.js Deployment Setup Wizard!');
  log.info('This wizard will help you configure your deployment settings.\n');

  const config = { ...defaultConfig };

  rl.question('Application name (default: my-next-app): ', (appName) => {
    config.app_name = appName || 'my-next-app';
    config.deploy_path = `/var/www/${config.app_name}`;
    config.nginx.domain = `${config.app_name}.example.com`;
    config.backup.path = `/backup/${config.app_name}`;

    rl.question(`Port (default: ${config.port}): `, (port) => {
      config.port = port ? parseInt(port) : config.port;

      rl.question(`Number of instances (default: ${config.instances}): `, (instances) => {
        config.instances = instances ? parseInt(instances) : config.instances;

        rl.question(`Maximum memory per instance (default: ${config.max_memory}): `, (memory) => {
          config.max_memory = memory || config.max_memory;

          rl.question(`Domain name (default: ${config.nginx.domain}): `, (domain) => {
            config.nginx.domain = domain || config.nginx.domain;

            rl.question('Database type (sqlite/mysql/postgresql/other, default: sqlite): ', (dbType) => {
              const type = dbType || 'sqlite';
              config.database.type = type;
              
              if (type === 'sqlite') {
                config.database.path = `/var/lib/${config.app_name}/database.db`;
              } else {
                rl.question(`Database host (default: localhost): `, (dbHost) => {
                  config.database.host = dbHost || 'localhost';
                  
                  rl.question(`Database port (default: ${type === 'mysql' ? 3306 : 5432}): `, (dbPort) => {
                    config.database.port = dbPort ? parseInt(dbPort) : (type === 'mysql' ? 3306 : 5432);
                    
                    rl.question(`Database name (default: ${config.app_name}): `, (dbName) => {
                      config.database.name = dbName || config.app_name;
                      
                      rl.question(`Database username: `, (dbUser) => {
                        config.database.username = dbUser;
                        
                        rl.question(`Database password: `, (dbPass) => {
                          config.database.password = dbPass;
                          
                          rl.question('Enable SSL? (y/N): ', (ssl) => {
                            config.nginx.ssl_enabled = ssl.toLowerCase() === 'y';
                            config.ssl.enabled = ssl.toLowerCase() === 'y';

                            rl.question('Enable automated backups? (y/N): ', (backup) => {
                              config.backup.enabled = backup.toLowerCase() === 'y';

                              rl.question('Enable health checks? (Y/n): ', (health) => {
                                config.health_check.enabled = health.toLowerCase() !== 'n';

                                // Create config file
                                const configFileName = `${config.app_name}.config.json`;
                                fs.writeFileSync(configFileName, JSON.stringify(config, null, 2));
                                log.info(`\nConfiguration file created: ${configFileName}`);
                                log.info('Edit this file to customize your deployment settings');
                                log.info('\nTo generate deployment files, run:');
                                log.info(`  node cli.js generate ${configFileName}`);
                                log.info('\nTo deploy your application, run:');
                                log.info(`  node cli.js deploy ${configFileName}`);

                                rl.close();
                              });
                            });
                          });
                        });
                      });
                    });
                  });
                });
              }
            });
          });
        });
      });
    });
  });
}

// Default configuration with production-ready defaults and database support
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

// Initialize a new configuration
function initConfig(configName = 'my-next-app') {
  const configFileName = `${configName}.config.json`;
  
  // Production-ready default configuration
  const config = { ...defaultConfig };
  config.app_name = configName;
  config.deploy_path = `/var/www/${configName}`;
  config.database.path = `/var/lib/${configName}/database.db`;
  config.database.name = configName.replace(/[^a-zA-Z0-9]/g, '_');
  config.nginx.domain = `${configName}.example.com`;
  config.backup.path = `/backup/${configName}`;
  
  // Write configuration to file
  fs.writeFileSync(configFileName, JSON.stringify(config, null, 2));
  log.info(`Configuration file created: ${configFileName}`);
  log.info('This configuration is ready for production use!');
  log.info('Edit this file to customize your deployment settings');
}

// Parse command line arguments
function parseArgs(args) {
  const parsed = {
    command: args[0],
    config: args[1],
    options: {}
  };
  
  for (let i = 2; i < args.length; i++) {
    const arg = args[i];
    if (arg.startsWith('--')) {
      const key = arg.slice(2);
      if (i + 1 < args.length && !args[i + 1].startsWith('--')) {
        parsed.options[key] = args[i + 1];
        i++; // Skip next argument as it's the value
      } else {
        parsed.options[key] = true;
      }
    }
  }
  
  return parsed;
}

// Generate deployment files
function generateDeployment(configPath, options = {}) {
  const deployScript = path.join(__dirname, 'deploy.js');
  
  try {
    let cmd = `node "${deployScript}" "${configPath}"`;
    
    // Add options to command
    if (options.env) {
      cmd += ` --env "${options.env}"`;
    }
    
    if (options['skip-build']) {
      cmd += ' --skip-build';
    }
    
    if (options['skip-deps']) {
      cmd += ' --skip-deps';
    }
    
    if (options['skip-migrations']) {
      cmd += ' --skip-migrations';
    }
    
    if (options['dry-run']) {
      cmd += ' --dry-run';
    }
    
    if (options['output-dir']) {
      cmd += ` --output-dir "${options['output-dir']}"`;
    }
    
    execSync(cmd, { stdio: 'inherit' });
    log.info('Deployment files generated successfully!');
  } catch (err) {
    log.error(`Failed to generate deployment files: ${err.message}`);
    process.exit(1);
  }
}

// Deploy application
function deployApplication(configPath, options = {}) {
  // First generate deployment files
  generateDeployment(configPath, options);
  
  // Then run the deployment script
  const deployScript = path.join(__dirname, 'generated', 'deploy.sh');
  
  if (fs.existsSync(deployScript)) {
    log.info('Starting deployment...');
    try {
      let cmd = `bash "${deployScript}"`;
      
      // Add options to command
      if (options['dry-run']) {
        cmd += ' --dry-run';
      }
      
      execSync(cmd, { stdio: 'inherit' });
      log.info('Application deployed successfully!');
    } catch (err) {
      log.error(`Deployment failed: ${err.message}`);
      process.exit(1);
    }
  } else {
    log.error(`Deployment script not found: ${deployScript}`);
    process.exit(1);
  }
}

// Main function
function main() {
  const args = process.argv.slice(2);
  const parsedArgs = parseArgs(args);
  const command = parsedArgs.command;
  
  switch (command) {
    case 'init':
      initConfig(parsedArgs.config);
      break;
      
    case 'setup':
      setupWizard();
      break;
      
    case 'generate':
      if (!parsedArgs.config) {
        log.error('Please specify a configuration file');
        process.exit(1);
      }
      generateDeployment(parsedArgs.config, parsedArgs.options);
      break;
      
    case 'deploy':
      if (!parsedArgs.config) {
        log.error('Please specify a configuration file');
        process.exit(1);
      }
      deployApplication(parsedArgs.config, parsedArgs.options);
      break;
      
    case 'ci-status':
      showCIStatus();
      break;
      
    case 'ci-validate':
      const configToValidate = parsedArgs.config || './config.json';
      const isValid = validateCIConfig(configToValidate);
      process.exit(isValid ? 0 : 1);
      break;
      
    case 'help':
    case '--help':
    case '-h':
    default:
      showHelp();
      break;
  }
}

// Run main function if this script is executed directly
if (require.main === module) {
  main();
}