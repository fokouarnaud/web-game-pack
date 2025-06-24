/**
 * Infrastructure Terraform pour Dialect Game
 * Task 18: Déploiement Production - Phase 4
 */

terraform {
  required_version = ">= 1.0"
  
  required_providers {
    google = {
      source  = "hashicorp/google"
      version = "~> 4.0"
    }
    cloudflare = {
      source  = "cloudflare/cloudflare"
      version = "~> 4.0"
    }
    random = {
      source  = "hashicorp/random"
      version = "~> 3.0"
    }
  }

  backend "gcs" {
    bucket = "dialect-game-terraform-state"
    prefix = "terraform/state"
  }
}

# Variables
variable "project_id" {
  description = "GCP Project ID"
  type        = string
}

variable "region" {
  description = "Primary GCP region"
  type        = string
  default     = "us-central1"
}

variable "environment" {
  description = "Environment (staging/production)"
  type        = string
}

variable "domain" {
  description = "Domain name"
  type        = string
  default     = "dialect-game.com"
}

variable "cloudflare_api_token" {
  description = "Cloudflare API token"
  type        = string
  sensitive   = true
}

variable "cloudflare_zone_id" {
  description = "Cloudflare Zone ID"
  type        = string
}

# Locals
locals {
  app_name = "dialect-game"
  
  regions = [
    "us-central1",
    "europe-west1",
    "asia-southeast1"
  ]
  
  common_labels = {
    app         = local.app_name
    environment = var.environment
    managed_by  = "terraform"
  }
}

# Providers
provider "google" {
  project = var.project_id
  region  = var.region
}

provider "cloudflare" {
  api_token = var.cloudflare_api_token
}

# Random suffix for unique resource names
resource "random_id" "suffix" {
  byte_length = 4
}

# Data sources
data "google_project" "current" {}

# Enable required APIs
resource "google_project_service" "required_apis" {
  for_each = toset([
    "run.googleapis.com",
    "cloudbuild.googleapis.com",
    "artifactregistry.googleapis.com",
    "cloudresourcemanager.googleapis.com",
    "compute.googleapis.com",
    "dns.googleapis.com",
    "monitoring.googleapis.com",
    "logging.googleapis.com",
    "secretmanager.googleapis.com",
    "storage-api.googleapis.com",
    "storage-component.googleapis.com",
    "sql-component.googleapis.com",
    "redis.googleapis.com"
  ])

  service            = each.value
  disable_on_destroy = false
}

# Artifact Registry for Docker images
resource "google_artifact_registry_repository" "docker_repo" {
  location      = var.region
  repository_id = "${local.app_name}-docker"
  description   = "Docker repository for ${local.app_name}"
  format        = "DOCKER"
  
  labels = local.common_labels

  depends_on = [google_project_service.required_apis]
}

# Cloud Storage buckets
resource "google_storage_bucket" "assets" {
  name          = "${local.app_name}-assets-${var.environment}-${random_id.suffix.hex}"
  location      = "US"
  force_destroy = var.environment != "production"
  
  labels = local.common_labels

  uniform_bucket_level_access = true
  
  versioning {
    enabled = var.environment == "production"
  }

  lifecycle_rule {
    condition {
      age = var.environment == "production" ? 365 : 90
    }
    action {
      type = "Delete"
    }
  }

  cors {
    origin          = ["https://${var.domain}", "https://www.${var.domain}"]
    method          = ["GET", "HEAD"]
    response_header = ["*"]
    max_age_seconds = 3600
  }
}

resource "google_storage_bucket" "backups" {
  name          = "${local.app_name}-backups-${var.environment}-${random_id.suffix.hex}"
  location      = "US"
  force_destroy = var.environment != "production"
  
  labels = local.common_labels

  uniform_bucket_level_access = true
  
  versioning {
    enabled = true
  }

  lifecycle_rule {
    condition {
      age = var.environment == "production" ? 2555 : 90 # 7 years for production
    }
    action {
      type = "Delete"
    }
  }
}

# Cloud SQL (PostgreSQL) for production data
resource "google_sql_database_instance" "main" {
  count               = var.environment == "production" ? 1 : 0
  name                = "${local.app_name}-db-${random_id.suffix.hex}"
  database_version    = "POSTGRES_15"
  region              = var.region
  deletion_protection = true

  settings {
    tier                        = "db-custom-2-4096"
    availability_type          = "REGIONAL"
    disk_type                  = "PD_SSD"
    disk_size                  = 100
    disk_autoresize            = true
    disk_autoresize_limit      = 500

    backup_configuration {
      enabled                        = true
      start_time                     = "03:00"
      location                       = var.region
      point_in_time_recovery_enabled = true
      transaction_log_retention_days = 7
      backup_retention_settings {
        retained_backups = 30
      }
    }

    ip_configuration {
      ipv4_enabled    = false
      private_network = google_compute_network.vpc.id
      require_ssl     = true
    }

    database_flags {
      name  = "log_min_duration_statement"
      value = "1000"
    }

    insights_config {
      query_insights_enabled  = true
      query_string_length     = 1024
      record_application_tags = true
      record_client_address   = true
    }

    user_labels = local.common_labels
  }

  depends_on = [google_project_service.required_apis]
}

