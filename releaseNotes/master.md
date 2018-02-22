# ${RES_VER_NAME} Release Notes

## Release Date
${RES_VER_DATE}

## Features
  - **Chrome addon and Chrome driver in language images**: You can run selenium tests using Chrome in a headless mode. Sample for running headless chrome is available [here](https://github.com/devops-recipes/ci-headless-chrome) and sample for running headless chrome with selenium is available [here](https://github.com/devops-recipes/ci-headless-chrome-selenium).
  - **shipctl utility is available on custom docker images**: You can now use all the shipctl functions in custom docker images in both runCI and runSh jobs.
  - **Users can make a change to shippable ymls without triggering any jobs attached to gitRepos**: Usecases where gitRepo and syncRepo were identical (point to the same repository) would run into a problem where changes to the shippable yml would trigger rSync and the job attached to the gitRepo in a non-deterministic order. We now only trigger rSync if a commit has any shippable yml file in its changeset.  

## Fixes
  - **simple title**: brief description
      - actions required
      - or additional details

## Custom Nodes
  - **simple title**: brief description
      - additional details or
      - actions required

## Shippable Server

  - Features
      - **simple title**: brief description
  - Fixes
      - **simple title**: brief description

## History

To view Shippable's release history, check out our [releases page on github](https://github.com/Shippable/admiral/releases).
