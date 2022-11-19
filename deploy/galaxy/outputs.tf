output "run_service_name" {
  value = module.siarnaq.run_service_name
}

output "sql_instance_ip" {
  value = module.siarnaq.sql_instance_ip
}

output "storage_public_name" {
  value = google_storage_bucket.public.name
}

output "storage_secure_name" {
  value = google_storage_bucket.secure.name
}

output "storage_frontend_name" {
  value = var.create_website ? google_storage_bucket.frontend[0].name : null
}
