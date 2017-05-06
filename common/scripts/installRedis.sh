#!/bin/bash -e

export COMPONENT="redis"
export REDIS_DATA_DIR="$RUNTIME_DIR/$COMPONENT/data"
export REDIS_CONFIG_DIR="$CONFIG_DIR/$COMPONENT"
export SCRIPTS_DIR="$SCRIPTS_DIR"
export LOGS_FILE="$RUNTIME_DIR/logs/$COMPONENT.log"
export SCRIPTS_DIR_REMOTE="/tmp/shippable"

## Write logs of this script to component specific file
exec &> >(tee -a "$LOGS_FILE")

__validate_redis_envs() {
  __process_msg "Initializing redis environment variables"
  __process_msg "REDIS_IMAGE: $REDIS_IMAGE"
  __process_msg "SCRIPTS_DIR: $SCRIPTS_DIR"
  __process_msg "STATE_DATA_DIR: $STATE_DATA_DIR"
  __process_msg "STATE_CONFIG_DIR: $STATE_CONFIG_DIR"
  __process_msg "REDIS_HOST: $REDIS_HOST"
  __process_msg "REDIS_PORT: $REDIS_PORT"
}

__validate_redis_mounts() {
  __process_msg "Validating redis mounts"
  if [ ! -d "$REDIS_DATA_DIR" ]; then
    __process_msg "Creating data directory $REDIS_DATA_DIR"
    sudo mkdir -p $REDIS_DATA_DIR
  else
    __process_msg "Data directory already present: $REDIS_DATA_DIR"
  fi

  if [ ! -d "$REDIS_CONFIG_DIR" ]; then
    __process_msg "Creating config directory $REDIS_CONFIG_DIR"
    sudo mkdir -p $REDIS_CONFIG_DIR
  else
    __process_msg "Config directory already present: $REDIS_CONFIG_DIR"
  fi

  sudo mkdir -p $REDIS_CONFIG_DIR/scripts
}

__update_redis_config() {
  __process_msg "Updating redis config files"
  cp -vr $SCRIPTS_DIR/configs/redis.conf $REDIS_CONFIG_DIR/redis.conf
}

__copy_configs() {
  __process_msg "Copying redis config files"

  local redis_config="$REDIS_CONFIG_DIR/redis.conf"
  __copy_script_remote "$REDIS_HOST" "$redis_config" "/etc/redis"

}

main() {
  __process_marker "Installing Redis"
  local script_name="installRedis.sh"
  if [ "$IS_INSTALLED" == true ]; then
    __process_msg "Redis already installed, skipping"
  else
    __process_msg "Redis not installed"
    __validate_redis_envs
    __validate_redis_mounts
    __update_redis_config

    if [ "$ADMIRAL_IP" == "$REDIS_HOST" ]; then
      source "$SCRIPTS_DIR/docker/$script_name"
    else
      local script_path="$SCRIPTS_DIR/Ubuntu_14.04/$script_name"
      __check_connection "$REDIS_HOST"
      __copy_configs
      __exec_cmd_remote "$REDIS_HOST" "mkdir -p $SCRIPTS_DIR_REMOTE"
      __copy_script_remote "$REDIS_HOST" "$script_path" "$SCRIPTS_DIR_REMOTE"

      local vault_install_cmd="REDIS_HOST=$REDIS_HOST \
        REDIS_PORT=$REDIS_PORT \
        $SCRIPTS_DIR_REMOTE/$script_name"
      __exec_cmd_remote "$REDIS_HOST" "$vault_install_cmd"
    fi
  fi
  __process_msg "Redis installed successfully"
}

main
