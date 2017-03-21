#!/bin/bash -e

cd /home/shippable/admiral

if [ $RUN_MODE == dev ]; then
  echo forever is watching file changes
  forever -w -v --minUptime 1000 --spinSleepTime 1000 admiral.app.js
else
  echo forever is NOT watching file changes
  node admiral.app.js
fi
