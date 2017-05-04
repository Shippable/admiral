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

__upsert_vault_store() {
  __process_msg "Upserting vault store in db"

  local vault_script_host_location="$SCRIPTS_DIR/configs/vault_kv_store.sql"

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
    -f $vault_script_host_location"

  __process_msg "Executing: $upsert_cmd"
  eval "$upsert_cmd"
}

main() {
  __process_marker "Creating vault table in database"
  __validate_vault_store
  __upsert_vault_store
}

main
