#!/bin/bash -e

__validate_db_envs() {
  __process_msg "Validating db ENV variables"

}

__validate_db_mounts() {
  __process_msg "Validating db data mounts from host"

}

__run_db() {
  __process_msg "Running database container"

}

main() {
  __process_marker "Booting database"


  __process_msg "Database container successfully running"
}

main
