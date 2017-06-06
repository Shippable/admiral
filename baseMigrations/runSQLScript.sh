#!/bin/bash -e

__run_sql_file() {
  local run_cmd="PGPASSWORD=$DBPASSWORD \
    psql \
    -U $DBUSERNAME \
    -d $DBNAME \
    -h $DBHOST \
    -p $DBPORT \
    -v ON_ERROR_STOP=1 \
    -f $SQL_FILE"

	eval "$run_cmd"
}

main() {
  echo "Running SQL file: $SQL_FILE"
  __run_sql_file
}

main
