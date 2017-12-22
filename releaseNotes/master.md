# ${RES_VER_NAME} Release Notes

## Release Date
${RES_VER_DATE}

## Features
  - **Show loading/in-progress animations**: Shows progressive loading bar for all page transitions.
  - **Resource templating is now supported**: You can use environment variable notation in your resources, and Shippable will automatically fill in the details during job execution.  This allows for resources that take on different values depending on what job they are being used in.
      - specific environment values can be defined via [params resource](http://docs.shippable.com/platform/workflow/resource/params/)
      - see documentation for more details: http://docs.shippable.com/platform/tutorial/workflow/crud-resource/#templating-resources

## Fixes
  - **SPOG shows incorrect color for inconsistent orphaned resources**: SPOG will now show the correct colour for inconsistent orphaned resources.

## Custom nodes
  - **Resource templating**: re-initialization is required to support resource templating.

## Shippable Server

  - Features
      - **simple title**: brief description
  - Fixes
    - **On enabling slack and hipchat integrations, slack and hipchat services were not coming up on fresh admiral installs**: Now enabling slack and hipchat integrations from admiral UI will automatically bring up slack and hipchat services.

## History

To view Shippable's release history, check out our [releases page on github](https://github.com/Shippable/admiral/releases).
