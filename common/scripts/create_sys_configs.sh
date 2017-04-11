#!/bin/bash -e

__copy_system_configs() {
  __process_msg "Copying systemConfigs.sql to db container"
  local system_config_host_location="$SCRIPTS_DIR/configs/system_configs.sql"
  local system_config_container_location="$CONFIG_DIR/db/system_configs.sql"
  sudo cp -vr $system_config_host_location $system_config_container_location

  __process_msg "Successfully copied systemConfigs.sql to db container"
}

__upsert_system_configs() {
  __process_msg "Upserting system configs in db"

  local system_config_location="/etc/postgresql/config/system_configs.sql"
  local upsert_cmd="sudo docker exec db \
    psql -U $DBUSERNAME -d $DBNAME \
    -v ON_ERROR_STOP=1 \
    -f $system_config_location"

  __process_msg "Executing: $upsert_cmd"
	eval "$upsert_cmd"
}

__update_release() {
  __process_msg "Updating systemConfigs with release"

  local upsert_release_cmd="sudo docker exec db \
    psql -U $DBUSERNAME -d $DBNAME \
    -v ON_ERROR_STOP=1 \
    -c \"UPDATE \\\"systemConfigs\\\" SET release='$RELEASE'\""

  __process_msg "Executing: $upsert_release_cmd"
  eval "$upsert_release_cmd"
}

main() {
  __process_marker "Generating system configs"
  __copy_system_configs
  __upsert_system_configs
  __update_release
}

main
