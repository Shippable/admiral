#!/bin/bash -e

export VAULT_IMAGE="drydock/vault:$RELEASE"
export TIMEOUT=180

__cleanup() {
  __process_msg "Removing stale containers"
  sudo docker rm -f $COMPONENT || true
}

__run_vault() {
  __process_msg "Running vault container"
  local data_dir_container="/var/run/vault"
  local config_dir_container="/vault/config"

  local run_cmd="sudo docker run \
    -d \
    -v $VAULT_DATA_DIR:$data_dir_container \
    -v $VAULT_CONFIG_DIR:$config_dir_container \
    --publish $VAULT_PORT:$VAULT_PORT \
    --privileged=true \
    --net=host \
    --name=$COMPONENT \
    $VAULT_IMAGE server
  "

  __process_msg "Executing: $run_cmd"
  eval "$run_cmd"
  __process_msg "Vault container successfully running"
}

__check_vault() {
  __process_msg "Checking vault container status on: $VAULT_HOST:$VAULT_PORT"
  local interval=3
  local counter=0
  local is_booted=false

  while [ $is_booted != true ] && [ $counter -lt $TIMEOUT ]; do
    if nc -vz $VAULT_HOST $VAULT_PORT &>/dev/null; then
      __process_msg "Vault found"
      sleep 5
      is_booted=true
    else
      __process_msg "Waiting for vault to start"
      let "counter = $counter + $interval"
      sleep $interval
    fi
  done
  if [ $is_booted = false ]; then
    __process_error "Failed to boot vault container"
    exit 1
  fi
}

main() {
  __process_msg "Installing vault in a container"
  __cleanup
  __run_vault
  __check_vault
}

main
