#!/bin/bash -e

export VAULT_IMAGE="drydock/vault:$RELEASE"

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
  __check_service_connection "$VAULT_HOST" "$VAULT_PORT" "$COMPONENT"
}

main() {
  __process_msg "Installing vault in a container"
  __cleanup
  __run_vault
  __check_vault
}

main
