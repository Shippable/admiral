# ${REL_VER} Release Notes

## Release Date
${REL_VER_DATE}

## Features
  - **Cancelling Managed Jobs**: [Managed jobs](http://docs.shippable.com/platform/workflow/job/overview/#supported-job-types) can now be cancelled.  Cancelling is not recommended for [deploy jobs](http://docs.shippable.com/platform/workflow/job/deploy/) due to their stateful nature.

## Fixes
  - **Fixes sorting by "Duration" in the grid view**: Clicking on the "Duration" column in the grid view of any dashboard (subscription, project, job) will now sort the items by duration.
  - **Fixes validation on project and branch name when adding a syncRepo via the API**: The API will no longer allow multiple syncRepos to be added for the same project and branch.
  - **Fixes "show envs in grid view" for runSh task envs**: When the "Show envs in grid view" option is configured for runSh jobs, envs defined at a TASK level were not being displayed in the grid. Matching envs from TASKs will now be displayed correctly.
  - **Fixes counterintuitive SPOG search next and previous buttons**: We have fixed the SPOG search UI's up/down arrows to move between previous/next objects respectively instead of next/previous objects. This behaviour is consistent with the Search functionality in all modern browsers and desktop apps.

## Custom Nodes
  - **simple title**: brief description
      - additional details or
      - actions required

## Shippable Server

  - Features
      - **Usability enhancements in Admiral control plane page**: Added a button to make it easier to copy `Callback URL` and `Public Key` of SCM auth providers in control plane.
  - Fixes
      - **Fixes errors when trying to use Gerrit projects with slashes in name**: Gerrit projects with slashes in their names can be enabled for CI and used as gitRepo and syncRepo resources. Branch names with slashes are also supported.
      - **Fixes gitRepo branch names changing**: When using a BitBucket Server version that doesn't support webhooks, Shippable gets the latest version of gitRepo and syncRepo resources when a job is run manually. This would overwrite any configured branch settings on these resources with the default branch of the repository. This has now been fixed. The branch configuration on gitRepo and syncRepo resources will no longer be lost when triggering jobs manually.
      - **Usability and consistency fixes in view shared node pools pages**: 
          - The nodes list in the shared node pool details page was missing the re-initialize action and workload column. These have been added. 
          - When adding a shared node, the view now returns to the details page for the current shared node pool instead of going to the list of all shared node pools.

## History

To view Shippable's release history, check out our [releases page on github](https://github.com/Shippable/admiral/releases).
