# ${RES_VER_NAME} Release Notes

## Release Date
${RES_VER_DATE}

## Features
  - **Querying runs by commitSha**: Runs can now be queried by the commitSha.
      - The [API route](http://docs.shippable.com/platform/api/api-overview/#!/Runs/get_runs) for runs will accept a `commitShas` parameter.
      - Querying by SHA must use the full 40 character SHAs.

## Fixes
  - **Add Content-Type header in requests to slack**: Requests to slack API specify `Content-Type: application/json` header.

  - **Fix triggering of `strict mode` jobs**: strict mode jobs now gets triggered when a job, whose OUT resource is used as IN to this strict job, completes


## History

To view Shippable's release history, check out our [releases page on github](https://github.com/Shippable/admiral/releases).
