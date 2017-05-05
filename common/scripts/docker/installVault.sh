#!/bin/bash -e

export COMPONENT="secrets"
export VAULT_DATA_DIR="$RUNTIME_DIR/$COMPONENT/data"
export VAULT_CONFIG_DIR="$CONFIG_DIR/$COMPONENT"
export VAULT_MOUNTS="$VAULT_MOUNTS"
export VAULT_IMAGE="drydock/vault:$RELEASE"
export SCRIPTS_DIR="$SCRIPTS_DIR"
export DB_USER=apiuser
export DB_NAME=shipdb
export LOGS_FILE="$RUNTIME_DIR/logs/$COMPONENT.log"
export TIMEOUT=120

## Write logs of this script to component specific file
exec &> >(tee -a "$LOGS_FILE")

__validate_vault_envs() {
  __process_msg "Initializing vault environment variables"
  __process_msg "VAULT_IMAGE: $VAULT_IMAGE"
  __process_msg "SCRIPTS_DIR: $SCRIPTS_DIR"
  __process_msg "VAULT_DATA_DIR: $VAULT_DATA_DIR"
  __process_msg "VAULT_CONFIG_DIR: $VAULT_CONFIG_DIR"
  __process_msg "VAULT_HOST: $VAULT_HOST"
  __process_msg "VAULT_PORT: $VAULT_PORT"
  __process_msg "DBHOST: $DBHOST"
  __process_msg "DBPORT: $DBPORT"
  __process_msg "DBNAME: $DBNAME"
  __process_msg "DBUSERNAME: $DBUSERNAME"
  __process_msg "DBPASSWORD: $DBPASSWORD"
  __process_msg "LOGS_FILE:$LOGS_FILE"
}

__cleanup() {
  __process_msg "Removing stale containers"
  sudo docker rm -f $COMPONENT || true
}

__validate_vault_mounts() {
  __process_msg "Validating vault mounts"
  if [ ! -d "$VAULT_DATA_DIR" ]; then
    __process_msg "Creating data directory $VAULT_DATA_DIR"
    sudo mkdir -p $VAULT_DATA_DIR
  else
    __process_msg "Data directory already present: $VAULT_DATA_DIR"
  fi

  if [ ! -d "$VAULT_CONFIG_DIR" ]; then
    __process_msg "Creating config directory $VAULT_CONFIG_DIR"
    sudo mkdir -p $VAULT_CONFIG_DIR
  else
    __process_msg "Config directory already present: $VAULT_CONFIG_DIR"
  fi

  sudo mkdir -p $VAULT_CONFIG_DIR/scripts
}

__update_vault_config() {
  __process_msg "Generating vault config"
  cp -vr $SCRIPTS_DIR/configs/vault_config.hcl.template $VAULT_CONFIG_DIR/config.hcl
  cp -vr $SCRIPTS_DIR/configs/policy.hcl $VAULT_CONFIG_DIR/scripts/policy.hcl
}

__update_vault_creds() {
  __process_msg "Updating vault to database connection credentials"

  __process_msg "Updating db host"
  sed -i 's#{{DBHOST}}#'$DBHOST'#g' $VAULT_CONFIG_DIR/config.hcl

  __process_msg "Updating db port"
  sed -i 's#{{DBPORT}}#'$DBPORT'#g' $VAULT_CONFIG_DIR/config.hcl

  __process_msg "Updating db name"
  sed -i 's#{{DBNAME}}#'$DBNAME'#g' $VAULT_CONFIG_DIR/config.hcl

  __process_msg "Updating db password"
  sed -i 's#{{DBPASSWORD}}#'$DBPASSWORD'#g' $VAULT_CONFIG_DIR/config.hcl

  __process_msg "Updating db username"
  sed -i 's#{{DBUSERNAME}}#'$DBUSERNAME'#g' $VAULT_CONFIG_DIR/config.hcl
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
  __process_marker "Booting Vault"
  if [ "$IS_INSTALLED" == true ]; then
    __process_msg "Vault already installed, skipping"
  else
    __process_msg "Vault not installed"
    __validate_vault_envs
    __cleanup
    __validate_vault_mounts
    __update_vault_config
    __update_vault_creds
    __run_vault
    __check_vault
  fi
  __process_msg "Vault container successfully running"
}

main
