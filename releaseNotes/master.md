# ${REL_VER} Release Notes

## Release Date
${REL_VER_DATE}

## Features
  - **Excluded branches can be run manually**: CI branches that do not run for webhooks because of a `branches` setting in `shippable.yml` can now be run manually. To do so, click the play button on the project dashboard and select the branch.
  - **Drydock update**: Updating all Shippable official images with latest
  stable versions of [languages](http://docs.shippable.com/platform/runtime/machine-image/language-versions/), [cli's](http://docs.shippable.com/platform/runtime/machine-image/cli-versions/) and [services](http://docs.shippable.com/platform/runtime/machine-image/services-versions/). Refer to documentation
  for [v6.8.4](http://docs.shippable.com/platform/runtime/machine-image/ami-v684/) for details.
  - **Updated AWS SDK in deploy jobs**: Deploy jobs in Shippable Assembly Lines now use a more recent version of the AWS SDK, with support for `healthCheck` in task definitions.


## Fixes
  - **timeTriggers for runCI**: timeTrigger resources will now properly trigger runCI jobs.

## Custom Nodes
  - **simple title**: brief description
      - additional details or
      - actions required

## Shippable Server

  - Features
      - **simple title**: brief description
  - Fixes
      - **Public Bitbucket projects inaccessible**: Users were not able to view public projects on Bitbucket Cloud without logging in. This has been fixed so that users must be logged in to view private projects or projects on private git servers but not public projects on the cloud versions of Bitbucket, GitHub, or GitLab.

## History

To view Shippable's release history, check out our [releases page on github](https://github.com/Shippable/admiral/releases).
