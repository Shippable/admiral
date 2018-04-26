# ${RES_VER_NAME} Release Notes

## Release Date
${RES_VER_DATE}

## Features
  - **Failure logs in email notifications**: Email notifications for both CI and Assembly Lines can be configured to include log output of failing commands with the `sendFailingSnippet` option. To enable this, see the [CI email](http://docs.shippable.com/ci/email-notifications/) or [Assembly Lines configuration](http://docs.shippable.com/platform/workflow/config/#assembly-lines-configuration) documentation.

  - **simple title**: brief description. [link to docs](#).
      - itemized
      - list
      - for details
      - if necessary

## Fixes
  - Listing a webhook subscription integration with no linked account integration in a CI shippable.yml now creates a run with the same error message as other integration types.

## Custom Nodes
  - **simple title**: brief description
      - additional details or
      - actions required

## Shippable Server

  - Features
      - **Addons are enabled by default in fresh installation of Shippable** - After a [fresh installation of Shippable](http://docs.shippable.com/platform/server/install-onebox/), the following Addons will be enabled by default.
          - AWS Keys
          - Azure DC/OS
          - Azure Keys
          - Node Cluster
          - Docker Cloud
          - Docker DataCenter
          - Kubernetes
          - Joyent Triton
          - Digital Ocean
          - Google Cloud
          - Webhook
          - HipChat
          - Slack
          - Jira
          - AWS Keys (ECR)
          - JFrog Artifactory
          - Quay.io
          - Docker Registry
          - PEM Key
          - Key-Value pair
          - Git Credential

      - **simple title**: brief description
  - Fixes
      - **simple title**: brief description

## History

To view Shippable's release history, check out our [releases page on github](https://github.com/Shippable/admiral/releases).
