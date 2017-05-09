#!/bin/bash -e

export COMPONENT="msg"
export MSG_DATA_DIR="$RUNTIME_DIR/$COMPONENT/data"
export MSG_CONFIG_DIR="$CONFIG_DIR/$COMPONENT"
export SCRIPTS_DIR="$SCRIPTS_DIR"
export LOGS_FILE="$RUNTIME_DIR/logs/$COMPONENT.log"
export SCRIPTS_DIR_REMOTE="/tmp/shippable"
export TIMEOUT=120

## Write logs of this script to component specific file
exec &> >(tee -a "$LOGS_FILE")

__validate_msg_envs() {
  __process_msg "Initializing vault environment variables"
  __process_msg "MSG_IMAGE: $MSG_IMAGE"
  __process_msg "SCRIPTS_DIR: $SCRIPTS_DIR"
  __process_msg "MSG_DATA_DIR: $MSG_DATA_DIR"
  __process_msg "MSG_CONFIG_DIR: $MSG_CONFIG_DIR"
  __process_msg "MSG_HOST: $MSG_HOST"
  __process_msg "MSG_UI_USER: $MSG_UI_USER"
  __process_msg "MSG_UI_PASS: $MSG_UI_PASS"
  __process_msg "MSG_USER: $MSG_USER"
  __process_msg "MSG_PASS: $MSG_PASS"
  __process_msg "AMQP_PORT: $AMQP_PORT"
  __process_msg "ADMIN_PORT: $ADMIN_PORT"
  __process_msg "RABBITMQ_ADMIN: $RABBITMQ_ADMIN"
  __process_msg "LOGS_FILE: $LOGS_FILE"
}

__validate_msg_mounts() {
  __process_msg "Validating msg mounts"
  if [ ! -d "$MSG_DATA_DIR" ]; then
    __process_msg "Creating data directory $MSG_DATA_DIR"
    sudo mkdir -p $MSG_DATA_DIR
  else
    __process_msg "Data directory already present: $MSG_DATA_DIR"
  fi

  if [ ! -d "$MSG_CONFIG_DIR" ]; then
    __process_msg "Creating config directory $MSG_CONFIG_DIR"
    sudo mkdir -p $MSG_CONFIG_DIR
  else
    __process_msg "Config directory already present: $MSG_CONFIG_DIR"
  fi

  sudo mkdir -p $MSG_CONFIG_DIR/scripts
}

__update_msg_config() {
  __process_msg "Updating rabbitmq configuration file"
  cp -vr $SCRIPTS_DIR/configs/rabbitmq.config $MSG_CONFIG_DIR/rabbitmq.config
}

__copy_configs() {
  __process_msg "Copying rabbitmq config files"
  local config_path="$MSG_CONFIG_DIR/rabbitmq.config"
  __copy_script_remote "$MSG_HOST" "$config_path" "/etc/rabbitmq"
}

