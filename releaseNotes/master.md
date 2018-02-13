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
