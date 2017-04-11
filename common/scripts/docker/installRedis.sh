#!/bin/bash -e

export COMPONENT="redis"
export REDIS_DATA_DIR="$RUNTIME_DIR/$COMPONENT/data"
export REDIS_CONFIG_DIR="$CONFIG_DIR/$COMPONENT"
export SCRIPTS_DIR="$SCRIPTS_DIR"
export REDIS_IMAGE="shipimg/rdsbase:master.698"
export REDIS_PORT=6379

__validate_redis_envs() {
  __process_msg "Initializing redis environment variables"
  __process_msg "SCRIPTS_DIR: $SCRIPTS_DIR"
  __process_msg "STATE_DATA_DIR: $STATE_DATA_DIR"
  __process_msg "STATE_CONFIG_DIR: $STATE_CONFIG_DIR"
  __process_msg "REDIS_HOST: $REDIS_HOST"
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

__run_redis() {
  __process_msg "Running redis container"
  local data_dir_container="/data"
  local config_dir_container="/etc/redis"

  local run_cmd="sudo docker run \
    -d \
    -v $REDIS_CONFIG_DIR:$config_dir_container \
    -v $REDIS_DATA_DIR:$data_dir_container \
    --publish 6379:6379 \
    --net=host \
    --privileged=true \
    --name=$COMPONENT \
    $REDIS_IMAGE
  "

  eval "$run_cmd"
  __process_msg "Redis container successfully running"
}

__check_redis() {
  __process_msg "Checking redis container status on: $REDIS_HOST:$REDIS_PORT"
  local interval=3
  local timeout=60
  local counter=0
  local is_booted=false

  while [ $is_booted != true ] && [ $counter -lt $timeout ]; do
    if nc -vz $REDIS_HOST $REDIS_PORT &>/dev/null; then
      __process_msg "Redis found"
      sleep 5
      is_booted=true
    else
      __process_msg "Waiting for redis to start"
      let "counter = $counter + $interval"
      sleep $interval
    fi
  done
  if [ $is_booted = false ]; then
    __process_error "Failed to boot redis container"
    exit 1
  fi
}

main() {
  __process_marker "Booting redis"
  if [ "$IS_INSTALLED" == true ]; then
    __process_msg "Redis already installed, skipping"
  else
    __process_msg "Redis not installed"
    __validate_redis_envs
    __validate_redis_mounts
    __run_redis
  fi

  if [ "$IS_INITIALIZED" == true ]; then
    __process_msg "Redis already initialized, skipping"
  else
    __process_msg "Redis not initialized"
    __check_redis
  fi
  __process_msg "Gitlab container successfully running"
}

main
