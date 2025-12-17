#!/bin/bash

# One-Click Setup Script (Bash)
# Automates the complete setup process for local development

set -e  # Exit on error

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Functions
log() {
    echo -e "${CYAN}$1${NC}"
}

success() {
    echo -e "${GREEN}✅ $1${NC}"
}

error() {
    echo -e "${RED}❌ Error: $1${NC}"
    exit 1
}

warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

# Get script directory
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
ROOT_DIR="$( cd "$SCRIPT_DIR/.." && pwd )"
cd "$ROOT_DIR"

# Check if running in quick mode
QUICK_MODE=false
if [[ "$*" == *"--quick"* ]] || [[ "$*" == *"-q"* ]]; then
    QUICK_MODE=true
fi

echo ""
echo -e "${CYAN}🚀 E-commerce Backend - One-Click Setup${NC}"
echo -e "${CYAN}=====================================${NC}"
echo ""

# Check prerequisites
log "🔍 Checking prerequisites..."

# Check Node.js
if ! command -v node &> /dev/null; then
    error "Node.js is not installed. Please install Node.js 18+ first."
fi

NODE_VERSION=$(node --version)
NODE_MAJOR=$(echo "$NODE_VERSION" | cut -d'.' -f1 | sed 's/v//')
if [ "$NODE_MAJOR" -lt 18 ]; then
    error "Node.js 18+ required. Current version: $NODE_VERSION"
fi
success "Node.js $NODE_VERSION detected"

# Check Docker
if ! command -v docker &> /dev/null; then
    error "Docker is not installed. Please install Docker first."
fi
success "Docker detected"

# Check Docker Compose
if ! command -v docker-compose &> /dev/null && ! docker compose version &> /dev/null; then
    error "Docker Compose is not available. Please install Docker Compose."
fi
success "Docker Compose available"

# Check if Docker is running
if ! docker info &> /dev/null; then
    error "Docker daemon is not running. Please start Docker."
fi
success "Docker daemon is running"

# Create .env file
log ""
log "📝 Setting up environment variables..."

if [ ! -f ".env.example" ]; then
    error ".env.example file not found. Please ensure it exists in the root directory."
fi

if [ -f ".env" ]; then
    warning ".env file already exists."
    if [ "$QUICK_MODE" = false ]; then
        read -p "Do you want to overwrite it? (y/N): " -n 1 -r
        echo
        if [[ ! $REPLY =~ ^[Yy]$ ]]; then
            info "Keeping existing .env file"
        else
            # Generate secrets and create .env
            info "Generating secure JWT secrets..."
            JWT_SECRET=$(openssl rand -hex 32)
            JWT_REFRESH_SECRET=$(openssl rand -hex 32)
            
            cp .env.example .env
            sed -i.bak "s/JWT_SECRET=CHANGE_THIS_TO_A_SECURE_RANDOM_STRING/JWT_SECRET=$JWT_SECRET/" .env
            sed -i.bak "s/JWT_REFRESH_SECRET=CHANGE_THIS_TO_A_SECURE_RANDOM_STRING/JWT_REFRESH_SECRET=$JWT_REFRESH_SECRET/" .env
            rm -f .env.bak
            success ".env file updated with auto-generated secrets"
        fi
    else
        info "Quick mode: Keeping existing .env file"
    fi
else
    # Generate secrets and create .env
    info "Generating secure JWT secrets..."
    JWT_SECRET=$(openssl rand -hex 32)
    JWT_REFRESH_SECRET=$(openssl rand -hex 32)
    
    cp .env.example .env
    sed -i.bak "s/JWT_SECRET=CHANGE_THIS_TO_A_SECURE_RANDOM_STRING/JWT_SECRET=$JWT_SECRET/" .env
    sed -i.bak "s/JWT_REFRESH_SECRET=CHANGE_THIS_TO_A_SECURE_RANDOM_STRING/JWT_REFRESH_SECRET=$JWT_REFRESH_SECRET/" .env
    rm -f .env.bak
    success ".env file created with auto-generated secrets"
fi

# Start Docker services
log ""
log "🐳 Starting Docker services..."

info "Starting PostgreSQL and Redis containers..."
docker-compose up -d postgres redis || error "Failed to start Docker services"
success "Docker services started"

# Wait for services to be healthy
info "Waiting for services to be ready..."
ATTEMPTS=0
MAX_ATTEMPTS=30

while [ $ATTEMPTS -lt $MAX_ATTEMPTS ]; do
    if docker-compose exec -T postgres pg_isready -U postgres &> /dev/null && \
       docker-compose exec -T redis redis-cli ping &> /dev/null; then
        success "Services are healthy"
        break
    fi
    ATTEMPTS=$((ATTEMPTS + 1))
    echo -n "."
    sleep 2
done

if [ $ATTEMPTS -eq $MAX_ATTEMPTS ]; then
    warning "Services may not be fully ready. Continuing anyway..."
fi

# Install dependencies
log ""
log "📦 Installing dependencies..."
npm install || error "Failed to install dependencies"
success "Dependencies installed"

# Generate Prisma client
log ""
log "🔧 Generating Prisma client..."
npm run prisma:generate || error "Failed to generate Prisma client"
success "Prisma client generated"

# Run migrations
log ""
log "🗄️  Running database migrations..."
npm run prisma:migrate || error "Failed to run migrations"
success "Database migrations completed"

# Seed database
if [ "$QUICK_MODE" = false ]; then
    log ""
    log "🌱 Seeding database..."
    read -p "Do you want to seed the database with sample data? (Y/n): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Nn]$ ]]; then
        npm run prisma:seed || warning "Database seeding failed"
        success "Database seeded successfully"
    else
        info "Skipping database seeding"
    fi
else
    info "Quick mode: Skipping database seeding"
fi

# Success message
echo ""
success "Setup completed successfully!"
echo ""
log "📋 Next steps:"
echo "   1. Start the development server: npm run dev"
echo "   2. Access API docs: http://localhost:3000/api-docs"
echo "   3. Access Prisma Studio: npm run prisma:studio"
echo ""
log "💡 Tips:"
echo "   - Your .env file contains auto-generated secrets"
echo "   - For production, update JWT secrets with stronger values"
echo "   - Configure optional services (email, payment gateways) in .env"
echo ""
