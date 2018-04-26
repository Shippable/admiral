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
          - [AWS Keys](http://docs.shippable.com/platform/integration/aws-keys/)
          - [Azure DC/OS](http://docs.shippable.com/platform/integration/azureDcosKey/)
          - [Azure Keys](http://docs.shippable.com/platform/integration/azure-keys/)
          - [Node Cluster](http://docs.shippable.com/platform/integration/nodeCluster/)
          - [Docker Cloud](http://docs.shippable.com/platform/integration/dclKey/)
          - [Docker DataCenter](http://docs.shippable.com/platform/integration/ddcKey/)
          - [Kubernetes](http://docs.shippable.com/platform/integration/kubernetes/)
          - [Joyent Triton](http://docs.shippable.com/platform/integration/joyentTritonKey/)
          - [Digital Ocean](http://docs.shippable.com/platform/integration/do/)
          - [Google Cloud](http://docs.shippable.com/platform/integration/gcloudKey/)
          - [Webhook](http://docs.shippable.com/platform/integration/webhook/)
          - [HipChat](http://docs.shippable.com/platform/integration/hipchatKey/)
          - [Slack](http://docs.shippable.com/platform/integration/slackKey/)
          - [Jira](http://docs.shippable.com/platform/integration/jira/)
          - [AWS Keys (ECR)](http://docs.shippable.com/platform/integration/aws-keys/)
          - [JFrog Artifactory](http://docs.shippable.com/platform/integration/jfrog-artifactoryKey/)
          - [Quay.io](http://docs.shippable.com/platform/integration/quayLogin/)
          - [Docker Registry](http://docs.shippable.com/platform/integration/dockerRegistryLogin/)
          - [PEM Key](http://docs.shippable.com/platform/integration/pemKey/)
          - [Key-Value pair](http://docs.shippable.com/platform/integration/key-value/)
          - [Git Credential](http://docs.shippable.com/platform/integration/git-credential/)

  - Fixes
      - **simple title**: brief description

## History

To view Shippable's release history, check out our [releases page on github](https://github.com/Shippable/admiral/releases).
