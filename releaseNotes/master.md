# ${REL_VER} Release Notes

## Release Date

${REL_VER_DATE}

## Features

- **Added SASL support for Freenode IRC**: Adding SASL support enables Freenode IRC servers to receive messages from a Shippable installation running on AWS infrastructure without any authentication failure.

## Fixes

- **Fixes CI and runSh jobs to allow special characters and spaces in jfrog artifactory passwords**: CI and runSh jobs with [jfrog artifactory integration](http://docs.shippable.com/platform/integration/jfrog-artifactoryKey/) would fail if spaces or special characters were present in the jfrog artifactory password. This bug has been fixed.


## Custom Nodes

- **simple title**: brief description
  - additional details or
  - actions required

## Shippable Server

### Features

- **simple title**: brief description

### Fixes

- **simple title**: brief description

## History

To view Shippable's release history, check out our [releases page on github](https://github.com/Shippable/admiral/releases).
