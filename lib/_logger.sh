#!/bin/bash -e
__process_marker() {
  local prompt="$@"
  echo ""
  echo "# $(date +"%T") #######################################"
  echo "# $prompt"
  echo "##################################################"
}

__process_msg() {
  local message="$@"
  echo "|___ $@"
}

__process_error() {
  local message="$1"
  local error="$2"
  local bold_red_text='\e[91m'
  local reset_text='\033[0m'

  echo -e "$bold_red_text|___ $message$reset_text"
  echo -e "     $error"
}

__process_success() {
  local message="$@"
  local bold_green_text='\e[32m'
  local reset_text='\033[0m'

  echo -e "$bold_green_text|___ $message$reset_text"
}

__check_logsdir() {
  if [ ! -d "$LOGS_DIR" ]; then
    mkdir -p "$LOGS_DIR"
  fi
}
