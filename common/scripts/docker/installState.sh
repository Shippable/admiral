#!/bin/bash -e

export COMPONENT="state"
export STATE_DATA_DIR="$RUNTIME_DIR/$COMPONENT/data"
export STATE_LOGS_DIR="$RUNTIME_DIR/$COMPONENT/logs"
export STATE_CONFIG_DIR="$CONFIG_DIR/$COMPONENT"
export SCRIPTS_DIR="$SCRIPTS_DIR"
export STATE_IMAGE="drydock/gitlab:$RELEASE"
export STATE_PORT=80

__validate_state_envs() {
  __process_msg "Initializing state environment variables"
  __process_msg "STATE_IMAGE: $STATE_IMAGE"
  __process_msg "SCRIPTS_DIR: $SCRIPTS_DIR"
  __process_msg "STATE_DATA_DIR: $STATE_DATA_DIR"
  __process_msg "STATE_CONFIG_DIR: $STATE_CONFIG_DIR"
  __process_msg "STATE_HOST: $STATE_HOST"
  __process_msg "STATE_PASS: $STATE_PASS"
}

__validate_state_mounts() {
  __process_msg "Validating state mounts"
  if [ ! -d "$STATE_DATA_DIR" ]; then
    __process_msg "Creating data directory $STATE_DATA_DIR"
    sudo mkdir -p $STATE_DATA_DIR
  else
    __process_msg "Data directory already present: $STATE_DATA_DIR"
  fi

  if [ ! -d "$STATE_LOGS_DIR" ]; then
    __process_msg "Creating logs directory $STATE_LOGS_DIR"
    sudo mkdir -p $STATE_LOGS_DIR
  else
    __process_msg "Logs directory already present: $STATE_LOGS_DIR"
  fi

  if [ ! -d "$STATE_CONFIG_DIR" ]; then
    __process_msg "Creating config directory $STATE_CONFIG_DIR"
    sudo mkdir -p $STATE_CONFIG_DIR
  else
    __process_msg "Config directory already present: $STATE_CONFIG_DIR"
  fi

  sudo mkdir -p $STATE_CONFIG_DIR/scripts
}

__run_state() {
  __process_msg "Running gitlab container"
  local data_dir_container="/var/opt/gitlab"
  local config_dir_container="/etc/gitlab"
  local logs_dir_container="/var/log/gitlab"

  local config="gitlab_rails['initial_root_password'] = '$STATE_PASS'; \
      gitlab_rails['rate_limit_requests_per_period'] = 1000000; \
      gitlab_rails['rate_limit_period'] = 1;"

  __process_msg "$config"

  local run_cmd="sudo docker run \
    -d \
    -e GITLAB_OMNIBUS_CONFIG="\"$config\"" \
    -v $STATE_CONFIG_DIR:$config_dir_container \
    -v $STATE_DATA_DIR:$data_dir_container \
    -v $STATE_LOGS_DIR:$logs_dir_container \
    --publish 22:22 \
    --publish 80:80 \
    --publish 443:443 \
    --net=host \
    --privileged=true \
    --name=$COMPONENT \
    $STATE_IMAGE
  "

  eval "$run_cmd"
  __process_msg "Gitlab container successfully running"
}

__check_state() {
  __process_msg "Checking gitlab container status on: $STATE_HOST:$STATE_PORT"
  local interval=3
  local timeout=60
  local counter=0
  local is_booted=false

  while [ $is_booted != true ] && [ $counter -lt $timeout ]; do
    if nc -vz $STATE_HOST $STATE_PORT &>/dev/null; then
      __process_msg "Gitlab found"
      sleep 5
      is_booted=true
    else
      __process_msg "Waiting for gitlab to start"
      let "counter = $counter + $interval"
      sleep $interval
    fi
  done
  if [ $is_booted = false ]; then
    __process_error "Failed to boot gitlab container"
    exit 1
  fi
}

main() {
  __process_marker "Booting Gitlab"
  if [ "$IS_INSTALLED" == true ]; then
    __process_msg "Gitlab already installed, skipping"
  else
    __process_msg "Gitlab not installed"
    __validate_state_envs
    __validate_state_mounts
    __run_state
  fi

  if [ "$IS_INITIALIZED" == true ]; then
    __process_msg "Gitlab already initialized, skipping"
  else
    __process_msg "Gitlab not initialized"
    __check_state
  fi
  __process_msg "Gitlab container successfully running"
}

main
