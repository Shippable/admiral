#!/bin/base -e

main() {
  local script_name="installDb.sh"
  __process_marker "Installing database"
  if [ "$ADMIRAL_IP" == "$DB_IP" ]; then
    source "$SCRIPTS_DIR/docker/$script_name"
  else
    local script_path="$SCRIPTS_DIR/Ubuntu_14.04/$script_name"
    __check_connection "$DB_IP"
    __exec_cmd_remote "$DB_IP" "mkdir -p $SCRIPTS_DIR_REMOTE"
    __copy_script_remote "$DB_IP" "$script_path" "$SCRIPTS_DIR_REMOTE"
    local db_install_cmd="DB_IP=$DB_IP \
      DB_PORT=$DB_PORT \
      DB_USER=$DB_USER \
      DB_NAME=$DB_NAME \
      DB_PASSWORD=$DB_PASSWORD \
      DB_DIALECT=$DB_DIALECT \
      $SCRIPTS_DIR_REMOTE/$script_name"
    __exec_cmd_remote "$DB_IP" "$db_install_cmd"
  fi
}

main
