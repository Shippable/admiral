#!/bin/bash -e

readonly BBS_MIGRATION_VERSION=v6.3.4
SHOULD_RUN_BBS_MIGRATION=false
export COMPONENT="db"
export DB_DATA_DIR="$RUNTIME_DIR/$COMPONENT/data"
export DB_CONFIG_DIR="$CONFIG_DIR/$COMPONENT"
export LOGS_FILE="$RUNTIME_DIR/logs/$COMPONENT.log"

## Write logs of this script to component specific file
exec &> >(tee -a "$LOGS_FILE")

__compare_versions() {
  local current_release="$1"
  if [ "$current_release" != "master" ]; then
    if [  "$current_release" == "`echo -e "$current_release\n$BBS_MIGRATION_VERSION" | sort -V | head -n1`" ]; then
      SHOULD_RUN_BBS_MIGRATION=true
    fi
  fi
}

__validate_db_envs() {
  __process_msg "Migrating database"
  __process_msg "DB_DATA_DIR: $DB_DATA_DIR"
  __process_msg "DB_CONFIG_DIR: $DB_CONFIG_DIR"
  __process_msg "LOGS_FILE:$LOGS_FILE"
}

__copy_migrations() {
  __process_msg "Copying update bbs accountIntegrations sql to db container"
  local migrations_host_location="$MIGRATIONS_DIR/bitbucket_server/update_bbs_accountIntegrations.sql"
  local migrations_container_location="$CONFIG_DIR/db/update_bbs_accountIntegrations.sql"
  sudo cp -vr $migrations_host_location $migrations_container_location

  __process_msg "Successfully copied update_bbs_accountIntegrations.sql to db container"
}

__migrate() {
  __process_msg "Running update bbs accountIntegrations migrations"

  local migrations_location="$DB_CONFIG_DIR/update_bbs_accountIntegrations.sql"

  local upsert_cmd="PGHOST=$DB_IP \
    PGPORT=$DB_PORT \
    PGDATABASE=$DB_NAME \
    PGUSER=$DB_USER \
    PGPASSWORD=$DB_PASSWORD \
    psql \
    -U $DB_USER \
    -d $DB_NAME \
    -h $DB_IP \
    -v ON_ERROR_STOP=1 \
    -f $migrations_location"

  eval "$upsert_cmd"
}

__update_bbs_accountIntegrations() {
  __compare_versions $1
  if $SHOULD_RUN_BBS_MIGRATION ; then
    __validate_db_envs
    __copy_migrations
    __migrate
  fi
}
