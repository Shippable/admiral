#!/bin/bash -e

# Helper methods ##########################################
###########################################################

# TODO: break up this file into smaller, logically-grouped
# files after we add release and re-install features

declare -a SERVICE_IMAGES=("api" "www" "micro" "mktg" "nexec" "genexec")
declare -a PRIVATE_REGISTRY_IMAGES=("admiral" "postgres" "vault" "rabbitmq" "gitlab" "redis")

__bootstrap_admiral_env() {
  ################## load env file  ###########################
  if [ ! -f "$ADMIRAL_ENV" ]; then
    __process_msg "ADMIRAL_ENV does not exist, creating"
    mkdir -p $CONFIG_DIR
    cp -vr $SCRIPTS_DIR/configs/admiral.env.template $ADMIRAL_ENV
    __process_msg "Successfully created admiral env "
  else
    __process_msg "Loading ADMIRAL_ENV from $ADMIRAL_ENV"
  fi
  source "$ADMIRAL_ENV"
}

__check_os_and_architecture() {
  if [ -z "$OPERATING_SYSTEM" ] || [ -z "$ARCHITECTURE" ]; then
    source /etc/os-release
    sed -i '/^OPERATING_SYSTEM/d' "$ADMIRAL_ENV"
    sed -i '/^ARCHITECTURE/d' "$ADMIRAL_ENV"

    local architecture=$(uname -m)
    # For CentOS, the OS value is defined as "CentOS Linux". We only want
    # the first part of it, so ignore everything after a space. Ubuntu defines
    # it as "Ubuntu" so that will not change here.
    local os=$(echo "$NAME" | cut -f 1 -d ' ')
    local os_version="$VERSION_ID"
    local operating_system=$os"_"$os_version

    ### default architecture & os to x86_64, Ubuntu_14.04, if empty
    if [ -z "$architecture" ]; then
      architecture="x86_64"
    fi
    if [ -z "$operating_system" ]; then
      operating_system="Ubuntu_14.04"
    fi

    echo "ARCHITECTURE=\"$architecture\"" >> "$ADMIRAL_ENV"
    echo "OPERATING_SYSTEM=\"$operating_system\"" >> "$ADMIRAL_ENV"
  fi
  source "$ADMIRAL_ENV"
}

__set_installed_docker_version() {
  if command -v "docker" &>/dev/null; then
    docker_ver=$(docker version --format '{{.Server.Version}}')
    export INSTALLED_DOCKER_VERSION=$(docker version --format '{{.Server.Version}}')
    echo "setting INSTALLED_DOCKER_VERSION=$INSTALLED_DOCKER_VERSION"
  fi
}

__cleanup() {
  if [ -d $CONFIG_DIR ]; then
    __process_msg "Removing previously created $CONFIG_DIR"
    rm -rf $CONFIG_DIR
  fi
  mkdir -p $CONFIG_DIR

  if [ -d $RUNTIME_DIR ]; then
    __process_msg "Removing previously created $RUNTIME_DIR"
    rm -rf $RUNTIME_DIR
  fi
  mkdir -p $RUNTIME_DIR
}

__print_runtime() {
  __process_marker "Installer runtime variables"
  __process_msg "RELEASE: $RELEASE"
  __process_msg "IS_UPGRADE: $IS_UPGRADE"

  if [ $NO_PROMPT == true ]; then
    __process_msg "NO_PROMPT: true"
  else
    __process_msg "NO_PROMPT: false"
  fi
  __process_msg "ADMIRAL_IP: $ADMIRAL_IP"
  __process_msg "DB_IP: $DB_IP"
  __process_msg "DB_PORT: $DB_PORT"
  __process_msg "DB_USER: $DB_USER"
  __process_msg "DB_PASSWORD: ${#DB_PASSWORD}"
  __process_msg "DB_NAME: $DB_NAME"
  __process_msg "Login Token: $LOGIN_TOKEN"
}

__set_access_key() {
  __process_msg "Setting installer access key"

  __process_success "Please enter the provided installer access key."
  read response
  export ACCESS_KEY=$response
}

__set_secret_key() {
  __process_msg "Setting installer secret key"

  __process_success "Please enter the provided installer secret key."
  read response
  export SECRET_KEY="$response"
}

