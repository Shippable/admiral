#!/bin/bash -e

_copy_script_remote() {
  if [ "$#" -ne 3 ]; then
    __process_msg "The number of arguments expected by _copy_script_remote is 3"
    __process_msg "current arguments $@"
    exit 1
  fi

  local user="$SSH_USER"
  local key="$SSH_PRIVATE_KEY"
  local port=22
  local host="$1"
  shift
  local script_path_local="$1"
  local script_name=$(basename $script_path_local)
  shift
  local script_dir_remote="$1"
  local script_path_remote="$script_dir_remote/$script_name"

  remove_key_cmd="ssh-keygen -q -f '$HOME/.ssh/known_hosts' -R $host > /dev/null 2>&1"
  {
    eval $remove_key_cmd
  } || {
    true
  }

  __process_msg "Copying $script_path_local to remote host: $script_path_remote"
  _exec_remote_cmd $host "mkdir -p $script_dir_remote"
  copy_cmd="rsync -avz -e \
    'ssh \
      -o StrictHostKeyChecking=no \
      -o NumberOfPasswordPrompts=0 \
      -p $port \
      -i $SSH_PRIVATE_KEY \
      -C -c blowfish' \
      $script_path_local $user@$host:$script_path_remote"

  copy_cmd_out=$(eval $copy_cmd)
}
