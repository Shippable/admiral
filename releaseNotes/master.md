# ${REL_VER} Release Notes

## Release Date
${REL_VER_DATE}

## Features
  - **SPOG subscription level object limit**: Subscription administrators can now set a limit to the number of objects that can be displayed in the SPOG view for that subscription, this can be used to prevent users from accidentally loading the full SPOG which will be helpful for subscriptions with a very large number of resources/jobs in them which will possibly create browser performance issues.
  this setting can be found in the subscription settings page with the title `SPOG Object Limit`.

## Fixes
  - **Improve TASK validation for rSync**: rSync now catches indentation and data type errors for script, nodePool, env and timeoutMinutes in the TASK section of a runSh's YML.
  - **shipctl get_integration_resource_field**: Avoids unexpected error in `get_integration_resource_field` command, when the resource name is invalid ([support#4472](https://github.com/Shippable/support/issues/4472))
  - **Pull Request for private Bitbucket gitRepo**: runSh job running on Windows Server 2016 node is able to fetch the Pull Request content in case of Bitbucket gitRepo resources.
  - **Switching between SKU's flow is not correctly handled**: Refines the proration logic correctly to avoid charging additional amount while switching SKUs. ([support#4448](https://github.com/Shippable/support/issues/4448))
  - **Subscription licenses not updated if node pool deletion fails**: Now subscription licenses get updated on a successful transaction even if any node pool(s) didn't get deleted or updated due to some reason. ([support#4475](https://github.com/Shippable/support/issues/4475))
  - **Modern SPOG disabled links**: disabled links (dotted lines) in modern SPOG will be displayed correctly wherever necessary.
  - **UI NPM Package updates**:
      - Updated `grunt` version to `1.0.3`
      - Updated `grunt-contrib-watch` version to `1.1.0`
      - Updated `moment` version to `2.22.2`
      - Updated `method-override` version to `3.0.0`
      - Updated `serve-favicon` version to `2.5.0`
      - Updated `request` version to `2.87.0`
      - Updated `express` version to `4.16.3`

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
