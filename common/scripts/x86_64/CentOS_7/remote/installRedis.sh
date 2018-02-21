#!/bin/bash -e

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
  sudo yum install -y epel-release
  sudo yum update -y
  sudo yum install -y redis
  sudo systemctl start redis
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
    if redis-cli -h $host -p $port PING &>/dev/null; then
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
    check_redis=$(systemctl 2>&1 | grep redis)
    if ! redis-cli -h "$REDIS_HOST" -p "$REDIS_PORT" PING &>/dev/null; then
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
