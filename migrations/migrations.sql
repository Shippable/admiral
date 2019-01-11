do $$
  begin

    -- Remove systemProperties.id and set fieldName as primary key
    if exists (select 1 from information_schema.columns where table_name = 'systemProperties' and column_name = 'id') then
      alter table "systemProperties" drop column id;
      alter table "systemProperties" add constraint "systemProperties_pkey" primary key ("fieldName");
    end if;

    -- insert all systemProperties
    if not exists (select 1 from "systemProperties" where "fieldName" = 'sysUserName') then
      insert into "systemProperties" ("fieldName", "createdBy", "updatedBy", "createdAt", "updatedAt")
      values ('sysUserName', '54188262bc4d591ba438d62a', '54188262bc4d591ba438d62a',  '2016-06-01', '2016-06-01');
    end if;

    if not exists (select 1 from "systemProperties" where "fieldName" = 'sysPassword') then
      insert into "systemProperties" ("fieldName", "createdBy", "updatedBy", "createdAt", "updatedAt")
      values ('sysPassword', '54188262bc4d591ba438d62a', '54188262bc4d591ba438d62a',  '2016-06-01', '2016-06-01');
    end if;

    if not exists (select 1 from "systemProperties" where "fieldName" = 'sysDeployKey') then
      insert into "systemProperties" ("fieldName", "createdBy", "updatedBy", "createdAt", "updatedAt")
      values ('sysDeployKey', '54188262bc4d591ba438d62a', '54188262bc4d591ba438d62a',  '2016-06-01', '2016-06-01');
    end if;

    if not exists (select 1 from "systemProperties" where "fieldName" = 'sysDeployKeyExternalId') then
      insert into "systemProperties" ("fieldName", "createdBy", "updatedBy", "createdAt", "updatedAt")
      values ('sysDeployKeyExternalId', '54188262bc4d591ba438d62a', '54188262bc4d591ba438d62a',  '2016-06-01', '2016-06-01');
    end if;

    if not exists (select 1 from "systemProperties" where "fieldName" = 'processQueue') then
      insert into "systemProperties" ("fieldName", "createdBy", "updatedBy", "createdAt", "updatedAt")
      values ('processQueue', '54188262bc4d591ba438d62a', '54188262bc4d591ba438d62a',  '2016-06-01', '2016-06-01');
    end if;

    if not exists (select 1 from "systemProperties" where "fieldName" = 'registryUserName') then
      insert into "systemProperties" ("fieldName", "createdBy", "updatedBy", "createdAt", "updatedAt")
      values ('registryUserName', '54188262bc4d591ba438d62a', '54188262bc4d591ba438d62a',  '2016-06-01', '2016-06-01');
    end if;

    if not exists (select 1 from "systemProperties" where "fieldName" = 'registryAccessKey') then
      insert into "systemProperties" ("fieldName", "createdBy", "updatedBy", "createdAt", "updatedAt")
      values ('registryAccessKey', '54188262bc4d591ba438d62a', '54188262bc4d591ba438d62a',  '2016-06-01', '2016-06-01');
    end if;

    if not exists (select 1 from "systemProperties" where "fieldName" = 'registrySecretKey') then
      insert into "systemProperties" ("fieldName", "createdBy", "updatedBy", "createdAt", "updatedAt")
      values ('registrySecretKey', '54188262bc4d591ba438d62a', '54188262bc4d591ba438d62a',  '2016-06-01', '2016-06-01');
    end if;

    if not exists (select 1 from "systemProperties" where "fieldName" = 'nodeUserName') then
      insert into "systemProperties" ("fieldName", "createdBy", "updatedBy", "createdAt", "updatedAt")
      values ('nodeUserName', '54188262bc4d591ba438d62a', '54188262bc4d591ba438d62a',  '2016-06-01', '2016-06-01');
    end if;

    if not exists (select 1 from "systemProperties" where "fieldName" = 'nodePassword') then
      insert into "systemProperties" ("fieldName", "createdBy", "updatedBy", "createdAt", "updatedAt")
      values ('nodePassword', '54188262bc4d591ba438d62a', '54188262bc4d591ba438d62a',  '2016-06-01', '2016-06-01');
    end if;

    if not exists (select 1 from "systemProperties" where "fieldName" = 'execQueue') then
      insert into "systemProperties" ("fieldName", "createdBy", "updatedBy", "createdAt", "updatedAt")
      values ('execQueue', '54188262bc4d591ba438d62a', '54188262bc4d591ba438d62a',  '2016-06-01', '2016-06-01');
    end if;

    if not exists (select 1 from "systemProperties" where "fieldName" = 'sshPrivateKey') then
      insert into "systemProperties" ("fieldName", "createdBy", "updatedBy", "createdAt", "updatedAt")
      values ('sshPrivateKey', '54188262bc4d591ba438d62a', '54188262bc4d591ba438d62a',  '2016-06-01', '2016-06-01');
    end if;

    if not exists (select 1 from "systemProperties" where "fieldName" = 'deployPrivateKey') then
      insert into "systemProperties" ("fieldName", "createdBy", "updatedBy", "createdAt", "updatedAt")
      values ('deployPrivateKey', '54188262bc4d591ba438d62a', '54188262bc4d591ba438d62a',  '2016-06-01', '2016-06-01');
    end if;

    if not exists (select 1 from "systemProperties" where "fieldName" = 'webhookSecret') then
      insert into "systemProperties" ("fieldName", "createdBy", "updatedBy", "createdAt", "updatedAt")
      values ('webhookSecret', '54188262bc4d591ba438d62a', '54188262bc4d591ba438d62a',  '2016-06-01', '2016-06-01');
    end if;

    if not exists (select 1 from "systemProperties" where "fieldName" = 'sysIntegrationName') then
      insert into "systemProperties" ("fieldName", "createdBy", "updatedBy", "createdAt", "updatedAt")
      values ('sysIntegrationName', '54188262bc4d591ba438d62a', '54188262bc4d591ba438d62a',  '2016-06-01', '2016-06-01');
    end if;

    if not exists (select 1 from "systemProperties" where "fieldName" = 'sysVersionFormat') then
      insert into "systemProperties" ("fieldName", "createdBy", "updatedBy", "createdAt", "updatedAt")
      values ('sysVersionFormat', '54188262bc4d591ba438d62a', '54188262bc4d591ba438d62a',  '2016-06-01', '2016-06-01');
    end if;

    -- Delete sysWebhookExternalId from systemProperties
    if exists (select 1 from information_schema.columns where table_name = 'systemProperties' and column_name = 'fieldName') then
      delete from "systemProperties" where "fieldName"='sysWebhookExternalId';
    end if;

    -- Drop masterIntegration dependency from providers
    if exists (select 1 from pg_constraint where conname = 'providers_masterIntegrationId_fkey') then
      alter table "providers" drop constraint "providers_masterIntegrationId_fkey";
    end if;

    if exists (select 1 from information_schema.columns where table_name = 'providers' and column_name = 'masterIntegrationId') then
      alter table "providers" drop column "masterIntegrationId";
    end if;

    -- Add sourceName to resources and migrate name to sourceName
    if not exists (select 1 from information_schema.columns where table_name = 'resources' and column_name = 'sourceName') then
      alter table "resources" add column "sourceName" varchar(255);
      UPDATE "resources" SET "sourceName" = "name";
    end if;

    -- Add lastVersionId and lastVersionName columns to resources
    if not exists (select 1 from information_schema.columns where table_name = 'resources' and column_name = 'lastVersionId') then
      alter table "resources" add column "lastVersionId" INTEGER;
    end if;

    if not exists (select 1 from information_schema.columns where table_name = 'resources' and column_name = 'lastVersionName') then
      alter table "resources" add column "lastVersionName" varchar(255);
    end if;

    -- Update lastVersionId and lastVersionName in resources
    if not exists (select 1 from pg_constraint where conname = 'resources_lastVersionId_fkey') then
      update resources as r set "lastVersionId"=(select id from versions where "versionNumber"=r."lastVersionNumber" and "resourceId"=r.id), "lastVersionName"=(select "versionName" from versions where "versionNumber"=r."lastVersionNumber" and "resourceId"=r.id);
    end if;



    -- Add subscriptionIntegrationId to resources
    if not exists (select 1 from information_schema.columns where table_name = 'resources' and column_name = 'subscriptionIntegrationId') then
      alter table "resources" add column "subscriptionIntegrationId" integer;
    end if;

    -- Add projectId to resources
    if not exists (select 1 from information_schema.columns where table_name = 'resources' and column_name = 'projectId') then
      alter table "resources" add column "projectId" varchar(24);
    end if;

    -- Add resources.archTypeCode
    if not exists (select 1 from information_schema.columns where table_name = 'resources' and column_name = 'archTypeCode') then
      alter table "resources" add column "archTypeCode" integer;
    end if;

    -- Add resources.operatingSystemCode
    if not exists (select 1 from information_schema.columns where table_name = 'resources' and column_name = 'operatingSystemCode') then
      alter table "resources" add column "operatingSystemCode" integer;
    end if;

    -- Add nextTriggerTime to resources
    if not exists (select 1 from information_schema.columns where table_name = 'resources' and column_name = 'nextTriggerTime') then
      alter table "resources" add column "nextTriggerTime" timestamp with time zone;
    end if;

    -- Add resourceNextTriggerTimeI Index on resources
    if not exists (select 1 from pg_indexes where tablename = 'resources' and indexname = 'resourceNextTriggerTimeI') then
      create index "resourceNextTriggerTimeI" on "resources" using btree("nextTriggerTime");
    end if;

    -- Add subsIntPermsProjIdI Index on subscriptionIntegrationPermissions
    if not exists (select 1 from pg_indexes where tablename = 'subscriptionIntegrationPermissions' and indexname = 'subsIntPermsProjIdI') then
      create index "subsIntPermsProjIdI" on "subscriptionIntegrationPermissions" using btree("projectId");
    end if;

    -- Remove accountIntegrationId in resources
    if exists (select 1 from information_schema.columns where table_name = 'resources' and column_name = 'accountIntegrationId') then
      alter table "resources" drop column "accountIntegrationId";
    end if;

    -- Remove isJobStep in resources
    if exists (select 1 from information_schema.columns where table_name = 'resources' and column_name = 'isJobStep') then
      alter table "resources" drop column "isJobStep";
    end if;

    -- Change jobLengthInMS of dailyAggs from int to big int
    if exists (select 1 from information_schema.columns where table_name = 'dailyAggs' and column_name = 'jobLengthInMS' and data_type = 'integer') then
      alter table "dailyAggs" ALTER COLUMN "jobLengthInMS" type bigint;
    end if;

    -- Change jobLengthInMS of projectDailyAggs from int to big int
    if exists (select 1 from information_schema.columns where table_name = 'projectDailyAggs' and column_name = 'jobLengthInMS' and data_type = 'integer') then
      alter table "projectDailyAggs" ALTER COLUMN "jobLengthInMS" type bigint;
    end if;

    -- Add isConsistent to resources and set it as false
    if not exists (select 1 from information_schema.columns where table_name = 'resources' and column_name = 'isConsistent') then
      alter table "resources" add column "isConsistent" boolean NOT NULL DEFAULT false;
    end if;
    if exists (select 1 from information_schema.columns where table_name = 'resources' and column_name = 'isConsistent' and column_default IS NULL) then
      alter table "resources" alter column "isConsistent" SET DEFAULT false;
      update "resources" set "isConsistent"=false WHERE "isConsistent" IS NULL;
      alter table "resources" alter column "isConsistent" SET NOT NULL;
    end if;

    -- Set default values true for buildJobs.isSerial
    if exists (select 1 from information_schema.columns where table_name = 'buildJobs' and column_name = 'isSerial' and column_default IS NOT NULL) then
      alter table "buildJobs" alter column "isSerial" SET DEFAULT true;
    end if;

    -- Add runShImage column to systemMachineImages
    if not exists (select 1 from information_schema.columns where table_name = 'systemMachineImages' and column_name = 'runShImage') then
      alter table "systemMachineImages" add column "runShImage" varchar(80);
      update "systemMachineImages" set "runShImage"='shipimg/micro50:stepExec.server.6262' where "runShImage" is null;
      alter table "systemMachineImages" alter column "runShImage" set not null;
    end if;

    -- Add versionName to versions
    if not exists (select 1 from information_schema.columns where table_name = 'versions' and column_name = 'versionName') then
      alter table "versions" add column "versionName" varchar(255);
    end if;

    -- Add projectId to versions
    if not exists (select 1 from information_schema.columns where table_name = 'versions' and column_name = 'projectId') then
      alter table "versions" add column "projectId" varchar(24);
    end if;

    -- Add github in providers
    if not exists (select 1 from "providers" where "url" = 'https://api.github.com') then
      insert into "providers" ("id", "url", "name", "urlSlug", "createdAt", "updatedAt")
      values ('562dbd9710c5980d003b0451', 'https://api.github.com', 'github', 'github', '2016-02-29T00:00:00.000Z', '2016-02-29T00:00:00.000Z');
    end if;

    -- Add bitbucket in providers
    if not exists (select 1 from "providers" where "url" = 'https://bitbucket.org') then
      insert into "providers" ("id", "url", "name", "urlSlug", "createdAt", "updatedAt")
      values ('562dbda348095b0d00ce6a43', 'https://bitbucket.org', 'bitbucket', 'bitbucket', '2016-02-29T00:00:00.000Z', '2016-02-29T00:00:00.000Z');
    end if;

    -- Add urlSlug column to providers
    if not exists (select 1 from information_schema.columns where table_name = 'providers' and column_name = 'urlSlug') then
      alter table "providers" add column "urlSlug" varchar(255);
      update "providers" set "urlSlug" = 'github' where "name" = 'github' and "urlSlug" is null;
      update "providers" set "urlSlug" = 'bitbucket' where "name" = 'bitbucket' and "urlSlug" is null;
    end if;

    --Add unique constraint on urlSlug for providers
    if not exists (select 1 from pg_indexes where tablename = 'providers' and indexname = 'provUrlSlugU') then
      alter table "providers" add constraint "provUrlSlugU" UNIQUE ("urlSlug");
      alter table "providers" alter column "urlSlug" set NOT NULL;
    end if;

    -- Make "sourceId" nullable in projects table
    if exists (select 1 from information_schema.columns where table_name = 'projects' and column_name = 'sourceId') then
      alter table "projects" alter column "sourceId" drop not null;
    end if;

    -- change type of "sourceDefaultBranch" to varchar(255) in projects table
    if exists (select 1 from information_schema.columns where table_name = 'projects' and column_name = 'sourceDefaultBranch') then
      alter table "projects" alter column "sourceDefaultBranch" type varchar(255);
    end if;

    -- Add "isInternal" to accountTokens table
    if not exists (select 1 from information_schema.columns where table_name = 'accountTokens' and column_name = 'isInternal') then
      alter table "accountTokens" add column "isInternal" BOOLEAN DEFAULT false;
    end if;

    -- Add "privateJobQuota" to subscriptions table
    if not exists (select 1 from information_schema.columns where table_name = 'subscriptions' and column_name = 'privateJobQuota') then
      alter table "subscriptions" add column "privateJobQuota" INTEGER;
      -- Initial default for existing rows
      update "subscriptions" set "privateJobQuota" = 150;
      alter table "subscriptions" alter column "privateJobQuota" set not null;
    end if;

    -- Add "privateJobCount" to subscriptions table
    if not exists (select 1 from information_schema.columns where table_name = 'subscriptions' and column_name = 'privateJobCount') then
      alter table "subscriptions" add column "privateJobCount" INTEGER default 0 not null;
    end if;
    -- Update "privateJobCount" columns without a default
    if exists (select 1 from information_schema.columns where table_name = 'subscriptions' and column_name = 'privateJobCount' and column_default is null) then
      alter table "subscriptions" alter column "privateJobCount" set DEFAULT 0;
    end if;

    -- Add "privateJobQuotaResetsAt" to subscriptions table
    if not exists (select 1 from information_schema.columns where table_name = 'subscriptions' and column_name = 'privateJobQuotaResetsAt') then
      alter table "subscriptions" add column "privateJobQuotaResetsAt" TIMESTAMP WITH TIME ZONE;
      -- Initial default for existing rows
      update "subscriptions" set "privateJobQuotaResetsAt" = '2016-09-01';
      alter table "subscriptions" alter column "privateJobQuotaResetsAt" set not null;
    end if;

    -- Drop not null constraint on formJSONValues for accountIntegrations
    if exists (select 1 from information_schema.columns where table_name = 'accountIntegrations' and column_name = 'formJSONValues') then
      alter table "accountIntegrations" alter column "formJSONValues" drop not null;
    end if;

    -- Drop not null constraint on subscriptionIntegrations.accountIntegrationId
    if exists (select 1 from information_schema.columns where table_name = 'subscriptionIntegrations' and column_name = 'accountIntegrationId' and is_nullable = 'NO') then
      alter table "subscriptionIntegrations" alter column "accountIntegrationId" drop not null;
    end if;

    -- Add braintreeSubscriptionId in subscriptions
     if not exists (select 1 from information_schema.columns where table_name = 'subscriptions' and column_name = 'braintreeSubscriptionId') then
       alter table "subscriptions" add column "braintreeSubscriptionId" character varying(255);
     end if;

    -- Add minionCount in subscriptions
     if not exists (select 1 from information_schema.columns where table_name = 'subscriptions' and column_name = 'minionCount') then
       alter table "subscriptions" add column "minionCount" integer NOT NULL DEFAULT 1;
     end if;

  -- Add discount in transactions
     if not exists (select 1 from information_schema.columns where table_name = 'transactions' and column_name = 'discount') then
       alter table "transactions" add column "discount" numeric NOT NULL DEFAULT 0;
     end if;
  -- Update discount columns with the wrong type
     if exists (select 1 from information_schema.columns where table_name = 'transactions' and column_name = 'discount' and data_type = 'double precision') then
       alter table "transactions" alter column "discount" type numeric;
     end if;
  -- Update discount columns without a default
     if exists (select 1 from information_schema.columns where table_name = 'transactions' and column_name = 'discount' and column_default is null) then
       alter table "transactions" alter column "discount" set DEFAULT 0;
     end if;

  -- Add price in transactions
     if not exists (select 1 from information_schema.columns where table_name = 'transactions' and column_name = 'price') then
       alter table "transactions" add column "price" numeric NOT NULL DEFAULT 0;
     end if;
  -- Update price columns with the wrong type
     if exists (select 1 from information_schema.columns where table_name = 'transactions' and column_name = 'price' and data_type = 'double precision') then
       alter table "transactions" alter column "price" type numeric;
     end if;
  -- Update price columns without a default
     if exists (select 1 from information_schema.columns where table_name = 'transactions' and column_name = 'price' and column_default is null) then
       alter table "transactions" alter column "price" set DEFAULT 0;
     end if;

  -- Remove paidSubCount from dailyAggs
    if exists (select 1 from information_schema.columns where table_name = 'dailyAggs' and column_name = 'paidSubCount') then
      alter table "dailyAggs" drop column "paidSubCount";
    end if;

   -- Remove isNewPipeline from subscriptions
    if exists (select 1 from information_schema.columns where table_name = 'subscriptions' and column_name = 'isNewPipeline') then
      alter table "subscriptions" drop column "isNewPipeline";
    end if;

  -- Add externalBuildUrl in builds
    if not exists (select 1 from information_schema.columns where table_name = 'builds' and column_name = 'externalBuildUrl') then
      alter table "builds" add column "externalBuildUrl" varchar(510);
    end if;

  -- Add endedAt in builds
    if not exists (select 1 from information_schema.columns where table_name = 'builds' and column_name = 'endedAt') then
      alter table "builds" add column "endedAt" timestamp with time zone;
    end if;

  -- Add projectId in builds
    if not exists (select 1 from information_schema.columns where table_name = 'builds' and column_name = 'projectId') then
      alter table "builds" add column "projectId" varchar(24);
    end if;

    if not exists (select 1 from information_schema.columns where table_name = 'builds' and column_name = 'propertyBag') then
      alter table "builds" add column "propertyBag" TEXT;
    end if;

  -- Set projectIds for builds where projectId is null
    UPDATE builds SET "projectId" = (SELECT "projectId" FROM resources WHERE id="resourceId") WHERE "projectId" IS NULL;

  -- Add projectId in buildJobs
    if not exists (select 1 from information_schema.columns where table_name = 'buildJobs' and column_name = 'projectId') then
      alter table "buildJobs" add column "projectId" varchar(24);
    end if;

  -- Set projectIds for buildJobs where projectId is null
    UPDATE "buildJobs" SET "projectId" = (SELECT "projectId" FROM builds WHERE id="buildJobs"."buildId") WHERE "projectId" IS NULL;

  -- Set projectId column of builds table set to not null
    if exists (select 1 from information_schema.columns where table_name = 'builds' and column_name = 'projectId') then
      alter table "builds" alter column "projectId" set not null;
    end if;

  -- Set projectId column of buildJobs table set to not null
    if exists (select 1 from information_schema.columns where table_name = 'buildJobs' and column_name = 'projectId') then
      alter table "buildJobs" alter column "projectId" set not null;
    end if;

    -- Adds runs.isPipelineTriggered
    if not exists (select 1 from information_schema.columns where table_name = 'runs' and column_name = 'isPipelineTriggered') then
      alter table "runs" add column "isPipelineTriggered" BOOLEAN;
    end if;

    -- Adds runs propertyBag
    if not exists (select 1 from information_schema.columns where table_name = 'runs' and column_name = 'propertyBag') then
      alter table "runs" add column "propertyBag" TEXT;
    end if;

    -- Add projects.ownerAccountId
    if not exists (select 1 from information_schema.columns where table_name = 'projects' and column_name = 'ownerAccountId') then
      alter table "projects" add column "ownerAccountId" varchar(24);
      update projects set "ownerAccountId" = "enabledBy";
    end if;

    -- Add projects.builderAccountId
    if not exists (select 1 from information_schema.columns where table_name = 'projects' and column_name = 'builderAccountId') then
      alter table "projects" add column "builderAccountId" varchar(24);
    end if;

    -- Add projects.isOrphaned
    if not exists (select 1 from information_schema.columns where table_name = 'projects' and column_name = 'isOrphaned') then
      alter table "projects" add column "isOrphaned" boolean;
    end if;

    -- Add projects.archTypeCode
    if not exists (select 1 from information_schema.columns where table_name = 'projects' and column_name = 'archTypeCode') then
      alter table "projects" add column "archTypeCode" integer;
    end if;

    -- Add projects.operatingSystemCode
    if not exists (select 1 from information_schema.columns where table_name = 'projects' and column_name = 'operatingSystemCode') then
      alter table "projects" add column "operatingSystemCode" integer;
    end if;

    -- Set builderAccountId for projects with only a ownerAccountId
    UPDATE projects SET "builderAccountId" = "ownerAccountId" WHERE "builderAccountId" IS NULL AND "ownerAccountId" IS NOT NULL;

    -- Adds foreign key relationships for projects
    if not exists (select 1 from pg_constraint where conname = 'projects_enabledBy_fkey') then
      update projects as p set "enabledBy"=(select id from accounts where "id"=p."enabledBy");
      alter table "projects" add constraint "projects_enabledBy_fkey" foreign key ("enabledBy") references "accounts"(id) on update restrict on delete restrict;
    end if;

    if not exists (select 1 from pg_constraint where conname = 'projects_ownerAccountId_fkey') then
      update projects as p set "ownerAccountId"=(select id from accounts where "id"=p."ownerAccountId");
      alter table "projects" add constraint "projects_ownerAccountId_fkey" foreign key ("ownerAccountId") references "accounts"(id) on update restrict on delete restrict;
    end if;

    if not exists (select 1 from pg_constraint where conname = 'projects_builderAccountId_fkey') then
      alter table "projects" add constraint "projects_builderAccountId_fkey" foreign key ("builderAccountId") references "accounts"(id) on update restrict on delete restrict;
    end if;

    -- Add column nodeTypeCode to subscriptions table
    if not exists (select 1 from information_schema.columns where table_name = 'subscriptions' and column_name = 'nodeTypeCode') then
      alter table "subscriptions" add column "nodeTypeCode" integer;
      update "subscriptions" set "nodeTypeCode" = 7000 where "isUsingCustomHost" = true;
      update "subscriptions" set "nodeTypeCode" = 7001 where "isUsingCustomHost" = false;
      alter table "subscriptions" add constraint "subscriptions_nodeTypeCode_fkey" foreign key("nodeTypeCode") references "systemCodes"(code) on update restrict on delete restrict;
    end if;

    -- Add column nodeTypeCode to clusterNodes table
    if not exists (select 1 from information_schema.columns where table_name = 'clusterNodes' and column_name = 'nodeTypeCode') then
      alter table "clusterNodes" add column "nodeTypeCode" integer;
      alter table "clusterNodes" add constraint "clusterNodes_nodeTypeCode_fkey" foreign key("nodeTypeCode") references "systemCodes"(code) on update restrict on delete restrict;
    end if;

    -- Remove isUsingCustomHost from subscriptions
    if exists (select 1 from information_schema.columns where table_name = 'subscriptions' and column_name = 'isUsingCustomHost') then
      alter table "subscriptions" drop column "isUsingCustomHost";
    end if;

    -- Adds foreign key relationships for resources
    if not exists (select 1 from pg_constraint where conname = 'resources_subscriptionId_fkey') then
      alter table "resources" add constraint "resources_subscriptionId_fkey" foreign key ("subscriptionId") references "subscriptions"(id) on update restrict on delete restrict;
    end if;

    if not exists (select 1 from pg_constraint where conname = 'resources_subscriptionIntegrationId_fkey') then
      alter table "resources" add constraint "resources_subscriptionIntegrationId_fkey" foreign key ("subscriptionIntegrationId") references "subscriptionIntegrations"(id) on update restrict on delete restrict;
    end if;

    if not exists (select 1 from pg_constraint where conname = 'resources_projectId_fkey') then
      alter table "resources" add constraint "resources_projectId_fkey" foreign key ("projectId") references "projects"(id) on update restrict on delete restrict;
    end if;

    if not exists (select 1 from pg_constraint where conname = 'resources_typeCode_fkey') then
      alter table "resources" add constraint "resources_typeCode_fkey" foreign key ("typeCode") references "systemCodes"(code) on update restrict on delete restrict;
    end if;

    if not exists (select 1 from pg_constraint where conname = 'resources_lastVersionId_fkey') then
      alter table "resources" add constraint "resources_lastVersionId_fkey" foreign key("lastVersionId") references "versions"(id) on update restrict on delete set null;
    end if;

  -- Adds foreign key relationships for versions
    if not exists (select 1 from pg_constraint where conname = 'versions_subscriptionId_fkey') then
      alter table "versions" add constraint "versions_subscriptionId_fkey" foreign key ("subscriptionId") references "subscriptions"(id) on update restrict on delete restrict;
    end if;

    if not exists (select 1 from pg_constraint where conname = 'versions_projectId_fkey') then
      alter table "versions" add constraint "versions_projectId_fkey" foreign key ("projectId") references "projects"(id) on update restrict on delete restrict;
    end if;

  -- Adds foreign key relationships for jobDependencies
    if not exists (select 1 from pg_constraint where conname = 'jobDependencies_subscriptionId_fkey') then
      alter table "jobDependencies" add constraint "jobDependencies_subscriptionId_fkey" foreign key ("subscriptionId") references "subscriptions"(id) on update restrict on delete restrict;
    end if;

  -- Adds foreign key relationships for buildJobs
    if not exists (select 1 from pg_constraint where conname = 'buildJobs_subscriptionId_fkey') then
      alter table "buildJobs" add constraint "buildJobs_subscriptionId_fkey" foreign key ("subscriptionId") references "subscriptions"(id) on update restrict on delete restrict;
    end if;

    if not exists (select 1 from pg_constraint where conname = 'buildJobs_projectId_fkey') then
      alter table "buildJobs" add constraint "buildJobs_projectId_fkey" foreign key ("projectId") references "projects"(id) on update restrict on delete restrict;
    end if;

  -- Adds foreign key relationships for accountIntegrations
    if not exists (select 1 from pg_constraint where conname = 'accountIntegrations_accountId_fkey') then
      alter table "accountIntegrations" add constraint "accountIntegrations_accountId_fkey" foreign key ("accountId") references "accounts"(id) on update restrict on delete restrict;
    end if;
    if not exists (select 1 from pg_constraint where conname = 'accountIntegrations_providerId_fkey') then
      alter table "accountIntegrations" add constraint "accountIntegrations_providerId_fkey" foreign key ("providerId") references "providers"(id) on update restrict on delete restrict;
    end if;
    if not exists (select 1 from pg_constraint where conname = 'accountIntegrations_masterIntegrationId_fkey') then
      alter table "accountIntegrations" add constraint "accountIntegrations_masterIntegrationId_fkey" foreign key ("masterIntegrationId") references "masterIntegrations"(id) on update restrict on delete restrict;
    end if;

  -- Adds foreign key relationships for accountTokens
    if not exists (select 1 from pg_constraint where conname = 'accountTokens_accountId_fkey') then
      alter table "accountTokens" add constraint "accountTokens_accountId_fkey" foreign key ("accountId") references "accounts"(id) on update restrict on delete restrict;
    end if;

  -- Adds foreign key relationships for accountProfiles
    if not exists (select 1 from pg_constraint where conname = 'accountProfiles_accountId_fkey') then
      alter table "accountProfiles" add constraint "accountProfiles_accountId_fkey" foreign key ("accountId") references "accounts"(id) on update restrict on delete restrict;
    end if;
    if not exists (select 1 from pg_constraint where conname = 'accountProfiles_providerId_fkey') then
      alter table "accountProfiles" add constraint "accountProfiles_providerId_fkey" foreign key ("providerId") references "providers"(id) on update restrict on delete restrict;
    end if;

  -- Adds foreign key relationships for subscriptionIntegrations
    if not exists (select 1 from pg_constraint where conname = 'subscriptionIntegrations_subscriptionId_fkey') then
      alter table "subscriptionIntegrations" add constraint "subscriptionIntegrations_subscriptionId_fkey" foreign key ("subscriptionId") references "subscriptions"(id) on update restrict on delete restrict;
    end if;

    if not exists (select 1 from pg_constraint where conname = 'subscriptionIntegrations_accountIntegrationId_fkey') then
      alter table "subscriptionIntegrations" add constraint "subscriptionIntegrations_accountIntegrationId_fkey" foreign key ("accountIntegrationId") references "accountIntegrations"(id) on update restrict on delete restrict;
    end if;

  -- Adds foreign key relationships for projects
    if not exists (select 1 from pg_constraint where conname = 'projects_providerId_fkey') then
      alter table "projects" add constraint "projects_providerId_fkey" foreign key ("providerId") references "providers"(id) on update restrict on delete restrict;
    end if;
    if not exists (select 1 from pg_constraint where conname = 'projects_subscriptionId_fkey') then
      alter table "projects" add constraint "projects_subscriptionId_fkey" foreign key ("subscriptionId") references "subscriptions"(id) on update restrict on delete restrict;
    end if;

  -- Adds foreign key relationships for projectDailyAggs
    if not exists (select 1 from pg_constraint where conname = 'projectDailyAggs_projectId_fkey') then
      alter table "projectDailyAggs" add constraint "projectDailyAggs_projectId_fkey" foreign key ("projectId") references "projects"(id) on update restrict on delete restrict;
    end if;
    if not exists (select 1 from pg_constraint where conname = 'projectDailyAggs_subscriptionId_fkey') then
      alter table "projectDailyAggs" add constraint "projectDailyAggs_subscriptionId_fkey" foreign key ("subscriptionId") references "subscriptions"(id) on update restrict on delete restrict;
    end if;

  -- Removes accountId foreign key from transactions
    if exists (select 1 from pg_constraint where conname = 'transactions_accountId_fkey') then
      alter table "transactions" drop constraint "transactions_accountId_fkey";
    end if;

  -- Adds foreign key relationships for transactions
    if not exists (select 1 from pg_constraint where conname = 'transactions_subscriptionId_fkey') then
      alter table "transactions" add constraint "transactions_subscriptionId_fkey" foreign key ("subscriptionId") references "subscriptions"(id) on update restrict on delete restrict;
    end if;

  -- Adds foreign key relationships for builds
    if not exists (select 1 from pg_constraint where conname = 'builds_subscriptionId_fkey') then
      alter table "builds" add constraint "builds_subscriptionId_fkey" foreign key ("subscriptionId") references "subscriptions"(id) on update restrict on delete restrict;
    end if;

    if not exists (select 1 from pg_constraint where conname = 'builds_projectId_fkey') then
      alter table "builds" add constraint "builds_projectId_fkey" foreign key ("projectId") references "projects"(id) on update restrict on delete restrict;
    end if;

  -- Adds foreign key relationships for clusterNodeStats
    if not exists (select 1 from pg_constraint where conname = 'clusterNodeStats_clusterNodeId_fkey') then
      alter table "clusterNodeStats" add constraint "clusterNodeStats_clusterNodeId_fkey" foreign key ("clusterNodeId") references "clusterNodes"(id) on update restrict on delete restrict;
    end if;

  -- Adds foreign key relationships for clusterNodeConsoles
    if not exists (select 1 from pg_constraint where conname = 'clusterNodeConsoles_clusterNodeId_fkey') then
      alter table "clusterNodeConsoles" add constraint "clusterNodeConsoles_clusterNodeId_fkey" foreign key ("clusterNodeId") references "clusterNodes"(id) on update restrict on delete restrict;
    end if;

  -- Adds foreign key relationships for clusterNodes
    if not exists (select 1 from pg_constraint where conname = 'clusterNodes_subscriptionId_fkey') then
      alter table "clusterNodes" add constraint "clusterNodes_subscriptionId_fkey" foreign key ("subscriptionId") references "subscriptions"(id) on update restrict on delete restrict;
    end if;

    if not exists (select 1 from pg_constraint where conname = 'clusterNodes_statusCode_fkey') then
      alter table "clusterNodes" add constraint "clusterNodes_statusCode_fkey" foreign key ("statusCode") references "systemCodes"(code) on update restrict on delete restrict;
    end if;

    if not exists (select 1 from pg_constraint where conname = 'clusterNodes_systemMachineImageId_fkey') then
      alter table "clusterNodes" add constraint "clusterNodes_systemMachineImageId_fkey" foreign key ("systemMachineImageId") references "systemMachineImages"(id) on update restrict on delete restrict;
    end if;

  -- Adds foreign key relationships for jobs
    if not exists (select 1 from pg_constraint where conname = 'jobs_statusCode_fkey') then
      alter table "jobs" add constraint "jobs_statusCode_fkey" foreign key ("statusCode") references "systemCodes"(code) on update restrict on delete restrict;
    end if;

    if not exists (select 1 from pg_constraint where conname = 'jobs_subscriptionId_fkey') then
      alter table "jobs" add constraint "jobs_subscriptionId_fkey" foreign key ("subscriptionId") references "subscriptions"(id) on update restrict on delete restrict;
    end if;

    if not exists (select 1 from pg_constraint where conname = 'jobs_projectId_fkey') then
      alter table "jobs" add constraint "jobs_projectId_fkey" foreign key ("projectId") references "projects"(id) on update restrict on delete restrict;
    end if;

    if not exists (select 1 from pg_constraint where conname = 'jobs_runId_fkey') then
      alter table "jobs" add constraint "jobs_runId_fkey" foreign key ("runId") references "runs"(id) on update restrict on delete restrict;
    end if;

  -- Adds foreign key relationships for runs
    if not exists (select 1 from pg_constraint where conname = 'runs_statusCode_fkey') then
      alter table "runs" add constraint "runs_statusCode_fkey" foreign key ("statusCode") references "systemCodes"(code) on update restrict on delete restrict;
    end if;

    if not exists (select 1 from pg_constraint where conname = 'runs_projectId_fkey') then
      alter table "runs" add constraint "runs_projectId_fkey" foreign key ("projectId") references "projects"(id) on update restrict on delete restrict;
    end if;

    if not exists (select 1 from pg_constraint where conname = 'runs_providerId_fkey') then
      alter table "runs" add constraint "runs_providerId_fkey" foreign key ("providerId") references "providers"(id) on update restrict on delete restrict;
    end if;

    if not exists (select 1 from pg_constraint where conname = 'runs_subscriptionId_fkey') then
      alter table "runs" add constraint "runs_subscriptionId_fkey" foreign key ("subscriptionId") references "subscriptions"(id) on update restrict on delete restrict;
    end if;

  -- Adds foreign key relationships for subscriptions
    if not exists (select 1 from pg_constraint where conname = 'subscriptions_providerId_fkey') then
      alter table "subscriptions" add constraint "subscriptions_providerId_fkey" foreign key ("providerId") references "providers"(id) on update restrict on delete restrict;
    end if;

    if not exists (select 1 from pg_constraint where conname = 'subscriptions_systemMachineImageId_fkey') then
      alter table "subscriptions" add constraint "subscriptions_systemMachineImageId_fkey" foreign key ("systemMachineImageId") references "systemMachineImages"(id) on update restrict on delete restrict;
    end if;

    -- Add systemRoles to accountTokens
    if not exists (select 1 from information_schema.columns where table_name = 'accountTokens' and column_name = 'systemRoles') then
      alter table "accountTokens" add column "systemRoles" text default '[]' NOT NUll;
    end if;

    -- Drop clusterNodes_jobId_fkey constraint from clusterNodes table
    if exists (select 1 from pg_constraint where conname = 'clusterNodes_jobId_fkey') then
      alter table "clusterNodes" drop constraint "clusterNodes_jobId_fkey";
    end if;

    -- Adds consolidateReports coloumn in projects table
    if not exists (select 1 from information_schema.columns where table_name = 'projects' and column_name = 'consolidateReports') then
      alter table "projects" add column "consolidateReports" BOOLEAN DEFAULT false;
    end if;

    -- Adds externalBuildId column in builds table
    if not exists (select 1 from information_schema.columns where table_name = 'builds' and column_name = 'externalBuildId') then
      alter table "builds" add column "externalBuildId" varchar(255);
    end if;

    -- Reindex projAccAccIdProjIdU to projAccAccIdProjIdRoleCodeU in projectAccounts table
    if exists (select 1 from pg_indexes where tablename = 'projectAccounts' and indexname = 'projAccAccIdProjIdU') then
      drop index "projAccAccIdProjIdU";
    end if;

    if not exists (select 1 from pg_indexes where tablename = 'projectAccounts' and indexname = 'projAccAccIdProjIdRoleCodeU') then
      create unique index "projAccAccIdProjIdRoleCodeU" on "projectAccounts" using btree("accountId", "projectId", "roleCode");
    end if;

   -- Add accountIntegrationId column in projectAccounts table
   if not exists (select 1 from information_schema.columns where table_name = 'projectAccounts' and column_name = 'accountIntegrationId') then
     alter table "projectAccounts" add column "accountIntegrationId" varchar(24);
   end if;

   -- add foreign key for projectAccounts.accountIntegrationId
   if not exists (select 1 from pg_constraint where conname = 'projectAccounts_accountIntegrationId_fkey') then
     alter table "projectAccounts" add constraint "projectAccounts_accountIntegrationId_fkey" foreign key ("accountIntegrationId") references "accountIntegrations"(id) on update restrict on delete restrict;
   end if;

   -- Add accountIntegrationId column in subscriptionAccounts table
   if not exists (select 1 from information_schema.columns where table_name = 'subscriptionAccounts' and column_name = 'accountIntegrationId') then
     alter table "subscriptionAccounts" add column "accountIntegrationId" varchar(24);
   end if;

   -- add foreign key for subscriptionAccounts.accountIntegrationId
   if not exists (select 1 from pg_constraint where conname = 'subscriptionAccounts_accountIntegrationId_fkey') then
     alter table "subscriptionAccounts" add constraint "subscriptionAccounts_accountIntegrationId_fkey" foreign key ("accountIntegrationId") references "accountIntegrations"(id) on update restrict on delete restrict;
   end if;

    -- Reindex subsAccSubsIdAccIdU to subsAccSubsIdAccIdRoleCodeU in subscriptionAccounts table
    if exists (select 1 from pg_indexes where tablename = 'subscriptionAccounts' and indexname = 'subsAccSubsIdAccIdU') then
      drop index "subsAccSubsIdAccIdU";
    end if;

    if not exists (select 1 from pg_indexes where tablename = 'subscriptionAccounts' and indexname = 'subsAccSubsIdAccIdRoleCodeU') then
      create unique index "subsAccSubsIdAccIdRoleCodeU" on "subscriptionAccounts" using btree("accountId", "subscriptionId", "roleCode");
    end if;

    -- Reindex viewObjectsViewIdObjectIdU to viewObjectsViewIdObjectIdTypeCodeU in viewObjects table
    if exists (select 1 from pg_indexes where tablename = 'viewObjects' and indexname = 'viewObjectsViewIdObjectIdU') then
      drop index "viewObjectsViewIdObjectIdU";
    end if;

    if not exists (select 1 from pg_indexes where tablename = 'viewObjects' and indexname = 'viewObjectsViewIdObjectIdTypeCodeU') then
      create unique index "viewObjectsViewIdObjectIdTypeCodeU" on "viewObjects" using btree("viewId", "objectId", "typeCode");
    end if;

    -- changes views table foreign key views_accountId_fkey constraint to RESTRICT FROM CASCADE
    if exists (select 1 from pg_constraint where conname = 'views_accountId_fkey' and confdeltype = 'c') then
      alter table "views" drop constraint "views_accountId_fkey";
    end if;

    if not exists (select 1 from pg_constraint where conname = 'views_accountId_fkey' and confdeltype = 'r') then
      alter table "views" add constraint "views_accountId_fkey" foreign key ("accountId") references "accounts"(id) on update restrict on delete restrict;
    end if;

    -- changes viewObjects table foreign key viewObjects_viewId_fkey constraint to RESTRICT FROM CASCADE
    if exists (select 1 from pg_constraint where conname = 'viewObjects_viewId_fkey' and confdeltype = 'c') then
      alter table "viewObjects" drop constraint "viewObjects_viewId_fkey";
    end if;

     if not exists (select 1 from pg_constraint where conname = 'viewObjects_viewId_fkey' and confdeltype = 'r') then
      alter table "viewObjects" add constraint "viewObjects_viewId_fkey" foreign key ("viewId") references "views"(id) on update restrict on delete restrict;
    end if;

    -- Add new coloumn  subscriptionId in views table
    if not exists (select 1 from information_schema.columns where table_name = 'views' and column_name = 'subscriptionId') then
      alter table "views" add column "subscriptionId" varchar(24);
    end if;

    -- Add new column  projectId in views table
    if not exists (select 1 from information_schema.columns where table_name = 'views' and column_name = 'projectId') then
      alter table "views" add column "projectId" varchar(24);
    end if;

    -- drop column isShippableNode from clusterNodes table
    if exists (select 1 from information_schema.columns where table_name = 'clusterNodes' and column_name = 'isShippableNode') then
      alter table "clusterNodes" drop column "isShippableNode";
    end if;

    -- Adds isShippableInitialized coloumn in systemNodes table
    if not exists (select 1 from information_schema.columns where table_name = 'systemNodes' and column_name = 'isShippableInitialized') then
      alter table "systemNodes" add column "isShippableInitialized" BOOLEAN;
    end if;

    -- Drop systemIntegrationId from systemMachineImages
    if exists (select 1 from information_schema.columns where table_name = 'systemMachineImages' and column_name = 'systemIntegrationId') then
      alter table "systemMachineImages" drop column "systemIntegrationId";
    end if;

    -- Drop projectPermissions
    if exists (select 1 from information_schema.columns where table_name = 'projectPermissions') then
      drop table "projectPermissions";
    end if;

    -- Drop subscriptionPermissions
    if exists (select 1 from information_schema.columns where table_name = 'subscriptionPermissions') then
      drop table "subscriptionPermissions";
    end if;

    -- Drop betaUsers
    if exists (select 1 from information_schema.columns where table_name = 'betaUsers') then
      drop table "betaUsers";
    end if;

    -- Drop superUsers
    if exists (select 1 from information_schema.columns where table_name = 'superUsers') then
      drop table "superUsers";
    end if;

    -- Drop systemImages
    if exists (select 1 from information_schema.columns where table_name = 'systemImages') then
      drop table "systemImages";
    end if;


    -- Adds proxyBuildJobPropertyBag column in jobs table
    if not exists (select 1 from information_schema.columns where table_name = 'jobs' and column_name = 'proxyBuildJobPropertyBag') then
      alter table "jobs" add column "proxyBuildJobPropertyBag" TEXT;
    end if;

    -- Add genericIntegrations column in jobs table
    if not exists (select 1 from information_schema.columns where table_name = 'jobs' and column_name = 'genericIntegrations') then
      alter table "jobs" add column "genericIntegrations" TEXT;
    end if;

    -- Add versionId column in jobs table
    if not exists (select 1 from information_schema.columns where table_name = 'jobs' and column_name = 'versionId') then
      alter table "jobs" add column "versionId" INTEGER;
    end if;

    -- add foreign key for job.versionId
    if not exists (select 1 from pg_constraint where conname = 'jobs_versionId_fkey') then
      alter table "jobs" add constraint "jobs_versionId_fkey" foreign key ("versionId") references "versions"(id) on update restrict on delete restrict;
    end if;

    -- Add jobVersionIdI Index on jobs
    if not exists (select 1 from pg_indexes where tablename = 'jobs' and indexname = 'jobVersionIdI') then
      create index "jobVersionIdI" on "jobs" using btree("versionId");
    end if;

    -- Add branch column to resources
    if not exists (select 1 from information_schema.columns where table_name = 'resources' and column_name = 'branch') then
      alter table "resources" add column "branch" varchar(255);
    end if;

    -- Reindex resourceSubscriptionIdNameU to resourceSubscriptionIdNameBranchU in resources table
    if not exists (select 1 from pg_indexes where tablename = 'resources' and indexname = 'resourceSubscriptionIdNameBranchU') then
      create unique index "resourceSubscriptionIdNameBranchU" on "resources" using btree("subscriptionId", "name", "branch");
    end if;

    if exists (select 1 from pg_indexes where tablename = 'resources' and indexname = 'resourceSubscriptionIdNameU') then
      drop index "resourceSubscriptionIdNameU";
    end if;

    -- drops resourceSubscriptionIdBranch index
    if exists (select 1 from pg_indexes where tablename = 'resources' and indexname = 'resourceSubscriptionIdBranch') then
      drop index "resourceSubscriptionIdBranch";
    end if;

    -- remove outdated routeRoles
    if exists (select 1 from information_schema.columns where table_name = 'routeRoles') then
      delete from "routeRoles" where "routePattern"='/accounts/:id' and "httpVerb"='GET';
      delete from "routeRoles" where "routePattern"='/accounts/:id/dependencies' and "httpVerb"='GET';
      delete from "routeRoles" where "routePattern"='/accounts/:id/sync' and "httpVerb"='GET';
      delete from "routeRoles" where "routePattern"='/accounts/:id/generateSSHKeys' and "httpVerb"='POST';
      delete from "routeRoles" where "routePattern"='/accounts/:id' and "httpVerb"='PUT';
      delete from "routeRoles" where "routePattern"='/accounts/:id' and "httpVerb"='DELETE';
      delete from "routeRoles" where "routePattern"='/accountIntegrations/:id' and "httpVerb"='GET';
      delete from "routeRoles" where "routePattern"='/accountIntegrations/:id/dependencies' and "httpVerb"='GET';
      delete from "routeRoles" where "routePattern"='/accountIntegrations/:id/validateProjectOwnerToken' and "httpVerb"='GET';
      delete from "routeRoles" where "routePattern"='/accountIntegrations/:id' and "httpVerb"='PUT';
      delete from "routeRoles" where "routePattern"='/accountIntegrations/:id' and "httpVerb"='DELETE';
      delete from "routeRoles" where "routePattern"='/clusterNodes/:id' and "httpVerb"='GET';
      delete from "routeRoles" where "routePattern"='/clusterNodes/:id' and "httpVerb"='PUT';
      delete from "routeRoles" where "routePattern"='/clusterNodes/:id' and "httpVerb"='DELETE';
      delete from "routeRoles" where "routePattern"='/clusterNodes/:clusterNodeId/status' and "httpVerb"='POST';
      delete from "routeRoles" where "routePattern"='/systemNodes/:systemNodeId/status' and "httpVerb"='POST';
      delete from "routeRoles" where "routePattern"='/clusterNodes/:id/status' and "httpVerb"='POST';
      delete from "routeRoles" where "routePattern"='/clusterNodes/:id/validate' and "httpVerb"='GET';
      delete from "routeRoles" where "routePattern"='/clusterNodes/:id/initScript' and "httpVerb"='GET';
      delete from "routeRoles" where "routePattern"='/clusterNodeStats/:id' and "httpVerb"='DELETE';
      delete from "routeRoles" where "routePattern"='/clusterNodes/:id/clusterNodeStats' and "httpVerb"='DELETE';
      delete from "routeRoles" where "routePattern"='/clusterNodeStats/:clusterNodeStatId' and "httpVerb"='DELETE';
      delete from "routeRoles" where "routePattern"='/jobCoverageReports/:id' and "httpVerb"='DELETE';
      delete from "routeRoles" where "routePattern"='/subscriptionIntegrations/:id/dependencies' and "httpVerb"='GET';
      delete from "routeRoles" where "routePattern"='/accountTokens/:id' and "httpVerb"='GET';
      delete from "routeRoles" where "routePattern"='/accountTokens/:id' and "httpVerb"='DELETE';
      delete from "routeRoles" where "routePattern"='/transactions/:id' and "httpVerb" = 'GET';
      delete from "routeRoles" where "routePattern"='/transactions/:id/receipt' and "httpVerb" = 'GET';
      delete from "routeRoles" where "routePattern"='/jobDependencies/:id' and "httpVerb" = 'PUT';
      delete from "routeRoles" where "routePattern"='/jobDependencies/:id' and "httpVerb" = 'DELETE';
      delete from "routeRoles" where "routePattern"='/subscriptionIntegrationPermissions/:id' and "httpVerb" = 'DELETE';
      delete from "routeRoles" where "routePattern"='/systemMachineImages/:id' and "httpVerb" = 'GET';
      delete from "routeRoles" where "routePattern"='/providers/:id' and "httpVerb" = 'GET';
      delete from "routeRoles" where "routePattern"='/passthrough/discounts/:id' and "httpVerb" = 'GET';
      delete from "routeRoles" where "routePattern"='/passthrough/jobs/:id/reports' and "httpVerb" = 'GET';
      delete from "routeRoles" where "routePattern"='/accounts/:accountId/sync' and "httpVerb"='GET';
      delete from "routeRoles" where "routePattern"='/projects/:projectId/sync' and "httpVerb"='GET';
      delete from "routeRoles" where "routePattern"='/masterIntegrationCodes' and "httpVerb"='GET';
    end if;

    -- Add "isConsoleArchived" field to buildJobs table
    if not exists (select 1 from information_schema.columns where table_name = 'buildJobs' and column_name = 'isConsoleArchived') then
      alter table "buildJobs" add column "isConsoleArchived" boolean NOT NULL DEFAULT false;
    end if;

    -- Add "isConsoleArchived" field to jobs table
    if not exists (select 1 from information_schema.columns where table_name = 'jobs' and column_name = 'isConsoleArchived') then
      alter table "jobs" add column "isConsoleArchived" boolean NOT NULL DEFAULT false;
    end if;

    -- Add column subnetId in systemMachineImages table
    if not exists (select 1 from information_schema.columns where table_name = 'systemMachineImages' and column_name = 'subnetId') then
      alter table "systemMachineImages" add column "subnetId" varchar(80);
    end if;

    -- drop NOT NULL from subnetId in systemMachineImages table
    if exists (select 1 from information_schema.columns where table_name = 'systemMachineImages' and column_name = 'subnetId') then
      alter table "systemMachineImages" alter column "subnetId" DROP NOT NULL;
    end if;

    -- Adds addOnMinionCount and addOnMinionCountOverridden columns to subscriptions
    if not exists (select 1 from information_schema.columns where table_name = 'subscriptions' and column_name = 'addOnMinionCount') then
      alter table "subscriptions" add column "addOnMinionCount" INTEGER NOT NULL DEFAULT 0;
    end if;
    if not exists (select 1 from information_schema.columns where table_name = 'subscriptions' and column_name = 'addOnMinionCountOverridden') then
      alter table "subscriptions" add column "addOnMinionCountOverridden" BOOLEAN NOT NULL DEFAULT false;
    end if;

    -- Adds maxNodeIdleTimeInHrs and maxNodeIdleTimeOverridden columns to subscriptions
    if not exists (select 1 from information_schema.columns where table_name = 'subscriptions' and column_name = 'maxNodeIdleTimeInHrs') then
      alter table "subscriptions" add column "maxNodeIdleTimeInHrs" INTEGER;
    end if;
    if not exists (select 1 from information_schema.columns where table_name = 'subscriptions' and column_name = 'maxNodeIdleTimeOverridden') then
      alter table "subscriptions" add column "maxNodeIdleTimeOverridden" BOOLEAN;
    end if;
    -- Adds autoUpgradeAgent column to subscriptions
    if not exists (select 1 from information_schema.columns where table_name = 'subscriptions' and column_name = 'autoUpgradeAgent') then
      alter table "subscriptions" add column "autoUpgradeAgent" BOOLEAN;
    end if;
    -- Adds maxNodeIdleTimeInHrs columns to clusterNodes
    if not exists (select 1 from information_schema.columns where table_name = 'clusterNodes' and column_name = 'maxNodeIdleTimeInHrs') then
      alter table "clusterNodes" add column "maxNodeIdleTimeInHrs" INTEGER;
    end if;
  end
