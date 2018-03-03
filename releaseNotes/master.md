# ${RES_VER_NAME} Release Notes

## Release Date
${RES_VER_DATE}

## Features
  - **Chrome addon and Chrome driver in language images**: You can run selenium tests using Chrome in a headless mode. Sample for running headless chrome is available [here](https://github.com/devops-recipes/ci-headless-chrome) and sample for running headless chrome with selenium is available [here](https://github.com/devops-recipes/ci-headless-chrome-selenium).
  - **shipctl utility is available on custom docker images**: You can now use all the shipctl functions in custom docker images in both runCI and runSh jobs.
  - **Users can make a change to shippable ymls without triggering any jobs attached to gitRepos**: Usecases where gitRepo and syncRepo were identical (point to the same repository) would run into a problem where changes to the shippable yml would trigger rSync and the job attached to the gitRepo in a non-deterministic order. We now only trigger rSync if a commit has any shippable yml file in its changeset.
  - **Enabled flags are sorted and rendered above disabled flags**: Some users have a lof of assembly lines and thus a ton of flags. A user might forget which flags they have enabled, and scrolling through the entire list to find the flags that are enabled is not a very good user experience. We have improved the user experience by rendering all enabled flags above disabled flags. Furthermore, the enabled flags are sorted.
  - **Private repositories can be enabled from the Enabled projects page**: You can now give permissions to sync private repositories from the `Enable CI Projects and Sync Repository` page (represented by the `+` icon on your subscription dashboard). We think that this is a more discoverable location that the Profile settings page, where you can also grant similar permissions. You will see a checkbox to enable private repositories if you haven't given permissions already. Once you click on the checkbox, you will be redirected to your SCM OAuth page to grant permissions and private repositories will get sync'ed after permissions are granted. 
  - **Improved user experience of creating a syncRepo**: After you add a new subscription integration during the flow of creating a syncRepo, the UI redirects you back to the syncRepo creation dialog. This allows you to complete the syncRepo creation seamlessly.
  - **Improved user experience of running Windows BYON node initialization scripts**: Windows BYON node initialization scripts do not need installation of tar/gzip utilties and setting of environment variables.
  - **Improved user experience of adding Nodes to a Node pool**: The experience of adding a Node to a Node pool once its limit has reached is much improved. A link to the billing dashboard is displayed, clicking on which allows you edit the SKU to add more capacity.

## Fixes
  - Windows gitRepo IN preserves the .git directory. This enables running git commands in the runSh job.
  - Changes to version pinned resources are immediately reflected in the UI without needing a browser refresh.
  - Running N parallel instances of a job in a subscription that has N (N > 1) minions do not block (N-1) minions.
  - If a subscription ends up with a single Node pool as a result of adding/removing SKU's or Node pools, the Node pool is
    always set as the default Node pool.
  - CI Projects with special characters can be seen in SPOG `Dry run`.  
  - After a project is enabled for CI, the project name can be clicked so that you can navigate to the project dashboard. This     simplifies the process of triggering a manual build for testing purposes once a project is enabled. 
  - Key-Value pair integrations when used in a CI project, do not show any key-value pair data in plaintext in the script tab.
  - Text alignment issues in SPOG have been fixed for the Microsoft Edge browser.
  - Improved the UX of the Billing page.
  - Ubuntu 16.04 Node initialization scripts do not set aufs as a storage driver. Storage driver is not set so that Docker         daemon can choose the most appropriate storage driver.
  - Syncrepo's can be deleted while the pipeline is running.
  - Debug builds (SSH access to build nodes) option is only shown for on-demand Node pools.
  - Replication of a gitRepo resource to a ciRepo resource in a runSh job works as expected. This is needed for the usecase
    of triggering CI with the identical commit and branch for which the runSh job was triggered which has a gitRepo resource
    as an input.
       

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
