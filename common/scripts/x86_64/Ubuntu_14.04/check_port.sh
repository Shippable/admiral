#!/bin/bash -e

__check_port() {
  __process_msg "Checking status on: $IP:$PORT"

  if nc -vz $IP $PORT &>/dev/null; then
    __process_msg "Port accessible"
  else
    __process_error "Port not accessible"
    exit 1
  fi
}

main() {
  __check_port
}

main
