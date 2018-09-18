# ${REL_VER} Release Notes

## Release Date
${REL_VER_DATE}

## Features
  - **simple title**: brief description. [link to docs](#).
      - itemized
      - list
      - for details
      - if necessary

## Fixes
  - **Fixes sorting by "Duration" in the grid view**: Clicking on the "Duration" column in the grid view of any dashboard (subscription, project, job) will now sort the items by duration.
  - **Fixes validation on project and branch name when adding a syncRepo via the API**: The API will no longer allow multiple syncRepos to be added for the same project and branch.

## Custom Nodes
  - **simple title**: brief description
      - additional details or
      - actions required

## Shippable Server

  - Features
      - **simple title**: brief description
  - Fixes
      - **Fixes errors when trying to use Gerrit projects with slashes in name**: Gerrit projects with slashes in their names can be enabled for CI and used as gitRepo and syncRepo resources. Branch names with slashes are also supported.
      - **Fixes gitRepo branch names changing**: When using a BitBucket Server version that doesn't support webhooks, Shippable gets the latest version of gitRepo and syncRepo resources when a job is run manually. This would overwrite any configured branch settings on these resources with the default branch of the repository. This has now been fixed. The branch configuration on gitRepo and syncRepo resources will no longer be lost when triggering jobs manually.
## History

To view Shippable's release history, check out our [releases page on github](https://github.com/Shippable/admiral/releases).
