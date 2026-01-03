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

variable "secret_id" {
  description = "ID of the Secret resource"
  type        = string
}

# variable "network_vpc_id" {
#   description = "ID of Google VPC network resource"
#   type        = string
# }

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

variable "disk_size" {
  description = "disk size(in GB) for the container"
  type        = number
}
