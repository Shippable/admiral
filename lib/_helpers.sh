#!/bin/bash -e

# Helper methods ##########################################
###########################################################

__check_dependencies() {
  __process_marker "Checking dependencies"
  {
    type rsync &> /dev/null && true
    __process_msg "'rsync' already installed"
  } || {
    __process_msg "Installing 'rsync'"
    apt-get install -y rsync
  }

  {
    type ssh &> /dev/null && true
    __process_msg "'ssh' already installed"
  } || {
    __process_msg "Installing 'ssh'"
    apt-get install -y ssh-client
  }

  {
    type docker &> /dev/null && true
    __process_msg "'docker' already installed, checking version"
    local docker_version=$(docker --version)
    if [[ "$docker_version" == *"$DOCKER_VERSION"* ]]; then
      __process_msg "'docker' $DOCKER_VERSION installed"
    else
      __process_error "Docker version $docker_version installed, required $DOCKER_VERSION"
      __process_error "Install docker using script \"
      https://raw.githubusercontent.com/Shippable/node/master/scripts/ubu_14.04_docker_1.13.sh"
      exit 1
    fi
  } || {
    __process_error "Docker not installed, install docker using script \
    https://raw.githubusercontent.com/Shippable/node/master/scripts/ubu_14.04_docker_1.13.sh"
    exit 1
  }
}

__print_runtime() {
  __process_marker "Installer runtime variables"
  __process_msg "RELEASE: $RELEASE"
  __process_msg "INSTALL_MODE: $INSTALL_MODE"
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
  __process_msg "DB_PASSWORD: $DB_PASSWORD"
  __process_msg "DB_NAME: $DB_NAME"
}

__generate_ssh_keys() {
  __process_marker "Generating SSH keys"
  local keygen_exec=$(ssh-keygen -t rsa -P "" -f $SSH_PRIVATE_KEY)
  __process_msg "SSH keys successfully generated"
}

__generate_login_token() {
  __process_marker "Generating login token"
  local uuid=$(cat /proc/sys/kernel/random/uuid)
  export LOGIN_TOKEN="$uuid"
  __process_msg "Successfully generated login token"
}

__set_admiral_ip() {
  __process_msg "Setting value of admiral IP address"
  local admiral_ip='127.0.0.1'

  __process_msg "Please enter value of admiral IP address or type D to set default(127.0.0.1) value"
  read response

  if [ "$response" != "D" ]; then
    __process_msg "Setting the admiral IP address as: $response, press Y to confim"
    read confirmation
    if [[ "$confirmation" =~ "Y" ]]; then
      admiral_ip=$response
    else
      __process_error "Invalid response, please enter a valid IP and confirm"
      __set_admiral_ip
    fi
  fi
  sed -i 's/.*ADMIRAL_IP=.*/ADMIRAL_IP="'$admiral_ip'"/g' $ADMIRAL_ENV
  __process_msg "Successfully set admiral IP as $admiral_ip"
}

__set_db_ip() {
  __process_msg "Setting value of DB IP address"
  local db_ip="127.0.0.1"
  if [ "INSTALL_MODE" == "cluster" ]; then
    __process_msg "Please enter value of db IP address"
    read response

    if [ "$response" != "" ]; then
      __process_msg "Setting the admiral IP address as: $response, press Y to confim"
      read confirmation
      if [[ "$confirmation" =~ "Y" ]]; then
        db_ip=$response
      else
        __process_error "Invalid response, please enter a valid IP and continue"
        __set_db_ip
      fi
    fi
  fi

  sed -i 's/.*DB_IP=.*/DB_IP="'$db_ip'"/g' $ADMIRAL_ENV
  __process_msg "Successfully set DB_IP as $db_ip"
}
