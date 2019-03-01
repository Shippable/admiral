# ${REL_VER} Release Notes

## Release Date

${REL_VER_DATE}

## Features

- **Added SASL support for Freenode IRC**: Adding SASL support enables Freenode IRC servers to receive messages from a Shippable installation running on AWS infrastructure without any authentication failure.
- **Updated AWS SDK**: We've updated the version of the AWS SDK used in managed deploy jobs to make newer AWS features available as "passthrough" `dockerOptions`.
- **Updated some internal dependencies**: We've updated the versions of some of the dependencies we use internally. No noticeable changes are expected.
- **Drydock update**: Updating all Shippable official images with latest stable versions of [languages](http://docs.shippable.com/platform/runtime/machine-image/language-versions/), [cli's](http://docs.shippable.com/platform/runtime/machine-image/cli-versions/) and [services](http://docs.shippable.com/platform/runtime/machine-image/services-versions/). Refer to documentation
    for [v7.2.4](http://docs.shippable.com/platform/runtime/machine-image/ami-v724/) for details.

## Fixes

- **Improved empty scripts tab experience**: The "scripts" tab on CI jobs would show an empty block when scripts are not available. It will now show a descriptive message.
- **Fixes CI and runSh jobs to allow special characters and spaces in JFrog Artifactory passwords**: CI and runSh jobs with [JFrog Artifactory integration](http://docs.shippable.com/platform/integration/jfrog-artifactoryKey/) would fail if spaces or certain special characters were present in the password. This bug has been fixed.


## Custom Nodes

- **simple title**: brief description
  - additional details or
  - actions required

## Shippable Server

### Features

- **simple title**: brief description

### Fixes

- **Performance improvements on the Admin/Monitor/Job Status page**: Load time on the Admin/Monitor/Job Status page should now be noticeably faster on servers with a large number of jobs.
- **Bug during server upgrade which prevents direct upgrade from version < 6.12.4 to v7.1.4**: A database migration introduced in v7.1.4 would cause an error during upgrades from Shippable Server versions prior to v6.12.4. This has been fixed in ${REL_VER}.
- **Fix handling of deleted on-demand nodes in GCE**: On-demand nodes that no longer exist on GCE but are still present in the database would not get cleaned up. These entries are now deleted from the database if GCE reports a `404 (Not Found)` error.
- **Log level of "ignoring webhook" messages reduced**: Production API containers' logs took a lot of space due to the noise created by the "ignoring webhook" warning logs. The log level for the same has been reduced from warning to verbose so that they don't show up on production API containers.

## History

To view Shippable's release history, check out our [releases page on github](https://github.com/Shippable/admiral/releases).
