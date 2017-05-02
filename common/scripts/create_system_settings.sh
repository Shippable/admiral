#!/bin/bash -e

export COMPONENT="db"
export LOGS_FILE="$RUNTIME_DIR/logs/$COMPONENT.log"

## Write logs of this script to component specific file
exec &> >(tee -a "$LOGS_FILE")

__validate_db_envs() {
  __process_msg "Creating system settings table"
  __process_msg "LOGS_FILE:$LOGS_FILE"
}

__upsert_system_settings() {
  __process_msg "Upserting system settings in db"

  local system_settings_location="/etc/postgresql/config/system_settings.sql"
  local upsert_cmd="sudo docker exec db \
    psql -U $DBUSERNAME -d $DBNAME \
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
