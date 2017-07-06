#!/bin/bash -e

export REDIS_IMAGE="drydock/redis:$RELEASE"
export TIMEOUT=30

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
  local interval=3
  local counter=0
  local is_booted=false

  while [ $is_booted != true ] && [ $counter -lt $TIMEOUT ]; do
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
  __process_marker "Installing redis"
  __cleanup
  __run_redis
}

main
