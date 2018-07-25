#! /bin/bash
set -e

export ADMIRAL_ENV="/etc/shippable/admiral.env"
export BOOT_WAIT=10
export VAULT_ADDR='http://127.0.0.1:8200'

__unseal_vault() {
  echo "Unsealing vault server"
  echo "Waiting $BOOT_WAIT seconds for vault server to start"
  sleep $BOOT_WAIT

  source $ADMIRAL_ENV


  if [ ! -z "$VAULT_UNSEAL_KEY1" ]; then
    echo "Applying unseal key 1 to unlock vault"
    vault unseal $VAULT_UNSEAL_KEY1
  fi

  if [ ! -z "$VAULT_UNSEAL_KEY2" ]; then
    echo "Applying unseal key 2 to unlock vault"
    vault unseal $VAULT_UNSEAL_KEY2
  fi

  if [ ! -z "$VAULT_UNSEAL_KEY3" ]; then
    echo "Applying unseal key 3 to unlock vault"
    vault unseal $VAULT_UNSEAL_KEY3
  fi

}

__unseal_vault
