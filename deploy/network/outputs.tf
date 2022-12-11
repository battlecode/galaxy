output "dns_records" {
  value = concat(
    [
      for subdomain in local.subdomains : {
        type      = "A",
        subdomain = subdomain,
        rrdatas   = [module.lb.external_ip],
      }
    ],
    [
      {
        type      = "A",
        subdomain = "db.${var.subdomain}",
        rrdatas   = [var.sql_instance_ip],
      },
    ],
  )
}
