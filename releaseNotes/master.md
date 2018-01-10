# ${RES_VER_NAME} Release Notes

## Release Date
${RES_VER_DATE}

## Features
  - **Shows account integration owner name in dropdown when editing a subscription integration**: Display account integration owner name along with integration name which helps in choosing subscription integration when there are multiple account integrations with the same name

## Fixes
  - **simple title**: brief description
      - actions required
      - or additional details
  - **Bitbucket permissions on renamed repositories**: An error updating the deploy key on Bitbucket when a repository is renamed has been fixed.
      - The error resulted in missing permissions for accounts on the repository after it was renamed.
      - Synchronizing any affected accounts will fix missing permissions.

## Custom Nodes
  - **simple title**: brief description
      - additional details or
      - actions required

## Shippable Server

  - Features
      - **simple title**: brief description
  - Fixes
      - **simple title**: brief description

## Deprecation Notice
  - **lastHubspotSyncAt field removed from accounts GET API response**: Accounts GET API will no longer return `lastHubspotSyncAt` field in the response body.

## History

To view Shippable's release history, check out our [releases page on github](https://github.com/Shippable/admiral/releases).
