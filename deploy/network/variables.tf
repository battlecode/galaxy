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

variable "subdomain" {
  description = "Subomain under which all networking resources belong"
  type        = string
}

variable "cloudrun_service_name" {
  description = "The name of the Cloud Run service to be routed to"
  type        = string
}

variable "sql_instance_ip" {
  description = "The IP address of the Cloud SQL instance"
  type        = string
}

variable "additional_buckets" {
  description = "Specifications for any additional buckets to be routed"
  type        = map(object({
    bucket_name=string,
    enable_cdn=bool,
    cdn_cache_ttl=number,
    subsubdomain=string,
  }))
}
