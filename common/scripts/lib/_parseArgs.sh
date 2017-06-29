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

  ################## set release   ###############################
  cd $ROOT_DIR
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

  ################## generate login token  #######################
  if [ "$LOGIN_TOKEN" == "" ]; then
    __process_msg "LOGIN_TOKEN not defined, generating"
    __generate_login_token
    __process_msg "Updating LOGIN_TOKEN in ADMIRAL_ENV file"
    sed -i 's/.*LOGIN_TOKEN=.*/LOGIN_TOKEN="'$LOGIN_TOKEN'"/g' $ADMIRAL_ENV
    __process_msg "LOGIN_TOKEN updated in ADMIRAL_ENV file"
  else
    __process_msg "LOGIN_TOKEN already generated, skipping"
  fi

  ################## check for services ##########################
  local services_path=$SCRIPTS_DIR/configs/services.json
  if [ ! -f "$services_path" ]; then
    __process_error "Services file $services_path does not exist, exiting"
    exit 1
  else
    __process_msg "Services: $services_path"
  fi

  if [ $NO_PROMPT == true ]; then
    __process_msg "Running in silent mode, suppressing all prompts"
  else
    __prompt_for_inputs
  fi

  source $ADMIRAL_ENV
}

__prompt_for_inputs() {
  __process_marker "Collecting required information"

  local setAccessKey=false
  local setSecretKey=false
  local setAdmiralIP=false
  local setDBIP=false
  local setDBInstalled=false
  local setDBPort=false
  local setDBPassword=false
  local setPublicImageRegistry=false


  ################## check access key ###############################
  if [ "$ACCESS_KEY" == "" ]; then
    __process_msg "ACCESS_KEY is not set"
    __set_access_key
    setAccessKey=true
  else
    __process_msg "ACCESS_KEY already set, skipping"
  fi

  ################## check secret key ###############################
  if [ "$SECRET_KEY" == "" ]; then
    __process_msg "SECRET_KEY is not set"
    __set_secret_key
    setSecretKey=true
  else
    __process_msg "SECRET_KEY already set, skipping"
  fi

  ################## check host ip #################################
  if [ "$ADMIRAL_IP" == "" ]; then
    __process_msg "ADMIRAL_IP not set"
    __set_admiral_ip
    setAdmiralIP=true
  else
    __process_msg "ADMIRAL_IP already set, skipping"
  fi

  ################## check db url ##################################
  if [ "$DB_IP" == "" ]; then
    __set_db_ip
    setDBIP=true
  else
    __process_msg "DB_IP already set, skipping"
  fi

  ################## set db installation type #######################
  if $setDBIP && [ "$DB_IP" != "$ADMIRAL_IP" ]; then
    __set_db_installed
    setDBInstalled=true
  else
    __process_msg "DB_INSTALLED already set, skipping"
  fi

  ################## check db port ##################################
  if [ "$DB_PORT" == "" ]; then
    __process_msg "DB_PORT is not set"
    __set_db_port
    setDBPort=true
  else
    __process_msg "DB_PORT already set, skipping"
  fi

  ################## check database password ###############################
  if [ "$DB_PASSWORD" == "" ]; then
    __process_msg "DB_PASSWORD is not set"
    __set_db_password
    setDBPassword=true
  else
    __process_msg "DB_PASSWORD already set, skipping"
  fi

  ################## check system image registry ###############################
  if [ "$PUBLIC_IMAGE_REGISTRY" == "" ]; then
    __process_msg "PUBLIC_IMAGE_REGISTRY is not set"
    __set_public_image_registry
    setPublicImageRegistry=true
  else
    __process_msg "PUBLIC_IMAGE_REGISTRY already set, skipping"
  fi

  ################## confirm values #######################################
  if $setAccessKey || $setSecretKey || $setAdmiralIP || $setDBIP || $setDBPort || $setDBPassword || $setPublicImageRegistry ; then
    __process_success "These values are easy to set now, but hard to change later! Please confirm that they are correct:"
    if $setAccessKey ; then
      local escaped_access_key=$(echo $ACCESS_KEY | sed -e 's/[\/&]/\\&/g')
      local displayed_value=$(echo $escaped_access_key | sed -e 's/\(.\)/\*/g')
      echo "Installer Access Key:     $displayed_value"
    fi
    if $setSecretKey ; then
      local escaped_secret_key=$(echo $SECRET_KEY | sed -e 's/[\/&]/\\&/g')
      local displayed_value=$(echo $escaped_secret_key | sed -e 's/\(.\)/\*/g')
      echo "Installer Secret Key:     $displayed_value"
    fi
    if $setAdmiralIP ; then
      echo "Admin Panel Address:      $ADMIRAL_IP"
    fi
    if $setDBIP ; then
      echo "Database Address:         $DB_IP"
    fi
    if $setDBInstalled ; then
      if [ $DB_INSTALLED == true ]; then
        echo "Database Type:            Existing"
      else
        echo "Database Type:            New"
      fi
    fi
    if $setDBPort ; then
      echo "Database Port:            $DB_PORT"
    fi
    if $setDBPassword ; then
      local escaped_password=$(echo $DB_PASSWORD | sed -e 's/[\/&]/\\&/g')
      local displayed_value=$(echo $escaped_password | sed -e 's/\(.\)/\*/g')
      echo "Database Password:        $displayed_value"
    fi
    if $setPublicImageRegistry ; then
      echo "Public Image Registry:    $PUBLIC_IMAGE_REGISTRY"
    fi

    __process_success "Enter Y to confirm or N to re-enter these values."
    __require_confirmation

    if $INSTALL_INPUTS_CONFIRMED ; then
      __process_msg "Saving values"
      if $setAccessKey ; then
        sed -i 's/.*ACCESS_KEY=.*/ACCESS_KEY="'$ACCESS_KEY'"/g' $ADMIRAL_ENV
        __process_msg "Saved access key"
      fi
      if $setSecretKey ; then
        local escaped_secret_key=$(echo $SECRET_KEY | sed -e 's/[\/&]/\\&/g')
        sed -i 's/.*SECRET_KEY=.*/SECRET_KEY="'$escaped_secret_key'"/g' $ADMIRAL_ENV
        __process_msg "Saved secret key"
      fi
      if $setAdmiralIP ; then
        sed -i 's/.*ADMIRAL_IP=.*/ADMIRAL_IP="'$ADMIRAL_IP'"/g' $ADMIRAL_ENV
        __process_msg "Saved admin panel address"
      fi
      if $setDBIP ; then
        sed -i 's/.*DB_IP=.*/DB_IP="'$DB_IP'"/g' $ADMIRAL_ENV
        __process_msg "Saved database address"
      fi
      if $setDBInstalled ; then
        if [ $DB_INSTALLED == true ]; then
          sed -i 's/.*DB_INSTALLED=.*/DB_INSTALLED=true/g' $ADMIRAL_ENV
          __process_msg "Saved database installation type"
        elif [ $DB_INSTALLED == false ]; then
          sed -i 's/.*DB_INSTALLED=.*/DB_INSTALLED=false/g' $ADMIRAL_ENV
          __process_msg "Saved database installation type"
        fi
      fi
      if $setDBPort ; then
        sed -i 's/.*DB_PORT=.*/DB_PORT="'$DB_PORT'"/g' $ADMIRAL_ENV
        __process_msg "Saved database port"
      fi
      if $setDBPassword ; then
        sed -i 's#.*DB_PASSWORD=.*#DB_PASSWORD="'$DB_PASSWORD'"#g' $ADMIRAL_ENV
        __process_msg "Saved database password"
      fi
      if $setPublicImageRegistry ; then
        sed -i 's#.*PUBLIC_IMAGE_REGISTRY=.*#PUBLIC_IMAGE_REGISTRY="'$PUBLIC_IMAGE_REGISTRY'"#g' $ADMIRAL_ENV
        __process_msg "Saved public image registry"

      fi

      if $setDBIP && [ "$DB_IP" != "$ADMIRAL_IP" ] && [ "$DB_INSTALLED" == "false" ]; then
        __add_ssh_key_to_db
      fi
    else
      # Clear the values that have been set so they can be set again.
      if $setAccessKey ; then
        export ACCESS_KEY=""
      fi
      if $setSecretKey ; then
        export SECRET_KEY=""
      fi
      if $setAdmiralIP ; then
        export ADMIRAL_IP=""
      fi
      if $setDBIP ; then
        export DB_IP=""
      fi
      if $setDBInstalled ; then
        export DB_INSTALLED=false
      fi
      if $setDBPort ; then
        export DB_PORT=""
      fi
      if $setDBPassword ; then
        export DB_PASSWORD=""
      fi
      if $setPublicImageRegistry ; then
        export PUBLIC_IMAGE_REGISTRY=""
      fi
      # Prompt again
      __prompt_for_inputs
    fi
  fi
}

