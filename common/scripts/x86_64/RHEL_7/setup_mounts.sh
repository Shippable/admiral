#!/bin/bash -e

main() {
  rm -rf $SHIPPABLE_RUNTIME_DIR
  mkdir -p $BASE_DIR
  mkdir -p $REQPROC_DIR
  mkdir -p $REQEXEC_DIR
  mkdir -p $REQKICK_DIR
  mkdir -p $BUILD_DIR
  mkdir -p $LEGACY_CI_CACHE_STORE_LOCATION
  mkdir -p $LEGACY_CI_KEY_STORE_LOCATION
  mkdir -p $LEGACY_CI_MESSAGE_STORE_LOCATION
  mkdir -p $LEGACY_CI_BUILD_LOCATION

  REQPROC_MOUNTS="$REQPROC_MOUNTS \
    -v $BASE_DIR:$BASE_DIR \
    -v /opt/docker/docker:/usr/bin/docker \
    -v /var/run/docker.sock:/var/run/docker.sock \
    -v $LEGACY_CI_CACHE_STORE_LOCATION:$LEGACY_CI_CACHE_STORE_LOCATION:rw \
    -v $LEGACY_CI_KEY_STORE_LOCATION:$LEGACY_CI_KEY_STORE_LOCATION:rw \
    -v $LEGACY_CI_MESSAGE_STORE_LOCATION:$LEGACY_CI_MESSAGE_STORE_LOCATION:rw \
    -v $LEGACY_CI_BUILD_LOCATION:$LEGACY_CI_BUILD_LOCATION:rw"

  DEFAULT_TASK_CONTAINER_MOUNTS="$DEFAULT_TASK_CONTAINER_MOUNTS \
    -v /opt/docker/docker:/usr/bin/docker \
    -v /var/run/docker.sock:/var/run/docker.sock \
    -v $NODE_SCRIPTS_LOCATION:/var/lib/shippable/node"
}

main
