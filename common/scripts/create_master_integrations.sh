#!/bin/bash -e

export COMPONENT="db"
export DB_DATA_DIR="$RUNTIME_DIR/$COMPONENT/data"
export DB_CONFIG_DIR="$CONFIG_DIR/$COMPONENT"
export LOGS_FILE="$RUNTIME_DIR/logs/$COMPONENT.log"

## Write logs of this script to component specific file
exec &> >(tee -a "$LOGS_FILE")

__validate_db_envs() {
  __process_msg "Creating master integrations table"
  __process_msg "DB_DATA_DIR: $DB_DATA_DIR"
  __process_msg "DB_CONFIG_DIR: $DB_CONFIG_DIR"
  __process_msg "LOGS_FILE:$LOGS_FILE"
}


__copy_master_integrations() {
  __process_msg "Copying master_integrations.sql to db container"
  local master_integrations_host_location="$SCRIPTS_DIR/configs/master_integrations.sql"
  local master_integrations_container_location="$CONFIG_DIR/db/master_integrations.sql"
  sudo cp -vr $master_integrations_host_location $master_integrations_container_location

  __process_msg "Successfully copied master_integrations.sql to db container"
}
__upsert_master_integrations() {
  __process_msg "Upserting master integrations in db"

  local master_integrations_location="$DB_CONFIG_DIR/master_integrations.sql"
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
    -f $master_integrations_location"

  eval "$upsert_cmd"
}

main() {
  __process_marker "Generating master_integrations"
  __validate_db_envs
  __copy_master_integrations
  __upsert_master_integrations
}

main
