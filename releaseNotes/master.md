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
- **Fixes displaying soft-deleted resources in deleted tab**: The resources which are soft-deleted i.e., removed from yml were not displayed in `Deleted` tab of subscription dashboard. This is now fixed.

## Custom Nodes

- **simple title**: brief description
  - additional details or
  - actions required

## Shippable Server

- **Using runSh inputs without state storage**: A `runSh` job can now be used as an input to another `runSh` or CI job in installations without state storage.

### Features

- **simple title**: brief description

### Fixes

- **simple title**: brief description

## History

To view Shippable's release history, check out our [releases page on github](https://github.com/Shippable/admiral/releases).
