# ${RES_VER_NAME} Release Notes

## Release Date
${RES_VER_DATE}

## Features
  - **Ignore provider deployments when removing syncRepo**: When deleting a syncRepo, you can now tell Shippable to avoid removing deployments from the provider.  This allows you to remove your syncRepo and all of its children without disrupting any running container service deployments you might have. See [syncRepo docs](http://docs.shippable.com/platform/tutorial/workflow/crud-syncrepo/#deleting-a-syncrepo) for more info.
  - **Show the number of remaining builds for free accounts**: Displays remaining builds for the current month. This is displayed for free users using private repository who have a limit of 150 builds per month.


## Fixes
  - **Improve error logging of gitRepo in rSync**: Improved error logging for gitRepo resources by adding the resource name and reason why the resource is marked inconsistent during rSync processing.

  - **Changing type of a subscriptionIntegration**: Allow editing of account integration type , this helps in changing the deprecated account integration type.

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
