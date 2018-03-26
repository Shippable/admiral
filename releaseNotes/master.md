# ${RES_VER_NAME} Release Notes

## Release Date
${RES_VER_DATE}

## Features
  - **Setting priority on runSh and runCI jobs**: You can now set priority on runSh and runCI jobs.
      - All jobs will have default priority as 9999.
      - All waiting jobs will be sorted first according to creation time and then by priority before being queued.
      - Example:
        ```
        name: test_features
        type: runSh
        priority: 100
        steps:
          - IN: features_repo
          - script: echo "executing job"
        ```

## Fixes
  - **simple title**: brief description
      - actions required
      - or additional details

## Custom Nodes
  - **simple title**: brief description
      - additional details or
      - actions required

## Shippable Server

  - Features
      - **simple title**: brief description
  - Fixes
      - **simple title**: brief description

## History

To view Shippable's release history, check out our [releases page on github](https://github.com/Shippable/admiral/releases).
