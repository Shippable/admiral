#!/bin/bash -e

sudo apt-get update

sudo apt-get install -y build-essential tcl8.5
wget http://download.redis.io/releases/redis-stable.tar.gz
tar xzf redis-stable.tar.gz
pushd redis-stable
  make
  make test
  sudo make install
  sudo ./utils/install_server.sh
popd
