#!/usr/bin/env node

/**
 * One-Click Setup Script
 * Automates the complete setup process for local development
 */

const fs = require('fs');
const path = require('path');
const { execSync, spawn } = require('child_process');
const { generateJWTSecrets } = require('./generate-secrets');

// Colors for terminal output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  red: '\x1b[31m',
  cyan: '\x1b[36m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function error(message) {
  log(`❌ Error: ${message}`, 'red');
  process.exit(1);
}

function success(message) {
  log(`✅ ${message}`, 'green');
}

function info(message) {
  log(`ℹ️  ${message}`, 'blue');
}

function warning(message) {
  log(`⚠️  ${message}`, 'yellow');
}

// Check if running in quick mode
const isQuickMode = process.argv.includes('--quick') || process.argv.includes('-q');

const rootDir = path.resolve(__dirname, '..');
const envExamplePath = path.join(rootDir, '.env.example');
const envPath = path.join(rootDir, '.env');

/**
 * Check if a command exists
 */
function commandExists(command) {
  try {
    execSync(`which ${command}`, { stdio: 'ignore' });
    return true;
  } catch {
    return false;
  }
}

/**
 * Check prerequisites
 */
function checkPrerequisites() {
  log('\n🔍 Checking prerequisites...', 'cyan');

  // Check Node.js
  const nodeVersion = process.version;
  const majorVersion = parseInt(nodeVersion.slice(1).split('.')[0]);
  if (majorVersion < 18) {
    error(`Node.js 18+ required. Current version: ${nodeVersion}`);
  }
  success(`Node.js ${nodeVersion} detected`);

  // Check Docker
  if (!commandExists('docker')) {
    error('Docker is not installed. Please install Docker first.');
  }
  success('Docker detected');

  // Check Docker Compose
  if (!commandExists('docker-compose') && !commandExists('docker')) {
    error('Docker Compose is not available. Please install Docker Compose.');
  }
  success('Docker Compose available');

  // Check if Docker is running
  try {
    execSync('docker info', { stdio: 'ignore' });
    success('Docker daemon is running');
  } catch {
    error('Docker daemon is not running. Please start Docker.');
  }
}

/**
 * Create .env file from .env.example
 */
function createEnvFile() {
  log('\n📝 Setting up environment variables...', 'cyan');

  if (!fs.existsSync(envExamplePath)) {
    error('.env.example file not found. Please ensure it exists in the root directory.');
  }

  if (fs.existsSync(envPath)) {
    warning('.env file already exists.');
    if (!isQuickMode) {
      const readline = require('readline').createInterface({
        input: process.stdin,
        output: process.stdout,
      });

      return new Promise((resolve) => {
        readline.question('Do you want to overwrite it? (y/N): ', (answer) => {
          readline.close();
          if (answer.toLowerCase() !== 'y') {
            info('Keeping existing .env file');
            resolve(false);
            return;
          }
          generateAndUpdateEnv();
          resolve(true);
        });
      });
    } else {
      info('Quick mode: Keeping existing .env file');
      return Promise.resolve(false);
    }
  }

  generateAndUpdateEnv();
  return Promise.resolve(true);
}

/**
 * Generate secrets and update .env file
 */
function generateAndUpdateEnv() {
  info('Creating .env file from .env.example...');
  let envContent = fs.readFileSync(envExamplePath, 'utf8');

  // Generate JWT secrets
  info('Generating secure JWT secrets...');
  const secrets = generateJWTSecrets();

  // Replace placeholder secrets
  envContent = envContent.replace(
    /JWT_SECRET=CHANGE_THIS_TO_A_SECURE_RANDOM_STRING/g,
    `JWT_SECRET=${secrets.JWT_SECRET}`
  );
  envContent = envContent.replace(
    /JWT_REFRESH_SECRET=CHANGE_THIS_TO_A_SECURE_RANDOM_STRING/g,
    `JWT_REFRESH_SECRET=${secrets.JWT_REFRESH_SECRET}`
  );

  // Write .env file
  fs.writeFileSync(envPath, envContent);
  success('.env file created with auto-generated secrets');
}

/**
 * Start Docker services
 */
