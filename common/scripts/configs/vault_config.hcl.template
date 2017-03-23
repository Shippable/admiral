backend "postgresql" {
  connection_url = "postgres://apiuser:testing1234@172.17.42.1:5432/shipdb?sslmode=disable"
}

listener "tcp" {
  address = "0.0.0.0:8200"
  tls_disable = 1
}

max_lease_ttl = "720h"
