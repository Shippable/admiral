#!/bin/bash -e

TIMEOUT=60

install_redis() {
  echo "installing redis"
  apt-get install -o Dpkg::Options::="--force-confold" --force-yes -y redis-server
}

check_redis() {
  echo "Checking redis status on: $REDIS_HOST:$REDIS_PORT"
  local interval=3
  local counter=0
  local is_booted=false

  while [ $is_booted != true ] && [ $counter -lt $TIMEOUT ]; do
    if nc -vz $REDIS_HOST $REDIS_PORT &>/dev/null; then
      echo "Redis found"
      sleep 5
      is_booted=true
    else
      echo "Waiting for redis to start"
      let "counter = $counter + $interval"
      sleep $interval
    fi
  done
  if [ $is_booted = false ]; then
    echo "Failed to boot redis container"
    exit 1
  fi
}

main() {
  {
    check_redis=$(service --status-all 2>&1 | grep redis-server)
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
