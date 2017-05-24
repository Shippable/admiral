#!/bin/bash -e

readonly MAX_ERROR_LOG_COUNT=100

__check_admiral() {
  __process_msg "Checking if admiral container is running"
  local wait_time=3
  _shippable_get_admiral
  if [ $response_status_code -eq 503 ]; then
    __process_msg "Admiral not running, retrying in $wait_time seconds"
    sleep $wait_time
    __check_admiral
  else
    __process_msg "Admiral successfully running"
  fi
}

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
  __process_marker "Stopping stateless services"

  __process_msg "Getting all enabled stateless services"
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
      local body='{"isEnabled": true}'
      _shippable_delete_service "$service_name" "$body"
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
  __process_marker "Running migrations"

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
  __process_marker "Removing stateful services"

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
  __process_marker "Starting api"
  __process_msg "Getting api config"
  local service=""
  local wait_time=15
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
    __process_msg "Waiting $wait_time seconds before starting other services"
    sleep $wait_time
  fi
}

__start_stateful_services() {
  __process_marker "Starting stateful services"
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
    __process_msg "Starting $services_count stateful services"

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
  __process_marker "Starting stateless services"
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
    __process_msg "Starting $services_count stateless services"

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
    __process_msg "No stateless services available"
  fi
}

__run_post_migrations() {
  __process_marker "Running post install migrations"

  _shippable_post_cleanup
  if [ $response_status_code -gt 299 ]; then
    __process_error "Error running migrations: $response"
    __process_error "Status code: $response_status_code"
    __process_error "==================== Error Logs ====================="
    local logs_file="$LOGS_DIR/db.log"
    tail -$MAX_ERROR_LOG_COUNT $logs_file
    __process_error "====================================================="
    exit 1
  else
    __process_msg "Successfully ran post install migration for release: $RELEASE"
  fi
}

__cleanup_master() {
  __process_marker "Cleaning up swarm master node"
  _shippable_post_master_cleanup
  if [ $response_status_code -gt 299 ]; then
    __process_error "Error running master cleanup: $response"
    __process_error "Status code: $response_status_code"
    __process_error "==================== Error Logs ====================="
    local logs_file="$LOGS_DIR/master.log"
    tail -$MAX_ERROR_LOG_COUNT $logs_file
    __process_error "====================================================="
    exit 1
  else
    __process_msg "Successfully ran swarm master cleanup for release: $RELEASE"
  fi
}

__cleanup_workers() {
  __process_marker "Cleaning up swarm worker node"
  __process_msg "Getting swarm workers"
  local workers=""
  _shippable_get_workers
  if [ $response_status_code -gt 299 ]; then
    __process_error "Error getting workers list: $response"
    __process_error "Status code: $response_status_code"
    exit 1
  else
    __process_msg "Successfully fetched workers list"
    workers=$(echo $response | jq '.')
    workers=$(echo $workers \
      | jq '[ .[] | select (.isInitialized==true) | select (.isProcessing==false)]')
  fi

  local workers_count=$(echo $workers | jq '. | length')
  if [ $workers_count -ne 0 ]; then
    __process_msg "Cleaning up $workers_count workers"

    for i in $(seq 1 $workers_count); do
      local worker=$(echo $workers \
        | jq '.['"$i-1"']')
      local worker_address=$(echo $worker \
        | jq -r '.address')

      __process_msg "Cleaning up worker: $worker_address"
      local body='{"address": "'$worker_address'"}'
      _shippable_post_worker_cleanup "$body"
      if [ $response_status_code -gt 299 ]; then
        __process_error "Error cleaning up worker $worker_address: $response"
        __process_error "Status code: $response_status_code"
        __process_error "==================== Error Logs ====================="
        local logs_file="$LOGS_DIR/workers.log"
        tail -$MAX_ERROR_LOG_COUNT $logs_file
        __process_error "====================================================="
        exit 1
      else
        __process_msg "Successfully cleaned up worker: $worker_address"
      fi
    done
  else
    __process_msg "No workers available"
  fi
}

main() {
  if [ $IS_UPGRADE == true ]; then
    __process_marker "Upgrading Shippable installation"
    __check_admiral
    __check_release
    __update_release
    __stop_stateless_services
    __run_migrations
    __remove_stateful_services
    __start_api
    __start_stateful_services
    __start_stateless_services
    __run_post_migrations
    __cleanup_master
    __cleanup_workers
  fi
}

main
