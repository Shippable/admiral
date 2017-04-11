#!/bin/bash -e

export COMPONENT="msg"
readonly RABBITMQ_ADMIN="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"/rabbitmqadmin
export SHIPPABLE_MQ_HOST=172.17.42.1
export SHIPPABLE_MQ_PORT=15672
export SHIPPABLE_MQ_USER="SHIPPABLETESTUSER"
export SHIPPABLE_MQ_PASS="SHIPPABLETESTPASS"
export SHIPPABLE_MQ_UI_USER="shippable"
export SHIPPABLE_MQ_UI_PASS="abc123"

update_mq_entities() {
  ## add admin user
  echo "Adding shippable User to rabbitmq"
  insert_amqp_user_res=$($RABBITMQ_ADMIN --host=$SHIPPABLE_MQ_HOST --port=$SHIPPABLE_MQ_PORT declare user name=$SHIPPABLE_MQ_USER password=$SHIPPABLE_MQ_PASS tags=administrator)
  echo $insert_amqp_user_res

  echo "Adding UI User to rabbitmq"
  insert_amqp_ui_user_res=$($RABBITMQ_ADMIN --host=$SHIPPABLE_MQ_HOST --port=$SHIPPABLE_MQ_PORT declare user name=$SHIPPABLE_MQ_UI_USER password=$SHIPPABLE_MQ_UI_PASS tags=monitoring)
  echo $insert_amqp_ui_user_res

  echo "Adding shippable Vhost to rabbitmq"
  insert_vhost_res=$($RABBITMQ_ADMIN --host=$SHIPPABLE_MQ_HOST --port=$SHIPPABLE_MQ_PORT declare vhost name=shippable)
  echo $insert_vhost_res

  echo "Adding shippableRoot Vhost to rabbitmq"
  insert_root_vhost_res=$($RABBITMQ_ADMIN --host=$SHIPPABLE_MQ_HOST --port=$SHIPPABLE_MQ_PORT declare vhost name=shippableRoot)
  echo $insert_root_vhost_res

  echo "Updating shippable user perms for rabbitmq"
  update_user_perms_res=$($RABBITMQ_ADMIN --host=$SHIPPABLE_MQ_HOST --port=$SHIPPABLE_MQ_PORT declare permission vhost=shippable user=$SHIPPABLE_MQ_USER configure=.* write=.* read=.*)
  echo $update_user_perms_res

  update_user_perms_root_res=$($RABBITMQ_ADMIN --host=$SHIPPABLE_MQ_HOST --port=$SHIPPABLE_MQ_PORT declare permission vhost=shippableRoot user=$SHIPPABLE_MQ_USER configure=.* write=.* read=.*)
  echo $update_user_perms_root_res

  update_ui_user_perms_root_res=$($RABBITMQ_ADMIN --host=$SHIPPABLE_MQ_HOST --port=$SHIPPABLE_MQ_PORT declare permission vhost=shippableRoot user=$SHIPPABLE_MQ_UI_USER configure=^$ write=.* read=.*)
  echo $update_ui_user_perms_root_res

  echo "Adding shippableEx Exchange to rabbitmq for shippable vhost"
  insert_ex_res=$($RABBITMQ_ADMIN --host=$SHIPPABLE_MQ_HOST --port=$SHIPPABLE_MQ_PORT --username=$SHIPPABLE_MQ_USER --password=$SHIPPABLE_MQ_PASS --vhost=shippable declare exchange name=shippableEx type=topic)
  echo $insert_ex_res

  echo "Adding shippableEx Exchange to rabbitmq for shippableRoot vhost"
  insert_ex_root_res=$($RABBITMQ_ADMIN --host=$SHIPPABLE_MQ_HOST --port=$SHIPPABLE_MQ_PORT --username=$SHIPPABLE_MQ_USER --password=$SHIPPABLE_MQ_PASS --vhost=shippableRoot declare exchange name=shippableEx type=topic)
  echo $insert_ex_root_res
}

main() {
  update_mq_entities
}

main
