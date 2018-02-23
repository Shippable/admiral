#!/bin/bash -e

__copy_vault_config() {
  __process_msg "Copying vault upstart file"

  local upstart_config_path="$VAULT_CONFIG_DIR/scripts/vault.conf"
  __copy_script_remote "$VAULT_HOST" "$upstart_config_path" "/etc/init"
}

__copy_vault_config
