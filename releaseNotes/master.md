# ${REL_VER} Release Notes

## Release Date
${REL_VER_DATE}

## Features
  - **SPOG subscription level object limit**: Subscription administrators can now set a limit to the number of objects that can be displayed in the SPOG view for that subscription, this can be used to prevent users from accidentally loading the full SPOG which will be helpful for subscriptions with a very large number of resources/jobs in them which will possibly create browser performance issues.
  this setting can be found in the subscription settings page with the title `SPOG Object Limit`.
  - **Ability to create subscription owned integrations**: You now have the ability to create shared subscription integrations, which allows you to restrict the usage of integration to members, collaborators and admin based on your requirement. ([support#4128](https://github.com/Shippable/support/issues/4128))
## Fixes
  - **Improve TASK validation for rSync**: rSync now catches indentation and data type errors for script, nodePool, env and timeoutMinutes in the TASK section of a runSh's YML.
  - **shipctl get_integration_resource_field**: Avoids unexpected error in `get_integration_resource_field` command, when the resource name is invalid ([support#4472](https://github.com/Shippable/support/issues/4472))
  - **Pull Request for private Bitbucket gitRepo**: runSh job running on Windows Server 2016 node is able to fetch the Pull Request content in case of Bitbucket gitRepo resources.
  - **Switching between SKU's flow is not correctly handled**: Refines the proration logic correctly to avoid charging additional amount while switching SKUs. ([support#4448](https://github.com/Shippable/support/issues/4448))
  - **Subscription licenses not updated if node pool deletion fails**: Now subscription licenses get updated on a successful transaction even if any node pool(s) didn't get deleted or updated due to some reason. ([support#4475](https://github.com/Shippable/support/issues/4475))
  - **Modern SPOG disabled links**: disabled links (dotted lines) in modern SPOG will be displayed correctly wherever necessary.
  - **Ruby builds fail when all steps succeed**: added fix to make sure ruby build scripts exit with proper exit code on [runtime](http://docs.shippable.com/platform/runtime/machine-image/ami-overview/) versions v6.6.1 and above. ([support#4297](https://github.com/Shippable/support/issues/4297))

## Custom Nodes
  - **simple title**: brief description
      - additional details or
      - actions required

## Shippable Server

  - Features
      - **Onebox auto-recovery on reboots**: Shippable [Onebox installations](http://docs.shippable.com/platform/server/install-onebox/) will auto recover all services when the Control
        Plane server reboots. Users can now shutdown the hosts when not in use to cut down costs for their pilot installations.
  - Fixes
      - **simple title**: brief description

## History

To view Shippable's release history, check out our [releases page on github](https://github.com/Shippable/admiral/releases).
