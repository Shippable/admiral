#!/bin/bash -e

__bootstrap_admiral_env() {
  ################## load env file  ###########################
  if [ ! -f "$ADMIRAL_ENV" ]; then
    __process_msg "ADMIRAL_ENV does not exist, creating"
    mkdir -p $CONFIG_DIR
    cp -vr $SCRIPTS_DIR/configs/admiral.env.template $ADMIRAL_ENV
    __process_msg "Successfully created admiral env "
  fi
  source "$ADMIRAL_ENV"
}

__validate_runtime() {
  __process_marker "Validating runtime"

  export OS_TYPE=docker

  ################## check release   #############################
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

  ################## check keys  ##################################

  if [ -f "$SSH_PRIVATE_KEY" ] && [ -f $SSH_PUBLIC_KEY ]; then
    __process_msg "SSH keys already present, skipping"
  else
    __process_msg "SSH keys not available, generating"
    __generate_ssh_keys
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
  else
    __process_msg "DB_IP already set, skipping"
  fi

  ################## check migrations  #############################
  local migrations_path=$MIGRATIONS_DIR/$RELEASE.sql
  if [ ! -f "$migrations_path" ]; then
    __process_error "Migrations file $migrations_path does not exist, exiting"
    exit 1
  else
    __process_msg "Migrations file: $migrations_path"
  fi

  ################## check version #################################
  local versions_path=$VERSIONS_DIR/$RELEASE.json
  if [ ! -f "$versions_path" ]; then
    __process_error "Versions file $versions_path does not exist, exiting"
    exit 1
  else
    __process_msg "Versions: $versions_path"
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

  ################## check system image registry ###############################
  if [ "$SYSTEM_IMAGE_REGISTRY" == "" ]; then
    __process_msg "SYSTEM_IMAGE_REGISTRY is not set"
    __set_system_image_registry
  else
    __process_msg "SYSTEM_IMAGE_REGISTRY already set, skipping"
  fi

  source $ADMIRAL_ENV
}

__parse_args_install() {
  export IS_UPGRADE=false

  if [[ $# -gt 0 ]]; then
    while [[ $# -gt 0 ]]; do
      key="$1"

      case $key in
        -r|--release)
          if [ "$2" == "" ]; then
            __process_error "'release' cannot be empty"
            __print_help_install
          else
            export RELEASE=$2
            shift
          fi
          ;;
        -h|help)
          __print_help_install
          ;;
        *)
          echo "Invalid option: $key"
          __print_help_install
          ;;
      esac
      shift
    done
  else
    __process_msg "No arguments provided for 'install' using defaults"
  fi
}

__print_help_install() {
  echo "
  usage: $0 install [flags]
  This script installs Shippable enterprise
  examples:
    $0 install                              //Install on localhost with 'master' release
    $0 install --release v5.2.1             //Install on localhost with 'v5.2.1' release
  Flags:
    --version <version>             Install a particular version
  "
  exit 0
}

__print_help() {
  echo "
  Usage:
    $0 <command> [flags]

  Examples:
    $0 install --help
    $0 install --release v5.2.1             //Install on localhost with 'v5.2.1' release

  Commmands:
    install         Run Shippable installation
    help            Print this message
  "
  exit 0
}

__show_status() {
  __process_msg "All good !!!"
}

__parse_args() {
  if [[ $# -gt 0 ]]; then
    key="$1"

    case $key in
      install)
        shift
        __bootstrap_admiral_env
        __parse_args_install "$@"
        ;;
      status)
        __show_status
        ;;
      help)
        __print_help
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
