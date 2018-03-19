#!/bin/bash -e

export DOCKER_UPGRADE_REQUIRED=true
export INSTALL_DOCKER_SCRIPT="installDockerScript.sh"

__check_upgrade_required() {
  __process_msg "Checking if docker upgrade is required"

  local smaller_version=$(printf "$INSTALLED_DOCKER_VERSION\n$DOCKER_VERSION" | sort | head -n 1)
  if [ "$smaller_version" != "$INSTALLED_DOCKER_VERSION" ]; then
    __process_msg "Docker upgrade not required"
    DOCKER_UPGRADE_REQUIRED=false
  else
    __process_msg "Docker upgrade required"
    __create_install_docker_script
  fi
}

__remove_services() {
  __process_msg "Removing all the services"

  local current_services=$(sudo docker service ls -q)
  if [ ! -z "$current_services" ]; then
    sudo docker service rm $current_services || true
  fi
}

__create_install_docker_script() {
  if $DOCKER_UPGRADE_REQUIRED; then
    __process_msg "Creating docker install script"

    rm -f $INSTALL_DOCKER_SCRIPT
    touch $INSTALL_DOCKER_SCRIPT
    echo '#!/bin/bash' >> $INSTALL_DOCKER_SCRIPT
    echo 'install_docker_only="true"' >> $INSTALL_DOCKER_SCRIPT
    echo "SHIPPABLE_HTTP_PROXY=\"$SHIPPABLE_HTTP_PROXY\"" >> installDockerScript.sh
    echo "SHIPPABLE_HTTPS_PROXY=\"$SHIPPABLE_HTTPS_PROXY\"" >> installDockerScript.sh
    echo "SHIPPABLE_NO_PROXY=\"$SHIPPABLE_NO_PROXY\"" >> installDockerScript.sh

    local node_scripts_location=/tmp/node
    local node_s3_location="https://s3.amazonaws.com/shippable-artifacts/node/$RELEASE/node-$RELEASE.tar.gz"

    pushd /tmp
    mkdir -p $node_scripts_location
    wget $node_s3_location
    tar -xzf node-$RELEASE.tar.gz -C $node_scripts_location --strip-components=1
    rm -rf node-$RELEASE.tar.gz
    popd

    cat $node_scripts_location/lib/logger.sh >> $INSTALL_DOCKER_SCRIPT
    cat $node_scripts_location/lib/headers.sh >> $INSTALL_DOCKER_SCRIPT
    cat $node_scripts_location/initScripts/$ARCHITECTURE/$OPERATING_SYSTEM/Docker_"$DOCKER_VERSION".sh >> $INSTALL_DOCKER_SCRIPT

    rm -rf $node_scripts_location
    # Install Docker
    chmod +x $INSTALL_DOCKER_SCRIPT
  fi
}

__upgrade_docker_version_on_swarm_workers() {
  if $DOCKER_UPGRADE_REQUIRED; then
    __process_msg "Upgrading docker version on swarm workers"

    local system_settings="PGPASSWORD=$DB_PASSWORD \
      psql \
      -U $DB_USER \
      -d $DB_NAME \
      -h $DB_IP \
      -p $DB_PORT \
      -v ON_ERROR_STOP=1 \
      -tc 'SELECT workers from \"systemSettings\"; '"

    {
      system_settings=`eval $system_settings` &&
      __process_msg "'systemSettings' table exists, finding workers"
    } || {
      __process_msg "'systemSettings' table does not exist, skipping"
      return
    }

    local workers=$(echo $system_settings | jq '.')
    local workers_count=$(echo $workers | jq '. | length')

    __process_msg "Found $workers_count workers"
    for i in $(seq 1 $workers_count); do
      local worker=$(echo $workers | jq '.['"$i-1"']')
      local host=$(echo $worker | jq -r '.address')
      local is_initialized=$(echo $worker | jq -r '.isInitialized')
      if [ $is_initialized == false ]; then
        __process_msg "worker $host not initialized, skipping"
        continue
      fi

      if [ $host == $ADMIRAL_IP ]; then
        continue
      fi

      __copy_script_remote "$host" "$INSTALL_DOCKER_SCRIPT" "$SCRIPTS_DIR_REMOTE"
      __exec_cmd_remote "$host" "$SCRIPTS_DIR_REMOTE/$INSTALL_DOCKER_SCRIPT"
    done
  fi
}

__upgrade_docker_version() {
  if $DOCKER_UPGRADE_REQUIRED; then
    __process_msg "Upgrading docker to $DOCKER_VERSION"

    ./$INSTALL_DOCKER_SCRIPT
  fi
}

__upgrade_awscli_version() {
  pip install awscli==$AWSCLI_VERSION
}

__restart_db_container() {
  if $DOCKER_UPGRADE_REQUIRED; then
    local db_container=$(sudo docker ps -a -q -f "name=db" | awk '{print $1}')
    if [ ! -z "$db_container" ]; then
      __process_msg "Found a stopped db container, starting it"
      sudo docker start $db_container
      sleep 3
    else
      __process_msg "DB not running as a container"
    fi
  fi
}

__restart_admiral() {
  if $DOCKER_UPGRADE_REQUIRED; then
    __process_msg "Restarting admiral container"
    local admiral_container=$(sudo docker ps -a -q -f "name=admiral" | awk '{print $1}')
    if [ ! -z "$admiral_container" ]; then
      __process_msg "Found a stopped admiral container, starting it"
      sudo docker start $admiral_container
      sleep 10
    else
      __process_error "No admiral container found in stopped state, exiting"
      exit 1
    fi
  fi
}

__restart() {
  if $DOCKER_UPGRADE_REQUIRED; then
    IS_RESTART=true
    export skip_starting_services=true
    source $SCRIPTS_DIR/restart.sh
    IS_RESTART=false
  fi
}

main() {
  __process_marker "Upgrading docker"

  __check_upgrade_required
  __remove_services
  __upgrade_docker_version_on_swarm_workers
  __upgrade_docker_version
  __upgrade_awscli_version
  __set_installed_docker_version
  __restart_db_container
  __restart_admiral
  __restart

  rm -f "$INSTALL_DOCKER_SCRIPT"
}

main
