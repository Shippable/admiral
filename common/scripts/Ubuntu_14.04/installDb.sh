#!/bin/bash -e

readonly PG_VERSION=9.5
readonly PG_USER=postgres
readonly PG_DEFAULT_CONFIG_PATH=/etc/postgresql/$PG_VERSION/main
readonly PG_CONFIG_PATH=$PG_DEFAULT_CONFIG_PATH/postgresql.conf
readonly PG_BIN_PATH=/usr/lib/postgresql/$PG_VERSION/bin

readonly ROOT_MOUNT_PATH=/pg
readonly ROOT_DB_PATH="$ROOT_MOUNT_PATH"/db
readonly ROOT_CONFIG_PATH="$ROOT_MOUNT_PATH"/config

readonly DATA_MOUNT_PATH=/ship
readonly DATA_DB_PATH="$DATA_MOUNT_PATH"/db

readonly DB_ROLE=dbo
readonly DB_TABLESPACE_PATH=/ship/db
readonly DB_TABLESPACE_NAME=shipts

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

__update_sources() {
  echo "Updating source repo information"
  wget -q https://www.postgresql.org/media/keys/ACCC4CF8.asc -O - | apt-key add -

  postgresql_deb="deb http://apt.postgresql.org/pub/repos/apt/ `lsb_release -cs`-pgdg main"
  postgres=$(cat /etc/apt/sources.list.d/pgdg.list 2>/dev/null | grep "$postgresql_deb") || true
  if [ -z "$postgres" ]; then
    echo $postgresql_deb | tee -a /etc/apt/sources.list.d/pgdg.list
  fi

  sudo apt-get -y update
}

__install_postgres() {
  echo "Checking existing Postgres installation"
  local pg_path=""
  {
    pg_path=$(which psql)
  } || {
    pg_path=""
  }

  if [ -z "$pg_path" ]; then
    echo "|_########## Postgres not installed, installing"
    apt-get install -y postgresql-$PG_VERSION postgresql-contrib-$PG_VERSION
  else
    echo "|_########## Postgres already installed, skipping"
  fi
}

__configure_data_dirs() {
  echo "Configuring Postgres data directory"
  mkdir -p $ROOT_MOUNT_PATH

  echo "Configuring Shippable data directory"
  mkdir -p $DATA_MOUNT_PATH
}

__update_ownership() {
  echo "Updating ownership of Postgres data directory"
  chown -cR $PG_USER:$PG_USER $ROOT_MOUNT_PATH

  echo "Updating ownership of Shippable data directory"
  chown -cR $PG_USER:$PG_USER $DATA_MOUNT_PATH
}

__initialize_root_db() {
  echo "Initializing root DB"
  sudo -u postgres mkdir -p $ROOT_DB_PATH
  sudo -u postgres mkdir -p $ROOT_CONFIG_PATH
  local init_db_cmd="sudo -u postgres $PG_BIN_PATH/initdb $ROOT_DB_PATH"
  echo "|_######### executing $init_db_cmd"
  init_db_cmd_res=$($init_db_cmd)
}

__initialize_data_db_directory() {
  echo "Initializing  data DB"
  sudo -u postgres mkdir -p $DATA_DB_PATH
}


__stop_running_instance() {
  echo "Stopping running Postgres instance"
  {
    service postgresql stop
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
  echo "Updating root database path to : $ROOT_DB_PATH"
  echo "data_directory = '$ROOT_DB_PATH'" | tee -a $PG_CONFIG_PATH

  echo "Updating hba file path to : $ROOT_CONFIG_PATH/pg_hba.conf"
  echo "hba_file = '$ROOT_CONFIG_PATH/pg_hba.conf'"  | tee -a $PG_CONFIG_PATH

  echo "Updating ident file path to : $ROOT_CONFIG_PATH/pg_ident.conf"
  echo "ident_file = '$ROOT_CONFIG_PATH/pg_ident.conf'"  | tee -a $PG_CONFIG_PATH

  chown -cR postgres:postgres $ROOT_CONFIG_PATH
}

__initialize_custom_config() {
  local header="Shippable Postgres"
  {
    grep "$header" $PG_CONFIG_PATH
  } || {
    echo "#------------------------------------------------------" | tee -a $PG_CONFIG_PATH
    echo "#----------- Shippable Postgres Config ----------------" | tee -a $PG_CONFIG_PATH
    echo "#------------------------------------------------------" | tee -a $PG_CONFIG_PATH
  }
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
  service postgresql start
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
    check_postgres=$(service --status-all 2>&1 | grep postgres)
  } || {
    true
  }
  if [ ! -z "$check_postgres" ]; then
    echo "Postgres already installed, skipping."
    return
  fi

  pushd /tmp
  __validate_db_envs
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
  sleep 5
  __bootstrap_db
  popd
}

main
