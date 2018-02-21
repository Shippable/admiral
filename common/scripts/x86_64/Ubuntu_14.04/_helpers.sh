#!/bin/bash -e

# Helper methods ##########################################
###########################################################

# TODO: break up this file into smaller, logically-grouped
# files after we add release and re-install features

declare -a SERVICE_IMAGES=("api" "www" "micro" "mktg" "nexec" "genexec")
declare -a PRIVATE_REGISTRY_IMAGES=("admiral" "postgres" "vault" "rabbitmq" "gitlab" "redis")

__check_dependencies() {
  __process_marker "Checking dependencies"

  ################## Install rsync  ######################################
  if type rsync &> /dev/null && true; then
    __process_msg "'rsync' already installed"
  else
    __process_msg "Installing 'rsync'"
    apt-get install -y rsync
  fi

  ################## Install SSH  ########################################
  if type ssh &> /dev/null && true; then
    __process_msg "'ssh' already installed"
  else
    __process_msg "Installing 'ssh'"
    apt-get install -y ssh-client
  fi

  ################## Install jq  #########################################
  if type jq &> /dev/null && true; then
    __process_msg "'jq' already installed"
  else
    __process_msg "Installing 'jq'"
    apt-get install -y jq
  fi

  ################## Install curl  #######################################
  if type curl &> /dev/null && true; then
    __process_msg "'curl' already installed"
  else
    __process_msg "Installing 'curl'"
    apt-get install -y curl
  fi

  ################## Install NTP  ########################################
  {
    check_ntp=$(sudo service --status-all 2>&1 | grep ntp)
  } || {
    true
  }

  if [ ! -z "$check_ntp" ]; then
    __process_msg "'ntp' already installed"
  else
    __process_msg "Installing 'ntp'"
    apt-get install -y ntp
    service ntp restart
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
      https://docs.docker.com/cs-engine/1.13/#install-on-ubuntu-1404-lts-or-1604-lts"
      exit 1
    fi
  else
    __process_msg "Docker not installed, installing Docker 1.13"
    rm -f installDockerScript.sh
    touch installDockerScript.sh
    echo '#!/bin/bash' >> installDockerScript.sh
    echo 'readonly MESSAGE_STORE_LOCATION="/tmp/cexec"' >> installDockerScript.sh
    echo 'readonly KEY_STORE_LOCATION="/tmp/ssh"' >> installDockerScript.sh
    echo 'readonly BUILD_LOCATION="/build"' >> installDockerScript.sh
    echo 'install_docker_only="true"' >> installDockerScript.sh

    local node_scripts_location=/tmp/node
    local node_s3_location="https://s3.amazonaws.com/shippable-artifacts/node/$RELEASE/node-$RELEASE.tar.gz"

    pushd /tmp
    mkdir -p $node_scripts_location
    wget $node_s3_location
    tar -xzf node-$RELEASE.tar.gz -C $node_scripts_location --strip-components=1
    rm -rf node-$RELEASE.tar.gz
    popd

    cat $node_scripts_location/lib/logger.sh >> installDockerScript.sh
    cat $node_scripts_location/lib/headers.sh >> installDockerScript.sh
    cat $node_scripts_location/initScripts/x86_64/Ubuntu_14.04/Docker_1.13.sh >> installDockerScript.sh

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
  if [ ! -z "$SHIPPABLE_HTTP_PROXY" ]; then
    http_proxy_env="export http_proxy=\"$SHIPPABLE_HTTP_PROXY\""
    http_proxy_exists=$(grep "^$http_proxy_env$" /etc/default/docker || echo "")
    if [ -z $http_proxy_exists ]; then
      __process_msg "Configuring docker http_proxy"
      sed -i '/^export http_proxy/d' /etc/default/docker
      echo "$http_proxy_env" >> /etc/default/docker
      docker_restart=true
    fi
  else
    # Clean up any env configured already if we do not find it in our
    # environment
    http_proxy_exists=$(grep "^export http_proxy=" /etc/default/docker || echo "")
    if [ ! -z "$http_proxy_exists" ]; then
      __process_msg "Removing docker http_proxy"
      sed -i '/^export http_proxy/d' /etc/default/docker
      docker_restart=true
    fi
  fi

  if [ ! -z "$SHIPPABLE_HTTPS_PROXY" ]; then
    https_proxy_env="export https_proxy=\"$SHIPPABLE_HTTPS_PROXY\""
    https_proxy_exists=$(grep "^$https_proxy_env$" /etc/default/docker || echo "")
    if [ -z $https_proxy_exists ]; then
      __process_msg "Configuring docker https_proxy"
      sed -i '/^export https_proxy/d' /etc/default/docker
      echo "$https_proxy_env" >> /etc/default/docker
      docker_restart=true
    fi
  else
    # Clean up any env configured already if we do not find it in our
    # environment
    https_proxy_exists=$(grep "^export https_proxy=" /etc/default/docker || echo "")
    if [ ! -z "$https_proxy_exists" ]; then
      __process_msg "Removing docker https_proxy"
      sed -i '/^export https_proxy/d' /etc/default/docker
      docker_restart=true
    fi
  fi

  if [ ! -z "$SHIPPABLE_NO_PROXY" ]; then
    no_proxy_env="export no_proxy=\"$SHIPPABLE_NO_PROXY\""
    no_proxy_exists=$(grep "^$no_proxy_env$" /etc/default/docker || echo "")
    if [ -z $no_proxy_exists ]; then
      __process_msg "Configuring docker no_proxy"
      sed -i '/^export no_proxy/d' /etc/default/docker
      echo "$no_proxy_env" >> /etc/default/docker
      docker_restart=true
    fi
  else
    # Clean up any env configured already if we do not find it in our
    # environment
    no_proxy_exists=$(grep "^export no_proxy=" /etc/default/docker || echo "")
    if [ ! -z "$no_proxy_exists" ]; then
      __process_msg "Removing docker no_proxy"
      sed -i '/^export no_proxy/d' /etc/default/docker
      docker_restart=true
    fi
  fi

  if [ $docker_restart == true ]; then
    __process_msg "Restarting docker"
    service docker restart
  fi

  ################## Install awscli  #####################################
  if type aws &> /dev/null && true; then
    __process_msg "'awscli' already installed"
  else
    __process_msg "Installing 'awscli'"
    apt-get -y install python-pip
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
      local docker_login_cmd=$(aws ecr --no-verify-ssl --region us-east-1 get-login)
    else
      local docker_login_cmd=$(aws ecr --region us-east-1 get-login)
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

    local docker_login_cmd="aws ecr --region us-east-1 get-login | bash"
    __exec_cmd_remote "$host" "$docker_login_cmd"

    for image in "${SERVICE_IMAGES[@]}"; do
      image="$PRIVATE_IMAGE_REGISTRY/$image:$RELEASE"
      __process_msg "Pulling $image on $host"
      local pull_cmd="sudo docker pull $image"
      __exec_cmd_remote "$host" "$pull_cmd"
    done
  done
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

__add_ssh_key_to_db() {
  if [ "$DB_IP" != "$ADMIRAL_IP" ] && [ "$DB_INSTALLED" == "false" ]; then
    local public_ssh_key=$(cat $SSH_PUBLIC_KEY)
    __process_success "Run the following command on $DB_IP to allow SSH access:"

    echo 'sudo mkdir -p /root/.ssh; echo '$public_ssh_key' | sudo tee -a /root/.ssh/authorized_keys;'

    __process_success "Enter Y to confirm that you have run this command"
    read confirmation
    confirmation=$(echo $confirmation | awk '{print toupper($0)}')

    if [[ "$confirmation" =~ "Y" ]]; then
      __process_msg "Confirmation received"
    else
      __process_error "Invalid response, please run the command to allow access and continue"
      __add_ssh_key_to_db
    fi
  fi
}

__check_connection() {
  if [ "$#" -ne 1 ]; then
    __process_error "At least one host name required to check connection"
    exit 1
  fi
  local host="$1"
  __process_msg "Checking connection status for : $host"
  __exec_cmd_remote "$host" "echo 'Successfully pinged $host'"
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

__copy_script_remote() {
  if [ "$#" -ne 3 ]; then
    __process_msg "The number of arguments expected by _copy_script_remote is 3"
    __process_msg "current arguments $@"
    exit 1
  fi

  local user="$SSH_USER"
  local key="$SSH_PRIVATE_KEY"
  local port=22
  local host="$1"
  shift
  local script_path_local="$1"
  local script_name=$(basename $script_path_local)
  shift
  local script_dir_remote="$1"
  local script_path_remote="$script_dir_remote/$script_name"

  remove_key_cmd="ssh-keygen -q -f '$HOME/.ssh/known_hosts' -R $host > /dev/null 2>&1"
  {
    eval $remove_key_cmd
  } || {
    true
  }

  __process_msg "Copying $script_path_local to remote host: $script_path_remote"
  __exec_cmd_remote $host "mkdir -p $script_dir_remote"
  copy_cmd="rsync -avz -e \
    'ssh \
      -o StrictHostKeyChecking=no \
      -o NumberOfPasswordPrompts=0 \
      -p $port \
      -i $SSH_PRIVATE_KEY \
      -C -c blowfish' \
      $script_path_local $user@$host:$script_path_remote"

  copy_cmd_out=$(eval $copy_cmd)
}

# accepts arguments $host $port $serviceName $timeout
# $timeout is optional and defaults to 60 seconds if not defined
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
    if nc -vz $host $port &>/dev/null; then
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

## syntax for calling this function
## __exec_cmd_remote "user" "192.156.6.4" "key" "ls -al"
__exec_cmd_remote() {
  local user="$SSH_USER"
  local key="$SSH_PRIVATE_KEY"
  local timeout=10
  local port=22

  local host="$1"
  shift
  local cmd="$@"

  local remote_cmd="ssh \
    -o StrictHostKeyChecking=no \
    -o NumberOfPasswordPrompts=0 \
    -o ConnectTimeout=$timeout \
    -p $port \
    -i $key \
    $user@$host \
    \"$cmd\""

  {
    __process_msg "Executing on host: $host ==> '$cmd'" && eval "sudo -E $remote_cmd"
  } || {
    __process_msg "ERROR: Command failed on host: $host ==> '$cmd'"
    exit 1
  }
}
