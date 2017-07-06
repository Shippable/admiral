#!/bin/bash -e

VAULTVERSION=0.6.0
VAULTDOWNLOAD=https://releases.hashicorp.com/vault/${VAULTVERSION}/vault_${VAULTVERSION}_linux_amd64.zip
VAULTCONFIGDIR=/etc/vault.d
TIMEOUT=60

download_vault() {
  apt-get install -y zip
  echo "Fetching Vault..."
  curl -L $VAULTDOWNLOAD > vault.zip
}

install_vault() {
  echo "Installing Vault..."
  unzip vault.zip -d /usr/local/bin
  chmod 0755 /usr/local/bin/vault
  chown root:root /usr/local/bin/vault
}

create_config_dirs() {
  echo "Creating Vault configuration..."
  mkdir -p $VAULTCONFIGDIR
  chmod 755 $VAULTCONFIGDIR
}

start_vault() {
  service vault start
}

check_vault() {
  echo "Checking vault status on $VAULT_HOST:$VAULT_PORT"
  local interval=3
  local counter=0
  local is_booted=false

  while [ $is_booted != true ] && [ $counter -lt $TIMEOUT ]; do
    if nc -vz $VAULT_HOST $VAULT_PORT &>/dev/null; then
      echo "Vault found"
      sleep 5
      is_booted=true
    else
      echo "Waiting for vault to start"
      let "counter = $counter + $interval"
      sleep $interval
    fi
  done
  if [ $is_booted = false ]; then
    echo "Failed to boot vault"
    echo "Port $VAULT_PORT not available for Secrets."
    exit 1
  fi
}

main() {
  {
    type vault &> /dev/null && echo "Vault already installed, skipping" && return
  }
  pushd /tmp
  download_vault
  install_vault
  create_config_dirs
  start_vault
  check_vault
  popd
}

main
