do $$
  begin
    if not exists (select 1 from information_schema.columns where table_name = 'masterIntegrations') then
    -- This is the base table, do not add any fields here. Add them below.
      create table "masterIntegrations" (
        "id" VARCHAR(24) PRIMARY KEY NOT NULL,
        "masterIntegrationId" INT NOT NULL,
        "name" VARCHAR(80) NOT NULL,
        "type" VARCHAR(80) NOT NULL,
        "typeCode" INT NOT NULL,
        "displayName" VARCHAR(255) NOT NULL,
        "isEnabled" BOOLEAN DEFAULT false NOT NULL,
        "isDeprecated" BOOLEAN DEFAULT false NOT NULL,
        "level" VARCHAR(80) NOT NULL,
        "createdBy" VARCHAR(24) NOT NULL,
        "updatedBy" VARCHAR(24) NOT NULL,
        "createdAt" timestamp with time zone NOT NULL,
        "updatedAt" timestamp with time zone NOT NULL
      );
    end if;

    if not exists (select 1 from information_schema.columns where table_name = 'masterIntegrations' and column_name = 'isDeprecated') then
      alter table "masterIntegrations" add column "isDeprecated" BOOLEAN DEFAULT false NOT NULL;
    end if;

    -- Create indexes
    -- Add mIntmIntIdU index
    if not exists (select 1 from pg_indexes where tablename = 'masterIntegrations' and indexname = 'mIntmIntIdU') then
      create index "mIntmIntIdU" on "masterIntegrations" using btree("masterIntegrationId");
    end if;

    -- Add mIntNameTypeU index
    if not exists (select 1 from pg_indexes where tablename = 'masterIntegrations' and indexname = 'mIntNameTypeU') then
      create index "mIntNameTypeU" on "masterIntegrations" using btree("name", "type");
    end if;

    -- Create foreign key constraints

    -- Adds foreign key relationships for masterIntegrations
      if not exists (select 1 from pg_constraint where conname = 'masterIntegrations_typeCode_fkey') then
        alter table "masterIntegrations" add constraint "masterIntegrations_typeCode_fkey" foreign key ("typeCode") references "systemCodes"(code) on update restrict on delete restrict;
      end if;

    -- Insert all masterIntegrations:

    -- Docker
    if not exists (select 1 from "masterIntegrations" where "name" = 'Docker' and "typeCode" = 5001) then
      insert into "masterIntegrations" ("id", "masterIntegrationId", "name", "displayName", "type", "isEnabled", "level", "typeCode", "createdBy", "updatedBy", "createdAt", "updatedAt")
      values ('5553a7ac3566980c00a3bf0e', 2, 'Docker', 'Docker', 'hub', false, 'account', 5001, '54188262bc4d591ba438d62a', '54188262bc4d591ba438d62a', '2016-06-01', '2016-06-01');
    end if;

    -- Private Docker Registry
    if not exists (select 1 from "masterIntegrations" where "name" = 'Private Docker Registry' and "typeCode" = 5001) then
      insert into "masterIntegrations" ("id", "masterIntegrationId", "name", "displayName", "type", "isEnabled", "level", "typeCode", "createdBy", "updatedBy", "createdAt", "updatedAt")
      values ('559e8f3e90252e0c00672376', 3, 'Private Docker Registry', 'Private Docker Registry', 'hub', false, 'account', 5001, '54188262bc4d591ba438d62a', '54188262bc4d591ba438d62a', '2016-06-01', '2016-06-01');
    end if;

    -- slack
    if not exists (select 1 from "masterIntegrations" where "name" = 'Slack' and "typeCode" = 5003) then
      insert into "masterIntegrations" ("id", "masterIntegrationId", "name", "displayName", "type", "isEnabled", "level", "typeCode", "createdBy", "updatedBy", "createdAt", "updatedAt")
      values ('55bba7932c6c780b00e4426c', 4, 'Slack', 'Slack', 'notification', false, 'account', 5003, '54188262bc4d591ba438d62a', '54188262bc4d591ba438d62a', '2016-06-01', '2016-06-01');
    end if;

    -- webhook
    if not exists (select 1 from "masterIntegrations" where "name" = 'webhook' and "typeCode" = 5003) then
      insert into "masterIntegrations" ("id", "masterIntegrationId", "name", "displayName", "type", "isEnabled", "level", "typeCode", "createdBy", "updatedBy", "createdAt", "updatedAt")
      values ('573aab7c5419f10f00bef322', 5, 'webhook', 'Event Trigger', 'notification', false, 'account', 5003, '54188262bc4d591ba438d62a', '54188262bc4d591ba438d62a', '2016-06-01', '2016-06-01');
    end if;

    -- GCR
    if not exists (select 1 from "masterIntegrations" where "name" = 'GCR' and "typeCode" = 5001) then
      insert into "masterIntegrations" ("id", "masterIntegrationId", "name", "displayName", "type", "isEnabled", "level", "typeCode", "createdBy", "updatedBy", "createdAt", "updatedAt")
      values ('5553a8333566980c00a3bf1b', 6, 'GCR', 'GCR', 'hub', false, 'account', 5001, '54188262bc4d591ba438d62a', '54188262bc4d591ba438d62a', '2016-06-01', '2016-06-01');
    end if;

    -- ECR
    if not exists (select 1 from "masterIntegrations" where "name" = 'ECR' and "typeCode" = 5001) then
      insert into "masterIntegrations" ("id", "masterIntegrationId", "name", "displayName", "type", "isEnabled", "level", "typeCode", "createdBy", "updatedBy", "createdAt", "updatedAt")
      values ('5673c6561895ca4474669507', 7, 'ECR', 'Amazon ECR', 'hub', false, 'account', 5001, '54188262bc4d591ba438d62a', '54188262bc4d591ba438d62a', '2016-06-01', '2016-06-01');
    end if;

    -- AWS
    if not exists (select 1 from "masterIntegrations" where "name" = 'AWS' and "typeCode" = 5002) then
      insert into "masterIntegrations" ("id", "masterIntegrationId", "name", "displayName", "type", "isEnabled", "level", "typeCode", "createdBy", "updatedBy", "createdAt", "updatedAt")
      values ('55c8d2333399590c007982f8', 8, 'AWS', 'AWS', 'deploy', false, 'account', 5002, '54188262bc4d591ba438d62a', '54188262bc4d591ba438d62a', '2016-06-01', '2016-06-01');
    end if;

    -- AWS_IAM
    if not exists (select 1 from "masterIntegrations" where "name" = 'AWS_IAM' and "typeCode" = 5002) then
      insert into "masterIntegrations" ("id", "masterIntegrationId", "name", "displayName", "type", "isEnabled", "level", "typeCode", "createdBy", "updatedBy", "createdAt", "updatedAt")
      values ('571032a897aadea0ee186900', 9, 'AWS_IAM', 'Amazon Web Services (IAM)', 'deploy', false, 'account', 5002, '54188262bc4d591ba438d62a', '54188262bc4d591ba438d62a', '2016-06-23', '2016-06-23');
    end if;

    -- GKE
    if not exists (select 1 from "masterIntegrations" where "name" = 'GKE' and "typeCode" = 5002) then
      insert into "masterIntegrations" ("id", "masterIntegrationId", "name", "displayName", "type", "isEnabled", "level", "typeCode", "createdBy", "updatedBy", "createdAt", "updatedAt")
      values ('56d417653270aa438861cf65', 11, 'GKE', 'Google Container Engine', 'deploy', false, 'account', 5002, '54188262bc4d591ba438d62a', '54188262bc4d591ba438d62a', '2016-06-01', '2016-06-01');
    end if;

    -- DCL
    if not exists (select 1 from "masterIntegrations" where "name" = 'DCL' and "typeCode" = 5002) then
      insert into "masterIntegrations" ("id", "masterIntegrationId", "name", "displayName", "type", "isEnabled", "level", "typeCode", "createdBy", "updatedBy", "createdAt", "updatedAt")
      values ('570651b5f028a50b008bd955', 12, 'DCL', 'Docker Cloud', 'deploy', false, 'account', 5002, '54188262bc4d591ba438d62a', '54188262bc4d591ba438d62a', '2016-06-01', '2016-06-01');
    end if;

    -- ACS
    if not exists (select 1 from "masterIntegrations" where "name" = 'ACS' and "typeCode" = 5002) then
      insert into "masterIntegrations" ("id", "masterIntegrationId", "name", "displayName", "type", "isEnabled", "level", "typeCode", "createdBy", "updatedBy", "createdAt", "updatedAt")
      values ('5723561699ddf70c00be27ed', 13, 'ACS', 'Azure Container Service', 'deploy', false, 'account', 5002, '54188262bc4d591ba438d62a', '54188262bc4d591ba438d62a', '2016-06-01', '2016-06-01');
    end if;

    -- update ghe scm masterIntegration name to githubEnterprise
    if exists (select 1 from "masterIntegrations" where "name" = 'ghe' and "typeCode" = 5000) then
        update "masterIntegrations" set "name" = 'githubEnterprise' where "name" = 'ghe' and "typeCode" = 5000;
    end if;

    -- githubEnterprise SCM masterIntegration
    if not exists (select 1 from "masterIntegrations" where "name" = 'githubEnterprise' and "typeCode" = 5000) then
      insert into "masterIntegrations" ("id", "masterIntegrationId", "name", "displayName", "type", "isEnabled", "level", "typeCode", "createdBy", "updatedBy", "createdAt", "updatedAt")
      values ('563347d6046d220c002a3474', 15, 'githubEnterprise', 'Github Enterprise', 'scm', false, 'account', 5000, '54188262bc4d591ba438d62a', '54188262bc4d591ba438d62a', '2016-06-01', '2016-06-01');
    end if;

    -- bitbucket
    if not exists (select 1 from "masterIntegrations" where "name" = 'bitbucket' and "typeCode" = 5000) then
      insert into "masterIntegrations" ("id", "masterIntegrationId", "name", "displayName", "type", "isEnabled", "level", "typeCode", "createdBy", "updatedBy", "createdAt", "updatedAt")
      values ('562dc347b84b390c0083e72e', 16, 'bitbucket', 'BitBucket', 'scm', false, 'account', 5000, '54188262bc4d591ba438d62a', '54188262bc4d591ba438d62a', '2016-06-01', '2016-06-01');
    end if;

    -- Email
    if not exists (select 1 from "masterIntegrations" where "name" = 'Email' and "typeCode" = 5003) then
      insert into "masterIntegrations" ("id", "masterIntegrationId", "name", "displayName", "type", "isEnabled", "level", "typeCode", "createdBy", "updatedBy", "createdAt", "updatedAt")
      values ('55816ffb4d96360c000ec6f3', 18, 'Email', 'Email', 'notification', false, 'account', 5003, '54188262bc4d591ba438d62a', '54188262bc4d591ba438d62a', '2016-06-01', '2016-06-01');
    end if;

    -- Quay.io
    if not exists (select 1 from "masterIntegrations" where "name" = 'Quay.io' and "typeCode" = 5001) then
      insert into "masterIntegrations" ("id", "masterIntegrationId", "name", "displayName", "type", "isEnabled", "level", "typeCode", "createdBy", "updatedBy", "createdAt", "updatedAt")
      values ('559eab320a31140d00a15d3a', 19, 'Quay.io', 'Quay.io', 'hub', false, 'account', 5001, '54188262bc4d591ba438d62a', '54188262bc4d591ba438d62a', '2016-06-01', '2016-06-01');
    end if;

    -- github
    if not exists (select 1 from "masterIntegrations" where "name" = 'github' and "typeCode" = 5000) then
      insert into "masterIntegrations" ("id", "masterIntegrationId", "name", "displayName", "type", "isEnabled", "level", "typeCode", "createdBy", "updatedBy", "createdAt", "updatedAt")
      values ('562dc2f048095b0d00ceebcd', 20, 'github', 'GitHub', 'scm', false, 'account', 5000, '54188262bc4d591ba438d62a', '54188262bc4d591ba438d62a', '2016-06-01', '2016-06-01');
    end if;

    -- gitlab
    if not exists (select 1 from "masterIntegrations" where "name" = 'gitlab' and "typeCode" = 5000) then
      insert into "masterIntegrations" ("id", "masterIntegrationId", "name", "displayName", "type", "isEnabled", "level", "typeCode", "createdBy", "updatedBy", "createdAt", "updatedAt")
      values ('5728e13b3d93990c000fd8e4', 21, 'gitlab', 'GitLab', 'scm', false, 'account', 5000,'54188262bc4d591ba438d62a', '54188262bc4d591ba438d62a', '2016-06-01', '2016-06-01');
    end if;

    -- bitbucketServer
    if not exists (select 1 from "masterIntegrations" where "name" = 'bitbucketServer' and "typeCode" = 5000) then
      insert into "masterIntegrations" ("id", "masterIntegrationId", "name", "displayName", "type", "isEnabled", "level", "typeCode", "createdBy", "updatedBy", "createdAt", "updatedAt")
      values ('572af430ead9631100f7f64d', 22, 'bitbucketServer', 'BitBucket Server', 'scm', false, 'account', 5000, '54188262bc4d591ba438d62a', '54188262bc4d591ba438d62a', '2016-06-01', '2016-06-01');
    end if;

    -- ssh-key
    if not exists (select 1 from "masterIntegrations" where "name" = 'ssh-key' and "typeCode" = 5004) then
      insert into "masterIntegrations" ("id", "masterIntegrationId", "name", "displayName", "type", "isEnabled", "level", "typeCode", "createdBy", "updatedBy", "createdAt", "updatedAt")
      values ('568aa7c3368a090c006da702', 23, 'ssh-key', 'SSH Key', 'key', false, 'account', 5004, '54188262bc4d591ba438d62a', '54188262bc4d591ba438d62a', '2016-06-01', '2016-06-01');
    end if;

    -- pem-key
    if not exists (select 1 from "masterIntegrations" where "name" = 'pem-key' and "typeCode" = 5004) then
      insert into "masterIntegrations" ("id", "masterIntegrationId", "name", "displayName", "type", "isEnabled", "level", "typeCode", "createdBy", "updatedBy", "createdAt", "updatedAt")
      values ('568aa74cd43b0d0c004fec91', 24, 'pem-key', 'PEM Key', 'key', false, 'account', 5004, '54188262bc4d591ba438d62a', '54188262bc4d591ba438d62a', '2016-06-01', '2016-06-01');
    end if;

    -- hipchat
    if not exists (select 1 from "masterIntegrations" where "name" = 'hipchat' and "typeCode" = 5003) then
      insert into "masterIntegrations" ("id", "masterIntegrationId", "name", "displayName", "type", "isEnabled", "level", "typeCode", "createdBy", "updatedBy", "createdAt", "updatedAt")
      values ('56fb978f1cc7210f00bd5e72', 25, 'hipchat', 'HipChat', 'notification', false, 'account', 5003, '54188262bc4d591ba438d62a', '54188262bc4d591ba438d62a', '2016-06-01', '2016-06-01');
    end if;

    -- Docker Trusted Registry
    if not exists (select 1 from "masterIntegrations" where "name" = 'Docker Trusted Registry' and "typeCode" = 5001) then
      insert into "masterIntegrations" ("id", "masterIntegrationId", "name", "displayName", "type", "isEnabled", "level", "typeCode", "createdBy", "updatedBy", "createdAt", "updatedAt")
      values ('57110b987ed9d269c9d71ac1', 26, 'Docker Trusted Registry', 'Docker Trusted Registry', 'hub', false, 'account', 5001, '54188262bc4d591ba438d62a', '54188262bc4d591ba438d62a', '2016-06-01', '2016-06-01');
    end if;

    -- DDC
    if not exists (select 1 from "masterIntegrations" where "name" = 'DDC' and "typeCode" = 5002) then
      insert into "masterIntegrations" ("id", "masterIntegrationId", "name", "displayName", "type", "isEnabled", "level", "typeCode", "createdBy", "updatedBy", "createdAt", "updatedAt")
      values ('571f081b37803a0d00455d25', 27, 'DDC', 'Docker DataCenter', 'deploy', false, 'account', 5002, '54188262bc4d591ba438d62a', '54188262bc4d591ba438d62a', '2016-06-01', '2016-06-01');
    end if;

    -- TRIPUB
    if not exists (select 1 from "masterIntegrations" where "name" = 'TRIPUB' and "typeCode" = 5002) then
      insert into "masterIntegrations" ("id", "masterIntegrationId", "name", "displayName", "type", "isEnabled", "level", "typeCode", "createdBy", "updatedBy", "createdAt", "updatedAt")
      values ('576ce63321333398d11a35ab', 28, 'TRIPUB', 'Joyent Triton Public Cloud ', 'deploy', false, 'account', 5002, '54188262bc4d591ba438d62a', '54188262bc4d591ba438d62a', '2016-06-01', '2016-06-01');
    end if;

    -- JENKINS
    if not exists (select 1 from "masterIntegrations" where "name" = 'Jenkins' and "typeCode" = 5009) then
      insert into "masterIntegrations" ("id", "masterIntegrationId", "name", "displayName", "type", "isEnabled", "level", "typeCode", "createdBy", "updatedBy", "createdAt", "updatedAt")
      values ('57dbab5d15c59206bf4fbb50', 37, 'Jenkins', 'Jenkins', 'externalci', false, 'account', 5009, '54188262bc4d591ba438d62a', '54188262bc4d591ba438d62a', '2016-06-01', '2016-06-01');
    end if;

    --- Deprecate Jenkins integration
    if exists (select 1 from "masterIntegrations" where "name" = 'Jenkins' and "typeCode" = 5009 and "isDeprecated" = false) then
      update "masterIntegrations" set "isDeprecated" = true where "name" = 'Jenkins' and "typeCode" = 5009;
    end if;

    -- artifactory
    if not exists (select 1 from "masterIntegrations" where "name" = 'artifactory' and "typeCode" = 5001) then
      insert into "masterIntegrations" ("id", "masterIntegrationId", "name", "displayName", "type", "isEnabled", "level", "typeCode", "createdBy", "updatedBy", "createdAt", "updatedAt")
      values ('57dbab5d15c59206bf4fbb51', 38, 'artifactory', 'JFrog Artifactory', 'hub', false, 'account', 5001, '54188262bc4d591ba438d62a', '54188262bc4d591ba438d62a', '2016-06-01', '2016-06-01');
    end if;

    -- CLUSTER
    if not exists (select 1 from "masterIntegrations" where "name" = 'CLUSTER' and "typeCode" = 5002) then
      insert into "masterIntegrations" ("id", "masterIntegrationId", "name", "displayName", "type", "isEnabled", "level", "typeCode", "createdBy", "updatedBy", "createdAt", "updatedAt")
      values ('576ce63321333398d11a35ac', 39, 'CLUSTER', 'Node Cluster', 'deploy', false, 'account', 5002, '54188262bc4d591ba438d62a', '54188262bc4d591ba438d62a', '2016-06-01', '2016-06-01');
    end if;

    -- irc
    if not exists (select 1 from "masterIntegrations" where "name" = 'irc' and "typeCode" = 5003) then
      insert into "masterIntegrations" ("id", "masterIntegrationId", "name", "displayName", "type", "isEnabled", "level", "typeCode", "createdBy", "updatedBy", "createdAt", "updatedAt")
      values ('57e8ea9c14d3ef88e56fecb6', 44, 'irc', 'irc', 'notification', false, 'account', 5003, '54188262bc4d591ba438d62a', '54188262bc4d591ba438d62a', '2016-06-01', '2016-06-01');
    end if;

    -- kubernetes
    if not exists (select 1 from "masterIntegrations" where "name" = 'KUBERNETES' and "typeCode" = 5002) then
      insert into "masterIntegrations" ("id", "masterIntegrationId", "name", "displayName", "type", "isEnabled", "level", "typeCode", "createdBy", "updatedBy", "createdAt", "updatedAt")
      values ('5811a2e9e73d22829eb0ab3d', 45, 'KUBERNETES', 'Kubernetes', 'deploy', false, 'account', 5002, '54188262bc4d591ba438d62a', '54188262bc4d591ba438d62a', '2016-06-01', '2016-06-01');
    end if;

    -- amazonKeys masterIntegration
    if not exists (select 1 from "masterIntegrations" where "name" = 'amazonKeys' and "typeCode" = 5012) then
      insert into "masterIntegrations" ("id", "masterIntegrationId", "name", "displayName", "type", "isEnabled", "level", "typeCode", "createdBy", "updatedBy", "createdAt", "updatedAt")
      values ('57467326b3cbfc0c004f9111', 46, 'amazonKeys', 'AWS Keys', 'generic', false, 'generic', 5012, '54188262bc4d591ba438d62a', '54188262bc4d591ba438d62a', '2016-06-01', '2016-06-01');
    end if;

    -- Alter displayName of amazonKeys integration from Amazon Keys to AWS Keys.
    if exists (select 1 from "masterIntegrations" where "id" = '57467326b3cbfc0c004f9111' and "displayName" = 'Amazon Keys') then
      update "masterIntegrations" set "displayName" = 'AWS Keys' where "id" = '57467326b3cbfc0c004f9111';
    end if;

    -- gitlabCreds masterIntegration
    if not exists (select 1 from "masterIntegrations" where "name" = 'gitlabCreds' and "typeCode" = 5012) then
      insert into "masterIntegrations" ("id", "masterIntegrationId", "name", "displayName", "type", "isEnabled", "level", "typeCode", "createdBy", "updatedBy", "createdAt", "updatedAt")
      values ('574ee696d49b091400b71112', 47, 'gitlabCreds', 'GitLab Credentials', 'generic', false, 'generic', 5012, '54188262bc4d591ba438d62a', '54188262bc4d591ba438d62a', '2016-06-01', '2016-06-01');
    end if;

    -- mailgunCreds masterIntegration
    if not exists (select 1 from "masterIntegrations" where "name" = 'mailgunCreds' and "typeCode" = 5012) then
      insert into "masterIntegrations" ("id", "masterIntegrationId", "name", "displayName", "type", "isEnabled", "level", "typeCode", "createdBy", "updatedBy", "createdAt", "updatedAt")
      values ('57e8ea91424bff9c871d7113', 48, 'mailgunCreds', 'Mailgun Credentials', 'generic', false, 'generic', 5012, '54188262bc4d591ba438d62a', '54188262bc4d591ba438d62a', '2016-06-01', '2016-06-01');
    end if;

    -- gmailCreds masterIntegration
    if not exists (select 1 from "masterIntegrations" where "name" = 'gmailCreds' and "typeCode" = 5012) then
      insert into "masterIntegrations" ("id", "masterIntegrationId", "name", "displayName", "type", "isEnabled", "level", "typeCode", "createdBy", "updatedBy", "createdAt", "updatedAt")
      values ('57e8ea9c14d3ef88e56f1114', 49, 'gmailCreds', 'Gmail Credentials', 'generic', false, 'generic', 5012, '54188262bc4d591ba438d62a', '54188262bc4d591ba438d62a', '2016-06-01', '2016-06-01');
    end if;

    -- smtpCreds masterintegration
    if not exists (select 1 from "masterIntegrations" where "name" = 'smtpCreds' and "typeCode" = 5012) then
      insert into "masterIntegrations" ("id", "masterIntegrationId", "name", "displayName", "type", "isEnabled", "level", "typeCode", "createdBy", "updatedBy", "createdAt", "updatedAt")
      values ('57cea8056ce9c71800d31115', 50, 'smtpCreds', 'SMTP Credentials', 'generic', false, 'generic', 5012, '54188262bc4d591ba438d62a', '54188262bc4d591ba438d62a', '2016-06-01', '2016-06-01');
    end if;

    -- braintreeKeys masterintegration
    if not exists (select 1 from "masterIntegrations" where "name" = 'braintreeKeys' and "typeCode" = 5012) then
      insert into "masterIntegrations" ("id", "masterIntegrationId", "name", "displayName", "type", "isEnabled", "level", "typeCode", "createdBy", "updatedBy", "createdAt", "updatedAt")
      values ('57aafd0673ea26cb053f1116', 51, 'braintreeKeys', 'Braintree Keys', 'generic', false, 'generic', 5012, '54188262bc4d591ba438d62a', '54188262bc4d591ba438d62a', '2016-06-01', '2016-06-01');
    end if;

    -- githubKeys master integration
    if not exists (select 1 from "masterIntegrations" where "name" = 'githubKeys' and "typeCode" = 5012) then
      insert into "masterIntegrations" ("id", "masterIntegrationId", "name", "displayName", "type", "isEnabled", "level", "typeCode", "createdBy", "updatedBy", "createdAt", "updatedAt")
      values ('577de63321333398d11a1117', 52, 'githubKeys', 'Github Keys', 'generic', false, 'generic', 5012, '54188262bc4d591ba438d62a', '54188262bc4d591ba438d62a', '2016-06-01', '2016-06-01');
    end if;

    -- bitbucketKeys
    if not exists (select 1 from "masterIntegrations" where "name" = 'bitbucketKeys' and "typeCode" = 5012) then
      insert into "masterIntegrations" ("id", "masterIntegrationId", "name", "displayName", "type", "isEnabled", "level", "typeCode", "createdBy", "updatedBy", "createdAt", "updatedAt")
      values ('577de63321333398d11a1118', 53, 'bitbucketKeys', 'Bitbucket Keys', 'generic', false, 'generic', 5012, '54188262bc4d591ba438d62a', '54188262bc4d591ba438d62a', '2016-06-01', '2016-06-01');
    end if;

    -- update bitbucketserverKeys to bitbucketServerKeys
    if exists (select 1 from "masterIntegrations" where "name" = 'bitbucketserverKeys' and "typeCode" = 5012) then
        update "masterIntegrations" set "name" = 'bitbucketServerKeys' where "name" = 'bitbucketserverKeys' and "typeCode" = 5012;
    end if;

    -- bitbucketServerKeys master integration
    if not exists (select 1 from "masterIntegrations" where "name" = 'bitbucketServerKeys' and "typeCode" = 5012) then
      insert into "masterIntegrations" ("id", "masterIntegrationId", "name", "displayName", "type", "isEnabled", "level", "typeCode", "createdBy", "updatedBy", "createdAt", "updatedAt")
      values ('577de63321333398d11a1119', 54, 'bitbucketServerKeys', 'Bitbucket Server Keys', 'generic', false, 'generic', 5012, '54188262bc4d591ba438d62a', '54188262bc4d591ba438d62a', '2016-06-01', '2016-06-01');
    end if;

    -- update githubenterpriseKeys to githubEnterpriseKeys
    if exists (select 1 from "masterIntegrations" where "name" = 'githubenterpriseKeys' and "typeCode" = 5012) then
        update "masterIntegrations" set "name" = 'githubEnterpriseKeys' where "name" = 'githubenterpriseKeys' and "typeCode" = 5012;
    end if;

    -- githubEnterpriseKeys master integration
    if not exists (select 1 from "masterIntegrations" where "name" = 'githubEnterpriseKeys' and "typeCode" = 5012) then
      insert into "masterIntegrations" ("id", "masterIntegrationId", "name", "displayName", "type", "isEnabled", "level", "typeCode", "createdBy", "updatedBy", "createdAt", "updatedAt")
      values ('507f1f77bcf86cd799431120', 55, 'githubEnterpriseKeys', 'Github Enterprise Keys', 'generic', false, 'generic', 5012, '54188262bc4d591ba438d62a', '54188262bc4d591ba438d62a', '2016-06-01', '2016-06-01');
    end if;

    -- hubspotToken master integration
    if not exists (select 1 from "masterIntegrations" where "name" = 'hubspotToken' and "typeCode" = 5012) then
      insert into "masterIntegrations" ("id", "masterIntegrationId", "name", "displayName", "type", "isEnabled", "level", "typeCode", "createdBy", "updatedBy", "createdAt", "updatedAt")
      values ('5811a2e9e73d22829eb01121', 56, 'hubspotToken', 'Hubspot Token', 'generic', false, 'generic', 5012, '54188262bc4d591ba438d62a', '54188262bc4d591ba438d62a', '2016-06-01', '2016-06-01');
    end if;

    -- Azure_DCOS master integration
    if not exists (select 1 from "masterIntegrations" where "name" = 'AZURE_DCOS' and "typeCode" = 5002) then
      insert into "masterIntegrations" ("id", "masterIntegrationId", "name", "displayName", "type", "isEnabled", "level", "typeCode", "createdBy", "updatedBy", "createdAt", "updatedAt")
      values ('58ecb1a8f318373d7f5645f4', 64, 'AZURE_DCOS', 'Azure DC/OS', 'deploy', false, 'account', 5002, '54188262bc4d591ba438d62a', '54188262bc4d591ba438d62a', '2016-06-01', '2016-06-01');
    end if;

    -- gitlabKeys master integration
    if not exists (select 1 from "masterIntegrations" where "name" = 'gitlabKeys' and "typeCode" = 5012) then
      insert into "masterIntegrations" ("id", "masterIntegrationId", "name", "displayName", "type", "isEnabled", "level", "typeCode", "createdBy", "updatedBy", "createdAt", "updatedAt")
      values ('58a160e8c2845c9d5fb82041', 61, 'gitlabKeys', 'GitLab Keys', 'generic', false, 'generic', 5012, '54188262bc4d591ba438d62a', '54188262bc4d591ba438d62a', '2017-02-13', '2017-02-13');
    end if;

    -- keyValuePair master integration
    if not exists (select 1 from "masterIntegrations" where "name" = 'keyValuePair' and "typeCode" = 5012) then
      insert into "masterIntegrations" ("id", "masterIntegrationId", "name", "displayName", "type", "isEnabled", "level", "typeCode", "createdBy", "updatedBy", "createdAt", "updatedAt")
      values ('58a160e8c2845c9d5fb82042', 63, 'keyValuePair', 'Key-Value pair', 'generic', false, 'generic', 5012, '54188262bc4d591ba438d62a', '54188262bc4d591ba438d62a', '2017-02-13', '2017-02-13');
    end if;

    -- Google Cloud master integration
    if not exists (select 1 from "masterIntegrations" where "name" = 'GCL' and "typeCode" = 5012) then
      insert into "masterIntegrations" ("id", "masterIntegrationId", "name", "displayName", "type", "isEnabled", "level", "typeCode", "createdBy", "updatedBy", "createdAt", "updatedAt")
      values ('58ecb1a8f318373d7f5645f5', 65, 'GCL', 'Google Cloud', 'generic', false, 'account', 5012, '54188262bc4d591ba438d62a', '54188262bc4d591ba438d62a', '2016-06-01', '2016-06-01');
    end if;

    -- Microsoft Azure master integration
    if not exists (select 1 from "masterIntegrations" where "name" = 'MAZ' and "typeCode" = 5012) then
      insert into "masterIntegrations" ("id", "masterIntegrationId", "name", "displayName", "type", "isEnabled", "level", "typeCode", "createdBy", "updatedBy", "createdAt", "updatedAt")
      values ('58ecb1a8f318373d7f5645f6', 66, 'MAZ', 'Microsoft Azure', 'generic', false, 'account', 5012, '54188262bc4d591ba438d62a', '54188262bc4d591ba438d62a', '2016-06-01', '2016-06-01');
    end if;

    -- Digital Ocean master integration
    if not exists (select 1 from "masterIntegrations" where "name" = 'DOC' and "typeCode" = 5012) then
      insert into "masterIntegrations" ("id", "masterIntegrationId", "name", "displayName", "type", "isEnabled", "level", "typeCode", "createdBy", "updatedBy", "createdAt", "updatedAt")
      values ('58ecb1a8f318373d7f5645f7', 67, 'DOC', 'Digital Ocean', 'generic', false, 'account', 5012, '54188262bc4d591ba438d62a', '54188262bc4d591ba438d62a', '2016-06-01', '2016-06-01');
    end if;

    -- these masterIntegrations (rabbitmq, and url) are not in base

    -- rabbitmq master integration
    if not exists (select 1 from "masterIntegrations" where "name" = 'rabbitmqCreds' and "typeCode" = 5012) then
      insert into "masterIntegrations" ("id", "masterIntegrationId", "name", "displayName", "type", "isEnabled", "level", "typeCode", "createdBy", "updatedBy", "createdAt", "updatedAt")
      values ('589528a99ce3dd1000a94b06', 68, 'rabbitmqCreds', 'RabbitMQ Credentials', 'generic', false, 'generic', 5012, '54188262bc4d591ba438d62a', '54188262bc4d591ba438d62a', '2016-06-01', '2016-06-01');
    end if;

    -- url master integration
    if not exists (select 1 from "masterIntegrations" where "name" = 'url' and "typeCode" = 5012) then
      insert into "masterIntegrations" ("id", "masterIntegrationId", "name", "displayName", "type", "isEnabled", "level", "typeCode", "createdBy", "updatedBy", "createdAt", "updatedAt")
      values ('589528aa9ce3dd1000a94b1c', 69, 'url', 'url', 'generic', false, 'generic', 5012, '54188262bc4d591ba438d62a', '54188262bc4d591ba438d62a', '2016-06-01', '2016-06-01');
    end if;

    -- Add Git Credential integration
    if not exists (select 1 from "masterIntegrations" where "name" = 'gitCredential' and "typeCode" = 5012) then
      insert into "masterIntegrations" ("id", "masterIntegrationId", "name", "displayName", "type", "isEnabled", "level", "typeCode", "createdBy", "updatedBy", "createdAt", "updatedAt")
      values ('596d9b49fa1a3f979c10b5a5', 70, 'gitCredential', 'Git Credential', 'generic', false, 'account', 5012, '54188262bc4d591ba438d62a', '54188262bc4d591ba438d62a', '2016-06-01', '2016-06-01');
    end if;

    -- Add sshKey integration
    if not exists (select 1 from "masterIntegrations" where "name" = 'sshKey' and "typeCode" = 5012) then
      insert into "masterIntegrations" ("id", "masterIntegrationId", "name", "displayName", "type", "isEnabled", "level", "typeCode", "createdBy", "updatedBy", "createdAt", "updatedAt")
      values ('596d9b49fa1a3f979c10b5a6', 71, 'sshKey', 'SSH Key', 'generic', false, 'account', 5012, '54188262bc4d591ba438d62a', '54188262bc4d591ba438d62a', '2016-06-01', '2016-06-01');
    end if;

    -- Add pemKey integration
    if not exists (select 1 from "masterIntegrations" where "name" = 'pemKey' and "typeCode" = 5012) then
      insert into "masterIntegrations" ("id", "masterIntegrationId", "name", "displayName", "type", "isEnabled", "level", "typeCode", "createdBy", "updatedBy", "createdAt", "updatedAt")
      values ('59d3692f0c3f421becfae3f0', 72, 'pemKey', 'PEM Key', 'generic', false, 'account', 5012, '54188262bc4d591ba438d62a', '54188262bc4d591ba438d62a', '2016-06-01', '2016-06-01');
    end if;

    -- adds artifactoryKey integration
    if not exists (select 1 from "masterIntegrations" where "name" = 'artifactoryKey' and "typeCode" = 5012) then
      insert into "masterIntegrations" ("id", "masterIntegrationId", "name", "displayName", "type", "isEnabled", "level", "typeCode", "createdBy", "updatedBy", "createdAt", "updatedAt")
      values ('596d9b49fa1a3f979c10b5a7', 73, 'artifactoryKey', 'JFrog Artifactory', 'generic', false, 'account', 5012, '54188262bc4d591ba438d62a', '54188262bc4d591ba438d62a', '2016-06-01', '2016-06-01');
    end if;

    -- adds quayLogin integration
    if not exists (select 1 from "masterIntegrations" where "name" = 'quayLogin' and "typeCode" = 5012) then
      insert into "masterIntegrations" ("id", "masterIntegrationId", "name", "displayName", "type", "isEnabled", "level", "typeCode", "createdBy", "updatedBy", "createdAt", "updatedAt")
      values ('580ee981a337bd12008fc43f', 74, 'quayLogin', 'Quay.io', 'generic', false, 'account', 5012, '54188262bc4d591ba438d62a', '54188262bc4d591ba438d62a', '2017-10-04', '2017-10-04');
    end if;

    -- adds hipchatKey integration
    if not exists (select 1 from "masterIntegrations" where "name" = 'hipchatKey' and "typeCode" = 5012) then
      insert into "masterIntegrations" ("id", "masterIntegrationId", "name", "displayName", "type", "isEnabled", "level", "typeCode", "createdBy", "updatedBy", "createdAt", "updatedAt")
      values ('59df56e9b3a7f6d8361c226a', 75, 'hipchatKey', 'HipChat', 'generic', false, 'account', 5012, '54188262bc4d591ba438d62a', '54188262bc4d591ba438d62a', '2017-10-12', '2017-10-12');
    end if;

    -- adds gcloudKey integration
    if not exists (select 1 from "masterIntegrations" where "name" = 'gcloudKey' and "typeCode" = 5012) then
      insert into "masterIntegrations" ("id", "masterIntegrationId", "name", "displayName", "type", "isEnabled", "level", "typeCode", "createdBy", "updatedBy", "createdAt", "updatedAt")
      values ('59df35075ece921592b443f6', 76, 'gcloudKey', 'Google Cloud', 'generic', false, 'account', 5012, '54188262bc4d591ba438d62a', '54188262bc4d591ba438d62a', '2017-10-04', '2017-10-04');
    end if;

    -- adds dockerRegistryLogin integration
    if not exists (select 1 from "masterIntegrations" where "name" = 'dockerRegistryLogin' and "typeCode" = 5012) then
      insert into "masterIntegrations" ("id", "masterIntegrationId", "name", "displayName", "type", "isEnabled", "level", "typeCode", "createdBy", "updatedBy", "createdAt", "updatedAt")
      values ('59d5e0104bfbba06001df4d6', 77, 'dockerRegistryLogin', 'Docker Registry', 'generic', false, 'account', 5012, '54188262bc4d591ba438d62a', '54188262bc4d591ba438d62a', '2017-10-13', '2017-10-13');
    end if;

    -- adds slackkey integration
    if not exists (select 1 from "masterIntegrations" where "name" = 'slackKey' and "typeCode" = 5012) then
      insert into "masterIntegrations" ("id", "masterIntegrationId", "name", "displayName", "type", "isEnabled", "level", "typeCode", "createdBy", "updatedBy", "createdAt", "updatedAt")
      values ('59eee00ef7bcf03ff7b62fc7', 78, 'slackKey', 'Slack', 'generic', false, 'account', 5012, '54188262bc4d591ba438d62a', '54188262bc4d591ba438d62a', '2017-10-24', '2017-10-24');
    end if;

    -- adds nodeCluster integration
    if not exists (select 1 from "masterIntegrations" where "name" = 'nodeCluster' and "typeCode" = 5012) then
      insert into "masterIntegrations" ("id", "masterIntegrationId", "name", "displayName", "type", "isEnabled", "level", "typeCode", "createdBy", "updatedBy", "createdAt", "updatedAt")
      values ('59eee00ef7bcf03ff7b62fc8', 79, 'nodeCluster', 'Node Cluster', 'generic', false, 'account', 5012, '54188262bc4d591ba438d62a', '54188262bc4d591ba438d62a', '2017-10-25', '2017-10-25');
    end if;

    -- azureDcosKey master integration
    if not exists (select 1 from "masterIntegrations" where "name" = 'azureDcosKey' and "typeCode" = 5012) then
      insert into "masterIntegrations" ("id", "masterIntegrationId", "name", "displayName", "type", "isEnabled", "level", "typeCode", "createdBy", "updatedBy", "createdAt", "updatedAt")
      values ('59eee00ef7bcf03ff7b62fc9', 80, 'azureDcosKey', 'Azure DC/OS', 'generic', false, 'account', 5012, '54188262bc4d591ba438d62a', '54188262bc4d591ba438d62a', '2017-10-31', '2017-10-31');
    end if;

    -- amazonIamRole master integration
    if not exists (select 1 from "masterIntegrations" where "name" = 'amazonIamRole' and "typeCode" = 5012) then
      insert into "masterIntegrations" ("id", "masterIntegrationId", "name", "displayName", "type", "isEnabled", "level", "typeCode", "createdBy", "updatedBy", "createdAt", "updatedAt")
      values ('59eee00ef7bcf03ff7b62fd0', 81, 'amazonIamRole', 'AWS IAM', 'generic', false, 'account', 5012, '54188262bc4d591ba438d62a', '54188262bc4d591ba438d62a', '2017-10-31', '2017-10-31');
    end if;

    -- ddcKey master integration
    if not exists (select 1 from "masterIntegrations" where "name" = 'ddcKey' and "typeCode" = 5012) then
      insert into "masterIntegrations" ("id", "masterIntegrationId", "name", "displayName", "type", "isEnabled", "level", "typeCode", "createdBy", "updatedBy", "createdAt", "updatedAt")
      values ('59e71aa80552d20500e76ba8', 82, 'ddcKey', 'Docker DataCenter', 'generic', false, 'account', 5012, '54188262bc4d591ba438d62a', '54188262bc4d591ba438d62a', '2017-10-31', '2017-10-31');
    end if;

    -- webhookV2
    if not exists (select 1 from "masterIntegrations" where "name" = 'webhookV2' and "typeCode" = 5012) then
      insert into "masterIntegrations" ("id", "masterIntegrationId", "name", "displayName", "type", "isEnabled", "level", "typeCode", "createdBy", "updatedBy", "createdAt", "updatedAt")
      values ('59e71aa80552d20500e76ba9', 83, 'webhookV2', 'Webhook', 'generic', false, 'account', 5012, '54188262bc4d591ba438d62a', '54188262bc4d591ba438d62a', '2017-11-03', '2017-11-03');
    end if;

    -- adds dclKey master integration
    if not exists (select 1 from "masterIntegrations" where "name" = 'dclKey' and "typeCode" = 5012) then
      insert into "masterIntegrations" ("id", "masterIntegrationId", "name", "displayName", "type", "isEnabled", "level", "typeCode", "createdBy", "updatedBy", "createdAt", "updatedAt")
      values ('59faf7b67fb80d78e55245bb', 84, 'dclKey', 'Docker Cloud', 'generic', false, 'account', 5012, '54188262bc4d591ba438d62a', '54188262bc4d591ba438d62a', '2017-10-31', '2017-10-31');
    end if;

    -- joyentTritonKey master integration
    if not exists (select 1 from "masterIntegrations" where "name" = 'joyentTritonKey' and "typeCode" = 5012) then
      insert into "masterIntegrations" ("id", "masterIntegrationId", "name", "displayName", "type", "isEnabled", "level", "typeCode", "createdBy", "updatedBy", "createdAt", "updatedAt")
      values ('569cd11a1895ca4474700f95', 85, 'joyentTritonKey', 'Joyent Triton', 'generic', false, 'account', 5012, '54188262bc4d591ba438d62a', '54188262bc4d591ba438d62a', '2017-11-03', '2017-11-03');
    end if;

    -- adds kubernetesConfig master integration
    if not exists (select 1 from "masterIntegrations" where "name" = 'kubernetesConfig' and "typeCode" = 5012) then
      insert into "masterIntegrations" ("id", "masterIntegrationId", "name", "displayName", "type", "isEnabled", "level", "typeCode", "createdBy", "updatedBy", "createdAt", "updatedAt")
      values ('59e71aa80552d20500e76bb0', 86, 'kubernetesConfig', 'Kubernetes', 'generic', false, 'account', 5012, '54188262bc4d591ba438d62a', '54188262bc4d591ba438d62a', '2017-11-03', '2017-11-03');
    end if;

    -- END adding master integrations

    -- Remove masterIntegrations

    -- Remove amazons3 masterIntegration
    delete from "masterIntegrations" where "typeCode" = 5005 and "name" = 'amazons3';

    -- Remove vault masterIntegration
    delete from "masterIntegrations" where "typeCode" = 5006 and "name" = 'VAULT';

    -- Remove S3 artifacts masterIntegration
    if exists (select 1 from information_schema.columns where table_name = 'masterIntegrations') then
      delete from "masterIntegrations" where "typeCode" = 5010 and "name" = 'S3';
    end if;

    -- Remove segmentKeys from masterIntegrations
    if exists (select 1 from "masterIntegrations" where "name" = 'segmentKeys' and "id" = '58be812395141b7ad115b909') then
      delete from "masterIntegrations" where "name" = 'segmentKeys' and "id" = '58be812395141b7ad115b909';
    end if;

    -- remove master integration for clearbitKeys
    if exists (select 1 from "masterIntegrations" where "name" = 'clearbitKeys' and "id" = '58c78481e34468d32114e125') then
      delete from "masterIntegrations" where "id"= '58c78481e34468d32114e125';
    end if;

    -- remove master integration for name AWS and type cloudproviders
    if exists (select 1 from "masterIntegrations" where "name" = 'AWS' and "type" = 'cloudproviders' and "id" = '57467326b3cbfc0c004f9110') then
      delete from "masterIntegrations" where "name" = 'AWS' and "type" = 'cloudproviders' and "id" = '57467326b3cbfc0c004f9110';
    end if;

    -- END removing masterIntegrations

    -- Update integrations

    -- update Git Store integration type
    update "masterIntegrations" set "level" = 'system' where "masterIntegrationId" = 1 and "name" = 'Git store' and type = 'scm';

    --- Deprecate AWS deploy integration
    if exists (select 1 from "masterIntegrations" where "name" = 'AWS' and "typeCode" = 5002 and "isDeprecated" = false) then
      update "masterIntegrations" set "isDeprecated" = true where "name" = 'AWS' and "typeCode" = 5002;
    end if;

    --- Deprecate Amazon ECR hub integration
    if exists (select 1 from "masterIntegrations" where "name" = 'ECR' and "typeCode" = 5001 and "isDeprecated" = false) then
      update "masterIntegrations" set "isDeprecated" = true where "name" = 'ECR' and "typeCode" = 5001;
    end if;

    --- Deprecate pem-key integration
    if exists (select 1 from "masterIntegrations" where "name" = 'pem-key' and "typeCode" = 5004 and "isDeprecated" = false) then
      update "masterIntegrations" set "isDeprecated" = true where "name" = 'pem-key' and "typeCode" = 5004;
    end if;

    --- Deprecate artifactory integration
    if exists (select 1 from "masterIntegrations" where "name" = 'artifactory' and "typeCode" = 5001 and "isDeprecated" = false) then
      update "masterIntegrations" set "isDeprecated" = true where "name" = 'artifactory' and "typeCode" = 5001;
    end if;

    --- Deprecate Quay.io integration
    if exists (select 1 from "masterIntegrations" where "name" = 'Quay.io' and "typeCode" = 5001 and "isDeprecated" = false) then
      update "masterIntegrations" set "isDeprecated" = true where "name" = 'Quay.io' and "typeCode" = 5001;
    end if;

    --- Deprecate ssh-key integration
    if exists (select 1 from "masterIntegrations" where "name" = 'ssh-key' and "typeCode" = 5004 and "isDeprecated" = false) then
      update "masterIntegrations" set "isDeprecated" = true where "name" = 'ssh-key' and "typeCode" = 5004;
    end if;

    --- Deprecate email integration
    if exists (select 1 from "masterIntegrations" where "name" = 'Email' and "typeCode" = 5003 and "isDeprecated" = false) then
      update "masterIntegrations" set "isDeprecated" = true where "name" = 'Email' and "typeCode" = 5003;
    end if;

    --- Deprecate irc integration
    if exists (select 1 from "masterIntegrations" where "name" = 'irc' and "typeCode" = 5003 and "isDeprecated" = false) then
      update "masterIntegrations" set "isDeprecated" = true where "name" = 'irc' and "typeCode" = 5003;
    end if;

    --- Deprecate hipchat integration
    if exists (select 1 from "masterIntegrations" where "name" = 'hipchat' and "typeCode" = 5003 and "isDeprecated" = false) then
      update "masterIntegrations" set "isDeprecated" = true where "name" = 'hipchat' and "typeCode" = 5003;
    end if;

    --- Deprecate Private Docker Registry integration
    if exists (select 1 from "masterIntegrations" where "name" = 'Private Docker Registry' and "typeCode" = 5001 and "isDeprecated" = false) then
      update "masterIntegrations" set "isDeprecated" = true where "name" = 'Private Docker Registry' and "typeCode" = 5001;
    end if;

    --- Deprecate docker integration
    if exists (select 1 from "masterIntegrations" where "name" = 'Docker' and "typeCode" = 5001 and "isDeprecated" = false) then
      update "masterIntegrations" set "isDeprecated" = true where "name" = 'Docker' and "typeCode" = 5001;
    end if;

    --- Deprecate Trusted Docker Registry integration
    if exists (select 1 from "masterIntegrations" where "name" = 'Docker Trusted Registry' and "typeCode" = 5001 and "isDeprecated" = false) then
      update "masterIntegrations" set "isDeprecated" = true where "name" = 'Docker Trusted Registry' and "typeCode" = 5001;
    end if;

    --- Deprecate GCL integration
    if exists (select 1 from "masterIntegrations" where "name" = 'GCL' and "typeCode" = 5012 and "isDeprecated" = false) then
      update "masterIntegrations" set "isDeprecated" = true where "name" = 'GCL' and "typeCode" = 5012;
    end if;

    --- Deprecate GCR integration
    if exists (select 1 from "masterIntegrations" where "name" = 'GCR' and "typeCode" = 5001 and "isDeprecated" = false) then
      update "masterIntegrations" set "isDeprecated" = true where "name" = 'GCR' and "typeCode" = 5001;
    end if;

    --- Deprecate GKE integration
    if exists (select 1 from "masterIntegrations" where "name" = 'GKE' and "typeCode" = 5002 and "isDeprecated" = false) then
      update "masterIntegrations" set "isDeprecated" = true where "name" = 'GKE' and "typeCode" = 5002;
    end if;

    --- Deprecate Slack integration
    if exists (select 1 from "masterIntegrations" where "name" = 'Slack' and "typeCode" = 5003 and "isDeprecated" = false) then
      update "masterIntegrations" set "isDeprecated" = true where "name" = 'Slack' and "typeCode" = 5003;
    end if;

    --- Deprecate CLUSTER integration
    if exists (select 1 from "masterIntegrations" where "name" = 'CLUSTER' and "typeCode" = 5002 and "isDeprecated" = false) then
      update "masterIntegrations" set "isDeprecated" = true where "name" = 'CLUSTER' and "typeCode" = 5002;
    end if;

    --- Deprecate Azure Container Service (ACS) integration
    if exists (select 1 from "masterIntegrations" where "name" = 'ACS' and "typeCode" = 5002 and "isDeprecated" = false) then
      update "masterIntegrations" set "isDeprecated" = true where "name" = 'ACS' and "typeCode" = 5002;
    end if;

    --- Deprecate Amazon Web Services(IAM) integration
    if exists (select 1 from "masterIntegrations" where "name" = 'AWS_IAM' and "typeCode" = 5002 and "isDeprecated" = false) then
      update "masterIntegrations" set "isDeprecated" = true where "name" = 'AWS_IAM' and "typeCode" = 5002;
    end if;

    --- Deprecate DDC integration
    if exists (select 1 from "masterIntegrations" where "name" = 'DDC' and "typeCode" = 5002 and "isDeprecated" = false) then
      update "masterIntegrations" set "isDeprecated" = true where "name" = 'DDC' and "typeCode" = 5002;
    end if;

    --- Deprecate AZURE_DCOS integration
    if exists (select 1 from "masterIntegrations" where "name" = 'AZURE_DCOS' and "typeCode" = 5002 and "isDeprecated" = false) then
      update "masterIntegrations" set "isDeprecated" = true where "name" = 'AZURE_DCOS' and "typeCode" = 5002;
    end if;

    --- Deprecate webhook integration
    if exists (select 1 from "masterIntegrations" where "name" = 'webhook' and "typeCode" = 5003 and "isDeprecated" = false) then
      update "masterIntegrations" set "isDeprecated" = true where "name" = 'webhook' and "typeCode" = 5003;
    end if;

    --- Deprecate DCL integration
    if exists (select 1 from "masterIntegrations" where "name" = 'DCL' and "typeCode" = 5002 and "isDeprecated" = false) then
      update "masterIntegrations" set "isDeprecated" = true where "name" = 'DCL' and "typeCode" = 5002;
    end if;
  end
$$;
