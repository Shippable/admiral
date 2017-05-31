#!/bin/bash -e

readonly LOGS_FILE="/var/log/admiral_init.log"
readonly ADMIRAL_ENV="/etc/shippable/admiral.env"

exec &> >(tee -a "$LOGS_FILE")

main() {
  echo "Initializing Shippable server installer"
  if [ -f "$ADMIRAL_ENV" ]; then
    echo "=============== Admiral ENV ================"
    cat $ADMIRAL_ENV
  else
    echo "Admiral env file not present, exiting"
  fi
}

main
