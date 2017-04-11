#!/bin/bash -e

__copy_master_integration_fields() {
  __process_msg "Copying master_integration_fields.sql to db container"
  local master_integration_fields_host_location="$SCRIPTS_DIR/configs/master_integration_fields.sql"
  local master_integration_fields_container_location="$CONFIG_DIR/db/master_integration_fields.sql"
  sudo cp -vr $master_integration_fields_host_location $master_integration_fields_container_location

  __process_msg "Successfully copied master_integration_fields.sql to db container"
}
__upsert_master_integration_fields() {
  __process_msg "Upserting master integration fields in db"

  local master_integration_fields_location="/etc/postgresql/config/master_integration_fields.sql"
  local upsert_cmd="sudo docker exec db \
    psql -U $DBUSERNAME -d $DBNAME \
    -v ON_ERROR_STOP=1 \
    -f $master_integration_fields_location"

  __process_msg "Executing: $upsert_cmd"
  eval "$upsert_cmd"
}

main() {
  __process_marker "Generating master_integration_fields"
  __copy_master_integration_fields
  __upsert_master_integration_fields
}

main
