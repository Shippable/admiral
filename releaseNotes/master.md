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
  - **Error in rSync for jobs with incorrectly formatted steps**: improved error handing for some jobs defined with incorrectly formatted steps.
  - **Template support in dryrun and proper error handling**: fixes issue with parsing shippable.templates.yml in dryRun and corrects error handling while parsing incorrect templates.
  - **Error parsing completely commented shippable.yml file**: YML files containing only comments no longer fail to be parsed in rSync.
  - **Triggering of OUT resources from matrix CI**: matrix CI jobs will now only trigger downstream resources once per unique OUT resource.

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
