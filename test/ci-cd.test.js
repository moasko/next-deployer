// CI/CD Test Suite
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('Running CI/CD Tests...');

// Test 1: Check CLI help
try {
  const helpOutput = execSync('node cli.js help', { encoding: 'utf8' });
  if (helpOutput.includes('CI/CD')) {
    console.log('✓ CLI help includes CI/CD commands');
  } else {
    console.log('✗ CLI help missing CI/CD commands');
  }
} catch (err) {
  console.log('✗ Failed to run CLI help command');
}

// Test 2: Check CI status command
try {
  const statusOutput = execSync('node cli.js ci-status', { encoding: 'utf8' });
  console.log('✓ CI status command executed');
} catch (err) {
  console.log('✗ Failed to run CI status command');
}

// Test 3: Validate example configuration
try {
  const validateOutput = execSync('node cli.js ci-validate example.config.json', { encoding: 'utf8' });
  console.log('✓ Configuration validation passed');
} catch (err) {
  console.log('✗ Configuration validation failed');
}

// Test 4: Generate deployment with dry-run
try {
  execSync('node cli.js generate example.config.json --dry-run', { encoding: 'utf8' });
  console.log('✓ Dry-run deployment generation successful');
} catch (err) {
  console.log('✗ Dry-run deployment generation failed');
}

// Test 5: Check generated files
const generatedDir = path.join(__dirname, '..', 'generated');
if (fs.existsSync(generatedDir)) {
  const files = fs.readdirSync(generatedDir);
  if (files.includes('deploy.sh') && files.includes('ecosystem.config.js')) {
    console.log('✓ Required deployment files generated');
  } else {
    console.log('✗ Missing required deployment files');
  }
} else {
  console.log('✗ Generated directory not found');
}

console.log('CI/CD Tests Completed.');