__bootstrap_msg() {
  __process_msg "Bootstrapping msg"
  #TODO: use rabbitmqAdapter in api for configuration

  __process_msg "Adding shippable User to rabbitmq"
  local insert_amqp_user_res=$($RABBITMQ_ADMIN \
    --host=$MSG_HOST --port=$ADMIN_PORT \
    declare user name=$MSG_USER password=$MSG_PASS tags=administrator)
  __process_msg "$insert_amqp_user_res"

  __process_msg  "Adding UI User to rabbitmq"
  local insert_amqp_ui_user_res=$($RABBITMQ_ADMIN \
    --host=$MSG_HOST --port=$ADMIN_PORT \
    declare user name=$MSG_UI_USER password=$MSG_UI_PASS tags=monitoring)
  __process_msg "$insert_amqp_ui_user_res"

  __process_msg "Adding shippable Vhost to rabbitmq"
  local insert_vhost_res=$($RABBITMQ_ADMIN \
    --host=$MSG_HOST --port=$ADMIN_PORT \
    declare vhost name=shippable)
  __process_msg $insert_vhost_res

  __process_msg "Adding shippableRoot Vhost to rabbitmq"
  local insert_root_vhost_res=$($RABBITMQ_ADMIN \
    --host=$MSG_HOST --port=$ADMIN_PORT \
    declare vhost name=shippableRoot)
  __process_msg $insert_root_vhost_res

  __process_msg "Updating shippable user perms for rabbitmq"
  local update_user_perms_res=$($RABBITMQ_ADMIN \
    --host=$MSG_HOST --port=$ADMIN_PORT \
    declare permission vhost=shippable user=$MSG_USER configure=.* write=.* read=.*)
  __process_msg $update_user_perms_res

  local update_user_perms_root_res=$($RABBITMQ_ADMIN \
    --host=$MSG_HOST --port=$ADMIN_PORT \
    declare permission vhost=shippableRoot user=$MSG_USER configure=.* write=.* read=.*)
  __process_msg $update_user_perms_root_res

  local update_ui_user_perms_root_res=$($RABBITMQ_ADMIN \
    --host=$MSG_HOST --port=$ADMIN_PORT \
    declare permission vhost=shippableRoot user=$MSG_UI_USER configure=^$ write=.* read=.*)
  __process_msg $update_ui_user_perms_root_res

  __process_msg "Adding shippableEx Exchange to rabbitmq for shippable vhost"
  local insert_ex_res=$($RABBITMQ_ADMIN \
    --host=$MSG_HOST --port=$ADMIN_PORT \
    --username=$MSG_USER --password=$MSG_PASS \
    --vhost=shippable declare exchange name=shippableEx type=topic)
  __process_msg $insert_ex_res

  __process_msg "Adding shippableEx Exchange to rabbitmq for shippableRoot vhost"
  local insert_ex_root_res=$($RABBITMQ_ADMIN \
    --host=$MSG_HOST --port=$ADMIN_PORT \
    --username=$MSG_USER --password=$MSG_PASS \
    --vhost=shippableRoot declare exchange name=shippableEx type=topic)
  __process_msg $insert_ex_root_res
}

main() {
  __process_marker "Installing Rabbitmq"
  #TODO: get this from env
  local script_name="installMsg.sh"
  if [ "$IS_INSTALLED" == true ]; then
    __process_msg "Rabbitmq already installed, skipping"
  else
    __process_msg "Rabbitmq not installed"
    __validate_msg_envs
    __validate_msg_mounts
    __update_msg_config

    if [ "$ADMIRAL_IP" == "$MSG_HOST" ]; then
      source "$SCRIPTS_DIR/docker/$script_name"
    else
      local script_path="$SCRIPTS_DIR/Ubuntu_14.04/$script_name"
      __check_connection "$MSG_HOST"
      __copy_configs

      local node_update_script="$SCRIPTS_DIR/Ubuntu_14.04/setupNode.sh"
      __copy_script_remote "$MSG_HOST" "$node_update_script" "$SCRIPTS_DIR_REMOTE"
      __exec_cmd_remote "$MSG_HOST" "$SCRIPTS_DIR_REMOTE/setupNode.sh"

      __exec_cmd_remote "$MSG_HOST" "mkdir -p $SCRIPTS_DIR_REMOTE"
      __copy_script_remote "$MSG_HOST" "$script_path" "$SCRIPTS_DIR_REMOTE"

      local msg_install_cmd="MSG_HOST=$MSG_HOST \
        AMQP_PORT=$AMQP_PORT \
        ADMIN_PORT=$ADMIN_PORT \
        $SCRIPTS_DIR_REMOTE/$script_name"
      __exec_cmd_remote "$MSG_HOST" "$msg_install_cmd"
    fi
  fi
  __process_msg "Rabbitmq installed successfully"

  if [ "$IS_INITIALIZED" == true ]; then
    __process_msg "Rabbitmq already initialized, skipping"
  else
    __process_msg "Rabbitmq not initialized"
    __bootstrap_msg
    __process_msg "Rabbitmq initialized successfully"
  fi
}

main
