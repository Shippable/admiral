#! /bin/bash
set -e

readonly VAULT_API_RESPONSE_FILE="/tmp/.vault_response"
readonly ADMIRAL_ENV="/etc/shippable/admiral.env"
readonly BOOT_WAIT=10

##################### Begin Vault adapter ######################################

__initialize() {
  echo "Initializing vault api adapter"
  RESPONSE_CODE=404
  RESPONSE_DATA=""
  CURL_EXIT_CODE=0

  ## VAULT_URL is imported from this config
  source $ADMIRAL_ENV

  rm -f $VAULT_API_RESPONSE_FILE || true
  touch $VAULT_API_RESPONSE_FILE
}

__vault_get() {
  __initialize

  local url="$VAULT_URL/v1/$1"
  {
    RESPONSE_CODE=$(curl \
      -X GET $url \
      -H "Content-Type: application/json" \
      --silent --write-out "%{http_code}\n" \
      --output $VAULT_API_RESPONSE_FILE)
  } || {
    CURL_EXIT_CODE=$(echo $?)
  }

  if [ $CURL_EXIT_CODE -gt 0 ]; then
    # we are assuming that if curl cmd failed, vault API is unavailable
    response="curl failed with error code $CURL_EXIT_CODE. vault might be down."
    response_status_code=503
  else
    response_status_code="$RESPONSE_CODE"
    response=$(cat $VAULT_API_RESPONSE_FILE)
  fi

  rm -f $VAULT_API_RESPONSE_FILE
}

__vault_put() {
  __initialize

  local url="$VAULT_URL/v1/$1"
  local update="$2"
  {
    RESPONSE_CODE=$(curl \
      -X PUT $url \
      -H "Content-Type: application/json" \
      -d "$update" \
      --write-out "%{http_code}\n" \
      --silent \
      --output $VAULT_API_RESPONSE_FILE)
  } || {
    CURL_EXIT_CODE=$(echo $?)
  }

  if [ $CURL_EXIT_CODE -gt 0 ]; then
    # we are assuming that if curl cmd failed, vault API is unavailable
    response="curl failed with error code $CURL_EXIT_CODE. vault might be down."
    response_status_code=503
  else
    response_status_code="$RESPONSE_CODE"
    response=$(cat $VAULT_API_RESPONSE_FILE)
  fi

  rm -f $VAULT_API_RESPONSE_FILE
}

## Methods
_vault_get_status() {
  local vault_status_endpoint="sys/health"
  __vault_get $vault_status_endpoint
}

_vault_unseal() {
  local vault_unseal_endpoint="sys/unseal"
  local unseal_payload="$1"
  __vault_put $vault_unseal_endpoint "$unseal_payload"
}

##################### End Vault adapter ######################################

__generate_unseal_payload() {
  local unseal_key="$1"
  payload='{"key": "'$unseal_key'"}'
}

__unseal_vault() {
  echo "Unsealing vault server"
  echo "Waiting $BOOT_WAIT seconds for vault server to start"
  sleep $BOOT_WAIT

  _vault_get_status
  local initialized_status=$(echo $response \
    | jq -r '.initialized')
  local sealed_status=$(echo $response \
    | jq -r '.sealed')

  if [ "$initialized_status" == "true" ]; then
    echo "Vault has already been initialized, proceeding to unseal it"
    if [ "$sealed_status" == "true" ]; then
      __generate_unseal_payload "$VAULT_UNSEAL_KEY1"
      _vault_unseal "$payload"
      echo "Unseal response: $response"

      __generate_unseal_payload "$VAULT_UNSEAL_KEY2"
      _vault_unseal "$payload"
      echo "Unseal response: $response"

      __generate_unseal_payload "$VAULT_UNSEAL_KEY3"
      _vault_unseal "$payload"
      echo "Unseal response: $response"

    else
      echo "Vault already unsealed, skipping unseal steps"
      exit 0
    fi
  else
    echo "Vault not initialized. Initialize vault before trying to unseal it"
    exit 1
  fi
}

__unseal_vault
