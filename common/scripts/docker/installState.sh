#!/bin/bash -e

export STATE_IMAGE="374168611083.dkr.ecr.us-east-1.amazonaws.com/gitlab:$RELEASE"
export TIMEOUT=180

__cleanup() {
  __process_msg "Removing stale containers"
  sudo docker rm -f $COMPONENT || true
}

__run_state() {
  __process_msg "Running gitlab container"
  local data_dir_container="/var/opt/gitlab"
  local config_dir_container="/etc/gitlab"
  local logs_dir_container="/var/log/gitlab"

  local config="external_url 'http://$STATE_HOST'; \
      gitlab_rails['initial_root_password'] = '$STATE_PASS'; \
      gitlab_rails['rate_limit_requests_per_period'] = 1000000; \
      gitlab_rails['rate_limit_period'] = 1;"

  local run_cmd="sudo docker run \
    -d \
    -e GITLAB_OMNIBUS_CONFIG="\"$config\"" \
    -v $STATE_CONFIG_DIR:$config_dir_container \
    -v $STATE_DATA_DIR:$data_dir_container \
    -v $STATE_LOGS_DIR:$logs_dir_container \
    --publish $SSH_PORT:22 \
    --publish $STATE_PORT:$STATE_PORT \
    --publish $SECURE_PORT:$SECURE_PORT \
    --privileged=true \
    --name=$COMPONENT \
    $STATE_IMAGE
  "

  eval "$run_cmd"
  __process_msg "Gitlab container successfully running"
}

__check_state() {
  __process_msg "Checking gitlab container status on: $STATE_HOST:$STATE_PORT"

  __check_service_connection "$STATE_HOST" "$STATE_PORT" "$COMPONENT" "$TIMEOUT"
  __check_service_connection "$STATE_HOST" "$SSH_PORT" "ssh"
}

main() {
  __process_marker "Installing Gitlab"
  __cleanup
  __run_state
  __check_state
}

main
