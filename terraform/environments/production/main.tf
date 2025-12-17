terraform {
  required_version = ">= 1.0"
  
  required_providers {
    kubernetes = {
      source  = "hashicorp/kubernetes"
      version = "~> 2.20"
    }
    helm = {
      source  = "hashicorp/helm"
      version = "~> 2.10"
    }
    google = {
      source  = "hashicorp/google"
      version = "~> 5.0"
    }
  }

  backend "gcs" {
    bucket = "ecommerce-terraform-state"
    prefix = "production"
  }
}

provider "google" {
  project = var.project_id
  region  = var.region
}

provider "kubernetes" {
  host                   = module.gke.endpoint
  token                  = data.google_client_config.default.access_token
  cluster_ca_certificate = base64decode(module.gke.ca_certificate)
}

provider "helm" {
  kubernetes {
    host                   = module.gke.endpoint
    token                  = data.google_client_config.default.access_token
    cluster_ca_certificate = base64decode(module.gke.ca_certificate)
  }
}

data "google_client_config" "default" {}

# GKE Cluster
module "gke" {
  source = "../../modules/kubernetes"

  cluster_name    = var.cluster_name
  region          = var.region
  node_count      = var.node_count
  machine_type    = var.machine_type
  min_node_count  = 3
  max_node_count  = 10
  enable_autoscaling = true
}

# Cloud SQL (PostgreSQL)
module "database" {
  source = "../../modules/database"

  instance_name = "${var.cluster_name}-db"
  database_name = "ecommerce"
  region        = var.region
  tier          = "db-custom-2-7680"
  backup_enabled = true
  backup_start_time = "03:00"
}

# Memorystore (Redis)
module "redis" {
  source = "../../modules/redis"

  instance_id   = "${var.cluster_name}-redis"
  memory_size_gb = 1
  region        = var.region
  tier          = "STANDARD_HA"
}

# Monitoring
module "monitoring" {
  source = "../../modules/monitoring"

  project_id     = var.project_id
  cluster_name   = var.cluster_name
  enable_alerting = true
}

# Outputs
output "cluster_endpoint" {
  value = module.gke.endpoint
}

output "database_connection_name" {
  value = module.database.connection_name
}

output "redis_host" {
  value = module.redis.host
}


