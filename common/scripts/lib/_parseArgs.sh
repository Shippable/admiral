#!/bin/bash -e

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

__validate_runtime() {
  __process_marker "Validating runtime"

  export OS_TYPE=docker

  ################## check release   #############################
  local head_sha=$(git symbolic-ref HEAD --short -q)
  if [ "$head_sha" == "" ]; then
    ## user has checked out a tag, find latest tag
    export RELEASE=$(git describe --tags)
  else
    ## no tag has been checked out, use master
    export RELEASE=master
  fi

  __process_msg "Using release: $RELEASE"

  if [ "$RELEASE" == "" ]; then
    __process_error "No RELEASE env present, exiting"
    exit 1
  else
    __process_msg "Updating RELEASE in ADMIRAL_ENV file"
    sed -i 's/.*RELEASE=.*/RELEASE="'$RELEASE'"/g' $ADMIRAL_ENV
  fi

  ################## check install mode ##########################
  if [ "$INSTALL_MODE" == "" ]; then
    __process_error "No INSTALL_MODE env present, exiting"
    exit 1
  else
    __process_msg "Updating INSTALL_MODE in ADMIRAL_ENV file"
    sed -i 's/.*INSTALL_MODE=.*/INSTALL_MODE="'$INSTALL_MODE'"/g' $ADMIRAL_ENV
  fi

  ################## check login token  ##########################
  if [ "$LOGIN_TOKEN" == "" ]; then
    __process_msg "LOGIN_TOKEN not defined, generating"
    __generate_login_token
    __process_msg "Updating LOGIN_TOKEN in ADMIRAL_ENV file"
    sed -i 's/.*LOGIN_TOKEN=.*/LOGIN_TOKEN="'$LOGIN_TOKEN'"/g' $ADMIRAL_ENV
    __process_msg "LOGIN_TOKEN updated in ADMIRAL_ENV file"
  else
    __process_msg "LOGIN_TOKEN available, skipping"
  fi

  ################## check access key ###############################
  if [ "$ACCESS_KEY" == "" ]; then
    __process_msg "ACCESS_KEY is not set"
    __set_access_key
  else
    __process_msg "ACCESS_KEY already set, skipping"
  fi

  ################## check secret key ###############################
  if [ "$SECRET_KEY" == "" ]; then
    __process_msg "SECRET_KEY is not set"
    __set_secret_key
  else
    __process_msg "SECRET_KEY already set, skipping"
  fi

  ################## check host ip #################################
  if [ "$ADMIRAL_IP" == "" ]; then
    __process_msg "ADMIRAL_IP not set"
    __set_admiral_ip
  else
    __process_msg "ADMIRAL_IP already set, skipping"
  fi

  ################## check db url ##################################
  if [ "$DB_IP" == "" ]; then
    __process_msg "DB_IP is not set"
    __set_db_ip
    __set_db_installed
    __add_ssh_key_to_db
  else
    __process_msg "DB_IP already set, skipping"
  fi

  ################## check db port ##################################
  if [ "$DB_PORT" == "" ]; then
    __process_msg "DB_PORT is not set"
    __set_db_port
  else
    __process_msg "DB_PORT already set, skipping"
  fi

  ################## check database password ###############################
  if [ "$DB_PASSWORD" == "" ]; then
    __process_msg "DB_PASSWORD is not set"
    __set_db_password
  else
    __process_msg "DB_PASSWORD already set, skipping"
  fi

  ################## check for services #################################
  local services_path=$SCRIPTS_DIR/configs/services.json
  if [ ! -f "$services_path" ]; then
    __process_error "Services file $services_path does not exist, exiting"
    exit 1
  else
    __process_msg "Services: $services_path"
  fi

  ################## check system image registry ###############################
  if [ "$PUBLIC_IMAGE_REGISTRY" == "" ]; then
    __process_msg "PUBLIC_IMAGE_REGISTRY is not set"
    __set_public_image_registry
  else
    __process_msg "PUBLIC_IMAGE_REGISTRY already set, skipping"
  fi

  source $ADMIRAL_ENV
}

__parse_args_install() {
  export IS_UPGRADE=false

  if [[ $# -gt 0 ]]; then
    while [[ $# -gt 0 ]]; do
      key="$1"

      case $key in
        -h|help|--help)
          __print_help_install
          ;;
        *)
          echo "Invalid option: $key"
          __print_help_install
          ;;
      esac
      shift
    done
  fi
}

__print_help_install() {
  echo "
  usage: $0 install [flags]
  This script installs Shippable enterprise
  examples:
    $0 install
  "
  exit 0
}

__print_help() {
  echo "
  Usage:
    $0 <command> [flags]

  Examples:
    $0 install --help

  Commmands:
    install         Run Shippable installation
    help            Print this message
    clean           Remove shippable containers and configurations
  "
  exit 0
}

__show_status() {
  __process_msg "All good !!!"
}

__wipe_clean() {
  __process_marker "Cleaning installation"

  __process_msg "WARNING: this will erase your Shippable installation..."
  __process_msg "WARNING: including all containers and the database."
  __process_msg "Do you wish to continue? (Y to confirm)"
  read confirmation

  if [[ "$confirmation" =~ "Y" ]]; then

    local count=$(docker ps -aq | wc -l)
    if [[ "$count" -ne 0 ]]; then
      local container_ids=$(docker ps -aq)
      local remove_cmd="docker rm -f"
      __process_msg "Executing: $remove_cmd"
      for id in ${container_ids[@]}; do
        eval "$remove_cmd $id"
      done
    else
      __process_msg "No containers found. Skipping removal."
    fi
    __cleanup
    __process_success "Clean is complete. Reinstall by running 'sudo ./admiral.sh install'"
    exit 0
  else
    __process_error "Cancelling clean"
    exit 1
  fi


}


__parse_args() {
  if [[ $# -gt 0 ]]; then
    key="$1"

    case $key in
      install)
        shift
        __bootstrap_admiral_env
        __generate_ssh_keys
        __parse_args_install "$@"
        ;;
      status)
        __show_status
        ;;
      help)
        __print_help
        ;;
      clean)
        __wipe_clean
        ;;
      *)
        echo "Invalid option: $key"
        __print_help
        ;;
    esac
  else
    __print_help
  fi

}
