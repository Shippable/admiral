# ${RES_VER_NAME} Release Notes

## Release Date
${RES_VER_DATE}

## Features
  - **Improved usability of the Nodes dashboard**: You can see the OS and architecture of your nodes when you click on any node in the Node pool.

## Fixes
  - When deploy jobs are removed from the yml, the services that they deployed are deleted automatically.
  - When a soft deleted syncRepo is restored from the UI, all the jobs and resources created by the syncRepo are correctly restored.

## Custom Nodes
  - **simple title**: brief description
      - additional details or
      - actions required

## Shippable Server

  - **Admiral allows specification of HTTP proxy servers**: Admiral downloads artifcats and packages needed for install using the HTTP protocol. If your corporate intranet routes HTTP traffic using a proxy, you can specify the proxy in Admiral UI.
  
## History

To view Shippable's release history, check out our [releases page on github](https://github.com/Shippable/admiral/releases).
