#!/bin/bash -e

__check_release() {
  __process_msg "Validating release version"
  # print new release version
  # print running release version, from db
}

__update_release() {
  __process_msg "Updating release version in DB"
  # release version from db will be used in routes
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
