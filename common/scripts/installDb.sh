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
     __process_msg "Creating a test table to verify database connection"
     eval "$create_table_cmd"
     __process_msg "Dropping a test table"
     eval "$drop_table_cmd"
     __process_msg "Successfully tested connection to $DB_IP $DB_PORT"
  elif [ "$DEV_MODE" == "true" ]; then
    source "$SCRIPTS_DIR/docker/$script_name"
    DB_INSTALLED="true"
  else
    __check_connection "$DB_IP"

    local proxy_script_name="configureProxy.sh"
    local proxy_config_script="$SCRIPTS_DIR/$proxy_script_name"
    __copy_script_remote "$DB_IP" "$proxy_config_script" "$SCRIPTS_DIR_REMOTE"
    local proxy_config_install_cmd="SHIPPABLE_HTTP_PROXY=$SHIPPABLE_HTTP_PROXY \
      SHIPPABLE_HTTPS_PROXY=$SHIPPABLE_HTTPS_PROXY \
      SHIPPABLE_NO_PROXY=$SHIPPABLE_NO_PROXY \
      $SCRIPTS_DIR_REMOTE/$proxy_script_name"
    __exec_cmd_remote "$DB_IP" "$proxy_config_install_cmd"

    local node_update_script="$SCRIPTS_DIR/$ARCHITECTURE/$OPERATING_SYSTEM/remote/setupNode.sh"
    __copy_script_remote "$DB_IP" "$node_update_script" "$SCRIPTS_DIR_REMOTE"
    __exec_cmd_remote "$DB_IP" "$SCRIPTS_DIR_REMOTE/setupNode.sh"

    local script_path="$SCRIPTS_DIR/$ARCHITECTURE/$OPERATING_SYSTEM/remote/$script_name"
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
    DB_INSTALLED="true"
  fi
}

main() {
  __process_marker "Installing database"
  __validate_db_envs
  __validate_db_mounts
  __install_db
}

main
