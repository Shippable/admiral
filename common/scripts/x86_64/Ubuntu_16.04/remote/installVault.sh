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
  systemctl status vault.service
}

# accepts arguments $host $port $serviceName $timeout
__check_service_connection() {
  local host=$1
  local port=$2
  local service=$3
  local timeout=$4
  local interval=3
  local counter=0
  local service_booted=false

  while [ $service_booted != true ] && [ $counter -lt $timeout ]; do
    if nc -vz $host $port &>/dev/null; then
      echo "$service found"
      sleep 5
      service_booted=true
    else
      echo "Waiting for $service to start"
      let "counter = $counter + $interval"
      sleep $interval
    fi
  done
  if [ $service_booted = false ]; then
    echo "Could not detect $service container for host:$host, port:$port"
    exit 1
  fi
}

check_vault() {
  echo "Checking vault status on $VAULT_HOST:$VAULT_PORT"
  __check_service_connection "$VAULT_HOST" "$VAULT_PORT" "vault" "$TIMEOUT"
}

activate_vault() {
  echo "Activating vault service so that it starts on machine reboots"
  systemctl enable vault.service
}

main() {
  check_vault=""
  {
    type vault &> /dev/null
    if nc -vz $VAULT_HOST $VAULT_PORT &>/dev/null; then
      check_vault="vault up"
    fi
  } || true
  if [ ! -z "$check_vault" ]; then
    echo "Vault already installed, skipping"
    return
  fi
  pushd /tmp
  download_vault
  install_vault
  create_config_dirs
  start_vault
  check_vault
  activate_vault
  popd
}

main
