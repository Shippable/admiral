#!/bin/bash -e

export COMPONENT="state"
export STATE_DATA_DIR="$RUNTIME_DIR/$COMPONENT/data"
export STATE_LOGS_DIR="$RUNTIME_DIR/$COMPONENT/logs"
export STATE_CONFIG_DIR="$CONFIG_DIR/$COMPONENT"
export SCRIPTS_DIR="$SCRIPTS_DIR"
export SCRIPTS_DIR_REMOTE="/tmp/shippable"

export LOGS_FILE="$RUNTIME_DIR/logs/$COMPONENT.log"

## Write logs of this script to component specific file
exec &> >(tee -a "$LOGS_FILE")

__validate_state_envs() {
  __process_msg "Initializing state environment variables"
  __process_msg "STATE_IMAGE: $STATE_IMAGE"
  __process_msg "SCRIPTS_DIR: $SCRIPTS_DIR"
  __process_msg "STATE_DATA_DIR: $STATE_DATA_DIR"
  __process_msg "STATE_CONFIG_DIR: $STATE_CONFIG_DIR"
  __process_msg "STATE_HOST: $STATE_HOST"
  __process_msg "STATE_PASS: $STATE_PASS"
  __process_msg "STATE_PORT: $STATE_PORT"
  __process_msg "SSH_PORT: $SSH_PORT"
  __process_msg "SECURE_PORT: $SECURE_PORT"
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

__update_state_config() {
  __process_msg "Updating gitlab configuration files"
  cp -vr $SCRIPTS_DIR/configs/gitlab.rb.template $STATE_CONFIG_DIR/gitlab.rb

  __process_msg "Updating gitlab hostname"
  sed -i "s/{{gitlab_machine_url}}/$STATE_HOST/g" $STATE_CONFIG_DIR/gitlab.rb

  __process_msg "Updating gitlab password"
  sed -i "s/{{gitlab_password}}/$STATE_PASS/g" $STATE_CONFIG_DIR/gitlab.rb

  __process_msg "Updating gitlab rate limit request"
  sed -i "s/{{rate_limit_rps}}/100000/g" $STATE_CONFIG_DIR/gitlab.rb

  __process_msg "Updating gitlab rate limit period"
  sed -i "s/{{rate_limit_period}}/1/g" $STATE_CONFIG_DIR/gitlab.rb
}

__copy_configs() {
  __process_msg "Copying config files to host"

  local state_config_path="$STATE_CONFIG_DIR/gitlab.rb"
  __copy_script_remote "$STATE_HOST" "$state_config_path" "/etc/gitlab"
}

main() {
  __process_marker "Installing Gitlab"
  local script_name="installState.sh"
  if [ "$IS_INSTALLED" == true ]; then
    __process_msg "Gitlab already installed, skipping"
  else
    __process_msg "Gitlab not installed"
    __validate_state_envs
    __validate_state_mounts
    __update_state_config

    if [ "$ADMIRAL_IP" == "$STATE_HOST" ]; then
      source "$SCRIPTS_DIR/docker/$script_name"
    else
      local script_path="$SCRIPTS_DIR/Ubuntu_14.04/$script_name"
      __check_connection "$STATE_HOST"
      __copy_configs

      local node_update_script="$SCRIPTS_DIR/Ubuntu_14.04/setupNode.sh"
      __copy_script_remote "$STATE_HOST" "$node_update_script" "$SCRIPTS_DIR_REMOTE"
      __exec_cmd_remote "$STATE_HOST" "$SCRIPTS_DIR_REMOTE/setupNode.sh"

      __exec_cmd_remote "$STATE_HOST" "mkdir -p $SCRIPTS_DIR_REMOTE"
      __copy_script_remote "$STATE_HOST" "$script_path" "$SCRIPTS_DIR_REMOTE"

      local gitlab_install_cmd="STATE_HOST=$STATE_HOST \
        STATE_PORT=$STATE_PORT \
        $SCRIPTS_DIR_REMOTE/$script_name"
      __exec_cmd_remote "$STATE_HOST" "$gitlab_install_cmd"
    fi
  fi
  __process_msg "Gitlab installed successfully"
}

main
