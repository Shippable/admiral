# ${REL_VER} Release Notes

## Release Date

${REL_VER_DATE}

## Features

- **Added `size` column for subscription node pools table**: The [Subscription Node Pools](http://docs.shippable.com/platform/management/subscription/node-pools/) panel in a subscription's "Node Pools" page now shows you a "Size" column if you have any On Demand node pools, making it easier to identify how your node pools have been configured.
- **Drydock update**: Updating all Shippable official images with latest
  stable versions of [languages](http://docs.shippable.com/platform/runtime/machine-image/language-versions/), [cli's](http://docs.shippable.com/platform/runtime/machine-image/cli-versions/) and [services](http://docs.shippable.com/platform/runtime/machine-image/services-versions/). Refer to documentation
  for [v6.9.4](http://docs.shippable.com/platform/runtime/machine-image/ami-v694/) for details.

## Fixes

- **Fixes styling of `h3` elements in changelog**: `h3` headings are now formatted correctly in the changelog.
- **Fixes meta tags in Shippable documentation**: The HTML meta tags for page description in the [Shippable documentation](http://docs.shippable.com/) were malformed. These tags have been fixed.
- **Fixes webhook integrations can't be created as org integrations**: It was not possible to create [Webhook integrations](http://docs.shippable.com/platform/integration/webhook/) as [org integrations](http://docs.shippable.com/platform/tutorial/integration/subscription-integrations/#creating-an-org-integration-recommended-for-teams). This has now been enabled.
- **Fixes deleting a deployed service**: [Deleting deployed services](http://docs.shippable.com/deploy/deleting-a-service/) on an orchestration platform using Shippable Assembly Lines would fail when using an integration in "master" mode. This has now been fixed.
## Custom Nodes

- **simple title**: brief description
  - additional details or
  - actions required

## Shippable Server

### Features

- **simple title**: brief description

### Fixes

- **simple title**: brief description

## History

To view Shippable's release history, check out our [releases page on github](https://github.com/Shippable/admiral/releases).
