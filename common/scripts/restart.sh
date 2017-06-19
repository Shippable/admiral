#!/bin/bash -e

export TIMEOUT=60

__check_admiral() {
  __process_msg "Checking if admiral container is running"
  local wait_time=3
  _shippable_get_admiral
  if [ $response_status_code -eq 503 ]; then
    __process_msg "Admiral not running, retrying in $wait_time seconds"
    sleep $wait_time
    __check_admiral
  else
    __process_msg "Admiral successfully running"
  fi
}

__start_secrets() {
  __process_marker "Starting secrets"
  __process_msg "Getting secrets config from DB"
  local secrets=""
  _shippable_get_secrets
  if [ $response_status_code -gt 299 ]; then
    __process_error "Error getting secrets: $response"
    __process_error "Status code: $response_status_code"
    exit 1
  else
    __process_msg "Successfully fetched secrets config"
    secrets=$(echo $response | jq '.')
  fi

  local secrets_ip=$(echo $secrets | jq -r '.address')

  if [ "$secrets_ip" == "$ADMIRAL_IP" ]; then
    __process_msg "Checking secrets container"
    local secrets_container=$(sudo docker ps -a -q -f "name=secrets" | awk '{print $1}')
    if [ "$secrets_container" != "" ]; then
      __process_msg "Found a stopped secrets container, starting it"
      sudo docker start $secrets_container
      sleep 3
    else
      __process_error "No secrets container found in stopped state, exiting"
      exit 1
    fi
  else
    __process_msg "Secrets running on a separate machine, skipping db state check"
  fi
}

__check_secrets_status() {
  __process_msg "Getting secrets status"

  local secrets=""
  _shippable_get_secrets_status
  if [ $response_status_code -gt 299 ]; then
    __process_error "Error getting secrets: $response"
    __process_error "Status code: $response_status_code"
    exit 1
  else
    __process_msg "Successfully fetched secrets status"
    secrets=$(echo $response | jq '.')
  fi

  local is_reachable=$(echo $secrets | jq -r '.isReachable')
  if [ $is_reachable == false ]; then
    __process_error "Secrets store not reachable, exiting"
    exit 1
  else
    __process_msg "Secrets store reachable"
  fi
}

__unseal() {
  __process_msg "Unsealing secrets store"

  _shippable_post_secrets_initialize
  if [ $response_status_code -gt 299 ]; then
    __process_error "Error unsealing secrets store: $response"
    __process_error "Status code: $response_status_code"
    exit 1
  else
    __process_msg "Successfully called secrets unseal route"
  fi

}

__check_unseal_status() {
  __process_msg "Checking if secrets store is unsealed"
  local interval=3
  local counter=0
  local sealed_status=true

  while [ $sealed_status == true ] && [ $counter -lt $TIMEOUT ]; do
    local secrets=""
    _shippable_get_secrets_status
    if [ $response_status_code -gt 299 ]; then
      __process_error "Error getting secrets: $response"
      __process_error "Status code: $response_status_code"
      exit 1
    else
      __process_msg "Successfully fetched secrets status"
      secrets=$(echo $response | jq '.')
    fi

    sealed_status=$(echo $secrets | jq -r '.sealed')
    if [ $sealed_status == false ]; then
      __process_msg "Secrets store successfully unsealed"
      break
    else
      __process_msg "Secrets store in sealed state, waiting"
      let "counter = $counter + $interval"
      sleep $interval
    fi
  done
}

__start_msg() {
  __process_marker "Starting msg"
  __process_msg "Getting msg config from DB"
  local msg=""
  _shippable_get_msg
  if [ $response_status_code -gt 299 ]; then
    __process_error "Error getting msg: $response"
    __process_error "Status code: $response_status_code"
    exit 1
  else
    __process_msg "Successfully fetched msg config"
    msg=$(echo $response | jq '.')
  fi

  local msg_ip=$(echo $msg | jq -r '.address')

  if [ "$msg_ip" == "$ADMIRAL_IP" ]; then
    __process_msg "Checking msg container"
    local msg_container=$(sudo docker ps -a -q -f "name=msg" | awk '{print $1}')
    if [ "$msg_container" != "" ]; then
      __process_msg "Found a stopped msg container, starting it"
      sudo docker start $msg_container
      sleep 3
    else
      __process_error "No msg container found in stopped state, exiting"
      exit 1
    fi
  else
    __process_msg "msg running on a separate machine, skipping db state check"
  fi
}

