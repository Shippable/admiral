#!/bin/bash -e

__check_dependencies() {
  __process_marker "Checking dependencies"

  ################## Install rsync  ######################################
  if type rsync &> /dev/null && true; then
    __process_msg "'rsync' already installed"
  else
    __process_msg "Installing 'rsync'"
    yum install -y rsync
  fi

  ################## Install SSH  ########################################
  if type ssh &> /dev/null && true; then
    __process_msg "'ssh' already installed"
  else
    __process_msg "Installing 'ssh'"
    yum install -y openssh.x86_64
  fi

  ################## Install jq  #########################################
  if type jq &> /dev/null && true; then
    __process_msg "'jq' already installed"
  else
    __process_msg "Installing 'jq'"
    yum install -y epel-release
    yum install -y jq
  fi

  ################## Install curl  #######################################
  if type curl &> /dev/null && true; then
    __process_msg "'curl' already installed"
  else
    __process_msg "Installing 'curl'"
    yum install -y curl
  fi

  ################## Install nc  #######################################
  if type nc &> /dev/null && true; then
    __process_msg "'nc' already installed"
  else
    __process_msg "Installing 'nc'"
    yum install -y nc
  fi

  ################## Install NTP  ########################################
  {
    check_ntp=$(systemctl 2>&1 | grep ntp)
  } || {
    true
  }

  if [ ! -z "$check_ntp" ]; then
    __process_msg "'ntp' already installed"
  else
    __process_msg "Installing 'ntp'"
    yum install -y ntp
    systemctl restart ntpd
  fi

  ################## Setup Shippable user  ###############################
  if id -u 'shippable' >/dev/null 2>&1; then
    __process_msg "User shippable already exists"
  else
    sudo useradd -d /home/shippable -m -s /bin/bash -p shippablepwd shippable
  fi

  SHIPPABLE_SUDO_USER='shippable ALL=(ALL) NOPASSWD:ALL'
  user_exist=$(sudo sh -c "grep '$SHIPPABLE_SUDO_USER' /etc/sudoers || echo ''")
  if [ -z "$user_exist" ]; then
    sudo echo 'shippable ALL=(ALL) NOPASSWD:ALL' | sudo tee -a /etc/sudoers
  fi
  sudo chown -R $USER:$USER /home/shippable/
  sudo chown -R shippable:shippable /home/shippable/

  ################## Install Docker  #####################################
  if type docker &> /dev/null && true; then
    __process_msg "'docker' already installed, checking version"
    local docker_version=$(docker --version)
    if [[ "$docker_version" == *"$DOCKER_VERSION"* ]]; then
      __process_msg "'docker' $docker_version installed"
    else
      __process_error "Docker version $docker_version installed, required $DOCKER_VERSION"
      __process_error "Install Docker Version $DOCKER_VERSION from \"
      https://docs.docker.com/v17.06/engine/installation/linux/docker-ce/centos/"
      exit 1
    fi
  else
    __process_msg "Docker not installed, installing Docker $DOCKER_VERSION"
    rm -f installDockerScript.sh
    touch installDockerScript.sh
    echo '#!/bin/bash' >> installDockerScript.sh
    echo 'install_docker_only="true"' >> installDockerScript.sh

    local node_scripts_location=/tmp/node
    local node_s3_location="https://s3.amazonaws.com/shippable-artifacts/node/$RELEASE/node-$RELEASE.tar.gz"

    pushd /tmp
      mkdir -p $node_scripts_location
      curl -O $node_s3_location
      tar -xzf node-$RELEASE.tar.gz -C $node_scripts_location --strip-components=1
      rm -rf node-$RELEASE.tar.gz
    popd

    cat $node_scripts_location/lib/logger.sh >> installDockerScript.sh
    cat $node_scripts_location/lib/headers.sh >> installDockerScript.sh
    cat $node_scripts_location/initScripts/$ARCHITECTURE/$OPERATING_SYSTEM/Docker_$DOCKER_VERSION.sh >> installDockerScript.sh

    rm -rf $node_scripts_location
    # Install Docker
    chmod +x installDockerScript.sh
    ./installDockerScript.sh
    rm installDockerScript.sh
  fi

  #
  # Configure proxy for docker
  #
  docker_restart=false
  mkdir -p /etc/systemd/system/docker.service.d

  proxy_envs="[Service]\nEnvironment="

  if [ ! -z "$SHIPPABLE_HTTP_PROXY" ]; then
    proxy_envs="$proxy_envs \"HTTP_PROXY=$SHIPPABLE_HTTP_PROXY\""
  fi

  if [ ! -z "$SHIPPABLE_HTTPS_PROXY" ]; then
    proxy_envs="$proxy_envs \"HTTPS_PROXY=$SHIPPABLE_HTTPS_PROXY\""
  fi

  if [ ! -z "$SHIPPABLE_NO_PROXY" ]; then
    proxy_envs="$proxy_envs \"NO_PROXY=$SHIPPABLE_NO_PROXY\""
  fi

  local docker_proxy_config_file="/etc/systemd/system/docker.service.d/proxy.conf"

  if [ -f "$docker_proxy_config_file" ] && [ "$(echo -e $proxy_envs)" == "$(cat $docker_proxy_config_file)" ]; then
    docker_restart=false
  else
    docker_restart=true
    echo -e "$proxy_envs" > "$docker_proxy_config_file"
  fi

  if [ $docker_restart == true ]; then
    __process_msg "Restarting docker"
    systemctl daemon-reload
    systemctl restart docker
  fi

  ################## Install awscli  #####################################
  if type aws &> /dev/null && true; then
    __process_msg "'awscli' already installed"
  else
    __process_msg "Installing 'awscli'"
    yum install -y python-pip
    pip install awscli==$AWSCLI_VERSION
  fi

  if type psql &> /dev/null && true; then
    __process_msg "'psql' already installed"
  else
    __process_msg "Installing 'psql'"
    /bin/bash -c "$SCRIPTS_DIR/$ARCHITECTURE/$OPERATING_SYSTEM/install_psql.sh"
    __process_msg "Successfully installed psql"
  fi
}

