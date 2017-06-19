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
    __process_msg "Successfully called secrects unseal route"
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

main() {
  if [ $IS_RESTART == true ]; then
    __process_marker "Restarting Shippable services"
    __check_admiral
    __start_secrets
    __check_secrets_status
    __unseal
    __check_unseal_status
  fi
}

main
