
main() {
  local docker_client_location=$LEGACY_CI_DOCKER_CLIENT_LATEST
  if [ ! -f "$LEGACY_CI_DOCKER_CLIENT_LATEST" ]; then
    IS_DOCKER_LEGACY=true
    docker_client_location=$LEGACY_CI_DOCKER_CLIENT
  fi

  REQPROC_MOUNTS="$REQPROC_MOUNTS \
    -v $BASE_DIR:$BASE_DIR \
    -v /usr/lib/x86_64-linux-gnu/libapparmor.so.1.1.0:/lib/x86_64-linux-gnu/libapparmor.so.1:rw \
    -v /var/run:/var/run:rw \
    -v $docker_client_location:/usr/bin/docker \
    -v /var/run/docker.sock:/var/run/docker.sock \
    -v $LEGACY_CI_CACHE_STORE_LOCATION:$LEGACY_CI_CACHE_STORE_LOCATION:rw \
    -v $LEGACY_CI_KEY_STORE_LOCATION:$LEGACY_CI_KEY_STORE_LOCATION:rw \
    -v $LEGACY_CI_MESSAGE_STORE_LOCATION:$LEGACY_CI_MESSAGE_STORE_LOCATION:rw \
    -v $LEGACY_CI_BUILD_LOCATION:$LEGACY_CI_BUILD_LOCATION:rw"

  DEFAULT_TASK_CONTAINER_MOUNTS="$DEFAULT_TASK_CONTAINER_MOUNTS \
    -v $docker_client_location:/usr/bin/docker \
    -v /var/run/docker.sock:/var/run/docker.sock \
    -v $NODE_SCRIPTS_LOCATION:/var/lib/shippable/node"
}

main
