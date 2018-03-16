#!/bin/bash -e

export COMPONENT="workers"
export WORKERS_DATA_DIR="$RUNTIME_DIR/$COMPONENT/data"
export WORKERS_CONFIG_DIR="$CONFIG_DIR/$COMPONENT"
export SCRIPTS_DIR="$SCRIPTS_DIR"
export LOGS_FILE="$RUNTIME_DIR/logs/$COMPONENT.log"
export SCRIPTS_DIR_REMOTE="/tmp/shippable"

## Write logs of this script to component specific file
exec &> >(tee -a "$LOGS_FILE")

__validate_worker_envs() {
  __process_msg "Initializing worker environment variables"
  __process_msg "RELEASE: $RELEASE"
  __process_msg "SCRIPTS_DIR: $SCRIPTS_DIR"
  __process_msg "WORKER_HOST: $WORKER_HOST"
  __process_msg "WORKER_PORT: $WORKER_PORT"
  __process_msg "MASTER_HOST: $MASTER_HOST"
  __process_msg "MASTER_PORT: $MASTER_PORT"
  __process_msg "WORKER_JOIN_TOKEN: $WORKER_JOIN_TOKEN"
  __process_msg "ACCESS_KEY: ${#ACCESS_KEY}"
  __process_msg "SECRET_KEY: ${#SECRET_KEY}"
  __process_msg "NO_VERIFY_SSL: $NO_VERIFY_SSL"
  __process_msg "ARCHITECTURE: $ARCHITECTURE"
  __process_msg "OPERATING_SYSTEM: $OPERATING_SYSTEM"
  __process_msg "INSTALLED_DOCKER_VERSION: $INSTALLED_DOCKER_VERSION"
  __process_msg "SHIPPABLE_HTTP_PROXY: $SHIPPABLE_HTTP_PROXY"
  __process_msg "SHIPPABLE_HTTPS_PROXY: $SHIPPABLE_HTTPS_PROXY"
  __process_msg "SHIPPABLE_NO_PROXY: $SHIPPABLE_NO_PROXY"
}

__validate_worker_mounts() {
  __process_msg "Validating worker mounts"
  if [ ! -d "$WORKERS_DATA_DIR" ]; then
    __process_msg "Creating data directory $WORKERS_DATA_DIR"
    sudo mkdir -p $WORKERS_DATA_DIR
  else
    __process_msg "Data directory already present: $WORKERS_DATA_DIR"
  fi

  if [ ! -d "$WORKERS_CONFIG_DIR" ]; then
    __process_msg "Creating config directory $WORKERS_CONFIG_DIR"
    sudo mkdir -p $WORKERS_CONFIG_DIR
  else
    __process_msg "Config directory already present: $WORKERS_CONFIG_DIR"
  fi
}

__copy_configs() {
  __process_msg "Copying worker configuration files"

  local credentials_template="$SCRIPTS_DIR/configs/credentials.template"
  local credentials_file="$WORKERS_CONFIG_DIR/credentials"

  sed "s#{{ACCESS_KEY}}#$ACCESS_KEY#g" $credentials_template > $credentials_file
  sed -i "s#{{SECRET_KEY}}#$SECRET_KEY#g" $credentials_file
}

main() {
  __process_marker "Installing swarm worker"
  local script_name="installWorker.sh"
  if [ "$IS_INSTALLED" == true ]; then
    __process_msg "Swarm worker already installed, skipping"
  else
    __validate_worker_envs
    __validate_worker_mounts

    if [ "$MASTER_HOST" == "$WORKER_HOST" ]; then
      __process_msg "Installing worker on admiral node"
      source "$SCRIPTS_DIR/docker/$script_name"
    else
      local script_path="$SCRIPTS_DIR/$ARCHITECTURE/$OPERATING_SYSTEM/remote/$script_name"
      __check_connection "$WORKER_HOST"

      local proxy_script_name="configureProxy.sh"
      local proxy_config_script="$SCRIPTS_DIR/$proxy_script_name"
      __copy_script_remote "$WORKER_HOST" "$proxy_config_script" "$SCRIPTS_DIR_REMOTE"
      local proxy_config_install_cmd="SHIPPABLE_HTTP_PROXY=$SHIPPABLE_HTTP_PROXY \
        SHIPPABLE_HTTPS_PROXY=$SHIPPABLE_HTTPS_PROXY \
        SHIPPABLE_NO_PROXY=$SHIPPABLE_NO_PROXY \
        $SCRIPTS_DIR_REMOTE/$proxy_script_name"
      __exec_cmd_remote "$WORKER_HOST" "$proxy_config_install_cmd"

      __copy_configs

      local node_update_script="$SCRIPTS_DIR/$ARCHITECTURE/$OPERATING_SYSTEM/remote/setupNode.sh"
      __copy_script_remote "$WORKER_HOST" "$node_update_script" "$SCRIPTS_DIR_REMOTE"
      __exec_cmd_remote "$WORKER_HOST" "$SCRIPTS_DIR_REMOTE/setupNode.sh"

      __process_msg "copying ecr credentials file"
      local credentials_file="$WORKERS_CONFIG_DIR/credentials"
      __copy_script_remote "$WORKER_HOST" "$credentials_file" "/root/.aws"

      __copy_script_remote "$WORKER_HOST" "$script_path" "$SCRIPTS_DIR_REMOTE"
      local worker_install_cmd="WORKER_HOST=$WORKER_HOST \
        WORKER_JOIN_TOKEN=$WORKER_JOIN_TOKEN \
        WORKER_PORT=$WORKER_PORT \
        MASTER_HOST=$MASTER_HOST \
        RELEASE=$RELEASE \
        NO_VERIFY_SSL=$NO_VERIFY_SSL \
        ARCHITECTURE=$ARCHITECTURE \
        OPERATING_SYSTEM=$OPERATING_SYSTEM \
        INSTALLED_DOCKER_VERSION=$INSTALLED_DOCKER_VERSION \
        SHIPPABLE_HTTP_PROXY=$SHIPPABLE_HTTP_PROXY \
        SHIPPABLE_HTTPS_PROXY=$SHIPPABLE_HTTPS_PROXY \
        SHIPPABLE_NO_PROXY=$SHIPPABLE_NO_PROXY \
        $SCRIPTS_DIR_REMOTE/$script_name"
      __exec_cmd_remote "$WORKER_HOST" "$worker_install_cmd"

      for image in "${SERVICE_IMAGES[@]}"; do
        image="$PRIVATE_IMAGE_REGISTRY/$image:$RELEASE"
        __process_msg "Pulling $image on $WORKER_HOST"
        local pull_cmd="sudo docker pull $image"
        __exec_cmd_remote "$WORKER_HOST" "$pull_cmd"
      done
    fi
  fi
  __process_msg "Swarm worker installed successfully"
}

main
