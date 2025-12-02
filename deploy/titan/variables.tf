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

variable "labels" {
  description = "The labels to attach to resources created by this module"
  type        = map(string)
}

variable "image" {
  description = "Image for the Docker container to be run"
  type        = string
}

variable "storage_names" {
  description = "Name of Google Cloud Storage buckets to be scanned"
  type        = list(string)
}

variable "pubsub_topic_scan_name" {
  description = "Name of the Pub/Sub topic for scan requests"
  type        = string
}
