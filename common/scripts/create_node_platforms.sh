#!/bin/bash -e
export COMPONENT="db"
export DB_DATA_DIR="$RUNTIME_DIR/$COMPONENT/data"
export DB_CONFIG_DIR="$CONFIG_DIR/$COMPONENT"
export LOGS_FILE="$RUNTIME_DIR/logs/$COMPONENT.log"

## Write logs of this script to component specific file
exec &> >(tee -a "$LOGS_FILE")

__validate_db_envs() {
  __process_msg "Creating node platforms table"
  __process_msg "DB_DATA_DIR: $DB_DATA_DIR"
  __process_msg "DB_CONFIG_DIR: $DB_CONFIG_DIR"
  __process_msg "LOGS_FILE:$LOGS_FILE"
}

__copy_node_platforms() {
  __process_msg "Copying node_platforms.sql to db container"
  local host_location="$SCRIPTS_DIR/configs/node_platforms.sql"
  local container_location="$CONFIG_DIR/db/node_platforms.sql"
  sudo cp -vr $host_location $container_location

  __process_msg "Successfully copied node_platforms.sql to db container"
}
__upsert_node_platforms() {
  __process_msg "Upserting node platforms in db"

  local node_platforms_location="$DB_CONFIG_DIR/node_platforms.sql"
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
    -f $node_platforms_location"

  eval "$upsert_cmd"
}

main() {
  __process_marker "Generating node platforms"
  __validate_db_envs
  __copy_node_platforms
  __upsert_node_platforms
}

main
