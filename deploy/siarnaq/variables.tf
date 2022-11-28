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

variable "database_backup" {
  description = "Whether to enable backups for the SQL database"
  type        = bool
}

variable "database_authorized_networks" {
  description = "The IP CIDR ranges authorized to access the database via external IP"
  type        = list(string)
}

variable "storage_public_name" {
  description = "Name of Google Cloud Storage bucket resource for public artifacts"
  type        = string
}

variable "storage_secure_name" {
  description = "Name of Google Cloud Storage bucket resource for secure artifacts"
  type        = string
}

variable "additional_secrets" {
  description = "Additional secrets to inject into the secret manager"
  type        = map
}
