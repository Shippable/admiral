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
readonly RUNTIME_DIR="/var/lib/shippable"
readonly MIGRATIONS_DIR="$ROOT_DIR/migrations"
readonly POST_INSTALL_MIGRATIONS_DIR="$MIGRATIONS_DIR/post_install"
readonly SCRIPTS_DIR="$ROOT_DIR/common/scripts"
readonly LIB_DIR="$SCRIPTS_DIR/lib"
readonly LOGS_DIR="$RUNTIME_DIR/logs"
readonly TIMESTAMP="$(date +%Y%m%d%H%M)"
readonly LOG_FILE="$LOGS_DIR/${TIMESTAMP}_cli.txt"
readonly LOCAL_SCRIPTS_DIR="$SCRIPTS_DIR/local"
readonly ADMIRAL_ENV="$CONFIG_DIR/admiral.env"
readonly SSH_PRIVATE_KEY=$CONFIG_DIR/machinekey
readonly SSH_PUBLIC_KEY=$CONFIG_DIR/machinekey.pub
readonly SCRIPTS_DIR_REMOTE="/tmp/shippable"
readonly MAX_DEFAULT_LOG_COUNT=6
readonly DOCKER_VERSION=1.13
readonly AWSCLI_VERSION=1.10.63
readonly API_TIMEOUT=600
readonly ADMIRAL_PORT=50003
export LC_ALL=C

# Installation default values #############################
###########################################################
export IS_UPGRADE=false
export IS_RESTART=false
export NO_PROMPT=false
export WITH_PROXY_CONFIG=false
export KEYS_GENERATED=false
###########################################################

source "$LIB_DIR/_logger.sh"
source "$LIB_DIR/_helpers.sh"

__bootstrap_admiral_env
__check_os_and_architecture

source "$SCRIPTS_DIR/$ARCHITECTURE/$OPERATING_SYSTEM/_helpers.sh"

source "$LIB_DIR/_parseArgs.sh"
source "$LIB_DIR/_admiralAdapter.sh"

main() {
  __check_logsdir
  __parse_args "$@"
  __validate_runtime
  __configure_proxy
  __check_dependencies
  __pull_images
  __pull_images_workers
  {
    __print_runtime
    source "$SCRIPTS_DIR/installDb.sh"
    source "$SCRIPTS_DIR/create_vault_table.sh"
    source "$SCRIPTS_DIR/boot_admiral.sh"
    source "$SCRIPTS_DIR/upgrade.sh"
    source "$SCRIPTS_DIR/restart.sh"
  } 2>&1 | tee $LOG_FILE ; ( exit ${PIPESTATUS[0]} )

  __process_msg "Command successfully completed!"
}

main "$@"
