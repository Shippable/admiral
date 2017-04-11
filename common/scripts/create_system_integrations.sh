#!/bin/bash -e

__copy_system_integrations() {
  __process_msg "Copying system_integrations.sql to db container"
  local host_location="$SCRIPTS_DIR/configs/system_integrations.sql"
  local container_location="$CONFIG_DIR/db/system_integrations.sql"
  sudo cp -vr $host_location $container_location

  __process_msg "Successfully copied system_integrations.sql to db container"
}
__upsert_system_integrations() {
  __process_msg "Upserting system integrations in db"

  local system_integrations_location="/etc/postgresql/config/system_integrations.sql"
  local upsert_cmd="sudo docker exec db \
    psql -U $DBUSERNAME -d $DBNAME \
    -v ON_ERROR_STOP=1 \
    -f $system_integrations_location"

  __process_msg "Executing: $upsert_cmd"
  eval "$upsert_cmd"
}

main() {
  __process_marker "Generating system integrations"
  __copy_system_integrations
  __upsert_system_integrations
}

main
