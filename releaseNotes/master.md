# ${RES_VER_NAME} Release Notes

## Release Date
${RES_VER_DATE}

## Features
  - **UX improvement for Node Pools**: While creating or editing a node pool, the `Runtime versions` dropdown is sorted in descending order.
  - **Added support for ClearLinux custom images in CI**
  - **CI jobs in Assembly lines render YML**: You can view the complete YML for a CI job used in an Assembly Line.
  - **Fine grain control on replication of a gitRepo resource**: A common use case is to trigger a managed deploy job or runSh **AFTER** CI in an Assembly line, using the same branch and SHA as CI using the `replicate` feature. Customers often want to trigger CI for PRs but they do not want their managed and unmanaged jobs downstream to be triggered for PRs. You can enable this scenario by specifying `replicateOnPullRequest: false`.
  - **Added support to deploy job for forced deployment with release inputs**
      - Consider the following assembly line: `image->manifest->release->deploy`. In the deploy job, you can now attach `force: true` to the `release` IN step and the deploy job will deploy the manifests in your release, regardless of whether or not they have changed since the previous deployment.

```
jobs:
 - name: myrepo_runCI
   type: runCI
   steps:
     - OUT: myGitRepoResource
       replicate: myrepo_ciRepo
       replicateOnPullRequest: false
```

## Fixes
  - Navigation from a Shared view to another works as expected. 
  - After a CI build completes, its status is reflected correctly in the *Latest Status* grid.
  - SSH access to Ubuntu 16.04 nodes for debug CI runs works as expected.
  - Running a Jenkins CI job, using an external CI integration, triggers downstream jobs which have the external CI job as an IN.
  - Billing page enabled the "Save" button and updates the total price correctly if there are any changes to the SKUs.
  - Jira issue created for a non-matrix CI builds create issue links in the CI build console page immediately. 
  - UX issues for Subscription and Project Insights have been fixed for Chrome on OSX.
  - 

## Shippable Server

  - WebHook integrations work in CI and the `NOTIFY` step of your Assembly line jobs on a fresh install.

 
## History

To view Shippable's release history, check out our [releases page on github](https://github.com/Shippable/admiral/releases).
