# ${RES_VER_NAME} Release Notes

## Release Date
${RES_VER_DATE}

## Features
  - **Azure Container Service (AKS)**: Shippable now has native support for [AKS](https://azure.microsoft.com/en-us/services/container-service/) in both managed deploy jobs and cliConfig resources.
      - An Azure Keys integration can be used in a cluster resource to deploy to a cluster in AKS.  See the [cluster documentation](http://docs.shippable.com/platform/workflow/resource/cluster/) for more information.
      - LoadBalancer resources with an Azure Keys integration used as inputs to a provision job will be provisioned in AKS.  See the [loadBalancer documentation](http://docs.shippable.com/platform/workflow/resource/loadbalancer/) for more information.
      - The Azure CLI has been updated to version 2.0.21 in runSh jobs.
      - The [cliConfig resource](http://docs.shippable.com/platform/workflow/resource/cliConfig/) has been updated to support an `aks` scope when an Azure Keys integration is used.  This will automatically authenticate with your cluster, allowing you to use kubectl to issue commands directly to your cluster.

  - **Custom dashboards have an option to trigger debug builds**: Rebuilding with SSH is now supported in custom dashboard.
      - This will allow you to debug problems that arise due to differences in your local and Shippable environment.
      - Refer [SSH Access to Build Machine](http://docs.shippable.com/ci/ssh-access/#which-subscriptions-can-debug?) for more information.

  - **SPOG persists the zoom and position context within a browser session**: Zoom and position context for SPOG will persist across page switches within a browser session making SPOG more user-friendly for large pipelines.

## Fixes
  - **Fixes Permissions Checks while creating or deleting a job's coverage and test reports**: We have fixed the bug where users with incorrect permissions were able to create and delete coverage and test reports for a job. After this fix, only users with collaborator and owner access to a project can create and delete coverage and test reports.

  - **Fixes bug of deploy keys not being deleted while hard deleting a git resource**: We have fixed the bug of deploy keys not being deleted on hard deleting the git resource. After this fix, hard deleting a git resource will delete the deploy keys of the git resource along with its webhooks.

  - **Bitbucket build statuses are created for latest run of a commit**: We have fixed the bug where bitbucket build statuses are created for each run within a commit. After this fix, we only show the latest run status in Bitbucket.

## Shippable Server

  - Features
      - **Configuring SMTP with no authentication**: You can now use email integration with an SMTP relay that does not require username and password.

  - Fixes
      - **simple title**: brief description

## History

To view Shippable's release history, check out our [releases page on github](https://github.com/Shippable/admiral/releases).