__generate_ssh_keys() {
  if [ -f "$SSH_PRIVATE_KEY" ] && [ -f $SSH_PUBLIC_KEY ]; then
    __process_msg "SSH keys already present, skipping"
  else
    __process_msg "SSH keys not available, generating"
    local keygen_exec=$(ssh-keygen -t rsa -P "" -f $SSH_PRIVATE_KEY)
    __process_msg "SSH keys successfully generated"
  fi
}

__generate_login_token() {
  __process_msg "Generating login token"
  local uuid=$(cat /proc/sys/kernel/random/uuid)
  export LOGIN_TOKEN="$uuid"
  __process_msg "Successfully generated login token"
}

__set_admiral_ip() {
  __process_msg "Setting value of admiral IP address"

  __process_msg "List of your machine IP addresses including default:"

  local get_ips=$(ip -f inet -4 addr | grep inet | grep -v 127.0.0.1 | awk '{print $2}' | awk -F "/" '{print $1}');

  if [[ "$get_ips" ]]; then
    number_of_ips=($get_ips)
    __process_msg "${#number_of_ips[@]} IP addresses available for the host"
  else
    __process_msg "No IP addresses avaiable"
  fi

  local machine_ips=('127.0.0.1')

  if [[ "$get_ips" ]]; then
    machine_ips+=( $get_ips )
  fi

  for (( i = 1 ; i < ${#machine_ips[@]} + 1 ; i++ )) do
    __process_msg "$i - (${machine_ips[$i-1]})"
  done

  __process_success "Please pick one of the IP addresses from the above list by selecting the index (1, 2, etc) or enter a custom IP"
  read response

  if [[ $response =~ ^[0-9]+$ ]]; then
    if [ ${machine_ips[$response-1]} ]; then
      __process_msg "${machine_ips[$response-1]} was selected as admiral IP"
      export ADMIRAL_IP=${machine_ips[$response-1]}
      __process_msg "Admiral IP is set to $ADMIRAL_IP"
    else
      __process_error "Invalid response, please enter valid index or enter a custom IP"
      __set_admiral_ip
    fi
  else
    if [ "$response" != 'localhost' ]; then
      if __validate_ip $response ; then
        export ADMIRAL_IP=$response
        __process_msg "Admiral IP is set to $ADMIRAL_IP"
      else
        __process_error "Invalid response, please enter valid IP address"
        __set_admiral_ip
      fi
    else
      export ADMIRAL_IP=$response
      __process_msg "Admiral IP is set to $ADMIRAL_IP"
    fi
  fi
}

__check_existing_database() {
  if [ "$DB_INSTALLED" == "true" ]; then
    __process_marker "Checking database connection"

    # Install psql
    if type psql &> /dev/null && true; then
      __process_msg "'psql' already installed"
    else
      __process_msg "Installing 'psql'"
      /bin/bash -c "$SCRIPTS_DIR/$ARCHITECTURE/$OPERATING_SYSTEM/install_psql.sh"
      __process_msg "Successfully installed psql"
    fi

    # Check connection
    local postgres_cmd="PGPASSWORD=$DB_PASSWORD \
      psql \
      -U $DB_USER \
      -d $DB_NAME \
      -h $DB_IP \
      -p $DB_PORT \
      -t \
      -v ON_ERROR_STOP=1 \
      -c 'SELECT version();'"

    __process_msg "Checking connection to database"
    postgres_version=$(eval "$postgres_cmd")
    if [[ "$postgres_version" =~ PostgreSQL\ 9\.5\.(.*) ]]; then
      __process_msg "Successfully connected to database"
    else
      __process_error "Postgres version 9.5 is required."
      exit 1
    fi
  fi
}

__registry_login() {
  __process_msg "Updating docker credentials to pull Shippable images"

  local skip_login=false

  if [ -z "$ACCESS_KEY" ] || [ "$ACCESS_KEY" == "" ]; then
    __process_error "ACCESS_KEY not defined"
    skip_login=true
  fi

  if [ -z "$SECRET_KEY" ] || [ "$SECRET_KEY" == "" ]; then
    __process_error "SECRET_KEY not defined"
    skip_login=true
  fi

  if [ $skip_login == false ]; then
    local credentials_template="$SCRIPTS_DIR/configs/credentials.template"
    local credentials_file="/tmp/credentials"

    sed "s#{{ACCESS_KEY}}#$ACCESS_KEY#g" $credentials_template > $credentials_file
    sed -i "s#{{SECRET_KEY}}#$SECRET_KEY#g" $credentials_file

    mkdir -p ~/.aws
    mv -v $credentials_file ~/.aws
    if [ "$NO_VERIFY_SSL" == true ]; then
      local docker_login_cmd=$(aws ecr --no-include-email --no-verify-ssl --region us-east-1 get-login)
    else
      local docker_login_cmd=$(aws ecr --no-include-email --region us-east-1 get-login)
    fi
    __process_msg "Docker login generated, logging into ecr"
    eval "$docker_login_cmd"
  else
    __process_error "Registry credentials not available, skipping docker login"
  fi
}

__pull_images() {
  __process_marker "Pulling latest service images"
  __process_msg "Registry: $PRIVATE_IMAGE_REGISTRY"
  __registry_login

  for image in "${PRIVATE_REGISTRY_IMAGES[@]}"; do
    image="$PRIVATE_IMAGE_REGISTRY/$image:$RELEASE"
    __process_msg "Pulling $image"
    sudo docker pull $image
  done

  for image in "${SERVICE_IMAGES[@]}"; do
    image="$PRIVATE_IMAGE_REGISTRY/$image:$RELEASE"
    __process_msg "Pulling $image"
    sudo docker pull $image
  done
}

__pull_images_workers() {
  __process_marker "Pulling latest service images on workers"

  if [ $DB_INSTALLED == false ]; then
    __process_msg "DB not installed, skipping"
    return
  else
    __process_msg "DB installed, checking initialize status"
  fi

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

    if [ $host == $ADMIRAL_IP ];then
      __process_msg "Images already pulled on admiral host, skipping"
      continue
    fi

    local docker_login_cmd="aws ecr --no-include-email --region us-east-1 get-login | bash"
    __exec_cmd_remote "$host" "$docker_login_cmd"

    for image in "${SERVICE_IMAGES[@]}"; do
      image="$PRIVATE_IMAGE_REGISTRY/$image:$RELEASE"
      __process_msg "Pulling $image on $host"
      local pull_cmd="sudo docker pull $image"
      __exec_cmd_remote "$host" "$pull_cmd"
    done
  done
}

__check_service_connection() {
  if [ "$#" != "3" ] && [ "$#" != "4" ]; then
    __process_error "invalid arguments to __check_service_connection()"
    __process_error "Usage: __check_service_connection <host> <port> <serviceName> <timeout (optional)>"
    exit 1
  fi

  local timeout=$4
  if [ -z "$timeout" ]; then
    timeout=60
  fi
  local host=$1
  if [ -z "$host" ]; then
    __process_error "got empty host in __check_service_connection(), exiting..."
    exit 1
  fi
  local port=$2
  if [ -z "$port" ]; then
    __process_error "got empty port in __check_service_connection(), exiting..."
    exit 1
  fi
  local service=$3
  if [ -z "$service" ]; then
    __process_error "got empty service name in __check_service_connection(), exiting..."
    exit 1
  fi
  local interval=3
  local counter=0
  local service_booted=false

  while [ $service_booted != true ] && [ $counter -lt $timeout ]; do
    if nc -v --send-only </dev/null $host $port &>/dev/null; then
      __process_msg "$service found"
      sleep 5
      service_booted=true
    else
      __process_msg "Waiting for $service to start"
      let "counter = $counter + $interval"
      sleep $interval
    fi
  done
  if [ $service_booted = false ]; then
    __process_error "Could not detect $service container for host:$host, port:$port"
    exit 1
  fi
}
