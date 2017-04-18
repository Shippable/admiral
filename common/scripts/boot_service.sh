#!/bin/bash -e

export LOGS_FILE="$RUNTIME_DIR/logs/$SERVICE_NAME.log"

## Write logs of this script to component specific file
exec &> >(tee -a "$LOGS_FILE")

__validate_service_configs() {
  __process_msg "Service $SERVICE_NAME configuration"
  __process_msg "SERVICE: $SERVICE_NAME"
  __process_msg "LOGS_FILE:$LOGS_FILE"

}

__cleanup_containers() {
  __process_msg "Stopping stale container for the service"

}

__cleanup_service() {
  __process_msg "Removing stale service definitions"
}

__run_service() {
  __process_msg "Running service: $SERVICE_NAME"

}

main() {
  env
  if [ -z "$SERVICE_NAME" ] || [ "$SERVICE_NAME" == "" ]; then
    __process_error "'SERVICE_NAME' env not present, exiting"
    exit 1
  else
    __process_marker "Booting service: $SERVICE_NAME"
  fi
}


main
