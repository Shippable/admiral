#!/bin/bash -e

###########################################################
#
# Shippable Enterprise Installer
#
# Supported OS: Ubuntu 14.04
# Supported bash: 4.3.11
###########################################################

# Global variables ########################################
###########################################################
readonly IFS=$'\n\t'
readonly ROOT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
readonly CONFIG_DIR="/etc/shippable"
readonly RUNTIME_DIR="/var/run/shippable"
readonly VERSIONS_DIR="$ROOT_DIR/versions"
readonly MIGRATIONS_DIR="$ROOT_DIR/migrations"
readonly POST_INSTALL_MIGRATIONS_DIR="$MIGRATIONS_DIR/post_install"
readonly SCRIPTS_DIR="$ROOT_DIR/common/scripts"
readonly LIB_DIR="$ROOT_DIR/lib"
readonly USR_DIR="$ROOT_DIR/usr"
readonly LOGS_DIR="$RUNTIME_DIR/logs"
readonly TIMESTAMP="$(date +%Y_%m_%d_%H_%M_%S)"
readonly LOG_FILE="$LOGS_DIR/${TIMESTAMP}_logs.txt"
readonly REMOTE_SCRIPTS_DIR="$ROOT_DIR/scripts/remote"
readonly LOCAL_SCRIPTS_DIR="$ROOT_DIR/scripts/local"
readonly ADMIRAL_ENV="$CONFIG_DIR/admiral.env"
readonly SSH_PRIVATE_KEY=$CONFIG_DIR/machinekey
readonly SSH_PUBLIC_KEY=$CONFIG_DIR/machinekey.pub
readonly MAX_DEFAULT_LOG_COUNT=6
readonly SSH_USER="root"
readonly LOCAL_BRIDGE_IP=172.17.42.1
readonly DOCKER_VERSION=1.13.0
readonly API_TIMEOUT=600
readonly OS_TYPE="Ubuntu_14.04"
export LC_ALL=C

# Installation default values #############################
###########################################################
export IS_UPGRADE=false
export NO_PROMPT=false
export KEYS_GENERATED=false
###########################################################

source "$LIB_DIR/_logger.sh"
source "$LIB_DIR/_helpers.sh"
source "$LIB_DIR/_parseArgs.sh"

main() {
  __check_logsdir
  __parse_args "$@"
  __check_dependencies
  __validate_runtime
  __print_runtime
  ### Environment variables set, configure database ######

  source "common"
  __process_msg "Installation successfully completed !!!"
}

main "$@"
