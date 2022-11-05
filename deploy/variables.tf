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
  default     = "us-east1b"
}
