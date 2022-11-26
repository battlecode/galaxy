output "artifact_image" {
  value = {
    for k in ["siarnaq", "titan", "saturn"] :
      k => "${google_artifact_registry_repository.this.location}-docker.pkg.dev/${google_artifact_registry_repository.this.project}/${google_artifact_registry_repository.this.repository_id}/${k}"
  }
}
