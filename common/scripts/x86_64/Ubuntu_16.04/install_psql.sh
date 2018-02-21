#!/bin/bash -e

main() {
  echo "Installing psql 9.5"
  sudo apt-get update

  echo "Installing wget"
  sudo apt-get -yy install wget

  echo "Updating apt repo"
  echo "deb http://apt.postgresql.org/pub/repos/apt/ xenial-pgdg main" | sudo tee /etc/apt/sources.list.d/pgdg.list

  echo "Sourcing apt key"
  wget -q https://www.postgresql.org/media/keys/ACCC4CF8.asc -O - | sudo apt-key add -

  sudo apt-get update

  echo "Running installation"
  sudo apt-get -yy install postgresql-client-9.5

  echo "psql 9.5 successfully installed"
}

main