__validate_ip() {
  local ip=$1
  local rx='([1-9]?[0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])'
  [[ $ip =~ ^(http(s)?://)?([a-zA-Z0-9-]+(\.[a-zA-Z0-9-]+)+[a-zA-Z0-9/?]*)$ ||  $ip =~ ^$rx\.$rx\.$rx\.$rx$ ]];
}

__set_proxy_envs() {
  __process_msg "Set value for http_proxy, press enter to leave this empty."
  read response
  export SHIPPABLE_HTTP_PROXY="$response"

  __process_msg "Set value for https_proxy, press enter to leave this empty."
  read response
  export SHIPPABLE_HTTPS_PROXY="$response"

  __process_msg "Set value for no_proxy, press enter to leave this empty."
  read response
  export SHIPPABLE_NO_PROXY="$response"
}

__set_db_ip() {
  __process_msg "Setting value of database IP address"
  local db_ip=$ADMIRAL_IP
  if [ "$DEV_MODE" == "true" ]; then
    export DB_IP=$db_ip
    return
  fi
  __process_success "Do you want to install the database on this machine? (Y/n)"
  read response

  if [ "$response" == "Y" ] || [ "$response" == "y" ]; then
      export DB_IP=$ADMIRAL_IP
  else
    __process_success "Please enter the IP address of the database"
    read response
    if [ "$response" == "localhost" ]; then
      export DB_IP=$response
    elif __validate_ip $response ; then
      export DB_IP=$response
    else
      __process_error "Invalid response, please enter valid IP address"
      __set_db_ip
    fi
  fi
}

__set_db_installed() {
  if [ "$DB_IP" != "$ADMIRAL_IP" ]; then
    __process_success "Enter I to install a new database or E to use an existing one."
    __process_msg "Existing databases must be Postgres 9.5 and have a user named apiuser with full permissions on a database named shipdb."
    read response
    response=$(echo $response | awk '{print toupper($0)}')

    if [ "$response" == "I" ]; then
      __process_msg "A new database will be installed"
      export DB_INSTALLED=false
    elif [ "$response" == "E" ]; then
      __process_msg "An existing database will be used for this installation"
      export DB_INSTALLED=true
    else
      __process_error "Invalid response, please enter I or E"
      __set_db_installed
    fi
  fi
}

__set_db_port() {
  __process_msg "Setting value of database port"
  local db_port="5432"

  if [ "$DB_INSTALLED" == "false" ]; then
    export DB_PORT=$db_port
  else
    __process_success "Please enter the database port or D to set the default ($db_port)."
    read response
    response=$(echo $response | awk '{print toupper($0)}')

    if [ "$response" != "D" ]; then
      export DB_PORT=$response
    else
      export DB_PORT=$db_port
    fi
  fi
}

__validate_db_password() {
  local pwd=$1
  if [[ "$pwd" =~ [^-_+=a-zA-Z0-9] ]]; then
    return 1
  fi
  return 0
}

__set_db_password() {
  __process_msg "Setting database password"

  __process_success "Please enter the password for your database. This password will also be used for gitlab & rabbitmq, by default. This can be changed from the Admiral UI, if required."
  read response

  if [ "$response" == "" ]; then
    __process_error "Database password cannot be empty. Re-enter password"
    __set_db_password
  elif __validate_db_password $response ; then
    export DB_PASSWORD=$response
  else
    __process_error "Invalid characters in the database password field, valid characters are: -_=+a-zA-Z0-9"
    __set_db_password
  fi

}

__set_public_image_registry() {
  __process_msg "Setting public image registry"

  __process_success "Please enter the value of the Shippable public image registry."
  read response

  if [ "$response" != "" ]; then
    export PUBLIC_IMAGE_REGISTRY=$response
  fi
}

__require_confirmation() {
  read confirmation
  confirmation=$(echo $confirmation | awk '{print toupper($0)}')

  if [[ "$confirmation" =~ "Y" ]]; then
    __process_msg "Confirmation received"
    export INSTALL_INPUTS_CONFIRMED=true
  elif [[ "$confirmation" =~ "N" ]]; then
    export INSTALL_INPUTS_CONFIRMED=false
  else
    __process_error "Invalid response, please enter Y or N"
    __require_confirmation
  fi
}

__configure_proxy() {
  source "$SCRIPTS_DIR/configureProxy.sh"
}

__copy_script_local() {
  local user="$SSH_USER"
  local key="$SSH_PRIVATE_KEY"
  local port=22
  local host="$1"
  shift
  local script_path_remote="$@"

  local script_dir_local="/tmp/shippable"

  echo "copying from $script_path_remote to localhost: /tmp/shippable/"
  remove_key_cmd="ssh-keygen -q -f '$HOME/.ssh/known_hosts' -R $host"
  {
    eval $remove_key_cmd
  } || {
    true
  }

  mkdir -p $script_dir_local
  copy_cmd="rsync -avz -e \
    'ssh \
      -o StrictHostKeyChecking=no \
      -o NumberOfPasswordPrompts=0 \
      -p $port \
      -i $SSH_PRIVATE_KEY \
      -C -c blowfish' \
      $user@$host:$script_path_remote $script_dir_local"

  copy_cmd_out=$(eval $copy_cmd)
  echo "$script_path_remote"
}

__exec_cmd_remote_proxyless() {
  local user="$SSH_USER"
  local key="$SSH_PRIVATE_KEY"
  local timeout=10
  local port=22

  local host="$1"
  shift
  local cmd="$@"
  shift

  local remote_cmd="ssh \
    -o StrictHostKeyChecking=no \
    -o NumberOfPasswordPrompts=0 \
    -o ConnectTimeout=$timeout \
    -p $port \
    -i $key \
    $user@$host \
    $cmd"

  {
    __process_msg "Executing on host: $host ==> '$cmd'" && eval "sudo $remote_cmd"
  } || {
    __process_msg "ERROR: Command failed on host: $host ==> '$cmd'"
    exit 1
  }
}
