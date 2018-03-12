#!/bin/bash -e

main() {
  echo "Adding rpm repo"
  yum install -y https://download.postgresql.org/pub/repos/yum/9.5/redhat/rhel-7-x86_64/pgdg-redhat95-9.5-3.noarch.rpm

  echo "Installing psql"
  yum install -y postgresql95

  echo "psql 9.5 successfully installed"
}

main