$$;

-- Add route Roles
create or replace function set_route_role(
  httpVerb varchar, routePattern varchar, roleCode int)

  returns void as $$
  begin

    -- insert if not exists
    if not exists (select 1 from "routeRoles"
      where "httpVerb" = httpVerb and
        "routePattern" = routePattern and
        "roleCode" = roleCode
    ) then
      insert into "routeRoles" ("httpVerb", "routePattern", "roleCode",
        "createdAt", "updatedAt")
      values (httpVerb, routePattern, roleCode,
        now(), now());
    end if;
  end
$$ LANGUAGE plpgsql;

do $$
  begin

    -- set accounts routeRoles

    perform set_route_role(
      routePattern := '/accounts',
      httpVerb := 'GET',
      roleCode := 6060
    );

    perform set_route_role(
      routePattern := '/accounts/:accountId',
      httpVerb := 'GET',
      roleCode := 6060
    );

    perform set_route_role(
      routePattern := '/accounts/:accountId/dependencies',
      httpVerb := 'GET',
      roleCode := 6060
    );

    perform set_route_role(
      routePattern := '/accounts/:accountId/runStatus',
      httpVerb := 'GET',
      roleCode := 6000
    );

    perform set_route_role(
      routePattern := '/accounts/:accountId/runStatus',
      httpVerb := 'GET',
      roleCode := 6010
    );

    perform set_route_role(
      routePattern := '/accounts/:accountId/runStatus',
      httpVerb := 'GET',
      roleCode := 6020
    );

    perform set_route_role(
      routePattern := '/accounts/:accountId/runStatus',
      httpVerb := 'GET',
      roleCode := 6060
    );

    perform set_route_role(
      routePattern := '/accounts/:accountId/generateSSHKeys',
      httpVerb := 'POST',
      roleCode := 6060
    );

    perform set_route_role(
      routePattern := '/accounts/:accountId',
      httpVerb := 'PUT',
      roleCode := 6060
    );

    perform set_route_role(
      routePattern := '/accounts/:accountId',
      httpVerb := 'DELETE',
      roleCode := 6060
    );

    perform set_route_role(
      routePattern := '/accounts/auth/:systemIntegrationId',
      httpVerb := 'POST',
      roleCode := 6060
    );

    perform set_route_role(
      routePattern := '/accounts/auth/:systemIntegrationId/link',
      httpVerb := 'POST',
      roleCode := 6060
    );

    --set accountCards routeRoles
    perform set_route_role(
      routePattern := '/accountCards/:accountCardId',
      httpVerb := 'GET',
      roleCode := 6060
    );

    perform set_route_role(
      routePattern := '/accountCards',
      httpVerb := 'GET',
      roleCode := 6060
    );

    perform set_route_role(
      routePattern := '/accountCards/:accountCardId',
      httpVerb := 'DELETE',
      roleCode := 6060
    );

    perform set_route_role(
      routePattern := '/accountCards',
      httpVerb := 'POST',
      roleCode := 6060
    );

    perform set_route_role(
      routePattern := '/accountCards/:accountCardId/dependencies',
      httpVerb := 'GET',
      roleCode := 6060
    );

    --set accountIntegration routes

    perform set_route_role(
      routePattern := '/accountIntegrations',
      httpVerb := 'GET',
      roleCode := 6060
    );

    perform set_route_role(
      routePattern := '/accountIntegrations/:accountIntegrationId',
      httpVerb := 'GET',
      roleCode := 6060
    );

    perform set_route_role(
      routePattern := '/accountIntegrations/:accountIntegrationId/dependencies',
      httpVerb := 'GET',
      roleCode := 6060
    );

    perform set_route_role(
      routePattern := '/accountIntegrations/:accountIntegrationId/validateProjectOwnerToken',
      httpVerb := 'GET',
      roleCode := 6060
    );

    perform set_route_role(
      routePattern := '/accountIntegrations',
      httpVerb := 'POST',
      roleCode := 6060
    );

    perform set_route_role(
      routePattern := '/accountIntegrations/:accountIntegrationId',
      httpVerb := 'PUT',
      roleCode := 6060
    );

    perform set_route_role(
      routePattern := '/accountIntegrations/:accountIntegrationId',
      httpVerb := 'DELETE',
      roleCode := 6060
    );

    -- set accountProfiles routeRoles

    perform set_route_role(
      routePattern := '/accountProfiles',
      httpVerb := 'GET',
      roleCode := 6060
    );

    -- set accountRoles routeRoles

    perform set_route_role(
      routePattern := '/accountRoles',
      httpVerb := 'GET',
      roleCode := 6060
    );

    -- set accountTokens routeRoles

    perform set_route_role(
      routePattern := '/accountTokens',
      httpVerb := 'GET',
      roleCode := 6060
    );

    perform set_route_role(
      routePattern := '/accountTokens/:accountTokenId',
      httpVerb := 'GET',
      roleCode := 6060
    );

    perform set_route_role(
      routePattern := '/accountTokens',
      httpVerb := 'POST',
      roleCode := 6060
    );

    perform set_route_role(
      routePattern := '/accountTokens/:accountTokenId',
      httpVerb := 'DELETE',
      roleCode := 6060
    );

    -- set addons routeRoles
    perform set_route_role(
      routePattern := '/addons',
      httpVerb := 'GET',
      roleCode := 6060
    );

    -- set builds routeRoles
    perform set_route_role(
       routePattern := '/builds/:buildId',
       httpVerb := 'GET',
       roleCode := 6110
    );

    perform set_route_role(
      routePattern := '/builds',
      httpVerb := 'GET',
      roleCode := 6000
    );

    perform set_route_role(
      routePattern := '/builds',
      httpVerb := 'GET',
      roleCode := 6010
    );

    perform set_route_role(
      routePattern := '/builds',
      httpVerb := 'GET',
      roleCode := 6020
    );

    perform set_route_role(
      routePattern := '/builds',
      httpVerb := 'GET',
      roleCode := 6060
    );

    perform set_route_role(
      routePattern := '/subscriptions/:subscriptionId/buildStatus',
      httpVerb := 'GET',
      roleCode := 6000
    );

    perform set_route_role(
      routePattern := '/subscriptions/:subscriptionId/buildStatus',
      httpVerb := 'GET',
      roleCode := 6060
    );

    perform set_route_role(
      routePattern := '/builds/:buildId',
      httpVerb := 'GET',
      roleCode := 6000
    );

    perform set_route_role(
      routePattern := '/builds/:buildId',
      httpVerb := 'GET',
      roleCode := 6010
    );

    perform set_route_role(
      routePattern := '/builds/:buildId',
      httpVerb := 'GET',
      roleCode := 6020
    );

    perform set_route_role(
      routePattern := '/builds/:buildId',
      httpVerb := 'GET',
      roleCode := 6060
    );

    perform set_route_role(
      routePattern := '/builds',
      httpVerb := 'POST',
      roleCode := 6010
    );

    perform set_route_role(
      routePattern := '/builds',
      httpVerb := 'POST',
      roleCode := 6020
    );

    perform set_route_role(
      routePattern := '/builds',
      httpVerb := 'POST',
      roleCode := 6060
    );

    perform set_route_role(
      routePattern := '/builds/:buildId',
      httpVerb := 'PUT',
      roleCode := 6010
    );

    perform set_route_role(
      routePattern := '/builds/:buildId',
      httpVerb := 'PUT',
      roleCode := 6020
    );

    perform set_route_role(
      routePattern := '/builds/:buildId',
      httpVerb := 'PUT',
      roleCode := 6060
    );

    perform set_route_role(
      routePattern := '/builds/:buildId',
      httpVerb := 'DELETE',
      roleCode := 6010
    );

    perform set_route_role(
      routePattern := '/builds/:buildId',
      httpVerb := 'DELETE',
      roleCode := 6020
    );

    perform set_route_role(
      routePattern := '/builds/:buildId',
      httpVerb := 'DELETE',
      roleCode := 6060
    );

    -- set buildJobs routeRoles
    perform set_route_role(
      routePattern := '/buildJobs/:buildJobId/artifactUrl',
      httpVerb := 'GET',
      roleCode := 6110
    );

    perform set_route_role(
      routePattern := '/buildJobs',
      httpVerb := 'GET',
      roleCode := 6060
    );

    perform set_route_role(
      routePattern := '/buildJobs',
      httpVerb := 'GET',
      roleCode := 6000
    );

    perform set_route_role(
      routePattern := '/buildJobs',
      httpVerb := 'GET',
      roleCode := 6010
    );

    perform set_route_role(
      routePattern := '/buildJobs',
      httpVerb := 'GET',
      roleCode := 6020
    );

    perform set_route_role(
      routePattern := '/buildJobs',
      httpVerb := 'GET',
      roleCode := 6110
    );

    perform set_route_role(
      routePattern := '/buildJobs/:buildJobId',
      httpVerb := 'GET',
      roleCode := 6060
    );

    perform set_route_role(
      routePattern := '/buildJobs/:buildJobId',
      httpVerb := 'GET',
      roleCode := 6000
    );

    perform set_route_role(
      routePattern := '/buildJobs/:buildJobId',
      httpVerb := 'GET',
      roleCode := 6010
    );

    perform set_route_role(
      routePattern := '/buildJobs/:buildJobId',
      httpVerb := 'GET',
      roleCode := 6020
    );

    perform set_route_role(
      routePattern := '/buildJobs/:buildJobId/artifactUrl',
      httpVerb := 'GET',
      roleCode := 6000
    );

    perform set_route_role(
      routePattern := '/buildJobs/:buildJobId/artifactUrl',
      httpVerb := 'GET',
      roleCode := 6010
    );

    perform set_route_role(
      routePattern := '/buildJobs/:buildJobId/artifactUrl',
      httpVerb := 'GET',
      roleCode := 6020
    );

    perform set_route_role(
      routePattern := '/buildJobs/:buildJobId/artifactUrl',
      httpVerb := 'GET',
      roleCode := 6060
    );

    perform set_route_role(
      routePattern := '/buildJobs',
      httpVerb := 'POST',
      roleCode := 6060
    );

    perform set_route_role(
      routePattern := '/buildJobs',
      httpVerb := 'POST',
      roleCode := 6010
    );

    perform set_route_role(
      routePattern := '/buildJobs',
      httpVerb := 'POST',
      roleCode := 6020
    );

    perform set_route_role(
      routePattern := '/buildJobs/:buildJobId',
      httpVerb := 'PUT',
      roleCode := 6060
    );

    perform set_route_role(
      routePattern := '/buildJobs/:buildJobId',
      httpVerb := 'PUT',
      roleCode := 6010
    );

    perform set_route_role(
      routePattern := '/buildJobs/:buildJobId',
      httpVerb := 'PUT',
      roleCode := 6020
    );

    perform set_route_role(
      routePattern := '/buildJobs/:buildJobId',
      httpVerb := 'DELETE',
      roleCode := 6060
    );

    perform set_route_role(
      routePattern := '/buildJobs/:buildJobId',
      httpVerb := 'DELETE',
      roleCode := 6010
    );

    perform set_route_role(
      routePattern := '/buildJobs/:buildJobId',
      httpVerb := 'DELETE',
      roleCode := 6020
    );

    -- set buildJobConsoles routeRoles

    perform set_route_role(
      routePattern := '/buildJobs/:buildJobId/consoles',
      httpVerb := 'GET',
      roleCode := 6000
    );

    perform set_route_role(
      routePattern := '/buildJobs/:buildJobId/consoles',
      httpVerb := 'GET',
      roleCode := 6010
    );

    perform set_route_role(
      routePattern := '/buildJobs/:buildJobId/consoles',
      httpVerb := 'GET',
      roleCode := 6020
    );

    perform set_route_role(
      routePattern := '/buildJobs/:buildJobId/consoles',
      httpVerb := 'GET',
      roleCode := 6060
    );

    perform set_route_role(
      routePattern := '/buildJobs/:buildJobId/consoles',
      httpVerb := 'GET',
      roleCode := 6110
    );

    perform set_route_role(
      routePattern := '/buildJobs/:buildJobId/consoles',
      httpVerb := 'DELETE',
      roleCode := 6010
    );

    perform set_route_role(
      routePattern := '/buildJobs/:buildJobId/consoles',
      httpVerb := 'DELETE',
      roleCode := 6020
    );

    perform set_route_role(
      routePattern := '/buildJobs/:buildJobId/consoles',
      httpVerb := 'DELETE',
      roleCode := 6060
    );

    -- set systemClusters routeRoles
    perform set_route_role(
      routePattern := '/systemClusters',
      httpVerb := 'GET',
      roleCode := 6060
    );

    -- set clusters routeRoles
    perform set_route_role(
      routePattern := '/clusters',
      httpVerb := 'GET',
      roleCode := 6060
    );

    perform set_route_role(
      routePattern := '/clusters',
      httpVerb := 'GET',
      roleCode := 6000
    );

    perform set_route_role(
      routePattern := '/clusters',
      httpVerb := 'GET',
      roleCode := 6010
    );

    perform set_route_role(
      routePattern := '/clusters',
      httpVerb := 'GET',
      roleCode := 6020
    );

    perform set_route_role(
      routePattern := '/clusters',
      httpVerb := 'POST',
      roleCode := 6010
    );

    perform set_route_role(
      routePattern := '/clusters',
      httpVerb := 'POST',
      roleCode := 6020
    );

    perform set_route_role(
      routePattern := '/clusters',
      httpVerb := 'POST',
      roleCode := 6060
    );

    perform set_route_role(
      routePattern := '/clusters/:clusterId',
      httpVerb := 'PUT',
      roleCode := 6010
    );

    perform set_route_role(
      routePattern := '/clusters/:clusterId',
      httpVerb := 'PUT',
      roleCode := 6020
    );

    perform set_route_role(
      routePattern := '/clusters/:clusterId',
      httpVerb := 'PUT',
      roleCode := 6060
    );

    perform set_route_role(
      routePattern := '/clusters/:clusterId',
      httpVerb := 'DELETE',
      roleCode := 6010
    );

    perform set_route_role(
      routePattern := '/clusters/:clusterId',
      httpVerb := 'DELETE',
      roleCode := 6020
    );

    perform set_route_role(
      routePattern := '/clusters/:clusterId',
      httpVerb := 'DELETE',
      roleCode := 6060
    );

    -- set clusterNodes routeRoles

    perform set_route_role(
      routePattern := '/clusterNodes',
      httpVerb := 'GET',
      roleCode := 6060
    );

    perform set_route_role(
      routePattern := '/clusterNodes',
      httpVerb := 'GET',
      roleCode := 6000
    );

    perform set_route_role(
      routePattern := '/clusterNodes',
      httpVerb := 'GET',
      roleCode := 6010
    );

    perform set_route_role(
      routePattern := '/clusterNodes',
      httpVerb := 'GET',
      roleCode := 6020
    );

    perform set_route_role(
      routePattern := '/clusterNodes/:clusterNodeId',
      httpVerb := 'GET',
      roleCode := 6000
    );

    perform set_route_role(
      routePattern := '/clusterNodes/:clusterNodeId',
      httpVerb := 'GET',
      roleCode := 6010
    );

    perform set_route_role(
      routePattern := '/clusterNodes/:clusterNodeId',
      httpVerb := 'GET',
      roleCode := 6020
    );

    perform set_route_role(
      routePattern := '/clusterNodes/:clusterNodeId',
      httpVerb := 'GET',
      roleCode := 6060
    );

     perform set_route_role(
       routePattern := '/clusterNodes/:clusterNodeId/validate',
       httpVerb := 'GET',
       roleCode := 6000
     );

     perform set_route_role(
       routePattern := '/clusterNodes/:clusterNodeId/validate',
       httpVerb := 'GET',
       roleCode := 6010
     );

     perform set_route_role(
       routePattern := '/clusterNodes/:clusterNodeId/validate',
       httpVerb := 'GET',
       roleCode := 6020
     );

     perform set_route_role(
       routePattern := '/clusterNodes/:clusterNodeId/validate',
       httpVerb := 'GET',
       roleCode := 6040
     );

     perform set_route_role(
       routePattern := '/clusterNodes/:clusterNodeId/validate',
       httpVerb := 'GET',
       roleCode := 6060
     );

    perform set_route_role(
      routePattern := '/clusterNodes/:clusterNodeId/initScript',
      httpVerb := 'GET',
      roleCode := 6000
    );

    perform set_route_role(
      routePattern := '/clusterNodes/:clusterNodeId/initScript',
      httpVerb := 'GET',
      roleCode := 6010
    );

    perform set_route_role(
      routePattern := '/clusterNodes/:clusterNodeId/initScript',
      httpVerb := 'GET',
      roleCode := 6020
    );

    perform set_route_role(
      routePattern := '/clusterNodes/:clusterNodeId/initScript',
      httpVerb := 'GET',
      roleCode := 6060
    );

    perform set_route_role(
      routePattern := '/clusterNodes/:clusterNodeId',
      httpVerb := 'DELETE',
      roleCode := 6010
    );

    perform set_route_role(
      routePattern := '/clusterNodes/:clusterNodeId',
      httpVerb := 'DELETE',
      roleCode := 6020
    );

    perform set_route_role(
      routePattern := '/clusterNodes/:clusterNodeId',
      httpVerb := 'DELETE',
      roleCode := 6060
    );

    perform set_route_role(
      routePattern := '/clusterNodes/:clusterNodeId',
      httpVerb := 'PUT',
      roleCode := 6010
    );

    perform set_route_role(
      routePattern := '/clusterNodes/:clusterNodeId',
      httpVerb := 'PUT',
      roleCode := 6020
    );

    perform set_route_role(
      routePattern := '/clusterNodes/:clusterNodeId',
      httpVerb := 'PUT',
      roleCode := 6040
    );

    perform set_route_role(
      routePattern := '/clusterNodes/:clusterNodeId',
      httpVerb := 'PUT',
      roleCode := 6060
    );

    perform set_route_role(
      routePattern := '/clusterNodes',
      httpVerb := 'POST',
      roleCode := 6010
    );

    perform set_route_role(
      routePattern := '/clusterNodes',
      httpVerb := 'POST',
      roleCode := 6020
    );

    perform set_route_role(
      routePattern := '/clusterNodes',
      httpVerb := 'POST',
      roleCode := 6060
    );

    -- set cluster node consoles route roles
    perform set_route_role(
      routePattern := '/clusterNodes/:clusterNodeId/clusterNodeConsoles',
      httpVerb := 'GET',
      roleCode := 6060
    );

    perform set_route_role(
      routePattern := '/clusterNodes/:clusterNodeId/clusterNodeConsoles',
      httpVerb := 'GET',
      roleCode := 6000
    );

    perform set_route_role(
      routePattern := '/clusterNodes/:clusterNodeId/clusterNodeConsoles',
      httpVerb := 'GET',
      roleCode := 6010
    );

    perform set_route_role(
      routePattern := '/clusterNodes/:clusterNodeId/clusterNodeConsoles',
      httpVerb := 'GET',
      roleCode := 6020
    );

    -- set clusterNodeStats routeRoles
    perform set_route_role(
      routePattern := '/clusterNodeStats',
      httpVerb := 'GET',
      roleCode := 6000
    );

    perform set_route_role(
      routePattern := '/clusterNodeStats',
      httpVerb := 'GET',
      roleCode := 6010
    );

    perform set_route_role(
      routePattern := '/clusterNodeStats',
      httpVerb := 'GET',
      roleCode := 6020
    );

    perform set_route_role(
      routePattern := '/clusterNodeStats',
      httpVerb := 'GET',
      roleCode := 6060
    );

    perform set_route_role(
      routePattern := '/clusterNodeStats',
      httpVerb := 'POST',
      roleCode := 6010
    );

    perform set_route_role(
      routePattern := '/clusterNodeStats',
      httpVerb := 'POST',
      roleCode := 6020
    );

    perform set_route_role(
      routePattern := '/clusterNodeStats',
      httpVerb := 'POST',
      roleCode := 6040
    );

    perform set_route_role(
      routePattern := '/clusterNodeStats',
      httpVerb := 'POST',
      roleCode := 6060
    );

    perform set_route_role(
      routePattern := '/clusterNodes/:clusterNodeId/clusterNodeStats',
      httpVerb := 'DELETE',
      roleCode := 6010
    );

    perform set_route_role(
      routePattern := '/clusterNodes/:clusterNodeId/clusterNodeStats',
      httpVerb := 'DELETE',
      roleCode := 6020
    );

    perform set_route_role(
      routePattern := '/clusterNodes/:clusterNodeId/clusterNodeStats',
      httpVerb := 'DELETE',
      roleCode := 6060
    );


    -- set externalCI routeRoles
    perform set_route_role(
      routePattern := '/externalCI',
      httpVerb := 'POST',
      roleCode := 6010
    );

    perform set_route_role(
      routePattern := '/externalCI',
      httpVerb := 'POST',
      roleCode := 6020
    );

    perform set_route_role(
      routePattern := '/externalCI',
      httpVerb := 'POST',
      roleCode := 6060
    );

    -- set jobConsoles Roles

    perform set_route_role(
      routePattern := '/jobs/:jobId/consoles',
      httpVerb := 'GET',
      roleCode := 6000
    );

    perform set_route_role(
      routePattern := '/jobs/:jobId/consoles',
      httpVerb := 'GET',
      roleCode := 6010
    );

    perform set_route_role(
      routePattern := '/jobs/:jobId/consoles',
      httpVerb := 'GET',
      roleCode := 6020
    );

    perform set_route_role(
      routePattern := '/jobs/:jobId/consoles',
      httpVerb := 'GET',
      roleCode := 6040
    );

    perform set_route_role(
      routePattern := '/jobs/:jobId/consoles',
      httpVerb := 'GET',
      roleCode := 6060
    );

    perform set_route_role(
      routePattern := '/jobs/:jobId/consoles',
      httpVerb := 'DELETE',
      roleCode := 6010
    );

    perform set_route_role(
      routePattern := '/jobs/:jobId/consoles',
      httpVerb := 'DELETE',
      roleCode := 6020
    );

    perform set_route_role(
      routePattern := '/jobs/:jobId/consoles',
      httpVerb := 'DELETE',
      roleCode := 6060
    );

    -- set jobDependencies Roles

    perform set_route_role(
      routePattern := '/jobDependencies',
      httpVerb := 'GET',
      roleCode := 6000
    );

    perform set_route_role(
      routePattern := '/jobDependencies',
      httpVerb := 'GET',
      roleCode := 6060
    );

    perform set_route_role(
      routePattern := '/jobDependencies/:jobDependencyId',
      httpVerb := 'GET',
      roleCode := 6000
    );

    perform set_route_role(
      routePattern := '/jobDependencies/:jobDependencyId',
      httpVerb := 'GET',
      roleCode := 6060
    );

    perform set_route_role(
      routePattern := '/jobDependencies',
      httpVerb := 'POST',
      roleCode := 6000
    );

    perform set_route_role(
      routePattern := '/jobDependencies',
      httpVerb := 'POST',
      roleCode := 6060
    );

    perform set_route_role(
      routePattern := '/jobDependencies/:jobDependencyId',
      httpVerb := 'PUT',
      roleCode := 6000
    );

    perform set_route_role(
      routePattern := '/jobDependencies/:jobDependencyId',
      httpVerb := 'PUT',
      roleCode := 6060
    );

    perform set_route_role(
      routePattern := '/jobDependencies/:jobDependencyId',
      httpVerb := 'DELETE',
      roleCode := 6000
    );

    perform set_route_role(
      routePattern := '/jobDependencies/:jobDependencyId',
      httpVerb := 'DELETE',
      roleCode := 6060
    );

    -- set jobCoverageReports routeRoles
    perform set_route_role(
      routePattern := '/jobCoverageReports',
      httpVerb := 'GET',
      roleCode := 6000
    );

    perform set_route_role(
      routePattern := '/jobCoverageReports',
      httpVerb := 'GET',
      roleCode := 6010
    );

    perform set_route_role(
      routePattern := '/jobCoverageReports',
      httpVerb := 'GET',
      roleCode := 6020
    );

    perform set_route_role(
      routePattern := '/jobCoverageReports',
      httpVerb := 'GET',
      roleCode := 6040
    );

    perform set_route_role(
      routePattern := '/jobCoverageReports',
      httpVerb := 'GET',
      roleCode := 6060
    );

    perform set_route_role(
      routePattern := '/jobs/:jobId/jobCoverageReports',
      httpVerb := 'GET',
      roleCode := 6000
    );

    perform set_route_role(
      routePattern := '/jobs/:jobId/jobCoverageReports',
      httpVerb := 'GET',
      roleCode := 6010
    );

    perform set_route_role(
      routePattern := '/jobs/:jobId/jobCoverageReports',
      httpVerb := 'GET',
      roleCode := 6020
    );

    perform set_route_role(
      routePattern := '/jobs/:jobId/jobCoverageReports',
      httpVerb := 'GET',
      roleCode := 6040
    );

    perform set_route_role(
      routePattern := '/jobs/:jobId/jobCoverageReports',
      httpVerb := 'GET',
      roleCode := 6060
    );

    perform set_route_role(
      routePattern := '/jobCoverageReports',
      httpVerb := 'POST',
      roleCode := 6010
    );

    perform set_route_role(
      routePattern := '/jobCoverageReports',
      httpVerb := 'POST',
      roleCode := 6020
    );

    perform set_route_role(
      routePattern := '/jobCoverageReports',
      httpVerb := 'POST',
      roleCode := 6060
    );

    perform set_route_role(
      routePattern := '/jobCoverageReports/:jobCoverageReportId',
      httpVerb := 'DELETE',
      roleCode := 6010
    );

    perform set_route_role(
      routePattern := '/jobCoverageReports/:jobCoverageReportId',
      httpVerb := 'DELETE',
      roleCode := 6020
    );

    perform set_route_role(
      routePattern := '/jobCoverageReports/:jobCoverageReportId',
      httpVerb := 'DELETE',
      roleCode := 6060
    );

    -- set jobs routeRoles

    perform set_route_role(
      routePattern := '/jobs',
      httpVerb := 'GET',
      roleCode := 6000
    );

    perform set_route_role(
      routePattern := '/jobs',
      httpVerb := 'GET',
      roleCode := 6010
    );

    perform set_route_role(
      routePattern := '/jobs',
      httpVerb := 'GET',
      roleCode := 6020
    );

    perform set_route_role(
      routePattern := '/jobs',
      httpVerb := 'GET',
      roleCode := 6040
    );

    perform set_route_role(
      routePattern := '/jobs',
      httpVerb := 'GET',
      roleCode := 6060
    );

    perform set_route_role(
      routePattern := '/jobs/:jobId',
      httpVerb := 'GET',
      roleCode := 6000
    );

    perform set_route_role(
      routePattern := '/jobs/:jobId',
      httpVerb := 'GET',
      roleCode := 6010
    );

    perform set_route_role(
      routePattern := '/jobs/:jobId',
      httpVerb := 'GET',
      roleCode := 6020
    );

    perform set_route_role(
      routePattern := '/jobs/:jobId',
      httpVerb := 'GET',
      roleCode := 6040
    );

    perform set_route_role(
      routePattern := '/jobs/:jobId',
      httpVerb := 'GET',
      roleCode := 6060
    );

    perform set_route_role(
      routePattern := '/jobs/:jobId',
      httpVerb := 'PUT',
      roleCode := 6010
    );

    perform set_route_role(
      routePattern := '/jobs/:jobId',
      httpVerb := 'PUT',
      roleCode := 6020
    );

    perform set_route_role(
      routePattern := '/jobs/:jobId',
      httpVerb := 'PUT',
      roleCode := 6060
    );

    perform set_route_role(
      routePattern := '/jobs/:jobId',
      httpVerb := 'DELETE',
      roleCode := 6010
    );

    perform set_route_role(
      routePattern := '/jobs/:jobId',
      httpVerb := 'DELETE',
      roleCode := 6020
    );

    perform set_route_role(
      routePattern := '/jobs/:jobId',
      httpVerb := 'DELETE',
      roleCode := 6060
    );

    perform set_route_role(
      routePattern := '/jobs/:jobId/artifactUrl',
      httpVerb := 'GET',
      roleCode := 6000
    );

    perform set_route_role(
      routePattern := '/jobs/:jobId/artifactUrl',
      httpVerb := 'GET',
      roleCode := 6010
    );

    perform set_route_role(
      routePattern := '/jobs/:jobId/artifactUrl',
      httpVerb := 'GET',
      roleCode := 6020
    );

    perform set_route_role(
      routePattern := '/jobs/:jobId/artifactUrl',
      httpVerb := 'GET',
      roleCode := 6040
    );

    perform set_route_role(
      routePattern := '/jobs/:jobId/artifactUrl',
      httpVerb := 'GET',
      roleCode := 6060
    );

    -- set jobTestReports routeRoles

    perform set_route_role(
      routePattern := '/jobTestReports',
      httpverb := 'GET',
      roleCode := 6000
    );

    perform set_route_role(
      routePattern := '/jobTestReports',
      httpverb := 'GET',
      roleCode := 6010
    );

    perform set_route_role(
      routePattern := '/jobTestReports',
      httpverb := 'GET',
      roleCode := 6020
    );

    perform set_route_role(
      routePattern := '/jobTestReports',
      httpverb := 'GET',
      roleCode := 6040
    );

    perform set_route_role(
      routePattern := '/jobTestReports',
      httpverb := 'GET',
      roleCode := 6060
    );

    perform set_route_role(
      routePattern := '/jobs/:jobId/jobTestReports',
      httpverb := 'GET',
      roleCode := 6000
    );

    perform set_route_role(
      routePattern := '/jobs/:jobId/jobTestReports',
      httpverb := 'GET',
      roleCode := 6010
    );

    perform set_route_role(
      routePattern := '/jobs/:jobId/jobTestReports',
      httpverb := 'GET',
      roleCode := 6020
    );

    perform set_route_role(
      routePattern := '/jobs/:jobId/jobTestReports',
      httpverb := 'GET',
      roleCode := 6040
    );

    perform set_route_role(
      routePattern := '/jobs/:jobId/jobTestReports',
      httpverb := 'GET',
      roleCode := 6060
    );

    perform set_route_role(
      routePattern := '/jobTestReports/:jobTestReportId',
      httpverb := 'DELETE',
      roleCode := 6010
    );

    perform set_route_role(
      routePattern := '/jobTestReports/:jobTestReportId',
      httpverb := 'DELETE',
      roleCode := 6020
    );

    perform set_route_role(
      routePattern := '/jobTestReports/:jobTestReportId',
      httpverb := 'DELETE',
      roleCode := 6060
    );

    perform set_route_role(
      routePattern := '/jobTestReports',
      httpVerb := 'POST',
      roleCode := 6010
    );

    perform set_route_role(
      routePattern := '/jobTestReports',
      httpVerb := 'POST',
      roleCode := 6020
    );

    perform set_route_role(
      routePattern := '/jobTestReports',
      httpVerb := 'POST',
      roleCode := 6060
    );

    -- set jobStatesMap routeRoles

    perform set_route_role(
      routePattern := '/jobStatesMap',
      httpVerb := 'GET',
      roleCode := 6000
    );

    perform set_route_role(
      routePattern := '/jobStatesMap',
      httpVerb := 'GET',
      roleCode := 6010
    );

    perform set_route_role(
      routePattern := '/jobStatesMap',
      httpVerb := 'GET',
      roleCode := 6020
    );

    perform set_route_role(
      routePattern := '/jobStatesMap',
      httpVerb := 'GET',
      roleCode := 6040
    );

    perform set_route_role(
      routePattern := '/jobStatesMap',
      httpVerb := 'GET',
      roleCode := 6060
    );

    -- set masterIntegrations routeRoles

    perform set_route_role(
      routePattern := '/masterIntegrations',
      httpVerb := 'GET',
      roleCode := 6060
    );

    -- set masterIntegrationFields routeRoles

    perform set_route_role(
      routePattern := '/masterIntegrationFields',
      httpVerb := 'GET',
      roleCode := 6060
    );

    -- set masterIntegrationTypeCodes routeRoles

    perform set_route_role(
      routePattern := '/masterIntegrationTypeCodes',
      httpVerb := 'GET',
      roleCode := 6040
    );

    -- set passthrough routeRoles
    perform set_route_role(
      routePattern := '/passthrough/accounts/:accountId/projects',
      httpVerb := 'POST',
      roleCode := 6060
    );

    perform set_route_role(
      routePattern := '/passthrough/accounts/:accountId/projects/:projectId',
      httpVerb := 'DELETE',
      roleCode := 6000
    );

    perform set_route_role(
      routePattern := '/passthrough/accounts/:accountId/projects/:projectId',
      httpVerb := 'DELETE',
      roleCode := 6010
    );

    perform set_route_role(
      routePattern := '/passthrough/accounts/:accountId/projects/:projectId',
      httpVerb := 'DELETE',
      roleCode := 6020
    );

    perform set_route_role(
      routePattern := '/passthrough/accounts/:accountId/projects/:projectId',
      httpVerb := 'DELETE',
      roleCode := 6060
    );

    -- Allow justUser to access the route.
    perform set_route_role(
      routePattern := '/passthrough/contactSupport',
      httpVerb := 'POST',
      roleCode := 6060
    );

    perform set_route_role(
      routePattern := '/passthrough/discounts/:discountId',
      httpVerb := 'GET',
      roleCode := 6000
    );

    perform set_route_role(
      routePattern := '/passthrough/discounts/:discountId',
      httpVerb := 'GET',
      roleCode := 6010
    );

    perform set_route_role(
      routePattern := '/passthrough/discounts/:discountId',
      httpVerb := 'GET',
      roleCode := 6020
    );

    perform set_route_role(
      routePattern := '/passthrough/discounts/:discountId',
      httpVerb := 'GET',
      roleCode := 6060
    );

    perform set_route_role(
      routePattern := '/passthrough/jobs/:jobId/reports',
      httpVerb := 'GET',
      roleCode := 6010
    );

    perform set_route_role(
      routePattern := '/passthrough/jobs/:jobId/reports',
      httpVerb := 'GET',
      roleCode := 6020
    );

    perform set_route_role(
      routePattern := '/passthrough/jobs/:jobId/reports',
      httpVerb := 'GET',
      roleCode := 6040
    );

    perform set_route_role(
      routePattern := '/passthrough/jobs/:jobId/reports',
      httpVerb := 'GET',
      roleCode := 6060
    );

    perform set_route_role(
      routePattern := '/passthrough/projects/:projectId/ymls',
      httpVerb := 'GET',
      roleCode := 6000
    );

    perform set_route_role(
      routePattern := '/passthrough/projects/:projectId/ymls',
      httpVerb := 'GET',
      roleCode := 6010
    );

    perform set_route_role(
      routePattern := '/passthrough/projects/:projectId/ymls',
      httpVerb := 'GET',
      roleCode := 6020
    );

    perform set_route_role(
      routePattern := '/passthrough/projects/:projectId/ymls',
      httpVerb := 'GET',
      roleCode := 6060
    );

    perform set_route_role(
      routePattern := '/passthrough/nodes/scripts',
      httpVerb := 'GET',
      roleCode := 6060
    );

    perform set_route_role(
      routePattern := '/passthrough/nodes/platforms',
      httpVerb := 'GET',
      roleCode := 6060
    );

    -- subscription customReports route
    perform set_route_role(
      routePattern := '/passthrough/subscriptions/:subscriptionId/customReports',
      httpVerb := 'POST',
      roleCode := 6060
    );

    perform set_route_role(
      routePattern := '/passthrough/subscriptions/:subscriptionId/customReports',
      httpVerb := 'POST',
      roleCode := 6020
    );

    perform set_route_role(
      routePattern := '/passthrough/subscriptions/:subscriptionId/customReports',
      httpVerb := 'POST',
      roleCode := 6010
    );

    -- projects customReports route
    perform set_route_role(
      routePattern := '/passthrough/projects/:projectId/customReports',
      httpVerb := 'POST',
      roleCode := 6060
    );

    perform set_route_role(
      routePattern := '/passthrough/projects/:projectId/customReports',
      httpVerb := 'POST',
      roleCode := 6020
    );

    perform set_route_role(
      routePattern := '/passthrough/projects/:projectId/customReports',
      httpVerb := 'POST',
      roleCode := 6010
    );

    -- jobs customReports route
    perform set_route_role(
      routePattern := '/passthrough/resources/:resourceId/customReports',
      httpVerb := 'POST',
      roleCode := 6060
    );

    perform set_route_role(
      routePattern := '/passthrough/resources/:resourceId/customReports',
      httpVerb := 'POST',
      roleCode := 6020
    );

    perform set_route_role(
      routePattern := '/passthrough/resources/:resourceId/customReports',
      httpVerb := 'POST',
      roleCode := 6010
    );

    -- Allow justUser to access the route.
    perform set_route_role(
      routePattern := '/passthrough/subscriptions/:subscriptionId/grisham',
      httpVerb := 'POST',
      roleCode := 6060
    );

    -- Allow admins of subscriptions to access the route.
    perform set_route_role(
      routePattern := '/passthrough/subscriptions/:subscriptionId/grisham',
      httpVerb := 'POST',
      roleCode := 6020
    );

    -- Allow admins of subscriptions to access the route.
    perform set_route_role(
      routePattern := '/passthrough/jira/:subscriptionIntegrationId/issueTypes',
      httpVerb := 'GET',
      roleCode := 6020
    );

    -- Allow collabs of subscriptions to access the route.
    perform set_route_role(
      routePattern := '/passthrough/jira/:subscriptionIntegrationId/issueTypes',
      httpVerb := 'GET',
      roleCode := 6010
    );

    -- Allow members of subscriptions to access the route.
    perform set_route_role(
      routePattern := '/passthrough/jira/:subscriptionIntegrationId/issueTypes',
      httpVerb := 'GET',
      roleCode := 6000
    );

    -- Allow justUsers of subscriptions to access the route.
    perform set_route_role(
      routePattern := '/passthrough/jira/:subscriptionIntegrationId/issueTypes',
      httpVerb := 'GET',
      roleCode := 6060
    );

    -- Allow admins of subscriptions to access the route.
    perform set_route_role(
      routePattern := '/passthrough/jira/:subscriptionIntegrationId/projects',
      httpVerb := 'GET',
      roleCode := 6020
    );

    -- Allow collabs of subscriptions to access the route.
    perform set_route_role(
      routePattern := '/passthrough/jira/:subscriptionIntegrationId/projects',
      httpVerb := 'GET',
      roleCode := 6010
    );

    -- Allow members of subscriptions to access the route.
    perform set_route_role(
      routePattern := '/passthrough/jira/:subscriptionIntegrationId/projects',
      httpVerb := 'GET',
      roleCode := 6000
    );

    -- Allow justUsers of subscriptions to access the route.
    perform set_route_role(
      routePattern := '/passthrough/jira/:subscriptionIntegrationId/projects',
      httpVerb := 'GET',
      roleCode := 6060
    );

    -- Allow admins of subscriptions to access the route.
    perform set_route_role(
      routePattern := '/passthrough/jira/:subscriptionIntegrationId/issue',
      httpVerb := 'POST',
      roleCode := 6020
    );

    -- Allow collabs of subscriptions to access the route.
    perform set_route_role(
      routePattern := '/passthrough/jira/:subscriptionIntegrationId/issue',
      httpVerb := 'POST',
      roleCode := 6010
    );

    -- Allow members of subscriptions to access the route.
    perform set_route_role(
      routePattern := '/passthrough/jira/:subscriptionIntegrationId/issue',
      httpVerb := 'POST',
      roleCode := 6000
    );

    -- Allow justUsers of subscriptions to access the route.
    perform set_route_role(
      routePattern := '/passthrough/jira/:subscriptionIntegrationId/issue',
      httpVerb := 'POST',
      roleCode := 6060
    );

    --set payments routeRoles
    perform set_route_role(
      routePattern := '/payments/clienttoken',
      httpVerb := 'GET',
      roleCode := 6060
    );

    -- set plans routeRoles
    perform set_route_role(
      routePattern := '/plans',
      httpVerb := 'GET',
      roleCode := 6060
    );

    -- set projects routeRoles
    perform set_route_role(
      routePattern := '/projects',
      httpVerb := 'GET',
      roleCode := 6000
    );

    perform set_route_role(
      routePattern := '/projects',
      httpVerb := 'GET',
      roleCode := 6010
    );

    perform set_route_role(
      routePattern := '/projects',
      httpVerb := 'GET',
      roleCode := 6020
    );

    perform set_route_role(
      routePattern := '/projects',
      httpVerb := 'GET',
      roleCode := 6040
    );

    perform set_route_role(
      routePattern := '/projects',
      httpVerb := 'GET',
      roleCode := 6060
    );

    perform set_route_role(
      routePattern := '/projects/:projectId',
      httpVerb := 'GET',
      roleCode := 6000
    );

    perform set_route_role(
      routePattern := '/projects/:projectId',
      httpVerb := 'GET',
      roleCode := 6010
    );

    perform set_route_role(
      routePattern := '/projects/:projectId',
      httpVerb := 'GET',
      roleCode := 6020
    );

    perform set_route_role(
      routePattern := '/projects/:projectId',
      httpVerb := 'GET',
      roleCode := 6040
    );

    perform set_route_role(
      routePattern := '/projects/:projectId',
      httpVerb := 'GET',
      roleCode := 6060
    );

    perform set_route_role(
      routePattern := '/projects/:projectId/branchRunStatus',
      httpVerb := 'GET',
      roleCode := 6000
    );

    perform set_route_role(
      routePattern := '/projects/:projectId/branchRunStatus',
      httpVerb := 'GET',
      roleCode := 6010
    );

    perform set_route_role(
      routePattern := '/projects/:projectId/branchRunStatus',
      httpVerb := 'GET',
      roleCode := 6020
    );

    perform set_route_role(
      routePattern := '/projects/:projectId/branchRunStatus',
      httpVerb := 'GET',
      roleCode := 6040
    );

    perform set_route_role(
      routePattern := '/projects/:projectId/branchRunStatus',
      httpVerb := 'GET',
      roleCode := 6060
    );

    perform set_route_role(
      routePattern := '/projects/:projectId/collaborators',
      httpVerb := 'GET',
      roleCode := 6020
    );

    perform set_route_role(
      routePattern := '/projects/:projectId/collaborators',
      httpVerb := 'GET',
      roleCode := 6060
    );

    perform set_route_role(
      routePattern := '/projects/:projectId/createCi',
      httpVerb := 'POST',
      roleCode := 6010
    );

    perform set_route_role(
      routePattern := '/projects/:projectId/createCi',
      httpVerb := 'POST',
      roleCode := 6020
    );

    perform set_route_role(
      routePattern := '/projects/:projectId/createCi',
      httpVerb := 'POST',
      roleCode := 6060
    );

    perform set_route_role(
      routePattern := '/projects/:projectId/disable',
      httpVerb := 'POST',
      roleCode := 6020
    );

    perform set_route_role(
      routePattern := '/projects/:projectId/disable',
      httpVerb := 'POST',
      roleCode := 6060
    );

    perform set_route_role(
      routePattern := '/projects/:projectId/owners',
      httpVerb := 'GET',
      roleCode := 6020
    );

    perform set_route_role(
      routePattern := '/projects/:projectId/owners',
      httpVerb := 'GET',
      roleCode := 6060
    );

    perform set_route_role(
      routePattern := '/projects/:projectId/reset',
      httpVerb := 'POST',
      roleCode := 6020
    );

    perform set_route_role(
      routePattern := '/projects/:projectId/reset',
      httpVerb := 'POST',
      roleCode := 6060
    );

    perform set_route_role(
      routePattern := '/projects/:projectId/enable',
      httpVerb := 'POST',
      roleCode := 6010
    );

    perform set_route_role(
      routePattern := '/projects/:projectId/enable',
      httpVerb := 'POST',
      roleCode := 6020
    );

    perform set_route_role(
      routePattern := '/projects/:projectId/enable',
      httpVerb := 'POST',
      roleCode := 6060
    );

    perform set_route_role(
      routePattern := '/projects/:projectId/scm',
      httpVerb := 'POST',
      roleCode := 6010
    );

    perform set_route_role(
      routePattern := '/projects/:projectId/scm',
      httpVerb := 'POST',
      roleCode := 6020
    );

    perform set_route_role(
      routePattern := '/projects/:projectId/scm',
      httpVerb := 'POST',
      roleCode := 6060
    );

    perform set_route_role(
      routePattern := '/projects/:projectId/scm',
      httpVerb := 'DELETE',
      roleCode := 6010
    );

    perform set_route_role(
      routePattern := '/projects/:projectId/scm',
      httpVerb := 'DELETE',
      roleCode := 6020
    );

    perform set_route_role(
      routePattern := '/projects/:projectId/scm',
      httpVerb := 'DELETE',
      roleCode := 6060
    );

    perform set_route_role(
      routePattern := '/projects/:projectId',
      httpVerb := 'PUT',
      roleCode := 6010
    );

    perform set_route_role(
      routePattern := '/projects/:projectId',
      httpVerb := 'PUT',
      roleCode := 6020
    );

    perform set_route_role(
      routePattern := '/projects/:projectId',
      httpVerb := 'PUT',
      roleCode := 6060
    );

    perform set_route_role(
      routePattern := '/projects/:projectId/decrypt',
      httpVerb := 'POST',
      roleCode := 6020
    );

    perform set_route_role(
      routePattern := '/projects/:projectId/decrypt',
      httpVerb := 'POST',
      roleCode := 6060
    );

    perform set_route_role(
      routePattern := '/projects/:projectId/newBuild',
      httpVerb := 'POST',
      roleCode := 6010
    );

    perform set_route_role(
      routePattern := '/projects/:projectId/newBuild',
      httpVerb := 'POST',
      roleCode := 6020
    );

    perform set_route_role(
      routePattern := '/projects/:projectId/newBuild',
      httpVerb := 'POST',
      roleCode := 6050
    );

    perform set_route_role(
      routePattern := '/projects/:projectId/newBuild',
      httpVerb := 'POST',
      roleCode := 6060
    );

    perform set_route_role(
      routePattern := '/projects/:projectId/artifactUrl',
      httpVerb := 'GET',
      roleCode := 6000
    );

    perform set_route_role(
      routePattern := '/projects/:projectId/artifactUrl',
      httpVerb := 'GET',
      roleCode := 6010
    );

    perform set_route_role(
      routePattern := '/projects/:projectId/artifactUrl',
      httpVerb := 'GET',
      roleCode := 6020
    );

    perform set_route_role(
      routePattern := '/projects/:projectId/artifactUrl',
      httpVerb := 'GET',
      roleCode := 6060
    );

    -- set projectAccounts routeRoles

    perform set_route_role(
      routePattern := '/projectAccounts',
      httpVerb := 'GET',
      roleCode := 6060
    );

    perform set_route_role(
      routePattern := '/projectAccounts',
      httpVerb := 'GET',
      roleCode := 6000
    );

    perform set_route_role(
      routePattern := '/projectAccounts',
      httpVerb := 'GET',
      roleCode := 6010
    );

    perform set_route_role(
      routePattern := '/projectAccounts',
      httpVerb := 'GET',
      roleCode := 6020
    );

    -- set providers routeRoles
    perform set_route_role(
      routePattern := '/providers/:providerId',
      httpVerb := 'GET',
      roleCode := 6040
    );

    perform set_route_role(
      routePattern := '/providers/:providerId',
      httpVerb := 'GET',
      roleCode := 6060
    );

    perform set_route_role(
      routePattern := '/providers',
      httpVerb := 'GET',
      roleCode := 6040
    );

    -- set projectDailyAggs routeRoles
    perform set_route_role(
      routePattern := '/projectDailyAggs',
      httpVerb := 'GET',
      roleCode := 6010
    );

    perform set_route_role(
      routePattern := '/projectDailyAggs',
      httpVerb := 'GET',
      roleCode := 6020
    );

    perform set_route_role(
      routePattern := '/projectDailyAggs',
      httpVerb := 'GET',
      roleCode := 6060
    );

    -- set jobsDailyAggs routeRoles
    perform set_route_role(
      routePattern := '/jobsDailyAggs',
      httpVerb := 'GET',
      roleCode := 6010
    );

    perform set_route_role(
      routePattern := '/jobsDailyAggs',
      httpVerb := 'GET',
      roleCode := 6020
    );

    perform set_route_role(
      routePattern := '/jobsDailyAggs',
      httpVerb := 'GET',
      roleCode := 6060
    );

    -- set resources routeRoles
    perform set_route_role(
      routePattern := '/resources',
      httpVerb := 'GET',
      roleCode := 6000
    );

    perform set_route_role(
      routePattern := '/resources',
      httpVerb := 'GET',
      roleCode := 6010
    );

    perform set_route_role(
      routePattern := '/resources',
      httpVerb := 'GET',
      roleCode := 6020
    );

    perform set_route_role(
      routePattern := '/resources',
      httpVerb := 'GET',
      roleCode := 6060
    );

    perform set_route_role(
      routePattern := '/resources/:resourceId',
      httpVerb := 'GET',
      roleCode := 6000
    );

    perform set_route_role(
      routePattern := '/resources/:resourceId',
      httpVerb := 'GET',
      roleCode := 6010
    );

    perform set_route_role(
      routePattern := '/resources/:resourceId',
      httpVerb := 'GET',
      roleCode := 6020
    );

    perform set_route_role(
      routePattern := '/resources/:resourceId',
      httpVerb := 'GET',
      roleCode := 6050
    );

    perform set_route_role(
      routePattern := '/resources/:resourceId',
      httpVerb := 'GET',
      roleCode := 6060
    );

    perform set_route_role(
      routePattern := '/resources/:resourceId/dependencies',
      httpVerb := 'GET',
      roleCode := 6000
    );

    perform set_route_role(
      routePattern := '/resources/:resourceId/dependencies',
      httpVerb := 'GET',
      roleCode := 6010
    );

    perform set_route_role(
      routePattern := '/resources/:resourceId/dependencies',
      httpVerb := 'GET',
      roleCode := 6020
    );

    perform set_route_role(
      routePattern := '/resources/:resourceId/dependencies',
      httpVerb := 'GET',
      roleCode := 6060
    );

    perform set_route_role(
      routePattern := '/resources/:resourceId',
      httpVerb := 'PUT',
      roleCode := 6010
    );

    perform set_route_role(
      routePattern := '/resources/:resourceId',
      httpVerb := 'PUT',
      roleCode := 6020
    );

    perform set_route_role(
      routePattern := '/resources/:resourceId',
      httpVerb := 'PUT',
      roleCode := 6060
    );

    perform set_route_role(
      routePattern := '/resources/:resourceId',
      httpVerb := 'DELETE',
      roleCode := 6010
    );

    perform set_route_role(
      routePattern := '/resources/:resourceId',
      httpVerb := 'DELETE',
      roleCode := 6020
    );

    perform set_route_role(
      routePattern := '/resources/:resourceId',
      httpVerb := 'DELETE',
      roleCode := 6060
    );

    perform set_route_role(
      routePattern := '/resources/:resourceId/version',
      httpVerb := 'POST',
      roleCode := 6010
    );

    perform set_route_role(
      routePattern := '/resources/:resourceId/version',
      httpVerb := 'POST',
      roleCode := 6020
    );

    perform set_route_role(
      routePattern := '/resources/:resourceId/version',
      httpVerb := 'POST',
      roleCode := 6060
    );

    perform set_route_role(
      routePattern := '/resources',
      httpVerb := 'POST',
      roleCode := 6010
    );

    perform set_route_role(
      routePattern := '/resources',
      httpVerb := 'POST',
      roleCode := 6020
    );

    perform set_route_role(
      routePattern := '/resources',
      httpVerb := 'POST',
      roleCode := 6060
    );

    perform set_route_role(
      routePattern := '/resources/syncRepo',
      httpVerb := 'POST',
      roleCode := 6010
    );

    perform set_route_role(
      routePattern := '/resources/syncRepo',
      httpVerb := 'POST',
      roleCode := 6020
    );

    perform set_route_role(
      routePattern := '/resources/syncRepo',
      httpVerb := 'POST',
      roleCode := 6060
    );

    perform set_route_role(
      routePattern := '/resources/:resourceId/files',
      httpVerb := 'GET',
      roleCode := 6000
    );

    perform set_route_role(
      routePattern := '/resources/:resourceId/files',
      httpVerb := 'GET',
      roleCode := 6010
    );

    perform set_route_role(
      routePattern := '/resources/:resourceId/files',
      httpVerb := 'GET',
      roleCode := 6020
    );

    perform set_route_role(
      routePattern := '/resources/:resourceId/files',
      httpVerb := 'GET',
      roleCode := 6060
    );

    perform set_route_role(
      routePattern := '/resources/:resourceId/files',
      httpVerb := 'POST',
      roleCode := 6010
    );

    perform set_route_role(
      routePattern := '/resources/:resourceId/files',
      httpVerb := 'POST',
      roleCode := 6020
    );

    perform set_route_role(
      routePattern := '/resources/:resourceId/files',
      httpVerb := 'POST',
      roleCode := 6060
    );

    perform set_route_role(
      routePattern := '/resources/:resourceId/triggerNewBuildRequest',
      httpVerb := 'POST',
      roleCode := 6010
    );

    perform set_route_role(
      routePattern := '/resources/:resourceId/triggerNewBuildRequest',
      httpVerb := 'POST',
      roleCode := 6020
    );

    perform set_route_role(
      routePattern := '/resources/:resourceId/triggerNewBuildRequest',
      httpVerb := 'POST',
      roleCode := 6060
    );

    -- GET /runtimeTemplates for publicUser
    perform set_route_role(
      routePattern := '/runtimeTemplates',
      httpVerb := 'GET',
      roleCode := 6040
    );

    -- GET /runtimeTemplates for justUser
    perform set_route_role(
      routePattern := '/runtimeTemplates',
      httpVerb := 'GET',
      roleCode := 6060
    );

    -- set runs routeRoles
    perform set_route_role(
      routePattern := '/runs/:runId',
      httpVerb := 'DELETE',
      roleCode := 6010
    );

    perform set_route_role(
      routePattern := '/runs/:runId',
      httpVerb := 'DELETE',
      roleCode := 6020
    );

    perform set_route_role(
      routePattern := '/runs/:runId',
      httpVerb := 'DELETE',
      roleCode := 6060
    );

    perform set_route_role(
      routePattern := '/runs',
      httpVerb := 'GET',
      roleCode := 6000
    );

    perform set_route_role(
      routePattern := '/runs',
      httpVerb := 'GET',
      roleCode := 6010
    );

    perform set_route_role(
      routePattern := '/runs',
      httpVerb := 'GET',
      roleCode := 6020
    );

    perform set_route_role(
      routePattern := '/runs',
      httpVerb := 'GET',
      roleCode := 6040
    );

    perform set_route_role(
      routePattern := '/runs',
      httpVerb := 'GET',
      roleCode := 6060
    );

    perform set_route_role(
      routePattern := '/runs',
      httpVerb := 'POST',
      roleCode := 6010
    );

    perform set_route_role(
      routePattern := '/runs',
      httpVerb := 'POST',
      roleCode := 6020
    );

    perform set_route_role(
      routePattern := '/runs',
      httpVerb := 'POST',
      roleCode := 6060
    );

    perform set_route_role(
      routePattern := '/runs/:runId',
      httpVerb := 'GET',
      roleCode := 6000
    );

    perform set_route_role(
      routePattern := '/runs/:runId',
      httpVerb := 'GET',
      roleCode := 6010
    );

    perform set_route_role(
      routePattern := '/runs/:runId',
      httpVerb := 'GET',
      roleCode := 6020
    );

    perform set_route_role(
      routePattern := '/runs/:runId',
      httpVerb := 'GET',
      roleCode := 6040
    );

    perform set_route_role(
      routePattern := '/runs/:runId',
      httpVerb := 'GET',
      roleCode := 6060
    );

    perform set_route_role(
      routePattern := '/runs/:runId/cancel',
      httpVerb := 'POST',
      roleCode := 6010
    );

    perform set_route_role(
      routePattern := '/runs/:runId/cancel',
      httpVerb := 'POST',
      roleCode := 6020
    );

    perform set_route_role(
      routePattern := '/runs/:runId/cancel',
      httpVerb := 'POST',
      roleCode := 6060
    );

    -- set waitingJobs routeRoles

    perform set_route_role(
      routePattern := '/waitingJobs',
      httpVerb := 'GET',
      roleCode := 6000
    );

    perform set_route_role(
      routePattern := '/waitingJobs',
      httpVerb := 'GET',
      roleCode := 6010
    );

    perform set_route_role(
      routePattern := '/waitingJobs',
      httpVerb := 'GET',
      roleCode := 6020
    );

    perform set_route_role(
      routePattern := '/waitingJobs',
      httpVerb := 'GET',
      roleCode := 6060
    );

    perform set_route_role(
      routePattern := '/waitingJobs/:waitingJobId',
      httpVerb := 'DELETE',
      roleCode := 6010
    );

    perform set_route_role(
      routePattern := '/waitingJobs/:waitingJobId',
      httpVerb := 'DELETE',
      roleCode := 6020
    );

    perform set_route_role(
      routePattern := '/waitingJobs/:waitingJobId',
      httpVerb := 'DELETE',
      roleCode := 6060
    );
    -- set subscriptions routeRoles

    perform set_route_role(
      routePattern := '/subscriptions',
      httpVerb := 'GET',
      roleCode := 6000
    );

    perform set_route_role(
      routePattern := '/subscriptions',
      httpVerb := 'GET',
      roleCode := 6010
    );

    perform set_route_role(
      routePattern := '/subscriptions',
      httpVerb := 'GET',
      roleCode := 6020
    );

    perform set_route_role(
      routePattern := '/subscriptions',
      httpVerb := 'GET',
      roleCode := 6040
    );

    perform set_route_role(
      routePattern := '/subscriptions',
      httpVerb := 'GET',
      roleCode := 6060
    );

    perform set_route_role(
      routePattern := '/subscriptions/:subscriptionId',
      httpVerb := 'GET',
      roleCode := 6000
    );

    perform set_route_role(
      routePattern := '/subscriptions/:subscriptionId',
      httpVerb := 'GET',
      roleCode := 6010
    );

    perform set_route_role(
      routePattern := '/subscriptions/:subscriptionId',
      httpVerb := 'GET',
      roleCode := 6020
    );

    perform set_route_role(
      routePattern := '/subscriptions/:subscriptionId',
      httpVerb := 'GET',
      roleCode := 6040
    );

    perform set_route_role(
      routePattern := '/subscriptions/:subscriptionId',
      httpVerb := 'GET',
      roleCode := 6060
    );

    perform set_route_role(
      routePattern := '/subscriptions/:subscriptionId/reset',
      httpVerb := 'POST',
      roleCode := 6020
    );

    perform set_route_role(
      routePattern := '/subscriptions/:subscriptionId/reset',
      httpVerb := 'POST',
      roleCode := 6060
    );

    perform set_route_role(
      routePattern := '/subscriptions/:subscriptionId/billing',
      httpVerb := 'GET',
      roleCode := 6020
    );

    perform set_route_role(
      routePattern := '/subscriptions/:subscriptionId/billing',
      httpVerb := 'GET',
      roleCode := 6060
    );

    perform set_route_role(
      routePattern := '/v2/subscriptions/:subscriptionId/billing',
      httpVerb := 'GET',
      roleCode := 6000
    );

    perform set_route_role(
      routePattern := '/v2/subscriptions/:subscriptionId/billing',
      httpVerb := 'GET',
      roleCode := 6010
    );

    perform set_route_role(
      routePattern := '/v2/subscriptions/:subscriptionId/billing',
      httpVerb := 'GET',
      roleCode := 6020
    );

    perform set_route_role(
      routePattern := '/v2/subscriptions/:subscriptionId/billing',
      httpVerb := 'GET',
      roleCode := 6060
    );

    perform set_route_role(
      routePattern := '/subscriptions/:subscriptionId/cards',
      httpVerb := 'GET',
      roleCode := 6020
    );

    perform set_route_role(
      routePattern := '/subscriptions/:subscriptionId/cards',
      httpVerb := 'GET',
      roleCode := 6060
    );

    perform set_route_role(
      routePattern := '/subscriptions/:subscriptionId',
      httpVerb := 'PUT',
      roleCode := 6010
    );

    perform set_route_role(
      routePattern := '/subscriptions/:subscriptionId',
      httpVerb := 'PUT',
      roleCode := 6020
    );

    perform set_route_role(
      routePattern := '/subscriptions/:subscriptionId',
      httpVerb := 'PUT',
      roleCode := 6060
    );

    perform set_route_role(
      routePattern := '/subscriptions/:subscriptionId/encrypt',
      httpVerb := 'POST',
      roleCode := 6010
    );

    perform set_route_role(
      routePattern := '/subscriptions/:subscriptionId/encrypt',
      httpVerb := 'POST',
      roleCode := 6020
    );

    perform set_route_role(
      routePattern := '/subscriptions/:subscriptionId/encrypt',
      httpVerb := 'POST',
      roleCode := 6000
    );

    perform set_route_role(
      routePattern := '/subscriptions/:subscriptionId/encrypt',
      httpVerb := 'POST',
      roleCode := 6060
    );

    perform set_route_role(
      routePattern := '/subscriptions/:subscriptionId/decrypt',
      httpVerb := 'POST',
      roleCode := 6020
    );

    perform set_route_role(
      routePattern := '/subscriptions/:subscriptionId/decrypt',
      httpVerb := 'POST',
      roleCode := 6060
    );

    perform set_route_role(
      routePattern := '/subscriptions/:subscriptionId/runStatus',
      httpVerb := 'GET',
      roleCode := 6000
    );

    perform set_route_role(
      routePattern := '/subscriptions/:subscriptionId/runStatus',
      httpVerb := 'GET',
      roleCode := 6010
    );

    perform set_route_role(
      routePattern := '/subscription/:subscriptionId/runStatus',
      httpVerb := 'GET',
      roleCode := 6020
    );

    perform set_route_role(
      routePattern := '/subscriptions/:subscriptionId/runStatus',
      httpVerb := 'GET',
      roleCode := 6060
    );

    perform set_route_role(
      routePattern := '/subscriptions/:subscriptionId/state',
      httpVerb := 'GET',
      roleCode := 6000
    );

    perform set_route_role(
      routePattern := '/subscriptions/:subscriptionId/state',
      httpVerb := 'GET',
      roleCode := 6010
    );

    perform set_route_role(
      routePattern := '/subscriptions/:subscriptionId/state',
      httpVerb := 'GET',
      roleCode := 6020
    );

    perform set_route_role(
      routePattern := '/subscriptions/:subscriptionId/state',
      httpVerb := 'GET',
      roleCode := 6060
    );

    -- set subscriptionsAccounts routeRoles

    perform set_route_role(
      routePattern := '/subscriptionAccounts',
      httpVerb := 'GET',
      roleCode := 6000
    );

    perform set_route_role(
      routePattern := '/subscriptionAccounts',
      httpVerb := 'GET',
      roleCode := 6010
    );

    perform set_route_role(
      routePattern := '/subscriptionAccounts',
      httpVerb := 'GET',
      roleCode := 6020
    );

    perform set_route_role(
      routePattern := '/subscriptionAccounts',
      httpVerb := 'GET',
      roleCode := 6060
    );

    -- set subscriptionIntegrations routeRoles
    perform set_route_role(
      routePattern := '/subscriptionIntegrations',
      httpVerb := 'GET',
      roleCode := 6000
    );

    perform set_route_role(
      routePattern := '/subscriptionIntegrations',
      httpVerb := 'GET',
      roleCode := 6010
    );

    perform set_route_role(
      routePattern := '/subscriptionIntegrations',
      httpVerb := 'GET',
      roleCode := 6020
    );

    perform set_route_role(
      routePattern := '/subscriptionIntegrations',
      httpVerb := 'GET',
      roleCode := 6060
    );

    perform set_route_role(
      routePattern := '/subscriptionIntegrations/:subscriptionIntegrationId',
      httpVerb := 'GET',
      roleCode := 6000
    );

    perform set_route_role(
      routePattern := '/subscriptionIntegrations/:subscriptionIntegrationId',
      httpVerb := 'GET',
      roleCode := 6010
    );

    perform set_route_role(
      routePattern := '/subscriptionIntegrations/:subscriptionIntegrationId',
      httpVerb := 'GET',
      roleCode := 6020
    );

    perform set_route_role(
      routePattern := '/subscriptionIntegrations/:subscriptionIntegrationId',
      httpVerb := 'GET',
      roleCode := 6060
    );

    perform set_route_role(
      routePattern := '/subscriptionIntegrations/:subscriptionIntegrationId/dependencies',
      httpVerb := 'GET',
      roleCode := 6000
    );

    perform set_route_role(
      routePattern := '/subscriptionIntegrations/:subscriptionIntegrationId/dependencies',
      httpVerb := 'GET',
      roleCode := 6060
    );

    perform set_route_role(
      routePattern := '/subscriptionIntegrations/:subscriptionIntegrationId',
      httpVerb := 'PUT',
      roleCode := 6010
    );

    perform set_route_role(
      routePattern := '/subscriptionIntegrations/:subscriptionIntegrationId',
      httpVerb := 'PUT',
      roleCode := 6020
    );

    perform set_route_role(
      routePattern := '/subscriptionIntegrations/:subscriptionIntegrationId',
      httpVerb := 'PUT',
      roleCode := 6060
    );

    perform set_route_role(
      routePattern := '/subscriptionIntegrations',
      httpVerb := 'POST',
      roleCode := 6010
    );

    perform set_route_role(
      routePattern := '/subscriptionIntegrations',
      httpVerb := 'POST',
      roleCode := 6020
    );

    perform set_route_role(
      routePattern := '/subscriptionIntegrations',
      httpVerb := 'POST',
      roleCode := 6060
    );

    perform set_route_role(
      routePattern := '/subscriptionIntegrations/:subscriptionIntegrationId',
      httpVerb := 'DELETE',
      roleCode := 6010
    );

    perform set_route_role(
      routePattern := '/subscriptionIntegrations/:subscriptionIntegrationId',
      httpVerb := 'DELETE',
      roleCode := 6020
    );

    perform set_route_role(
      routePattern := '/subscriptionIntegrations/:subscriptionIntegrationId',
      httpVerb := 'DELETE',
      roleCode := 6060
    );

    -- set subscriptionintegrationpermissions routeRoles

    perform set_route_role(
      routePattern := '/subscriptionIntegrationPermissions',
      httpVerb := 'GET',
      roleCode := 6000
    );
    perform set_route_role(
      routePattern := '/subscriptionIntegrationPermissions',
      httpVerb := 'GET',
      roleCode := 6010
    );

    perform set_route_role(
      routePattern := '/subscriptionIntegrationPermissions',
      httpVerb := 'GET',
      roleCode := 6020
    );

    perform set_route_role(
      routePattern := '/subscriptionIntegrationPermissions',
      httpVerb := 'GET',
      roleCode := 6060
    );

    perform set_route_role(
      routePattern := '/subscriptionIntegrationPermissions',
      httpVerb := 'POST',
      roleCode := 6010
    );

    perform set_route_role(
      routePattern := '/subscriptionIntegrationPermissions',
      httpVerb := 'POST',
      roleCode := 6020
    );

    perform set_route_role(
      routePattern := '/subscriptionIntegrationPermissions',
      httpVerb := 'POST',
      roleCode := 6060
    );

    perform set_route_role(
      routePattern := '/subscriptionIntegrationPermissions/:subscriptionIntegrationPermissionId',
      httpVerb := 'DELETE',
      roleCode := 6010
    );

    perform set_route_role(
      routePattern := '/subscriptionIntegrationPermissions/:subscriptionIntegrationPermissionId',
      httpVerb := 'DELETE',
      roleCode := 6020
    );

    perform set_route_role(
      routePattern := '/subscriptionIntegrationPermissions/:subscriptionIntegrationPermissionId',
      httpVerb := 'DELETE',
      roleCode := 6060
    );

    -- set systemMachineImages routes

    perform set_route_role(
      routePattern := '/systemMachineImages',
      httpVerb := 'GET',
      roleCode := 6000
    );

    perform set_route_role(
      routePattern := '/systemMachineImages',
      httpVerb := 'GET',
      roleCode := 6010
    );

    perform set_route_role(
      routePattern := '/systemMachineImages',
      httpVerb := 'GET',
      roleCode := 6020
    );

    perform set_route_role(
      routePattern := '/systemMachineImages',
      httpVerb := 'GET',
      roleCode := 6060
    );

    perform set_route_role(
      routePattern := '/systemMachineImages/:systemMachineImageId',
      httpVerb := 'GET',
      roleCode := 6000
    );

    perform set_route_role(
      routePattern := '/systemMachineImages/:systemMachineImageId',
      httpVerb := 'GET',
      roleCode := 6010
    );

    perform set_route_role(
      routePattern := '/systemMachineImages/:systemMachineImageId',
      httpVerb := 'GET',
      roleCode := 6020
    );

    perform set_route_role(
      routePattern := '/systemMachineImages/:systemMachineImageId',
      httpVerb := 'GET',
      roleCode := 6060
    );
    -- set vortex routeRoles

    perform set_route_role(
      routePattern := '/vortex',
      httpVerb := 'POST',
      roleCode := 6060
    );

    perform set_route_role(
      routePattern := '/vortex',
      httpVerb := 'GET',
      roleCode := 6060
    );

    -- set systemCodes routeRoles
    perform set_route_role(
      routePattern := '/systemCodes',
      httpVerb := 'GET',
      roleCode := 6040
    );

    -- set workflowControllers routeRoles
    perform set_route_role(
      routePattern := '/workflowControllers',
      httpVerb := 'GET',
      roleCode := 6060
    );

    -- set systemNodes routeRoles
    perform set_route_role(
      routePattern := '/systemNodes/:systemNodeId',
      httpVerb := 'GET',
      roleCode := 6060
    );

    perform set_route_role(
      routePattern := '/systemNodes/:systemNodeId',
      httpVerb := 'PUT',
      roleCode := 6040
    );

    perform set_route_role(
      routePattern := '/systemNodes/:systemNodeId',
      httpVerb := 'PUT',
      roleCode := 6060
    );

    perform set_route_role(
       routePattern := '/systemNodes/:systemNodeId/validate',
       httpVerb := 'GET',
       roleCode := 6040
     );

     perform set_route_role(
       routePattern := '/systemNodes/:systemNodeId/validate',
       httpVerb := 'GET',
       roleCode := 6060
     );

    -- set systemNodeStats routeRoles
    perform set_route_role(
      routePattern := '/systemNodeStats',
      httpVerb := 'POST',
      roleCode := 6040
    );

    perform set_route_role(
      routePattern := '/systemNodeStats',
      httpVerb := 'POST',
      roleCode := 6060
    );

    -- set transactions routeRoles

    perform set_route_role(
      routePattern := '/transactions/:transactionId',
      httpVerb := 'GET',
      roleCode := 6060
    );

    perform set_route_role(
      routePattern := '/transactions/:transactionId',
      httpVerb := 'GET',
      roleCode := 6020
    );

    perform set_route_role(
      routePattern := '/transactions/:transactionId/receipt',
      httpVerb := 'GET',
      roleCode := 6060
    );

    perform set_route_role(
      routePattern := '/transactions/:transactionId/receipt',
      httpVerb := 'GET',
      roleCode := 6020
    );

    perform set_route_role(
      routePattern := '/subscriptions/:subscriptionId/transactions',
      httpVerb := 'GET',
      roleCode := 6060
    );

    perform set_route_role(
      routePattern := '/subscriptions/:subscriptionId/transactions',
      httpVerb := 'GET',
      roleCode := 6020
    );

    perform set_route_role(
      routePattern := '/transactions',
      httpVerb := 'GET',
      roleCode := 6060
    );

    perform set_route_role(
      routePattern := '/transactions',
      httpVerb := 'GET',
      roleCode := 6020
    );

    -- set versions routeRoles
    perform set_route_role(
      routePattern := '/versions',
      httpVerb := 'GET',
      roleCode := 6000
    );

    perform set_route_role(
      routePattern := '/versions',
      httpVerb := 'GET',
      roleCode := 6010
    );

    perform set_route_role(
      routePattern := '/versions',
      httpVerb := 'GET',
      roleCode := 6020
    );

    perform set_route_role(
      routePattern := '/versions',
      httpVerb := 'GET',
      roleCode := 6060
    );

    perform set_route_role(
      routePattern := '/versions/:versionId',
      httpVerb := 'GET',
      roleCode := 6000
    );

    perform set_route_role(
      routePattern := '/versions/:versionId',
      httpVerb := 'GET',
      roleCode := 6010
    );

    perform set_route_role(
      routePattern := '/versions/:versionId',
      httpVerb := 'GET',
      roleCode := 6020
    );

    perform set_route_role(
      routePattern := '/versions/:versionId',
      httpVerb := 'GET',
      roleCode := 6060
    );

    perform set_route_role(
      routePattern := '/versions',
      httpVerb := 'POST',
      roleCode := 6010
    );

    perform set_route_role(
      routePattern := '/versions',
      httpVerb := 'POST',
      roleCode := 6020
    );

    perform set_route_role(
      routePattern := '/versions',
      httpVerb := 'POST',
      roleCode := 6050
    );

    perform set_route_role(
      routePattern := '/versions',
      httpVerb := 'POST',
      roleCode := 6060
    );

    perform set_route_role(
      routePattern := '/v2/versions',
      httpVerb := 'POST',
      roleCode := 6010
    );

    perform set_route_role(
      routePattern := '/v2/versions',
      httpVerb := 'POST',
      roleCode := 6020
    );

    perform set_route_role(
      routePattern := '/v2/versions',
      httpVerb := 'POST',
      roleCode := 6050
    );

    perform set_route_role(
      routePattern := '/v2/versions',
      httpVerb := 'POST',
      roleCode := 6060
    );

    perform set_route_role(
      routePattern := '/versions/:versionId',
      httpVerb := 'DELETE',
      roleCode := 6010
    );

    perform set_route_role(
      routePattern := '/versions/:versionId',
      httpVerb := 'DELETE',
      roleCode := 6020
    );

    perform set_route_role(
      routePattern := '/versions/:versionId',
      httpVerb := 'DELETE',
      roleCode := 6060
    );

    perform set_route_role(
      routePattern := '/views',
      httpVerb := 'GET',
      roleCode := 6010
    );

    perform set_route_role(
      routePattern := '/views',
      httpVerb := 'GET',
      roleCode := 6020
    );

    perform set_route_role(
      routePattern := '/views',
      httpVerb := 'GET',
      roleCode := 6060
    );

    perform set_route_role(
      routePattern := '/views',
      httpVerb := 'POST',
      roleCode := 6010
    );

    perform set_route_role(
      routePattern := '/views',
      httpVerb := 'POST',
      roleCode := 6020
    );

    perform set_route_role(
      routePattern := '/views',
      httpVerb := 'POST',
      roleCode := 6060
    );

    perform set_route_role(
      routePattern := '/views/:viewId',
      httpVerb := 'PUT',
      roleCode := 6010
    );

    perform set_route_role(
      routePattern := '/views/:viewId',
      httpVerb := 'PUT',
      roleCode := 6020
    );

    perform set_route_role(
      routePattern := '/views/:viewId',
      httpVerb := 'PUT',
      roleCode := 6060
    );

    perform set_route_role(
      routePattern := '/views/:viewId',
      httpVerb := 'DELETE',
      roleCode := 6010
    );

    perform set_route_role(
      routePattern := '/views/:viewId',
      httpVerb := 'DELETE',
      roleCode := 6020
    );

    perform set_route_role(
      routePattern := '/views/:viewId',
      httpVerb := 'DELETE',
      roleCode := 6060
    );

    perform set_route_role(
      routePattern := '/viewObjects',
      httpVerb := 'GET',
      roleCode := 6060
    );

    perform set_route_role(
      routePattern := '/viewObjects',
      httpVerb := 'POST',
      roleCode := 6060
    );

    perform set_route_role(
      routePattern := '/viewObjects/:viewObjectId',
      httpVerb := 'DELETE',
      roleCode := 6060
    );

    perform set_route_role(
      routePattern := '/subscriptionIntegrations/:subscriptionIntegrationId/validateProjectOwnerToken',
      httpVerb := 'GET',
      roleCode := 6060
    );

    perform set_route_role(
      routePattern := '/subscriptionIntegrations/:subscriptionIntegrationId/validateProjectOwnerToken',
      httpVerb := 'GET',
      roleCode := 6000
    );

    perform set_route_role(
      routePattern := '/subscriptionIntegrations/:subscriptionIntegrationId/validateProjectOwnerToken',
      httpVerb := 'GET',
      roleCode := 6010
    );

    perform set_route_role(
      routePattern := '/subscriptionIntegrations/:subscriptionIntegrationId/validateProjectOwnerToken',
      httpVerb := 'GET',
      roleCode := 6020
    );

  end
