# ${REL_VER} Release Notes

## Release Date

${REL_VER_DATE}

## Features

- **Added SASL support for Freenode IRC**: Adding SASL support enables Freenode IRC servers to receive messages from a Shippable installation running on AWS infrastructure without any authentication failure.
- **Updated AWS SDK**: We've updated the version of the AWS SDK used in managed deploy jobs to make newer AWS features available as "passthrough" `dockerOptions`.

## Fixes

- **Improved empty scripts tab experience**: The "scripts" tab on CI jobs would show an empty block when scripts are not available. It will now show a descriptive message.
- **Fixes CI and runSh jobs to allow special characters and spaces in JFrog Artifactory passwords**: CI and runSh jobs with [JFrog Artifactory integration](http://docs.shippable.com/platform/integration/jfrog-artifactoryKey/) would fail if spaces or certain special characters were present in the password. This bug has been fixed.
- **Delete on-demand nodes from database if they are deleted from the cloud instance provider**: On-demand nodes, which were already deleted from the cloud instance provider, were not getting deleted since from the database if the cloud provider sent a `404`(`Not found`) status when trying to delete the node. This has been fixed.

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

## History

To view Shippable's release history, check out our [releases page on github](https://github.com/Shippable/admiral/releases).
