#!/bin/bash -e

__initialize() {
  ADMIRAL_URL="http://$ADMIRAL_IP:$ADMIRAL_PORT"
  ADMIRAL_TOKEN=$LOGIN_TOKEN
  RESPONSE_CODE=404
  RESPONSE_DATA=""
  CURL_EXIT_CODE=0

  touch $API_RESPONSE_FILE
}

__shippable_get() {
  __initialize

  local url="$ADMIRAL_URL/$1"
  {
    RESPONSE_CODE=$(curl \
      -H "Content-Type: application/json" \
      -H "Authorization: apiToken $ADMIRAL_TOKEN" \
      -X GET $url \
      --silent --write-out "%{http_code}\n" \
      --output $API_RESPONSE_FILE)
  } || {
    CURL_EXIT_CODE=$(echo $?)
  }

  if [ $CURL_EXIT_CODE -gt 0 ]; then
    # we are assuming that if curl cmd failed, API is unavailable
    response="curl failed with error code $CURL_EXIT_CODE. API might be down."
    response_status_code=503
  else
    response_status_code="$RESPONSE_CODE"
    response=$(cat $API_RESPONSE_FILE)
  fi

  rm -f $API_RESPONSE_FILE
}

__shippable_post() {
  __initialize

  local url="$ADMIRAL_URL/$1"
  local body="$2"
  {
    RESPONSE_CODE=$(curl \
      -H "Content-Type: application/json" \
      -H "Authorization: apiToken $ADMIRAL_TOKEN" \
      -X POST $url \
      -d "$body" \
      --write-out "%{http_code}\n" \
      --silent \
      --output $API_RESPONSE_FILE)
  } || {
    CURL_EXIT_CODE=$(echo $?)
  }

  if [ $CURL_EXIT_CODE -gt 0 ]; then
    # we are assuming that if curl cmd failed, API is unavailable
    response="curl failed with error code $CURL_EXIT_CODE. API might be down."
    response_status_code=503
  else
    response_status_code="$RESPONSE_CODE"
    response=$(cat $API_RESPONSE_FILE)
  fi

  rm -f $API_RESPONSE_FILE
}

__shippable_put() {
  __initialize

  local url="$ADMIRAL_URL/$1"
  local update="$2"
  {
    RESPONSE_CODE=$(curl \
      -H "Content-Type: application/json" \
      -H "Authorization: apiToken $ADMIRAL_TOKEN" \
      -X PUT $url \
      -d "$update" \
      --write-out "%{http_code}\n" \
      --silent \
      --output $API_RESPONSE_FILE)
  } || {
    CURL_EXIT_CODE=$(echo $?)
  }

  if [ $CURL_EXIT_CODE -gt 0 ]; then
    # we are assuming that if curl cmd failed, API is unavailable
    response="curl failed with error code $CURL_EXIT_CODE. API might be down."
    response_status_code=503
  else
    response_status_code="$RESPONSE_CODE"
    response=$(cat $API_RESPONSE_FILE)
  fi

  rm -f $API_RESPONSE_FILE
}

__shippable_delete() {
  __initialize

  local url="$ADMIRAL_URL/$1"
  {
    RESPONSE_CODE=$(curl \
      -H "Content-Type: application/json" \
      -H "Authorization: apiToken $ADMIRAL_TOKEN" \
      -X DELETE $url \
      --write-out "%{http_code}\n" \
      --silent \
      --output $API_RESPONSE_FILE)
  } || {
    CURL_EXIT_CODE=$(echo $?)
  }

  if [ $CURL_EXIT_CODE -gt 0 ]; then
    # we are assuming that if curl cmd failed, API is unavailable
    response="curl failed with error code $CURL_EXIT_CODE. API might be down."
    response_status_code=503
  else
    response_status_code="$RESPONSE_CODE"
    response=$(cat $API_RESPONSE_FILE)
  fi

  rm -f $API_RESPONSE_FILE
}

### GET

_shippable_get_masterIntegrations() {
  local master_integrations_get_endpoint="masterIntegrations"
  __shippable_get $master_integrations_get_endpoint
}

_shippable_get_systemIntegrations() {
  local system_integrations_get_endpoint="systemIntegrations"
  __shippable_get $system_integrations_get_endpoint
}

_shippable_get_systemMachineImages() {
  local system_machine_images_get_endpoint="systemMachineImages"
  __shippable_get $system_machine_images_get_endpoint
}

### POST

_shippable_post_systemIntegrations() {
  local body="$1"
  local system_integrations_post_endpoint="systemIntegrations"
  __shippable_post $system_integrations_post_endpoint "$body"
}

_shippable_post_systemMachineImages() {
  local body="$1"
  local system_machine_images_post_endpoint="systemMachineImages"
  __shippable_post $system_machine_images_post_endpoint "$body"
}

### PUT

_shippable_putById_masterIntegrations() {
  local masterIntegrationId=$1
  local update="$2"
  local master_integrations_putById_endpoint="masterIntegrations/$masterIntegrationId"
  __shippable_put $master_integrations_putById_endpoint "$update"
}

_shippable_putById_systemIntegrations() {
  local systemIntegrationId=$1
  local update="$2"
  local system_integrations_putById_endpoint="systemIntegrations/$systemIntegrationId"
  __shippable_put $system_integrations_putById_endpoint "$update"
}

_shippable_putById_systemMachineImages() {
  local systemMachineImageId=$1
  local update="$2"
  local system_machine_images_putById_endpoint="systemMachineImages/$systemMachineImageId"
  __shippable_put $system_machine_images_putById_endpoint "$update"
}

### DELETE

_shippable_deleteById_systemIntegrations() {
  local systemIntegrationId=$1
  local system_integrations_deleteById_endpoint="systemIntegrations/$systemIntegrationId"
  __shippable_delete $system_integrations_deleteById_endpoint
}
