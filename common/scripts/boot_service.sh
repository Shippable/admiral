#!/bin/bash -e

export LOGS_FILE="$RUNTIME_DIR/logs/$SERVICE_NAME.log"
export SCRIPTS_DIR="$SCRIPTS_DIR"

## Write logs of this script to component specific file
exec &> >(tee -a "$LOGS_FILE")

__validate_service_configs() {
  __process_msg "Service $SERVICE_NAME configuration"
  __process_msg "SERVICE: $SERVICE_NAME"
  __process_msg "SERVICE_IMAGE: $SERVICE_IMAGE"
  __process_msg "ACCESS_KEY: $ACCESS_KEY"
  __process_msg "SECRET_KEY: $SECRET_KEY"
  __process_msg "SCRIPTS_DIR: $SCRIPTS_DIR"
  __process_msg "LOGS_FILE:$LOGS_FILE"
}

__cleanup_containers() {
  __process_msg "Stopping stale container for the service"
  sudo docker rm -f $SERVICE_NAME || true
}

__cleanup_service() {
  __process_msg "Removing stale service definitions"
  sudo docker service rm $SERVICE_NAME || true
}

__run_service1() {
  __process_msg "Running service: $SERVICE_NAME"
  local run_cmd="sudo docker run -d \
    $SERVICE_ENV \
    $SERVICE_MOUNTS \
    $SERVICE_OPTS \
    --name $SERVICE_NAME \
    $SERVICE_IMAGE"
  __process_msg "Executing: $run_cmd"
  local run_output=$($run_cmd)
  __process_msg "Docker run returned: $run_output"
}

__run_service() {
  __process_msg "Running service: $SERVICE_NAME"
  __process_msg "Executing: $RUN_COMMAND"
  local run_output=$($RUN_COMMAND)
  __process_msg "Docker run returned: $run_output"
}

main() {
  if [ -z "$SERVICE_NAME" ] || [ "$SERVICE_NAME" == "" ]; then
    __process_error "'SERVICE_NAME' env not present, exiting"
    exit 1
  else
    __process_marker "Booting service: $SERVICE_NAME"
    __validate_service_configs
    __cleanup_containers
    __cleanup_service
    if [ "$RUN_COMMAND" == "" ]; then
      __run_service1
    else
      __run_service
    fi
  fi
}


main
