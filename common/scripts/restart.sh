#!/bin/bash -e

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
    else
      __process_error "No secrets container found in stopped state, exiting"
      exit 1
    fi
  else
    __process_msg "Secrets running on a separate machine, skipping db state check"
  fi
}

main() {
  if [ $IS_RESTART == true ]; then
    __process_marker "Restarting Shippable services"
    __check_admiral
    __start_secrets
  fi
}

main
