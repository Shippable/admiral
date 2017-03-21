#!/bin/bash -e

_copy_script_local() {
  local user="$SSH_USER"
  local key="$SSH_PRIVATE_KEY"
  local port=22
  local host="$1"
  shift
  local script_path_remote="$@"

  local script_dir_local="/tmp/shippable"

  echo "copying from $script_path_remote to localhost: /tmp/shippable/"
  remove_key_cmd="ssh-keygen -q -f '$HOME/.ssh/known_hosts' -R $host"
  {
    eval $remove_key_cmd
  } || {
    true
  }

  mkdir -p $script_dir_local
  copy_cmd="rsync -avz -e \
    'ssh \
      -o StrictHostKeyChecking=no \
      -o NumberOfPasswordPrompts=0 \
      -p $port \
      -i $SSH_PRIVATE_KEY \
      -C -c blowfish' \
      $user@$host:$script_path_remote $script_dir_local"

  copy_cmd_out=$(eval $copy_cmd)
  echo "$script_path_remote"
}
