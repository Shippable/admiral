#!/bin/bash -e

__copy_vault_config() {
  __process_msg "Copying vault upstart file"

  local vault_config_path="$VAULT_CONFIG_DIR/scripts/vault.service"
  __copy_script_remote "$VAULT_HOST" "$vault_config_path" "/etc/systemd/system/"
}

__copy_vault_bootstrap() {
  __process_msg "Copying vault bootstrap file"
  local vault_bootstrap_path="$VAULT_CONFIG_DIR/scripts/vault.service"

}

__copy_vault_config
__copy_vault_bootstrap

