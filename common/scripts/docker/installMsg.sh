#!/bin/bash -e

export COMPONENT="msg"
export MSG_DATA_DIR="$RUNTIME_DIR/$COMPONENT/data"
export MSG_CONFIG_DIR="$CONFIG_DIR/$COMPONENT"
export MSG_IMAGE="drydock/rabbitmq:$RELEASE"
export SCRIPTS_DIR="$SCRIPTS_DIR"
export MSG_PORT=15672

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
  __process_msg "RABBITMQ_ADMIN: $RABBITMQ_ADMIN"
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

__run_msg() {
  __process_msg "Running rabbitmq container"
  local data_dir_container="/var/rabbitmq"
  local config_dir_container="/rabbitmq"

  local run_cmd="sudo docker run \
    -d \
    -v $MSG_DATA_DIR:$data_dir_container \
    -v $MSG_CONFIG_DIR:$config_dir_container \
    --publish 5672:5672 \
    --publish 15672:15672 \
    --net=host \
    --privileged=true \
    --name=$COMPONENT \
    $MSG_IMAGE
  "

  eval "$run_cmd"
  __process_msg "Rabbitmq container successfully running"
}

__check_msg() {
  __process_msg "Checking rabbitmq container status on: $MSG_HOST:$MSG_PORT"
  local interval=3
  local timeout=60
  local counter=0
  local is_booted=false

  while [ $is_booted != true ] && [ $counter -lt $timeout ]; do
    if nc -vz $MSG_HOST $MSG_PORT &>/dev/null; then
      __process_msg "Rabbitmq found"
      sleep 5
      is_booted=true
    else
      __process_msg "Waiting for rabbitmq to start"
      let "counter = $counter + $interval"
      sleep $interval
    fi
  done
  if [ $is_booted = false ]; then
    __process_error "Failed to boot rabbitmq container"
    exit 1
  fi
}

__bootstrap_msg() {
  __process_msg "Bootstrapping msg"

  __process_msg "Adding shippable User to rabbitmq"
  local insert_amqp_user_res=$($RABBITMQ_ADMIN --host=$MSG_HOST --port=$MSG_PORT declare user name=$MSG_USER password=$MSG_PASS tags=administrator)
  __process_msg "$insert_amqp_user_res"

  __process_msg  "Adding UI User to rabbitmq"
  local insert_amqp_ui_user_res=$($RABBITMQ_ADMIN --host=$MSG_HOST --port=$MSG_PORT declare user name=$MSG_UI_USER password=$MSG_UI_PASS tags=monitoring)
  __process_msg "$insert_amqp_ui_user_res"

  __process_msg "Adding shippable Vhost to rabbitmq"
  local insert_vhost_res=$($RABBITMQ_ADMIN --host=$MSG_HOST --port=$MSG_PORT declare vhost name=shippable)
  __process_msg $insert_vhost_res

  __process_msg "Adding shippableRoot Vhost to rabbitmq"
  local insert_root_vhost_res=$($RABBITMQ_ADMIN --host=$MSG_HOST --port=$MSG_PORT declare vhost name=shippableRoot)
  __process_msg $insert_root_vhost_res

  __process_msg "Updating shippable user perms for rabbitmq"
  local update_user_perms_res=$($RABBITMQ_ADMIN --host=$MSG_HOST --port=$MSG_PORT declare permission vhost=shippable user=$MSG_USER configure=.* write=.* read=.*)
  __process_msg $update_user_perms_res

  local update_user_perms_root_res=$($RABBITMQ_ADMIN --host=$MSG_HOST --port=$MSG_PORT declare permission vhost=shippableRoot user=$MSG_USER configure=.* write=.* read=.*)
  __process_msg $update_user_perms_root_res

  local update_ui_user_perms_root_res=$($RABBITMQ_ADMIN --host=$MSG_HOST --port=$MSG_PORT declare permission vhost=shippableRoot user=$MSG_UI_USER configure=^$ write=.* read=.*)
  __process_msg $update_ui_user_perms_root_res

  __process_msg "Adding shippableEx Exchange to rabbitmq for shippable vhost"
  local insert_ex_res=$($RABBITMQ_ADMIN --host=$MSG_HOST --port=$MSG_PORT --username=$MSG_USER --password=$MSG_PASS --vhost=shippable declare exchange name=shippableEx type=topic)
  __process_msg $insert_ex_res

  __process_msg "Adding shippableEx Exchange to rabbitmq for shippableRoot vhost"
  local insert_ex_root_res=$($RABBITMQ_ADMIN --host=$MSG_HOST --port=$MSG_PORT --username=$MSG_USER --password=$MSG_PASS --vhost=shippableRoot declare exchange name=shippableEx type=topic)
  __process_msg $insert_ex_root_res
}

main() {
  __process_marker "Booting Rabbitmq"
  if [ "$IS_INSTALLED" == true ]; then
    __process_msg "Rabbitmq already installed, skipping"
  else
    __process_msg "Rabbitmq not installed"
    __validate_msg_envs
    __validate_msg_mounts
    __run_msg
  fi

  if [ "$IS_INITIALIZED" == true ]; then
    __process_msg "Rabbitmq already initialized, skipping"
  else
    __process_msg "Rabbitmq not initialized"
    __check_msg
    __bootstrap_msg
  fi
  __process_msg "Rabbitmq container successfully running"
}

main
