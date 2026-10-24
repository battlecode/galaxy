variable "name" {
  description = "Name of this Kubernetes cluster"
  type = string
}

variable "gcp_zone" {
  description = "Google Cloud zone where all nodes are located"
  type = string
}
