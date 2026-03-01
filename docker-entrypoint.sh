#!/bin/sh
set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

log() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

error() {
    echo -e "${RED}[ERROR]${NC} $1" >&2
    exit 1
}

warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

# Wait for database to be ready
wait_for_db() {
    log "Waiting for database to be ready..."
    
    if [ -z "$DATABASE_URL" ]; then
        error "DATABASE_URL environment variable is not set"
    fi
    
    # Extract connection details from DATABASE_URL
    # Format: postgresql://user:password@host:port/database
    DB_HOST=$(echo "$DATABASE_URL" | sed -n 's/.*@\([^:]*\):.*/\1/p')
    DB_PORT=$(echo "$DATABASE_URL" | sed -n 's/.*:\([0-9]*\)\/.*/\1/p')
    
    if [ -z "$DB_HOST" ] || [ -z "$DB_PORT" ]; then
        warning "Could not parse DATABASE_URL, skipping connection check"
        return 0
    fi
    
    MAX_ATTEMPTS=30
    ATTEMPT=0
    
    while [ $ATTEMPT -lt $MAX_ATTEMPTS ]; do
        if nc -z "$DB_HOST" "$DB_PORT" 2>/dev/null; then
            success "Database is ready"
            return 0
        fi
        
        ATTEMPT=$((ATTEMPT + 1))
        log "Attempt $ATTEMPT/$MAX_ATTEMPTS: Database not ready, waiting 2 seconds..."
        sleep 2
    done
    
    error "Database did not become ready after $MAX_ATTEMPTS attempts"
}

# Run Prisma migrations
run_migrations() {
    log "Running database migrations..."
    
    # Check if Prisma is available
    if ! command -v npx > /dev/null 2>&1; then
        error "npx is not available. Cannot run migrations."
    fi
    
    # Run migrations
    if npx prisma migrate deploy; then
        success "Database migrations completed successfully"
    else
        error "Database migrations failed"
    fi
}

# Main execution
main() {
    log "Starting application entrypoint..."
    
    # Wait for database
    wait_for_db
    
    # Run migrations
    run_migrations
    
    # Start the application
    log "Starting Node.js application..."
    exec node src/server.js
}

# Run main function
main "$@"

