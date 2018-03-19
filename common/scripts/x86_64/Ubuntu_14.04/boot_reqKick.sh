#!/bin/bash -e

main() {

  if [ ! -z $BASE_UUID ]; then
    local reqKick_service_name=$REQKICK_SERVICE_NAME_PATTERN-$BASE_UUID
  else
    local reqKick_service_name=$REQKICK_SERVICE_NAME_PATTERN
  fi
  local reqKick_config_file=/etc/init/$reqKick_service_name.conf

  cp $REQKICK_SERVICE_DIR/shippable-reqKick.conf.template $reqKick_config_file

  sed -i "s#{{STATUS_DIR}}#$STATUS_DIR#g" $reqKick_config_file
  sed -i "s#{{SCRIPTS_DIR}}#$SCRIPTS_DIR#g" $reqKick_config_file
  sed -i "s#{{REQEXEC_BIN_PATH}}#$REQEXEC_BIN_PATH#g" $reqKick_config_file
  sed -i "s#{{RUN_MODE}}#$RUN_MODE#g" $reqKick_config_file
  sed -i "s#{{UUID}}#$BASE_UUID#g" $reqKick_config_file

  sudo service $reqKick_service_name start

  {
    echo "Checking if $reqKick_service_name is active"
    local check_reqKick_is_active=$(sudo initctl status $reqKick_service_name)
    echo $check_reqKick_is_active
  } ||
  {
    echo "$reqKick_service_name failed to start"
    sudo tail -n 100 /var/log/upstart/$reqKick_service_name.log || true
    exit 1
  }
}

main
