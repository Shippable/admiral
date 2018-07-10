#!/bin/bash -e

export PRIVATE_KEY="<%=privateKey%>"
export PROJECT_SSH_URL="<%=projectSshUrl%>"
export PROJECT_CLONE_LOCATION="<%=cloneLocation%>"
export PEM_FILE_LOCATION="<%=pemFileLocation%>"

git_sync() {
  echo "----> Adding SSH Key"
  echo "$PRIVATE_KEY" > $PEM_FILE_LOCATION

  echo "----> Updating SSH Key Permission"
  chmod 600 $PEM_FILE_LOCATION

  echo "----> Cloning Git Repo"
  ssh-agent bash -c "ssh-add $PEM_FILE_LOCATION; git clone $PROJECT_SSH_URL $PROJECT_CLONE_LOCATION"

  echo "----> Pushing Directory $PROJECT_CLONE_LOCATION"
  pushd $PROJECT_CLONE_LOCATION

  echo "----> Popping $PROJECT_CLONE_LOCATION"
  popd
}

main() {
  echo '----> Executing git_sync'
  git_sync
}

main
