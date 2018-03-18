#!/bin/bash -e
export REQKICK_SERVICE_NAME_PATTERN="shippable-reqKick"
BASE_UUID="shippable_dev"

main() {

  local running_service_names=$(systemctl list-units -a \
    | grep $REQKICK_SERVICE_NAME_PATTERN-$BASE_UUID \
    | awk '{ print $1 }')

  if [ ! -z "$running_service_names" ]; then
    systemctl stop $running_service_names || true
    systemctl disable $running_service_names || true
  fi

  rm -rf /etc/shippable/reqKick
  rm -f /etc/systemd/system/shippable-reqKick@.service

  systemctl daemon-reload
}

main
