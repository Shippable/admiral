#!/bin/bash -e

__validating_system_configs() {
  __process_msg "Validating default system configs"
  local system_configs="$CONFIG_DIR/systemConfigs.json"
  local system_configs_template="$SCRIPTS_DIR/config/systemConfigs.json.template"

  if [ ! -f "$system_configs" ]; then
    __process_msg "System configs not present, creating"
    sudo cp -vr "$system_configs_template" "$system_configs"
  else
    __process_msg "System configs already created, skipping"
  fi
}

__generate_serviceuser_token() {
  __process_msg "Generating random token for serviceuser"
  local system_configs="$CONFIG_DIR/systemConfigs.json"
  local service_user_token=$(cat $system_configs \
    | jq -r ".serviceUserToken")

  if [ "$service_user_token" == "" ]; then
    __process_msg "No service user token present, generating one"
    local token=$(cat /proc/sys/kernel/random/uuid)
    __process_msg "Successfully generated service user token"
    token=$(cat $system_configs \
      | jq '.serviceUserToken="'$token'"')
    echo $token > $system_configs
  else
    __process_msg "Service user token already present, skipping"
  fi
}

__generate_root_bucket_name() {
  __process_msg "Generating root bucket name"

  local system_configs="$CONFIG_DIR/systemConfigs.json"
  local root_bucket_name=$(cat $system_configs \
    | jq -r '.rootS3Bucket')

  if [ "$root_bucket_name" == "" ] || [ "$root_bucket_name" == null ]; then
    __process_msg "Root bucket name not set, setting it to random value"
    local random_uuid=$(cat /proc/sys/kernel/random/uuid)
    root_bucket_name="shippable-$INSTALL_MODE-$random_uuid"
    root_bucket_name=$(cat $system_configs \
      | jq '.rootS3Bucket="'$root_bucket_name'"')
    echo $root_bucket_name > $system_configs
  else
    __process_msg "Root bucket name already set to: $root_bucket_name, skipping"
  fi
}

