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

variable "create_website" {
  description = "Whether to create the website"
  type        = bool
}

variable "siarnaq_image" {
  description = "Image for the Siarnaq Docker container"
  type        = string
}

variable "database_tier" {
  description = "The tier of the SQL database instance"
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
