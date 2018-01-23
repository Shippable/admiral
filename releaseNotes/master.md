# ${RES_VER_NAME} Release Notes

## Release Date
${RES_VER_DATE}

## Features
  - **Querying runs by commitSha**: Runs can now be queried by the commitSha.
      - The [API route](http://docs.shippable.com/platform/api/api-overview/#!/Runs/get_runs) for runs will accept a `commitShas` parameter.
      - Querying by SHA must use the full 40 character SHAs.

## Fixes
  - **Add Content-Type header in requests to slack**: Requests to slack API specify `Content-Type: application/json` header.

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
