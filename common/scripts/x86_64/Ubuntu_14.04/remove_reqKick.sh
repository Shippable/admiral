#!/bin/bash -e
export REQKICK_SERVICE_NAME_PATTERN="shippable-reqKick"
BASE_UUID="shippable_dev"

main() {
 
  local reqKick_service_name=$REQKICK_SERVICE_NAME_PATTERN-$BASE_UUID
  sudo initctl list | ( grep -o "$reqKick_service_name[a-zA-Z0-9-]*" || true ) | while read -r service; do
    sudo service $service stop || true
    sudo rm -rf /var/log/upstart/$REQKICK_SERVICE_NAME_PATTERN*
    sudo rm -rf /etc/init/$service.conf
  done

  sudo initctl reload-configuration
}

main
