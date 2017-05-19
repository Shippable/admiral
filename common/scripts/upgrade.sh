#!/bin/bash -e

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
  # stop all stateless services using admiral route
}

__run_migrations() {
  __process_msg "Running migrations"
  # call POST /api/db route to run migrations
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
