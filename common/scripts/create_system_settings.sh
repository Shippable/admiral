#!/bin/bash -e

export COMPONENT="db"
export LOGS_FILE="$RUNTIME_DIR/logs/$COMPONENT.log"
export DB_CONFIG_DIR="$CONFIG_DIR/$COMPONENT"

## Write logs of this script to component specific file
exec &> >(tee -a "$LOGS_FILE")

__validate_db_envs() {
  __process_msg "Creating system settings table"
  __process_msg "LOGS_FILE:$LOGS_FILE"
  __process_msg "DB_CONFIG_DIR: $DB_CONFIG_DIR"
}

__upsert_system_settings() {
  __process_msg "Upserting system settings in db"

  local system_settings_location="$DB_CONFIG_DIR/system_settings.sql"
  local upsert_cmd="PG_HOST=$DBHOST \
    PGDATABASE=$DBNAME \
    PGUSER=$DBUSERNAME \
    PGPASSWORD=$DBPASSWORD \
    psql \
    -U $DBUSERNAME \
    -d $DBNAME \
    -h $DBHOST \
    -v ON_ERROR_STOP=1 \
    -f $system_settings_location"

  __process_msg "Executing: $upsert_cmd"
	eval "$upsert_cmd"
}

main() {
  __process_marker "Generating system settings"
  __validate_db_envs
  __upsert_system_settings
}

main
