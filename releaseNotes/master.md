# ${REL_VER} Release Notes

## Release Date

${REL_VER_DATE}

## Features

- **Adhere to stricter validation requirements on GitHub api calls**: The GitHub API will apply [stricter validation rules from 1 Nov 2018](https://developer.github.com/changes/2018-09-25-stricter-validation-coming-soon-in-the-rest-api/). The payload of the "create webhook" API call that we make to GitHub when a CI project is enabled or gitRepo and syncRepo resources are added has been updated to comply with the new validation requirements. No changes were required on the other API calls that we make to GitHub.

## Fixes

- **CI debug build fails if the first node pool in the Subscription -> Node Pools page is not an on-demand node pool**: Debug builds were failing for subscriptions which had BYON Node Pool as the first Node Pool in the Subscription -> Node Pools page. This has been fixed. Debug builds will now pick the correct node pool.
- **Fixes view switch in sidebar-menu**: Sidebar menu would sometimes update view incorrectly for the views section. This bug has been fixed.

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
