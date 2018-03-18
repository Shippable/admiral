#!/bin/bash -e

main() {

  {
    check_ntp=$(systemctl 2>&1 | grep ntp)
  } || {
    true
  }

  if [ ! -z "$check_ntp" ]; then
    echo "NTP already installed, skipping."
  else
    echo "Installing NTP"
    sudo yum install -y ntp
    sudo systemctl restart ntpd
  fi
}

main
