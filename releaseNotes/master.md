# ${REL_VER} Release Notes

## Release Date

${REL_VER_DATE}

## Features

- **Added Subscription State panel on subscription dashboard**: The parallel job count and private job limit for a subscription is now visible under the breadcrumb on the subscription dashboard.
- **Amazon ECS Daemon Deployments**: Managed deploy jobs can now deploy daemon services to Amazon ECS by setting `schedulingStrategy` to `DAEMON` in a  `dockerOptions` input.
- **Supports always section in CI**: The always section can run commands or scripts that you want to execute whether the CI workflow passes or fails. [Read more](http://docs.shippable.com/ci/build-and-test/)
- **Support multiple nodePools in CI**: CI builds can be configured to run on multiple nodePools. [Read more](http://docs.shippable.com/ci/runtime-config/)

## Fixes

- **Searching for grouped resources on the SPOG**: Resources that appear in a group on the modern SPOG will now be found.
- **Fixes latest status update**: The latest status for jobs from newly synced repositories would not get dynamically updated in the UI until the page is refreshed. This is now fixed.
- **Fixes subscription dashboard bugs related to syncing removed repositories**: The subscriptions dashboard page would fail to initialize correctly when an account sync completes after one or more repositories are removed from the SCM. This bug has been fixed.
- **Fixes soft-deleted resources not being shown in the "Deleted" tab**: Resources that were soft-deleted by removing them from yml were not being displayed in the "Deleted" tab on the subscriptions dashboard. This is now fixed.
- **Fixes alignment of flags dropdown menu**: The alignment of the flags dropdown menu in the subscription and custom dashboards would cause part of it to extend beyond the right border of the page, making it impossible to see the complete flag names. This has been fixed by aligning the right edge of the dropdown menu to the right edge of the flags button in the dashboards.
- **Better background tab handling for users with large assembly lines**: Users with active assembly lines containing a large number of resources would sometimes notice their browser freeze when the Shippable tab is moved to the background and reactivated after a long time. For these users, the Shippable app will now move to an inactive state after spending 15 minutes in the background. The view will be refreshed when the tab is reactivated.
- **Better handling of circular dependencies in YML builder**: The YML builder would fail silently with a console error if the imported YML contained any circular dependencies. It now shows a proper error.
  - [Support#4584](https://github.com/Shippable/support/issues/4584)
- **Improve validation on creating subscription integration**: The add subscription integration page previously did not show any error if you click on save without filling the required fields and failed with just a console error. This has been fixed by disabling save button when required fields are not filled.
- **Fixes filtering of jobs in custom dashboard**: Custom dashboards would sometimes display incorrectly filtered jobs for a few seconds. This bug has been fixed.

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
