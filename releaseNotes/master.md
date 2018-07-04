# ${REL_VER} Release Notes

## Release Date
${REL_VER_DATE}

## Features
  - **Centralized yml templates**: Now user can define a central shippable.templates.yml file and keep all their templates globally. User can also  import external template files defined in some other public repo using its raw file path, and then use templates defined in this file in your jobs by mentioning these external urls in shippable.templates.yml. [See the docs for more details](http://docs.shippable.com/platform/workflow/job/runsh/#yml-templates).
  - **shipctl get_git_changes**: shipctl includes a new command called `get_git_changes` which lists the files/directories containing changes within a commit range of a git repository. [See the docs for more details](http://docs.shippable.com/platform/tutorial/workflow/using-shipctl/#get_git_changes).

  - **Modern SPOG improvements**: The following improvements are done for modern SPOG:
      - Improved object positioning by spreading the objects evenly
      - Static resource inputs for a job (which are not an output for any job) will now be bundled into a circular object with a plus icon and users can click on it to see further information about all the bundled resources
      - Moved sync jobs, orphan objects and deleted objects into separate panels
      - Pipeline will initially be in the center of the view instead of aligning it to the left,
      - For large pipelines, the initial zoom for the SPOG will now show the entire pipeline instead of a part of it

## Fixes
  - **shipctl get_integration_resource_field**: Fixed a bug in [get_integration_resource_field command](http://docs.shippable.com/platform/tutorial/workflow/using-shipctl/#get_integration_resource_field) which was not working for [Key-Value Pair Integration](http://docs.shippable.com/platform/integration/key-value/#key-value-pair-integration)
  - **Update private job count correctly**: Private job count gets reset to 0 every month for private projects with free subscriptions.
  - **Binary files in state**: Binary files can be saved in state for resources and jobs.
  - **FIxes UI Bugs**:
      - Fixed the issue where blank IDs section from the botom of the page shows at the top during initial load
      - Fixed alignment issues in various places
      - Added spinners and fixed spinner placement in various places
      - Fixed tooltip position in various places
      - Updated titles/vocabvular to be consistent across the system
      - Updated breadcrumbs to be consistent across the system
      - Fixed wrong job duration issue for runCI.
      - Ristricted Credit Card Month picker from selecting past Month.
      - Ristricted calender in history page to select future date and past dates from 'from' date.
      - Admin should not be allowed to remove all the licenses for any subscription while editing
      - Fixed error trying to dismiss NPS notification
      - added download button When looking at logs of a processing job.
      - Fixed the Clicking on the edge of the Cache checkbox on billing page selection issue.
## Custom Nodes
  - **simple title**: brief description
      - additional details or
      - actions required

## Shippable Server

  - Features
      - **Multiple authencation methods for enterprise SCMs**: Now Shippable server users can configure multiple authencations for different Gitlab, Bitbucket Server and GitHub Enterprise setups.
  - Fixes
      - **simple title**: brief description

## History

To view Shippable's release history, check out our [releases page on github](https://github.com/Shippable/admiral/releases).