# Cloud SQL database
resource "google_sql_database" "app_db" {
  count    = var.environment == "production" ? 1 : 0
  name     = local.app_name
  instance = google_sql_database_instance.main[0].name
}

# Redis instance for caching
resource "google_redis_instance" "cache" {
  count          = var.environment == "production" ? 1 : 0
  name           = "${local.app_name}-cache-${random_id.suffix.hex}"
  memory_size_gb = 1
  region         = var.region
  
  redis_version     = "REDIS_7_0"
  display_name     = "${local.app_name} Cache"
  reserved_ip_range = "10.1.0.0/29"
  
  auth_enabled = true
  
  labels = local.common_labels

  depends_on = [google_project_service.required_apis]
}

# VPC Network
resource "google_compute_network" "vpc" {
  name                    = "${local.app_name}-vpc-${var.environment}"
  auto_create_subnetworks = false
  
  depends_on = [google_project_service.required_apis]
}

resource "google_compute_subnetwork" "subnet" {
  count         = length(local.regions)
  name          = "${local.app_name}-subnet-${local.regions[count.index]}"
  ip_cidr_range = "10.${count.index + 2}.0.0/24"
  region        = local.regions[count.index]
  network       = google_compute_network.vpc.id

  private_ip_google_access = true

  log_config {
    aggregation_interval = "INTERVAL_5_SEC"
    flow_sampling       = 0.5
    metadata           = "INCLUDE_ALL_METADATA"
  }
}

# Cloud Run services
resource "google_cloud_run_service" "app" {
  count    = length(local.regions)
  name     = "${local.app_name}-${var.environment}-${local.regions[count.index]}"
  location = local.regions[count.index]

  template {
    metadata {
      labels = local.common_labels
      annotations = {
        "autoscaling.knative.dev/maxScale"         = var.environment == "production" ? "100" : "10"
        "autoscaling.knative.dev/minScale"         = var.environment == "production" ? "3" : "1"
        "run.googleapis.com/cloudsql-instances"    = var.environment == "production" ? google_sql_database_instance.main[0].connection_name : ""
        "run.googleapis.com/execution-environment" = "gen2"
        "run.googleapis.com/network-interfaces"    = jsonencode([{
          network    = google_compute_network.vpc.id
          subnetwork = google_compute_subnetwork.subnet[count.index].id
        }])
      }
    }

    spec {
      containers {
        image = "${var.region}-docker.pkg.dev/${var.project_id}/${google_artifact_registry_repository.docker_repo.repository_id}/dialect-game:latest"
        
        ports {
          container_port = 3000
        }

        resources {
          limits = {
            cpu    = var.environment == "production" ? "2" : "1"
            memory = var.environment == "production" ? "4Gi" : "2Gi"
          }
        }

        env {
          name  = "NODE_ENV"
          value = var.environment
        }

        env {
          name  = "PORT"
          value = "3000"
        }

        env {
          name  = "GCP_PROJECT_ID"
          value = var.project_id
        }

        # Add database connection for production
        dynamic "env" {
          for_each = var.environment == "production" ? [1] : []
          content {
            name  = "DB_HOST"
            value = "/cloudsql/${google_sql_database_instance.main[0].connection_name}"
          }
        }

        dynamic "env" {
          for_each = var.environment == "production" ? [1] : []
          content {
            name  = "REDIS_HOST"
            value = google_redis_instance.cache[0].host
          }
        }
      }

      container_concurrency = var.environment == "production" ? 1000 : 80
      timeout_seconds      = 300
    }
  }

  traffic {
    percent         = 100
    latest_revision = true
  }

  depends_on = [google_project_service.required_apis]
}

# Cloud Run IAM
resource "google_cloud_run_service_iam_member" "public" {
  count    = length(local.regions)
  service  = google_cloud_run_service.app[count.index].name
  location = google_cloud_run_service.app[count.index].location
  role     = "roles/run.invoker"
  member   = "allUsers"
}

# Global Load Balancer
resource "google_compute_global_address" "default" {
  name = "${local.app_name}-${var.environment}-ip"
}

resource "google_compute_managed_ssl_certificate" "default" {
  name = "${local.app_name}-${var.environment}-ssl"

  managed {
    domains = var.environment == "production" ? [var.domain, "www.${var.domain}"] : ["${var.environment}.${var.domain}"]
  }
}

# Network Endpoint Groups
resource "google_compute_region_network_endpoint_group" "cloudrun_neg" {
  count                 = length(local.regions)
  name                  = "${local.app_name}-neg-${local.regions[count.index]}"
  network_endpoint_type = "SERVERLESS"
  region                = local.regions[count.index]
  
  cloud_run {
    service = google_cloud_run_service.app[count.index].name
  }
}

