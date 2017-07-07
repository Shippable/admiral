#!/bin/bash -e
export GITLAB_VERSION=8.9.6-ce.0
export TIMEOUT=60

install_deps() {
  echo "installing dependencies"
  apt-get -y install curl openssh-server ca-certificates
}

install_gitlab() {
  echo "installing Gitlab"
  curl -sS https://packages.gitlab.com/install/repositories/gitlab/gitlab-ce/script.deb.sh | bash
  apt-get -y install gitlab-ce=$GITLAB_VERSION
}

configure_and_start() {
  echo "configuring and starting gitlab"
  gitlab-ctl reconfigure
}

check_state() {
  echo "Checking gitlab status on: $STATE_HOST:$STATE_PORT"
  local interval=3
  local counter=0
  local is_booted=false

  while [ $is_booted != true ] && [ $counter -lt $TIMEOUT ]; do
    if nc -vz $STATE_HOST $STATE_PORT &>/dev/null; then
      echo "Gitlab found"
      sleep 5
      is_booted=true
    else
      echo "Waiting for gitlab to start"
      let "counter = $counter + $interval"
      sleep $interval
    fi
  done
  if [ $is_booted = false ]; then
    echo "Failed to boot gitlab"
    echo "Port $STATE_PORT not available for State."
    exit 1
  fi
  if ! nc -vz $STATE_HOST $SSH_PORT &>/dev/null; then
    echo "Port $SSH_PORT not available for State"
    exit 1
  fi
}

main() {
  check_state=""
  {
    type gitlab-ctl &> /dev/null
    check_state="state up"
    if ! nc -vz $STATE_HOST $STATE_PORT &>/dev/null; then
      check_state=""
    fi
    if ! nc -vz $STATE_HOST $SSH_PORT &>/dev/null; then
      check_state=""
    fi
  } || true

  if [ ! -z "$check_state" ]; then
    echo "Gitlab already installed, skipping"
    return
  fi

  install_deps
  install_gitlab
  configure_and_start
  check_state
}

main
