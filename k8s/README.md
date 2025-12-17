# Kubernetes Deployment

This directory contains Kubernetes manifests for deploying the e-commerce backend to production.

## Structure

```
k8s/
├── base/              # Base Kubernetes manifests
│   ├── deployment.yaml
│   ├── service.yaml
│   ├── configmap.yaml
│   ├── secrets.yaml
│   └── ingress.yaml
├── overlays/          # Environment-specific overlays
│   ├── dev/
│   ├── staging/
│   └── production/
├── helm/              # Helm charts (alternative)
└── README.md
```

## Prerequisites

- Kubernetes cluster (v1.24+)
- kubectl configured
- Helm 3.x (optional, for Helm charts)
- Docker registry access

## Quick Start

### 1. Create Namespace

```bash
kubectl create namespace ecommerce
```

### 2. Create Secrets

```bash
# Database credentials
kubectl create secret generic db-credentials \
  --from-literal=username=postgres \
  --from-literal=password=your-password \
  --namespace=ecommerce

# JWT secret
kubectl create secret generic jwt-secret \
  --from-literal=secret=your-jwt-secret \
  --namespace=ecommerce

# Redis URL
kubectl create secret generic redis-credentials \
  --from-literal=url=redis://redis-service:6379 \
  --namespace=ecommerce
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
```

### 5. Verify Deployment

```bash
kubectl get pods -n ecommerce
kubectl get services -n ecommerce
kubectl get ingress -n ecommerce
```

## Environment-Specific Deployments

### Development

```bash
kubectl apply -k k8s/overlays/dev
```

### Staging

```bash
kubectl apply -k k8s/overlays/staging
```

### Production

```bash
kubectl apply -k k8s/overlays/production
```

## Zero-Downtime Deployment

The deployment uses:
- Rolling updates strategy
- Readiness and liveness probes
- Pod disruption budgets
- Horizontal Pod Autoscaler (HPA)

## Scaling

### Manual Scaling

```bash
kubectl scale deployment ecommerce-backend --replicas=5 -n ecommerce
```

### Auto Scaling

HPA automatically scales based on CPU/memory usage:

```bash
kubectl apply -f k8s/base/hpa.yaml
```

## Monitoring

- Prometheus metrics endpoint: `/metrics`
- Health check endpoint: `/health`
- Readiness endpoint: `/ready`

## Secrets Management

For production, use:
- HashiCorp Vault
- AWS Secrets Manager
- Azure Key Vault
- Google Secret Manager

See `secrets-management.md` for details.

## Database Migrations

Database migrations run automatically on pod startup using init containers.

See `migrations.md` for details.

## Troubleshooting

### View Logs

```bash
kubectl logs -f deployment/ecommerce-backend -n ecommerce
```

### Describe Pod

```bash
kubectl describe pod <pod-name> -n ecommerce
```

### Exec into Pod

```bash
kubectl exec -it <pod-name> -n ecommerce -- /bin/sh
```

## Backup and Recovery

See `backup-recovery.md` for backup strategies and disaster recovery procedures.


