# ${REL_VER} Release Notes

## Release Date

${REL_VER_DATE}

## Features

- **Added SASL support for Freenode IRC**: Adding SASL support enables Freenode IRC servers to receive messages from a Shippable installation running on AWS infrastructure without any authentication failure.

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
- **Bug during server upgrade which prevents direct upgrade from version < 6.12.4 to v7.1.4**: A database migration query has been fixed which now allows direct server to ${REL_VER} from any version.

## History

To view Shippable's release history, check out our [releases page on github](https://github.com/Shippable/admiral/releases).
