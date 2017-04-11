#!/bin/bash -e

__copy_system_codes() {
  __process_msg "Copying system_codes.sql to db container"
  local host_location="$SCRIPTS_DIR/configs/system_codes.sql"
  local container_location="$CONFIG_DIR/db/system_codes.sql"
  sudo cp -vr $host_location $container_location

  __process_msg "Successfully copied system_codes.sql to db container"
}
__upsert_system_codes() {
  __process_msg "Upserting system codes in db"

  local system_codes_location="/etc/postgresql/config/system_codes.sql"
  local upsert_cmd="sudo docker exec db \
    psql -U $DBUSERNAME -d $DBNAME \
    -v ON_ERROR_STOP=1 \
    -f $system_codes_location"

  __process_msg "Executing: $upsert_cmd"
  eval "$upsert_cmd"
}

main() {
  __process_marker "Generating system codes"
  __copy_system_codes
  __upsert_system_codes
}

main