# Backend Service
resource "google_compute_backend_service" "default" {
  name        = "${local.app_name}-${var.environment}-backend"
  description = "Backend service for ${local.app_name}"
  
  port_name   = "http"
  protocol    = "HTTP"
  timeout_sec = 30

  dynamic "backend" {
    for_each = google_compute_region_network_endpoint_group.cloudrun_neg
    content {
      group = backend.value.id
    }
  }

  log_config {
    enable      = true
    sample_rate = var.environment == "production" ? 0.1 : 1.0
  }

  cdn_policy {
    cache_mode                   = "CACHE_ALL_STATIC"
    default_ttl                  = 3600
    max_ttl                      = 86400
    negative_caching            = true
    serve_while_stale           = 86400
    
    cache_key_policy {
      include_host         = true
      include_protocol     = true
      include_query_string = false
    }
  }
}

# URL Map
resource "google_compute_url_map" "default" {
  name            = "${local.app_name}-${var.environment}-urlmap"
  description     = "URL map for ${local.app_name}"
  default_service = google_compute_backend_service.default.id
}

# HTTPS Proxy
resource "google_compute_target_https_proxy" "default" {
  name             = "${local.app_name}-${var.environment}-https-proxy"
  url_map          = google_compute_url_map.default.id
  ssl_certificates = [google_compute_managed_ssl_certificate.default.id]
}

# Global Forwarding Rule
resource "google_compute_global_forwarding_rule" "default" {
  name       = "${local.app_name}-${var.environment}-https"
  target     = google_compute_target_https_proxy.default.id
  port_range = "443"
  ip_address = google_compute_global_address.default.address
}

# HTTP to HTTPS redirect
resource "google_compute_url_map" "https_redirect" {
  name = "${local.app_name}-${var.environment}-https-redirect"

  default_url_redirect {
    https_redirect         = true
    redirect_response_code = "MOVED_PERMANENTLY_DEFAULT"
    strip_query            = false
  }
}

resource "google_compute_target_http_proxy" "https_redirect" {
  name    = "${local.app_name}-${var.environment}-http-proxy"
  url_map = google_compute_url_map.https_redirect.id
}

resource "google_compute_global_forwarding_rule" "https_redirect" {
  name       = "${local.app_name}-${var.environment}-http"
  target     = google_compute_target_http_proxy.https_redirect.id
  port_range = "80"
  ip_address = google_compute_global_address.default.address
}

# Cloudflare DNS
resource "cloudflare_record" "root" {
  zone_id = var.cloudflare_zone_id
  name    = var.environment == "production" ? "@" : var.environment
  value   = google_compute_global_address.default.address
  type    = "A"
  ttl     = 1 # Auto
  
  comment = "Managed by Terraform - ${local.app_name} ${var.environment}"
}

resource "cloudflare_record" "www" {
  count   = var.environment == "production" ? 1 : 0
  zone_id = var.cloudflare_zone_id
  name    = "www"
  value   = google_compute_global_address.default.address
  type    = "A"
  ttl     = 1 # Auto
  
  comment = "Managed by Terraform - ${local.app_name} ${var.environment}"
}

# Monitoring
resource "google_monitoring_notification_channel" "email" {
  display_name = "${local.app_name} ${var.environment} Alerts"
  type         = "email"
  
  labels = {
    email_address = "alerts@dialect-game.com"
  }
}

resource "google_monitoring_alert_policy" "high_error_rate" {
  display_name = "${local.app_name} ${var.environment} - High Error Rate"
  combiner     = "OR"
  
  conditions {
    display_name = "Error rate > 5%"
    
    condition_threshold {
      filter          = "resource.type=\"cloud_run_revision\""
      duration        = "300s"
      comparison      = "COMPARISON_GT"
      threshold_value = 0.05
      
      aggregations {
        alignment_period   = "60s"
        per_series_aligner = "ALIGN_RATE"
      }
    }
  }

  notification_channels = [google_monitoring_notification_channel.email.id]
  
  alert_strategy {
    auto_close = "1800s"
  }
}

# Outputs
output "load_balancer_ip" {
  description = "IP address of the load balancer"
  value       = google_compute_global_address.default.address
}

output "domain_name" {
  description = "Domain name for the application"
  value       = var.environment == "production" ? var.domain : "${var.environment}.${var.domain}"
}

output "cloud_run_urls" {
  description = "URLs of Cloud Run services"
  value       = [for service in google_cloud_run_service.app : service.status[0].url]
}

output "database_connection_name" {
  description = "Database connection name"
  value       = var.environment == "production" ? google_sql_database_instance.main[0].connection_name : null
}

output "redis_host" {
  description = "Redis host"
  value       = var.environment == "production" ? google_redis_instance.cache[0].host : null
  sensitive   = true
}