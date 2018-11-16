# ${REL_VER} Release Notes

## Release Date

${REL_VER_DATE}

## Features

- **Bitbucket OAuth 2.0**: We're switching to OAuth 2.0 for Bitbucket Cloud. When Bitbucket users next log into Shippable, they will be prompted to approve the same scopes already approved for OAuth 1.0. Webhooks will continue to work before and after an account next logs in.

## Fixes

- **Multi-manifest deployment order**: Multiple manifests in a deploy job will now be deployed in the order the inputs are listed.
- **Job state files on failure**: In certain cases, new files were saved as part of the state when the job failed. The state saved for a job will now correctly match the previous successful job's state.
- **Rerun failed only versions**: Matrix CI jobs that are rerun with the "failed only" option will no longer create new version objects for the successful jobs that are copied forward.
- **Fix docker version in Machine Images**: The docker version got incorrectly upgraded to 18.03 in all GCE [Machine Images](http://docs.shippable.com/platform/runtime/machine-image/ami-overview/). This has been fixed. Now, the Machine Images have the correct version of docker installed.
- **Retry python setup_ve in runCI jobs**: Sometimes, the setup_ve section in python jobs fail due to network errors. We have added a shippable_retry for python's setup_ve section so that this section retries in case of errors.

## Custom Nodes

- **simple title**: brief description
  - additional details or
  - actions required

## Shippable Server

### Features

- **Bitbucket Cloud OAuth 2.0**: Bitbucket Cloud as a login option will use now OAuth 2.0. Users will be prompted to re-approve the same scopes as before when they next log in to Shippable using Bitbucket Cloud. Please make sure your Bitbucket consumer has the correct callback URL (available in Admiral) before upgrading.

### Fixes

- **Refreshing admin build analytics displayed additional dates**: The refresh button on the admin build analytics page functioned as both reset and load more. It will now only refresh.

## History

To view Shippable's release history, check out our [releases page on github](https://github.com/Shippable/admiral/releases).
