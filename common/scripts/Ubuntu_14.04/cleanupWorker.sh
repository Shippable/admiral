#!/bin/bash -e

__remove_stale_images() {
  echo "Cleaning up images with <none> tag"
  sudo docker rmi -f $(sudo docker images -f "dangling=true" -q) || true

  echo "Cleaning up images for old releases"
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
        local stale_image=$image_repository:$image_tag
        echo "Stale image $stale_image found, attempting to remove..."
        sudo docker rmi $image_id || true
      fi
    fi
  done
}

main() {
  echo "Cleaning up worker node: $WORKER_HOST"
  __remove_stale_images
  echo "Cleanup script successfully ran on  worker node: $WORKER_HOST"
}

main
