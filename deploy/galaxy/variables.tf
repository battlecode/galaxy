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

variable "secure_lifecycle_rules" {
  description = "List of lifecycle rules for the storage bucket of secured objects"
  type        = list(object({ age=number, storage_class=string }))
}

variable "create_website" {
  description = "Whether to create the website"
  type        = bool
}

variable "siarnaq_image" {
  description = "Image for the Siarnaq Docker container"
  type        = string
}

variable "siarnaq_configuration" {
  description = "Configuration name to use for Siarnaq"
  type        = string
}

variable "database_tier" {
  description = "The tier of the SQL database instance"
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

variable "siarnaq_secrets" {
  description = "Secrets to inject into the Siarnaq secret manager"
  type        = map
}

variable "artifact_registry_name" {
  description = "Name of the Artifact Registry where the build image can be found"
  type        = string
}

variable "titan_image" {
  description = "Image for the Titan Docker container"
  type        = string
}

variable "saturn_image" {
  description = "Image for the Saturn Docker container"
  type        = string
}

variable "max_compile_instances" {
  description = "The maximum allowable number of Saturn compile instances"
  type        = number
}

variable "max_execute_instances" {
  description = "The maximum allowable number of Saturn execute instances"
  type        = number
}

variable "saturn_secrets" {
  description = "Secrets to inject into the Saturn secret manager"
  type        = map
}
