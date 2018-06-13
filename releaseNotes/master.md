# ${REL_VER} Release Notes

## Release Date
${REL_VER_DATE}

## Features
  - **yml templates**: runSh jobs now support yml templating. [See the docs](http://docs.shippable.com/platform/workflow/job/runsh/#yml-templates) for more details.

## Fixes
  - **streaming logs**: Fixed a bug in log streaming that caused the browser to slow down in some cases.
  - **cached nodes**: Fixed a bug where cached nodes would be terminated after changing runtime versions before a new job would run.
  - **dynamic node disks**: Fixed a bug that was causing the wrong type of storage to be attached to dynamic nodes, impacting read/write performance.

## Shippable Server
  - Fixes
      - **superuser access**: Superusers should no longer have trouble loading user pages.

## History

To view Shippable's release history, check out our [releases page on github](https://github.com/Shippable/admiral/releases).
