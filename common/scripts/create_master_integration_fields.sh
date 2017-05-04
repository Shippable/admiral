#!/bin/bash -e

export COMPONENT="db"
export DB_DATA_DIR="$RUNTIME_DIR/$COMPONENT/data"
export DB_CONFIG_DIR="$CONFIG_DIR/$COMPONENT"
export LOGS_FILE="$RUNTIME_DIR/logs/$COMPONENT.log"

## Write logs of this script to component specific file
exec &> >(tee -a "$LOGS_FILE")

__validate_db_envs() {
  __process_msg "Creating master integration fields table"
  __process_msg "DB_DATA_DIR: $DB_DATA_DIR"
  __process_msg "DB_CONFIG_DIR: $DB_CONFIG_DIR"
  __process_msg "LOGS_FILE:$LOGS_FILE"
}


__copy_master_integration_fields() {
  __process_msg "Copying master_integration_fields.sql to db container"
  local master_integration_fields_host_location="$SCRIPTS_DIR/configs/master_integration_fields.sql"
  local master_integration_fields_container_location="$CONFIG_DIR/db/master_integration_fields.sql"
  sudo cp -vr $master_integration_fields_host_location $master_integration_fields_container_location

  __process_msg "Successfully copied master_integration_fields.sql to db container"
}
__upsert_master_integration_fields() {
  __process_msg "Upserting master integration fields in db"

  local master_integration_fields_location="$DB_CONFIG_DIR/master_integration_fields.sql"
  local upsert_cmd="PGHOST=$DBHOST \
    PGPORT=$DB_PORT \
    PGDATABASE=$DBNAME \
    PGUSER=$DBUSERNAME \
    PGPASSWORD=$DBPASSWORD \
    psql \
    -U $DBUSERNAME \
    -d $DBNAME \
    -h $DBHOST \
    -v ON_ERROR_STOP=1 \
    -f $master_integration_fields_location"

  __process_msg "Executing: $upsert_cmd"
  eval "$upsert_cmd"
}

main() {
  __process_marker "Generating master_integration_fields"
  __validate_db_envs
  __copy_master_integration_fields
  __upsert_master_integration_fields
}

main
