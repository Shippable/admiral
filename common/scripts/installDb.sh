#!/bin/base -e

export COMPONENT="db"
export DB_DATA_DIR="$RUNTIME_DIR/$COMPONENT/data"
export DB_CONFIG_DIR="$CONFIG_DIR/$COMPONENT/"

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

__install_db() {
  local script_name="installDb.sh"
  if [ "$DB_INSTALLED" == "true" ]; then
    __process_msg "Skipping database installation"
    local create_table_cmd="PGPASSWORD=$DB_PASSWORD \
      psql \
      -U $DB_USER \
      -d $DB_NAME \
      -h $DB_IP \
      -p $DB_PORT \
      -v ON_ERROR_STOP=1 \
      -c 'CREATE TABLE \"testTable\" (\"testColumn\" integer PRIMARY KEY);'"
    local drop_table_cmd="PGPASSWORD=$DB_PASSWORD \
      psql \
      -U $DB_USER \
      -d $DB_NAME \
      -h $DB_IP \
      -p $DB_PORT \
      -v ON_ERROR_STOP=1 \
      -c 'DROP TABLE \"testTable\";'"
     __process_msg "Creating a test table"
     eval "$create_table_cmd"
     __process_msg "Dropping test table"
     eval "$drop_table_cmd"
  elif [ "$ADMIRAL_IP" == "$DB_IP" ]; then
    source "$SCRIPTS_DIR/docker/$script_name"
  else
    local script_path="$SCRIPTS_DIR/Ubuntu_14.04/$script_name"
    __check_connection "$DB_IP"
    __exec_cmd_remote "$DB_IP" "mkdir -p $SCRIPTS_DIR_REMOTE"
    __copy_script_remote "$DB_IP" "$script_path" "$SCRIPTS_DIR_REMOTE"
    local db_install_cmd="DB_IP=$DB_IP \
      DB_PORT=$DB_PORT \
      DB_USER=$DB_USER \
      DB_NAME=$DB_NAME \
      DB_PASSWORD=$DB_PASSWORD \
      DB_DIALECT=$DB_DIALECT \
      $SCRIPTS_DIR_REMOTE/$script_name"
    __exec_cmd_remote "$DB_IP" "$db_install_cmd"
  fi

}

main() {
  __process_marker "Installing database"
  __validate_db_envs
  __validate_db_mounts
  __install_db
}

main
