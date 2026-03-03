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

# Wait for database to be ready (best-effort; migrations will fail if DB is unreachable)
# DATABASE_URL is read from the runtime environment (e.g. Render injects it); no .env file in production.
wait_for_db() {
    log "Waiting for database to be ready..."
    
    if [ -z "$DATABASE_URL" ]; then
        error "DATABASE_URL environment variable is not set"
    fi
    
    # Extract connection details from DATABASE_URL (support postgres:// and postgresql://, with or without port)
    # Strip optional ?query string (use [?] for portable literal ? in sed)
    URL_NO_QUERY=$(echo "$DATABASE_URL" | sed 's/[?].*//')
    # Part after @ is host or host:port
    AFTER_AT=$(echo "$URL_NO_QUERY" | sed -n 's|.*@||p')
    DB_HOST=$(echo "$AFTER_AT" | sed 's/[:/].*//')
    DB_PORT=$(echo "$AFTER_AT" | sed -n 's|.*:\([0-9]*\)/.*|\1|p')
    if [ -z "$DB_PORT" ]; then
        DB_PORT=5432
    fi
    
    if [ -z "$DB_HOST" ]; then
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
    
    # On Render/Docker, nc may not reach internal DB; continue and let Prisma migrate fail with a clear error if DB is down
    warning "Database connection check timed out. Continuing anyway (migrations will fail if DB is unreachable)."
    return 0
}

# Run Prisma migrations
run_migrations() {
    log "Running database migrations..."
    
    if [ -z "$DATABASE_URL" ]; then
        error "DATABASE_URL is not set. On Render: link the database to this service in the dashboard or Blueprint so Render injects the internal URL."
    fi
    
    # On Render, DATABASE_URL must be the internal DB URL, not localhost
    if echo "$DATABASE_URL" | grep -qE 'localhost|127\.0\.0\.1'; then
        error "DATABASE_URL points to localhost. On Render you must use the Internal Database URL from your Postgres service (Dashboard -> ecommerce-db -> Connect -> Internal). Link the database to this web service so Render injects it."
    fi
    
    # Check if Prisma is available
    if ! command -v npx > /dev/null 2>&1; then
        error "npx is not available. Cannot run migrations."
    fi
    
    # Run migrations (non-fatal: continue to start Node so we can see real errors)
    if npx prisma migrate deploy; then
        success "Database migrations completed successfully"
    else
        warning "Database migrations failed; starting app anyway"
    fi
}

# Main execution
main() {
    log "Starting application entrypoint..."
    
    if [ "$SKIP_MIGRATE" = "1" ]; then
        warning "SKIP_MIGRATE=1: skipping database wait and migrations"
    else
        # Wait for database
        wait_for_db
        
        # Run migrations
        run_migrations
    fi
    
    # Start the application
    log "Starting Node.js application..."
    exec node src/server.js
}

# Run main function
main "$@"

