#!/bin/bash -e

export PROJECT_CLONE_LOCATION="<%=cloneLocation%>"
export SHA="<%=sha%>"

git_sync() {
  echo "----> Pushing Directory $PROJECT_CLONE_LOCATION"
  pushd $PROJECT_CLONE_LOCATION

  if [ ! -z "$SHA" ]; then
    git checkout $SHA
  fi

  echo "----> Popping $PROJECT_CLONE_LOCATION"
  popd
}

main() {
  echo '----> Executing git_sync'
  git_sync
}

main
