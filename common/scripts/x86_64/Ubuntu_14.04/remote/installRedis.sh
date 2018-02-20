#!/bin/bash -e

REDIS_VERSION="4.0.8"
TIMEOUT=60

set_defaults() {
  if [ -z "$REDIS_HOST" ]; then
    REDIS_HOST="127.0.0.1"
  fi
  if [ -z "$REDIS_PORT" ]; then
    REDIS_PORT=6379
  fi
}

install_redis() {
  echo "installing redis"

  sudo apt-get update
  sudo apt-get install -y build-essential tcl8.5
  wget http://download.redis.io/releases/redis-$REDIS_VERSION.tar.gz
  tar xzf redis-$REDIS_VERSION.tar.gz
  pushd redis-$REDIS_VERSION
    make
    make test
    sudo make install
    sudo REDIS_PORT=$REDIS_PORT \
      REDIS_CONFIG_FILE=/etc/redis/$REDIS_PORT.conf \
      REDIS_LOG_FILE=/var/log/redis_$REDIS_PORT.log \
      REDIS_DATA_DIR=/var/lib/redis/$REDIS_PORT \
      REDIS_EXECUTABLE=`command -v redis-server` ./utils/install_server.sh
  popd
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

check_redis() {
  echo "Checking redis status on: $REDIS_HOST:$REDIS_PORT"
  __check_service_connection "$REDIS_HOST" "$REDIS_PORT" "redis" "$TIMEOUT"
}

main() {
  set_defaults

  {
    # By default, redis service gets the name of format redis_<REDIS_PORT>
    check_redis=$(service --status-all 2>&1 | grep redis_$REDIS_PORT)
    if ! nc -vz $REDIS_HOST $REDIS_PORT &>/dev/null; then
      check_redis=""
    fi
  } || {
    true
  }

  if [ ! -z "$check_redis" ]; then
    echo "Redis already installed, skipping."
    return
  fi

  install_redis
  check_redis
}

main
