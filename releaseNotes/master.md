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

- **Fixes issue with `Last Check In` for nodes in node pool details page**: In the node pool details page the `Last Check In` column would sometimes be shown empty. This has been fixed.
- **Fixes errors when deleting projects**: Deleting projects with large histories would run in to timeouts. This would sometimes result in stale objects, making it impossible to re-enable the project without manual cleanup. This problem has been fixed. Projects can now be deleted and re-enabled without running in to any errors.
- **Fixes errors when enabling projects**: When a repository associated with an active project on Shippable is deleted on the SCM and re-created with the same name, the resulting repository could not be enabled on Shippable without manual intervention. Attempting this would result in errors due to foreign key constraints failing. This was happening because re-creating a repository on SCM results in a stale project with history on Shippable that needs to be cleaned up manually. This is fixed. Re-created projects can now be enabled without any errors.
- **Fixes an error occurring when rerunning some failed builds**: An error that occurred when rerunning failed jobs in some CI runs where the first job had succeeded has been fixed.
- **Improved rSync error messages for invalid steps**: The error shown when a job has an improperly formatted step now includes the name of the job. The error will also not be displayed when other rSync jobs in the same subscription run.
- **Corrected indentation of example YML in YML Builder**: The example YML for the option to import a YML in YML Builder was incorrectly indented. That has been fixed.

## Custom Nodes

- **simple title**: brief description
  - additional details or
  - actions required

## Shippable Server

### Features

- **simple title**: brief description

### Fixes

- **simple title**: brief description

## History

To view Shippable's release history, check out our [releases page on github](https://github.com/Shippable/admiral/releases).
