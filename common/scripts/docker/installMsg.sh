#!/bin/bash -e

export MSG_IMAGE="drydock/rabbitmq:$RELEASE"
export TIMEOUT=180

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
  local interval=3
  local counter=0
  local is_booted=false

  while [ $is_booted != true ] && [ $counter -lt $TIMEOUT ]; do
    if nc -vz $MSG_HOST $AMQP_PORT &>/dev/null; then
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
