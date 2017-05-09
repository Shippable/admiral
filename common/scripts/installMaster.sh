#!/bin/bash -e

export COMPONENT="master"
export MASTER_DATA_DIR="$RUNTIME_DIR/$COMPONENT/data"
export MASTER_CONFIG_DIR="$CONFIG_DIR/$COMPONENT"
export SCRIPTS_DIR="$SCRIPTS_DIR"
export LOGS_FILE="$RUNTIME_DIR/logs/$COMPONENT.log"
export SCRIPTS_DIR_REMOTE="/tmp/shippable"

## Write logs of this script to component specific file
exec &> >(tee -a "$LOGS_FILE")

__validate_master_envs() {
  __process_msg "Initializing redis environment variables"
  __process_msg "SCRIPTS_DIR: $SCRIPTS_DIR"
  __process_msg "MASTER_HOST: $MASTER_HOST"
  __process_msg "MASTER_PORT: $MASTER_PORT"
}

__init_swarm_master() {
  __process_msg "Initializing swarm cluster"
  if [ "$MASTER_HOST" == "localhost" ]; then
    ## swarm does not accept 'localhost' as the ip address of master
    MASTER_HOST="127.0.0.1"
  fi
  sudo docker swarm init --advertise-addr $MASTER_HOST || true
}

main() {
  __process_marker "Installing swarm master"
  if [ "$IS_INSTALLED" == true ]; then
    __process_msg "Swarm master already installed, skipping"
  else
    __validate_master_envs
    __init_swarm_master
  fi
  __process_msg "Swarm master installed successfully"
}

main
