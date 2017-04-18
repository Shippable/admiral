#!/bin/bash -e

export LOGS_FILE="$RUNTIME_DIR/logs/$SERVICE_NAME.log"
export SCRIPTS_DIR="$SCRIPTS_DIR"

## Write logs of this script to component specific file
exec &> >(tee -a "$LOGS_FILE")

__validate_service_configs() {
  __process_msg "Service $SERVICE_NAME configuration"
  __process_msg "SERVICE: $SERVICE_NAME"
  __process_msg "ACCESS_KEY: $ACCESS_KEY"
  __process_msg "SECRET_KEY: $SECRET_KEY"
  __process_msg "SCRIPTS_DIR: $SCRIPTS_DIR"
  __process_msg "LOGS_FILE:$LOGS_FILE"
}

__registry_login() {
  __process_msg "Updating docker credentials to pull Shippable images"

  local credentials_template="$SCRIPTS_DIR/configs/credentials.template"
  local credentials_file="/tmp/credentials"

  sed "s#{{ACCESS_KEY}}#$ACCESS_KEY#g" $credentials_template > $credentials_file
  sed -i "s#{{SECRET_KEY}}#$SECRET_KEY#g" $credentials_file

  mkdir -p ~/.aws
  mv -v $credentials_file ~/.aws
  local docker_login_cmd=$(aws ecr --region us-east-1 get-login)
  __process_msg "Docker login generated, logging into ecr"
  eval "$docker_login_cmd"
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
  if [ -z "$SERVICE_NAME" ] || [ "$SERVICE_NAME" == "" ]; then
    __process_error "'SERVICE_NAME' env not present, exiting"
    exit 1
  else
    __process_marker "Booting service: $SERVICE_NAME"
    __validate_service_configs
    __registry_login
  fi
}


main
