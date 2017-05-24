#!/bin/bash -e

export LOGS_FILE="$RUNTIME_DIR/logs/$SERVICE_NAME.log"
export SCRIPTS_DIR="$SCRIPTS_DIR"

## Write logs of this script to component specific file
exec &> >(tee -a "$LOGS_FILE")

__validate_service_configs() {
  __process_msg "Service $SERVICE_NAME configuration"
  __process_msg "SERVICE: $SERVICE_NAME"
  __process_msg "SERVICE_IMAGE: $SERVICE_IMAGE"
  __process_msg "SCRIPTS_DIR: $SCRIPTS_DIR"
  __process_msg "LOGS_FILE: $LOGS_FILE"
  __process_msg "REPLICAS: $REPLICAS"
  __process_msg "IS_SWARM_INITIALIZED: $IS_SWARM_INITIALIZED"
}

__update_service() {
  __process_msg "Updating service: $SERVICE_NAME"
  if [ $IS_SWARM_INITIALIZED == true ]; then
    local update_cmd="sudo docker service scale $SERVICE_NAME=$REPLICAS"
    __process_msg "Executing: $update_cmd"
    local update_output=$($update_cmd)
    __process_msg "Update returned: $update_output"
  else
    __process_msg "Service $SERVICE_NAME running on onebox, only one replica allowed"
  fi
}

main() {
  if [ -z "$SERVICE_NAME" ] || [ "$SERVICE_NAME" == "" ]; then
    __process_error "'SERVICE_NAME' env not present, exiting"
    exit 1
  else
    __process_marker "Updating service: $SERVICE_NAME"
    __validate_service_configs
    __update_service
  fi
}


main
