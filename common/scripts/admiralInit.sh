#!/bin/bash -e

readonly LOGS_FILE="/var/log/upstart/admiralInit.log"
readonly ADMIRAL_ENV="/etc/shippable/admiral.env"
readonly ADMIRAL_HOME="/home/ubuntu/admiral"
readonly RUN_MODE=production

export UUID=""
export IP_ADDR=""

exec &> >(tee -a "$LOGS_FILE")

__get_uuid() {
  echo "Getting the UUID for instance"
  local uuid=$(curl http://169.254.169.254/latest/meta-data/instance-id)

  if [ "$uuid" == "" ]; then
    echo "Empty uuid, exiting"
    exit 1
  else
    echo "Instance UUID: $uuid"
    export UUID=$uuid
  fi
}

__set_login_token() {
  echo "Setting login token"
  if [ -z "$LOGIN_TOKEN" ] || [ "$LOGIN_TOKEN" == "" ]; then
    echo "LOGIN_TOKEN empty in admiral.env, setting the value"
    sed -i 's/.*LOGIN_TOKEN=.*/LOGIN_TOKEN="'$UUID'"/g' $ADMIRAL_ENV
    export LOGIN_TOKEN=$UUID
  else
    echo "LOGIN_TOKEN already set, skipping"
  fi
}

__set_db_password() {
  echo "Setting database password"
  if [ -z "$DB_PASSWORD" ] || [ "$DB_PASSWORD" == "" ]; then
    echo "DB_PASSWORD empty in admiral.env, setting the value"
    sed -i 's/.*DB_PASSWORD=.*/DB_PASSWORD="'$UUID'"/g' $ADMIRAL_ENV
    export DB_PASSWORD=$UUID
  else
    echo "DB_PASSWORD already set, skipping"
  fi

}

__set_ip() {
  echo "Setting IP address"
  local admiral_ip=$(curl http://169.254.169.254/latest/meta-data/local-ipv4)

  if [ -z "$ADMIRAL_IP" ] || [ "$ADMIRAL_IP" == "" ]; then
    echo "ADMIRAL_IP empty in admiral.env, setting it to: $admiral_ip"
    sed -i 's/.*ADMIRAL_IP=.*/ADMIRAL_IP="'$admiral_ip'"/g' $ADMIRAL_ENV
    export ADMIRAL_IP=$admiral_ip
  else
    echo "ADMIRAL_IP already set, skipping"
  fi

  if [ -z "$DB_IP" ] || [ "$DB_IP" == "" ]; then
    echo "DB_IP empty in admiral.env, setting it to: $admiral_ip"
    sed -i 's/.*DB_IP=.*/DB_IP="'$admiral_ip'"/g' $ADMIRAL_ENV
    export DB_IP=$admiral_ip
  else
    echo "DB_IP already set, skipping"
  fi

  local db_port=5432
  if [ -z "$DB_PORT" ] || [ "$DB_PORT" == "" ]; then
    echo "DB_PORT empty in admiral.env, setting it to: $db_port"
    sed -i 's/.*DB_PORT=.*/DB_PORT="'$db_port'"/g' $ADMIRAL_ENV
    export DB_PORT=$db_port
  else
    echo "DB_PORT already set, skipping"
  fi

}

__set_run_mode() {
  echo "Setting runmode"
  echo "Setting RUN_MODE to: $RUN_MODE"
  sed -i 's/.*RUN_MODE=.*/RUN_MODE="'$RUN_MODE'"/g' $ADMIRAL_ENV
  export RUN_MODE=$RUN_MODE
}

__start() {
  echo "Starting admiral"
  local start_cmd="/bin/bash $ADMIRAL_HOME/admiral.sh install --silent"
  echo "Executing: $start_cmd"

  eval "$start_cmd"
}

main() {
  echo "Initializing Shippable server installer"
  if [ -f "$ADMIRAL_ENV" ]; then
    echo "=============== Admiral ENV ================"
    cat $ADMIRAL_ENV
    . $ADMIRAL_ENV
    echo "============== End Admiral ENV ============="
    __get_uuid
    __set_login_token
    __set_db_password
    __set_ip
    __set_run_mode
    __start
    echo "Admiral init complete"
  else
    echo "Admiral env file not present, exiting"
  fi
}

main
