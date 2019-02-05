# ${REL_VER} Release Notes

## Release Date

${REL_VER_DATE}

## Features

- **simple title**: brief description. [link to docs](#).
  - itemized
  - list
  - for details
  - if necessary

  - **Drydock update**: Updating all Shippable official images with latest stable versions of [languages](http://docs.shippable.com/platform/runtime/machine-image/language-versions/), [cli's](http://docs.shippable.com/platform/runtime/machine-image/cli-versions/) and [services](http://docs.shippable.com/platform/runtime/machine-image/services-versions/). Refer to documentation
    for [v7.1.4](http://docs.shippable.com/platform/runtime/machine-image/ami-v714/) for details.

## Fixes

- **Fixes issue with `Last Check In` for nodes in node pool details page**: In the node pool details page the `Last Check In` column would sometimes be shown empty. This has been fixed.
- **Fixes errors when deleting projects**: Deleting projects with large histories would run in to timeouts. This would sometimes result in stale objects, making it impossible to re-enable the project without manual cleanup. This problem has been fixed. Projects can now be deleted and re-enabled without running in to any errors.
- **Fixes errors when enabling projects**: When a repository associated with an active project on Shippable is deleted on the SCM and re-created with the same name, the resulting repository could not be enabled on Shippable without manual intervention. Attempting this would result in errors due to foreign key constraints failing. This was happening because re-creating a repository on SCM results in a stale project with history on Shippable that needs to be cleaned up manually. This is fixed. Re-created projects can now be enabled without any errors.
- **Fixes an error occurring when rerunning some failed builds**: An error that occurred when rerunning failed jobs in some CI runs where the first job had succeeded has been fixed.
- **Improved rSync error messages for invalid steps**: The error shown when a job has an improperly formatted step now includes the name of the job. The error will also not be displayed when other rSync jobs in the same subscription run.
- **Corrected indentation of example YML in YML Builder**: The example YML for the option to import a YML in YML Builder was incorrectly indented. That has been fixed.
- **Fixes CI to allow spaces in docker registry passwords**: CI jobs with [docker registry integration](http://docs.shippable.com/platform/integration/dockerRegistryLogin/) would fail if spaces were present in the docker registry password, as reported by [support/4655](https://github.com/Shippable/support/issues/4655). This bug has been fixed.
- **Fixes issue with status not showing for some jobs**: Status for some jobs in subscription and project dashboard was not showing. This has now been fixed.
- **Fixes issue with language versions specified as numbers are not working**: Specifying language versions as numbers resulted in CI builds running on default version instead of specified version. This is fixed now. Builds will now run on specified versions.

## Custom Nodes

- **simple title**: brief description
  - additional details or
  - actions required

## Shippable Server

### Features

- Build artifacts can be stored in Google Cloud Storage: Shippable admin can now enable build artifacts like build consoles, coverage reports, test reports to be stored on Google Cloud Storage file store. If multiple file stores(AWS S3 & Google Cloud Storage) are configured, admin can also map a file store provider to each node type(BYON, shared, on-demand).

### Fixes

- **simple title**: brief description

## History

To view Shippable's release history, check out our [releases page on github](https://github.com/Shippable/admiral/releases).
