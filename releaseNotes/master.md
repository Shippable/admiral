# ${RES_VER_NAME} Release Notes

## Release Date
${RES_VER_DATE}

## Features
  - **Extra billing information**: Subscription billing page now has an option to enter custom billing information. You can use this to specify tax information and billing addresses, for example, to be included on your payment receipts. See the [Subscription Billing](http://docs.shippable.com/platform/management/subscription/billing/) for more details.
  - **Improved account sync indicator**: A spinning refresh icon will appear in the sidebar next to the subscriptions header when an account is being synchronized. Accounts will be automatically synchronized after new SCM integrations are created.
  - **Improved support for recently added parameters to ECS Service and Task definition**: Parameters that were recently added by AWS to ECS Service and Task definitions such as `healthCheckGracePeriodSeconds` are now supported. 

## Fixes
  - **Subscriptions not shown when sidebar is collapsed**: When the sidebar is a collapsed state and you hover over the SCM icon, you can view all your subscriptions. This allows you to navigate to all the subscriptions in your SCM with the sidebar collapsed, improving the usability of the collapsed sidebar.
  
  - **Support single quotes in runSh jobs that run on Windows**: Single quotes can be added to the script, on_failure, always and other sections in runSh jobs. 
  
  - **Custom information as part of the invoice**: You can now add custom information as part of your invoice such as a purchase order number, or official company name.
  
  - **rSync job shows failures for a runSh job with no TASK section**: We have enhanced rSync so that it shows failures for runSh jobs defined without a TASK section.
  
  - **Occurence of an `=` character in an integration value causes runCI jobs to fail**: This bug has been fixed for runCI jobs. 

  - **System machine images can be saved in Admiral**: Users can now save System Machine Images (SMIs) in `Configure and Install` page. Admiral would earlier crash during this operation. Admiral only saves enabled services and will throw an error if updating a service fails while saving SMIs.

  - **Shippable service start error causes builds to fail if start command fails** - Builds will now fail fast if any startup services do not start successfully. Changes will go in with next drydock release.
  
  - **Early adopters can see free and paid minions in Billing page** - Free minions were not being rendered in the `Admin Add-on` section and this issue has been fixed.
  
  - **Improved error message when an incorrect ARN type is specified for an ECS loadBalancer** - The deploy job shows a descriptive error if the sourceName does not meet a certain ALB ARN pattern.

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
