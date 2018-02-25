#!/bin/bash -e

export COMPONENT="workers"
export WORKERS_DATA_DIR="$RUNTIME_DIR/$COMPONENT/data"
export WORKERS_CONFIG_DIR="$CONFIG_DIR/$COMPONENT"
export SCRIPTS_DIR="$SCRIPTS_DIR"
export LOGS_FILE="$RUNTIME_DIR/logs/$COMPONENT.log"
export SCRIPTS_DIR_REMOTE="/tmp/shippable"

## Write logs of this script to component specific file
exec &> >(tee -a "$LOGS_FILE")

__validate_worker_envs() {
  __process_msg "Initializing swarm worker environment variables"
  __process_msg "SCRIPTS_DIR: $SCRIPTS_DIR"
  __process_msg "WORKER_HOST: $WORKER_HOST"
  __process_msg "WORKER_PORT: $WORKER_PORT"
  __process_msg "RELEASE: $RELEASE"
  __process_msg "PRIVATE_IMAGE_REGISTRY: $PRIVATE_IMAGE_REGISTRY"
  __process_msg "PUBLIC_IMAGE_REGISTRY: $PUBLIC_IMAGE_REGISTRY"
}

__cleanup_swarm_worker() {
  __process_msg "Cleaning up swarm worker"

  if [ "$ADMIRAL_IP" == "$WORKER_HOST" ]; then
    __process_msg "Worker is the same as master, skipping cleanup"
  else
    if [ "$OPERATING_SYSTEM" == "Ubuntu_14.04" ]; then
      local node_cleanup_script="$SCRIPTS_DIR/Ubuntu_14.04/cleanupWorker.sh"
    else
      local node_update_script="$SCRIPTS_DIR/$ARCHITECTURE/$OPERATING_SYSTEM/remote/cleanupWorker.sh"
    fi
    __copy_script_remote "$WORKER_HOST" "$node_cleanup_script" "$SCRIPTS_DIR_REMOTE"
    __exec_cmd_remote "$WORKER_HOST" "$SCRIPTS_DIR_REMOTE/cleanupWorker.sh"

    local worker_cleanup_cmd="WORKER_HOST=$WORKER_HOST \
      WORKER_JOIN_TOKEN=$WORKER_JOIN_TOKEN \
      WORKER_PORT=$WORKER_PORT \
      MASTER_HOST=$MASTER_HOST \
      PRIVATE_IMAGE_REGISTRY=$PRIVATE_IMAGE_REGISTRY \
      PUBLIC_IMAGE_REGISTRY=$PUBLIC_IMAGE_REGISTRY \
      RELEASE=$RELEASE \
      $SCRIPTS_DIR_REMOTE/cleanupWorker.sh"
    __exec_cmd_remote "$WORKER_HOST" "$worker_cleanup_cmd"
  fi
}

main() {
  __process_marker "Cleaning up swarm worker"
  __validate_worker_envs
  __cleanup_swarm_worker
  __process_msg "Swarm worker cleanup successful"
}

main
