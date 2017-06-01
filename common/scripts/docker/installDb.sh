#!/bin/bash -e

export DB_IMAGE="drydock/postgres:$RELEASE"
export TIMEOUT=120

__check_db() {
  __process_msg "Checking database container status on: $DB_IP:$DB_PORT"
  local interval=3
  local counter=0
  local db_booted=false


  __process_msg "Waiting 10 seconds for db boot"
  sleep 10

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

  local db_container=$(sudo docker ps -q -f "name=$COMPONENT" | awk '{print $1}')
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
    __run_db
    __process_msg "Database container successfully running"
  fi
}

main
