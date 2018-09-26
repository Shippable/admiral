# ${REL_VER} Release Notes

## Release Date

${REL_VER_DATE}

## Features

- **Added `size` column for subscription node pools table**: The [Subscription Node Pools](http://docs.shippable.com/platform/management/subscription/node-pools/) panel in a subscription's "Node Pools" page now shows you a "Size" column if you have any On Demand node pools, making it easier to identify how your node pools have been configured.
- **Drydock update**: Updating all Shippable official images with latest
  stable versions of [languages](http://docs.shippable.com/platform/runtime/machine-image/language-versions/), [cli's](http://docs.shippable.com/platform/runtime/machine-image/cli-versions/) and [services](http://docs.shippable.com/platform/runtime/machine-image/services-versions/). Refer to documentation
  for [v6.9.4](http://docs.shippable.com/platform/runtime/machine-image/ami-v694/) for details.
- **Registered Shippable IRC nicks**: Shippable is now registered on `chat.freenode.net` and `irc.freenode.net`. Open a [support issue](https://github.com/Shippable/support/issues/new) if you would like Shippable to use a registered nick to send IRC messages to another server.

## Fixes

- **Fixes styling of `h3` elements in changelog**: `h3` headings are now formatted correctly in the changelog.
- **Fixes meta tags in Shippable documentation**: The HTML meta tags for page description in the [Shippable documentation](http://docs.shippable.com/) were malformed. These tags have been fixed.
- **Fixes webhook integrations can't be created as org integrations**: It was not possible to create [Webhook integrations](http://docs.shippable.com/platform/integration/webhook/) as [org integrations](http://docs.shippable.com/platform/tutorial/integration/subscription-integrations/#creating-an-org-integration-recommended-for-teams). This has now been enabled.
- **Fixes deleting a deployed service**: [Deleting deployed services](http://docs.shippable.com/deploy/deleting-a-service/) on an orchestration platform using Shippable Assembly Lines would fail when using an integration in "master" mode. This has now been fixed.
- **Fixes overlap of names in sidebar menu**: Long SCM names would cause an overlap of text in the sidebar menu. This has been fixed with an ellipsis if the text is too long.

## Custom Nodes

- **simple title**: brief description
  - additional details or
  - actions required

## Shippable Server

### Features

- **Configurable IRC nick**: The IRC nick (and optional password) can be configured for individual servers in the Admiral UI on the add-ons tab. A default IRC nick may also be set in the same location by leaving the server field blank.

### Fixes

- **simple title**: brief description

## History

To view Shippable's release history, check out our [releases page on github](https://github.com/Shippable/admiral/releases).
