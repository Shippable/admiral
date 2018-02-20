#!/bin/bash -e

sudo apt-get update

sudo apt-get install -y build-essential tcl8.5
wget http://download.redis.io/releases/redis-stable.tar.gz
tar xzf redis-stable.tar.gz
pushd redis-stable
  make
  make test
  sudo make install
  sudo REDIS_PORT=6379 \
    REDIS_CONFIG_FILE=/etc/redis/6379.conf \
    REDIS_LOG_FILE=/var/log/redis_6379.log \
    REDIS_DATA_DIR=/var/lib/redis/6379 \
    REDIS_EXECUTABLE=`command -v redis-server` ./utils/install_server.sh
popd
