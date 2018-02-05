# ${RES_VER_NAME} Release Notes

## Release Date
${RES_VER_DATE}

## Features
  - **Node pools**: With the Node Pools release, a whole bunch of features were added like [Multi platform support](http://docs.shippable.com/platform/runtime/nodes/#byon-nodes), [Host execution](http://docs.shippable.com/platform/workflow/job/runsh/), [Custom images in runSh](http://docs.shippable.com/platform/workflow/job/runsh/) and [Node pool management](http://docs.shippable.com/platform/management/subscription/node-pools/)
    - Subscriptions using [On-demand nodes](http://docs.shippable.com/platform/runtime/nodes/#on-demand-nodes) will be migrated automatically to use Node Pools over the period of next few weeks.
    - Subscriptions using [BYON nodes](http://docs.shippable.com/platform/runtime/nodes/#byon-nodes) will have an option to opt-in to use this functionality. Users can navigate to the Nodes page for their subscriptions, and see a button to switch to use new features.
    - Before opting in, there are a few things of note:
        1. Once you've opted in, the existing nodes will continue to process builds as is, but none of the new features will be available to it.
        1. All the nodes **must** be reinitialized to access all the new features.
        1. A default node pool will automatically be setup with all your existing nodes added it. By default we create Ubuntu 14.04 node pool. If you have any Ubuntu 16.04 nodes, a 16.04 node pool will be created instead.
        1. After opting-in, there are a couple of [API changes](http://docs.shippable.com/platform/api/api-overview/) that you need to be aware of if you use the `POST /clusterNodes` route:
            - `clusterId` will be a required field. This refers to the node pool ID to which you want to add the node. You can obtain this by accessing the `GET /clusters` route.
            - `initScript` will no longer support the old script names. The new script names can be [found here](https://github.com/Shippable/node/tree/master/initScripts). For example, to init a x86_64, Ubuntu 16.04 node and install Docker 17.06, you will use: `x86_64/Ubuntu_16.04/Docker_17.06.sh`
  - **Ignore provider deployments when removing syncRepo**: When deleting a syncRepo, you can now tell Shippable to avoid removing deployments from the provider.  This allows you to remove your syncRepo and all of its children without disrupting any running container service deployments you might have. See [syncRepo docs](http://docs.shippable.com/platform/tutorial/workflow/crud-syncrepo/#deleting-a-syncrepo) for more info.
  - **Show the number of remaining builds for free accounts**: Displays remaining builds for the current month. This is displayed for free users using private repository who have a limit of 150 builds per month.
  - **Configurable timeout in deploy jobs**: The duration to wait for a deployment to become stable can be configured with `maxWaitTime`. See the [deploy job documentation](http://docs.shippable.com/platform/workflow/job/deploy/) for more information.
  - **Multiple billing contacts**: Multiple billing contacts can now be added on the subscription billing page. They should be semicolon separated. Each email in the list will receive billing related emails and receipts.
  - **rSync jobs with parentResourceId**: rSync jobs will now have the syncRepo's ID in the "parentResourceId" field where it used to be null. This should simplify the process of finding the syncRepo for an rSync job, or finding an rSync job for a syncRepo.

## Fixes
  - **Improve error logging of gitRepo in rSync**: Improved error logging for gitRepo resources by adding the resource name and reason why the resource is marked inconsistent during rSync processing.

  - **Changing type of a subscriptionIntegration**: Allow a different integration type to be selected; this helps when replacing deprecated account integration types.

  - **Using the same webhook integration multiple times in a CI project**: When the same integration is added to the `notifications` section of a `shippable.yml` multiple times, each payload triggered will be sent.

  - **Improved triggering for strict mode**: Occasionally, strict mode jobs would remain in waiting status when the previous job started in a failed state, even if it later succeeds.  Now the strict mode jobs logic has been further serialized to prevent this occurrence.

  - **Updated receipts**: Line break handling has been updated to make multiple billing email addresses or long addresses easier to read.

## Custom Nodes
  - **Node Pools**: If you decide to opt-in to the node pool features (described in the features section), we highly recommend resetting your existing nodes in order to utilize new features.

## Shippable Server
  - Features
      - **Node pools**: With the Node Pools release, a whole bunch of features were added like [Multi platform support](http://docs.shippable.com/platform/runtime/nodes/#byon-nodes), [Host execution](http://docs.shippable.com/platform/workflow/job/runsh/), [Custom images in runSh](http://docs.shippable.com/platform/workflow/job/runsh/) and [Node pool management](http://docs.shippable.com/platform/management/subscription/node-pools/).
        - These features will be available by default for any new releases using v6.2.1 release.
        - Any older release which is upgraded to v6.2.1 will automatically see the new features, too.
        - No user action is required for any migrations, they're handled
          transparently as part of upgrade process.

## History

To view Shippable's release history, check out our [releases page on github](https://github.com/Shippable/admiral/releases).
