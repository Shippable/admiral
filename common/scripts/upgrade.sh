#!/bin/bash -e

readonly MAX_ERROR_LOG_COUNT=100
export SERVICES=""

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
        __process_msg "Successfully stopped service: $service_name"
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

  __process_msg "Getting all stateful services"
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
      | jq '[ .[] | select (.isEnabled==true) | select (.isCore==true)]')
  fi

  local services_count=$(echo $services | jq '. | length')
  if [ $services_count -ne 0 ]; then
    __process_msg "Stopping $services_count stateful services"

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
        __process_msg "Successfully stopped service: $service_name"
      fi
    done
  else
    __process_msg "Stateful services already stopped"
  fi
}

__start_api() {
  __process_msg "Starting api"
  __process_msg "Getting api config"
  local service=""
  _shippable_get_services "api"
  if [ $response_status_code -gt 299 ]; then
    __process_error "Error getting api config: $response"
    __process_error "Status code: $response_status_code"
    exit 1
  else
    __process_msg "Successfully fetched api service"
    service=$(echo $response | jq '.[0]')
    local service_name=$(echo $service | jq -r '.serviceName')
    local service_replicas=$(echo $service | jq -r '.replicas')
    service='{"name": "'$service_name'", "replicas": "'$service_replicas'"}'
  fi

  _shippable_post_services "$service"
  if [ $response_status_code -gt 299 ]; then
    __process_error "Error starting api: $response"
    __process_error "Status code: $response_status_code"
    exit 1
  else
    __process_msg "Successfully started api"
  fi
}

__start_stateful_services() {
  __process_msg "Starting stateful services"
  __process_msg "Getting all stateful services"
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
      | jq '[ .[] | select (.isCore==true)]')
  fi

  local services_count=$(echo $services | jq '. | length')
  if [ $services_count -ne 0 ]; then
    __process_msg "Stopping $services_count stateful services"

    for i in $(seq 1 $services_count); do
      local service=$(echo $services \
        | jq '.['"$i-1"']')
      local service_name=$(echo $service \
        | jq -r '.serviceName')
      local service_replicas=$(echo $service \
        | jq -r '.replicas')

      __process_msg "Starting service: $service_name"
      service='{"name": "'$service_name'", "replicas": "'$service_replicas'"}'
      _shippable_post_services "$service"
      if [ $response_status_code -gt 299 ]; then
        __process_error "Error starting service $service_name: $response"
        __process_error "Status code: $response_status_code"
        __process_error "==================== Error Logs ====================="
        local logs_file="$LOGS_DIR/$service_name.log"
        tail -$MAX_ERROR_LOG_COUNT $logs_file
        __process_error "====================================================="
        exit 1
      else
        __process_msg "Successfully started service: $service_name"
      fi
    done
  else
    __process_error "No stateful services available"
    exit 1
  fi
}

__start_stateless_services() {
  __process_msg "Starting stateless services"
  __process_msg "Getting enabled master integrations"
  local master_integrations=""
  _shippable_get_masterIntegrations "isEnabled=true"
  if [ $response_status_code -gt 299 ]; then
    __process_error "Error getting master integrations list: $response"
    __process_error "Status code: $response_status_code"
    exit 1
  else
    __process_msg "Successfully fetched master integrations list"
    master_integrations=$(echo $response | jq '.')
  fi

  echo "$master_integrations"
  local integrations_count=$(echo $master_integrations | jq '. | length')
  if [ $integrations_count -ne 0 ]; then
    __process_msg "Enabling $integrations_count integrations to boot services"

    for i in $(seq 1 $integrations_count); do
      local integration=$(echo $master_integrations \
        | jq '.['"$i-1"']')
      local integration_id=$(echo $integration \
        | jq -r '.id')
      local integration_name=$(echo $integration \
        | jq -r '.name')

      __process_msg "Enabling integration: $integration_name"
      integration='{"isEnabled": true}'
      _shippable_put_masterIntegrations "$integration_id" "$integration"
      if [ $response_status_code -gt 299 ]; then
        __process_error "Error enabling integration $integration_name: $response"
        __process_error "Status code: $response_status_code"
        exit 1
      else
        __process_msg "Successfully enabled integration: $integration_name"
      fi
    done
  else
    __process_error "No master integrtaions enabled"
    exit 1
  fi
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