__parse_args_install() {
  export IS_UPGRADE=false

  if [[ $# -gt 0 ]]; then
    while [[ $# -gt 0 ]]; do
      key="$1"

      case $key in
        -s|--silent)
         export NO_PROMPT=true
         ;;
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

__parse_args_restart() {
  export IS_RESTART=true
  local db_container=$(sudo docker ps -a -q -f "name=db" | awk '{print $1}')

  if [ "$DB_IP" == "$ADMIRAL_IP" ]; then
    __process_msg "Checking database container"
    if [ "$db_container" != "" ]; then
      __process_msg "Found a stopped database container, starting it"
      sudo docker start $db_container
    else
      __process_error "No database container found in stopped state, exiting"
      exit 1
    fi
  else
    __process_msg "DB running on a separate machine, skipping db state check"
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
    upgrade         Run silent upgrade without any prompts
    restart         Restart all services
    help            Print this message
    clean           Remove shippable containers and configurations
    info            Print information about current installation
  "
  exit 0
}

__show_status() {
  __process_msg "All good !!!"
}

__print_info() {
  echo "
  Release Version:  $RELEASE
  UI Address:       $ADMIRAL_IP
  Login Token:      $LOGIN_TOKEN
  Database Address: $DB_IP
  "
  exit 0
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

__accept_shippable_license() {
  __process_marker "Shippable Server Software License Agreement"

  __process_msg "BY INSTALLING OR USING THE SOFTWARE, YOU ARE CONFIRMING THAT YOU UNDERSTAND THE SHIPPABLE SERVER SOFTWARE LICENSE AGREEMENT, AND THAT YOU ACCEPT ALL OF ITS TERMS AND CONDITIONS."
  __process_msg "This agreement is available for you to read here: $PWD/SHIPPABLE_SERVER_LICENSE_AGREEMENT"
  __process_success "Do you wish to continue? (Y to confirm)"
  read confirmation
  if [[ "$confirmation" =~ "Y" ]]; then
    __process_msg "Thank you for accepting the Shippable Server Software License Agreement. Continuing with installation."
  else
    __process_error "Exiting Installer"
    exit 1
  fi
}

__parse_args() {
  if [[ $# -gt 0 ]]; then
    key="$1"

    case $key in
      install)
        shift
        __accept_shippable_license
        __bootstrap_admiral_env
        __generate_ssh_keys
        __parse_args_install "$@"
        ;;
      upgrade)
        __bootstrap_admiral_env
        export IS_UPGRADE=true
        ;;
      restart)
        __bootstrap_admiral_env
        __parse_args_restart
        ;;
      status)
        __show_status
        ;;
      info)
        __bootstrap_admiral_env
        __print_info
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
