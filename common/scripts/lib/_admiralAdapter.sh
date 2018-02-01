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
  local body="$2"
  {
    RESPONSE_CODE=$(curl \
      -H "Content-Type: application/json" \
      -H "Authorization: apiToken $ADMIRAL_TOKEN" \
      -X DELETE $url \
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

### GET

_shippable_get_admiral() {
  local admiral_get_endpoint="admiral"
  __shippable_get $admiral_get_endpoint
}

_shippable_get_secrets() {
  local secrets_get_endpoint="secrets"
  __shippable_get $secrets_get_endpoint
}

_shippable_get_msg() {
  local msg_get_endpoint="msg"
  __shippable_get $msg_get_endpoint
}

_shippable_get_state() {
  local state_get_endpoint="state"
  __shippable_get $state_get_endpoint
}

_shippable_get_redis() {
  local redis_get_endpoint="redis"
  __shippable_get $redis_get_endpoint
}

_shippable_get_systemSettings() {
  local system_settings_get_endpoint="systemSettings"
  __shippable_get $system_settings_get_endpoint
}

_shippable_get_workers() {
  local workers_get_endpoint="workers"
  __shippable_get $workers_get_endpoint
}

_shippable_get_services() {
  local service="$1"
  local services_get_endpoint="services"
  if [ "$service" != "" ]; then
    services_get_endpoint="services?name=$service"
  fi
  __shippable_get $services_get_endpoint
}

_shippable_get_db() {
  local db_get_endpoint="db"
  __shippable_get $db_get_endpoint
}

_shippable_get_secrets_status() {
  local secrets_status_get_endpoint="secrets/status"
  __shippable_get $secrets_status_get_endpoint
}

_shippable_get_masterIntegrations() {
  local query="$1"
  local masterIntegrations_get_endpoint="masterIntegrations"
  if [ "$query" != "" ]; then
    masterIntegrations_get_endpoint="masterIntegrations?$query"
  fi
  __shippable_get $masterIntegrations_get_endpoint
}

### POST
_shippable_post_db() {
  local body="{}"
  local db_post_endpoint="db"
  __shippable_post $db_post_endpoint "$body"
}

_shippable_post_cleanup() {
  local body="{}"
  local db_cleanup_endpoint="db/cleanup"
  __shippable_post $db_cleanup_endpoint "$body"
}

_shippable_post_services() {
  local body="$1"
  local db_post_endpoint="services"
  __shippable_post $db_post_endpoint "$body"
}

_shippable_post_master_cleanup() {
  local master_post_endpoint="master/cleanup"
  __shippable_post $master_post_endpoint
}

_shippable_post_worker_cleanup() {
  local body="$1"
  local worker_post_endpoint="workers/cleanup"
  __shippable_post $worker_post_endpoint "$body"
}

_shippable_post_secrets_initialize() {
  local secrets_post_initialize_endpoint="secrets/initialize"
  __shippable_post $secrets_post_initialize_endpoint
}

_shippable_post_move_system_to_grisham() {
  local move_system_to_grisham="passthrough/grisham"
  __shippable_post $move_system_to_grisham
}

### PUT

_shippable_put_system_settings() {
  local systemSettingsId=1
  local update="$1"
  local system_settings_put_endpoint="systemSettings/$systemSettingsId"
  __shippable_put $system_settings_put_endpoint "$update"
}

_shippable_put_masterIntegrations() {
  local master_integration_id="$1"
  local update="$2"
  local master_integrations_put_endpoint="masterIntegrations/$master_integration_id"
  __shippable_put $master_integrations_put_endpoint "$update"
}

### DELETE
_shippable_delete_service() {
  local serviceName=$1
  local body=$2
  local service_delete_by_name_endpoint="services/$serviceName"
  __shippable_delete $service_delete_by_name_endpoint $body
}
