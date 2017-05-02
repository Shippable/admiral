#!/bin/bash -e

__stop_admiral() {
  __process_msg "Checking if admiral is running"
  local admiral_container=$(sudo docker ps | grep admiral | awk '{print $1}')
  if [ "$admiral_container" != "" ]; then
    __process_msg "Stopping running admiral container: $admiral_container"
    sudo docker stop -t=0 $admiral_container
    sudo docker rm -v $admiral_container
  fi
}

__boot_admiral() {
  __process_msg "Generating admiral ENV variables"
  local envs=" -e DBNAME=$DB_NAME \
    -e DBUSERNAME=$DB_USER \
    -e DBPASSWORD=$DB_PASSWORD \
    -e DBDIALECT=$DB_DIALECT \
    -e DBHOST=$DB_IP \
    -e DBPORT=$DB_PORT \
    -e RUN_MODE=$RUN_MODE \
    -e LOGIN_TOKEN=$LOGIN_TOKEN \
    -e ADMIRAL_IP=$ADMIRAL_IP \
    -e INSTALL_MODE=$INSTALL_MODE \
    -e PRIVATE_IMAGE_REGISTRY=$PRIVATE_IMAGE_REGISTRY \
    -e CONFIG_DIR=$CONFIG_DIR \
    -e RUNTIME_DIR=$RUNTIME_DIR"

  __process_msg "Generating admiral mounts"
  local docker_location=$(which docker)
  local mounts=" -v $CONFIG_DIR:$CONFIG_DIR \
    -v $RUNTIME_DIR:$RUNTIME_DIR \
    -v $docker_location:/usr/bin/docker \
    -v /usr/lib/x86_64-linux-gnu/libapparmor.so.1.1.0:/lib/x86_64-linux-gnu/libapparmor.so.1:rw \
    -v /usr/lib/x86_64-linux-gnu/libltdl.so.7.3.0:/lib/x86_64-linux-gnu/libltdl.so.7:rw \
    -v /var/run/docker.sock:/var/run/docker.sock"

  local admiral_image="$PUBLIC_IMAGE_REGISTRY/admiral:$RELEASE"

  local pull_cmd="sudo docker pull $admiral_image"

  __process_msg "Executing: $pull_cmd"

  eval "$pull_cmd"
  __process_msg "Admiral image successfully pulled"

  local boot_cmd="sudo docker run -d \
    $envs \
    $mounts \
    --publish 50003:50003 \
    --net=host \
    --privileged=true \
    --name=admiral \
    $admiral_image"

  __process_msg "Executing: $boot_cmd"

  eval "$boot_cmd"
  __process_msg "Admiral container successfully running"

  __process_success "Go to $ADMIRAL_IP:50003 to access Admiral"
  __process_success "Login Token: $LOGIN_TOKEN"
}

main() {
  __process_marker "Booting Admiral UI"
  __stop_admiral
  __boot_admiral
}

main