$$;

do $$
  begin
    if exists (select 1 from information_schema.columns where table_name = 'routePermissions') then
      drop table "routePermissions";
    end if;
  end
$$;


do $$
  begin
    -- Remove csWindowBuiltProjects in dailyAggs
    if exists (select 1 from information_schema.columns where table_name = 'dailyAggs' and column_name = 'csWindowBuiltProjects') then
      alter table "dailyAggs" drop column "csWindowBuiltProjects";
    end if;

    -- Remove csWindowGreenProjects in dailyAggs
    if exists (select 1 from information_schema.columns where table_name = 'dailyAggs' and column_name = 'csWindowGreenProjects') then
      alter table "dailyAggs" drop column "csWindowGreenProjects";
    end if;

    -- Remove csWindowEnabledProjects in dailyAggs
    if exists (select 1 from information_schema.columns where table_name = 'dailyAggs' and column_name = 'csWindowEnabledProjects') then
      alter table "dailyAggs" drop column "csWindowEnabledProjects";
    end if;

    -- Remove projectsTodayStg06 in dailyAggs
    if exists (select 1 from information_schema.columns where table_name = 'dailyAggs' and column_name = 'projectsTodayStg06') then
      alter table "dailyAggs" drop column "projectsTodayStg06";
    end if;

    -- Remove projectsTodayStg05 in dailyAggs
    if exists (select 1 from information_schema.columns where table_name = 'dailyAggs' and column_name = 'projectsTodayStg05') then
      alter table "dailyAggs" drop column "projectsTodayStg05";
    end if;

    -- Remove projectsTodayStg04 in dailyAggs
    if exists (select 1 from information_schema.columns where table_name = 'dailyAggs' and column_name = 'projectsTodayStg04') then
      alter table "dailyAggs" drop column "projectsTodayStg04";
    end if;

    -- Remove projectsTodayStg03 in dailyAggs
    if exists (select 1 from information_schema.columns where table_name = 'dailyAggs' and column_name = 'projectsTodayStg03') then
      alter table "dailyAggs" drop column "projectsTodayStg03";
    end if;

    -- Remove projectsTodayStg02 in dailyAggs
    if exists (select 1 from information_schema.columns where table_name = 'dailyAggs' and column_name = 'projectsTodayStg02') then
      alter table "dailyAggs" drop column "projectsTodayStg02";
    end if;

    -- Remove projectsTodayStg01 in dailyAggs
    if exists (select 1 from information_schema.columns where table_name = 'dailyAggs' and column_name = 'projectsTodayStg01') then
      alter table "dailyAggs" drop column "projectsTodayStg01";
    end if;

    -- Remove projectsTodayStg00 in dailyAggs
    if exists (select 1 from information_schema.columns where table_name = 'dailyAggs' and column_name = 'projectsTodayStg00') then
      alter table "dailyAggs" drop column "projectsTodayStg00";
    end if;

    -- Remove projectsRedTodayStg06 in dailyAggs
    if exists (select 1 from information_schema.columns where table_name = 'dailyAggs' and column_name = 'projectsRedTodayStg06') then
      alter table "dailyAggs" drop column "projectsRedTodayStg06";
    end if;

    -- Remove projectsRedTodayStg05 in dailyAggs
    if exists (select 1 from information_schema.columns where table_name = 'dailyAggs' and column_name = 'projectsRedTodayStg05') then
      alter table "dailyAggs" drop column "projectsRedTodayStg05";
    end if;

    -- Remove projectsRedTodayStg04 in dailyAggs
    if exists (select 1 from information_schema.columns where table_name = 'dailyAggs' and column_name = 'projectsRedTodayStg04') then
      alter table "dailyAggs" drop column "projectsRedTodayStg04";
    end if;

    -- Remove projectsRedTodayStg03 in dailyAggs
    if exists (select 1 from information_schema.columns where table_name = 'dailyAggs' and column_name = 'projectsRedTodayStg03') then
      alter table "dailyAggs" drop column "projectsRedTodayStg03";
    end if;

    -- Remove projectsRedTodayStg02 in dailyAggs
    if exists (select 1 from information_schema.columns where table_name = 'dailyAggs' and column_name = 'projectsRedTodayStg02') then
      alter table "dailyAggs" drop column "projectsRedTodayStg02";
    end if;

    -- Remove projectsRedTodayStg01 in dailyAggs
    if exists (select 1 from information_schema.columns where table_name = 'dailyAggs' and column_name = 'projectsRedTodayStg01') then
      alter table "dailyAggs" drop column "projectsRedTodayStg01";
    end if;

    -- Remove projectsRedTodayStg00 in dailyAggs
    if exists (select 1 from information_schema.columns where table_name = 'dailyAggs' and column_name = 'projectsRedTodayStg00') then
      alter table "dailyAggs" drop column "projectsRedTodayStg00";
    end if;

    -- Remove jobGreenRateStg06 in dailyAggs
    if exists (select 1 from information_schema.columns where table_name = 'dailyAggs' and column_name = 'jobGreenRateStg06') then
      alter table "dailyAggs" drop column "jobGreenRateStg06";
    end if;

    -- Remove jobGreenRateStg05 in dailyAggs
    if exists (select 1 from information_schema.columns where table_name = 'dailyAggs' and column_name = 'jobGreenRateStg05') then
      alter table "dailyAggs" drop column "jobGreenRateStg05";
    end if;

    -- Remove jobGreenRateStg04 in dailyAggs
    if exists (select 1 from information_schema.columns where table_name = 'dailyAggs' and column_name = 'jobGreenRateStg04') then
      alter table "dailyAggs" drop column "jobGreenRateStg04";
    end if;

    -- Remove jobGreenRateStg03 in dailyAggs
    if exists (select 1 from information_schema.columns where table_name = 'dailyAggs' and column_name = 'jobGreenRateStg03') then
      alter table "dailyAggs" drop column "jobGreenRateStg03";
    end if;

    -- Remove jobGreenRateStg02 in dailyAggs
    if exists (select 1 from information_schema.columns where table_name = 'dailyAggs' and column_name = 'jobGreenRateStg02') then
      alter table "dailyAggs" drop column "jobGreenRateStg02";
    end if;

    -- Remove jobGreenRateStg01 in dailyAggs
    if exists (select 1 from information_schema.columns where table_name = 'dailyAggs' and column_name = 'jobGreenRateStg01') then
      alter table "dailyAggs" drop column "jobGreenRateStg01";
    end if;

    -- Remove jobGreenRateStg00 in dailyAggs
    if exists (select 1 from information_schema.columns where table_name = 'dailyAggs' and column_name = 'jobGreenRateStg00') then
      alter table "dailyAggs" drop column "jobGreenRateStg00";
    end if;

    -- Add subscriptionId field in clusterNodeConsoles
    if not exists (select 1 from information_schema.columns where table_name = 'clusterNodeConsoles' and column_name = 'subscriptionId') then
      alter table "clusterNodeConsoles" add column "subscriptionId" varchar(24);
    end if;

    -- Add subscriptionId field in clusterNodeStats
    if not exists (select 1 from information_schema.columns where table_name = 'clusterNodeStats' and column_name = 'subscriptionId') then
      alter table "clusterNodeStats" add column "subscriptionId" varchar(24);
    end if;
    -- Add memoryUsageInPercentage field in clusterNodeStats
    if not exists (select 1 from information_schema.columns where table_name = 'clusterNodeStats' and column_name = 'memoryUsageInPercentage') then
      alter table "clusterNodeStats" add column "memoryUsageInPercentage" decimal;
    end if;
    -- Add cpuLoadInPercentage field in clusterNodeStats
    if not exists (select 1 from information_schema.columns where table_name = 'clusterNodeStats' and column_name = 'cpuLoadInPercentage') then
      alter table "clusterNodeStats" add column "cpuLoadInPercentage" decimal;
    end if;
    -- Add activeContainersCount field in clusterNodeStats
    if not exists (select 1 from information_schema.columns where table_name = 'clusterNodeStats' and column_name = 'activeContainersCount') then
      alter table "clusterNodeStats" add column "activeContainersCount" integer;
    end if;
    -- Add totalContainersCount field in clusterNodeStats
    if not exists (select 1 from information_schema.columns where table_name = 'clusterNodeStats' and column_name = 'totalContainersCount') then
      alter table "clusterNodeStats" add column "totalContainersCount" integer;
    end if;
    -- Add imageCount field in clusterNodeStats
    if not exists (select 1 from information_schema.columns where table_name = 'clusterNodeStats' and column_name = 'imageCount') then
      alter table "clusterNodeStats" add column "imageCount" integer;
    end if;

    -- Add memoryUsageInPercentage field in systemNodeStats
    if not exists (select 1 from information_schema.columns where table_name = 'systemNodeStats' and column_name = 'memoryUsageInPercentage') then
      alter table "systemNodeStats" add column "memoryUsageInPercentage" decimal;
    end if;
    -- Add cpuLoadInPercentage field in systemNodeStats
    if not exists (select 1 from information_schema.columns where table_name = 'systemNodeStats' and column_name = 'cpuLoadInPercentage') then
      alter table "systemNodeStats" add column "cpuLoadInPercentage" decimal;
    end if;
    -- Add activeContainersCount field in systemNodeStats
    if not exists (select 1 from information_schema.columns where table_name = 'systemNodeStats' and column_name = 'activeContainersCount') then
      alter table "systemNodeStats" add column "activeContainersCount" integer;
    end if;
    -- Add totalContainersCount field in systemNodeStats
    if not exists (select 1 from information_schema.columns where table_name = 'systemNodeStats' and column_name = 'totalContainersCount') then
      alter table "systemNodeStats" add column "totalContainersCount" integer;
    end if;
    -- Add imageCount field in systemNodeStats
    if not exists (select 1 from information_schema.columns where table_name = 'systemNodeStats' and column_name = 'imageCount') then
      alter table "systemNodeStats" add column "imageCount" integer;
    end if;

    -- Adds foreign key constraint on subscriptionId for clusterNodeConsoles
    if not exists (select 1 from pg_constraint where conname = 'clusterNodeConsoles_subscriptionId_fkey') then
      alter table "clusterNodeConsoles" add constraint "clusterNodeConsoles_subscriptionId_fkey" foreign key ("subscriptionId") references "subscriptions"(id) on update restrict on delete restrict;
    end if;

    -- Adds foreign key constraint on subscriptionId for clusterNodeStats
    if not exists (select 1 from pg_constraint where conname = 'clusterNodeStats_subscriptionId_fkey') then
      alter table "clusterNodeStats" add constraint "clusterNodeStats_subscriptionId_fkey" foreign key ("subscriptionId") references "subscriptions"(id) on update restrict on delete restrict;
    end if;

    -- Moves accounts.systemRoles data to accountRoles table
    if exists (select 1 from information_schema.columns where table_name = 'accountRoles') then
      if exists (select 1 from information_schema.columns where table_name = 'accounts' and column_name = 'systemRoles') then
      begin
      declare
        accounts_rec record;
        begin
          for accounts_rec in select id, "systemRoles" as roles from accounts where "systemRoles" not like '["user"]' and "systemRoles" not like '[ "user" ]'
          loop
            if accounts_rec.roles like '%opsUser%' then
              if not exists (select 1 from "accountRoles" where "accountId" = accounts_rec.id and "roleCode" = 6070) then
                insert into "accountRoles" ("accountId", "roleCode", "createdAt", "updatedAt")
                values (accounts_rec.id, 6070, '2016-06-01', '2016-06-01');
              end if;
            end if;
            if accounts_rec.roles like '%superUser%' then
              if not exists (select 1 from "accountRoles" where "accountId" = accounts_rec.id and "roleCode" = 6080) then
                insert into "accountRoles" ("accountId", "roleCode", "createdAt", "updatedAt")
                values (accounts_rec.id, 6080, '2016-06-01', '2016-06-01');
              end if;
            end if;
            if accounts_rec.roles like '%betaUser%' then
              if not exists (select 1 from "accountRoles" where "accountId" = accounts_rec.id and "roleCode" = 6090) then
                insert into "accountRoles" ("accountId", "roleCode", "createdAt", "updatedAt")
                values (accounts_rec.id, 6090, '2016-06-01', '2016-06-01');
              end if;
            end if;
            if accounts_rec.roles like '%serviceUser%' then
              if not exists (select 1 from "accountRoles" where "accountId" = accounts_rec.id and "roleCode" = 6100) then
                insert into "accountRoles" ("accountId", "roleCode", "createdAt", "updatedAt")
                values (accounts_rec.id, 6100, '2016-06-01', '2016-06-01');
              end if;
            end if;
          end loop;
        end;
        alter table "accounts" drop column "systemRoles";
      end;
      end if;
    end if;

    -- Drop Vault related fields from accounts table
    if exists (select 1 from information_schema.columns where table_name = 'accounts' and column_name = 'secretsToken') then
      alter table "accounts" drop column "secretsToken";
    end if;

    if exists (select 1 from information_schema.columns where table_name = 'accounts' and column_name = 'lastSecretsTokenRefreshedAt') then
      alter table "accounts" drop column "lastSecretsTokenRefreshedAt";
    end if;

    -- Remove isSyncing in projects
    if exists (select 1 from information_schema.columns where table_name = 'projects' and column_name = 'isSyncing') then
      alter table "projects" drop column "isSyncing";
    end if;

    -- Drop systemMachineImages.execImage
    if exists (select 1 from information_schema.columns where table_name = 'systemMachineImages' and column_name = 'execImage') then
      alter table "systemMachineImages" drop column "execImage";
    end if;

    -- Add "drydockTag" to systemMachineImages
    if not exists (select 1 from information_schema.columns where table_name = 'systemMachineImages' and column_name = 'drydockTag') then
      alter table "systemMachineImages" add column "drydockTag" varchar(50);
      update "systemMachineImages" set "drydockTag" = 'prod';
      alter table "systemMachineImages" alter column "drydockTag" set not null;
    end if;

    -- Add drydockFamily column to systemMachineImages
    if not exists (select 1 from information_schema.columns where table_name = 'systemMachineImages' and column_name = 'drydockFamily') then
      alter table "systemMachineImages" add column "drydockFamily" varchar(255);
      update "systemMachineImages" set "drydockFamily"='u14';
      alter table "systemMachineImages" alter column "drydockFamily" set not null;
    end if;

    -- Drop mailChimpId from accounts
    if exists (select 1 from information_schema.columns where table_name = 'accounts' and column_name = 'mailChimpId') then
      alter table "accounts" drop column "mailChimpId";
    end if;

    -- Drop welcomeEmailSent from accounts
    if exists (select 1 from information_schema.columns where table_name = 'accounts' and column_name = 'welcomeEmailSent') then
      alter table "accounts" drop column "welcomeEmailSent";
    end if;

    -- Drop isSuperUser from accounts
    if exists (select 1 from information_schema.columns where table_name = 'accounts' and column_name = 'isSuperUser') then
      alter table "accounts" drop column "isSuperUser";
    end if;

    -- Drop isBetaUser from accounts
    if exists (select 1 from information_schema.columns where table_name = 'accounts' and column_name = 'isBetaUser') then
      alter table "accounts" drop column "isBetaUser";
    end if;

    -- Drop isOpsUser from accounts
    if exists (select 1 from information_schema.columns where table_name = 'accounts' and column_name = 'isOpsUser') then
      alter table "accounts" drop column "isOpsUser";
    end if;

    -- Add clearbitProfileId to accounts
    if not exists (select 1 from information_schema.columns where table_name = 'accounts' and column_name = 'clearbitProfileId') then
      alter table "accounts" add column "clearbitProfileId" varchar(36);
    end if;

    -- Add "defaultAccountViewId" to accounts
    if not exists (select 1 from information_schema.columns where table_name = 'accounts' and column_name = 'defaultViewId') then
      alter table "accounts" add column "defaultViewId" INTEGER;
    end if;

    -- Add "isFlagged" to accounts
    if not exists (select 1 from information_schema.columns where table_name = 'accounts' and column_name = 'isFlagged') then
      alter table "accounts" add column "isFlagged" boolean;
    end if;

    -- Add subProviderIdLowercaseOrgNameI Index on projects
    if not exists (select 1 from pg_indexes where tablename = 'subscriptions' and indexname = 'subProviderIdLowercaseOrgNameI') then
      create index "subProviderIdLowercaseOrgNameI" on "subscriptions" using btree("providerId", lower("orgName"::text));
    end if;

    -- Add projProviderIdLowercaseFullNameI Index on projects
    if not exists (select 1 from pg_indexes where tablename = 'projects' and indexname = 'projProviderIdLowercaseFullNameI') then
      create index "projProviderIdLowercaseFullNameI" on "projects" using btree("providerId", lower("fullName"::text));
    end if;


    -- Add projProviderIdLowercaseNameI Index on projects
    if not exists (select 1 from pg_indexes where tablename = 'projects' and indexname = 'projProviderIdLowercaseNameI') then
      create index "projProviderIdLowercaseNameI" on "projects" using btree("providerId", lower("name"::text));
    end if;

    -- Drop index projProviderIdFullNameI
    if exists (select 1 from pg_indexes where tablename = 'projects' and indexname = 'projProviderIdFullNameI') then
      drop index "projProviderIdFullNameI";
    end if;

    -- Drop index projProviderIdNameI
    if exists (select 1 from pg_indexes where tablename = 'projects' and indexname = 'projProviderIdNameI') then
      drop index "projProviderIdNameI";
    end if;

    -- Drop index subProviderIdOrgNameI
    if exists (select 1 from pg_indexes where tablename = 'subscriptions' and indexname = 'subProviderIdOrgNameI') then
      drop index "subProviderIdOrgNameI";
    end if;

    -- Add buildJobsSubscriptionIdI Index on buildJobs
    if not exists (select 1 from pg_indexes where tablename = 'buildJobs' and indexname = 'buildJobsSubscriptionIdI') then
      create index "buildJobsSubscriptionIdI" on "buildJobs" using btree("subscriptionId");
    end if;

    -- Add buildJobsProjectIdI Index on buildJobs
    if not exists (select 1 from pg_indexes where tablename = 'buildJobs' and indexname = 'buildJobsProjectIdI') then
      create index "buildJobsProjectIdI" on "buildJobs" using btree("projectId");
    end if;

    -- Add buildsSubscriptionIdI Index on builds
    if not exists (select 1 from pg_indexes where tablename = 'builds' and indexname = 'buildsSubscriptionIdI') then
      create index "buildsSubscriptionIdI" on "builds" using btree("subscriptionId");
    end if;

    -- Add buildsProjectIdI Index on builds
    if not exists (select 1 from pg_indexes where tablename = 'builds' and indexname = 'buildsProjectIdI') then
      create index "buildsProjectIdI" on "builds" using btree("projectId");
    end if;

    -- Add buildsStatusCodeI Index on builds
    if not exists (select 1 from pg_indexes where tablename = 'builds' and indexname = 'buildsStatusCodeI') then
      create index "buildsStatusCodeI" on "builds" using btree("statusCode");
    end if;

    -- Add jobDependenciesOpOpResIdI Index on jobDependencies
    if not exists (select 1 from pg_indexes where tablename = 'jobDependencies' and indexname = 'jobDependenciesOpOpResIdI') then
      create index "jobDependenciesOpOpResIdI" on "jobDependencies" using btree("operation", "operationResourceId");
    end if;

    -- Add resourceSubscriptionIdI Index on resources
    if not exists (select 1 from pg_indexes where tablename = 'resources' and indexname = 'resourceSubscriptionIdI') then
      create index "resourceSubscriptionIdI" on "resources" using btree("subscriptionId");
    end if;

    -- Add resourceProjectIdI Index on resources
    if not exists (select 1 from pg_indexes where tablename = 'resources' and indexname = 'resourceProjectIdI') then
      create index "resourceProjectIdI" on "resources" using btree("projectId");
    end if;

    -- Add resourceTypeCodeI Index on resources
    if not exists (select 1 from pg_indexes where tablename = 'resources' and indexname = 'resourceTypeCodeI') then
      create index "resourceTypeCodeI" on "resources" using btree("typeCode");
    end if;

    -- Add resourceLastVersionIdI Index on resources
    if not exists (select 1 from pg_indexes where tablename = 'resources' and indexname = 'resourceLastVersionIdI') then
      create index "resourceLastVersionIdI" on "resources" using btree("lastVersionId");
    end if;

    -- Add runsCommitShaI Index on versions
    if not exists (select 1 from pg_indexes where tablename = 'runs' and indexname = 'runsCommitShaI') then
      create index "runsCommitShaI" on "runs" using btree("commitSha");
    end if;

    -- Add versionsSubscriptionIdI Index on versions
    if not exists (select 1 from pg_indexes where tablename = 'versions' and indexname = 'versionsSubscriptionIdI') then
      create index "versionsSubscriptionIdI" on "versions" using btree("subscriptionId");
    end if;

    -- Add versionsProjectIdI Index on versions
    if not exists (select 1 from pg_indexes where tablename = 'versions' and indexname = 'versionsProjectIdI') then
      create index "versionsProjectIdI" on "versions" using btree("projectId");
    end if;

    -- Drop cdmContainers column
    if exists (select 1 from information_schema.columns where table_name = 'systemNodeStats' and column_name = 'cdmContainers') then
      alter table "systemNodeStats" drop column "cdmContainers";
    end if;

    if exists (select 1 from information_schema.columns where table_name = 'clusterNodeStats' and column_name = 'cdmContainers') then
      alter table "clusterNodeStats" drop column "cdmContainers";
    end if;

    -- Drop disks column
    if exists (select 1 from information_schema.columns where table_name = 'systemNodeStats' and column_name = 'disks') then
      alter table "systemNodeStats" drop column "disks";
    end if;

    if exists (select 1 from information_schema.columns where table_name = 'clusterNodeStats' and column_name = 'disks') then
      alter table "clusterNodeStats" drop column "disks";
    end if;

    -- Drop memory column
    if exists (select 1 from information_schema.columns where table_name = 'systemNodeStats' and column_name = 'memory') then
      alter table "systemNodeStats" drop column "memory";
    end if;

    if exists (select 1 from information_schema.columns where table_name = 'clusterNodeStats' and column_name = 'memory') then
      alter table "clusterNodeStats" drop column "memory";
    end if;

    -- Drop pipelineCount column
    if exists (select 1 from information_schema.columns where table_name = 'subscriptions' and column_name = 'pipelineCount') then
      alter table "subscriptions" drop column "pipelineCount";
    end if;

    -- Drop isAuthorized column
    if exists (select 1 from information_schema.columns where table_name = 'accountProfiles' and column_name = 'isAuthorized') then
      alter table "accountProfiles" drop column "isAuthorized";
    end if;

    -- Drop enforceScopes column
    if exists (select 1 from information_schema.columns where table_name = 'accountProfiles' and column_name = 'enforceScopes') then
      alter table "accountProfiles" drop column "enforceScopes";
    end if;

    -- updates providers with name `ghe` to `githubEnterprise`
    if exists (select 1 from "providers" where "name" = 'ghe') then
        update "providers" set "name" = 'githubEnterprise' where "name" = 'ghe';
    end if;

    -- Add execImage column to clusterNodes
    if not exists (select 1 from information_schema.columns where table_name = 'clusterNodes' and column_name = 'execImage') then
      alter table "clusterNodes" add column "execImage" varchar(80);
    end if;

    -- Add execImage column to systemNodes
    if not exists (select 1 from information_schema.columns where table_name = 'systemNodes' and column_name = 'execImage') then
      alter table "systemNodes" add column "execImage" varchar(80);
    end if;

    -- Drop earlyAdopterMinionCount from subscriptions
    if exists (select 1 from information_schema.columns where table_name = 'subscriptions' and column_name = 'earlyAdopterMinionCount') then
      alter table "subscriptions" drop column "earlyAdopterMinionCount";
    end if;

    -- Add minionInstanceSize to subscriptions
    if not exists (select 1 from information_schema.columns where table_name = 'subscriptions' and column_name = 'minionInstanceSize') then
      alter table "subscriptions" add column "minionInstanceSize" varchar(255);
    end if;

    -- Add pullRequestRepoFullName column to runs
    if not exists (select 1 from information_schema.columns where table_name = 'runs' and column_name = 'pullRequestRepoFullName') then
      alter table "runs" add column "pullRequestRepoFullName" varchar(255);
    end if;

    -- Add isPaid to subscriptions
    if not exists (select 1 from information_schema.columns where table_name = 'subscriptions' and column_name = 'isPaid') then
      alter table "subscriptions" add column "isPaid" BOOLEAN;
    end if;

    -- Add masterIntegrationId to subscriptionIntegrations and set the value to accountIntegration.masterIntegrationId
    if not exists (select 1 from information_schema.columns where table_name = 'subscriptionIntegrations' and column_name = 'masterIntegrationId') then
      alter table "subscriptionIntegrations" add column "masterIntegrationId" varchar(24);
      update "subscriptionIntegrations" set "masterIntegrationId" = "accountIntegrations"."masterIntegrationId" from "accountIntegrations" where "subscriptionIntegrations"."accountIntegrationId" = "accountIntegrations"."id" and "subscriptionIntegrations"."masterIntegrationId" is null;
    end if;

    -- Set not null constraint on subscriptionIntegrations.masterIntegrationId
    if exists (select 1 from information_schema.columns where table_name = 'subscriptionIntegrations' and column_name = 'masterIntegrationId'  and is_nullable = 'YES') then
      alter table "subscriptionIntegrations" alter column "masterIntegrationId" SET NOT NULL;
    end if;

    -- Add masterIntegrationName to subscriptionIntegrations
    if not exists (select 1 from information_schema.columns where table_name = 'subscriptionIntegrations' and column_name = 'masterIntegrationName') then
      alter table "subscriptionIntegrations" add column "masterIntegrationName" varchar(80);
    end if;

    -- Add isIntegration to subscriptionIntegrations
    if not exists (select 1 from information_schema.columns where table_name = 'subscriptionIntegrations' and column_name = 'isIntegration') then
      alter table "subscriptionIntegrations" add column "isIntegration" BOOLEAN;
    end if;

    -- Add editRoleCode to subscriptionIntegrations
    if not exists (select 1 from information_schema.columns where table_name = 'subscriptionIntegrations' and column_name = 'editRoleCode') then
      alter table "subscriptionIntegrations" add column "editRoleCode" integer;
    end if;

    -- Add providerId to subscriptionIntegrations
    if not exists (select 1 from information_schema.columns where table_name = 'subscriptionIntegrations' and column_name = 'providerId') then
      alter table "subscriptionIntegrations" add column "providerId" varchar(24);
    end if;

    -- Add isBasic to subscriptionIntegrations
    if not exists (select 1 from information_schema.columns where table_name = 'subscriptionIntegrations' and column_name = 'isBasic') then
      alter table "subscriptionIntegrations" add column "isBasic" BOOLEAN;
    end if;

    -- Add contextDetail to jobStatesMap
    if not exists (select 1 from information_schema.columns where table_name = 'jobStatesMap' and column_name = 'contextDetail') then
      alter table "jobStatesMap" add column "contextDetail" varchar(255);
    end if;

    -- Updates jobStatesMap datatype from varchar to integer
    if exists (select 1 from information_schema.columns where table_name = 'jobStatesMap' and column_name = 'resourceId' and data_type = 'character varying') then
      alter table "jobStatesMap" alter column "resourceId" type integer using "resourceId"::integer;
    end if;

    -- change type of "operationResourceName" to varchar(255) in jobDependencies table
    if not exists (select 1 from information_schema.columns where table_name = 'jobDependencies' and column_name = 'operationResourceName' and data_type = 'character varying' and character_maximum_length = 255) then
      alter table "jobDependencies" alter column "operationResourceName" type varchar(255);
    end if;

    -- change size of "displayName" to varchar(255) in views table
    if not exists (select 1 from information_schema.columns where table_name = 'views' and column_name = 'displayName' and data_type = 'character varying' and character_maximum_length = 255) then
      alter table "views" alter column "displayName" type varchar(255);
    end if;

    -- change size of "objectId" to varchar(255) in viewObjects table
    if not exists (select 1 from information_schema.columns where table_name = 'viewObjects' and column_name = 'objectId' and data_type = 'character varying' and character_maximum_length = 255) then
      alter table "viewObjects" alter column "objectId" type varchar(255);
    end if;

    -- Add buildsCreatedAtI Index on builds
    if not exists (select 1 from pg_indexes where tablename = 'builds' and indexname = 'buildsCreatedAtI') then
      create index "buildsCreatedAtI" on "builds" using btree("createdAt");
    end if;

    -- Add sshKeys column to accountProfiles table
    if not exists (select 1 from information_schema.columns where table_name = 'accountProfiles' and column_name = 'sshKeys') then
      alter table "accountProfiles" add column "sshKeys" TEXT;
    end if;

    -- Add npsLatest column to accounts table
    if not exists (select 1 from information_schema.columns where table_name = 'accounts' and column_name = 'npsLatest') then
      alter table "accounts" add column "npsLatest" INT;
    end if;

    -- Add npsCount column to accounts table
    if not exists (select 1 from information_schema.columns where table_name = 'accounts' and column_name = 'npsCount') then
      alter table "accounts" add column "npsCount" INT;
    end if;

    -- Add npsAverage column to accounts table
    if not exists (select 1 from information_schema.columns where table_name = 'accounts' and column_name = 'npsAverage') then
      alter table "accounts" add column "npsAverage" REAL;
    end if;

    -- Add npsUpdatedAt column to accounts table
    if not exists (select 1 from information_schema.columns where table_name = 'accounts' and column_name = 'npsUpdatedAt') then
      alter table "accounts" add column "npsUpdatedAt" TIMESTAMP WITH TIME ZONE;
    end if;

    -- Add isDebug column to runs table
    if not exists (select 1 from information_schema.columns where table_name = 'runs' and column_name = 'isDebug') then
      alter table "runs" add column "isDebug" BOOLEAN;
    end if;

    -- Add isDebug column to jobs table
    if not exists (select 1 from information_schema.columns where table_name = 'jobs' and column_name = 'isDebug') then
      alter table "jobs" add column "isDebug" BOOLEAN;
    end if;

    -- Add isDebug column to clusterNodes table
    if not exists (select 1 from information_schema.columns where table_name = 'clusterNodes' and column_name = 'isDebug') then
      alter table "clusterNodes" add column "isDebug" BOOLEAN;
    end if;

    -- Add sshUser column to systemMachineImages table
    if not exists (select 1 from information_schema.columns where table_name = 'systemMachineImages' and column_name = 'sshUser') then
      alter table "systemMachineImages" add column "sshUser" VARCHAR(255) NOT NULL DEFAULT 'ubuntu';
    end if;

    -- Add sshPort column to systemMachineImages table
    if not exists (select 1 from information_schema.columns where table_name = 'systemMachineImages' and column_name = 'sshPort') then
      alter table "systemMachineImages" add column "sshPort" INT NOT NULL DEFAULT 22;
    end if;

    -- Add isSwapEnabled column to clusterNodes table
    if not exists (select 1 from information_schema.columns where table_name = 'clusterNodes' and column_name = 'isSwapEnabled') then
      alter table "clusterNodes" add column "isSwapEnabled" BOOLEAN NOT NULL DEFAULT false;
    end if;

    -- Add isSwapEnabled column to systemNodes table
    if not exists (select 1 from information_schema.columns where table_name = 'systemNodes' and column_name = 'isSwapEnabled') then
      alter table "systemNodes" add column "isSwapEnabled" BOOLEAN NOT NULL DEFAULT false;
    end if;

    -- Add customCloneUrl column to projects table
    if not exists (select 1 from information_schema.columns where table_name = 'projects' and column_name = 'customCloneUrl') then
      alter table "projects" add column "customCloneUrl" TEXT;
    end if;

    -- Add builderAccountLastValidatedAt column to projects table
    if not exists (select 1 from information_schema.columns where table_name = 'projects' and column_name = 'builderAccountLastValidatedAt') then
      alter table "projects" add column "builderAccountLastValidatedAt" timestamp with time zone;
    end if;

    -- Add archTypeCode column to systemMachineImages table
    if not exists (select 1 from information_schema.columns where table_name = 'systemMachineImages' and column_name = 'archTypeCode') then
      alter table "systemMachineImages" add column "archTypeCode" INT NOT NULL DEFAULT 8000;
    end if;

    -- Add foreign key relationship to systemMachineImages table
    if not exists (select 1 from pg_constraint where conname = 'systemMachineImages_archTypeCode_fkey') then
      alter table "systemMachineImages" add constraint "systemMachineImages_archTypeCode_fkey" foreign key ("archTypeCode") references "systemCodes"(code) on update restrict on delete restrict;
    end if;

    -- Add unique index to systemMachineImages table on isDefault and archTypeCode
    if not exists (select 1 from pg_indexes where tablename = 'systemMachineImages' and indexname = 'isDefaultArchTypeCodeU') then
      create unique index "isDefaultArchTypeCodeU" on "systemMachineImages" using btree("isDefault", "archTypeCode") WHERE "isDefault" = true;
    end if;

    -- Add reqProcImage column to systemMachineImages table
    if not exists (select 1 from information_schema.columns where table_name = 'systemMachineImages' and column_name = 'reqProcImage') then
      alter table "systemMachineImages" add column "reqProcImage" VARCHAR(80);
    end if;

    -- Add isInternal column to accountIntegrations table
    if not exists (select 1 from information_schema.columns where table_name = 'accountIntegrations' and column_name = 'isInternal') then
      alter table "accountIntegrations" add column "isInternal" BOOLEAN;
    end if;

    -- Add isBasic column to accountIntegrations table
    if not exists (select 1 from information_schema.columns where table_name = 'accountIntegrations' and column_name = 'isBasic') then
      alter table "accountIntegrations" add column "isBasic" BOOLEAN;
    end if;

    -- Add projectId column to jobTestReports table and populate projectId for existing jobTestReports
    if not exists (select 1 from information_schema.columns where table_name = 'jobTestReports' and column_name = 'projectId') then
      alter table "jobTestReports" add column "projectId" varchar(24);
      update "jobTestReports" SET "projectId" = jobs."projectId" from jobs where "jobTestReports"."jobId" = "jobs".id;
      create index "jobTestRepProjIdI" on "jobTestReports" using btree("projectId");
    end if;

  -- Adds foreign key relationships for jobTestReports
    if not exists (select 1 from pg_constraint where conname = 'jobTestReports_projectId_fkey') then
      alter table "jobTestReports" add constraint "jobTestReports_projectId_fkey" foreign key ("projectId") references "projects"(id) on update restrict on delete restrict;
    end if;

    -- Add projectId column to jobCoverageReports table and populate projectId for existing jobCoverageReports
    if not exists (select 1 from information_schema.columns where table_name = 'jobCoverageReports' and column_name = 'projectId') then
      alter table "jobCoverageReports" add column "projectId" varchar(24);
      update "jobCoverageReports" SET "projectId" = jobs."projectId" from jobs where "jobCoverageReports"."jobId" = "jobs".id;
      create index "jobCovRepProjIdI" on "jobCoverageReports" using btree("projectId");
    end if;

  -- Adds foreign key relationships for jobCoverageReports
    if not exists (select 1 from pg_constraint where conname = 'jobCoverageReports_projectId_fkey') then
      alter table "jobCoverageReports" add constraint "jobCoverageReports_projectId_fkey" foreign key ("projectId") references "projects"(id) on update restrict on delete restrict;
    end if;

    -- Add npsAnswer column to accounts
    if not exists (select 1 from information_schema.columns where table_name = 'accounts' and column_name = 'npsAnswer') then
      alter table "accounts" add column "npsAnswer" varchar(1024);
    end if;

    -- Add intercomId column to accounts
    if not exists (select 1 from information_schema.columns where table_name = 'accounts' and column_name = 'intercomId') then
      alter table "accounts" add column "intercomId" varchar(30);
    end if;

    -- Add lastIntercomSyncAt column to accounts table
    if not exists (select 1 from information_schema.columns where table_name = 'accounts' and column_name = 'lastIntercomSyncAt') then
      alter table "accounts" add column "lastIntercomSyncAt" TIMESTAMP WITH TIME ZONE;
    end if;

    -- Remove dailyAggs.activeSubscriptions30Days
    if exists (select 1 from information_schema.columns where table_name = 'dailyAggs' and column_name = 'activeSubscriptions30Days') then
      alter table "dailyAggs" drop column "activeSubscriptions30Days";
    end if;

    -- Remove dailyAggs.activeProjects30Days
    if exists (select 1 from information_schema.columns where table_name = 'dailyAggs' and column_name = 'activeProjects30Days') then
      alter table "dailyAggs" drop column "activeProjects30Days";
    end if;

    -- Remove dailyAggs.buildersToday
    if exists (select 1 from information_schema.columns where table_name = 'dailyAggs' and column_name = 'buildersToday') then
      alter table "dailyAggs" drop column "buildersToday";
    end if;

    -- Remove dailyAggs.builders30Days
    if exists (select 1 from information_schema.columns where table_name = 'dailyAggs' and column_name = 'builders30Days') then
      alter table "dailyAggs" drop column "builders30Days";
    end if;

    -- Add subscriptions.clusterLicenses
    if not exists (select 1 from information_schema.columns where table_name = 'subscriptions' and column_name = 'clusterLicenses') then
      alter table "subscriptions" add column "clusterLicenses" TEXT;
    end if;

    -- Add buildJobCount column to dailyAggs
    if not exists (select 1 from information_schema.columns where table_name = 'dailyAggs' and column_name = 'buildJobCount') then
      alter table "dailyAggs" add column "buildJobCount" INTEGER;
    end if;

    -- Add buildJobLengthInMS column to dailyAggs
    if not exists (select 1 from information_schema.columns where table_name = 'dailyAggs' and column_name = 'buildJobLengthInMS') then
      alter table "dailyAggs" add column "buildJobLengthInMS" BIGINT;
    end if;

    -- Add buildJobsFailed column to dailyAggs
    if not exists (select 1 from information_schema.columns where table_name = 'dailyAggs' and column_name = 'buildJobsFailed') then
      alter table "dailyAggs" add column "buildJobsFailed" INTEGER;
    end if;

    -- Add buildJobsSuccessful column to dailyAggs
    if not exists (select 1 from information_schema.columns where table_name = 'dailyAggs' and column_name = 'buildJobsSuccessful') then
      alter table "dailyAggs" add column "buildJobsSuccessful" INTEGER;
    end if;

    -- Add buildJobsUnstable column to dailyAggs
    if not exists (select 1 from information_schema.columns where table_name = 'dailyAggs' and column_name = 'buildJobsUnstable') then
      alter table "dailyAggs" add column "buildJobsUnstable" INTEGER;
    end if;

    -- Add buildJobsTimedOut column to dailyAggs
    if not exists (select 1 from information_schema.columns where table_name = 'dailyAggs' and column_name = 'buildJobsTimedOut') then
      alter table "dailyAggs" add column "buildJobsTimedOut" INTEGER;
    end if;

    -- Add buildJobsSkipped column to dailyAggs
    if not exists (select 1 from information_schema.columns where table_name = 'dailyAggs' and column_name = 'buildJobsSkipped') then
      alter table "dailyAggs" add column "buildJobsSkipped" INTEGER;
    end if;

    -- Add buildJobsCancelled column to dailyAggs
    if not exists (select 1 from information_schema.columns where table_name = 'dailyAggs' and column_name = 'buildJobsCancelled') then
      alter table "dailyAggs" add column "buildJobsCancelled" INTEGER;
    end if;

    -- Add activePaidSubscriptionsToday column to dailyAggs
    if not exists (select 1 from information_schema.columns where table_name = 'dailyAggs' and column_name = 'activePaidSubscriptionsToday') then
      alter table "dailyAggs" add column "activePaidSubscriptionsToday" INTEGER;
    end if;

    -- Add prJobsCount column to projectDailyAggs
    if not exists (select 1 from information_schema.columns where table_name = 'projectDailyAggs' and column_name = 'prJobsCount') then
      alter table "projectDailyAggs" add column "prJobsCount" INTEGER DEFAULT 0;
    end if;

    -- Add prJobsSuccessful column to projectDailyAggs
    if not exists (select 1 from information_schema.columns where table_name = 'projectDailyAggs' and column_name = 'prJobsSuccessful') then
      alter table "projectDailyAggs" add column "prJobsSuccessful" INTEGER DEFAULT 0;
    end if;

    -- Add prJobsFailed column to projectDailyAggs
    if not exists (select 1 from information_schema.columns where table_name = 'projectDailyAggs' and column_name = 'prJobsFailed') then
      alter table "projectDailyAggs" add column "prJobsFailed" INTEGER DEFAULT 0;
    end if;

    -- Add prJobsUnstable column to projectDailyAggs
    if not exists (select 1 from information_schema.columns where table_name = 'projectDailyAggs' and column_name = 'prJobsUnstable') then
      alter table "projectDailyAggs" add column "prJobsUnstable" INTEGER DEFAULT 0;
    end if;

    -- Add prJobsTimedOut column to projectDailyAggs
    if not exists (select 1 from information_schema.columns where table_name = 'projectDailyAggs' and column_name = 'prJobsTimedOut') then
      alter table "projectDailyAggs" add column "prJobsTimedOut" INTEGER DEFAULT 0;
    end if;

    -- Add prJobsSkipped column to projectDailyAggs
    if not exists (select 1 from information_schema.columns where table_name = 'projectDailyAggs' and column_name = 'prJobsSkipped') then
      alter table "projectDailyAggs" add column "prJobsSkipped" INTEGER DEFAULT 0;
    end if;

    -- Add prJobsCancelled column to projectDailyAggs
    if not exists (select 1 from information_schema.columns where table_name = 'projectDailyAggs' and column_name = 'prJobsCancelled') then
      alter table "projectDailyAggs" add column "prJobsCancelled" INTEGER DEFAULT 0;
    end if;

    -- Add subscriptions.defaultClusterId
    if not exists (select 1 from information_schema.columns where table_name = 'subscriptions' and column_name = 'defaultClusterId') then
      alter table "subscriptions" add column "defaultClusterId" INTEGER;
    end if;

    -- Add clusterNodes.clusterId
    if not exists (select 1 from information_schema.columns where table_name = 'clusterNodes' and column_name = 'clusterId') then
      alter table "clusterNodes" add column "clusterId" INTEGER;
    end if;

    if exists (select 1 from information_schema.columns where table_name = 'clusters') then
      -- Add subscriptions.defaultClusterId foreign key
      if not exists (select 1 from pg_constraint where conname = 'subscriptions_defaultClusterId_fkey') then
        alter table "subscriptions" add constraint "subscriptions_defaultClusterId_fkey" foreign key ("defaultClusterId") references "clusters"(id) on update restrict on delete restrict;
      end if;

      -- Add clusterNodes.clusterId foreign key
      if not exists (select 1 from pg_constraint where conname = 'clusterNodes_clusterId_fkey') then
        alter table "clusterNodes" add constraint "clusterNodes_clusterId_fkey" foreign key ("clusterId") references "clusters"(id) on update restrict on delete restrict;
      end if;
    end if;

    -- Add systemMachineImages.runtimeTemplateId
    if not exists (select 1 from information_schema.columns where table_name = 'systemMachineImages' and column_name = 'runtimeTemplateId') then
      alter table "systemMachineImages" add column "runtimeTemplateId" INTEGER;
    end if;

    if exists (select 1 from information_schema.columns where table_name = 'runtimeTemplates') then
      -- Add systemMachineImages.runtimeTemplateId foreign key
      if not exists (select 1 from pg_constraint where conname = 'systemMachineImages_runtimeTemplateId_fkey') then
        alter table "systemMachineImages" add constraint "systemMachineImages_runtimeTemplateId_fkey" foreign key ("runtimeTemplateId") references "runtimeTemplates"(id) on update restrict on delete restrict;
      end if;
    end if;

    -- Add activeFreePrivateProjectsToday column to dailyAggs
    if not exists (select 1 from information_schema.columns where table_name = 'dailyAggs' and column_name = 'activeFreePrivateProjectsToday') then
      alter table "dailyAggs" add column "activeFreePrivateProjectsToday" INTEGER;
    end if;

    --
    -- runtimeTemplates
    --

    if exists (select 1 from information_schema.columns where table_name = 'runtimeTemplates') then

      -- Add isAvailable column to runtimeTemplates

      if not exists (select 1 from information_schema.columns where table_name = 'runtimeTemplates' and column_name = 'isAvailable') then
        alter table "runtimeTemplates" add column "isAvailable" BOOLEAN NOT NULL DEFAULT true;
      end if;

      -- x86_64 Ubuntu_14.04 v5.6.1
      if not exists (select 1 from "runtimeTemplates" where "archTypeCode" = 8000 and "osTypeCode" = 9000 and "version" = 'v5.6.1') then
        insert into "runtimeTemplates" ("archTypeCode", "osTypeCode", "version", "drydockOrg", "drydockFamily", "drydockTag", "defaultTaskImage", "reqProcImage", "isDefault", "createdAt", "updatedAt")
        values (8000, 9000, 'v5.6.1', 'drydock', 'u16', 'v5.6.1', 'microbase', 'reqproc', false, '2017-12-19', '2017-12-19');
      end if;

      -- x86_64 Ubuntu_14.04 v5.7.3
      if not exists (select 1 from "runtimeTemplates" where "archTypeCode" = 8000 and "osTypeCode" = 9000 and "version" = 'v5.7.3') then
        insert into "runtimeTemplates" ("archTypeCode", "osTypeCode", "version", "drydockOrg", "drydockFamily", "drydockTag", "defaultTaskImage", "reqProcImage", "isDefault", "createdAt", "updatedAt")
        values (8000, 9000, 'v5.7.3', 'drydock', 'u16', 'v5.7.3', 'microbase', 'reqproc', false, '2017-12-19', '2017-12-19');
      end if;

      -- x86_64 Ubuntu_14.04 v5.8.2
      if not exists (select 1 from "runtimeTemplates" where "archTypeCode" = 8000 and "osTypeCode" = 9000 and "version" = 'v5.8.2') then
        insert into "runtimeTemplates" ("archTypeCode", "osTypeCode", "version", "drydockOrg", "drydockFamily", "drydockTag", "defaultTaskImage", "reqProcImage", "isDefault", "createdAt", "updatedAt")
        values (8000, 9000, 'v5.8.2', 'drydock', 'u16', 'v5.8.2', 'microbase', 'reqproc', false, '2017-12-19', '2017-12-19');
      end if;

      -- x86_64 Ubuntu_14.04 v5.10.4
      if not exists (select 1 from "runtimeTemplates" where "archTypeCode" = 8000 and "osTypeCode" = 9000 and "version" = 'v5.10.4') then
        insert into "runtimeTemplates" ("archTypeCode", "osTypeCode", "version", "drydockOrg", "drydockFamily", "drydockTag", "defaultTaskImage", "reqProcImage", "isDefault", "createdAt", "updatedAt")
        values (8000, 9000, 'v5.10.4', 'drydock', 'u16', 'v5.10.4', 'microbase', 'reqproc', false, '2017-12-19', '2017-12-19');
      end if;

      -- x86_64 Ubuntu_14.04 v6.1.4
      if not exists (select 1 from "runtimeTemplates" where "archTypeCode" = 8000 and "osTypeCode" = 9000 and "version" = 'v6.1.4') then
        insert into "runtimeTemplates" ("archTypeCode", "osTypeCode", "version", "drydockOrg", "drydockFamily", "drydockTag", "defaultTaskImage", "reqProcImage", "isDefault", "createdAt", "updatedAt")
        values (8000, 9000, 'v6.1.4', 'drydock', 'u16', 'v6.1.4', 'microbase', 'reqproc', false, '2018-01-24', '2018-01-24');
      end if;

      -- x86_64 Ubuntu_16.04 v5.6.1
      if not exists (select 1 from "runtimeTemplates" where "archTypeCode" = 8000 and "osTypeCode" = 9001 and "version" = 'v5.6.1') then
        insert into "runtimeTemplates" ("archTypeCode", "osTypeCode", "version", "drydockOrg", "drydockFamily", "drydockTag", "defaultTaskImage", "reqProcImage", "isDefault", "createdAt", "updatedAt")
        values (8000, 9001, 'v5.6.1', 'drydock', 'u16', 'v5.6.1', 'microbase', 'reqproc', false, '2017-12-19', '2017-12-19');
      end if;

      -- x86_64 Ubuntu_16.04 v5.7.3
      if not exists (select 1 from "runtimeTemplates" where "archTypeCode" = 8000 and "osTypeCode" = 9001 and "version" = 'v5.7.3') then
        insert into "runtimeTemplates" ("archTypeCode", "osTypeCode", "version", "drydockOrg", "drydockFamily", "drydockTag", "defaultTaskImage", "reqProcImage", "isDefault", "createdAt", "updatedAt")
        values (8000, 9001, 'v5.7.3', 'drydock', 'u16', 'v5.7.3', 'microbase', 'reqproc', false, '2017-12-19', '2017-12-19');
      end if;

      -- x86_64 Ubuntu_16.04 v5.8.2
      if not exists (select 1 from "runtimeTemplates" where "archTypeCode" = 8000 and "osTypeCode" = 9001 and "version" = 'v5.8.2') then
        insert into "runtimeTemplates" ("archTypeCode", "osTypeCode", "version", "drydockOrg", "drydockFamily", "drydockTag", "defaultTaskImage", "reqProcImage", "isDefault", "createdAt", "updatedAt")
        values (8000, 9001, 'v5.8.2', 'drydock', 'u16', 'v5.8.2', 'microbase', 'reqproc', false, '2017-12-19', '2017-12-19');
      end if;

      -- x86_64 Ubuntu_16.04 v5.10.4
      if not exists (select 1 from "runtimeTemplates" where "archTypeCode" = 8000 and "osTypeCode" = 9001 and "version" = 'v5.10.4') then
        insert into "runtimeTemplates" ("archTypeCode", "osTypeCode", "version", "drydockOrg", "drydockFamily", "drydockTag", "defaultTaskImage", "reqProcImage", "isDefault", "createdAt", "updatedAt")
        values (8000, 9001, 'v5.10.4', 'drydock', 'u16', 'v5.10.4', 'microbase', 'reqproc', false, '2017-12-19', '2017-12-19');
      end if;

      -- x86_64 Ubuntu_16.04 v6.1.4
      if not exists (select 1 from "runtimeTemplates" where "archTypeCode" = 8000 and "osTypeCode" = 9001 and "version" = 'v6.1.4') then
        insert into "runtimeTemplates" ("archTypeCode", "osTypeCode", "version", "drydockOrg", "drydockFamily", "drydockTag", "defaultTaskImage", "reqProcImage", "isDefault", "createdAt", "updatedAt")
        values (8000, 9001, 'v6.1.4', 'drydock', 'u16', 'v6.1.4', 'microbase', 'reqproc', false, '2018-01-24', '2018-01-24');
      end if;

      -- aarch64 Ubuntu_16.04 v5.9.4
      if not exists (select 1 from "runtimeTemplates" where "archTypeCode" = 8001 and "osTypeCode" = 9001 and "version" = 'v5.9.4') then
        insert into "runtimeTemplates" ("archTypeCode", "osTypeCode", "version", "drydockOrg", "drydockFamily", "drydockTag", "defaultTaskImage", "reqProcImage", "isDefault", "createdAt", "updatedAt")
        values (8001, 9001, 'v5.9.4', 'drydockaarch64', 'u16', 'v5.9.4', 'microbase', 'reqproc', false, '2017-12-19', '2017-12-19');
      end if;
      -- update drydock image info for aarch64 v5.9.4
      if exists (select 1 from "runtimeTemplates" where "archTypeCode" = 8001 and "osTypeCode" = 9001 and "version" = 'v5.9.4') then
        update "runtimeTemplates" set "drydockOrg" = 'drydock', "defaultTaskImage" = 'aarch64_microbase', "reqProcImage" = 'aarch64_u16reqproc', "drydockFamily" = 'aarch64_u16'
          where "archTypeCode" = 8001 and "osTypeCode" = 9001 and "version" = 'v5.9.4';
      end if;

      -- x86_64 WindowsServer_2016 v5.10.4
      if not exists (select 1 from "runtimeTemplates" where "archTypeCode" = 8000 and "osTypeCode" = 9002 and "version" = 'v5.10.4') then
        insert into "runtimeTemplates" ("archTypeCode", "osTypeCode", "version", "drydockOrg", "drydockFamily", "drydockTag", "defaultTaskImage", "reqProcImage", "isDefault", "createdAt", "updatedAt")
        values (8000, 9002, 'v5.10.4', 'drydock', 'w16', 'v5.10.4', 'w16microbase', 'w16reqproc', false, '2017-12-19', '2017-12-19');
      end if;

      -- x86_64 macOS_10.12 v5.10.4
      if not exists (select 1 from "runtimeTemplates" where "archTypeCode" = 8000 and "osTypeCode" = 9003 and "version" = 'v5.10.4') then
        insert into "runtimeTemplates" ("archTypeCode", "osTypeCode", "version", "drydockOrg", "drydockFamily", "drydockTag", "defaultTaskImage", "reqProcImage", "isDefault", "createdAt", "updatedAt")
        values (8000, 9003, 'v5.10.4', 'drydock', 'u16', 'v5.10.4', 'microbase', 'm10reqproc', false, '2017-12-19', '2017-12-19');
      end if;

      -- x86_64 CentOS_7 v5.10.4
      if not exists (select 1 from "runtimeTemplates" where "archTypeCode" = 8000 and "osTypeCode" = 9004 and "version" = 'v5.10.4') then
        insert into "runtimeTemplates" ("archTypeCode", "osTypeCode", "version", "drydockOrg", "drydockFamily", "drydockTag", "defaultTaskImage", "reqProcImage", "isDefault", "createdAt", "updatedAt")
        values (8000, 9004, 'v5.10.4', 'drydock', 'u16', 'v5.10.4', 'microbase', 'reqproc', false, '2017-12-19', '2017-12-19');
      end if;

      --------------------------------------------------------
      -------------- v6.2.4 Templates ------------------------
      --------------------------------------------------------

      -- x86_64 Ubuntu_14.04
      if not exists (select 1 from "runtimeTemplates" where "archTypeCode" = 8000 and "osTypeCode" = 9000 and "version" = 'v6.2.4') then
        insert into "runtimeTemplates" ("archTypeCode", "osTypeCode", "version", "drydockOrg", "drydockFamily", "drydockTag", "defaultTaskImage", "reqProcImage", "isDefault", "createdAt", "updatedAt")
        values (8000, 9000, 'v6.2.4', 'drydock', 'u16', 'v6.2.4', 'microbase', 'reqproc', false, '2018-03-05 00:00:00+00', '2018-03-05 00:00:00+00');
      end if;

      -- x86_64 Ubuntu_16.04
      if not exists (select 1 from "runtimeTemplates" where "archTypeCode" = 8000 and "osTypeCode" = 9001 and "version" = 'v6.2.4') then
        insert into "runtimeTemplates" ("archTypeCode", "osTypeCode", "version", "drydockOrg", "drydockFamily", "drydockTag", "defaultTaskImage", "reqProcImage", "isDefault", "createdAt", "updatedAt")
        values (8000, 9001, 'v6.2.4', 'drydock', 'u16', 'v6.2.4', 'microbase', 'reqproc', false, '2018-03-05 00:00:00+00', '2018-03-05 00:00:00+00');
      end if;

      -- aarch64 Ubuntu_16.04
      if not exists (select 1 from "runtimeTemplates" where "archTypeCode" = 8001 and "osTypeCode" = 9001 and "version" = 'v6.2.4') then
        insert into "runtimeTemplates" ("archTypeCode", "osTypeCode", "version", "drydockOrg", "drydockFamily", "drydockTag", "defaultTaskImage", "reqProcImage", "isDefault", "createdAt", "updatedAt")
        values (8001, 9001, 'v6.2.4', 'drydockaarch64', 'u16', 'v6.2.4', 'microbase', 'reqproc', false, '2018-03-05 00:00:00+00', '2018-03-05 00:00:00+00');
      end if;
      -- update drydock image info for aarch64 v6.2.4
      if exists (select 1 from "runtimeTemplates" where "archTypeCode" = 8001 and "osTypeCode" = 9001 and "version" = 'v6.2.4') then
        update "runtimeTemplates" set "drydockOrg" = 'drydock', "defaultTaskImage" = 'aarch64_microbase', "reqProcImage" = 'aarch64_u16reqproc', "drydockFamily" = 'aarch64_u16'
          where "archTypeCode" = 8001 and "osTypeCode" = 9001 and "version" = 'v6.2.4';
      end if;

      -- x86_64 WindowsServer_2016
      if not exists (select 1 from "runtimeTemplates" where "archTypeCode" = 8000 and "osTypeCode" = 9002 and "version" = 'v6.2.4') then
        insert into "runtimeTemplates" ("archTypeCode", "osTypeCode", "version", "drydockOrg", "drydockFamily", "drydockTag", "defaultTaskImage", "reqProcImage", "isDefault", "createdAt", "updatedAt")
        values (8000, 9002, 'v6.2.4', 'drydock', 'w16', 'v6.2.4', 'w16microbase', 'w16reqproc', false, '2018-03-05 00:00:00+00', '2018-03-05 00:00:00+00');
      end if;

      -- x86_64 macOS_10.12
      if not exists (select 1 from "runtimeTemplates" where "archTypeCode" = 8000 and "osTypeCode" = 9003 and "version" = 'v6.2.4') then
        insert into "runtimeTemplates" ("archTypeCode", "osTypeCode", "version", "drydockOrg", "drydockFamily", "drydockTag", "defaultTaskImage", "reqProcImage", "isDefault", "createdAt", "updatedAt")
        values (8000, 9003, 'v6.2.4', 'drydock', 'u16', 'v6.2.4', 'microbase', 'm10reqproc', false, '2018-03-05 00:00:00+00', '2018-03-05 00:00:00+00');
      end if;

      -- x86_64 CentOS_7
      if not exists (select 1 from "runtimeTemplates" where "archTypeCode" = 8000 and "osTypeCode" = 9004 and "version" = 'v6.2.4') then
        insert into "runtimeTemplates" ("archTypeCode", "osTypeCode", "version", "drydockOrg", "drydockFamily", "drydockTag", "defaultTaskImage", "reqProcImage", "isDefault", "createdAt", "updatedAt")
        values (8000, 9004, 'v6.2.4', 'drydock', 'u16', 'v6.2.4', 'microbase', 'reqproc', false, '2018-03-05 00:00:00+00', '2018-03-05 00:00:00+00');
      end if;

      -- x86_64 RHEL_7
      if not exists (select 1 from "runtimeTemplates" where "archTypeCode" = 8000 and "osTypeCode" = 9005 and "version" = 'v6.2.4') then
        insert into "runtimeTemplates" ("archTypeCode", "osTypeCode", "version", "drydockOrg", "drydockFamily", "drydockTag", "defaultTaskImage", "reqProcImage", "isDefault", "createdAt", "updatedAt")
        values (8000, 9005, 'v6.2.4', 'drydock', 'c7', 'v6.2.4', 'c7all', 'reqproc', false, '2018-03-05 00:00:00+00', '2018-03-05 00:00:00+00');
      end if;

      -- update all x86_64 OSes that use reqproc so far (based on u16) to use u16reqproc instead
      -- that is u16, rhel, centos
      if exists (select 1 from "runtimeTemplates" where "archTypeCode" = 8000 and "reqProcImage" = 'reqproc' and ("osTypeCode" = 9001 OR "osTypeCode"=9005 OR "osTypeCode"=9004)) then
        update "runtimeTemplates" set "reqProcImage" = 'u16reqproc' where "archTypeCode" = 8000 and "reqProcImage" = 'reqproc' and ("osTypeCode" = 9001 OR "osTypeCode"=9005 OR "osTypeCode"=9004);
      end if;

      -- update all x86_64 u14 to use u14reqproc
      if exists (select 1 from "runtimeTemplates" where "archTypeCode" = 8000 and "osTypeCode" = 9000 and "reqProcImage" = 'reqproc') then
        update "runtimeTemplates" set "reqProcImage" = 'u14reqproc' where "archTypeCode" = 8000 and "osTypeCode" = 9000 and "reqProcImage" = 'reqproc';
      end if;


      --------------------------------------------------------
      -------------- v6.3.4 Templates ------------------------
      --------------------------------------------------------

      -- x86_64 Ubuntu_14.04
      if not exists (select 1 from "runtimeTemplates" where "archTypeCode" = 8000 and "osTypeCode" = 9000 and "version" = 'v6.3.4') then
        insert into "runtimeTemplates" ("archTypeCode", "osTypeCode", "version", "drydockOrg", "drydockFamily", "drydockTag", "defaultTaskImage", "reqProcImage", "isDefault", "createdAt", "updatedAt")
        values (8000, 9000, 'v6.3.4', 'drydock', 'u16', 'v6.3.4', 'u14all', 'u14reqproc', false, '2018-03-28 00:00:00+00', '2018-03-28 00:00:00+00');
      end if;

      -- x86_64 Ubuntu_16.04
      if not exists (select 1 from "runtimeTemplates" where "archTypeCode" = 8000 and "osTypeCode" = 9001 and "version" = 'v6.3.4') then
        insert into "runtimeTemplates" ("archTypeCode", "osTypeCode", "version", "drydockOrg", "drydockFamily", "drydockTag", "defaultTaskImage", "reqProcImage", "isDefault", "createdAt", "updatedAt")
        values (8000, 9001, 'v6.3.4', 'drydock', 'u16', 'v6.3.4', 'u16all', 'u16reqproc', false, '2018-03-28 00:00:00+00', '2018-03-28 00:00:00+00');
      end if;

      -- aarch64 Ubuntu_16.04
      if not exists (select 1 from "runtimeTemplates" where "archTypeCode" = 8001 and "osTypeCode" = 9001 and "version" = 'v6.3.4') then
        insert into "runtimeTemplates" ("archTypeCode", "osTypeCode", "version", "drydockOrg", "drydockFamily", "drydockTag", "defaultTaskImage", "reqProcImage", "isDefault", "createdAt", "updatedAt")
        values (8001, 9001, 'v6.3.4', 'drydock', 'aarch64_u16', 'v6.3.4', 'aarch64_u16all', 'aarch64_u16reqproc', false, '2018-03-28 00:00:00+00', '2018-03-28 00:00:00+00');
      end if;

      -- x86_64 WindowsServer_2016
      if not exists (select 1 from "runtimeTemplates" where "archTypeCode" = 8000 and "osTypeCode" = 9002 and "version" = 'v6.3.4') then
        insert into "runtimeTemplates" ("archTypeCode", "osTypeCode", "version", "drydockOrg", "drydockFamily", "drydockTag", "defaultTaskImage", "reqProcImage", "isDefault", "createdAt", "updatedAt")
        values (8000, 9002, 'v6.3.4', 'drydock', 'w16', 'v6.3.4', 'w16', 'w16reqproc', false, '2018-03-28 00:00:00+00', '2018-03-28 00:00:00+00');
      end if;

      -- x86_64 macOS_10.12
      if not exists (select 1 from "runtimeTemplates" where "archTypeCode" = 8000 and "osTypeCode" = 9003 and "version" = 'v6.3.4') then
        insert into "runtimeTemplates" ("archTypeCode", "osTypeCode", "version", "drydockOrg", "drydockFamily", "drydockTag", "defaultTaskImage", "reqProcImage", "isDefault", "createdAt", "updatedAt")
        values (8000, 9003, 'v6.3.4', 'drydock', 'u16', 'v6.3.4', 'microbase', 'm10reqproc', false, '2018-03-28 00:00:00+00', '2018-03-28 00:00:00+00');
      end if;

      -- x86_64 CentOS_7
      if not exists (select 1 from "runtimeTemplates" where "archTypeCode" = 8000 and "osTypeCode" = 9004 and "version" = 'v6.3.4') then
        insert into "runtimeTemplates" ("archTypeCode", "osTypeCode", "version", "drydockOrg", "drydockFamily", "drydockTag", "defaultTaskImage", "reqProcImage", "isDefault", "createdAt", "updatedAt")
        values (8000, 9004, 'v6.3.4', 'drydock', 'c7', 'v6.3.4', 'c7all', 'u16reqproc', false, '2018-03-28 00:00:00+00', '2018-03-28 00:00:00+00');
      end if;

      -- x86_64 RHEL_7
      if not exists (select 1 from "runtimeTemplates" where "archTypeCode" = 8000 and "osTypeCode" = 9005 and "version" = 'v6.3.4') then
        insert into "runtimeTemplates" ("archTypeCode", "osTypeCode", "version", "drydockOrg", "drydockFamily", "drydockTag", "defaultTaskImage", "reqProcImage", "isDefault", "createdAt", "updatedAt")
        values (8000, 9005, 'v6.3.4', 'drydock', 'c7', 'v6.3.4', 'c7all', 'u16reqproc', false, '2018-03-28 00:00:00+00', '2018-03-28 00:00:00+00');
      end if;


      --------------------------------------------------------
      -------------- v6.4.4 Templates ------------------------
      --------------------------------------------------------

      -- x86_64 Ubuntu_14.04
      if not exists (select 1 from "runtimeTemplates" where "archTypeCode" = 8000 and "osTypeCode" = 9000 and "version" = 'v6.4.4') then
        insert into "runtimeTemplates" ("archTypeCode", "osTypeCode", "version", "drydockOrg", "drydockFamily", "drydockTag", "defaultTaskImage", "reqProcImage", "isDefault", "createdAt", "updatedAt")
        values (8000, 9000, 'v6.4.4', 'drydock', 'u16', 'v6.4.4', 'u14all', 'u14reqproc', false, '2018-03-28 00:00:00+00', '2018-03-28 00:00:00+00');
      end if;

      -- x86_64 Ubuntu_16.04
      if not exists (select 1 from "runtimeTemplates" where "archTypeCode" = 8000 and "osTypeCode" = 9001 and "version" = 'v6.4.4') then
        insert into "runtimeTemplates" ("archTypeCode", "osTypeCode", "version", "drydockOrg", "drydockFamily", "drydockTag", "defaultTaskImage", "reqProcImage", "isDefault", "createdAt", "updatedAt")
        values (8000, 9001, 'v6.4.4', 'drydock', 'u16', 'v6.4.4', 'u16all', 'u16reqproc', false, '2018-03-28 00:00:00+00', '2018-03-28 00:00:00+00');
      end if;

      -- aarch64 Ubuntu_16.04
      if not exists (select 1 from "runtimeTemplates" where "archTypeCode" = 8001 and "osTypeCode" = 9001 and "version" = 'v6.4.4') then
        insert into "runtimeTemplates" ("archTypeCode", "osTypeCode", "version", "drydockOrg", "drydockFamily", "drydockTag", "defaultTaskImage", "reqProcImage", "isDefault", "createdAt", "updatedAt")
        values (8001, 9001, 'v6.4.4', 'drydock', 'aarch64_u16', 'v6.4.4', 'aarch64_u16all', 'aarch64_u16reqproc', false, '2018-03-28 00:00:00+00', '2018-03-28 00:00:00+00');
      end if;

      -- x86_64 WindowsServer_2016
      if not exists (select 1 from "runtimeTemplates" where "archTypeCode" = 8000 and "osTypeCode" = 9002 and "version" = 'v6.4.4') then
        insert into "runtimeTemplates" ("archTypeCode", "osTypeCode", "version", "drydockOrg", "drydockFamily", "drydockTag", "defaultTaskImage", "reqProcImage", "isDefault", "createdAt", "updatedAt")
        values (8000, 9002, 'v6.4.4', 'drydock', 'w16', 'v6.4.4', 'w16', 'w16reqproc', false, '2018-03-28 00:00:00+00', '2018-03-28 00:00:00+00');
      end if;

      -- x86_64 macOS_10.12
      if not exists (select 1 from "runtimeTemplates" where "archTypeCode" = 8000 and "osTypeCode" = 9003 and "version" = 'v6.4.4') then
        insert into "runtimeTemplates" ("archTypeCode", "osTypeCode", "version", "drydockOrg", "drydockFamily", "drydockTag", "defaultTaskImage", "reqProcImage", "isDefault", "createdAt", "updatedAt")
        values (8000, 9003, 'v6.4.4', 'drydock', 'u16', 'v6.4.4', 'microbase', 'm10reqproc', false, '2018-03-28 00:00:00+00', '2018-03-28 00:00:00+00');
      end if;

      -- x86_64 CentOS_7
      if not exists (select 1 from "runtimeTemplates" where "archTypeCode" = 8000 and "osTypeCode" = 9004 and "version" = 'v6.4.4') then
        insert into "runtimeTemplates" ("archTypeCode", "osTypeCode", "version", "drydockOrg", "drydockFamily", "drydockTag", "defaultTaskImage", "reqProcImage", "isDefault", "createdAt", "updatedAt")
        values (8000, 9004, 'v6.4.4', 'drydock', 'c7', 'v6.4.4', 'c7all', 'u16reqproc', false, '2018-03-28 00:00:00+00', '2018-03-28 00:00:00+00');
      end if;

      -- x86_64 RHEL_7
      if not exists (select 1 from "runtimeTemplates" where "archTypeCode" = 8000 and "osTypeCode" = 9005 and "version" = 'v6.4.4') then
        insert into "runtimeTemplates" ("archTypeCode", "osTypeCode", "version", "drydockOrg", "drydockFamily", "drydockTag", "defaultTaskImage", "reqProcImage", "isDefault", "createdAt", "updatedAt")
        values (8000, 9005, 'v6.4.4', 'drydock', 'c7', 'v6.4.4', 'c7all', 'u16reqproc', false, '2018-03-28 00:00:00+00', '2018-03-28 00:00:00+00');
      end if;

      --------------------------------------------------------
      -------------- v6.5.4 Templates ------------------------
      --------------------------------------------------------

      -- x86_64 Ubuntu_14.04
      if not exists (select 1 from "runtimeTemplates" where "archTypeCode" = 8000 and "osTypeCode" = 9000 and "version" = 'v6.5.4') then
        insert into "runtimeTemplates" ("archTypeCode", "osTypeCode", "version", "drydockOrg", "drydockFamily", "drydockTag", "defaultTaskImage", "reqProcImage", "isDefault", "createdAt", "updatedAt")
        values (8000, 9000, 'v6.5.4', 'drydock', 'u16', 'v6.5.4', 'u14all', 'u14reqproc', false, '2018-03-28 00:00:00+00', '2018-03-28 00:00:00+00');
      end if;

      -- x86_64 Ubuntu_16.04
      if not exists (select 1 from "runtimeTemplates" where "archTypeCode" = 8000 and "osTypeCode" = 9001 and "version" = 'v6.5.4') then
        insert into "runtimeTemplates" ("archTypeCode", "osTypeCode", "version", "drydockOrg", "drydockFamily", "drydockTag", "defaultTaskImage", "reqProcImage", "isDefault", "createdAt", "updatedAt")
        values (8000, 9001, 'v6.5.4', 'drydock', 'u16', 'v6.5.4', 'u16all', 'u16reqproc', false, '2018-03-28 00:00:00+00', '2018-03-28 00:00:00+00');
      end if;

      -- aarch64 Ubuntu_16.04
      if not exists (select 1 from "runtimeTemplates" where "archTypeCode" = 8001 and "osTypeCode" = 9001 and "version" = 'v6.5.4') then
        insert into "runtimeTemplates" ("archTypeCode", "osTypeCode", "version", "drydockOrg", "drydockFamily", "drydockTag", "defaultTaskImage", "reqProcImage", "isDefault", "isAvailable", "createdAt", "updatedAt")
        values (8001, 9001, 'v6.5.4', 'drydock', 'aarch64_u16', 'v6.5.4', 'aarch64_u16all', 'aarch64_u16reqproc', false, true, '2018-03-28 00:00:00+00', '2018-03-28 00:00:00+00');
      end if;

      -- x86_64 WindowsServer_2016
      if not exists (select 1 from "runtimeTemplates" where "archTypeCode" = 8000 and "osTypeCode" = 9002 and "version" = 'v6.5.4') then
        insert into "runtimeTemplates" ("archTypeCode", "osTypeCode", "version", "drydockOrg", "drydockFamily", "drydockTag", "defaultTaskImage", "reqProcImage", "isDefault", "isAvailable", "createdAt", "updatedAt")
        values (8000, 9002, 'v6.5.4', 'drydock', 'w16', 'v6.5.4', 'w16', 'w16reqproc', false, true, '2018-03-28 00:00:00+00', '2018-03-28 00:00:00+00');
      end if;

      -- x86_64 macOS_10.12
      if not exists (select 1 from "runtimeTemplates" where "archTypeCode" = 8000 and "osTypeCode" = 9003 and "version" = 'v6.5.4') then
        insert into "runtimeTemplates" ("archTypeCode", "osTypeCode", "version", "drydockOrg", "drydockFamily", "drydockTag", "defaultTaskImage", "reqProcImage", "isDefault", "isAvailable", "createdAt", "updatedAt")
        values (8000, 9003, 'v6.5.4', 'drydock', 'u16', 'v6.5.4', 'u16all', 'm10reqproc', false, true, '2018-03-28 00:00:00+00', '2018-03-28 00:00:00+00');
      end if;

      -- x86_64 CentOS_7
      if not exists (select 1 from "runtimeTemplates" where "archTypeCode" = 8000 and "osTypeCode" = 9004 and "version" = 'v6.5.4') then
        insert into "runtimeTemplates" ("archTypeCode", "osTypeCode", "version", "drydockOrg", "drydockFamily", "drydockTag", "defaultTaskImage", "reqProcImage", "isDefault", "isAvailable", "createdAt", "updatedAt")
        values (8000, 9004, 'v6.5.4', 'drydock', 'c7', 'v6.5.4', 'c7all', 'u16reqproc', false, true, '2018-03-28 00:00:00+00', '2018-03-28 00:00:00+00');
      end if;

      -- x86_64 RHEL_7
      if not exists (select 1 from "runtimeTemplates" where "archTypeCode" = 8000 and "osTypeCode" = 9005 and "version" = 'v6.5.4') then
        insert into "runtimeTemplates" ("archTypeCode", "osTypeCode", "version", "drydockOrg", "drydockFamily", "drydockTag", "defaultTaskImage", "reqProcImage", "isDefault", "isAvailable", "createdAt", "updatedAt")
        values (8000, 9005, 'v6.5.4', 'drydock', 'c7', 'v6.5.4', 'c7all', 'u16reqproc', false, true, '2018-03-28 00:00:00+00', '2018-03-28 00:00:00+00');
      end if;

      --------------------------------------------------------
      -------------- v6.6.4 Templates ------------------------
      --------------------------------------------------------

      -- x86_64 Ubuntu_14.04
      if not exists (select 1 from "runtimeTemplates" where "archTypeCode" = 8000 and "osTypeCode" = 9000 and "version" = 'v6.6.4') then
        insert into "runtimeTemplates" ("archTypeCode", "osTypeCode", "version", "drydockOrg", "drydockFamily", "drydockTag", "defaultTaskImage", "reqProcImage", "isDefault", "createdAt", "updatedAt")
        values (8000, 9000, 'v6.6.4', 'drydock', 'u16', 'v6.6.4', 'u14all', 'u14reqproc', false, '2018-03-28 00:00:00+00', '2018-03-28 00:00:00+00');
      end if;

      -- x86_64 Ubuntu_16.04
      if not exists (select 1 from "runtimeTemplates" where "archTypeCode" = 8000 and "osTypeCode" = 9001 and "version" = 'v6.6.4') then
        insert into "runtimeTemplates" ("archTypeCode", "osTypeCode", "version", "drydockOrg", "drydockFamily", "drydockTag", "defaultTaskImage", "reqProcImage", "isDefault", "createdAt", "updatedAt")
        values (8000, 9001, 'v6.6.4', 'drydock', 'u16', 'v6.6.4', 'u16all', 'u16reqproc', false, '2018-03-28 00:00:00+00', '2018-03-28 00:00:00+00');
      end if;

      -- aarch64 Ubuntu_16.04
      if not exists (select 1 from "runtimeTemplates" where "archTypeCode" = 8001 and "osTypeCode" = 9001 and "version" = 'v6.6.4') then
        insert into "runtimeTemplates" ("archTypeCode", "osTypeCode", "version", "drydockOrg", "drydockFamily", "drydockTag", "defaultTaskImage", "reqProcImage", "isDefault", "isAvailable", "createdAt", "updatedAt")
        values (8001, 9001, 'v6.6.4', 'drydock', 'aarch64_u16', 'v6.6.4', 'aarch64_u16all', 'aarch64_u16reqproc', false, true, '2018-03-28 00:00:00+00', '2018-03-28 00:00:00+00');
      end if;

      -- x86_64 WindowsServer_2016
      if not exists (select 1 from "runtimeTemplates" where "archTypeCode" = 8000 and "osTypeCode" = 9002 and "version" = 'v6.6.4') then
        insert into "runtimeTemplates" ("archTypeCode", "osTypeCode", "version", "drydockOrg", "drydockFamily", "drydockTag", "defaultTaskImage", "reqProcImage", "isDefault", "isAvailable", "createdAt", "updatedAt")
        values (8000, 9002, 'v6.6.4', 'drydock', 'w16', 'v6.6.4', 'w16', 'w16reqproc', false, true, '2018-03-28 00:00:00+00', '2018-03-28 00:00:00+00');
      end if;

      -- x86_64 macOS_10.12
      if not exists (select 1 from "runtimeTemplates" where "archTypeCode" = 8000 and "osTypeCode" = 9003 and "version" = 'v6.6.4') then
        insert into "runtimeTemplates" ("archTypeCode", "osTypeCode", "version", "drydockOrg", "drydockFamily", "drydockTag", "defaultTaskImage", "reqProcImage", "isDefault", "isAvailable", "createdAt", "updatedAt")
        values (8000, 9003, 'v6.6.4', 'drydock', 'u16', 'v6.6.4', 'u16all', 'm10reqproc', false, true, '2018-03-28 00:00:00+00', '2018-03-28 00:00:00+00');
      end if;

      -- x86_64 CentOS_7
      if not exists (select 1 from "runtimeTemplates" where "archTypeCode" = 8000 and "osTypeCode" = 9004 and "version" = 'v6.6.4') then
        insert into "runtimeTemplates" ("archTypeCode", "osTypeCode", "version", "drydockOrg", "drydockFamily", "drydockTag", "defaultTaskImage", "reqProcImage", "isDefault", "isAvailable", "createdAt", "updatedAt")
        values (8000, 9004, 'v6.6.4', 'drydock', 'c7', 'v6.6.4', 'c7all', 'u16reqproc', false, true, '2018-03-28 00:00:00+00', '2018-03-28 00:00:00+00');
      end if;

      -- x86_64 RHEL_7
      if not exists (select 1 from "runtimeTemplates" where "archTypeCode" = 8000 and "osTypeCode" = 9005 and "version" = 'v6.6.4') then
        insert into "runtimeTemplates" ("archTypeCode", "osTypeCode", "version", "drydockOrg", "drydockFamily", "drydockTag", "defaultTaskImage", "reqProcImage", "isDefault", "isAvailable", "createdAt", "updatedAt")
        values (8000, 9005, 'v6.6.4', 'drydock', 'c7', 'v6.6.4', 'c7all', 'u16reqproc', false, true, '2018-03-28 00:00:00+00', '2018-03-28 00:00:00+00');
      end if;

      -- aarch32 Ubuntu_16.04
      if not exists (select 1 from "runtimeTemplates" where "archTypeCode" = 8002 and "osTypeCode" = 9001 and "version" = 'v6.6.4') then
        insert into "runtimeTemplates" ("archTypeCode", "osTypeCode", "version", "drydockOrg", "drydockFamily", "drydockTag", "defaultTaskImage", "reqProcImage", "isDefault", "isAvailable", "createdAt", "updatedAt")
        values (8002, 9001, 'v6.6.4', 'drydock', 'aarch32_u16', 'v6.6.4', 'aarch32_u16', 'aarch32_u16reqproc', false, true, '2018-03-28 00:00:00+00', '2018-03-28 00:00:00+00');
      end if;

      --------------------------------------------------------
      -------------- v6.7.4 Templates ------------------------
      --------------------------------------------------------

      -- x86_64 Ubuntu_14.04
      if not exists (select 1 from "runtimeTemplates" where "archTypeCode" = 8000 and "osTypeCode" = 9000 and "version" = 'v6.7.4') then
        insert into "runtimeTemplates" ("archTypeCode", "osTypeCode", "version", "drydockOrg", "drydockFamily", "drydockTag", "defaultTaskImage", "reqProcImage", "isDefault", "createdAt", "updatedAt")
        values (8000, 9000, 'v6.7.4', 'drydock', 'u16', 'v6.7.4', 'u14all', 'u14reqproc', false, '2018-03-28 00:00:00+00', '2018-03-28 00:00:00+00');
      end if;

      -- x86_64 Ubuntu_16.04
      if not exists (select 1 from "runtimeTemplates" where "archTypeCode" = 8000 and "osTypeCode" = 9001 and "version" = 'v6.7.4') then
        insert into "runtimeTemplates" ("archTypeCode", "osTypeCode", "version", "drydockOrg", "drydockFamily", "drydockTag", "defaultTaskImage", "reqProcImage", "isDefault", "createdAt", "updatedAt")
        values (8000, 9001, 'v6.7.4', 'drydock', 'u16', 'v6.7.4', 'u16all', 'u16reqproc', false, '2018-03-28 00:00:00+00', '2018-03-28 00:00:00+00');
      end if;

      -- aarch64 Ubuntu_16.04
      if not exists (select 1 from "runtimeTemplates" where "archTypeCode" = 8001 and "osTypeCode" = 9001 and "version" = 'v6.7.4') then
        insert into "runtimeTemplates" ("archTypeCode", "osTypeCode", "version", "drydockOrg", "drydockFamily", "drydockTag", "defaultTaskImage", "reqProcImage", "isDefault", "isAvailable", "createdAt", "updatedAt")
        values (8001, 9001, 'v6.7.4', 'drydock', 'aarch64_u16', 'v6.7.4', 'aarch64_u16all', 'aarch64_u16reqproc', false, true, '2018-03-28 00:00:00+00', '2018-03-28 00:00:00+00');
      end if;

      -- x86_64 WindowsServer_2016
      if not exists (select 1 from "runtimeTemplates" where "archTypeCode" = 8000 and "osTypeCode" = 9002 and "version" = 'v6.7.4') then
        insert into "runtimeTemplates" ("archTypeCode", "osTypeCode", "version", "drydockOrg", "drydockFamily", "drydockTag", "defaultTaskImage", "reqProcImage", "isDefault", "isAvailable", "createdAt", "updatedAt")
        values (8000, 9002, 'v6.7.4', 'drydock', 'w16', 'v6.7.4', 'w16', 'w16reqproc', false, true, '2018-03-28 00:00:00+00', '2018-03-28 00:00:00+00');
      end if;

      -- x86_64 macOS_10.12
      if not exists (select 1 from "runtimeTemplates" where "archTypeCode" = 8000 and "osTypeCode" = 9003 and "version" = 'v6.7.4') then
        insert into "runtimeTemplates" ("archTypeCode", "osTypeCode", "version", "drydockOrg", "drydockFamily", "drydockTag", "defaultTaskImage", "reqProcImage", "isDefault", "isAvailable", "createdAt", "updatedAt")
        values (8000, 9003, 'v6.7.4', 'drydock', 'u16', 'v6.7.4', 'u16all', 'm10reqproc', false, true, '2018-03-28 00:00:00+00', '2018-03-28 00:00:00+00');
      end if;

      -- x86_64 CentOS_7
      if not exists (select 1 from "runtimeTemplates" where "archTypeCode" = 8000 and "osTypeCode" = 9004 and "version" = 'v6.7.4') then
        insert into "runtimeTemplates" ("archTypeCode", "osTypeCode", "version", "drydockOrg", "drydockFamily", "drydockTag", "defaultTaskImage", "reqProcImage", "isDefault", "isAvailable", "createdAt", "updatedAt")
        values (8000, 9004, 'v6.7.4', 'drydock', 'c7', 'v6.7.4', 'c7all', 'u16reqproc', false, true, '2018-03-28 00:00:00+00', '2018-03-28 00:00:00+00');
      end if;

      -- x86_64 RHEL_7
      if not exists (select 1 from "runtimeTemplates" where "archTypeCode" = 8000 and "osTypeCode" = 9005 and "version" = 'v6.7.4') then
        insert into "runtimeTemplates" ("archTypeCode", "osTypeCode", "version", "drydockOrg", "drydockFamily", "drydockTag", "defaultTaskImage", "reqProcImage", "isDefault", "isAvailable", "createdAt", "updatedAt")
        values (8000, 9005, 'v6.7.4', 'drydock', 'c7', 'v6.7.4', 'c7all', 'u16reqproc', false, true, '2018-03-28 00:00:00+00', '2018-03-28 00:00:00+00');
      end if;

      -- aarch32 Ubuntu_16.04
      if not exists (select 1 from "runtimeTemplates" where "archTypeCode" = 8002 and "osTypeCode" = 9001 and "version" = 'v6.7.4') then
        insert into "runtimeTemplates" ("archTypeCode", "osTypeCode", "version", "drydockOrg", "drydockFamily", "drydockTag", "defaultTaskImage", "reqProcImage", "isDefault", "isAvailable", "createdAt", "updatedAt")
        values (8002, 9001, 'v6.7.4', 'drydock', 'aarch32_u16', 'v6.7.4', 'aarch32_u16', 'aarch32_u16reqproc', false, true, '2018-03-28 00:00:00+00', '2018-03-28 00:00:00+00');
      end if;

      --------------------------------------------------------
      -------------- v6.8.4 Templates ------------------------
      --------------------------------------------------------

      -- x86_64 Ubuntu_14.04
      if not exists (select 1 from "runtimeTemplates" where "archTypeCode" = 8000 and "osTypeCode" = 9000 and "version" = 'v6.8.4') then
        insert into "runtimeTemplates" ("archTypeCode", "osTypeCode", "version", "drydockOrg", "drydockFamily", "drydockTag", "defaultTaskImage", "reqProcImage", "isDefault", "createdAt", "updatedAt")
        values (8000, 9000, 'v6.8.4', 'drydock', 'u16', 'v6.8.4', 'u14all', 'u14reqproc', false, '2018-03-28 00:00:00+00', '2018-03-28 00:00:00+00');
      end if;

      -- x86_64 Ubuntu_16.04
      if not exists (select 1 from "runtimeTemplates" where "archTypeCode" = 8000 and "osTypeCode" = 9001 and "version" = 'v6.8.4') then
        insert into "runtimeTemplates" ("archTypeCode", "osTypeCode", "version", "drydockOrg", "drydockFamily", "drydockTag", "defaultTaskImage", "reqProcImage", "isDefault", "createdAt", "updatedAt")
        values (8000, 9001, 'v6.8.4', 'drydock', 'u16', 'v6.8.4', 'u16all', 'u16reqproc', false, '2018-03-28 00:00:00+00', '2018-03-28 00:00:00+00');
      end if;

      -- aarch64 Ubuntu_16.04
      if not exists (select 1 from "runtimeTemplates" where "archTypeCode" = 8001 and "osTypeCode" = 9001 and "version" = 'v6.8.4') then
        insert into "runtimeTemplates" ("archTypeCode", "osTypeCode", "version", "drydockOrg", "drydockFamily", "drydockTag", "defaultTaskImage", "reqProcImage", "isDefault", "isAvailable", "createdAt", "updatedAt")
        values (8001, 9001, 'v6.8.4', 'drydock', 'aarch64_u16', 'v6.8.4', 'aarch64_u16all', 'aarch64_u16reqproc', false, true, '2018-03-28 00:00:00+00', '2018-03-28 00:00:00+00');
      end if;

      -- x86_64 WindowsServer_2016
      if not exists (select 1 from "runtimeTemplates" where "archTypeCode" = 8000 and "osTypeCode" = 9002 and "version" = 'v6.8.4') then
        insert into "runtimeTemplates" ("archTypeCode", "osTypeCode", "version", "drydockOrg", "drydockFamily", "drydockTag", "defaultTaskImage", "reqProcImage", "isDefault", "isAvailable", "createdAt", "updatedAt")
        values (8000, 9002, 'v6.8.4', 'drydock', 'w16', 'v6.8.4', 'w16', 'w16reqproc', false, true, '2018-03-28 00:00:00+00', '2018-03-28 00:00:00+00');
      end if;

      -- x86_64 macOS_10.12
      if not exists (select 1 from "runtimeTemplates" where "archTypeCode" = 8000 and "osTypeCode" = 9003 and "version" = 'v6.8.4') then
        insert into "runtimeTemplates" ("archTypeCode", "osTypeCode", "version", "drydockOrg", "drydockFamily", "drydockTag", "defaultTaskImage", "reqProcImage", "isDefault", "isAvailable", "createdAt", "updatedAt")
        values (8000, 9003, 'v6.8.4', 'drydock', 'u16', 'v6.8.4', 'u16all', 'm10reqproc', false, true, '2018-03-28 00:00:00+00', '2018-03-28 00:00:00+00');
      end if;

      -- x86_64 CentOS_7
      if not exists (select 1 from "runtimeTemplates" where "archTypeCode" = 8000 and "osTypeCode" = 9004 and "version" = 'v6.8.4') then
        insert into "runtimeTemplates" ("archTypeCode", "osTypeCode", "version", "drydockOrg", "drydockFamily", "drydockTag", "defaultTaskImage", "reqProcImage", "isDefault", "isAvailable", "createdAt", "updatedAt")
        values (8000, 9004, 'v6.8.4', 'drydock', 'c7', 'v6.8.4', 'c7all', 'u16reqproc', false, true, '2018-03-28 00:00:00+00', '2018-03-28 00:00:00+00');
      end if;

      -- x86_64 RHEL_7
      if not exists (select 1 from "runtimeTemplates" where "archTypeCode" = 8000 and "osTypeCode" = 9005 and "version" = 'v6.8.4') then
        insert into "runtimeTemplates" ("archTypeCode", "osTypeCode", "version", "drydockOrg", "drydockFamily", "drydockTag", "defaultTaskImage", "reqProcImage", "isDefault", "isAvailable", "createdAt", "updatedAt")
        values (8000, 9005, 'v6.8.4', 'drydock', 'c7', 'v6.8.4', 'c7all', 'u16reqproc', false, true, '2018-03-28 00:00:00+00', '2018-03-28 00:00:00+00');
      end if;

      -- aarch32 Ubuntu_16.04
      if not exists (select 1 from "runtimeTemplates" where "archTypeCode" = 8002 and "osTypeCode" = 9001 and "version" = 'v6.8.4') then
        insert into "runtimeTemplates" ("archTypeCode", "osTypeCode", "version", "drydockOrg", "drydockFamily", "drydockTag", "defaultTaskImage", "reqProcImage", "isDefault", "isAvailable", "createdAt", "updatedAt")
        values (8002, 9001, 'v6.8.4', 'drydock', 'aarch32_u16', 'v6.8.4', 'aarch32_u16', 'aarch32_u16reqproc', false, true, '2018-03-28 00:00:00+00', '2018-03-28 00:00:00+00');
      end if;

      --------------------------------------------------------
      -------------- v6.9.4 Templates ------------------------
      --------------------------------------------------------

      -- x86_64 Ubuntu_14.04
      if not exists (select 1 from "runtimeTemplates" where "archTypeCode" = 8000 and "osTypeCode" = 9000 and "version" = 'v6.9.4') then
        insert into "runtimeTemplates" ("archTypeCode", "osTypeCode", "version", "drydockOrg", "drydockFamily", "drydockTag", "defaultTaskImage", "reqProcImage", "isDefault", "createdAt", "updatedAt")
        values (8000, 9000, 'v6.9.4', 'drydock', 'u16', 'v6.9.4', 'u14all', 'u14reqproc', false, '2018-03-28 00:00:00+00', '2018-03-28 00:00:00+00');
      end if;

      -- x86_64 Ubuntu_16.04
      if not exists (select 1 from "runtimeTemplates" where "archTypeCode" = 8000 and "osTypeCode" = 9001 and "version" = 'v6.9.4') then
        insert into "runtimeTemplates" ("archTypeCode", "osTypeCode", "version", "drydockOrg", "drydockFamily", "drydockTag", "defaultTaskImage", "reqProcImage", "isDefault", "createdAt", "updatedAt")
        values (8000, 9001, 'v6.9.4', 'drydock', 'u16', 'v6.9.4', 'u16all', 'u16reqproc', false, '2018-03-28 00:00:00+00', '2018-03-28 00:00:00+00');
      end if;

      -- aarch64 Ubuntu_16.04
      if not exists (select 1 from "runtimeTemplates" where "archTypeCode" = 8001 and "osTypeCode" = 9001 and "version" = 'v6.9.4') then
        insert into "runtimeTemplates" ("archTypeCode", "osTypeCode", "version", "drydockOrg", "drydockFamily", "drydockTag", "defaultTaskImage", "reqProcImage", "isDefault", "isAvailable", "createdAt", "updatedAt")
        values (8001, 9001, 'v6.9.4', 'drydock', 'aarch64_u16', 'v6.9.4', 'aarch64_u16all', 'aarch64_u16reqproc', false, true, '2018-03-28 00:00:00+00', '2018-03-28 00:00:00+00');
      end if;

      -- x86_64 WindowsServer_2016
      if not exists (select 1 from "runtimeTemplates" where "archTypeCode" = 8000 and "osTypeCode" = 9002 and "version" = 'v6.9.4') then
        insert into "runtimeTemplates" ("archTypeCode", "osTypeCode", "version", "drydockOrg", "drydockFamily", "drydockTag", "defaultTaskImage", "reqProcImage", "isDefault", "isAvailable", "createdAt", "updatedAt")
        values (8000, 9002, 'v6.9.4', 'drydock', 'w16', 'v6.9.4', 'w16', 'w16reqproc', false, true, '2018-03-28 00:00:00+00', '2018-03-28 00:00:00+00');
      end if;

      -- x86_64 macOS_10.12
      if not exists (select 1 from "runtimeTemplates" where "archTypeCode" = 8000 and "osTypeCode" = 9003 and "version" = 'v6.9.4') then
        insert into "runtimeTemplates" ("archTypeCode", "osTypeCode", "version", "drydockOrg", "drydockFamily", "drydockTag", "defaultTaskImage", "reqProcImage", "isDefault", "isAvailable", "createdAt", "updatedAt")
        values (8000, 9003, 'v6.9.4', 'drydock', 'u16', 'v6.9.4', 'u16all', 'm10reqproc', false, true, '2018-03-28 00:00:00+00', '2018-03-28 00:00:00+00');
      end if;

      -- x86_64 CentOS_7
      if not exists (select 1 from "runtimeTemplates" where "archTypeCode" = 8000 and "osTypeCode" = 9004 and "version" = 'v6.9.4') then
        insert into "runtimeTemplates" ("archTypeCode", "osTypeCode", "version", "drydockOrg", "drydockFamily", "drydockTag", "defaultTaskImage", "reqProcImage", "isDefault", "isAvailable", "createdAt", "updatedAt")
        values (8000, 9004, 'v6.9.4', 'drydock', 'c7', 'v6.9.4', 'c7all', 'u16reqproc', false, true, '2018-03-28 00:00:00+00', '2018-03-28 00:00:00+00');
      end if;

      -- x86_64 RHEL_7
      if not exists (select 1 from "runtimeTemplates" where "archTypeCode" = 8000 and "osTypeCode" = 9005 and "version" = 'v6.9.4') then
        insert into "runtimeTemplates" ("archTypeCode", "osTypeCode", "version", "drydockOrg", "drydockFamily", "drydockTag", "defaultTaskImage", "reqProcImage", "isDefault", "isAvailable", "createdAt", "updatedAt")
        values (8000, 9005, 'v6.9.4', 'drydock', 'c7', 'v6.9.4', 'c7all', 'u16reqproc', false, true, '2018-03-28 00:00:00+00', '2018-03-28 00:00:00+00');
      end if;

      -- aarch32 Ubuntu_16.04
      if not exists (select 1 from "runtimeTemplates" where "archTypeCode" = 8002 and "osTypeCode" = 9001 and "version" = 'v6.9.4') then
        insert into "runtimeTemplates" ("archTypeCode", "osTypeCode", "version", "drydockOrg", "drydockFamily", "drydockTag", "defaultTaskImage", "reqProcImage", "isDefault", "isAvailable", "createdAt", "updatedAt")
        values (8002, 9001, 'v6.9.4', 'drydock', 'aarch32_u16', 'v6.9.4', 'aarch32_u16', 'aarch32_u16reqproc', false, true, '2018-03-28 00:00:00+00', '2018-03-28 00:00:00+00');
      end if;

      --------------------------------------------------------
      -------------- v6.10.4 Templates ------------------------
      --------------------------------------------------------

      -- x86_64 Ubuntu_14.04
      if not exists (select 1 from "runtimeTemplates" where "archTypeCode" = 8000 and "osTypeCode" = 9000 and "version" = 'v6.10.4') then
        insert into "runtimeTemplates" ("archTypeCode", "osTypeCode", "version", "drydockOrg", "drydockFamily", "drydockTag", "defaultTaskImage", "reqProcImage", "isDefault", "createdAt", "updatedAt")
        values (8000, 9000, 'v6.10.4', 'drydock', 'u16', 'v6.10.4', 'u14all', 'u14reqproc', false, '2018-03-28 00:00:00+00', '2018-03-28 00:00:00+00');
      end if;

      -- x86_64 Ubuntu_16.04
      if not exists (select 1 from "runtimeTemplates" where "archTypeCode" = 8000 and "osTypeCode" = 9001 and "version" = 'v6.10.4') then
        insert into "runtimeTemplates" ("archTypeCode", "osTypeCode", "version", "drydockOrg", "drydockFamily", "drydockTag", "defaultTaskImage", "reqProcImage", "isDefault", "createdAt", "updatedAt")
        values (8000, 9001, 'v6.10.4', 'drydock', 'u16', 'v6.10.4', 'u16all', 'u16reqproc', false, '2018-03-28 00:00:00+00', '2018-03-28 00:00:00+00');
      end if;

      -- aarch64 Ubuntu_16.04
      if not exists (select 1 from "runtimeTemplates" where "archTypeCode" = 8001 and "osTypeCode" = 9001 and "version" = 'v6.10.4') then
        insert into "runtimeTemplates" ("archTypeCode", "osTypeCode", "version", "drydockOrg", "drydockFamily", "drydockTag", "defaultTaskImage", "reqProcImage", "isDefault", "isAvailable", "createdAt", "updatedAt")
        values (8001, 9001, 'v6.10.4', 'drydock', 'aarch64_u16', 'v6.10.4', 'aarch64_u16all', 'aarch64_u16reqproc', false, true, '2018-03-28 00:00:00+00', '2018-03-28 00:00:00+00');
      end if;

      -- x86_64 WindowsServer_2016
      if not exists (select 1 from "runtimeTemplates" where "archTypeCode" = 8000 and "osTypeCode" = 9002 and "version" = 'v6.10.4') then
        insert into "runtimeTemplates" ("archTypeCode", "osTypeCode", "version", "drydockOrg", "drydockFamily", "drydockTag", "defaultTaskImage", "reqProcImage", "isDefault", "isAvailable", "createdAt", "updatedAt")
        values (8000, 9002, 'v6.10.4', 'drydock', 'w16', 'v6.10.4', 'w16', 'w16reqproc', false, true, '2018-03-28 00:00:00+00', '2018-03-28 00:00:00+00');
      end if;

      -- x86_64 macOS_10.12
      if not exists (select 1 from "runtimeTemplates" where "archTypeCode" = 8000 and "osTypeCode" = 9003 and "version" = 'v6.10.4') then
        insert into "runtimeTemplates" ("archTypeCode", "osTypeCode", "version", "drydockOrg", "drydockFamily", "drydockTag", "defaultTaskImage", "reqProcImage", "isDefault", "isAvailable", "createdAt", "updatedAt")
        values (8000, 9003, 'v6.10.4', 'drydock', 'u16', 'v6.10.4', 'u16all', 'm10reqproc', false, true, '2018-03-28 00:00:00+00', '2018-03-28 00:00:00+00');
      end if;

      -- x86_64 CentOS_7
      if not exists (select 1 from "runtimeTemplates" where "archTypeCode" = 8000 and "osTypeCode" = 9004 and "version" = 'v6.10.4') then
        insert into "runtimeTemplates" ("archTypeCode", "osTypeCode", "version", "drydockOrg", "drydockFamily", "drydockTag", "defaultTaskImage", "reqProcImage", "isDefault", "isAvailable", "createdAt", "updatedAt")
        values (8000, 9004, 'v6.10.4', 'drydock', 'c7', 'v6.10.4', 'c7all', 'u16reqproc', false, true, '2018-03-28 00:00:00+00', '2018-03-28 00:00:00+00');
      end if;

      -- x86_64 RHEL_7
      if not exists (select 1 from "runtimeTemplates" where "archTypeCode" = 8000 and "osTypeCode" = 9005 and "version" = 'v6.10.4') then
        insert into "runtimeTemplates" ("archTypeCode", "osTypeCode", "version", "drydockOrg", "drydockFamily", "drydockTag", "defaultTaskImage", "reqProcImage", "isDefault", "isAvailable", "createdAt", "updatedAt")
        values (8000, 9005, 'v6.10.4', 'drydock', 'c7', 'v6.10.4', 'c7all', 'u16reqproc', false, true, '2018-03-28 00:00:00+00', '2018-03-28 00:00:00+00');
      end if;

      -- aarch32 Ubuntu_16.04
      if not exists (select 1 from "runtimeTemplates" where "archTypeCode" = 8002 and "osTypeCode" = 9001 and "version" = 'v6.10.4') then
        insert into "runtimeTemplates" ("archTypeCode", "osTypeCode", "version", "drydockOrg", "drydockFamily", "drydockTag", "defaultTaskImage", "reqProcImage", "isDefault", "isAvailable", "createdAt", "updatedAt")
        values (8002, 9001, 'v6.10.4', 'drydock', 'aarch32_u16', 'v6.10.4', 'aarch32_u16', 'aarch32_u16reqproc', false, true, '2018-03-28 00:00:00+00', '2018-03-28 00:00:00+00');
      end if;


      --------------------------------------------------------
      -------------- v6.12.4 Templates ------------------------
      --------------------------------------------------------

      -- x86_64 Ubuntu_14.04
      if not exists (select 1 from "runtimeTemplates" where "archTypeCode" = 8000 and "osTypeCode" = 9000 and "version" = 'v6.12.4') then
        insert into "runtimeTemplates" ("archTypeCode", "osTypeCode", "version", "drydockOrg", "drydockFamily", "drydockTag", "defaultTaskImage", "reqProcImage", "isDefault", "createdAt", "updatedAt")
        values (8000, 9000, 'v6.12.4', 'drydock', 'u16', 'v6.12.4', 'u14all', 'u14reqproc', false, '2018-03-28 00:00:00+00', '2018-03-28 00:00:00+00');
      end if;

      -- x86_64 Ubuntu_16.04
      if not exists (select 1 from "runtimeTemplates" where "archTypeCode" = 8000 and "osTypeCode" = 9001 and "version" = 'v6.12.4') then
        insert into "runtimeTemplates" ("archTypeCode", "osTypeCode", "version", "drydockOrg", "drydockFamily", "drydockTag", "defaultTaskImage", "reqProcImage", "isDefault", "createdAt", "updatedAt")
        values (8000, 9001, 'v6.12.4', 'drydock', 'u16', 'v6.12.4', 'u16all', 'u16reqproc', false, '2018-03-28 00:00:00+00', '2018-03-28 00:00:00+00');
      end if;

      -- aarch64 Ubuntu_16.04
      if not exists (select 1 from "runtimeTemplates" where "archTypeCode" = 8001 and "osTypeCode" = 9001 and "version" = 'v6.12.4') then
        insert into "runtimeTemplates" ("archTypeCode", "osTypeCode", "version", "drydockOrg", "drydockFamily", "drydockTag", "defaultTaskImage", "reqProcImage", "isDefault", "isAvailable", "createdAt", "updatedAt")
        values (8001, 9001, 'v6.12.4', 'drydock', 'aarch64_u16', 'v6.12.4', 'aarch64_u16all', 'aarch64_u16reqproc', false, true, '2018-03-28 00:00:00+00', '2018-03-28 00:00:00+00');
      end if;

      -- x86_64 WindowsServer_2016
      if not exists (select 1 from "runtimeTemplates" where "archTypeCode" = 8000 and "osTypeCode" = 9002 and "version" = 'v6.12.4') then
        insert into "runtimeTemplates" ("archTypeCode", "osTypeCode", "version", "drydockOrg", "drydockFamily", "drydockTag", "defaultTaskImage", "reqProcImage", "isDefault", "isAvailable", "createdAt", "updatedAt")
        values (8000, 9002, 'v6.12.4', 'drydock', 'w16', 'v6.12.4', 'w16', 'w16reqproc', false, true, '2018-03-28 00:00:00+00', '2018-03-28 00:00:00+00');
      end if;

      -- x86_64 macOS_10.12
      if not exists (select 1 from "runtimeTemplates" where "archTypeCode" = 8000 and "osTypeCode" = 9003 and "version" = 'v6.12.4') then
        insert into "runtimeTemplates" ("archTypeCode", "osTypeCode", "version", "drydockOrg", "drydockFamily", "drydockTag", "defaultTaskImage", "reqProcImage", "isDefault", "isAvailable", "createdAt", "updatedAt")
        values (8000, 9003, 'v6.12.4', 'drydock', 'u16', 'v6.12.4', 'u16all', 'm10reqproc', false, true, '2018-03-28 00:00:00+00', '2018-03-28 00:00:00+00');
      end if;

      -- x86_64 CentOS_7
      if not exists (select 1 from "runtimeTemplates" where "archTypeCode" = 8000 and "osTypeCode" = 9004 and "version" = 'v6.12.4') then
        insert into "runtimeTemplates" ("archTypeCode", "osTypeCode", "version", "drydockOrg", "drydockFamily", "drydockTag", "defaultTaskImage", "reqProcImage", "isDefault", "isAvailable", "createdAt", "updatedAt")
        values (8000, 9004, 'v6.12.4', 'drydock', 'c7', 'v6.12.4', 'c7all', 'u16reqproc', false, true, '2018-03-28 00:00:00+00', '2018-03-28 00:00:00+00');
      end if;

      -- x86_64 RHEL_7
      if not exists (select 1 from "runtimeTemplates" where "archTypeCode" = 8000 and "osTypeCode" = 9005 and "version" = 'v6.12.4') then
        insert into "runtimeTemplates" ("archTypeCode", "osTypeCode", "version", "drydockOrg", "drydockFamily", "drydockTag", "defaultTaskImage", "reqProcImage", "isDefault", "isAvailable", "createdAt", "updatedAt")
        values (8000, 9005, 'v6.12.4', 'drydock', 'c7', 'v6.12.4', 'c7all', 'u16reqproc', false, true, '2018-03-28 00:00:00+00', '2018-03-28 00:00:00+00');
      end if;

      -- aarch32 Ubuntu_16.04
      if not exists (select 1 from "runtimeTemplates" where "archTypeCode" = 8002 and "osTypeCode" = 9001 and "version" = 'v6.12.4') then
        insert into "runtimeTemplates" ("archTypeCode", "osTypeCode", "version", "drydockOrg", "drydockFamily", "drydockTag", "defaultTaskImage", "reqProcImage", "isDefault", "isAvailable", "createdAt", "updatedAt")
        values (8002, 9001, 'v6.12.4', 'drydock', 'aarch32_u16', 'v6.12.4', 'aarch32_u16', 'aarch32_u16reqproc', false, true, '2018-03-28 00:00:00+00', '2018-03-28 00:00:00+00');
      end if;


      -- insert additional runtimeTemplates down here

      --------------------------------------------------------
      -------------- Update isDefault Templates --------------
      --------------------------------------------------------
      update "runtimeTemplates" set "isDefault" = false where "version" != 'v6.12.4' and "isDefault" = true;
      update "runtimeTemplates" set "isDefault" = true where "version" = 'v6.12.4' and "isDefault" = false;

      -- Marking deprecated runtimeTemplates as unavailable

      if exists (select 1 from "runtimeTemplates" where "version" = 'Stable' and "isAvailable" = true) then
        update "runtimeTemplates" set "isAvailable" = false where "version" = 'Stable' and "isAvailable" = true;
      end if;

      if exists (select 1 from "runtimeTemplates" where "version" = 'Unstable' and "isAvailable" = true) then
        update "runtimeTemplates" set "isAvailable" = false where "version" = 'Unstable' and "isAvailable" = true;
      end if;

    -- end runtimeTemplates
    end if;

    -- Add addedJobResourceCount column to dailyAggs
    if not exists (select 1 from information_schema.columns where table_name = 'dailyAggs' and column_name = 'addedJobResourceCount') then
      alter table "dailyAggs" add column "addedJobResourceCount" INTEGER;
    end if;

    -- Add timeoutMs column to builds
    if not exists (select 1 from information_schema.columns where table_name = 'builds' and column_name = 'timeoutMS') then
      alter table "builds" add column "timeoutMS" integer;
    end if;

    -- Add avgQueueLength column to dailyAggs
    if not exists (select 1 from information_schema.columns where table_name = 'dailyAggs' and column_name = 'avgQueueLength') then
      alter table "dailyAggs" add column "avgQueueLength" FLOAT;
    end if;

    -- Set default value 0 for dailyAggs.avgQueueLength
    if exists (select 1 from information_schema.columns where table_name = 'dailyAggs' and column_name = 'avgQueueLength' and column_default IS NULL) then
      alter table "dailyAggs" alter column "avgQueueLength" SET DEFAULT 0;
      update "dailyAggs" set "avgQueueLength"=0 WHERE "avgQueueLength" IS NULL;
    end if;

    -- Set default value 0 for dailyAggs.addedJobResourceCount
    if exists (select 1 from information_schema.columns where table_name = 'dailyAggs' and column_name = 'addedJobResourceCount' and column_default IS NULL) then
      alter table "dailyAggs" alter column "addedJobResourceCount" SET DEFAULT 0;
      update "dailyAggs" set "addedJobResourceCount"=0 WHERE "addedJobResourceCount" IS NULL;
    end if;

    -- Set default value 0 for dailyAggs.activeFreePrivateProjectsToday
    if exists (select 1 from information_schema.columns where table_name = 'dailyAggs' and column_name = 'activeFreePrivateProjectsToday' and column_default IS NULL) then
      alter table "dailyAggs" alter column "activeFreePrivateProjectsToday" SET DEFAULT 0;
      update "dailyAggs" set "activeFreePrivateProjectsToday"=0 WHERE "activeFreePrivateProjectsToday" IS NULL;
    end if;

    -- Set default value 0 for dailyAggs.activePaidSubscriptionsToday
    if exists (select 1 from information_schema.columns where table_name = 'dailyAggs' and column_name = 'activePaidSubscriptionsToday' and column_default IS NULL) then
      alter table "dailyAggs" alter column "activePaidSubscriptionsToday" SET DEFAULT 0;
      update "dailyAggs" set "activePaidSubscriptionsToday"=0 WHERE "activePaidSubscriptionsToday" IS NULL;
    end if;

    -- Set default value 0 for dailyAggs.buildJobsCancelled
    if exists (select 1 from information_schema.columns where table_name = 'dailyAggs' and column_name = 'buildJobsCancelled' and column_default IS NULL) then
      alter table "dailyAggs" alter column "buildJobsCancelled" SET DEFAULT 0;
      update "dailyAggs" set "buildJobsCancelled"=0 WHERE "buildJobsCancelled" IS NULL;
    end if;

    -- Set default value 0 for dailyAggs.buildJobsSkipped
    if exists (select 1 from information_schema.columns where table_name = 'dailyAggs' and column_name = 'buildJobsSkipped' and column_default IS NULL) then
      alter table "dailyAggs" alter column "buildJobsSkipped" SET DEFAULT 0;
      update "dailyAggs" set "buildJobsSkipped"=0 WHERE "buildJobsSkipped" IS NULL;
    end if;

    -- Set default value 0 for dailyAggs.buildJobsTimedOut
    if exists (select 1 from information_schema.columns where table_name = 'dailyAggs' and column_name = 'buildJobsTimedOut' and column_default IS NULL) then
      alter table "dailyAggs" alter column "buildJobsTimedOut" SET DEFAULT 0;
      update "dailyAggs" set "buildJobsTimedOut"=0 WHERE "buildJobsTimedOut" IS NULL;
    end if;

    -- Set default value 0 for dailyAggs.buildJobsUnstable
    if exists (select 1 from information_schema.columns where table_name = 'dailyAggs' and column_name = 'buildJobsUnstable' and column_default IS NULL) then
      alter table "dailyAggs" alter column "buildJobsUnstable" SET DEFAULT 0;
      update "dailyAggs" set "buildJobsUnstable"=0 WHERE "buildJobsUnstable" IS NULL;
    end if;

    -- Set default value 0 for dailyAggs.buildJobsSuccessful
    if exists (select 1 from information_schema.columns where table_name = 'dailyAggs' and column_name = 'buildJobsSuccessful' and column_default IS NULL) then
      alter table "dailyAggs" alter column "buildJobsSuccessful" SET DEFAULT 0;
      update "dailyAggs" set "buildJobsSuccessful"=0 WHERE "buildJobsSuccessful" IS NULL;
    end if;

    -- Set default value 0 for dailyAggs.buildJobsFailed
    if exists (select 1 from information_schema.columns where table_name = 'dailyAggs' and column_name = 'buildJobsFailed' and column_default IS NULL) then
      alter table "dailyAggs" alter column "buildJobsFailed" SET DEFAULT 0;
      update "dailyAggs" set "buildJobsFailed"=0 WHERE "buildJobsFailed" IS NULL;
    end if;

    -- Set default value 0 for dailyAggs.buildJobLengthInMS
    if exists (select 1 from information_schema.columns where table_name = 'dailyAggs' and column_name = 'buildJobLengthInMS' and column_default IS NULL) then
      alter table "dailyAggs" alter column "buildJobLengthInMS" SET DEFAULT 0;
      update "dailyAggs" set "buildJobLengthInMS"=0 WHERE "buildJobLengthInMS" IS NULL;
    end if;

    -- Set default value 0 for dailyAggs.buildJobCount
    if exists (select 1 from information_schema.columns where table_name = 'dailyAggs' and column_name = 'buildJobCount' and column_default IS NULL) then
      alter table "dailyAggs" alter column "buildJobCount" SET DEFAULT 0;
      update "dailyAggs" set "buildJobCount"=0 WHERE "buildJobCount" IS NULL;
    end if;

    -- Remove lastHubspotSyncAt field from the accounts schema
    if exists (select 1 from information_schema.columns where table_name = 'accounts' and column_name = 'lastHubspotSyncAt') then
      alter table "accounts" drop column "lastHubspotSyncAt";
    end if;

    -- Add isOnSystemCluster flag to subscriptions
    if not exists (select 1 from information_schema.columns where table_name = 'subscriptions' and column_name = 'isOnSystemCluster') then
      alter table "subscriptions" add column "isOnSystemCluster" BOOLEAN;
    end if;

    -- Add systemClusterId to systemNodes
    if not exists (select 1 from information_schema.columns where table_name = 'systemNodes' and column_name = 'systemClusterId') then
      alter table "systemNodes" add column "systemClusterId" INTEGER;
    end if;

    if exists (select 1 from information_schema.columns where table_name = 'systemClusters') then
      -- Add systemNodes.systemClusterId foreign key
      if not exists (select 1 from pg_constraint where conname = 'sytemNodes_systemClusterId_fkey') then
        alter table "systemNodes" add constraint "sytemNodes_systemClusterId_fkey" foreign key ("systemClusterId") references "systemClusters"(id) on update restrict on delete restrict;
      end if;

      -- Add maxDiskUsagePercentage flag to systemClusters
      if not exists (select 1 from information_schema.columns where table_name = 'systemClusters' and column_name = 'maxDiskUsagePercentage') then
        alter table "systemClusters" add column "maxDiskUsagePercentage" INTEGER;
      end if;

      -- add "timeoutMS" to systemClusters table
      if not exists (select 1 from information_schema.columns where table_name = 'systemClusters' and column_name = 'timeoutMS') then
        alter table "systemClusters" add column "timeoutMS" INTEGER;
      end if;
    end if;

    if exists (select 1 from information_schema.columns where table_name = 'clusters') then
      -- Add maxDiskUsagePercentage flag to clusters
      if not exists (select 1 from information_schema.columns where table_name = 'clusters' and column_name = 'maxDiskUsagePercentage') then
        alter table "clusters" add column "maxDiskUsagePercentage" INTEGER;
      end if;

      -- Add propertyBag column to clusters
      if not exists (select 1 from information_schema.columns where table_name = 'clusters' and column_name = 'propertyBag') then
        alter table "clusters" add column "propertyBag" TEXT;
      end if;

      -- change type of "name" to varchar(255) in clusters table
      if exists (select 1 from information_schema.columns where table_name = 'clusters' and column_name = 'name') then
        alter table "clusters" alter column "name" type varchar(255);
      end if;

      -- add "timeoutMS" to clusters table
      if not exists (select 1 from information_schema.columns where table_name = 'clusters' and column_name = 'timeoutMS') then
        alter table "clusters" add column "timeoutMS" INTEGER;
      end if;

      -- Remove not null constraint on clusters.queueName
      if exists (select 1 from information_schema.columns where table_name = 'clusters' and column_name = 'queueName') then
        alter table "clusters" alter "queueName" drop not null;
      end if;
    end if;

    -- Add setAsStopped column to clusterNodes table
    if not exists (select 1 from information_schema.columns where table_name = 'clusterNodes' and column_name = 'setAsStopped') then
      alter table "clusterNodes" add column "setAsStopped" BOOLEAN;
    end if;

    -- Remove foreign key constraint on jobConsoles.jobId
    if exists (select 1 from pg_constraint where conname = 'jobConsoles_jobId_fkey') then
      alter table "jobConsoles" drop constraint "jobConsoles_jobId_fkey";
    end if;

    -- Remove foreign key constraint on buildJobConsoles.buildJobId
    if exists (select 1 from pg_constraint where conname = 'buildJobConsoles_buildJobId_fkey') then
      alter table "buildJobConsoles" drop constraint "buildJobConsoles_buildJobId_fkey";
    end if;

    -- Remove timeoutMS column from runs
    if exists (select 1 from information_schema.columns where table_name = 'runs' and column_name = 'timeoutMS') then
      alter table "runs" drop column "timeoutMS";
    end if;

    -- Add privateSubnetId column to systemMachineImages table
    if not exists (select 1 from information_schema.columns where table_name = 'systemMachineImages' and column_name = 'privateSubnetId') then
      alter table "systemMachineImages" add column "privateSubnetId" VARCHAR(80);
    end if;

    -- Add publicNatIp column to systemMachineImages table
    if not exists (select 1 from information_schema.columns where table_name = 'systemMachineImages' and column_name = 'publicNatIp') then
      alter table "systemMachineImages" add column "publicNatIp" VARCHAR(80);
    end if;

    -- Add isNatEnabled column to clusters table
    if not exists (select 1 from information_schema.columns where table_name = 'clusters' and column_name = 'isNatEnabled') then
      alter table "clusters" add column "isNatEnabled" BOOLEAN;
    end if;

    -- Removes jobId foreign key from jobCoverageReports
    if exists (select 1 from pg_constraint where conname = 'jobCoverageReports_jobId_fkey') then
      alter table "jobCoverageReports" drop constraint "jobCoverageReports_jobId_fkey";
    end if;

    -- Removes jobId foreign key from jobTestReports
    if exists (select 1 from pg_constraint where conname = 'jobTestReports_jobId_fkey') then
      alter table "jobTestReports" drop constraint "jobTestReports_jobId_fkey";
    end if;
  end
$$;
