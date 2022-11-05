output "run_service_name" {
  value = google_cloud_run_service.this.name
}

output "topic_antivirus_name" {
  value = google_pubsub_topic.this["antivirus"].name
}

output "topic_compile_name" {
  value = google_pubsub_topic.this["compile"].name
}

output "topic_execute_name" {
  value = google_pubsub_topic.this["execute"].name
}
