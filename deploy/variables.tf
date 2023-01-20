variable "terraform_service_account" {
  description = "Service account email for authenticating Terraform operations"
  type        = string
  default     = "terraform@mitbattlecode.iam.gserviceaccount.com"
}

variable "gcp_project" {
  description = "Google Cloud project where all resources are located"
  type        = string
  default     = "mitbattlecode"
}

variable "gcp_region" {
  description = "Google Cloud region where all resources are located"
  type        = string
  default     = "us-east1"
}

variable "gcp_zone" {
  description = "Google Cloud zone where all zonal resources are located"
  type        = string
  default     = "us-east1-b"
}

variable "labels" {
  description = "The labels to attach to all resources"
  type        = map(string)
  default     = {}
}

variable "siarnaq_secrets_common" {
  description = "Additional secrets to inject into the secret manager"
  type        = map
}

variable "siarnaq_secrets_production" {
  description = "Additional secrets to inject into the secret manager, in production"
  type        = map
}

variable "siarnaq_secrets_staging" {
  description = "Additional secrets to inject into the secret manager, in staging"
  type        = map
}

variable "saturn_secrets_production" {
  description = "Additional secrets to inject into the secret manager, in production"
  type        = map
}

variable "saturn_secrets_staging" {
  description = "Additional secrets to inject into the secret manager, in staging"
  type        = map
}
