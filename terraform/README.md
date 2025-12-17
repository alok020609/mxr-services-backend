# Infrastructure as Code (Terraform)

This directory contains Terraform configurations for provisioning cloud infrastructure.

## Structure

```
terraform/
├── modules/           # Reusable modules
│   ├── kubernetes/
│   ├── database/
│   ├── redis/
│   └── monitoring/
├── environments/      # Environment-specific configs
│   ├── dev/
│   ├── staging/
│   └── production/
└── README.md
```

## Prerequisites

- Terraform >= 1.0
- Cloud provider CLI configured (AWS/GCP/Azure)
- kubectl configured

## Quick Start

### 1. Initialize Terraform

```bash
cd terraform/environments/production
terraform init
```

### 2. Plan Changes

```bash
terraform plan
```

### 3. Apply Infrastructure

```bash
terraform apply
```

## Modules

### Kubernetes Cluster

Creates and configures Kubernetes cluster.

```hcl
module "kubernetes" {
  source = "../../modules/kubernetes"
  
  cluster_name = "ecommerce-cluster"
  node_count   = 3
  node_size    = "standard-4"
}
```

### Database

Creates managed PostgreSQL database.

```hcl
module "database" {
  source = "../../modules/database"
  
  db_name     = "ecommerce"
  db_version  = "15"
  instance_tier = "db-f1-micro"
  backup_enabled = true
}
```

### Redis

Creates managed Redis instance.

```hcl
module "redis" {
  source = "../../modules/redis"
  
  instance_id = "ecommerce-redis"
  memory_size = "1GB"
  tier        = "basic"
}
```

### Monitoring

Sets up monitoring and logging.

```hcl
module "monitoring" {
  source = "../../modules/monitoring"
  
  project_id = var.project_id
  enable_alerting = true
}
```

## Environment Variables

Create `terraform.tfvars`:

```hcl
project_id = "your-project-id"
region     = "us-central1"
environment = "production"
cluster_name = "ecommerce-cluster"
```

## State Management

Terraform state is stored remotely:

- AWS: S3 + DynamoDB
- GCP: GCS
- Azure: Storage Account

## Secrets Management

Use Terraform with Vault or cloud secret managers:

```hcl
data "vault_generic_secret" "db_credentials" {
  path = "secret/database"
}
```

## Outputs

After applying, get outputs:

```bash
terraform output
```

## Destroy

To destroy infrastructure:

```bash
terraform destroy
```

## Best Practices

1. **State Locking**: Enable state locking to prevent concurrent modifications
2. **Remote State**: Store state remotely for team collaboration
3. **Modules**: Use modules for reusable components
4. **Variables**: Use variables for environment-specific values
5. **Outputs**: Define outputs for important values
6. **Versioning**: Pin provider versions
7. **Backend**: Configure remote backend
8. **Workspaces**: Use workspaces for multiple environments


