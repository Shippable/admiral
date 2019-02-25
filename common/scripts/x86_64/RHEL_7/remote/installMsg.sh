#!/bin/bash -e

TIMEOUT=60

install_deps() {
  echo "installing dependencies"
  yum install -y nc
  yum install -y wget
}

install_log_rotate() {
  yum install -y logrotate
}

install_rabbitmq() {
  wget "https://github.com/rabbitmq/erlang-rpm/releases/download/v19.3.6.4/erlang-19.3.6.4-1.el7.centos.x86_64.rpm"
  yum install -y "erlang-19.3.6.4-1.el7.centos.x86_64.rpm"
  rm -f "erlang-19.3.6.4-1.el7.centos.x86_64.rpm"


  local rabbitmq_version="3.6.16"
  wget "https://bintray.com/rabbitmq/rabbitmq-server-rpm/download_file?file_path=rabbitmq-server-$rabbitmq_version-1.el7.noarch.rpm" -O rabbitmq-server-$rabbitmq_version.rpm
  yum install -y "rabbitmq-server-$rabbitmq_version.rpm"
  rm -f "rabbitmq-server-$rabbitmq_version.rpm"
}

start_rabbitmq() {
  # Start
  chown -R rabbitmq:rabbitmq /var/lib/rabbitmq/mnesia
  chown -R rabbitmq:rabbitmq /var/log/rabbitmq
  ulimit -n 65536
  service rabbitmq-server restart
  systemctl enable rabbitmq-server
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
    if nc -v --send-only </dev/null $host $port &>/dev/null; then
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
  echo "Checking rabbitmq admin on $MSG_HOST:$ADMIN_PORT"
  __check_service_connection "$MSG_HOST" "$ADMIN_PORT" "MSG_ADMIN" "$TIMEOUT"
}

main() {
  check_state=""
  {
    type rabbitmq-server &> /dev/null
    check_state="state up"
    if ! nc -v --send-only </dev/null $MSG_HOST $AMQP_PORT &>/dev/null; then
      check_state=""
    fi
    if ! nc -v --send-only </dev/null $MSG_HOST $ADMIN_PORT &>/dev/null; then
      check_state=""
    fi
  } || true

  if [ ! -z "$check_state" ]; then
    echo "RabbitMQ already installed, skipping"
    return
  fi

  pushd /tmp
  install_deps
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
