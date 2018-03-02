#!/bin/bash -e
export GITLAB_VERSION=8.9.6-ce.0.el7
export TIMEOUT=180
export SSH_TIMEOUT=60

install_deps() {
  echo "installing dependencies"
  yum install -y curl policycoreutils-python openssh-server openssh-clients nc
  systemctl enable sshd
  systemctl start sshd
}

install_gitlab() {
  echo "installing Gitlab"
  curl -sS https://packages.gitlab.com/install/repositories/gitlab/gitlab-ce/script.rpm.sh | bash
  yum install -y --nogpgcheck gitlab-ce-$GITLAB_VERSION
}

configure_and_start() {
  echo "configuring and starting gitlab"
  gitlab-ctl reconfigure
}

# accepts arguments $host $port $serviceName $timeout
__check_service_connection() {
  local host=$1
  local port=$2
  local service=$3
  local timeout=$4
  local interval=3
  local counter=0
  local service_booted=false

  while [ $service_booted != true ] && [ $counter -lt $timeout ]; do
    if nc -v --send-only </dev/null $host $port &>/dev/null; then
      echo "$service found"
      sleep 5
      service_booted=true
    else
      echo "Waiting for $service to start"
      let "counter = $counter + $interval"
      sleep $interval
    fi
  done
  if [ $service_booted = false ]; then
    echo "Could not detect $service container for host:$host, port:$port"
    exit 1
  fi
}

check_state() {
  echo "Checking gitlab status on: $STATE_HOST:$STATE_PORT"
  __check_service_connection "$STATE_HOST" "$STATE_PORT" "gitlab" "$TIMEOUT"
  echo "Checking SSH status on: $STATE_HOST:$SSH_PORT"
  __check_service_connection "$STATE_HOST" "$SSH_PORT" "ssh" "$SSH_TIMEOUT"
}

main() {
  check_state=""
  {
    type gitlab-ctl &> /dev/null
    check_state="state up"
    if ! nc -v --send-only </dev/null $STATE_HOST $STATE_PORT &>/dev/null; then
      check_state=""
    fi
    if ! nc -v --send-only </dev/null $STATE_HOST $SSH_PORT &>/dev/null; then
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
