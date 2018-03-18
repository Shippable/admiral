#!/bin/bash -e

main() {

  {
    check_ntp=$(service --status-all 2>&1 | grep ntp)
  } || {
    true
  }

  if [ ! -z "$check_ntp" ]; then
    echo "NTP already installed, skipping."
  else
    echo "Installing NTP"
    sudo apt-get install -y ntp
    sudo service ntp restart
  fi
}

main