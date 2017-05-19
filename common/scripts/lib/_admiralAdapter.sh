#!/bin/bash -e

readonly API_RESPONSE_FILE="$RUNTIME_DIR/.api_response"

__initialize() {
  ADMIRAL_URL="http://$ADMIRAL_IP:$ADMIRAL_PORT/api"
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

_shippable_get_systemSettings() {
  local system_settings_get_endpoint="systemSettings"
  __shippable_get $system_settings_get_endpoint
}

_shippable_get_services() {
  local services_get_endpoint="services"
  __shippable_get $services_get_endpoint
}

_shippable_get_systemIntegrations() {
  local system_integrations_get_endpoint="systemIntegrations"
  __shippable_get $system_integrations_get_endpoint
}

### POST

### PUT

_shippable_put_system_settings() {
  local systemSettingsId=1
  local update="$1"
  local system_settings_put_endpoint="systemSettings/$systemSettingsId"
  __shippable_put $system_settings_put_endpoint "$update"
}

### DELETE
_shippable_delete_service() {
  local serviceName=$1
  local service_delete_by_name_endpoint="services/$serviceName"
  __shippable_delete $service_delete_by_name_endpoint
}
