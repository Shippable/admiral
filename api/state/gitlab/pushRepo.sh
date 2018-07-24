#!/bin/bash -e

export PRIVATE_KEY="<%=privateKey%>"
export PROJECT_CLONE_LOCATION="<%=cloneLocation%>"
export PEM_FILE_PATH="<%=pemFilePath%>"
export SHA_FILE_PATH="<%=shaFilePath%>"
export SUBSCRIPTION_EMAIL="<%=subscriptionEmail%>"
export SUBSCRIPTION_NAME="<%=subscriptionName%>"
export COMMIT_MESSAGE="<%=commitMessage%>"

git_sync() {
  echo "----> Pushing Directory $PROJECT_CLONE_LOCATION"
  pushd $PROJECT_CLONE_LOCATION

  echo "----> Adding Git Config"
  git config --global user.email "$SUBSCRIPTION_EMAIL"
  git config --global user.name "$SUBSCRIPTION_NAME"

  echo "----> Adding Git Files"
  git add .

  if [ ! -z "$(git status --porcelain)" ]; then
    echo "----> Committing Git Message"
    git commit -m "$COMMIT_MESSAGE"

    echo "----> Pushing to GitLab"
    ssh-agent bash -c 'ssh-add $PEM_FILE_PATH; git push origin master'
  else
    echo "----> Nothing to Push"
  fi

  echo "----> Saving Resource SHA"
  {
    echo $SHA_FILE_PATH
    git rev-parse HEAD > $SHA_FILE_PATH
  } || {
    echo "----> Empty repo, skipping version update"
  }

  echo "----> Popping $PROJECT_CLONE_LOCATION"
  popd
}

main() {
  echo '----> Executing git_sync'
  git_sync
}

main
