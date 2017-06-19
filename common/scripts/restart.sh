#!/bin/bash -e

main() {
  if [ $IS_RESTART == true ]; then
    __process_marker "Restarting Shippable services"
  fi
}

main
