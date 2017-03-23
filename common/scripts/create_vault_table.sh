#!/bin/bash -e

export COMPONENT="vault"
export VAULT_CONFIG_DIR="$CONFIG_DIR/$COMPONENT"

__validate_vault_store() {
  __process_msg "Validating vault store script"

  if [ ! -d "$VAULT_CONFIG_DIR" ]; then
    __process_msg "Vault config dir not present, creating"
    sudo mkdir -p "$VAULT_CONFIG_DIR"
  else
    __process_msg "Vault config dir already present"
  fi
}

__copy_script() {
  __process_msg "Copying vault sql to configs dir $CONFIG_DIR/db"
  local vault_script_host_location="$SCRIPTS_DIR/configs/vault_kv_store.sql"
  local vault_script_container_location="$CONFIG_DIR/db/system_configs.sql"

  sudo cp -vr $SCRIPTS_DIR/configs/vault_kv_store.sql $CONFIG_DIR/db
}

__upsert_vault_store() {
  __process_msg "Upserting vault store in db"

  local vault_script_location="/etc/postgresql/config/vault_kv_store.sql"
  local upsert_cmd="sudo docker exec db \
    psql -U $DB_USER -d $DB_NAME \
    -v ON_ERROR_STOP=1 \
    -f $vault_script_location"

  __process_msg "Executing: $upsert_cmd"
	eval "$upsert_cmd"
}

main() {
  __process_marker "Creating vault table in database"
  __validate_vault_store
  __copy_script
  __upsert_vault_store
}

main
