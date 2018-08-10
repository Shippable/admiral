#!/bin/bash -e

###########################################################
#
# Shippable Enterprise Installer
#
# Supported OS:
#   - Ubuntu 14.04
#   - Ubuntu 16.04
#   - CentOS 7
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
readonly API_TIMEOUT=600
readonly ADMIRAL_PORT=50003
export LC_ALL=C

# Installation default values #############################
###########################################################
export IS_UPGRADE=false
export IS_RESTART=false
export IS_STATUS=false
export NO_PROMPT=false
export WITH_PROXY_CONFIG=false
export KEYS_GENERATED=false
###########################################################

source "$LIB_DIR/_logger.sh"
source "$LIB_DIR/_helpers.sh"

__bootstrap_admiral_env
__check_os_and_architecture
__set_installed_docker_version

source "$SCRIPTS_DIR/$ARCHITECTURE/$OPERATING_SYSTEM/_installVersion.env"
source "$SCRIPTS_DIR/$ARCHITECTURE/$OPERATING_SYSTEM/_helpers.sh"

source "$LIB_DIR/_parseArgs.sh"
source "$LIB_DIR/_admiralAdapter.sh"
source "$SCRIPTS_DIR/update_bbs_accountIntegrations.sh"

main() {
  __check_logsdir
  __parse_args "$@"
  if [ "$IS_STATUS" == "true" ]; then
      source "$SCRIPTS_DIR/status.sh"
  else
    __validate_runtime
    __configure_proxy
    __check_dependencies
    __pull_admiral_image
    if [ "$DEV_MODE" == "true" ]; then
      __pull_stateful_service_images
    fi
    __check_ssh_key_present
    {
      __print_runtime
      source "$SCRIPTS_DIR/installDb.sh"
      source "$SCRIPTS_DIR/create_vault_table.sh"
      source "$SCRIPTS_DIR/$ARCHITECTURE/$OPERATING_SYSTEM/boot_admiral.sh"
      source "$SCRIPTS_DIR/upgrade.sh"
      source "$SCRIPTS_DIR/restart.sh"
    } 2>&1 | tee $LOG_FILE ; ( exit ${PIPESTATUS[0]} )
  fi

  __process_msg "Command successfully completed!"
}

main "$@"
