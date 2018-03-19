#!/bin/bash -e

main() {

  pushd /tmp
  echo "Installing node 4.8.5"
  sudo wget https://nodejs.org/dist/v4.8.5/node-v4.8.5-linux-x64.tar.xz
  sudo tar -xf node-v4.8.5-linux-x64.tar.xz
  sudo cp -Rf node-v4.8.5-linux-x64/{bin,include,lib,share} /usr/local
  export PATH="$PATH:/usr/local/bin/"
  node -v
  sudo rm -rf node-v4.8.5-linux-x64.tar.xz
  popd
}

main
