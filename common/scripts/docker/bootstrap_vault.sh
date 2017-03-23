export VAULT_ADDR=http://0.0.0.0:8200

status() {
  vault status
  export EXIT_CODE=$?
}

init() {
  vault init > /vault/config/scripts/keys.txt
}

unseal() {
  KEY_1=$(grep 'Key 1:' /vault/config/scripts/keys.txt | awk '{print $NF}')
  vault unseal $KEY_1
  KEY_2=$(grep 'Key 2:' /vault/config/scripts/keys.txt | awk '{print $NF}')
  vault unseal $KEY_2
  KEY_3=$(grep 'Key 3:' /vault/config/scripts/keys.txt | awk '{print $NF}')
  vault unseal $KEY_3
  VAULT_TOKEN=$(grep 'Initial Root Token:' /vault/config/scripts/keys.txt | awk '{print substr($NF, 1, length($NF))}')

  sed -e "s/INSERTTOKENHERE/$VAULT_TOKEN/g" /vault/config/scripts/vaultToken.json.template >  /vault/config/scripts/vaultToken.json
}

auth() {
  vault auth $VAULT_TOKEN
}

mount_shippable() {
  vault mount -path=shippable generic
}

write_policy() {
  vault policy-write shippable /vault/config/scripts/policy.hcl
}

main() {
  status
  # 0 - Success
  if [ $EXIT_CODE -eq 0 ]; then
    return
  # 1 - Error
  elif [ $EXIT_CODE -eq 1 ]; then
    init
    unseal
    auth
    mount_shippable
    write_policy
  # 2 - Sealed
  else
    unseal
  fi
}

main
