variable "name" {
  description = "Name of this service"
  type        = string
}

variable "gcp_project" {
  description = "Google Cloud project where all resources are located"
  type        = string
}

variable "gcp_region" {
  description = "Google Cloud region where all resources are located"
  type        = string
}

variable "gcp_zone" {
  description = "Google Cloud zone where all zonal resources are located"
  type        = string
}

variable "create_cloud_run" {
  description = "Whether to create the Cloud Run service for siarnaq"
  type        = bool
}

variable "image" {
  description = "Image for the Docker container to be run"
  type        = string
}

variable "database_tier" {
  description = "The tier of the SQL database instance"
  type        = string
}

variable "database_name" {
  description = "The name of the SQL database"
  type        = string
}

variable "database_user" {
  description = "The username to authenticate to the SQL database"
  type        = string
}

variable "storage_public_name" {
  description = "Name of Google Cloud Storage bucket resource for public artifacts"
  type        = string
}

variable "storage_secure_name" {
  description = "Name of Google Cloud Storage bucket resource for secure artifacts"
  type        = string
}
