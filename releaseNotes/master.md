# ${REL_VER} Release Notes

## Release Date

${REL_VER_DATE}

## Features

- **Updated Bitbucket Deploy Key Creation**: We now use version 2 of the Bitbucket Cloud REST API to create and delete deploy keys for Bitbucket Cloud repositories.  No noticeable changes are expected.
- **Enhanced Search Bar**: The search experience on grid views and tables has been updated to stay consistent with what is currently available in the SPOG view.

## Fixes

- **Fixes disappearing provider name in breadcrumb on project sync**: On syncing a project in project settings page, provider name in breadcrumb was disappearing. This is now fixed.
- **Fixes documentation link for "Waiting Jobs" in grid view**: Clicking on the documentation link for "Waiting Jobs" in grid view was throwing 403 error. This is now fixed.
- **Fixes incorrect API docs info**: The POST projects/:id/newBuild route has been updated in the documentation to correctly describe the query string and POST body parameters.
- **Fixes displaying same job multiple times under processing jobs section**: When a matrix run is triggered, the job was showing up multiple times under processing jobs section in grid view. This is now fixed.
- **Fixes `shipctl` commands with multiple keyValuePair integrations containing the same keys**: When there were multiple keyValuePair integrations containing the same keys, `shipctl` commands would sometimes return the value from the wrong resource. The correct values will now be returned. Custom nodes will need to be reinitialized for this to take effect on those nodes.
- **Fixes credit card expiry year**: While adding new credit card, expiry year drop-down was listing older years. This is now fixed.

## Custom Nodes

- **simple title**: brief description
  - additional details or
  - actions required

## Shippable Server

### Features

- **simple title**: brief description

### Fixes

- **Fixes sorting of completed jobs in admin job status page**: In admin job status page, completed jobs were not sorted. This is now fixed, completed jobs are sorted in descending order based on `Started At`.

## History

To view Shippable's release history, check out our [releases page on github](https://github.com/Shippable/admiral/releases).
