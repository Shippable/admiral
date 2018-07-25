#!/bin/bash -e

export VAULT_CONFIG_PATH="/etc/shippable/secrets/scripts"
export VAULT_SYSTEMD_PATH="/etc/systemd/system/"

__copy_vault_config() {
  __process_msg "Copying vault upstart file"

  local vault_config_path="$VAULT_CONFIG_DIR/scripts/vault.service"
  __copy_script_remote "$VAULT_HOST" "$vault_config_path" "$VAULT_SYSTEMD_PATH"
}

__copy_vault_bootstrap() {
  __process_msg "Copying vault bootstrap file"
  local vault_bootstrap_path="$VAULT_CONFIG_DIR/scripts/bootstrap_vault.sh"
  __copy_script_remote "$VAULT_HOST" "$vault_bootstrap_path" "$VAULT_CONFIG_PATH"

}

__copy_vault_config
__copy_vault_bootstrap

