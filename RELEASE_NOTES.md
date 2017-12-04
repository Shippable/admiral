## 5.11.3

### Bug Fixes

1. Subscription nodes page now shows correctly that it is configured to use system nodes instead of erroneously showing "custom"

1. Dry run now processes `state` resources without errors

1. GitLab oAuth and integratins have been fixed to work with the latest changes in GitLab's handling of authorization headers

1. Project branch status and job state map are no longer updated when debug runs are executed

1. Google Cloud and Digital Ocean are now listed under cloud providers section in Admiral

1. When multiple resources are pinned to different versions of INs, the versions are now assigned correctly


### Features

1. SPOG performance improvements
    - Load time, update time, and switching between SPOG and grid view should now be noticeably faster than before.

1. Enhanced control over triggering of dependent jobs
    - Now you can control how you want to trigger a job when an upstream job completes by specifying the new dependencyMode option in shippable YML job configs. There are three modes to choose from, each with its own unique behavior that may help optimize your pipeline's workflow, depending on your scenario:

      1. `chrono`: this is the default setting and follows the existing rules for triggering new jobs. New jobs will be created but will wait for preceeding and subsequent jobs to complete before executing.
      1. `immediate`: jobs will execute in the order they are created, with no regard for the status of preceeding or subsequent jobs.
      1. `strict`: a triggered job will not be created while preceeding jobs are processing. Instead it will enter a special 'waiting' state. Once all preceeding jobs have completed, the job will be created and will execute with all of the latest versions of its inputs.

    There is no change in existing triggering behavior for jobs that do not specify a `dependencyMode`.

    Check out the [documentation](http://docs.shippable.com/platform/workflow/job/overview/#trigger-modes) for more details.

1. gcloudKey deployments use deployment objects

    - Deploy jobs deploying with gcloudKey clusters will deploy with deployment objects instead of replication controllers. Deployment names and labels generated from deploy and manifest jobs names will have invalid characters more carefully replaced or removed when using a gcloudKey or Kubernetes integration. Provision jobs for resources with gcloudKey integrations will also use kubectl commands.

1. Project history page now shows a "debug" label for debug runs

1. BitBucket Server integration now supports multiple branches in a single push
    - Earlier, when multiple branches were part of a single `git push` to BBS, only a single build would be triggered on Shippable. The BBS Integration addon has been updated to support triggering builds for the latest commit on each branch that has been pushed in a single `git push`. The latest version of the addon is now available in the Atlassian Marketplace. Please upgrade your addon to enable this feature.
----------------