# ${REL_VER} Release Notes

## Release Date
${REL_VER_DATE}

## Features
  - **Provided an option to hide Not-Built branches in Project dashboard**: We now provided an option to filter out not-built branches in latest status of project dashboard

## Fixes
  - **Error in rSync for jobs with incorrectly formatted steps**: improved error handing for some jobs defined with incorrectly formatted steps.
  - **Template support in dryrun and proper error handling**: fixes issue with parsing shippable.templates.yml in dryRun and corrects error handling while parsing incorrect templates.
  - **Error parsing completely commented shippable.yml file**: YML files containing only comments no longer fail to be parsed in rSync.
  - **Triggering of OUT resources from matrix CI**: matrix CI jobs will now only trigger downstream resources once per unique OUT resource.
  - **Misleading error for unsupported integrations used in CI**: improved error descriptions for unsupported integrations used in CI jobs.
  - **Error while deleting account**: Accounts having enabled projects, which have not synced in last 4 hours, can be deleted without any errors.
  - **UI Bug Fixes**:
      - Fixed collaborator permission, only to view summary of admin's billing page [support#4431](https://github.com/Shippable/support/issues/4431)
      - Fixed Template support in dryrun
      - Added pagination for latest status section in home dashbord
  - **Logup Enhancements**
      - jobConsoles upload to S3 for large console logs is fixed.

## Shippable Server

  - Fixes
      - **Admiral doesn't insert sshUser value while inserting a System Machine Image**: fixes issue with admiral not inserting user provided values for sshUser and sshPort in the database while adding the System Machine Images.

## History

To view Shippable's release history, check out our [releases page on github](https://github.com/Shippable/admiral/releases).
