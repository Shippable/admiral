#!/bin/bash -e

__setup_credentials() {
  __process_msg "Updating docker credentials to pull shippable images"

  local credentials_template="$REMOTE_SCRIPTS_DIR/credentials.template"
  local credentials_file="$REMOTE_SCRIPTS_DIR/credentials"

  sed "s#{{aws_access_key}}#$ACCESS_KEY#g" $credentials_template > $credentials_file
  sed -i "s#{{aws_secret_key}}#$SECRET_KEY#g" $credentials_file

  mkdir -p ~/.aws
  cp -v $credentials_file $HOME/.aws/
  echo "aws ecr --region us-east-1 get-login" | sudo tee /tmp/docker_login.sh
  sudo chmod +x /tmp/docker_login.sh
  local docker_login_cmd=$(eval "/tmp/docker_login.sh")
  __process_msg "Docker login generated, logging into ecr "
  eval "$docker_login_cmd"
}

__boot_admiral() {
  local admiral_container=$(sudo docker ps | grep admiral | awk '{print $1}')
  if [ "$admiral_container" != "" ]; then
    __process_msg "Admiral container already running"
  else
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
      -e RELEASE=$RELEASE \
      -e INSTALL_MODE=$INSTALL_MODE \
      -e CONFIG_DIR=$CONFIG_DIR \
      -e RUNTIME_DIR=$RUNTIME_DIR \
      -e MIGRATIONS_DIR=$MIGRATIONS_DIR \
      -e VERSIONS_DIR=$VERSIONS_DIR"

    __process_msg "Generating admiral mounts"
    local mounts=" -v $CONFIG_DIR:$CONFIG_DIR \
      -v $RUNTIME_DIR:$RUNTIME_DIR "

    local admiral_image="$SYSTEM_IMAGE_REGISTRY/admiral:$RELEASE"

    local boot_cmd="sudo docker run -d \
      $envs \
      $mounts \
      --publish 50003:50003 \
      --net=bridge \
      --name=admiral \
      $admiral_image"

    __process_msg "Executing: $boot_cmd"

    eval "$boot_cmd"
    __process_msg "Admiral container successfully running"
  fi
  __process_success "Go to $ADMIRAL_IP:50003 to access Admiral"
  __process_success "Login Token: $LOGIN_TOKEN"
}

main() {
  __process_marker "Booting Admiral UI"
  __setup_credentials
  __boot_admiral
}

main
