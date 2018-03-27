# ${RES_VER_NAME} Release Notes

## Release Date
${RES_VER_DATE}

## Features
  - **Setting priority on runSh and runCI jobs**: You can now set priority on runSh and runCI jobs.
      - All jobs will have default priority as 9999.
      - All waiting jobs will be sorted first according to creation time and then by priority before being queued.
      - Example:
        ```
        name: test_features
        type: runSh
        priority: 100
        steps:
          - IN: features_repo
          - script: echo "executing job"
        ```
  - **Adjustable custom node disk usage limit**: You can now define a maximum disk usage limit for all nodes in a subscription node pool from the subscription node pools page, for both subscription node pools and system node pools (for server admins). 
      - A default of 90% maximum disk usage limit will be applied if none is specified.
      - Disk usage limits can be specified per Node pool.

## Fixes
  - **Fixed job triggering issues**
      - The last state of a input job will be used when determining if a job should run. So a cancelled `job A` whose previous status was success and which is an IN to `job B`, will not prevent `job B` from triggering.
      - In the scenario `job A` -> `img` -> `job B`, if you soft-delete `job A`, `job B` will no longer automatically trigger.
      - With 2 minions, and 2 not-connected runCI and runSh jobs, the runSh and runCI jobs will execute in parallel.

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