function startDockerServices() {
  log('\n🐳 Starting Docker services...', 'cyan');

  try {
    info('Starting PostgreSQL and Redis containers...');
    execSync('docker-compose up -d postgres redis', {
      cwd: rootDir,
      stdio: 'inherit',
    });
    success('Docker services started');

    // Wait for services to be healthy
    info('Waiting for services to be ready...');
    let attempts = 0;
    const maxAttempts = 30;

    while (attempts < maxAttempts) {
      try {
        execSync('docker-compose exec -T postgres pg_isready -U postgres', {
          cwd: rootDir,
          stdio: 'ignore',
        });
        execSync('docker-compose exec -T redis redis-cli ping', {
          cwd: rootDir,
          stdio: 'ignore',
        });
        success('Services are healthy');
        return;
      } catch {
        attempts++;
        process.stdout.write('.');
        require('child_process').execSync('sleep 2', { stdio: 'ignore' });
      }
    }

    warning('Services may not be fully ready. Continuing anyway...');
  } catch (err) {
    error(`Failed to start Docker services: ${err.message}`);
  }
}

/**
 * Install dependencies
 */
function installDependencies() {
  log('\n📦 Installing dependencies...', 'cyan');

  try {
    execSync('npm install', {
      cwd: rootDir,
      stdio: 'inherit',
    });
    success('Dependencies installed');
  } catch (err) {
    error(`Failed to install dependencies: ${err.message}`);
  }
}

/**
 * Generate Prisma client
 */
function generatePrismaClient() {
  log('\n🔧 Generating Prisma client...', 'cyan');

  try {
    execSync('npm run prisma:generate', {
      cwd: rootDir,
      stdio: 'inherit',
    });
    success('Prisma client generated');
  } catch (err) {
    error(`Failed to generate Prisma client: ${err.message}`);
  }
}

/**
 * Run database migrations
 */
function runMigrations() {
  log('\n🗄️  Running database migrations...', 'cyan');

  try {
    execSync('npm run prisma:migrate', {
      cwd: rootDir,
      stdio: 'inherit',
    });
    success('Database migrations completed');
  } catch (err) {
    error(`Failed to run migrations: ${err.message}`);
  }
}

/**
 * Seed database
 */
function seedDatabase() {
  if (isQuickMode) {
    info('Quick mode: Skipping database seeding');
    return;
  }

  log('\n🌱 Seeding database...', 'cyan');

  const readline = require('readline').createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  return new Promise((resolve) => {
    readline.question('Do you want to seed the database with sample data? (Y/n): ', (answer) => {
      readline.close();
      if (answer.toLowerCase() === 'n') {
        info('Skipping database seeding');
        resolve();
        return;
      }

      try {
        execSync('npm run prisma:seed', {
          cwd: rootDir,
          stdio: 'inherit',
        });
        success('Database seeded successfully');
      } catch (err) {
        warning(`Database seeding failed: ${err.message}`);
      }
      resolve();
    });
  });
}

/**
 * Main setup function
 */
async function main() {
  log('\n🚀 E-commerce Backend - One-Click Setup', 'bright');
  log('=====================================\n', 'bright');

  try {
    // Step 1: Check prerequisites
    checkPrerequisites();

    // Step 2: Create .env file
    await createEnvFile();

    // Step 3: Start Docker services
    startDockerServices();

    // Step 4: Install dependencies
    installDependencies();

    // Step 5: Generate Prisma client
    generatePrismaClient();

    // Step 6: Run migrations
    runMigrations();

    // Step 7: Seed database (optional)
    await seedDatabase();

    // Success message
    log('\n✨ Setup completed successfully!', 'green');
    log('\n📋 Next steps:', 'cyan');
    log('   1. Start the development server: npm run dev', 'reset');
    log('   2. Access API docs: http://localhost:3000/api-docs', 'reset');
    log('   3. Access Prisma Studio: npm run prisma:studio', 'reset');
    log('\n💡 Tips:', 'cyan');
    log('   - Your .env file contains auto-generated secrets', 'reset');
    log('   - For production, update JWT secrets with stronger values', 'reset');
    log('   - Configure optional services (email, payment gateways) in .env', 'reset');
    log('\n');

  } catch (err) {
    error(`Setup failed: ${err.message}`);
  }
}

// Run if executed directly
if (require.main === module) {
  main().catch((err) => {
    error(`Unexpected error: ${err.message}`);
  });
}

module.exports = { main };