__start_state() {
  __process_marker "Starting state"
  __process_msg "Getting state config from DB"
  local state=""
  _shippable_get_state
  if [ $response_status_code -gt 299 ]; then
    __process_error "Error getting state: $response"
    __process_error "Status code: $response_status_code"
    exit 1
  else
    __process_msg "Successfully fetched state config"
    state=$(echo $response | jq '.')
  fi

  local state_ip=$(echo $state | jq -r '.address')

  if [ "$state_ip" == "$ADMIRAL_IP" ]; then
    __process_msg "Checking state container"
    local state_container=$(sudo docker ps -a -q -f "name=state" | awk '{print $1}')
    if [ "$state_container" != "" ]; then
      __process_msg "Found a stopped state container, starting it"
      sudo docker start $state_container
      sleep 3
    else
      __process_error "No state container found in stopped state, exiting"
      exit 1
    fi
  else
    __process_msg "state running on a separate machine, skipping db check"
  fi
}

__start_redis() {
  __process_marker "Starting redis"
  __process_msg "Getting redis config from DB"
  local redis=""
  _shippable_get_redis
  if [ $response_status_code -gt 299 ]; then
    __process_error "Error getting redis: $response"
    __process_error "Status code: $response_status_code"
    exit 1
  else
    __process_msg "Successfully fetched redis config"
    redis=$(echo $response | jq '.')
  fi

  local redis_ip=$(echo $redis | jq -r '.address')

  if [ "$redis_ip" == "$ADMIRAL_IP" ]; then
    __process_msg "Checking redis container"
    local redis_container=$(sudo docker ps -a -q -f "name=redis" | awk '{print $1}')
    if [ "$redis_container" != "" ]; then
      __process_msg "Found a stopped redis container, starting it"
      sudo docker start $redis_container
      sleep 3
    else
      __process_error "No redis container found in stopped state, exiting"
      exit 1
    fi
  else
    __process_msg "redis running on a separate machine, skipping db check"
  fi
}

__start_services() {
  __process_marker "Starting services"
  __process_msg "Getting all services"
  local services=""
  _shippable_get_services
  if [ $response_status_code -gt 299 ]; then
    __process_error "Error getting services list: $response"
    __process_error "Status code: $response_status_code"
    exit 1
  else
    __process_msg "Successfully fetched services list"
    services=$(echo $response | jq '.')
    services=$(echo $services \
      | jq '[ .[] | select (.isEnabled==true) ]')
  fi

  local services_count=$(echo $services | jq '. | length')
  if [ $services_count -ne 0 ]; then
    __process_msg "Starting $services_count services"

    for i in $(seq 1 $services_count); do
      local service=$(echo $services \
        | jq '.['"$i-1"']')
      local service_name=$(echo $service \
        | jq -r '.serviceName')
      local service_replicas=$(echo $service \
        | jq -r '.replicas')

      __process_msg "Starting service: $service_name"
      service='{"name": "'$service_name'", "replicas": "'$service_replicas'"}'
      _shippable_post_services "$service"
      if [ $response_status_code -gt 299 ]; then
        __process_error "Error starting service $service_name: $response"
        __process_error "Status code: $response_status_code"
        __process_error "==================== Error Logs ====================="
        local logs_file="$LOGS_DIR/$service_name.log"
        tail -$MAX_ERROR_LOG_COUNT $logs_file
        __process_error "====================================================="
        exit 1
      else
        __process_msg "Successfully started service: $service_name"
      fi
    done
  else
    __process_msg "No services available"
  fi
}

main() {
  if [ $IS_RESTART == true ]; then
    __process_marker "Restarting Shippable services"
    __check_admiral
    __start_secrets
    __check_secrets_status
    __unseal
    __check_unseal_status
    __start_msg
    __start_state
    __start_redis
    __start_services
  fi
}

main
