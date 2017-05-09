#!/bin/bash -e

__create_exec_file() {
  echo "Creating docker install script"
  rm -f installDockerScript.sh
  touch installDockerScript.sh
  echo '#!/bin/bash' >> installDockerScript.sh
  echo 'readonly MESSAGE_STORE_LOCATION="/tmp/cexec"' >> installDockerScript.sh
  echo 'readonly KEY_STORE_LOCATION="/tmp/ssh"' >> installDockerScript.sh
  echo 'readonly BUILD_LOCATION="/build"' >> installDockerScript.sh
  # Fetch the installation script and headers
  echo "Downloading installation scripts from 'node' repo"
  curl https://raw.githubusercontent.com/Shippable/node/$RELEASE/lib/logger.sh >> installDockerScript.sh
  curl https://raw.githubusercontent.com/Shippable/node/$RELEASE/lib/headers.sh >> installDockerScript.sh
  curl https://raw.githubusercontent.com/Shippable/node/$RELEASE/scripts/Ubuntu_14.04_Docker_1.13.sh >> installDockerScript.sh
}

__install_docker() {
  # Install Docker
  echo "Installing docker"
  chmod +x installDockerScript.sh
  ./installDockerScript.sh
  rm installDockerScript.sh
}

__initialize_worker() {
  echo "Initializing swarm worker"
  sudo docker swarm leave || true
  local join_command="sudo docker swarm join --token $WORKER_JOIN_TOKEN $MASTER_HOST"
  echo "$join_command"
  eval "$join_command"
}

__registry_login() {
  echo "Logging into registry"
  mkdir -p ~/.aws
  local docker_login_cmd=$(aws ecr --region us-east-1 get-login)
  __process_msg "Docker login generated, logging into ecr"
  eval "$docker_login_cmd"
}

main() {
  echo "Installing docker on worker node: $WORKER_HOST"
  __create_exec_file
  __install_docker
  __initialize_worker
  __registry_login
}

main
