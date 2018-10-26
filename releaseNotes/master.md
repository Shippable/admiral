# ${REL_VER} Release Notes

## Release Date

${REL_VER_DATE}

## Features

- **Adhere to stricter validation requirements on GitHub api calls**: The GitHub API will apply [stricter validation rules from 1 Nov 2018](https://developer.github.com/changes/2018-09-25-stricter-validation-coming-soon-in-the-rest-api/). The payload of the "create webhook" API call that we make to GitHub when a CI project is enabled or gitRepo and syncRepo resources are added has been updated to comply with the new validation requirements. No changes were required on the other API calls that we make to GitHub.
- **Bitbucket sync updates**: We've made some modifications to how we synchronize information from Bitbucket to prepare for the removal of version 1 of the Bitbucket Cloud REST API.  No noticeable changes are expected for Bitbucket users on Shippable.
- **Drydock update**: Updating all Shippable official images with latest
  stable versions of [languages](http://docs.shippable.com/platform/runtime/machine-image/language-versions/), [cli's](http://docs.shippable.com/platform/runtime/machine-image/cli-versions/) and [services](http://docs.shippable.com/platform/runtime/machine-image/services-versions/). Refer to documentation
  for [v6.10.4](http://docs.shippable.com/platform/runtime/machine-image/ami-v6104/) for details.

## Fixes

- **CI debug build fails if the first node pool in the Subscription -> Node Pools page is not an on-demand node pool**: Debug builds were failing for subscriptions which had BYON Node Pool as the first Node Pool in the Subscription -> Node Pools page. This has been fixed. Debug builds will now pick the correct node pool.
- **Fixes "Views" list collapsing in the sidebar**: The "Views" list in the sidebar would sometimes collapse when navigating to a custom view. This bug has been fixed.
- **Fixes CI to allow special characters in docker registry passwords**: CI jobs with [docker registry integration](http://docs.shippable.com/platform/integration/dockerRegistryLogin/) would fail if certain characters were present in the docker registry password, as reported by [support/4589](https://github.com/Shippable/support/issues/4589). This bug has been fixed.
- **Fixes intermittent error while switching tabs in the Subscription and Custom dashboard**: An error message about missing view objects would sometimes be displayed when switching tabs in the subscription and custom dashboards. This bug has been fixed.

## Custom Nodes

- **simple title**: brief description
  - additional details or
  - actions required

## Shippable Server

### Features

- **simple title**: brief description

### Fixes

- **Core Shippable services use internal API**: In installations that had configured Public, Internal and Console APIs, some of the core services were incorrectly connecting to the Console API. This has been fixed and all core services now connect to the Internal API when available.

## History

To view Shippable's release history, check out our [releases page on github](https://github.com/Shippable/admiral/releases).
