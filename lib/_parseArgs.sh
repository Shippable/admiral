#!/bin/bash -e

__bootstrap_state() {
  __process_msg "injecting empty machines array"
  local machines=$(cat $STATE_FILE | \
    jq '.machines=[]')
  _update_state "$machines"

  __process_msg "injecting empty master integrations"
  local master_integrations=$(cat $STATE_FILE | \
    jq '.masterIntegrations=[]')
  _update_state "$master_integrations"

  __process_msg "injecting empty system integrations"
  local system_integrations=$(cat $STATE_FILE | \
    jq '.systemIntegrations=[]')
  _update_state "$system_integrations"

  __process_msg "injecting empty services array"
  local services=$(cat $STATE_FILE | \
    jq '.services=[]')
  _update_state "$services"
}

__validate_runtime() {
  __process_marker "Validating runtime"

  ################## load env file  ###########################
  if [ ! -f "$ADMIRAL_ENV" ]; then
    __process_msg "ADMIRAL_ENV does not exist, creating"
    mkdir -p $CONFIG_DIR
    cp -vr $USR_DIR/admiral.env.template $ADMIRAL_ENV
    __process_msg "Successfully created admiral env "
  else
    __process_msg "ADMIRAL_ENV file exists"
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

  source $ADMIRAL_ENV
}

__parse_args_upgrade() {
  export IS_UPGRADE=true

  local upgrade_version=""
  if [[ $# -gt 0 ]]; then
    while [[ $# -gt 0 ]]; do
      key="$1"

      case $key in
        -v|--version)
          upgrade_version=$2
          shift
          ;;
        -n|--no-prompt)
          export NO_PROMPT=true
          ;;
        -h|help)
          __print_help_upgrade
          ;;
        *)
          echo "Invalid option: $key"
          __print_help_upgrade
          ;;
      esac
      shift
    done
  else
    __process_msg "No arguments provided for 'upgrade' using defaults"
  fi

  if [ "$upgrade_version" == "" ]; then
    __process_error "No version specified for upgrade, exiting"
    exit 1
  else
    export SHIPPABLE_VERSION=$upgrade_version
  fi

  if [ "$INSTALL_MODE" == "" ]; then
    __process_error "No install mode specified in ADMIRAL_ENV file, exiting"
    exit 1
  else
    __process_msg "Setting install mode from ADMIRAL_ENV file"
  fi
}

__parse_args_install() {
  export IS_UPGRADE=false

  if [[ $# -gt 0 ]]; then
    while [[ $# -gt 0 ]]; do
      key="$1"

      case $key in
        -l|--local)
          export INSTALL_MODE="local"
          ;;
        -r|--release)
          export RELEASE=$2
          shift
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
    $0 install --release v5.2.1             //Install on cluster with 'v5.2.1' release
    $0 install --local                      //Install on localhost with 'master' release
    $0 install --local --release v5.2.1     //Install on localhost with 'v5.2.1' release
  Flags:
    --local                         Install on localhost
    --version <version>             Install a particular version
  "
  exit 0
}

__print_help_upgrade() {
  echo "
  usage: $0 upgrade [flags]
  This script installs Shippable enterprise
  examples:
    $0 upgrade --release v5.2.1             //Install on cluster with 'v5.2.1' release
  Flags:
    --release <release>             Install a particular release
  "
  exit 0
}

__print_help() {
  echo "
  Usage:
    $0 <command> [flags]

  Examples:
    $0 install --help
    $0 install --local
    $0 upgrade --release v5.2.3

  Commmands:
    install         Run Shippable installation
    upgrade         Run Shippable upgrade
    status          Print status of current installation
    help            Print this message
  "
  exit 0
}

__parse_args() {
  if [ -f $ADMIRAL_ENV ]; then
    source $ADMIRAL_ENV
  fi

  if [[ $# -gt 0 ]]; then
    key="$1"

    case $key in
      install)
        shift
        __parse_args_install "$@"
        ;;
      upgrade)
        shift
        __parse_args_upgrade "$@"
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
