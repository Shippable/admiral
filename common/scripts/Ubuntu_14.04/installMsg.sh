#!/bin/bash -e

TIMEOUT=60

install_log_rotate() {
  apt-get -y -q install wget logrotate
}

install_rabbitmq() {
  apt-get -y --force-yes install rabbitmq-server
}

start_rabbitmq() {
  # Start
  chown -R rabbitmq:rabbitmq /var/lib/rabbitmq/mnesia
  chown -R rabbitmq:rabbitmq /var/log/rabbitmq
  ulimit -n 65536
  service rabbitmq-server restart
}

# accepts arguments $host $port $serviceName $timeout
__check_service_connection() {
  local host=$1
  local port=$2
  local service=$3
  local timeout=$4
  local interval=3
  local counter=0
  local service_booted=false

  while [ $service_booted != true ] && [ $counter -lt $timeout ]; do
    if nc -vz $host $port &>/dev/null; then
      echo "$service found"
      sleep 5
      service_booted=true
    else
      echo "Waiting for $service to start"
      let "counter = $counter + $interval"
      sleep $interval
    fi
  done
  if [ $service_booted = false ]; then
    echo "Could not detect $service container for host:$host, port:$port"
    exit 1
  fi
}

check_rabbitmq() {
  echo "Checking rabbitmq status on $MSG_HOST:$AMQP_PORT"
  __check_service_connection "$MSG_HOST" "$AMQP_PORT" "rabbitmq" "$TIMEOUT"
}

enable_management_plugin() {
  echo "Enabling rabbitmq management plugin"
  /usr/sbin/rabbitmq-plugins enable rabbitmq_management
}

check_rabbitmq_management_plugin() {
  __check_service_connection "$MSG_HOST" "$AMQP_PORT" "MSG_ADMIN" "$TIMEOUT"
}

main() {
  {
    check_rabbitmq=$(service --status-all 2>&1 | grep rabbitmq-server)
    if ! nc -vz $MSG_HOST $AMQP_PORT &>/dev/null; then
      check_rabbitmq=""
    fi
    if ! nc -vz $MSG_HOST $ADMIN_PORT &>/dev/null; then
      check_rabbitmq=""
    fi
  } || {
    true
  }
  if [ ! -z "$check_rabbitmq" ]; then
    echo "RabbitMQ already installed, skipping."
    return
  fi

  pushd /tmp
  install_log_rotate
  install_rabbitmq
  start_rabbitmq
  check_rabbitmq
  enable_management_plugin
  start_rabbitmq
  check_rabbitmq_management_plugin
  popd
}

main
