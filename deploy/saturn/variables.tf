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

variable "pubsub_topic_name" {
  description = "Name of Google Cloud Pubsub resource where tasks are pushed"
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

variable "artifact_registry_name" {
  description = "Name of the Artifact Registry where the build image can be found"
  type        = string
}

variable "storage_releases_name" {
  description = "Name of Google Cloud Storage bucket resource for game releases"
  type        = string
}

variable "secret_id" {
  description = "ID of the Secret resource"
  type        = string
}

variable "network_vpc_id" {
  description = "ID of Google VPC network resource"
  type        = string
}

variable "subnetwork_ip_cidr" {
  description = "Range of internal IP addresses to be allocated to this service"
  type        = string
}

variable "machine_type" {
  description = "Type of instance to use in the worker pool"
  type        = string
}

variable "image" {
  description = "Image for the Docker container to be run"
  type        = string
}

variable "max_instances" {
  description = "Maximum allowable size of the worker pool"
  type        = number
}

variable "min_instances" {
  description = "Minimum allowable size of the worker pool"
  type        = number
}

variable "load_ratio" {
  description = "Target ratio between queue size to worker pool node count"
  type        = number
}
