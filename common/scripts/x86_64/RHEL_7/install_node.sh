#!/bin/bash -e

main() {

  pushd /tmp
  echo "Installing node 8.11.3"
  sudo wget https://nodejs.org/dist/v8.11.3/node-v8.11.3-linux-x64.tar.xz
  sudo tar -xf node-v8.11.3-linux-x64.tar.xz
  sudo cp -Rf node-v8.11.3-linux-x64/{bin,include,lib,share} /usr/local
  export PATH="$PATH:/usr/local/bin/"
  node -v
  sudo rm -rf node-v8.11.3-linux-x64.tar.xz
  popd
}

main
