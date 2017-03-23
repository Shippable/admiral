# This provides access to shippable namespace
path "shippable/*" {
  capabilities = ["create", "read", "update", "delete", "list"]
}

# This is required for single-access short lived tokens
path "cubbyhole/*" {
  capabilities = ["create", "read", "update", "delete", "list"]
}

# Allow renewal of leases for secrets
path "sys/renew/*" {
  capabilities = ["create", "read", "update", "delete", "list"]
}

# Allow complete access on policy creation
path "/sys/policy/*" {
  capabilities = ["create", "read", "update", "delete", "list", "sudo"]
}

# Allow complete access on token creation
path "/auth/token/*" {
  capabilities = ["create", "read", "update", "delete", "list", "sudo"]
}
