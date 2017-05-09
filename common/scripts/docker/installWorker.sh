#!/bin/bash -e

__run_worker() {
  __process_msg "Running swarm worker"
  sudo docker version
}

main() {
  __process_marker "Installing swarm worker"
  __run_worker
}

main
