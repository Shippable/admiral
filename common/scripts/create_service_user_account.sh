#!/bin/bash -e

export COMPONENT="db"
export DB_DATA_DIR="$RUNTIME_DIR/$COMPONENT/data"
export DB_CONFIG_DIR="$CONFIG_DIR/$COMPONENT"
export LOGS_FILE="$RUNTIME_DIR/logs/$COMPONENT.log"

## Write logs of this script to component specific file
exec &> >(tee -a "$LOGS_FILE")

__validate_db_envs() {
  __process_msg "Creating service user account"
  __process_msg "DB_DATA_DIR: $DB_DATA_DIR"
  __process_msg "DB_CONFIG_DIR: $DB_CONFIG_DIR"
  __process_msg "LOGS_FILE:$LOGS_FILE"
}
__upsert_service_user_account() {
  __process_msg "Upserting the service user account in db"
  local service_user_account_location="$DB_CONFIG_DIR/service_user_account.sql"
  local upsert_cmd="PG_HOST=$DBHOST \
    PGDATABASE=$DBNAME \
    PGUSER=$DBUSERNAME \
    PGPASSWORD=$DBPASSWORD \
    psql \
    -U $DBUSERNAME \
    -d $DBNAME \
    -h $DBHOST \
    -v ON_ERROR_STOP=1 \
    -f $service_user_account_location"

  __process_msg "Executing: $upsert_cmd"
  eval "$upsert_cmd"
}

main() {
  __process_marker "Generating the service user account"
  __validate_db_envs
  __upsert_service_user_account
}

main
