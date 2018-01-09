# ${RES_VER_NAME} Release Notes

## Release Date
${RES_VER_DATE}

## Features
  - **Shows account integration owner name in dropdown when editing a subscription integration**: Display account integration owner name along with integration name which helps in choosing subscription integration when there are multiple account integrations with the same name

## Fixes
  - **Restrict database password with special characters**: During installation, adding database passsword with unsupported charaacters will thow an error
      - if database password is empty or invalid, user will be prompted to re-enter the password.
      - valid characters for database password are: -_=+a-zA-Z0-9

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
