# ${REL_VER} Release Notes

## Release Date
${REL_VER_DATE}

## Features
  - **simple title**: brief description. [link to docs](#).
      - itemized
      - list
      - for details
      - if necessary

## Fixes
  - **Improve TASK validation for rSync**: rSync now catches indentation and data type errors for script, nodePool, env and timeoutMinutes in the TASK section of a runSh's YML.
  - **shipctl get_integration_resource_field**: Avoids unexpected error in `get_integration_resource_field` command, when the resource name is invalid ([support#4472](https://github.com/Shippable/support/issues/4472))
  - **Pull Request for private Bitbucket gitRepo**: runSh job running on Windows Server 2016 node is able to fetch the Pull Request content in case of Bitbucket gitRepo resources.

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