__generate_system_config() {
  __process_msg "Generating systemConfigs default values from template"

  local system_configs_template="$SCRIPTS_DIR/configs/system_configs.sql.template"
  local system_configs_default="$CONFIG_DIR/systemConfigs.json"
  local system_configs_sql="$CONFIG_DIR/system_configs.sql"

  # NOTE:
  # "sed" is using '#' as a separator in following statements
  __process_msg "Updating : defaultMinionCount"
  local default_minion_count=$(cat $system_configs_default \
    | jq -r '.defaultMinionCount')
  sed "s#{{DEFAULT_MINION_COUNT}}#$default_minion_count#g" $system_configs_template > $system_configs_sql

  __process_msg "Updating : defaultPipelineCount"
  local default_pipeline_count=$(cat $system_configs_default \
    | jq -r '.defaultPipelineCount')
  sed -i "s#{{DEFAULT_PIPELINE_COUNT}}#$default_pipeline_count#g" $system_configs_sql

 __process_msg "Updating : autoSelectBuilderToken"
  local auto_select_builder_token=$(cat $system_configs_default \
    | jq -r '.autoSelectBuilderToken')
  sed -i "s#{{AUTO_SELECT_BUILDER_TOKEN}}#$auto_select_builder_token#g" $system_configs_sql

  __process_msg "Updating : buildTimeout"
  local build_timeout=$(cat $system_configs_default \
    | jq -r '.buildTimeoutMS')
  sed -i "s#{{BUILD_TIMEOUT_MS}}#$build_timeout#g" $system_configs_sql

  __process_msg "Updating : defaultPrivateJobQuota"
  local private_job_quota=$(cat $system_configs_default \
    | jq -r '.defaultPrivateJobQuota')
  sed -i "s#{{DEFAULT_PRIVATE_JOB_QUOTA}}#$private_job_quota#g" $system_configs_sql

  __process_msg "Updating : serviceuserToken"
  local serviceuser_token=$(cat $system_configs_default \
    | jq -r '.serviceUserToken')
  sed -i "s#{{SERVICE_USER_TOKEN}}#$serviceuser_token#g" $system_configs_sql

  __process_msg "Updating : vaultUrl"
  local vault_url=$(cat $system_configs_default \
    | jq -r '.vaultUrl')
  sed -i "s#{{VAULT_URL}}#$vault_url#g" $system_configs_sql

  __process_msg "Updating : vaultToken"
  local vault_token=$(cat $system_configs_default \
    | jq -r '.vaultToken')
  sed -i "s#{{VAULT_TOKEN}}#$vault_token#g" $system_configs_sql

  __process_msg "Updating : amqpUrl"
  local amqp_url=$(cat $system_configs_default \
    | jq -r '.amqpUrl')
  sed -i "s#{{AMQP_URL}}#$amqp_url#g" $system_configs_sql

  __process_msg "Updating : amqpUrlAdmin"
  local amqp_url_admin=$(cat $system_configs_default \
    | jq -r '.amqpUrlAdmin')
  sed -i "s#{{AMQP_URL_ADMIN}}#$amqp_url_admin#g" $system_configs_sql

  __process_msg "Updating : amqpUrlRoot"
  local amqp_url_root=$(cat $system_configs_default \
    | jq -r '.amqpUrlRoot')
  sed -i "s#{{AMQP_URL_ROOT}}#$amqp_url_root#g" $system_configs_sql

  __process_msg "Updating : amqpDefaultExchange"
  local amqp_default_exchange=$(cat $system_configs_default \
    | jq -r '.amqpDefaultExchange')
  sed -i "s#{{AMQP_DEFAULT_EXCHANGE}}#$amqp_default_exchange#g" $system_configs_sql

  __process_msg "Updating : apiUrl"
  local api_url=$(cat $system_configs_default \
    | jq -r '.apiUrl')
  sed -i "s#{{API_URL}}#$api_url#g" $system_configs_sql

  __process_msg "Updating : apiPort"
  local api_port=$(cat $system_configs_default \
    | jq -r '.apiPort')
  sed -i "s#{{API_PORT}}#$api_port#g" $system_configs_sql

  __process_msg "Updating : wwwUrl"
  local www_url=$(cat $system_configs_default \
    | jq -r '.wwwUrl')
  sed -i "s#{{WWW_URL}}#$www_url#g" $system_configs_sql

  __process_msg "Updating : runMode"
  local run_mode=$(cat $system_configs_default \
    | jq -r '.runMode')
  sed -i "s#{{RUN_MODE}}#$run_mode#g" $system_configs_sql

  __process_msg "Updating : rootQueueList"
  local root_queue_list=$(cat $system_configs_default \
    | jq -r '.rootQueueList')
  sed -i "s#{{ROOT_QUEUE_LIST}}#$root_queue_list#g" $system_configs_sql

  __process_msg "Updating : createdAt"
  local created_at=$(date)
  sed -i "s#{{CREATED_AT}}#$created_at#g" $system_configs_sql

  __process_msg "Updating : updatedAt"
  sed -i "s#{{UPDATED_AT}}#$created_at#g" $system_configs_sql

  __process_msg "Updating : systemNodePrivateKey"
  local system_node_private_key=""
  while read line; do
    system_node_private_key=$system_node_private_key""$line"\n"
  done <$SSH_PRIVATE_KEY
  sed -i "s#{{SYSTEM_NODE_PRIVATE_KEY}}#$system_node_private_key#g" $system_configs_sql

  __process_msg "Updating : systemNodePublicKey"
  local system_node_public_key=""
  while read line; do
    system_node_public_key=$system_node_public_key""$line"\n"
  done <$SSH_PUBLIC_KEY
  sed -i "s#{{SYSTEM_NODE_PUBLIC_KEY}}#$system_node_public_key#g" $system_configs_sql

  __process_msg "Updating : allowSystemNodes"
  local allow_system_nodes=$(cat $system_configs_default \
    | jq -r '.allowSystemNodes')
  sed -i "s#{{ALLOW_SYSTEM_NODES}}#$allow_system_nodes#g" $system_configs_sql

  __process_msg "Updating : allowDynamicNodes"
  local allow_dynamic_nodes=$(cat $system_configs_default \
    | jq -r '.allowDynamicNodes')
  sed -i "s#{{ALLOW_DYNAMIC_NODES}}#$allow_dynamic_nodes#g" $system_configs_sql

  __process_msg "Updating : allowCustomNodes"
  local allow_custom_nodes=$(cat $system_configs_default \
    | jq -r '.allowCustomNodes')
  sed -i "s#{{ALLOW_CUSTOM_NODES}}#$allow_custom_nodes#g" $system_configs_sql

  __process_msg "Updating : consoleMaxLifespan"
  local console_max_lifespan=$(cat $system_configs_default \
    | jq -r '.consoleMaxLifespan')
  sed -i "s#{{CONSOLE_MAX_LIFESPAN}}#$console_max_lifespan#g" $system_configs_sql

  __process_msg "Updating : consoleCleanupHour"
  local console_cleanup_hour=$(cat $system_configs_default \
    | jq -r '.consoleCleanupHour')
  sed -i "s#{{CONSOLE_CLEANUP_HOUR}}#$console_cleanup_hour#g" $system_configs_sql

  __process_msg "Updating : customHostDockerVersion"
  local custom_host_docker_version=$(cat $system_configs_default \
    | jq -r '.customHostDockerVersion')
  sed -i "s#{{CUSTOM_HOST_DOCKER_VERSION}}#$custom_host_docker_version#g" $system_configs_sql

  __process_msg "Updating : wwwPort"
  local www_port=$(cat $system_configs_default \
    | jq -r '.wwwPort')
  sed -i "s#{{WWW_PORT}}#$www_port#g" $system_configs_sql

  __process_msg "Updating : redisUrl"
  local redis_url=$(cat $system_configs_default \
    | jq -r '.redisUrl')
  sed -i "s#{{REDIS_URL}}#$redis_url#g" $system_configs_sql

  __process_msg "Updating : awsAccountId"
  local aws_account_id=$(cat $system_configs_default \
    | jq -r '.awsAccountId')
  sed -i "s#{{AWS_ACCOUNT_ID}}#$aws_account_id#g" $system_configs_sql

  __process_msg "Updating : jobConsoleBatchSize"
  local job_console_batch_size=$(cat $system_configs_default \
    | jq -r '.jobConsoleBatchSize')
  sed -i "s#{{JOB_CONSOLE_BATCH_SIZE}}#$job_console_batch_size#g" $system_configs_sql

  __process_msg "Updating : jobConsoleBufferTimeInterval"
  local job_console_buffer_time_interval=$(cat $system_configs_default \
    | jq -r '.jobConsoleBufferTimeInterval')
  sed -i "s#{{JOB_CONSOLE_BUFFER_TIME_INTERVAL}}#$job_console_buffer_time_interval#g" $system_configs_sql

  __process_msg "Updating : defaultCronLoopHours"
  local default_cron_loop_hours=$(cat $system_configs_default \
    | jq -r '.defaultCronLoopHours')
  sed -i "s#{{DEFAULT_CRON_LOOP_HOURS}}#$default_cron_loop_hours#g" $system_configs_sql

  __process_msg "Updating : apiRetryInterval"
  local api_retry_interval=$(cat $system_configs_default \
    | jq -r '.apiRetryInterval')
  sed -i "s#{{API_RETRY_INTERVAL}}#$api_retry_interval#g" $system_configs_sql

  __process_msg "Updating : vortexUrl"
  vortex_url="$api_url"/vortex
  sed -i "s#{{VORTEX_URL}}#$vortex_url#g" $system_configs_sql

  __process_msg "Updating : truck"
  local truck=$(cat $system_configs_default \
    | jq -r '.truck')
  sed -i "s#{{TRUCK}}#$truck#g" $system_configs_sql

  __process_msg "Updating : hubspotTimeLimit"
  local hubspot_time_limit=$(cat $system_configs_default \
    | jq -r '.hubspotTimeLimit')
  sed -i "s#{{HUBSPOT_TIME_LIMIT}}#$hubspot_time_limit#g" $system_configs_sql

  __process_msg "Updating : hubspotListId"
  local hubspot_list_id=$(cat $system_configs_default \
    | jq -r '.hubspotListId')
  sed -i "s#{{HUBSPOT_LIST_ID}}#$hubspot_list_id#g" $system_configs_sql

  __process_msg "Updating : hubspotShouldSimulate"
  local hubspot_should_simulate=$(cat $system_configs_default \
    | jq -r '.hubspotShouldSimulate')
  sed -i "s#{{HUBSPOT_SHOULD_SIMULATE}}#$hubspot_should_simulate#g" $system_configs_sql

  __process_msg "Updating : rootS3Bucket"
  local root_s3_bucket=$(cat $system_configs_default \
    | jq -r '.rootS3Bucket')
  sed -i "s#{{ROOT_S3_BUCKET}}#$root_s3_bucket#g" $system_configs_sql

  __process_msg "Updating : nodeScriptsLocation"
  local node_scripts_location=$(cat $system_configs_default \
    | jq -r '.nodeScriptsLocation')
  sed -i "s#{{NODE_SCRIPTS_LOCATION}}#$node_scripts_location#g" $system_configs_sql

  __process_msg "Updating : enforcePrivateJobQuota"
  local enforce_private_job_quota=$(cat $system_configs_default \
    | jq -r '.enforcePrivateJobQuota')
  sed -i "s#{{ENFORCE_PRIVATE_JOB_QUOTA}}#$enforce_private_job_quota#g" $system_configs_sql

  __process_msg "Updating : technicalSupportAvailable"
  local technical_support_available=$(cat $system_configs_default \
    | jq -r '.technicalSupportAvailable')
  sed -i "s#{{TECHNICAL_SUPPORT_AVAILABLE}}#$technical_support_available#g" $system_configs_sql

  __process_msg "Updating : customNodesAdminOnly"
  local custom_nodes_admin_only=$(cat $system_configs_default \
    | jq -r '.customNodesAdminOnly')
  sed -i "s#{{CUSTOM_NODES_ADMIN_ONLY}}#$custom_nodes_admin_only#g" $system_configs_sql

  __process_msg "Updating : mktgPort"
  local mktg_port=$(cat $system_configs_default \
    | jq -r '.mktgPort')
  sed -i "s#{{MKTG_PORT}}#$mktg_port#g" $system_configs_sql

  __process_msg "Updating : mktgUrl"
  local mktg_url=$(cat $system_configs_default \
    | jq -r '.mktgUrl')
  sed -i "s#{{MKTG_URL}}#$mktg_url#g" $system_configs_sql

  __process_msg "Updating : segmentMktgKey"
  local segment_mktg_key=$(cat $system_configs_default \
    | jq -r '.segmentMktgKey')
  sed -i "s#{{SEGMENT_MKTG_KEY}}#$segment_mktg_key#g" $system_configs_sql

  __process_msg "Successfully generated 'systemConfig' table data"
}

__copy_system_configs() {
  __process_msg "Copying systemConfigs.sql to db container"
  local system_config_host_location="$CONFIG_DIR/system_configs.sql"
  local system_config_container_location="$CONFIG_DIR/db/system_configs.sql"
  sudo cp -vr $system_config_host_location $system_config_container_location

  __process_msg "Successfully copied systemConfigs.sql to db container"
}

__upsert_system_configs() {
  __process_msg "Upserting system configs in db"

  local system_config_location="/etc/postgresql/config/system_configs.sql"
  local upsert_cmd="sudo docker exec db \
    psql -U $DB_USER -d $DB_NAME \
    -v ON_ERROR_STOP=1 \
    -f $system_config_location"

  __process_msg "Executing: $upsert_cmd"
	eval "$upsert_cmd"
}

main() {
  __process_marker "Generating system configs"
  __validating_system_configs
  __generate_serviceuser_token
  __generate_root_bucket_name
  __generate_system_config
  __copy_system_configs
  __upsert_system_configs
}

main
