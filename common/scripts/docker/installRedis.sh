#!/bin/bash -e

export REDIS_IMAGE="374168611083.dkr.ecr.us-east-1.amazonaws.com/redis:$RELEASE"

__cleanup() {
  __process_msg "Removing stale containers"
  sudo docker rm -f $COMPONENT || true
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

  __process_msg "Executing: $run_cmd"

  eval "$run_cmd"
  __process_msg "Redis container successfully running"
}

__check_redis() {
  __process_msg "Checking redis container status on: $REDIS_HOST:$REDIS_PORT"
  __check_service_connection "$REDIS_HOST" "$REDIS_PORT" "$COMPONENT"
}

main() {
  __process_marker "Installing redis"
  __cleanup
  __run_redis
  __check_redis
}

main
