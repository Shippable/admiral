#!/bin/bash -e

export COMPONENT="db"
export DB_DATA_DIR="$RUNTIME_DIR/$COMPONENT/data"
export DB_CONFIG_DIR="$CONFIG_DIR/$COMPONENT/"
export DB_IMAGE="drydock/postgres:$RELEASE"
export DB_MOUNTS=""
export TIMEOUT=120

__validate_db_envs() {
  __process_msg "Validating db ENV variables"
  if [ "$DB_IP" == "" ]; then
    __process_error "DB_IP cannot be empty, exiting"
    exit 1
  fi

  if [ "$DB_PORT" == "" ]; then
    __process_error "DB_PORT cannot be empty, exiting"
    exit 1
  fi

  if [ "$DB_USER" == "" ]; then
    __process_error "DB_USER cannot be empty, exiting"
    exit 1
  fi

  if [ "$DB_NAME" == "" ]; then
    __process_error "DB_NAME cannot be empty, exiting"
    exit 1
  fi

  if [ "$DB_PASSWORD" == "" ]; then
    __process_error "DB_PASSWORD cannot be empty, exiting"
    exit 1
  fi

  if [ "$DB_DIALECT" == "" ]; then
    __process_error "DB_DIALECT cannot be empty, exiting"
    exit 1
  fi
}

__validate_db_mounts() {
  __process_msg "Validating db data mounts from host"

  if [ ! -d "$DB_DATA_DIR" ]; then
    __process_msg "Creating data directory $DB_DATA_DIR"
    sudo mkdir -p $DB_DATA_DIR
  else
    __process_msg "Data directory already present: $DB_DATA_DIR"
  fi

  if [ ! -d "$DB_CONFIG_DIR" ]; then
    __process_msg "Creating config directory $DB_CONFIG_DIR"
    sudo mkdir -p $DB_CONFIG_DIR
  else
    __process_msg "Config directory already present: $DB_CONFIG_DIR"
  fi
}

__check_db() {
  __process_msg "Checking database container status on: $DB_IP:$DB_PORT"
  local interval=3
  local counter=0
  local db_booted=false

  while [ $db_booted != true ] && [ $counter -lt $TIMEOUT ]; do
    if nc -vz $DB_IP $DB_PORT &>/dev/null; then
      __process_msg "Database found"
      db_booted=true
    else
      __process_msg "Waiting for database to start"
      let "counter = $counter + $interval"
      sleep $interval
    fi
  done
  if [ $db_booted = false ]; then
    __process_msg "Failed to boot database container"
    exit 1
  fi
}

__run_db() {
  __process_msg "Running database container"

  local db_container=$(sudo docker ps | grep $COMPONENT | awk '{print $1}')
  if [ "$db_container" != "" ]; then
    __process_msg "Database container already running"
  else
    __process_msg "Running a new database container"

    local data_dir_container="/var/lib/postgresql/data/pgdata"
    local config_dir_container="/etc/postgresql/config"

    local run_cmd="sudo docker run \
      -d \
      -v $DB_DATA_DIR:$data_dir_container \
      -v $DB_CONFIG_DIR:$config_dir_container \
      -e PGDATA=$data_dir_container \
      -e POSTGRES_DB=$DB_NAME \
      -e POSTGRES_USER=$DB_USER \
      -e POSTGRES_PASSWORD=$DB_PASSWORD \
      --net=host \
      --publish 5432:5432 \
      --privileged=true \
      --name=$COMPONENT \
      $DB_IMAGE
    "

    eval "$run_cmd"
    __check_db
    sed -i 's/.*DB_INSTALLED=.*/DB_INSTALLED=true/g' $ADMIRAL_ENV
  fi
}

main() {
  __process_marker "Booting database"
  if [ "$DB_INSTALLED" == true ]; then
    __process_msg "Database already installed, skipping"
  else
    __validate_db_envs
    __validate_db_mounts
    __run_db
    __process_msg "Database container successfully running"
  fi
}

main
