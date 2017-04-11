#!/bin/bash -e

__copy_master_integrations() {
  __process_msg "Copying master_integrations.sql to db container"
  local master_integrations_host_location="$SCRIPTS_DIR/configs/master_integrations.sql"
  local master_integrations_container_location="$CONFIG_DIR/db/master_integrations.sql"
  sudo cp -vr $master_integrations_host_location $master_integrations_container_location

  __process_msg "Successfully copied master_integrations.sql to db container"
}
__upsert_master_integrations() {
  __process_msg "Upserting master integrations in db"

  local master_integrations_location="/etc/postgresql/config/master_integrations.sql"
  local upsert_cmd="sudo docker exec db \
    psql -U $DBUSERNAME -d $DBNAME \
    -v ON_ERROR_STOP=1 \
    -f $master_integrations_location"

  __process_msg "Executing: $upsert_cmd"
  eval "$upsert_cmd"
}

main() {
  __process_marker "Generating master_integrations"
  __copy_master_integrations
  __upsert_master_integrations
}

main
