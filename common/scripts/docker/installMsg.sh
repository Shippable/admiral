#!/bin/bash -e

export MSG_IMAGE="374168611083.dkr.ecr.us-east-1.amazonaws.com/rabbitmq:$RELEASE"

__cleanup() {
  __process_msg "Removing stale containers"
  sudo docker rm -f $COMPONENT || true
}

__run_msg() {
  __process_msg "Running rabbitmq container"
  local data_dir_container="/var/rabbitmq"
  local config_dir_container="/rabbitmq"

  local run_cmd="sudo docker run \
    -d \
    -v $MSG_DATA_DIR:$data_dir_container \
    -v $MSG_CONFIG_DIR:$config_dir_container \
    --publish $AMQP_PORT:$AMQP_PORT \
    --publish $ADMIN_PORT:$ADMIN_PORT \
    --net=host \
    --privileged=true \
    --name=$COMPONENT \
    $MSG_IMAGE
  "

  __process_msg "Executing: $run_cmd"
  eval "$run_cmd"
  __process_msg "Rabbitmq container successfully running"
}

__check_msg() {
  __process_msg "Checking rabbitmq container status on: $MSG_HOST:$AMQP_PORT"

  __check_service_connection "$MSG_HOST" "$AMQP_PORT" "$COMPONENT"
  __check_service_connection "$MSG_HOST" "$ADMIN_PORT" "MSG_ADMIN"
}


main() {
  __process_marker "Booting Rabbitmq"
  if [ "$IS_INSTALLED" == true ]; then
    __process_msg "Rabbitmq already installed, skipping"
  else
    __process_msg "Rabbitmq not installed"
    __cleanup
    __run_msg
    __check_msg
  fi
}

main
