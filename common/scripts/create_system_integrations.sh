#!/bin/bash -e

export COMPONENT="db"
export DB_DATA_DIR="$RUNTIME_DIR/$COMPONENT/data"
export DB_CONFIG_DIR="$CONFIG_DIR/$COMPONENT"
export LOGS_FILE="$RUNTIME_DIR/logs/$COMPONENT.log"

## Write logs of this script to component specific file
exec &> >(tee -a "$LOGS_FILE")

__validate_db_envs() {
  __process_msg "Creating system integrations table"
  __process_msg "DB_DATA_DIR: $DB_DATA_DIR"
  __process_msg "DB_CONFIG_DIR: $DB_CONFIG_DIR"
  __process_msg "LOGS_FILE:$LOGS_FILE"
}


__copy_system_integrations() {
  __process_msg "Copying system_integrations.sql to db container"
  local host_location="$SCRIPTS_DIR/configs/system_integrations.sql"
  local container_location="$CONFIG_DIR/db/system_integrations.sql"
  sudo cp -vr $host_location $container_location

  __process_msg "Successfully copied system_integrations.sql to db container"
}
__upsert_system_integrations() {
  __process_msg "Upserting system integrations in db"

  local system_integrations_location="$DB_CONFIG_DIR/system_integrations.sql"
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
    -f $system_integrations_location"

  __process_msg "Executing: $upsert_cmd"
  eval "$upsert_cmd"
}

main() {
  __process_marker "Generating system integrations"
  __validate_db_envs
  __copy_system_integrations
  __upsert_system_integrations
}

main
