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

- **Searching for grouped resources on the SPOG**: Resources that appear in a group on the modern SPOG will now be found.
- **Fixes latest status update**: The latest status for jobs from newly synced repositories would not get dynamically updated in the UI until the page is refreshed. This is now fixed.
- **Fixes subscription dashboard bugs related to syncing removed repositories**: The subscriptions dashboard page would fail to initialize correctly when an account sync completes after one or more repositories are removed from the SCM. This bug has been fixed.
- **Fixes soft-deleted resources not being shown in the "Deleted" tab**: Resources that were soft-deleted by removing them from yml were not being displayed in the "Deleted" tab on the subscriptions dashboard. This is now fixed.
- **Fixes alignment of flags dropdown menu**: The alignment of the flags dropdown menu in the subscription and custom dashboards would cause part of it to extend beyond the right border of the page, making it impossible to see the complete flag names. This has been fixed by aligning the right edge of the dropdown menu to the right edge of the flags button in the dashboards.

## Custom Nodes

- **simple title**: brief description
  - additional details or
  - actions required

## Shippable Server

### Features

- **simple title**: brief description

### Fixes

- **Using runSh inputs without state storage**: A `runSh` job can now be used as an input to another `runSh` or CI job in installations without state storage.
- **Fixes Duration in Admin / Monitor / Jobs page**: The `Duration` column in jobs table of admin monitor jobs page was showing incorrect value. This is fixed now.

## History

To view Shippable's release history, check out our [releases page on github](https://github.com/Shippable/admiral/releases).
