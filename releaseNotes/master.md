# ${REL_VER} Release Notes

## Release Date
${REL_VER_DATE}

## Features
  - **Centralized yml templates**: Now user can define a central shippable.templates.yml file and keep all their templates globally. User can also  import external template files defined in some other public repo using its raw file path, and then use templates defined in this file in your jobs by mentioning these external urls in shippable.templates.yml. [See the docs for more details](http://docs.shippable.com/platform/workflow/job/runsh/#yml-templates).
  - **shipctl get_git_changes**: shipctl includes a new command called `get_git_changes` which lists the files/directories containing changes within a commit range of a git repository. [See the docs for more details](http://docs.shippable.com/platform/tutorial/workflow/using-shipctl/#get_git_changes).

## Fixes
  - **Update private job count correctly**: Private job count gets reset to 0 every month for private projects with free subscriptions.
  - **shipctl get_integration_resource_field**: Fixed a bug in [get_integration_resource_field command](http://docs.shippable.com/platform/tutorial/workflow/using-shipctl/#get_integration_resource_field) which was not working for [Key-Value Pair Integration](http://docs.shippable.com/platform/integration/key-value/#key-value-pair-integration)

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
