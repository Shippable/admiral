#!/bin/bash
set -e

__parse_response() {
  local api_response="$@"
  if [ -z "$api_response" ]; then
    __process_error "No response received from api, exiting"
    exit 1
  fi
  local response=$(echo $api_response | jq '.' 2>&1)
  if [[ $response = *"parse error"* ]]; then
    __process_error "Invalid response from api: $api_response"
  fi
}

__print_status() {
  local status_component="$1"
  local status_data="$2"
  local component_ip=$(echo $status_data | jq -r '.ip')
  local component_port=$(echo $status_data | jq -r '.port')
  local component_uptime=$(echo $status_data | jq -r '.uptime')
  local component_rechable=$(echo $status_data | jq -r '.isReachable')

  printf "%2s COMPONENT %5s IP %9s PORT %10s UPTIME %8s REACHABLE \n"
  printf "%10s %15s %10s %20s %10s \n" "$status_component" "$component_ip" \
    "$component_port" "$component_uptime" "$component_rechable"

  printf "\n"
}

__get_admiral_status() {
  __process_marker "Checking admiral status"
  _shippable_get_admiral_status
  __parse_response "$response"
  __print_status "admiral" "$response"
}

main() {
  __get_admiral_status
}

main
