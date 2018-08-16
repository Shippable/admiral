# ${REL_VER} Release Notes

## Release Date
${REL_VER_DATE}

## Features
  - **More node statistics**: Node statistics are collected more frequently and the number of Docker containers and images on a node is now displayed on the node page.  Existing nodes will need to be reinitialized in order to show the image count, but reinitialization is not required to continue to use older nodes.

## Fixes
  - **Cleanup credentials before and after the CI build**: Credentials used in the CI builds will get cleaned up from the build agent before and after the CI build is run.
  - **Default notification settings with slackKey**: The correct default settings are used when `type: slackKey` is specified in a CI `shippable.yml`.

## Custom Nodes
  - **simple title**: brief description
      - additional details or
      - actions required

## Shippable Server

  - Features
      - **simple title**: brief description
  - Fixes
      - **Slack notifications with `type: slack`**: Specifying `type: slack` was not working with newer Slack integrations in some installations. Both `slack` and `slackKeys` will now work as intended.

## History

To view Shippable's release history, check out our [releases page on github](https://github.com/Shippable/admiral/releases).
