# Deployment Guide

This document provides comprehensive deployment instructions for the e-commerce backend.

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Local Development](#local-development)
3. [Docker Deployment](#docker-deployment)
4. [Kubernetes Deployment](#kubernetes-deployment)
5. [CI/CD Pipeline](#cicd-pipeline)
6. [Zero-Downtime Deployment](#zero-downtime-deployment)
7. [Database Migrations](#database-migrations)
8. [Secrets Management](#secrets-management)
9. [Monitoring and Observability](#monitoring-and-observability)
10. [Backup and Recovery](#backup-and-recovery)
11. [Troubleshooting](#troubleshooting)

## Prerequisites

- Node.js 18+
- Docker and Docker Compose
- Kubernetes cluster (for K8s deployment)
- kubectl configured
- Terraform (for IaC)
- Cloud provider account (AWS/GCP/Azure)

## Local Development

### 1. Start Services

```bash
docker-compose up -d
```

### 2. Run Migrations

```bash
npm run prisma:migrate
```

### 3. Seed Database

```bash
npm run prisma:seed
```

### 4. Start Application

```bash
npm run dev
```

## Docker Deployment

### Build Image

```bash
docker build -t ecommerce-backend:latest .
```

### Run Container

```bash
docker run -d \
  -p 3000:3000 \
  -e DATABASE_URL=postgresql://user:pass@host:5432/db \
  -e REDIS_URL=redis://host:6379 \
  -e JWT_SECRET=your-secret \
  ecommerce-backend:latest
```

### Docker Compose

```bash
docker-compose -f docker-compose.prod.yml up -d
```

## Kubernetes Deployment

### 1. Create Namespace

```bash
kubectl create namespace ecommerce
```

### 2. Create Secrets

```bash
# Database
kubectl create secret generic db-credentials \
  --from-literal=url=postgresql://user:pass@host:5432/db \
  -n ecommerce

# JWT
kubectl create secret generic jwt-secret \
  --from-literal=secret=your-jwt-secret \
  -n ecommerce

# Redis
kubectl create secret generic redis-credentials \
  --from-literal=url=redis://host:6379 \
  -n ecommerce

# Payment Gateways
kubectl create secret generic payment-gateway-secrets \
  --from-literal=stripe-secret-key=sk_live_... \
  --from-literal=razorpay-key-id=rzp_... \
  --from-literal=razorpay-key-secret=... \
  -n ecommerce
```

### 3. Apply ConfigMap

```bash
kubectl apply -f k8s/base/configmap.yaml
```

### 4. Deploy Application

```bash
kubectl apply -f k8s/base/deployment.yaml
kubectl apply -f k8s/base/service.yaml
kubectl apply -f k8s/base/ingress.yaml
kubectl apply -f k8s/base/hpa.yaml
```

### 5. Verify Deployment

```bash
kubectl get pods -n ecommerce
kubectl get services -n ecommerce
kubectl get ingress -n ecommerce
kubectl logs -f deployment/ecommerce-backend -n ecommerce
```

## CI/CD Pipeline

### GitHub Actions

The CI/CD pipeline automatically:
1. Runs tests on pull requests
2. Builds Docker image on merge
3. Pushes to container registry
4. Deploys to staging/production
5. Runs smoke tests

### Manual Deployment

```bash
# Trigger deployment workflow
gh workflow run deploy.yml -f environment=production
```

## Zero-Downtime Deployment

### Rolling Update Strategy

The deployment uses rolling updates with:
- `maxSurge: 1` - One new pod at a time
- `maxUnavailable: 0` - No downtime
- Readiness probes - Wait for pod to be ready
- Liveness probes - Restart unhealthy pods

### Deployment Process

1. **Pre-deployment Checks**
   - Database migrations tested
   - Health checks passing
   - Backup created

2. **Deployment**
   - New pods start with new image
   - Old pods remain until new pods are ready
   - Traffic gradually shifts to new pods
   - Old pods terminated

3. **Post-deployment**
   - Smoke tests run
   - Monitoring alerts checked
   - Rollback plan ready

### Rollback

```bash
# Rollback to previous version
kubectl rollout undo deployment/ecommerce-backend -n ecommerce

# Rollback to specific revision
kubectl rollout undo deployment/ecommerce-backend --to-revision=2 -n ecommerce
```

## Database Migrations

### Automatic Migrations

Migrations run automatically via init containers on pod startup.

### Manual Migrations

```bash
# Run migrations
kubectl exec -it deployment/ecommerce-backend -n ecommerce -- \
  npx prisma migrate deploy

# Check migration status
kubectl exec -it deployment/ecommerce-backend -n ecommerce -- \
  npx prisma migrate status
```

### Migration Strategy

1. **Backward Compatible**: Migrations must be backward compatible
2. **Tested**: Migrations tested in staging first
3. **Rollback Plan**: Rollback script prepared
4. **Backup**: Database backed up before migration

## Secrets Management

### HashiCorp Vault

```bash
# Install Vault
helm repo add hashicorp https://helm.releases.hashicorp.com
helm install vault hashicorp/vault

# Store secrets
vault kv put secret/ecommerce/database \
  url=postgresql://user:pass@host:5432/db

# Retrieve in Kubernetes
# Use Vault Agent Injector or External Secrets Operator
```

### Cloud Secret Managers

- **AWS**: AWS Secrets Manager
- **GCP**: Secret Manager
- **Azure**: Key Vault

### Kubernetes Secrets

```bash
# Create from file
kubectl create secret generic db-credentials \
  --from-file=credentials.json \
  -n ecommerce

# Create from literal
kubectl create secret generic jwt-secret \
  --from-literal=secret=your-secret \
  -n ecommerce
```

## Monitoring and Observability

### Prometheus Metrics

Metrics endpoint: `/metrics`

```bash
# View metrics
curl http://api.yourdomain.com/metrics
```

### Health Checks

- **Liveness**: `/health` - Application is running
- **Readiness**: `/ready` - Application is ready to serve traffic
- **Startup**: `/health` - Application has started

### Logging

```bash
# View logs
kubectl logs -f deployment/ecommerce-backend -n ecommerce

# View logs from specific pod
kubectl logs -f <pod-name> -n ecommerce

# View logs with timestamps
kubectl logs -f deployment/ecommerce-backend -n ecommerce --timestamps
```

### Alerting

Configure alerts for:
- High error rates
- Slow response times
- Resource exhaustion
- Database connection failures
- Payment gateway failures

## Backup and Recovery

### Database Backups

```bash
# Automated backups (configured in database module)
# Manual backup
kubectl exec -it deployment/ecommerce-backend -n ecommerce -- \
  pg_dump $DATABASE_URL > backup.sql
```

### Restore Database

```bash
# Restore from backup
kubectl exec -i deployment/ecommerce-backend -n ecommerce -- \
  psql $DATABASE_URL < backup.sql
```

### Disaster Recovery

1. **RPO (Recovery Point Objective)**: 1 hour
2. **RTO (Recovery Time Objective)**: 4 hours
3. **Backup Frequency**: Every 6 hours
4. **Retention**: 30 days

## Troubleshooting

### Pod Not Starting

```bash
# Check pod status
kubectl describe pod <pod-name> -n ecommerce

# Check logs
kubectl logs <pod-name> -n ecommerce

# Check events
kubectl get events -n ecommerce --sort-by='.lastTimestamp'
```

### Database Connection Issues

```bash
# Test database connection
kubectl exec -it deployment/ecommerce-backend -n ecommerce -- \
  npx prisma db pull

# Check database credentials
kubectl get secret db-credentials -n ecommerce -o yaml
```

### High Memory Usage

```bash
# Check resource usage
kubectl top pods -n ecommerce

# Increase memory limits
kubectl edit deployment ecommerce-backend -n ecommerce
```

### Slow Response Times

1. Check database query performance
2. Review Redis cache hit rates
3. Check external API response times
4. Review application logs for bottlenecks

## Best Practices

1. **Always test in staging first**
2. **Use feature flags for gradual rollouts**
3. **Monitor metrics during deployment**
4. **Have rollback plan ready**
5. **Backup database before migrations**
6. **Use blue-green deployment for major releases**
7. **Implement canary deployments for critical changes**
8. **Monitor error rates and response times**
9. **Set up alerts for critical issues**
10. **Document all deployment procedures**


