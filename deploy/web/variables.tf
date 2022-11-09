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

variable "cloudrun_service_name" {
  description = "The name of the Cloud Run service to be routed to"
  type        = string
}

variable "storage_public_name" {
  description = "Name of Google Cloud Storage bucket resource for public artifacts"
  type        = string
}

variable "storage_frontend_name" {
  description = "Name of Google Cloud Storage bucket resource for website frontend"
  type        = string
}
