#!/bin/bash -e

readonly PG_VERSION=9.5
readonly PG_USER=postgres
readonly PG_DEFAULT_CONFIG_PATH=/var/lib/pgsql/$PG_VERSION/data
readonly PG_CONFIG_PATH=$PG_DEFAULT_CONFIG_PATH/postgresql.conf
readonly PG_BIN_PATH=/usr/pgsql-$PG_VERSION/bin/postgresql95-setup

readonly ROOT_MOUNT_PATH=/pg
readonly ROOT_CONFIG_PATH="$ROOT_MOUNT_PATH"/config

readonly DATA_DB_PATH=/var/lib/pgsql/$PG_VERSION/data
readonly DB_ROLE=dbo
readonly DB_TABLESPACE_PATH=/var/lib/pgsql/$PG_VERSION/data
readonly DB_TABLESPACE_NAME=shipts

export DB_TIMEOUT=180

__validate_db_envs() {
  echo "Validating db ENV variables"
  if [ "$DB_IP" == "" ]; then
    echo "DB_IP cannot be empty, exiting"
    exit 1
  fi

  if [ "$DB_PORT" == "" ]; then
    echo "DB_PORT cannot be empty, exiting"
    exit 1
  fi

  if [ "$DB_USER" == "" ]; then
    echo "DB_USER cannot be empty, exiting"
    exit 1
  fi

  if [ "$DB_NAME" == "" ]; then
    echo "DB_NAME cannot be empty, exiting"
    exit 1
  fi

  if [ "$DB_PASSWORD" == "" ]; then
    echo "DB_PASSWORD cannot be empty, exiting"
    exit 1
  fi

  if [ "$DB_DIALECT" == "" ]; then
    echo "DB_DIALECT cannot be empty, exiting"
    exit 1
  fi
}

__install_deps() {
  echo "installing dependencies"
  yum check-update || true
  yum install -y nc
}

__update_sources() {
  echo "Updating source repo information"

  ## so that posgres dependency do not resolve to base repo
  echo "exclude=postgresql*" | tee -a "/etc/yum.repos.d/CentOS-Base.repo"
}

__install_postgres() {
  echo "Installing Postgres"
  #sudo rpm -ivh --force http://yum.postgresql.org/9.5/redhat/rhel-7-x86_64/pgdg-redhat95-9.5-3.noarch.rpm
  #yum install -y https://download.postgresql.org/pub/repos/yum/9.5/redhat/rhel-7-x86_64/pgdg-redhat95-9.5-3.noarch.rpm
  yum install -y postgresql95 postgresql95-server postgresql95-contrib
#yum install -y https://download.postgresql.org/pub/repos/yum/9.5/redhat/rhel-7-x86_64/pgdg-redhat95-9.5-3.noarch.rpm
  sudo systemctl enable postgresql-9.5.service
}


__configure_data_dirs() {
  echo "Configuring Postgres data directory"
  mkdir -p $ROOT_MOUNT_PATH

  echo "Configuring Shippable data directory"
  mkdir -p $DATA_DB_PATH
}

__update_ownership() {
  echo "Updating ownership of Postgres data directory"
  chown -cR $PG_USER:$PG_USER $ROOT_MOUNT_PATH

  echo "Updating ownership of Shippable data directory"
  chown -cR $PG_USER:$PG_USER $DATA_DB_PATH
}

__initialize_root_db() {
  echo "Initializing root DB"

  sudo -u postgres mkdir -p $ROOT_CONFIG_PATH
  local init_db_cmd="sudo $PG_BIN_PATH initdb"
  echo "|_######### executing $init_db_cmd"
  init_db_cmd_res=$($init_db_cmd)
}

__initialize_data_db_directory() {
  echo "Initializing  data DB"
  sudo -u postgres mkdir -p $DATA_DB_PATH

  echo "Starting postgres"
  systemctl start postgresql-9.5.service
}

__stop_running_instance() {
  echo "Stopping running Postgres instance"
  {
    systemctl stop postgresql-9.5.service
  } || {
    echo "Service already stopped"
  }
}

__create_root_config_files() {
  echo "Creating root config files"
  ##
  # These are just copied over from the default installation
  # and need to be checked out from SCM
  ##
  cp -vr $PG_DEFAULT_CONFIG_PATH/pg_hba.conf $ROOT_CONFIG_PATH/pg_hba.conf
  cp -vr $PG_DEFAULT_CONFIG_PATH/pg_ident.conf $ROOT_CONFIG_PATH/pg_ident.conf
}

