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
- **Fixes errors when enabling projects**: Enabling repositories that are re-created on SCM would fail due to foreign key constraint. This was happening because re-creating a repository on SCM results in a stale project with complete history. This would require manual cleanup. This is fixed. Re-created projects can now be enabled without any errors.

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
