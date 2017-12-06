# ${RES_VER_NAME} Release Notes

## Release Date
${RES_VER_DATE}

## Features
  - **Azure Container Service (AKS) deployments**: AKS is now supported in deploy jobs.
      - An Azure Keys integration can be used in a cluster resource to deploy to a cluster in AKS.  See the [cluster documentation](http://docs.shippable.com/platform/workflow/resource/cluster/) for more information.
      - LoadBalancer resources with an Azure Keys integration used as inputs to a provision job will be provisioned in AKS.  See the [loadBalancer documentation](http://docs.shippable.com/platform/workflow/resource/loadbalancer/) for more information.
      - The Azure CLI has been updated to version 2.0.21 in runSh jobs.

## Fixes
  - **Fixes Permissions Checks while creating or deleting a job's coverage and test reports**: We have fixed the bug where users with incorrect permissions were able to create and delete coverage and test reports for a job. After this fix, only users with collaborator and owner access to a project can create and delete coverage and test reports.

## Shippable Server

  - Features
      - **simple title**: brief description
  - Fixes
      - **simple title**: brief description

## History

To view Shippable's release history, check out our [releases page on github](https://github.com/Shippable/admiral/releases).
