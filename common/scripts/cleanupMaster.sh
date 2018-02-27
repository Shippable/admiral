#!/bin/bash -e

export COMPONENT="master"
export MASTER_DATA_DIR="$RUNTIME_DIR/$COMPONENT/data"
export MASTER_CONFIG_DIR="$CONFIG_DIR/$COMPONENT"
export SCRIPTS_DIR="$SCRIPTS_DIR"
export LOGS_FILE="$RUNTIME_DIR/logs/$COMPONENT.log"
export SCRIPTS_DIR_REMOTE="/tmp/shippable"

## Write logs of this script to component specific file
exec &> >(tee -a "$LOGS_FILE")

__validate_master_envs() {
  __process_msg "Initializing swarm master environment variables"
  __process_msg "SCRIPTS_DIR: $SCRIPTS_DIR"
  __process_msg "MASTER_HOST: $MASTER_HOST"
  __process_msg "MASTER_PORT: $MASTER_PORT"
  __process_msg "RELEASE: $RELEASE"
  __process_msg "PRIVATE_IMAGE_REGISTRY: $PRIVATE_IMAGE_REGISTRY"
  __process_msg "PUBLIC_IMAGE_REGISTRY: $PUBLIC_IMAGE_REGISTRY"
}

__cleanup_swarm_master() {
  __process_msg "Initializing swarm cluster"

  __process_msg "Cleaning up images with <none> tag"
  sudo docker rmi -f $(sudo docker images -f "dangling=true" -q) || true

  __process_msg "Cleaning up images for old releases"
  local all_images=$(sudo docker images)
  echo "$all_images" | while read -r line; do
    local image_path=$(echo $line | awk '{print $1}')

    # image repository is determined by splitting the path by first '/
    IFS='/' read -ra image_repository <<< "$image_path"
    local image_repository="${image_repository[0]}"

    local image_tag=$(echo $line | awk '{print $2}')
    local image_id=$(echo $line | awk '{print $3}')

    # only remove images that belong to same repository
    if [ "$image_repository" == "$PRIVATE_IMAGE_REGISTRY" ] || \
      [ "$image_repository" == "$PUBLIC_IMAGE_REGISTRY" ]; then

      if [ "$image_tag" != "$RELEASE" ]; then
        local stale_image=$image_path:$image_tag
        echo "Stale image $stale_image found, attempting to remove..."
        sudo docker rmi $image_id || true
      fi
    fi
  done
}

main() {
  __process_marker "Cleaning up swarm master"
  __validate_master_envs
  __cleanup_swarm_master
  __process_msg "Swarm master cleanup successful"
}

main
