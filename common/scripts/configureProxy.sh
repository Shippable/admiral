#!/bin/bash -e

configure_proxy() {
  echo "Defaults        env_keep += \"http_proxy https_proxy no_proxy\"" > /etc/sudoers.d/shippable-proxy-whitelist

  local env_location="/etc/environment"
  if [ ! -z "$HTTP_PROXY" ]; then
    http_proxy_env="export http_proxy=\"$HTTP_PROXY\""
    http_proxy_exists=$(grep "^$http_proxy_env$" $env_location || echo "")
    if [ -z "$http_proxy_exists" ]; then
      echo "Adding http_proxy to /etc/environment"
      sed -i '/^http_proxy=/d' $env_location
      echo "$http_proxy_env" >> $env_location
    fi
  else
    http_proxy_exists=$(grep "^export http_proxy=" $env_location || echo "")
    if [ ! -z "$http_proxy_exists" ]; then
      echo "Removing http_proxy from /etc/environment"
      unset http_proxy
      sed -i '/^export http_proxy=/d' $env_location
    fi
  fi

  if [ ! -z "$HTTPS_PROXY" ]; then
    https_env="export https_proxy=\"$HTTPS_PROXY\""
    https_exists=$(grep "^$https_env$" $env_location || echo "")
    if [ -z "$https_exists" ]; then
      echo "Adding https_proxy to /etc/environment"
      sed -i '/^export https_proxy=/d' $env_location
      echo "$https_env" >> $env_location
    fi
  else
    https_exists=$(grep "^export https_proxy=" $env_location || echo "")
    if [ ! -z "$https_exists" ]; then
      echo "Removing https_proxy from /etc/environment"
      unset https_proxy
      sed -i '/^export https_proxy=/d' $env_location
    fi
  fi

  if [ ! -z "$NO_PROXY" ]; then
    no_proxy_env="export no_proxy=\"$NO_PROXY\""
    no_proxy_exists=$(grep "^$no_proxy_env$" $env_location || echo "")
    if [ -z "$no_proxy_exists" ]; then
      echo "Adding no_proxy to /etc/environment"
      sed -i '/^export no_proxy=/d' $env_location
      echo "$no_proxy_env" >> $env_location
    fi
  else
    no_proxy_exists=$(grep "^export no_proxy=" $env_location || echo "")
    if [ ! -z "$no_proxy_exists" ]; then
      echo "Removing no_proxy from /etc/environment"
      unset no_proxy
      sed -i '/^export no_proxy=/d' $env_location
    fi
  fi

  source $env_location
}

configure_proxy
