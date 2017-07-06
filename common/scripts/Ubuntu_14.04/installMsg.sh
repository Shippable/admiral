#!/bin/bash -e

TIMEOUT=30

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

check_rabbitmq() {
  echo "Checking rabbitmq status on $MSG_HOST:$AMQP_PORT"
  local interval=3
  local counter=0
  local is_booted=false

  while [ $is_booted != true ] && [ $counter -lt $TIMEOUT ]; do
    if nc -vz $MSG_HOST $AMQP_PORT &>/dev/null; then
      echo "Rabbitmq found"
      sleep 5
      is_booted=true
    else
      echo "Waiting for rabbitmq to start"
      let "counter = $counter + $interval"
      sleep $interval
    fi
  done
  if [ $is_booted = false ]; then
    echo "Failed to boot rabbitmq"
    echo "Port $AMQP_PORT not available for msg"
    exit 1
  fi
}

enable_management_plugin() {
  echo "Enabling rabbitmq management plugin"
  /usr/sbin/rabbitmq-plugins enable rabbitmq_management
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
  check_rabbitmq
  popd
}

main
