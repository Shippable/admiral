#!/bin/bash -e

export COMPONENT="db"
export DB_DATA_DIR="$RUNTIME_DIR/$COMPONENT/data"
export DB_CONFIG_DIR="$CONFIG_DIR/$COMPONENT"
export LOGS_FILE="$RUNTIME_DIR/logs/$COMPONENT.log"

## Write logs of this script to component specific file
exec &> >(tee -a "$LOGS_FILE")

__validate_db_envs() {
  __process_msg "Creating master runtime templates"
  __process_msg "DB_DATA_DIR: $DB_DATA_DIR"
  __process_msg "DB_CONFIG_DIR: $DB_CONFIG_DIR"
  __process_msg "LOGS_FILE: $LOGS_FILE"
}

__copy_runtime_templates() {
  __process_msg "Copying runtime_templates.sql to db container"
  local host_location="$SCRIPTS_DIR/configs/create_master_runtime_templates.sql"
  local container_location="$CONFIG_DIR/db/create_master_runtime_templates.sql"
  sudo cp -vr $host_location $container_location

  __process_msg "Successfully copied create_master_runtime_templates.sql to db container"
}

__insert_master_runtime_templates() {
  __process_msg "Inserting master runtime templates"
  local master_runtime_template_location="$DB_CONFIG_DIR/create_master_runtime_templates.sql"
  local upsert_cmd="PGHOST=$DBHOST \
    PGPORT=$DBPORT \
    PGDATABASE=$DBNAME \
    PGUSER=$DBUSERNAME \
    PGPASSWORD=$DBPASSWORD \
    psql \
    -U $DBUSERNAME \
    -d $DBNAME \
    -h $DBHOST \
    -v ON_ERROR_STOP=1 \
    -f $master_runtime_template_location"

  eval "$upsert_cmd"
}

main() {
  __process_marker "Inserting master runtime templates"
  __validate_db_envs
  __copy_runtime_templates
  __insert_master_runtime_templates
}

main
