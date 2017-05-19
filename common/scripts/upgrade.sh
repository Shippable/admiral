#!/bin/bash -e

readonly MAX_ERROR_LOG_COUNT=100

__check_release() {
  __process_msg "Validating release version"
  _shippable_get_systemSettings
  local current_release=$(echo $response \
    | jq -r '.releaseVersion')

  __process_msg "Current release: $current_release"
  __process_msg "New release: $RELEASE"
}

__update_release() {
  __process_msg "Updating release version in DB"
  local system_settings_update='{"releaseVersion": "'$RELEASE'"}'
  system_settings_update=$(echo $system_settings_update | jq '.')

  _shippable_put_system_settings "$system_settings_update"
  if [ $response_status_code -gt 299 ]; then
    __process_error "Error updating release version: $response"
    __process_error "Status code: $response_status_code"
    exit 1
  else
    __process_msg "Successfully updated release version to: $RELEASE"
  fi
}

__stop_stateless_services() {
  __process_msg "Stopping stateless services"

  __process_msg "Getting all stateless services"
  local services=""
  _shippable_get_services
  if [ $response_status_code -gt 299 ]; then
    __process_error "Error getting services list: $response"
    __process_error "Status code: $response_status_code"
    exit 1
  else
    __process_msg "Successfully fetched services list"
    services=$(echo $response | jq '.')
    services=$(echo $services \
      | jq '[ .[] | select (.isEnabled==true) | select (.isCore!=true)]')
  fi

  local services_count=$(echo $services | jq '. | length')
  if [ $services_count -ne 0 ]; then
    __process_msg "Stopping $services_count stateless services"

    for i in $(seq 1 $services_count); do
      local service=$(echo $services \
        | jq '.['"$i-1"']')
      local service_name=$(echo $service \
        | jq -r '.serviceName')

      __process_msg "Stopping service: $service_name"
      _shippable_delete_service "$service_name"
      if [ $response_status_code -gt 299 ]; then
        __process_error "Error stopping service $service_name: $response"
        __process_error "Status code: $response_status_code"
        __process_error "==================== Error Logs ====================="
        local logs_file="$LOGS_DIR/$service_name.log"
        tail -$MAX_ERROR_LOG_COUNT $logs_file
        __process_error "====================================================="
        exit 1
      else
        __process_msg "Successfully ran migrations for release: $RELEASE"
      fi
    done
  else
    __process_msg "No stateless services running"
  fi
}

__run_migrations() {
  __process_msg "Running migrations"

  _shippable_post_db
  if [ $response_status_code -gt 299 ]; then
    __process_error "Error running migrations: $response"
    __process_error "Status code: $response_status_code"
    __process_error "==================== Error Logs ====================="
    local logs_file="$LOGS_DIR/db.log"
    tail -$MAX_ERROR_LOG_COUNT $logs_file
    __process_error "====================================================="
    exit 1
  else
    __process_msg "Successfully ran migrations for release: $RELEASE"
  fi

  __process_msg "Checking db processing state"
  local is_processing=true
  while true; do
    sleep 5
    _shippable_get_db
    if [ $response_status_code -gt 299 ]; then
      __process_error "Error checking db status: $response"
      __process_error "Status code: $response_status_code"
      exit 1
    else
      is_processing=$(echo $response | jq -r '.isProcessing')
    fi

    if [ $is_processing == false ]; then
      __process_msg "Migrations processing complete. "
      break
    else
      __process_msg "Processing migrations"
      local logs_file="$LOGS_DIR/db.log"
      tail -$MAX_ERROR_LOG_COUNT $logs_file
    fi
  done
}

__remove_stateful_services() {
  __process_msg "Removing stateful services"
  # call DELETE /api/services on stateful services
}

__start_api() {
  __process_msg "Starting api"
  # call POST /api/services to start api
}

__start_stateful_services() {
  __process_msg "Starting stateful services"

}

__start_stateless_services() {
  __process_msg "Starting stateless services"

}

__run_post_migrations() {
  __process_msg "Running post install migrations"

}

main() {
  #TODO: create helper functions for POST, PUT, GET
  if [ $IS_UPGRADE == true ]; then
    __process_marker "Upgrading Shippable installation"
    __check_release
    __update_release
    __stop_stateless_services
    __run_migrations
    __remove_stateful_services
    __start_api
    __start_stateful_services
    __start_stateless_services
    __run_post_migrations
  fi
}

main
