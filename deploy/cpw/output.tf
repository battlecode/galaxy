output "vm_ip" {
  description = "The external IP address of the VM"
  value       = google_compute_address.static.address
}

# Output the command to retrieve the SSH key
output "ssh_command" {
  description = "Command to get the SSH private key from Secret Manager"
  value       = "gcloud secrets versions access latest --secret=${google_secret_manager_secret.ssh_private_key.secret_id} && chmod 600 private_key.pem"
}

output "dns_records" {
  value = {
    type      = "A",
    subdomain = "cpw.",
    rrdatas   = [google_compute_address.static.address],
  }
}
