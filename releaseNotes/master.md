# ${REL_VER} Release Notes

## Release Date

${REL_VER_DATE}

## Features

- **Drydock update**: Updating all Shippable official images with latest stable versions of [languages](http://docs.shippable.com/platform/runtime/machine-image/language-versions/), [cli's](http://docs.shippable.com/platform/runtime/machine-image/cli-versions/) and [services](http://docs.shippable.com/platform/runtime/machine-image/services-versions/). Refer to documentation
  for [v6.12.4](http://docs.shippable.com/platform/runtime/machine-image/ami-v6124/) for details.
- **Subscription Integrations API**: It is now possible to filter subscription integrations by master integration (name, type, or ID) through the Shippable API by including `masterIntegrationNames`, `masterIntegrationTypes`, or `masterIntegrationIds` query parameters.

## Fixes

- **Fixes shipctl jdk to setup java environment correctly**: Java builds using oraclejdk8 on CentOS 7 image were failing and is fixed by setting the correct JDK path for java in shipctl. ([support#4603](https://github.com/Shippable/support/issues/4603), [support#4613](https://github.com/Shippable/support/issues/4613))
- **Removing pause/resume actions from project dashboard**: The project dashboard used to show "pause" and "resume" buttons against each branch. This button, however, would apply to the project as a whole and not for an individual branch. This has been removed. The ability to pause and resume a project is still available in the project settings page.
- **Fix CentOS 7 debug nodes prompting users for a password when using sudo**: The ssh user is now granted permission to use `sudo` in the debug nodes without being prompted for a password. This fix will work on CentOS 7 runtimes of v6.12.4 and above. [support#4677](https://github.com/Shippable/support/issues/4677)
- **Fix CentOS 7 on-demand nodes with Docker 18.03 installed not picking up builds**: The startup script sometimes runs before the docker daemon is up. Hence, the build runner does not start and the node is unable to run any builds. The script will now wait for the docker daemon before attempting to start the build runner.

## Custom Nodes

- **simple title**: brief description
  - additional details or
  - actions required

## Shippable Server

### Features

- **simple title**: brief description

### Fixes

- **Fixes errors when super user visits Gerrit subscriptions or projects with slashes in name**: Super users would see a 404 page when they try to visit Gerrit subscriptions or projects with slashes in the name. This issue has been fixed.

## History

To view Shippable's release history, check out our [releases page on github](https://github.com/Shippable/admiral/releases).
