#!/bin/bash -e

export COMPONENT="master"
export MASTER_DATA_DIR="$RUNTIME_DIR/$COMPONENT/data"
export MASTER_CONFIG_DIR="$CONFIG_DIR/$COMPONENT"
export SCRIPTS_DIR="$SCRIPTS_DIR"
export LOGS_FILE="$RUNTIME_DIR/logs/$COMPONENT.log"
export SCRIPTS_DIR_REMOTE="/tmp/shippable"

## Write logs of this script to component specific file
exec &> >(tee -a "$LOGS_FILE")

__validate_master_envs() {
  __process_msg "Initializing redis environment variables"
  __process_msg "SCRIPTS_DIR: $SCRIPTS_DIR"
  __process_msg "MASTER_HOST: $MASTER_HOST"
  __process_msg "MASTER_PORT: $MASTER_PORT"
  __process_msg "ACCESS_KEY: ${#ACCESS_KEY}"
  __process_msg "SECRET_KEY: ${#SECRET_KEY}"
  __process_msg "NO_VERIFY_SSL: $NO_VERIFY_SSL"
  __process_msg "ARCHITECTURE: $ARCHITECTURE"
  __process_msg "OPERATING_SYSTEM: $OPERATING_SYSTEM"
  __process_msg "INSTALLED_DOCKER_VERSION: $INSTALLED_DOCKER_VERSION"
}

__init_swarm_master() {
  __process_msg "Initializing swarm cluster"
  if [ "$MASTER_HOST" == "localhost" ]; then
    ## swarm does not accept 'localhost' as the ip address of master
    MASTER_HOST="127.0.0.1"
  fi
  sudo docker swarm init --advertise-addr $MASTER_HOST || true
}

__copy_configs() {
  __process_msg "Copying master configuration files"

  if [ ! -d "$MASTER_CONFIG_DIR" ]; then
    __process_msg "Creating config directory $MASTER_CONFIG_DIR"
    sudo mkdir -p $MASTER_CONFIG_DIR
  else
    __process_msg "Config directory already present: $MASTER_CONFIG_DIR"
  fi

  local credentials_template="$SCRIPTS_DIR/configs/credentials.template"
  local credentials_file="$MASTER_CONFIG_DIR/credentials"

  sed "s#{{ACCESS_KEY}}#$ACCESS_KEY#g" $credentials_template > $credentials_file
  sed -i "s#{{SECRET_KEY}}#$SECRET_KEY#g" $credentials_file
}

main() {
  __process_marker "Installing swarm master"
  if [ "$IS_INSTALLED" == true ]; then
    __process_msg "Swarm master already installed, skipping"
  else
    local proxy_script_name="configureProxy.sh"
    local proxy_config_script="$SCRIPTS_DIR/$proxy_script_name"
    __copy_script_remote "$MASTER_HOST" "$proxy_config_script" "$SCRIPTS_DIR_REMOTE"
    local proxy_config_install_cmd="SHIPPABLE_HTTP_PROXY=$SHIPPABLE_HTTP_PROXY \
      SHIPPABLE_HTTPS_PROXY=$SHIPPABLE_HTTPS_PROXY \
      SHIPPABLE_NO_PROXY=$SHIPPABLE_NO_PROXY \
      $SCRIPTS_DIR_REMOTE/$proxy_script_name"
    __exec_cmd_remote "$MASTER_HOST" "$proxy_config_install_cmd"

    __copy_configs

    local node_update_script="$SCRIPTS_DIR/$ARCHITECTURE/$OPERATING_SYSTEM/remote/setupNode.sh"
    __copy_script_remote "$MASTER_HOST" "$node_update_script" "$SCRIPTS_DIR_REMOTE"
    __exec_cmd_remote "$MASTER_HOST" "$SCRIPTS_DIR_REMOTE/setupNode.sh"

    __process_msg "copying ecr credentials file"
    local credentials_file="$MASTER_CONFIG_DIR/credentials"
    __copy_script_remote "$MASTER_HOST" "$credentials_file" "/root/.aws"

    __pull_images_master
    __validate_master_envs
    __init_swarm_master
  fi
  __process_msg "Swarm master installed successfully"
}

main