__update_root_config() {
  local header="Shippable Postgres"
  {
    grep "$header" $PG_CONFIG_PATH
  } || {
    echo "#------------------------------------------------------" | tee -a $PG_CONFIG_PATH
    echo "#----------- Shippable Postgres Config ----------------" | tee -a $PG_CONFIG_PATH
    echo "#------------------------------------------------------" | tee -a $PG_CONFIG_PATH
  }

  echo "Updating hba file path to : $ROOT_CONFIG_PATH/pg_hba.conf"
  echo "hba_file = '$ROOT_CONFIG_PATH/pg_hba.conf'"  | tee -a $PG_CONFIG_PATH

  echo "Updating ident file path to : $ROOT_CONFIG_PATH/pg_ident.conf"
  echo "ident_file = '$ROOT_CONFIG_PATH/pg_ident.conf'"  | tee -a $PG_CONFIG_PATH

  chown -cR postgres:postgres $ROOT_CONFIG_PATH
}

__initialize_custom_config() {
  #################################################################
  ######### SHIPPABLE custom POSTGRES configuration ###############
  ######### add variables here that will override defaults in #####
  ######### /etc/postgresql/9.5/main/postgresql.conf ##############
  #################################################################
  echo "listen_addresses='*'"  | tee -a $PG_CONFIG_PATH
}

__initialize_auth_config() {
  local hba_config=$ROOT_CONFIG_PATH/pg_hba.conf
  local header="Shippable Postgres"
  {
    grep "$header" $hba_config
  } || {
    echo "#------------------------------------------------------" | tee -a $hba_config
    echo "#----------- Shippable Postgres Config ----------------" | tee -a $hba_config
    echo "#------------------------------------------------------" | tee -a $hba_config
  }
  #################################################################
  ######### SHIPPABLE custom POSTGRES configuration ###############
  ######### add variables here that will override defaults in #####
  ######### /pg/config/pg_hba.conf ################################
  #################################################################
  echo "host all  all    0.0.0.0/0  md5" | tee -a $hba_config
}

__start_instance() {
  echo "Starting Postgres"
  systemctl start postgresql-9.5.service
}

# accepts arguments $host $port $serviceName $timeout
__check_service_connection() {
  local host=$1
  local port=$2
  local service=$3
  local timeout=$4
  local interval=3
  local counter=0
  local service_booted=false

  while [ $service_booted != true ] && [ $counter -lt $timeout ]; do
    if nc -v --send-only </dev/null $host $port &>/dev/null; then
      echo "$service found"
      sleep 5
      service_booted=true
    else
      echo "Waiting for $service to start"
      let "counter = $counter + $interval"
      sleep $interval
    fi
  done
  if [ $service_booted = false ]; then
    echo "Could not detect $service container for host:$host, port:$port"
    exit 1
  fi
}

__check_db() {
  echo "Checking database status on: $DB_IP:$DB_PORT"
  __check_service_connection "$DB_IP" "$DB_PORT" "database" "$DB_TIMEOUT"
}

__bootstrap_db() {
  sudo -u postgres psql -c "CREATE ROLE $DB_ROLE INHERIT";
  sudo -u postgres psql -c "CREATE USER $DB_USER IN ROLE $DB_ROLE PASSWORD '$DB_PASSWORD' LOGIN INHERIT";
  sudo -u postgres psql -c "CREATE TABLESPACE $DB_TABLESPACE_NAME OWNER $DB_ROLE LOCATION '$DB_TABLESPACE_PATH'";
  sudo -u postgres psql -c "CREATE DATABASE $DB_NAME OWNER $DB_ROLE TABLESPACE $DB_TABLESPACE_NAME";
  sudo -u postgres psql -c "REVOKE CONNECT ON DATABASE $DB_NAME FROM PUBLIC";
  sudo -u postgres psql -c "GRANT CONNECT ON DATABASE $DB_NAME TO $DB_ROLE";
}

main() {
  {
    check_postgres=$(systemctl list-units --type service | grep postgres)
  } || {
    true
  }
  if [ ! -z "$check_postgres" ]; then
    echo "Postgres already installed, skipping."
    return
  fi

  pushd /tmp
  __validate_db_envs
  __install_deps
  __update_sources
  __install_postgres
  __configure_data_dirs
  __update_ownership
  __initialize_root_db
  __initialize_data_db_directory
  __stop_running_instance
  __create_root_config_files
  __update_root_config
  __initialize_custom_config
  __initialize_auth_config
  __start_instance
  __check_db
  __bootstrap_db
  popd
}

main
