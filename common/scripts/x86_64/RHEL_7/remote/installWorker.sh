#!/bin/bash -e

__create_exec_file() {
  echo "Creating docker install script"
  rm -f installDockerScript.sh
  touch installDockerScript.sh
  echo '#!/bin/bash' >> installDockerScript.sh
  echo 'install_docker_only="true"' >> installDockerScript.sh
  echo "SHIPPABLE_HTTP_PROXY=\"$SHIPPABLE_HTTP_PROXY\"" >> installDockerScript.sh
  echo "SHIPPABLE_HTTPS_PROXY=\"$SHIPPABLE_HTTPS_PROXY\"" >> installDockerScript.sh
  echo "SHIPPABLE_NO_PROXY=\"$SHIPPABLE_NO_PROXY\"" >> installDockerScript.sh

  local node_scripts_location=/tmp/node
  local node_s3_location="https://s3.amazonaws.com/shippable-artifacts/node/$RELEASE/node-$RELEASE.tar.gz"

  pushd /tmp
  mkdir -p $node_scripts_location
  curl -o "./node-$RELEASE.tar.gz" $node_s3_location
  tar -xzf node-$RELEASE.tar.gz -C $node_scripts_location --strip-components=1
  rm -rf node-$RELEASE.tar.gz
  popd

  cat $node_scripts_location/lib/logger.sh >> installDockerScript.sh
  cat $node_scripts_location/lib/headers.sh >> installDockerScript.sh
  cat $node_scripts_location/initScripts/x86_64/RHEL_7/Docker_17.06.sh >> installDockerScript.sh

  rm -rf $node_scripts_location
}

__install_docker() {
  # Install Docker
  echo "Installing docker"
  chmod +x installDockerScript.sh
  ./installDockerScript.sh
  rm installDockerScript.sh
}

__install_ntp() {
  # Install ntp
  echo "Installing NTP"
  sudo yum install -y ntp
  sudo service ntpd restart
}

__install_ecr() {
  local epel_rpm_package="epel-release-latest-7.noarch.rpm"
  curl -O "https://dl.fedoraproject.org/pub/epel/$epel_rpm_package"
  yum install -y "$epel_rpm_package"
  rm "$epel_rpm_package"

  sudo yum -y install python-pip
  sudo pip install awscli==1.11.91
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
  if [ "$NO_VERIFY_SSL" == true ]; then
    local docker_login_cmd=$(aws ecr --no-include-email --no-verify-ssl --region us-east-1 get-login)
  else
    local docker_login_cmd=$(aws ecr --no-include-email --region us-east-1 get-login)
  fi
  echo "Docker login generated, logging into ecr"
  eval "$docker_login_cmd"
}

main() {
  echo "Installing docker on worker node: $WORKER_HOST"
  __create_exec_file
  __install_docker
  __install_ntp
  __install_ecr
  __initialize_worker
  __registry_login
}

main
