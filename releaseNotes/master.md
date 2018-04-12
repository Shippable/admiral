# ${RES_VER_NAME} Release Notes

## Release Date
${RES_VER_DATE}

## Features
  - **UX improvement for Node Pools**: While creating or editing a node pool, the `Runtime versions` dropdown is sorted in descending order.
  - **Added support for ClearLinux custom images in CI**
  - **CI jobs in Assembly lines render YML**: You can view the complete YML for a CI job used in an Assembly Line.
  - 

## Fixes
  - Navigation from a Shared view to another works as expected. 
  - After a CI build completes, its status is reflected correctly in the *Latest Status* grid.
  - SSH access to Ubuntu 16.04 nodes for debug CI runs works as expected.
  - Running a Jenkins CI job, using an external CI integration, triggers downstream jobs which have the external CI job as an IN.
  - Billing page enabled the "Save" button and updates the total price correctly if there are any changes to the SKUs.
  - Jira issue created for a non-matrix CI builds create issue links in the CI build console page immediately. 
  - UX issues for Subscription and Project Insights have been fixed for Chrome on OSX.
  - 
 
## History

To view Shippable's release history, check out our [releases page on github](https://github.com/Shippable/admiral/releases).
