output "run_service_name" {
  value = google_cloud_run_service.this.name
}

output "sql_instance_ip" {
  value = google_sql_database_instance.this.first_ip_address
}

output "topic_compile_name" {
  value = google_pubsub_topic.this["compile"].name
}

output "topic_execute_name" {
  value = google_pubsub_topic.this["execute"].name
}
