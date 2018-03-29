# ${RES_VER_NAME} Release Notes

## Release Date
${RES_VER_DATE}

## Features
  - **Integration with JIRA**: You can create tickets in JIRA directly from the runSh and runCI job console dashboard. A JIRA integration allows you to specify your JIRA Server URL, username and token. Thereafter, with a single click in your job console page, you can create a story/task/bug type of issue for any of your projects and also attach the console logs.
  
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
      
  - **Manually triggered jobs in the SPOG can be easily found**: The SPOG renders jobs which need to be manually triggered with a dark gray border, when an update to any of its input occurs. This allows you to quickly scan the SPOG and find jobs that need to be manually triggered. Manually triggered jobs have `switch: off` applied to one or more of their inputs. Triggering the job resets the border.    

## Fixes
  - **Fixed job triggering issues**
      - The last state of a input job will be used when determining if a job should run. So a cancelled `job A` whose previous status was success and which is an IN to `job B`, will not prevent `job B` from triggering.
      - In the scenario `job A` -> `img` -> `job B`, if you soft-delete `job A`, `job B` will no longer automatically trigger.
      - With 2 minions, and 2 not-connected runCI and runSh jobs, the runSh and runCI jobs will execute in parallel.

## Shippable Server

  - Bitbucket Sever OAUTH plugin works correctly in a proxy environment. Assuming the BitBucket Server is running on bbs.example.com, the proxy could be configured to reject requests for this URL because the traffic is meant to be routed locally. Users can now add bbs.example.com to the no_proxy setting when prompted by Admiral.
 
## History

To view Shippable's release history, check out our [releases page on github](https://github.com/Shippable/admiral/releases).
