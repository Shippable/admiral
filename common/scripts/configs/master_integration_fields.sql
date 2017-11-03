do $$
  begin
    if not exists (select 1 from information_schema.columns where table_name = 'masterIntegrationFields') then
    -- This is the base table, do not add any fields here. Add them below.
      create table "masterIntegrationFields" (
        "id" INT PRIMARY KEY NOT NULL,
        "masterIntegrationId" VARCHAR(24) NOT NULL,
        "name" VARCHAR(80) NOT NULL,
        "dataType" VARCHAR(80) NOT NULL,
        "isRequired" BOOLEAN DEFAULT false NOT NULL,
        "isSecure" BOOLEAN DEFAULT false NOT NULL,
        "createdBy" VARCHAR(24) NOT NULL,
        "updatedBy" VARCHAR(24) NOT NULL,
        "createdAt" timestamp with time zone NOT NULL,
        "updatedAt" timestamp with time zone NOT NULL
      );
    end if;

    -- Create indexes

    -- Add miFieldsMiIdNameU index
    if not exists (select 1 from pg_indexes where tablename = 'masterIntegrationFields' and indexname = 'miFieldsMiIdNameU') then
      create index "miFieldsMiIdNameU" on "masterIntegrationFields" using btree("masterIntegrationId", "name");
    end if;

    -- Adds foreign key relationships for masterIntegrationFields
    if not exists (select 1 from pg_constraint where conname = 'masterIntegrationFields_masterIntegrationId_fkey') then
      alter table "masterIntegrationFields" add constraint "masterIntegrationFields_masterIntegrationId_fkey" foreign key ("masterIntegrationId") references "masterIntegrations"(id) on update restrict on delete restrict;
    end if;


    -- Insert all masterIntegrationFields

    -- masterIntegrationFields for Docker
    if not exists (select 1 from "masterIntegrationFields" where "id" = 4) then
      insert into "masterIntegrationFields" ("id", "masterIntegrationId", "name", "dataType", "isRequired", "isSecure","createdBy", "updatedBy", "createdAt", "updatedAt")
      values (4, '5553a7ac3566980c00a3bf0e', 'username', 'string', true, false,'54188262bc4d591ba438d62a', '54188262bc4d591ba438d62a', '2016-06-01', '2016-06-01');
    end if;

    if not exists (select 1 from "masterIntegrationFields" where "id" = 5) then
      insert into "masterIntegrationFields" ("id", "masterIntegrationId", "name", "dataType", "isRequired", "isSecure","createdBy", "updatedBy", "createdAt", "updatedAt")
      values (5, '5553a7ac3566980c00a3bf0e', 'password', 'string', true, true,'54188262bc4d591ba438d62a', '54188262bc4d591ba438d62a', '2016-06-01', '2016-06-01');
    end if;

    if not exists (select 1 from "masterIntegrationFields" where "id" = 6) then
      insert into "masterIntegrationFields" ("id", "masterIntegrationId", "name", "dataType", "isRequired", "isSecure","createdBy", "updatedBy", "createdAt", "updatedAt")
      values (6, '5553a7ac3566980c00a3bf0e', 'email', 'string', true, false,'54188262bc4d591ba438d62a', '54188262bc4d591ba438d62a', '2016-06-01', '2016-06-01');
    end if;

    -- masterIntegrationFields for Private Docker Registry
    if not exists (select 1 from "masterIntegrationFields" where "id" = 7) then
      insert into "masterIntegrationFields" ("id", "masterIntegrationId", "name", "dataType", "isRequired", "isSecure","createdBy", "updatedBy", "createdAt", "updatedAt")
      values (7, '559e8f3e90252e0c00672376', 'url', 'string', true, false,'54188262bc4d591ba438d62a', '54188262bc4d591ba438d62a', '2016-06-01', '2016-06-01');
    end if;

    if not exists (select 1 from "masterIntegrationFields" where "id" = 8) then
      insert into "masterIntegrationFields" ("id", "masterIntegrationId", "name", "dataType", "isRequired", "isSecure","createdBy", "updatedBy", "createdAt", "updatedAt")
      values (8, '559e8f3e90252e0c00672376', 'username', 'string', true, false,'54188262bc4d591ba438d62a', '54188262bc4d591ba438d62a', '2016-06-01', '2016-06-01');
    end if;

    if not exists (select 1 from "masterIntegrationFields" where "id" = 9) then
      insert into "masterIntegrationFields" ("id", "masterIntegrationId", "name", "dataType", "isRequired", "isSecure","createdBy", "updatedBy", "createdAt", "updatedAt")
      values (9, '559e8f3e90252e0c00672376', 'password', 'string', true, true,'54188262bc4d591ba438d62a', '54188262bc4d591ba438d62a', '2016-06-01', '2016-06-01');
    end if;

    if not exists (select 1 from "masterIntegrationFields" where "id" = 10) then
      insert into "masterIntegrationFields" ("id", "masterIntegrationId", "name", "dataType", "isRequired", "isSecure","createdBy", "updatedBy", "createdAt", "updatedAt")
      values (10, '559e8f3e90252e0c00672376', 'email', 'string', true, false,'54188262bc4d591ba438d62a', '54188262bc4d591ba438d62a', '2016-06-01', '2016-06-01');
    end if;

    -- masterIntegrationFields for Slack
    if not exists (select 1 from "masterIntegrationFields" where "id" = 11) then
      insert into "masterIntegrationFields" ("id", "masterIntegrationId", "name", "dataType", "isRequired", "isSecure","createdBy", "updatedBy", "createdAt", "updatedAt")
      values (11, '55bba7932c6c780b00e4426c', 'webhookUrl', 'string', true, false,'54188262bc4d591ba438d62a', '54188262bc4d591ba438d62a', '2016-06-01', '2016-06-01');
    end if;

    -- masterIntegrationFields for webhook
    if not exists (select 1 from "masterIntegrationFields" where "id" = 13) then
      insert into "masterIntegrationFields" ("id", "masterIntegrationId", "name", "dataType", "isRequired", "isSecure","createdBy", "updatedBy", "createdAt", "updatedAt")
      values (13, '573aab7c5419f10f00bef322', 'project', 'string', false, false,'54188262bc4d591ba438d62a', '54188262bc4d591ba438d62a', '2016-06-01', '2016-06-01');
    end if;

    if not exists (select 1 from "masterIntegrationFields" where "id" = 14) then
      insert into "masterIntegrationFields" ("id", "masterIntegrationId", "name", "dataType", "isRequired", "isSecure","createdBy", "updatedBy", "createdAt", "updatedAt")
      values (14, '573aab7c5419f10f00bef322', 'webhookURL', 'string', false, false,'54188262bc4d591ba438d62a', '54188262bc4d591ba438d62a', '2016-06-01', '2016-06-01');
    end if;

    if not exists (select 1 from "masterIntegrationFields" where "id" = 15) then
      insert into "masterIntegrationFields" ("id", "masterIntegrationId", "name", "dataType", "isRequired", "isSecure","createdBy", "updatedBy", "createdAt", "updatedAt")
      values (15, '573aab7c5419f10f00bef322', 'authorization', 'string', false, false,'54188262bc4d591ba438d62a', '54188262bc4d591ba438d62a', '2016-06-01', '2016-06-01');
    end if;

    -- masterIntegrationFields for GCR
    if not exists (select 1 from "masterIntegrationFields" where "id" = 16) then
      insert into "masterIntegrationFields" ("id", "masterIntegrationId", "name", "dataType", "isRequired", "isSecure","createdBy", "updatedBy", "createdAt", "updatedAt")
      values (16, '5553a8333566980c00a3bf1b', 'JSON_key', 'string', true, false,'54188262bc4d591ba438d62a', '54188262bc4d591ba438d62a', '2016-06-01', '2016-06-01');
    end if;

    -- masterIntegrationFields for ECR
    if not exists (select 1 from "masterIntegrationFields" where "id" = 17) then
      insert into "masterIntegrationFields" ("id", "masterIntegrationId", "name", "dataType", "isRequired", "isSecure","createdBy", "updatedBy", "createdAt", "updatedAt")
      values (17, '5673c6561895ca4474669507', 'aws_access_key_id', 'string', true, false,'54188262bc4d591ba438d62a', '54188262bc4d591ba438d62a', '2016-06-01', '2016-06-01');
    end if;

    if not exists (select 1 from "masterIntegrationFields" where "id" = 18) then
      insert into "masterIntegrationFields" ("id", "masterIntegrationId", "name", "dataType", "isRequired", "isSecure","createdBy", "updatedBy", "createdAt", "updatedAt")
      values (18, '5673c6561895ca4474669507', 'aws_secret_access_key', 'string', true, false,'54188262bc4d591ba438d62a', '54188262bc4d591ba438d62a', '2016-06-01', '2016-06-01');
    end if;

    -- masterIntegrationFields for AWS
    if not exists (select 1 from "masterIntegrationFields" where "id" = 19) then
      insert into "masterIntegrationFields" ("id", "masterIntegrationId", "name", "dataType", "isRequired", "isSecure","createdBy", "updatedBy", "createdAt", "updatedAt")
      values (19, '55c8d2333399590c007982f8', 'aws_access_key_id', 'string', true, false,'54188262bc4d591ba438d62a', '54188262bc4d591ba438d62a', '2016-06-01', '2016-06-01');
    end if;

    if not exists (select 1 from "masterIntegrationFields" where "id" = 20) then
      insert into "masterIntegrationFields" ("id", "masterIntegrationId", "name", "dataType", "isRequired", "isSecure","createdBy", "updatedBy", "createdAt", "updatedAt")
      values (20, '55c8d2333399590c007982f8', 'aws_secret_access_key', 'string', true, true,'54188262bc4d591ba438d62a', '54188262bc4d591ba438d62a', '2016-06-01', '2016-06-01');
    end if;

    if not exists (select 1 from "masterIntegrationFields" where "id" = 22) then
      insert into "masterIntegrationFields" ("id", "masterIntegrationId", "name", "dataType", "isRequired", "isSecure","createdBy", "updatedBy", "createdAt", "updatedAt")
      values (22, '55c8d2333399590c007982f8', 'url', 'string', true, false,'54188262bc4d591ba438d62a', '54188262bc4d591ba438d62a', '2016-06-01', '2016-06-01');
    end if;

    -- masterIntegrationFields for AWS_IAM
    if not exists (select 1 from "masterIntegrationFields" where "id" = 24) then
      insert into "masterIntegrationFields" ("id", "masterIntegrationId", "name", "dataType", "isRequired", "isSecure","createdBy", "updatedBy", "createdAt", "updatedAt")
      values (24, '571032a897aadea0ee186900', 'assumeRoleARN', 'string', true, false,'54188262bc4d591ba438d62a', '54188262bc4d591ba438d62a', '2016-06-23', '2016-06-23');
    end if;

    if not exists (select 1 from "masterIntegrationFields" where "id" = 26) then
      insert into "masterIntegrationFields" ("id", "masterIntegrationId", "name", "dataType", "isRequired", "isSecure","createdBy", "updatedBy", "createdAt", "updatedAt")
      values (26, '571032a897aadea0ee186900', 'output', 'string', true, false,'54188262bc4d591ba438d62a', '54188262bc4d591ba438d62a', '2016-06-23', '2016-06-23');
    end if;
    if not exists (select 1 from "masterIntegrationFields" where "id" = 27) then
      insert into "masterIntegrationFields" ("id", "masterIntegrationId", "name", "dataType", "isRequired", "isSecure","createdBy", "updatedBy", "createdAt", "updatedAt")
      values (27, '571032a897aadea0ee186900', 'url', 'string', true, false,'54188262bc4d591ba438d62a', '54188262bc4d591ba438d62a', '2016-06-23', '2016-06-23');
    end if;

     -- masterIntegrationFields for GKE
    if not exists (select 1 from "masterIntegrationFields" where "id" = 30) then
      insert into "masterIntegrationFields" ("id", "masterIntegrationId", "name", "dataType", "isRequired", "isSecure","createdBy", "updatedBy", "createdAt", "updatedAt")
      values (30, '56d417653270aa438861cf65', 'JSON_key', 'string', true, false,'54188262bc4d591ba438d62a', '54188262bc4d591ba438d62a', '2016-06-01', '2016-06-01');
    end if;

    if not exists (select 1 from "masterIntegrationFields" where "id" = 31) then
      insert into "masterIntegrationFields" ("id", "masterIntegrationId", "name", "dataType", "isRequired", "isSecure","createdBy", "updatedBy", "createdAt", "updatedAt")
      values (31, '56d417653270aa438861cf65', 'url', 'string', true, false,'54188262bc4d591ba438d62a', '54188262bc4d591ba438d62a', '2016-06-01', '2016-06-01');
    end if;

     -- masterIntegrationFields for DCL
    if not exists (select 1 from "masterIntegrationFields" where "id" = 32) then
      insert into "masterIntegrationFields" ("id", "masterIntegrationId", "name", "dataType", "isRequired", "isSecure","createdBy", "updatedBy", "createdAt", "updatedAt")
      values (32, '570651b5f028a50b008bd955', 'username', 'string', true, false,'54188262bc4d591ba438d62a', '54188262bc4d591ba438d62a', '2016-06-01', '2016-06-01');
    end if;

    if not exists (select 1 from "masterIntegrationFields" where "id" = 33) then
      insert into "masterIntegrationFields" ("id", "masterIntegrationId", "name", "dataType", "isRequired", "isSecure","createdBy", "updatedBy", "createdAt", "updatedAt")
      values (33, '570651b5f028a50b008bd955', 'token', 'string', true, false,'54188262bc4d591ba438d62a', '54188262bc4d591ba438d62a', '2016-06-01', '2016-06-01');
    end if;

    if not exists (select 1 from "masterIntegrationFields" where "id" = 34) then
      insert into "masterIntegrationFields" ("id", "masterIntegrationId", "name", "dataType", "isRequired", "isSecure","createdBy", "updatedBy", "createdAt", "updatedAt")
      values (34, '570651b5f028a50b008bd955', 'url', 'string', true, false,'54188262bc4d591ba438d62a', '54188262bc4d591ba438d62a', '2016-06-01', '2016-06-01');
    end if;

    -- masterIntegrationFields for ACS
    if not exists (select 1 from "masterIntegrationFields" where "id" = 35) then
      insert into "masterIntegrationFields" ("id", "masterIntegrationId", "name", "dataType", "isRequired", "isSecure","createdBy", "updatedBy", "createdAt", "updatedAt")
      values (35, '5723561699ddf70c00be27ed', 'username', 'string', true, false,'54188262bc4d591ba438d62a', '54188262bc4d591ba438d62a', '2016-06-01', '2016-06-01');
    end if;

    if not exists (select 1 from "masterIntegrationFields" where "id" = 36) then
      insert into "masterIntegrationFields" ("id", "masterIntegrationId", "name", "dataType", "isRequired", "isSecure","createdBy", "updatedBy", "createdAt", "updatedAt")
      values (36, '5723561699ddf70c00be27ed', 'url', 'string', true, false,'54188262bc4d591ba438d62a', '54188262bc4d591ba438d62a', '2016-06-01', '2016-06-01');
    end if;

    -- masterIntegrationFields for githubEnterprise
    if not exists (select 1 from "masterIntegrationFields" where "id" = 39) then
      insert into "masterIntegrationFields" ("id", "masterIntegrationId", "name", "dataType", "isRequired", "isSecure","createdBy", "updatedBy", "createdAt", "updatedAt")
      values (39, '563347d6046d220c002a3474', 'url', 'string', true, false,'54188262bc4d591ba438d62a', '54188262bc4d591ba438d62a', '2016-06-01', '2016-06-01');
    end if;

    if not exists (select 1 from "masterIntegrationFields" where "id" = 40) then
      insert into "masterIntegrationFields" ("id", "masterIntegrationId", "name", "dataType", "isRequired", "isSecure","createdBy", "updatedBy", "createdAt", "updatedAt")
      values (40, '563347d6046d220c002a3474', 'token', 'string', true, true,'54188262bc4d591ba438d62a', '54188262bc4d591ba438d62a', '2016-06-01', '2016-06-01');
    end if;

    -- masterIntegrationFields for bitbucket
    if not exists (select 1 from "masterIntegrationFields" where "id" = 41) then
      insert into "masterIntegrationFields" ("id", "masterIntegrationId", "name", "dataType", "isRequired", "isSecure","createdBy", "updatedBy", "createdAt", "updatedAt")
      values (41, '562dc347b84b390c0083e72e', 'token', 'string', true, true,'54188262bc4d591ba438d62a', '54188262bc4d591ba438d62a', '2016-06-01', '2016-06-01');
    end if;

    if not exists (select 1 from "masterIntegrationFields" where "id" = 42) then
      insert into "masterIntegrationFields" ("id", "masterIntegrationId", "name", "dataType", "isRequired", "isSecure","createdBy", "updatedBy", "createdAt", "updatedAt")
      values (42, '562dc347b84b390c0083e72e', 'url', 'string', true, false,'54188262bc4d591ba438d62a', '54188262bc4d591ba438d62a', '2016-06-01', '2016-06-01');
    end if;

    -- masterIntegrationFields for Email
    if not exists (select 1 from "masterIntegrationFields" where "id" = 44) then
      insert into "masterIntegrationFields" ("id", "masterIntegrationId", "name", "dataType", "isRequired", "isSecure","createdBy", "updatedBy", "createdAt", "updatedAt")
      values (44, '55816ffb4d96360c000ec6f3', 'Email address', 'string', true, false,'54188262bc4d591ba438d62a', '54188262bc4d591ba438d62a', '2016-06-01', '2016-06-01');
    end if;

    -- masterIntegrationFields for Quay.io
    if not exists (select 1 from "masterIntegrationFields" where "id" = 45) then
      insert into "masterIntegrationFields" ("id", "masterIntegrationId", "name", "dataType", "isRequired", "isSecure","createdBy", "updatedBy", "createdAt", "updatedAt")
      values (45, '559eab320a31140d00a15d3a', 'url', 'string', true, false,'54188262bc4d591ba438d62a', '54188262bc4d591ba438d62a', '2016-06-01', '2016-06-01');
    end if;

    if not exists (select 1 from "masterIntegrationFields" where "id" = 46) then
      insert into "masterIntegrationFields" ("id", "masterIntegrationId", "name", "dataType", "isRequired", "isSecure","createdBy", "updatedBy", "createdAt", "updatedAt")
      values (46, '559eab320a31140d00a15d3a', 'username', 'string', true, false,'54188262bc4d591ba438d62a', '54188262bc4d591ba438d62a', '2016-06-01', '2016-06-01');
    end if;

    if not exists (select 1 from "masterIntegrationFields" where "id" = 47) then
      insert into "masterIntegrationFields" ("id", "masterIntegrationId", "name", "dataType", "isRequired", "isSecure","createdBy", "updatedBy", "createdAt", "updatedAt")
      values (47, '559eab320a31140d00a15d3a', 'password', 'string', true, true,'54188262bc4d591ba438d62a', '54188262bc4d591ba438d62a', '2016-06-01', '2016-06-01');
    end if;

    if not exists (select 1 from "masterIntegrationFields" where "id" = 48) then
      insert into "masterIntegrationFields" ("id", "masterIntegrationId", "name", "dataType", "isRequired", "isSecure","createdBy", "updatedBy", "createdAt", "updatedAt")
      values (48, '559eab320a31140d00a15d3a', 'email', 'string', true, false,'54188262bc4d591ba438d62a', '54188262bc4d591ba438d62a', '2016-06-01', '2016-06-01');
    end if;

    if not exists (select 1 from "masterIntegrationFields" where "id" = 49) then
      insert into "masterIntegrationFields" ("id", "masterIntegrationId", "name", "dataType", "isRequired", "isSecure","createdBy", "updatedBy", "createdAt", "updatedAt")
      values (49, '559eab320a31140d00a15d3a', 'accessToken', 'string', true, false,'54188262bc4d591ba438d62a', '54188262bc4d591ba438d62a', '2016-06-01', '2016-06-01');
    end if;

    -- masterIntegrationFields for github
    if not exists (select 1 from "masterIntegrationFields" where "id" = 50) then
      insert into "masterIntegrationFields" ("id", "masterIntegrationId", "name", "dataType", "isRequired", "isSecure","createdBy", "updatedBy", "createdAt", "updatedAt")
      values (50, '562dc2f048095b0d00ceebcd', 'url', 'string', true, false,'54188262bc4d591ba438d62a', '54188262bc4d591ba438d62a', '2016-06-01', '2016-06-01');
    end if;

    if not exists (select 1 from "masterIntegrationFields" where "id" = 51) then
      insert into "masterIntegrationFields" ("id", "masterIntegrationId", "name", "dataType", "isRequired", "isSecure","createdBy", "updatedBy", "createdAt", "updatedAt")
      values (51, '562dc2f048095b0d00ceebcd', 'token', 'string', true, true,'54188262bc4d591ba438d62a', '54188262bc4d591ba438d62a', '2016-06-01', '2016-06-01');
    end if;

    -- masterIntegrationFields for gitlab
    if not exists (select 1 from "masterIntegrationFields" where "id" = 52) then
      insert into "masterIntegrationFields" ("id", "masterIntegrationId", "name", "dataType", "isRequired", "isSecure","createdBy", "updatedBy", "createdAt", "updatedAt")
      values (52, '5728e13b3d93990c000fd8e4', 'url', 'string', true, false,'54188262bc4d591ba438d62a', '54188262bc4d591ba438d62a', '2016-06-01', '2016-06-01');
    end if;

    if not exists (select 1 from "masterIntegrationFields" where "id" = 53) then
      insert into "masterIntegrationFields" ("id", "masterIntegrationId", "name", "dataType", "isRequired", "isSecure","createdBy", "updatedBy", "createdAt", "updatedAt")
      values (53, '5728e13b3d93990c000fd8e4', 'token', 'string', true, true,'54188262bc4d591ba438d62a', '54188262bc4d591ba438d62a', '2016-06-01', '2016-06-01');
    end if;

    -- masterIntegrationFields for bitbucketServer
    if not exists (select 1 from "masterIntegrationFields" where "id" = 54) then
      insert into "masterIntegrationFields" ("id", "masterIntegrationId", "name", "dataType", "isRequired", "isSecure","createdBy", "updatedBy", "createdAt", "updatedAt")
      values (54, '572af430ead9631100f7f64d', 'username', 'string', true, false,'54188262bc4d591ba438d62a', '54188262bc4d591ba438d62a', '2016-06-01', '2016-06-01');
    end if;

    if not exists (select 1 from "masterIntegrationFields" where "id" = 55) then
      insert into "masterIntegrationFields" ("id", "masterIntegrationId", "name", "dataType", "isRequired", "isSecure","createdBy", "updatedBy", "createdAt", "updatedAt")
      values (55, '572af430ead9631100f7f64d', 'url', 'string', true, false,'54188262bc4d591ba438d62a', '54188262bc4d591ba438d62a', '2016-06-01', '2016-06-01');
    end if;

    if not exists (select 1 from "masterIntegrationFields" where "id" = 56) then
      insert into "masterIntegrationFields" ("id", "masterIntegrationId", "name", "dataType", "isRequired", "isSecure","createdBy", "updatedBy", "createdAt", "updatedAt")
      values (56, '572af430ead9631100f7f64d', 'token', 'string', true, true,'54188262bc4d591ba438d62a', '54188262bc4d591ba438d62a', '2016-06-01', '2016-06-01');
    end if;

    -- masterIntegrationFields for ssh-key
    if not exists (select 1 from "masterIntegrationFields" where "id" = 57) then
      insert into "masterIntegrationFields" ("id", "masterIntegrationId", "name", "dataType", "isRequired", "isSecure","createdBy", "updatedBy", "createdAt", "updatedAt")
      values (57, '568aa7c3368a090c006da702', 'publicKey', 'string', true, false,'54188262bc4d591ba438d62a', '54188262bc4d591ba438d62a', '2016-06-01', '2016-06-01');
    end if;

    if not exists (select 1 from "masterIntegrationFields" where "id" = 58) then
      insert into "masterIntegrationFields" ("id", "masterIntegrationId", "name", "dataType", "isRequired", "isSecure","createdBy", "updatedBy", "createdAt", "updatedAt")
      values (58, '568aa7c3368a090c006da702', 'privateKey', 'string', true, true,'54188262bc4d591ba438d62a', '54188262bc4d591ba438d62a', '2016-06-01', '2016-06-01');
    end if;

    -- masterIntegrationFields for pem-key
    if not exists (select 1 from "masterIntegrationFields" where "id" = 59) then
      insert into "masterIntegrationFields" ("id", "masterIntegrationId", "name", "dataType", "isRequired", "isSecure","createdBy", "updatedBy", "createdAt", "updatedAt")
      values (59, '568aa74cd43b0d0c004fec91', 'key', 'string', true, true,'54188262bc4d591ba438d62a', '54188262bc4d591ba438d62a', '2016-06-01', '2016-06-01');
    end if;

    -- masterIntegrationFields for hipchat
    if not exists (select 1 from "masterIntegrationFields" where "id" = 60) then
      insert into "masterIntegrationFields" ("id", "masterIntegrationId", "name", "dataType", "isRequired", "isSecure","createdBy", "updatedBy", "createdAt", "updatedAt")
      values (60, '56fb978f1cc7210f00bd5e72', 'token', 'string', true, false,'54188262bc4d591ba438d62a', '54188262bc4d591ba438d62a', '2016-06-01', '2016-06-01');
    end if;

    -- masterIntegrationFields for Docker Trusted Registry
    if not exists (select 1 from "masterIntegrationFields" where "id" = 61) then
      insert into "masterIntegrationFields" ("id", "masterIntegrationId", "name", "dataType", "isRequired", "isSecure","createdBy", "updatedBy", "createdAt", "updatedAt")
      values (61, '57110b987ed9d269c9d71ac1', 'url', 'string', true, false,'54188262bc4d591ba438d62a', '54188262bc4d591ba438d62a', '2016-06-01', '2016-06-01');
    end if;

    if not exists (select 1 from "masterIntegrationFields" where "id" = 62) then
      insert into "masterIntegrationFields" ("id", "masterIntegrationId", "name", "dataType", "isRequired", "isSecure","createdBy", "updatedBy", "createdAt", "updatedAt")
      values (62, '57110b987ed9d269c9d71ac1', 'username', 'string', true, false,'54188262bc4d591ba438d62a', '54188262bc4d591ba438d62a', '2016-06-01', '2016-06-01');
    end if;

    if not exists (select 1 from "masterIntegrationFields" where "id" = 63) then
      insert into "masterIntegrationFields" ("id", "masterIntegrationId", "name", "dataType", "isRequired", "isSecure","createdBy", "updatedBy", "createdAt", "updatedAt")
      values (63, '57110b987ed9d269c9d71ac1', 'password', 'string', true, true,'54188262bc4d591ba438d62a', '54188262bc4d591ba438d62a', '2016-06-01', '2016-06-01');
    end if;

    if not exists (select 1 from "masterIntegrationFields" where "id" = 64) then
      insert into "masterIntegrationFields" ("id", "masterIntegrationId", "name", "dataType", "isRequired", "isSecure","createdBy", "updatedBy", "createdAt", "updatedAt")
      values (64, '57110b987ed9d269c9d71ac1', 'email', 'string', true, false,'54188262bc4d591ba438d62a', '54188262bc4d591ba438d62a', '2016-06-01', '2016-06-01');
    end if;

    -- masterIntegrationFields for DDC
    if not exists (select 1 from "masterIntegrationFields" where "id" = 65) then
      insert into "masterIntegrationFields" ("id", "masterIntegrationId", "name", "dataType", "isRequired", "isSecure","createdBy", "updatedBy", "createdAt", "updatedAt")
      values (65, '571f081b37803a0d00455d25', 'username', 'string', true, false,'54188262bc4d591ba438d62a', '54188262bc4d591ba438d62a', '2016-06-01', '2016-06-01');
    end if;

    if not exists (select 1 from "masterIntegrationFields" where "id" = 66) then
      insert into "masterIntegrationFields" ("id", "masterIntegrationId", "name", "dataType", "isRequired", "isSecure","createdBy", "updatedBy", "createdAt", "updatedAt")
      values (66, '571f081b37803a0d00455d25', 'password', 'string', true, true,'54188262bc4d591ba438d62a', '54188262bc4d591ba438d62a', '2016-06-01', '2016-06-01');
    end if;

    if not exists (select 1 from "masterIntegrationFields" where "id" = 67) then
      insert into "masterIntegrationFields" ("id", "masterIntegrationId", "name", "dataType", "isRequired", "isSecure","createdBy", "updatedBy", "createdAt", "updatedAt")
      values (67, '571f081b37803a0d00455d25', 'url', 'string', true, false,'54188262bc4d591ba438d62a', '54188262bc4d591ba438d62a', '2016-06-01', '2016-06-01');
    end if;

    -- masterIntegrationFields for TRIPUB
    if not exists (select 1 from "masterIntegrationFields" where "id" = 68) then
      insert into "masterIntegrationFields" ("id", "masterIntegrationId", "name", "dataType", "isRequired", "isSecure","createdBy", "updatedBy", "createdAt", "updatedAt")
      values (68, '576ce63321333398d11a35ab', 'username', 'string', true, false,'54188262bc4d591ba438d62a', '54188262bc4d591ba438d62a', '2016-06-01', '2016-06-01');
    end if;

    if not exists (select 1 from "masterIntegrationFields" where "id" = 69) then
      insert into "masterIntegrationFields" ("id", "masterIntegrationId", "name", "dataType", "isRequired", "isSecure","createdBy", "updatedBy", "createdAt", "updatedAt")
      values (69, '576ce63321333398d11a35ab', 'url', 'string', true, false,'54188262bc4d591ba438d62a', '54188262bc4d591ba438d62a', '2016-06-01', '2016-06-01');
    end if;

    if not exists (select 1 from "masterIntegrationFields" where "id" = 70) then
      insert into "masterIntegrationFields" ("id", "masterIntegrationId", "name", "dataType", "isRequired", "isSecure","createdBy", "updatedBy", "createdAt", "updatedAt")
      values (70, '576ce63321333398d11a35ab', 'validityPeriod', 'string', true, false,'54188262bc4d591ba438d62a', '54188262bc4d591ba438d62a', '2016-06-01', '2016-06-01');
    end if;

    if exists (select 1 from "masterIntegrationFields" where "id" = 71 and "isRequired" = true) then
      update "masterIntegrationFields" set "isRequired" = false where "id" = 71;
    end if;

    if not exists (select 1 from "masterIntegrationFields" where "id" = 71) then
      insert into "masterIntegrationFields" ("id", "masterIntegrationId", "name", "dataType", "isRequired", "isSecure","createdBy", "updatedBy", "createdAt", "updatedAt")
      values (71, '576ce63321333398d11a35ab', 'publicKey', 'string', false, false,'54188262bc4d591ba438d62a', '54188262bc4d591ba438d62a', '2016-06-01', '2016-06-01');
    end if;

    if exists (select 1 from "masterIntegrationFields" where "id" = 72 and "isRequired" = true) then
      update "masterIntegrationFields" set "isRequired" = false where "id" = 72;
    end if;

    if not exists (select 1 from "masterIntegrationFields" where "id" = 72) then
      insert into "masterIntegrationFields" ("id", "masterIntegrationId", "name", "dataType", "isRequired", "isSecure","createdBy", "updatedBy", "createdAt", "updatedAt")
      values (72, '576ce63321333398d11a35ab', 'privateKey', 'string', false, true,'54188262bc4d591ba438d62a', '54188262bc4d591ba438d62a', '2016-06-01', '2016-06-01');
    end if;

    if exists (select 1 from "masterIntegrationFields" where "id" = 73 and "isRequired" = true) then
      update "masterIntegrationFields" set "isRequired" = false where "id" = 73;
    end if;

    if not exists (select 1 from "masterIntegrationFields" where "id" = 73) then
      insert into "masterIntegrationFields" ("id", "masterIntegrationId", "name", "dataType", "isRequired", "isSecure","createdBy", "updatedBy", "createdAt", "updatedAt")
      values (73, '576ce63321333398d11a35ab', 'certificates', 'string', false, true,'54188262bc4d591ba438d62a', '54188262bc4d591ba438d62a', '2016-06-01', '2016-06-01');
    end if;

    -- masterIntegrationFields for JENKINS
    if not exists (select 1 from "masterIntegrationFields" where "id" = 112) then
      insert into "masterIntegrationFields" ("id", "masterIntegrationId", "name", "dataType", "isRequired", "isSecure","createdBy", "updatedBy", "createdAt", "updatedAt")
      values (112, '57dbab5d15c59206bf4fbb50', 'username', 'string', true, false,'54188262bc4d591ba438d62a', '54188262bc4d591ba438d62a', '2016-06-01', '2016-06-01');
    end if;

    if not exists (select 1 from "masterIntegrationFields" where "id" = 113) then
      insert into "masterIntegrationFields" ("id", "masterIntegrationId", "name", "dataType", "isRequired", "isSecure","createdBy", "updatedBy", "createdAt", "updatedAt")
      values (113, '57dbab5d15c59206bf4fbb50', 'password', 'string', true, true,'54188262bc4d591ba438d62a', '54188262bc4d591ba438d62a', '2016-06-01', '2016-06-01');
    end if;

    if not exists (select 1 from "masterIntegrationFields" where "id" = 114) then
      insert into "masterIntegrationFields" ("id", "masterIntegrationId", "name", "dataType", "isRequired", "isSecure","createdBy", "updatedBy", "createdAt", "updatedAt")
      values (114, '57dbab5d15c59206bf4fbb50', 'url', 'string', true, false,'54188262bc4d591ba438d62a', '54188262bc4d591ba438d62a', '2016-06-01', '2016-06-01');
    end if;

    -- masterIntegrationFields for artifactory
    if not exists (select 1 from "masterIntegrationFields" where "id" = 115) then
      insert into "masterIntegrationFields" ("id", "masterIntegrationId", "name", "dataType", "isRequired", "isSecure","createdBy", "updatedBy", "createdAt", "updatedAt")
      values (115, '57dbab5d15c59206bf4fbb51', 'username', 'string', true, false,'54188262bc4d591ba438d62a', '54188262bc4d591ba438d62a', '2016-06-01', '2016-06-01');
    end if;

    if not exists (select 1 from "masterIntegrationFields" where "id" = 116) then
      insert into "masterIntegrationFields" ("id", "masterIntegrationId", "name", "dataType", "isRequired", "isSecure","createdBy", "updatedBy", "createdAt", "updatedAt")
      values (116, '57dbab5d15c59206bf4fbb51', 'password', 'string', true, true,'54188262bc4d591ba438d62a', '54188262bc4d591ba438d62a', '2016-06-01', '2016-06-01');
    end if;

    if not exists (select 1 from "masterIntegrationFields" where "id" = 117) then
      insert into "masterIntegrationFields" ("id", "masterIntegrationId", "name", "dataType", "isRequired", "isSecure","createdBy", "updatedBy", "createdAt", "updatedAt")
      values (117, '57dbab5d15c59206bf4fbb51', 'url', 'string', true, false,'54188262bc4d591ba438d62a', '54188262bc4d591ba438d62a', '2016-06-01', '2016-06-01');
    end if;

    -- masterIntegrationFields for CLUSTER
    if not exists (select 1 from "masterIntegrationFields" where "id" = 118) then
      insert into "masterIntegrationFields" ("id", "masterIntegrationId", "name", "dataType", "isRequired", "isSecure","createdBy", "updatedBy", "createdAt", "updatedAt")
      values (118, '576ce63321333398d11a35ac', 'nodes', 'array', true, false,'54188262bc4d591ba438d62a', '54188262bc4d591ba438d62a', '2016-06-01', '2016-06-01');
    end if;

    if not exists (select 1 from "masterIntegrationFields" where "id" = 119) then
      insert into "masterIntegrationFields" ("id", "masterIntegrationId", "name", "dataType", "isRequired", "isSecure","createdBy", "updatedBy", "createdAt", "updatedAt")
      values (119, '576ce63321333398d11a35ac', 'publicKey', 'string', false, false,'54188262bc4d591ba438d62a', '54188262bc4d591ba438d62a', '2016-06-01', '2016-06-01');
    end if;

    if not exists (select 1 from "masterIntegrationFields" where "id" = 120) then
      insert into "masterIntegrationFields" ("id", "masterIntegrationId", "name", "dataType", "isRequired", "isSecure","createdBy", "updatedBy", "createdAt", "updatedAt")
      values (120, '576ce63321333398d11a35ac', 'privateKey', 'string', false, true,'54188262bc4d591ba438d62a', '54188262bc4d591ba438d62a', '2016-06-01', '2016-06-01');
    end if;

    -- masterIntegrationFields for kubernetes
    if not exists (select 1 from "masterIntegrationFields" where "id" = 143) then
      insert into "masterIntegrationFields" ("id", "masterIntegrationId", "name", "dataType", "isRequired", "isSecure","createdBy", "updatedBy", "createdAt", "updatedAt")
      values (143, '5811a2e9e73d22829eb0ab3d', 'clusterAccessType', 'string', true, false,'54188262bc4d591ba438d62a', '54188262bc4d591ba438d62a', '2016-06-01', '2016-06-01');
    end if;

    if not exists (select 1 from "masterIntegrationFields" where "id" = 144) then
      insert into "masterIntegrationFields" ("id", "masterIntegrationId", "name", "dataType", "isRequired", "isSecure","createdBy", "updatedBy", "createdAt", "updatedAt")
      values (144, '5811a2e9e73d22829eb0ab3d', 'masterKubeConfigContent', 'string', false, true,'54188262bc4d591ba438d62a', '54188262bc4d591ba438d62a', '2016-06-01', '2016-06-01');
    end if;

    if not exists (select 1 from "masterIntegrationFields" where "id" = 145) then
      insert into "masterIntegrationFields" ("id", "masterIntegrationId", "name", "dataType", "isRequired", "isSecure","createdBy", "updatedBy", "createdAt", "updatedAt")
      values (145, '5811a2e9e73d22829eb0ab3d', 'bastionHostIP', 'string', false, false,'54188262bc4d591ba438d62a', '54188262bc4d591ba438d62a', '2016-06-01', '2016-06-01');
    end if;

    if not exists (select 1 from "masterIntegrationFields" where "id" = 146) then
      insert into "masterIntegrationFields" ("id", "masterIntegrationId", "name", "dataType", "isRequired", "isSecure","createdBy", "updatedBy", "createdAt", "updatedAt")
      values (146, '5811a2e9e73d22829eb0ab3d', 'bastionKubeConfigType', 'string', true, false,'54188262bc4d591ba438d62a', '54188262bc4d591ba438d62a', '2016-06-01', '2016-06-01');
    end if;

    if not exists (select 1 from "masterIntegrationFields" where "id" = 147) then
      insert into "masterIntegrationFields" ("id", "masterIntegrationId", "name", "dataType", "isRequired", "isSecure","createdBy", "updatedBy", "createdAt", "updatedAt")
      values (147, '5811a2e9e73d22829eb0ab3d', 'bastionKubeConfigContent', 'string', false, true,'54188262bc4d591ba438d62a', '54188262bc4d591ba438d62a', '2016-06-01', '2016-06-01');
    end if;

    if not exists (select 1 from "masterIntegrationFields" where "id" = 148) then
      insert into "masterIntegrationFields" ("id", "masterIntegrationId", "name", "dataType", "isRequired", "isSecure","createdBy", "updatedBy", "createdAt", "updatedAt")
      values (148, '5811a2e9e73d22829eb0ab3d', 'bastionPublicKey', 'string', false, false,'54188262bc4d591ba438d62a', '54188262bc4d591ba438d62a', '2016-06-01', '2016-06-01');
    end if;

    if not exists (select 1 from "masterIntegrationFields" where "id" = 149) then
      insert into "masterIntegrationFields" ("id", "masterIntegrationId", "name", "dataType", "isRequired", "isSecure","createdBy", "updatedBy", "createdAt", "updatedAt")
      values (149, '5811a2e9e73d22829eb0ab3d', 'bastionPrivateKey', 'string', false, true,'54188262bc4d591ba438d62a', '54188262bc4d591ba438d62a', '2016-06-01', '2016-06-01');
    end if;

    -- masterIntegrationFields for amazonKeys
    if not exists (select 1 from "masterIntegrationFields" where "id" = 150) then
      insert into "masterIntegrationFields" ("id", "masterIntegrationId", "name", "dataType", "isRequired", "isSecure","createdBy", "updatedBy", "createdAt", "updatedAt")
      values (150, '57467326b3cbfc0c004f9111', 'accessKey', 'string', true, false,'54188262bc4d591ba438d62a', '54188262bc4d591ba438d62a', '2016-06-01', '2016-06-01');
    end if;

    if not exists (select 1 from "masterIntegrationFields" where "id" = 151) then
      insert into "masterIntegrationFields" ("id", "masterIntegrationId", "name", "dataType", "isRequired", "isSecure","createdBy", "updatedBy", "createdAt", "updatedAt")
      values (151, '57467326b3cbfc0c004f9111', 'secretKey', 'string', true, true, '54188262bc4d591ba438d62a', '54188262bc4d591ba438d62a', '2016-06-01', '2016-06-01');
    end if;

    if exists (select 1 from "masterIntegrationFields" where "id" = 151 and "isSecure" = false) then
      update "masterIntegrationFields" set "isSecure" = true where "id" = 151;
    end if;

    -- masterIntegrationFields for gitlabCreds
    if not exists (select 1 from "masterIntegrationFields" where "id" = 152) then
      insert into "masterIntegrationFields" ("id", "masterIntegrationId", "name", "dataType", "isRequired", "isSecure","createdBy", "updatedBy", "createdAt", "updatedAt")
      values (152, '574ee696d49b091400b71112', 'username', 'string', true, false,'54188262bc4d591ba438d62a', '54188262bc4d591ba438d62a', '2016-06-01', '2016-06-01');
    end if;

    if not exists (select 1 from "masterIntegrationFields" where "id" = 153) then
      insert into "masterIntegrationFields" ("id", "masterIntegrationId", "name", "dataType", "isRequired", "isSecure","createdBy", "updatedBy", "createdAt", "updatedAt")
      values (153, '574ee696d49b091400b71112', 'password', 'string', true, false,'54188262bc4d591ba438d62a', '54188262bc4d591ba438d62a', '2016-06-01', '2016-06-01');
    end if;

    if not exists (select 1 from "masterIntegrationFields" where "id" = 154) then
      insert into "masterIntegrationFields" ("id", "masterIntegrationId", "name", "dataType", "isRequired", "isSecure","createdBy", "updatedBy", "createdAt", "updatedAt")
      values (154, '574ee696d49b091400b71112', 'url', 'string', true, false,'54188262bc4d591ba438d62a', '54188262bc4d591ba438d62a', '2016-06-01', '2016-06-01');
    end if;

    -- masterIntegrationFields for mailgunCreds
    if not exists (select 1 from "masterIntegrationFields" where "id" = 155) then
      insert into "masterIntegrationFields" ("id", "masterIntegrationId", "name", "dataType", "isRequired", "isSecure", "createdBy", "updatedBy", "createdAt", "updatedAt")
      values (155, '57e8ea91424bff9c871d7113', 'apiKey', 'string', true, true, '54188262bc4d591ba438d62a', '54188262bc4d591ba438d62a', '2016-06-01', '2016-06-01');
    end if;

    if not exists (select 1 from "masterIntegrationFields" where "id" = 156) then
      insert into "masterIntegrationFields" ("id", "masterIntegrationId", "name", "dataType", "isRequired", "isSecure", "createdBy", "updatedBy", "createdAt", "updatedAt")
      values (156, '57e8ea91424bff9c871d7113', 'domain', 'string', true, false, '54188262bc4d591ba438d62a', '54188262bc4d591ba438d62a', '2016-06-01', '2016-06-01');
    end if;

    if not exists (select 1 from "masterIntegrationFields" where "id" = 157) then
      insert into "masterIntegrationFields" ("id", "masterIntegrationId", "name", "dataType", "isRequired", "isSecure", "createdBy", "updatedBy", "createdAt", "updatedAt")
      values (157, '57e8ea91424bff9c871d7113', 'proxy', 'string', false, false, '54188262bc4d591ba438d62a', '54188262bc4d591ba438d62a', '2016-06-01', '2016-06-01');
    end if;

    if not exists (select 1 from "masterIntegrationFields" where "id" = 158) then
      insert into "masterIntegrationFields" ("id", "masterIntegrationId", "name", "dataType", "isRequired", "isSecure", "createdBy", "updatedBy", "createdAt", "updatedAt")
      values (158, '57e8ea91424bff9c871d7113', 'emailSender', 'string', false, false, '54188262bc4d591ba438d62a', '54188262bc4d591ba438d62a', '2016-06-01', '2016-06-01');
    end if;

    -- masterIntegrationFields for gmailCreds
    if not exists (select 1 from "masterIntegrationFields" where "id" = 159) then
      insert into "masterIntegrationFields" ("id", "masterIntegrationId", "name", "dataType", "isRequired", "isSecure", "createdBy", "updatedBy", "createdAt", "updatedAt")
      values (159, '57e8ea9c14d3ef88e56f1114', 'username', 'string', true, false, '54188262bc4d591ba438d62a', '54188262bc4d591ba438d62a', '2016-06-01', '2016-06-01');
    end if;

    if not exists (select 1 from "masterIntegrationFields" where "id" = 160) then
      insert into "masterIntegrationFields" ("id", "masterIntegrationId", "name", "dataType", "isRequired", "isSecure", "createdBy", "updatedBy", "createdAt", "updatedAt")
      values (160, '57e8ea9c14d3ef88e56f1114', 'password', 'string', true, true, '54188262bc4d591ba438d62a', '54188262bc4d591ba438d62a', '2016-06-01', '2016-06-01');
    end if;

    if not exists (select 1 from "masterIntegrationFields" where "id" = 161) then
      insert into "masterIntegrationFields" ("id", "masterIntegrationId", "name", "dataType", "isRequired", "isSecure", "createdBy", "updatedBy", "createdAt", "updatedAt")
      values (161, '57e8ea9c14d3ef88e56f1114', 'proxy', 'string', false, false, '54188262bc4d591ba438d62a', '54188262bc4d591ba438d62a', '2016-06-01', '2016-06-01');
    end if;

    if not exists (select 1 from "masterIntegrationFields" where "id" = 162) then
      insert into "masterIntegrationFields" ("id", "masterIntegrationId", "name", "dataType", "isRequired", "isSecure", "createdBy", "updatedBy", "createdAt", "updatedAt")
      values (162, '57e8ea9c14d3ef88e56f1114', 'emailSender', 'string', false, false, '54188262bc4d591ba438d62a', '54188262bc4d591ba438d62a', '2016-06-01', '2016-06-01');
    end if;

    -- masterIntegrationFields for smtpCreds
    if not exists (select 1 from "masterIntegrationFields" where "id" = 163) then
      insert into "masterIntegrationFields" ("id", "masterIntegrationId", "name", "dataType", "isRequired", "isSecure","createdBy", "updatedBy", "createdAt", "updatedAt")
      values (163, '57cea8056ce9c71800d31115', 'emailAuthUser', 'string', false, false,'54188262bc4d591ba438d62a', '54188262bc4d591ba438d62a', '2016-06-01', '2016-06-01');
    end if;

    if not exists (select 1 from "masterIntegrationFields" where "id" = 164) then
      insert into "masterIntegrationFields" ("id", "masterIntegrationId", "name", "dataType", "isRequired", "isSecure","createdBy", "updatedBy", "createdAt", "updatedAt")
      values (164, '57cea8056ce9c71800d31115', 'emailAuthPassword', 'string', false, true,'54188262bc4d591ba438d62a', '54188262bc4d591ba438d62a', '2016-06-01', '2016-06-01');
    end if;

    if not exists (select 1 from "masterIntegrationFields" where "id" = 165) then
      insert into "masterIntegrationFields" ("id", "masterIntegrationId", "name", "dataType", "isRequired", "isSecure","createdBy", "updatedBy", "createdAt", "updatedAt")
      values (165, '57cea8056ce9c71800d31115', 'emailSender', 'string', false, false,'54188262bc4d591ba438d62a', '54188262bc4d591ba438d62a', '2016-06-01', '2016-06-01');
    end if;

    if not exists (select 1 from "masterIntegrationFields" where "id" = 166) then
      insert into "masterIntegrationFields" ("id", "masterIntegrationId", "name", "dataType", "isRequired", "isSecure","createdBy", "updatedBy", "createdAt", "updatedAt")
      values (166, '57cea8056ce9c71800d31115', 'host', 'string', true, false, '54188262bc4d591ba438d62a', '54188262bc4d591ba438d62a', '2016-06-01', '2016-06-01');
    end if;

    if not exists (select 1 from "masterIntegrationFields" where "id" = 167) then
      insert into "masterIntegrationFields" ("id", "masterIntegrationId", "name", "dataType", "isRequired", "isSecure","createdBy", "updatedBy", "createdAt", "updatedAt")
      values (167, '57cea8056ce9c71800d31115', 'port', 'string', true, false, '54188262bc4d591ba438d62a', '54188262bc4d591ba438d62a', '2016-06-01', '2016-06-01');
    end if;

    if not exists (select 1 from "masterIntegrationFields" where "id" = 168) then
      insert into "masterIntegrationFields" ("id", "masterIntegrationId", "name", "dataType", "isRequired", "isSecure","createdBy", "updatedBy", "createdAt", "updatedAt")
      values (168, '57cea8056ce9c71800d31115', 'secure', 'string', false, false, '54188262bc4d591ba438d62a', '54188262bc4d591ba438d62a', '2016-06-01', '2016-06-01');
    end if;

    if not exists (select 1 from "masterIntegrationFields" where "id" = 169) then
      insert into "masterIntegrationFields" ("id", "masterIntegrationId", "name", "dataType", "isRequired", "isSecure","createdBy", "updatedBy", "createdAt", "updatedAt")
      values (169, '57cea8056ce9c71800d31115', 'hostname', 'string', false, false, '54188262bc4d591ba438d62a', '54188262bc4d591ba438d62a', '2016-06-01', '2016-06-01');
    end if;

    if not exists (select 1 from "masterIntegrationFields" where "id" = 170) then
      insert into "masterIntegrationFields" ("id", "masterIntegrationId", "name", "dataType", "isRequired", "isSecure","createdBy", "updatedBy", "createdAt", "updatedAt")
      values (170, '57cea8056ce9c71800d31115', 'proxy', 'string', false, false, '54188262bc4d591ba438d62a', '54188262bc4d591ba438d62a', '2016-06-01', '2016-06-01');
    end if;

    -- masterIntegrationFields for braintreeKeys
    if not exists (select 1 from "masterIntegrationFields" where "id" = 171 and "name" = 'braintreeEnvironment') then
      insert into "masterIntegrationFields" ("id", "masterIntegrationId", "name", "dataType", "isRequired", "isSecure","createdBy", "updatedBy", "createdAt", "updatedAt")
      values (171, '57aafd0673ea26cb053f1116', 'braintreeEnvironment', 'string', true, false,'54188262bc4d591ba438d62a', '54188262bc4d591ba438d62a', '2016-06-01', '2016-06-01');
    end if;

    if not exists (select 1 from "masterIntegrationFields" where "id" = 172 and "name" = 'braintreeMerchantId') then
      insert into "masterIntegrationFields" ("id", "masterIntegrationId", "name", "dataType", "isRequired", "isSecure","createdBy", "updatedBy", "createdAt", "updatedAt")
      values (172, '57aafd0673ea26cb053f1116', 'braintreeMerchantId', 'string', true, false,'54188262bc4d591ba438d62a', '54188262bc4d591ba438d62a', '2016-06-01', '2016-06-01');
    end if;

    if not exists (select 1 from "masterIntegrationFields" where "id" = 173 and "name" = 'braintreePrivateKey') then
      insert into "masterIntegrationFields" ("id", "masterIntegrationId", "name", "dataType", "isRequired", "isSecure","createdBy", "updatedBy", "createdAt", "updatedAt")
      values (173, '57aafd0673ea26cb053f1116', 'braintreePrivateKey', 'string', true, false,'54188262bc4d591ba438d62a', '54188262bc4d591ba438d62a', '2016-06-01', '2016-06-01');
    end if;

    if not exists (select 1 from "masterIntegrationFields" where "id" = 174 and "name" = 'braintreePublicKey') then
      insert into "masterIntegrationFields" ("id", "masterIntegrationId", "name", "dataType", "isRequired", "isSecure","createdBy", "updatedBy", "createdAt", "updatedAt")
      values (174, '57aafd0673ea26cb053f1116', 'braintreePublicKey', 'string', true, false,'54188262bc4d591ba438d62a', '54188262bc4d591ba438d62a', '2016-06-01', '2016-06-01');
    end if;

    -- masterIntegrationFields for githubKeys
    if not exists (select 1 from "masterIntegrationFields" where "id" = 175) then
      insert into "masterIntegrationFields" ("id", "masterIntegrationId", "name", "dataType", "isRequired", "isSecure","createdBy", "updatedBy", "createdAt", "updatedAt")
      values (175, '577de63321333398d11a1117', 'clientId', 'string', true, true,'54188262bc4d591ba438d62a', '54188262bc4d591ba438d62a', '2016-06-01', '2016-06-01');
    end if;

    if not exists (select 1 from "masterIntegrationFields" where "id" = 176) then
      insert into "masterIntegrationFields" ("id", "masterIntegrationId", "name", "dataType", "isRequired", "isSecure","createdBy", "updatedBy", "createdAt", "updatedAt")
      values (176, '577de63321333398d11a1117', 'clientSecret', 'string', true, true,'54188262bc4d591ba438d62a', '54188262bc4d591ba438d62a', '2016-06-01', '2016-06-01');
    end if;

    if not exists (select 1 from "masterIntegrationFields" where "id" = 177) then
      insert into "masterIntegrationFields" ("id", "masterIntegrationId", "name", "dataType", "isRequired", "isSecure","createdBy", "updatedBy", "createdAt", "updatedAt")
      values (177, '577de63321333398d11a1117', 'wwwUrl', 'string', true, true,'54188262bc4d591ba438d62a', '54188262bc4d591ba438d62a', '2016-06-01', '2016-06-01');
    end if;

    if not exists (select 1 from "masterIntegrationFields" where "id" = 178) then
      insert into "masterIntegrationFields" ("id", "masterIntegrationId", "name", "dataType", "isRequired", "isSecure","createdBy", "updatedBy", "createdAt", "updatedAt")
      values (178, '577de63321333398d11a1117', 'providerId', 'string', false, false,'54188262bc4d591ba438d62a', '54188262bc4d591ba438d62a', '2016-06-01', '2016-06-01');
    end if;

    -- masterIntegrationFields for bitbucketKeys
    if not exists (select 1 from "masterIntegrationFields" where "id" = 179) then
      insert into "masterIntegrationFields" ("id", "masterIntegrationId", "name", "dataType", "isRequired", "isSecure","createdBy", "updatedBy", "createdAt", "updatedAt")
      values (179, '577de63321333398d11a1118', 'clientId', 'string', true, true,'54188262bc4d591ba438d62a', '54188262bc4d591ba438d62a', '2016-06-01', '2016-06-01');
    end if;

    if not exists (select 1 from "masterIntegrationFields" where "id" = 180) then
      insert into "masterIntegrationFields" ("id", "masterIntegrationId", "name", "dataType", "isRequired", "isSecure","createdBy", "updatedBy", "createdAt", "updatedAt")
      values (180, '577de63321333398d11a1118', 'clientSecret', 'string', true, true,'54188262bc4d591ba438d62a', '54188262bc4d591ba438d62a', '2016-06-01', '2016-06-01');
    end if;

    if not exists (select 1 from "masterIntegrationFields" where "id" = 181) then
      insert into "masterIntegrationFields" ("id", "masterIntegrationId", "name", "dataType", "isRequired", "isSecure","createdBy", "updatedBy", "createdAt", "updatedAt")
      values (181, '577de63321333398d11a1118', 'wwwUrl', 'string', true, true,'54188262bc4d591ba438d62a', '54188262bc4d591ba438d62a', '2016-06-01', '2016-06-01');
    end if;

    if not exists (select 1 from "masterIntegrationFields" where "id" = 182) then
      insert into "masterIntegrationFields" ("id", "masterIntegrationId", "name", "dataType", "isRequired", "isSecure","createdBy", "updatedBy", "createdAt", "updatedAt")
      values (182, '577de63321333398d11a1118', 'providerId', 'string', false, false,'54188262bc4d591ba438d62a', '54188262bc4d591ba438d62a', '2016-06-01', '2016-06-01');
    end if;

    -- masterIntegrationFields for bitbucketServerKeys
    if not exists (select 1 from "masterIntegrationFields" where "id" = 183) then
      insert into "masterIntegrationFields" ("id", "masterIntegrationId", "name", "dataType", "isRequired", "isSecure","createdBy", "updatedBy", "createdAt", "updatedAt")
      values (183, '577de63321333398d11a1119', 'clientId', 'string', true, true,'54188262bc4d591ba438d62a', '54188262bc4d591ba438d62a', '2016-06-01', '2016-06-01');
    end if;

    if not exists (select 1 from "masterIntegrationFields" where "id" = 184) then
      insert into "masterIntegrationFields" ("id", "masterIntegrationId", "name", "dataType", "isRequired", "isSecure","createdBy", "updatedBy", "createdAt", "updatedAt")
      values (184, '577de63321333398d11a1119', 'clientSecret', 'string', true, true,'54188262bc4d591ba438d62a', '54188262bc4d591ba438d62a', '2016-06-01', '2016-06-01');
    end if;

    if not exists (select 1 from "masterIntegrationFields" where "id" = 185) then
      insert into "masterIntegrationFields" ("id", "masterIntegrationId", "name", "dataType", "isRequired", "isSecure","createdBy", "updatedBy", "createdAt", "updatedAt")
      values (185, '577de63321333398d11a1119', 'wwwUrl', 'string', true, true,'54188262bc4d591ba438d62a', '54188262bc4d591ba438d62a', '2016-06-01', '2016-06-01');
    end if;

    if not exists (select 1 from "masterIntegrationFields" where "id" = 186) then
      insert into "masterIntegrationFields" ("id", "masterIntegrationId", "name", "dataType", "isRequired", "isSecure","createdBy", "updatedBy", "createdAt", "updatedAt")
      values (186, '577de63321333398d11a1119', 'providerId', 'string', false, false,'54188262bc4d591ba438d62a', '54188262bc4d591ba438d62a', '2016-06-01', '2016-06-01');
    end if;

    -- masterIntegrationFields for githubEnterpriseKeys
    if not exists (select 1 from "masterIntegrationFields" where "id" = 187) then
      insert into "masterIntegrationFields" ("id", "masterIntegrationId", "name", "dataType", "isRequired", "isSecure","createdBy", "updatedBy", "createdAt", "updatedAt")
      values (187, '507f1f77bcf86cd799431120', 'clientId', 'string', true, true,'54188262bc4d591ba438d62a', '54188262bc4d591ba438d62a', '2016-06-01', '2016-06-01');
    end if;

    if not exists (select 1 from "masterIntegrationFields" where "id" = 188) then
      insert into "masterIntegrationFields" ("id", "masterIntegrationId", "name", "dataType", "isRequired", "isSecure","createdBy", "updatedBy", "createdAt", "updatedAt")
      values (188, '507f1f77bcf86cd799431120', 'clientSecret', 'string', true, true,'54188262bc4d591ba438d62a', '54188262bc4d591ba438d62a', '2016-06-01', '2016-06-01');
    end if;

    if not exists (select 1 from "masterIntegrationFields" where "id" = 189) then
      insert into "masterIntegrationFields" ("id", "masterIntegrationId", "name", "dataType", "isRequired", "isSecure","createdBy", "updatedBy", "createdAt", "updatedAt")
      values (189, '507f1f77bcf86cd799431120', 'wwwUrl', 'string', true, true,'54188262bc4d591ba438d62a', '54188262bc4d591ba438d62a', '2016-06-01', '2016-06-01');
    end if;

    if not exists (select 1 from "masterIntegrationFields" where "id" = 190) then
      insert into "masterIntegrationFields" ("id", "masterIntegrationId", "name", "dataType", "isRequired", "isSecure","createdBy", "updatedBy", "createdAt", "updatedAt")
      values (190, '507f1f77bcf86cd799431120', 'providerId', 'string', false, false,'54188262bc4d591ba438d62a', '54188262bc4d591ba438d62a', '2016-06-01', '2016-06-01');
    end if;

    -- masterIntegrationFields for Hubspot
    if not exists (select 1 from "masterIntegrationFields" where "id" = 191) then
      insert into "masterIntegrationFields" ("id", "masterIntegrationId", "name", "dataType", "isRequired", "isSecure","createdBy", "updatedBy", "createdAt", "updatedAt")
      values (191, '5811a2e9e73d22829eb01121', 'hubspotApiEndPoint', 'string', true, false,'54188262bc4d591ba438d62a', '54188262bc4d591ba438d62a', '2016-06-01', '2016-06-01');
    end if;

    if not exists (select 1 from "masterIntegrationFields" where "id" = 192) then
      insert into "masterIntegrationFields" ("id", "masterIntegrationId", "name", "dataType", "isRequired", "isSecure","createdBy", "updatedBy", "createdAt", "updatedAt")
      values (192, '5811a2e9e73d22829eb01121', 'hubspotApiToken', 'string', true, true,'54188262bc4d591ba438d62a', '54188262bc4d591ba438d62a', '2016-06-01', '2016-06-01');
    end if;

    -- masterIntegrationFields for AZURE_DCOS
    if not exists (select 1 from "masterIntegrationFields" where "id" = 204) then
      insert into "masterIntegrationFields" ("id", "masterIntegrationId", "name", "dataType", "isRequired", "isSecure","createdBy", "updatedBy", "createdAt", "updatedAt")
      values (204, '58ecb1a8f318373d7f5645f4', 'username', 'string', true, false,'54188262bc4d591ba438d62a', '54188262bc4d591ba438d62a', '2016-06-01', '2016-06-01');
    end if;

    if not exists (select 1 from "masterIntegrationFields" where "id" = 205) then
      insert into "masterIntegrationFields" ("id", "masterIntegrationId", "name", "dataType", "isRequired", "isSecure","createdBy", "updatedBy", "createdAt", "updatedAt")
      values (205, '58ecb1a8f318373d7f5645f4', 'url', 'string', true, false,'54188262bc4d591ba438d62a', '54188262bc4d591ba438d62a', '2016-06-01', '2016-06-01');
    end if;

    if not exists (select 1 from "masterIntegrationFields" where "id" = 206) then
      insert into "masterIntegrationFields" ("id", "masterIntegrationId", "name", "dataType", "isRequired", "isSecure","createdBy", "updatedBy", "createdAt", "updatedAt")
      values (206, '58ecb1a8f318373d7f5645f4', 'dcosPublicKey', 'string', false, false,'54188262bc4d591ba438d62a', '54188262bc4d591ba438d62a', '2016-06-01', '2016-06-01');
    end if;

    if not exists (select 1 from "masterIntegrationFields" where "id" = 207) then
      insert into "masterIntegrationFields" ("id", "masterIntegrationId", "name", "dataType", "isRequired", "isSecure","createdBy", "updatedBy", "createdAt", "updatedAt")
      values (207, '58ecb1a8f318373d7f5645f4', 'dcosPrivateKey', 'string', false, true,'54188262bc4d591ba438d62a', '54188262bc4d591ba438d62a', '2016-06-01', '2016-06-01');
    end if;

    -- masterIntegrationFields for gitlabKeys
    if not exists (select 1 from "masterIntegrationFields" where "id" = 198) then
      insert into "masterIntegrationFields" ("id", "masterIntegrationId", "name", "dataType", "isRequired", "isSecure","createdBy", "updatedBy", "createdAt", "updatedAt")
      values (198, '58a160e8c2845c9d5fb82041', 'clientId', 'string', true, false,'54188262bc4d591ba438d62a', '54188262bc4d591ba438d62a', '2017-02-13', '2017-02-13');
    end if;

    if not exists (select 1 from "masterIntegrationFields" where "id" = 199) then
      insert into "masterIntegrationFields" ("id", "masterIntegrationId", "name", "dataType", "isRequired", "isSecure","createdBy", "updatedBy", "createdAt", "updatedAt")
      values (199, '58a160e8c2845c9d5fb82041', 'clientSecret', 'string', true, true,'54188262bc4d591ba438d62a', '54188262bc4d591ba438d62a', '2017-02-13', '2017-02-13');
    end if;

    if not exists (select 1 from "masterIntegrationFields" where "id" = 200) then
      insert into "masterIntegrationFields" ("id", "masterIntegrationId", "name", "dataType", "isRequired", "isSecure","createdBy", "updatedBy", "createdAt", "updatedAt")
      values (200, '58a160e8c2845c9d5fb82041', 'wwwUrl', 'string', true, false,'54188262bc4d591ba438d62a', '54188262bc4d591ba438d62a', '2017-02-13', '2017-02-13');
    end if;

    if not exists (select 1 from "masterIntegrationFields" where "id" = 201) then
      insert into "masterIntegrationFields" ("id", "masterIntegrationId", "name", "dataType", "isRequired", "isSecure","createdBy", "updatedBy", "createdAt", "updatedAt")
      values (201, '58a160e8c2845c9d5fb82041', 'providerId', 'string', false, false,'54188262bc4d591ba438d62a', '54188262bc4d591ba438d62a', '2017-02-13', '2017-02-13');
    end if;

    -- masterIntegrationFields for keyValuePair
    if not exists (select 1 from "masterIntegrationFields" where "id" = 203) then
      insert into "masterIntegrationFields" ("id", "masterIntegrationId", "name", "dataType", "isRequired", "isSecure","createdBy", "updatedBy", "createdAt", "updatedAt")
      values (203, '58a160e8c2845c9d5fb82042', 'envs', 'object', true, false,'54188262bc4d591ba438d62a', '54188262bc4d591ba438d62a', '2017-02-13', '2017-02-13');
    end if;

    -- masterIntegrationFields for Google Cloud
    if not exists (select 1 from "masterIntegrationFields" where "id" = 208) then
      insert into "masterIntegrationFields" ("id", "masterIntegrationId", "name", "dataType", "isRequired", "isSecure","createdBy", "updatedBy", "createdAt", "updatedAt")
      values (208, '58ecb1a8f318373d7f5645f5', 'projectName', 'string', true, false,'54188262bc4d591ba438d62a', '54188262bc4d591ba438d62a', '2016-06-01', '2016-06-01');
    end if;

    if not exists (select 1 from "masterIntegrationFields" where "id" = 209) then
      insert into "masterIntegrationFields" ("id", "masterIntegrationId", "name", "dataType", "isRequired", "isSecure","createdBy", "updatedBy", "createdAt", "updatedAt")
      values (209, '58ecb1a8f318373d7f5645f5', 'serviceAccountEmail', 'string', true, false,'54188262bc4d591ba438d62a', '54188262bc4d591ba438d62a', '2016-06-01', '2016-06-01');
    end if;

    if not exists (select 1 from "masterIntegrationFields" where "id" = 210) then
      insert into "masterIntegrationFields" ("id", "masterIntegrationId", "name", "dataType", "isRequired", "isSecure","createdBy", "updatedBy", "createdAt", "updatedAt")
      values (210, '58ecb1a8f318373d7f5645f5', 'credentialFile', 'string', true, true,'54188262bc4d591ba438d62a', '54188262bc4d591ba438d62a', '2016-06-01', '2016-06-01');
    end if;

    -- masterIntegrationFields for Microsoft Azure
    if not exists (select 1 from "masterIntegrationFields" where "id" = 211) then
      insert into "masterIntegrationFields" ("id", "masterIntegrationId", "name", "dataType", "isRequired", "isSecure","createdBy", "updatedBy", "createdAt", "updatedAt")
      values (211, '58ecb1a8f318373d7f5645f6', 'subscriptionId', 'string', true, false,'54188262bc4d591ba438d62a', '54188262bc4d591ba438d62a', '2016-06-01', '2016-06-01');
    end if;

    if not exists (select 1 from "masterIntegrationFields" where "id" = 212) then
      insert into "masterIntegrationFields" ("id", "masterIntegrationId", "name", "dataType", "isRequired", "isSecure","createdBy", "updatedBy", "createdAt", "updatedAt")
      values (212, '58ecb1a8f318373d7f5645f6', 'username', 'string', true, false,'54188262bc4d591ba438d62a', '54188262bc4d591ba438d62a', '2016-06-01', '2016-06-01');
    end if;

    if not exists (select 1 from "masterIntegrationFields" where "id" = 213) then
      insert into "masterIntegrationFields" ("id", "masterIntegrationId", "name", "dataType", "isRequired", "isSecure","createdBy", "updatedBy", "createdAt", "updatedAt")
      values (213, '58ecb1a8f318373d7f5645f6', 'password', 'string', true, true,'54188262bc4d591ba438d62a', '54188262bc4d591ba438d62a', '2016-06-01', '2016-06-01');
    end if;

    -- masterIntegrationFields for Digital Ocean
    if not exists (select 1 from "masterIntegrationFields" where "id" = 214) then
      insert into "masterIntegrationFields" ("id", "masterIntegrationId", "name", "dataType", "isRequired", "isSecure","createdBy", "updatedBy", "createdAt", "updatedAt")
      values (214, '58ecb1a8f318373d7f5645f7', 'apiToken', 'string', true, true,'54188262bc4d591ba438d62a', '54188262bc4d591ba438d62a', '2016-06-01', '2016-06-01');
    end if;

    -- these masterIntegrationFields (rabbitmq, url, and additional gitlabCreds fields) are not in base

    -- masterIntegrationFields for rabbitmqCreds
    if not exists (select 1 from "masterIntegrationFields" where "id" = 215) then
      insert into "masterIntegrationFields" ("id", "masterIntegrationId", "name", "dataType", "isRequired", "isSecure","createdBy", "updatedBy", "createdAt", "updatedAt")
      values (215, '589528a99ce3dd1000a94b06', 'amqpUrl', 'string', true, false,'54188262bc4d591ba438d62a', '54188262bc4d591ba438d62a', '2016-06-01', '2016-06-01');
    end if;

    if not exists (select 1 from "masterIntegrationFields" where "id" = 216) then
      insert into "masterIntegrationFields" ("id", "masterIntegrationId", "name", "dataType", "isRequired", "isSecure","createdBy", "updatedBy", "createdAt", "updatedAt")
      values (216, '589528a99ce3dd1000a94b06', 'amqpUrlRoot', 'string', true, false,'54188262bc4d591ba438d62a', '54188262bc4d591ba438d62a', '2016-06-01', '2016-06-01');
    end if;

    if not exists (select 1 from "masterIntegrationFields" where "id" = 217) then
      insert into "masterIntegrationFields" ("id", "masterIntegrationId", "name", "dataType", "isRequired", "isSecure","createdBy", "updatedBy", "createdAt", "updatedAt")
      values (217, '589528a99ce3dd1000a94b06', 'amqpUrlAdmin', 'string', true, false,'54188262bc4d591ba438d62a', '54188262bc4d591ba438d62a', '2016-06-01', '2016-06-01');
    end if;

    if not exists (select 1 from "masterIntegrationFields" where "id" = 218) then
      insert into "masterIntegrationFields" ("id", "masterIntegrationId", "name", "dataType", "isRequired", "isSecure","createdBy", "updatedBy", "createdAt", "updatedAt")
      values (218, '589528a99ce3dd1000a94b06', 'amqpDefaultExchange', 'string', true, false,'54188262bc4d591ba438d62a', '54188262bc4d591ba438d62a', '2016-06-01', '2016-06-01');
    end if;

    if not exists (select 1 from "masterIntegrationFields" where "id" = 219) then
      insert into "masterIntegrationFields" ("id", "masterIntegrationId", "name", "dataType", "isRequired", "isSecure","createdBy", "updatedBy", "createdAt", "updatedAt")
      values (219, '589528a99ce3dd1000a94b06', 'rootQueueList', 'string', true, false,'54188262bc4d591ba438d62a', '54188262bc4d591ba438d62a', '2016-06-01', '2016-06-01');
    end if;

    -- masterIntegrationFields for url
    if not exists (select 1 from "masterIntegrationFields" where "id" = 220) then
      insert into "masterIntegrationFields" ("id", "masterIntegrationId", "name", "dataType", "isRequired", "isSecure","createdBy", "updatedBy", "createdAt", "updatedAt")
      values (220, '589528aa9ce3dd1000a94b1c', 'url', 'string', true, false, '54188262bc4d591ba438d62a', '54188262bc4d591ba438d62a', '2016-06-01', '2016-06-01');
    end if;

    if not exists (select 1 from "masterIntegrationFields" where "id" = 221) then
      insert into "masterIntegrationFields" ("id", "masterIntegrationId", "name", "dataType", "isRequired", "isSecure","createdBy", "updatedBy", "createdAt", "updatedAt")
      values (221, '589528aa9ce3dd1000a94b1c', 'providerId', 'string', false, false,'54188262bc4d591ba438d62a', '54188262bc4d591ba438d62a', '2016-06-01', '2016-06-01');
    end if;

    -- additional masterIntegrationFields for gitlabCreds
    if not exists (select 1 from "masterIntegrationFields" where "id" = 222) then
      insert into "masterIntegrationFields" ("id", "masterIntegrationId", "name", "dataType", "isRequired", "isSecure","createdBy", "updatedBy", "createdAt", "updatedAt")
      values (222, '574ee696d49b091400b71112', 'sshPort', 'string', true, false,'54188262bc4d591ba438d62a', '54188262bc4d591ba438d62a', '2016-06-01', '2016-06-01');
    end if;

    if not exists (select 1 from "masterIntegrationFields" where "id" = 223) then
      insert into "masterIntegrationFields" ("id", "masterIntegrationId", "name", "dataType", "isRequired", "isSecure","createdBy", "updatedBy", "createdAt", "updatedAt")
      values (223, '574ee696d49b091400b71112', 'subscriptionProjectLimit', 'string', true, false,'54188262bc4d591ba438d62a', '54188262bc4d591ba438d62a', '2016-06-01', '2016-06-01');
    end if;

    -- Fields for Git Credential integration
    if not exists (select 1 from "masterIntegrationFields" where "id" = 224) then
      insert into "masterIntegrationFields" ("id", "masterIntegrationId", "name", "dataType", "isRequired", "isSecure","createdBy", "updatedBy", "createdAt", "updatedAt")
      values (224, '596d9b49fa1a3f979c10b5a5', 'host', 'string', true, false, '54188262bc4d591ba438d62a', '54188262bc4d591ba438d62a', '2016-06-01', '2016-06-01');
    end if;

    if not exists (select 1 from "masterIntegrationFields" where "id" = 225) then
      insert into "masterIntegrationFields" ("id", "masterIntegrationId", "name", "dataType", "isRequired", "isSecure","createdBy", "updatedBy", "createdAt", "updatedAt")
      values (225, '596d9b49fa1a3f979c10b5a5', 'port', 'string', true, false, '54188262bc4d591ba438d62a', '54188262bc4d591ba438d62a', '2016-06-01', '2016-06-01');
    end if;

    if not exists (select 1 from "masterIntegrationFields" where "id" = 226) then
      insert into "masterIntegrationFields" ("id", "masterIntegrationId", "name", "dataType", "isRequired", "isSecure","createdBy", "updatedBy", "createdAt", "updatedAt")
      values (226, '596d9b49fa1a3f979c10b5a5', 'username', 'string', true, false, '54188262bc4d591ba438d62a', '54188262bc4d591ba438d62a', '2016-06-01', '2016-06-01');
    end if;

    if not exists (select 1 from "masterIntegrationFields" where "id" = 227) then
      insert into "masterIntegrationFields" ("id", "masterIntegrationId", "name", "dataType", "isRequired", "isSecure","createdBy", "updatedBy", "createdAt", "updatedAt")
      values (227, '596d9b49fa1a3f979c10b5a5', 'password', 'string', true, true, '54188262bc4d591ba438d62a', '54188262bc4d591ba438d62a', '2016-06-01', '2016-06-01');
    end if;

    -- Fields for sshKey integration
    if not exists (select 1 from "masterIntegrationFields" where "id" = 228) then
      insert into "masterIntegrationFields" ("id", "masterIntegrationId", "name", "dataType", "isRequired", "isSecure","createdBy", "updatedBy", "createdAt", "updatedAt")
      values (228, '596d9b49fa1a3f979c10b5a6', 'publicKey', 'string', true, false,'54188262bc4d591ba438d62a', '54188262bc4d591ba438d62a', '2016-06-01', '2016-06-01');
    end if;

    if not exists (select 1 from "masterIntegrationFields" where "id" = 229) then
      insert into "masterIntegrationFields" ("id", "masterIntegrationId", "name", "dataType", "isRequired", "isSecure","createdBy", "updatedBy", "createdAt", "updatedAt")
      values (229, '596d9b49fa1a3f979c10b5a6', 'privateKey', 'string', true, true,'54188262bc4d591ba438d62a', '54188262bc4d591ba438d62a', '2016-06-01', '2016-06-01');
    end if;

    -- masterIntegrationFields for artifactoryKey
    if not exists (select 1 from "masterIntegrationFields" where "id" = 231) then
      insert into "masterIntegrationFields" ("id", "masterIntegrationId", "name", "dataType", "isRequired", "isSecure","createdBy", "updatedBy", "createdAt", "updatedAt")
      values (231, '596d9b49fa1a3f979c10b5a7', 'username', 'string', true, false,'54188262bc4d591ba438d62a', '54188262bc4d591ba438d62a', '2016-06-01', '2016-06-01');
    end if;

    if not exists (select 1 from "masterIntegrationFields" where "id" = 232) then
      insert into "masterIntegrationFields" ("id", "masterIntegrationId", "name", "dataType", "isRequired", "isSecure","createdBy", "updatedBy", "createdAt", "updatedAt")
      values (232, '596d9b49fa1a3f979c10b5a7', 'password', 'string', true, true,'54188262bc4d591ba438d62a', '54188262bc4d591ba438d62a', '2016-06-01', '2016-06-01');
    end if;

    if not exists (select 1 from "masterIntegrationFields" where "id" = 233) then
      insert into "masterIntegrationFields" ("id", "masterIntegrationId", "name", "dataType", "isRequired", "isSecure","createdBy", "updatedBy", "createdAt", "updatedAt")
      values (233, '596d9b49fa1a3f979c10b5a7', 'url', 'string', true, false,'54188262bc4d591ba438d62a', '54188262bc4d591ba438d62a', '2016-06-01', '2016-06-01');
    end if;

    -- Fields for quayLogin
    if not exists (select 1 from "masterIntegrationFields" where "id" = 234) then
      insert into "masterIntegrationFields" ("id", "masterIntegrationId", "name", "dataType", "isRequired", "isSecure","createdBy", "updatedBy", "createdAt", "updatedAt")
      values (234, '580ee981a337bd12008fc43f', 'url', 'string', true, false,'54188262bc4d591ba438d62a', '54188262bc4d591ba438d62a', '2017-10-04', '2017-10-04');
    end if;

    if not exists (select 1 from "masterIntegrationFields" where "id" = 235) then
      insert into "masterIntegrationFields" ("id", "masterIntegrationId", "name", "dataType", "isRequired", "isSecure","createdBy", "updatedBy", "createdAt", "updatedAt")
      values (235, '580ee981a337bd12008fc43f', 'username', 'string', true, false,'54188262bc4d591ba438d62a', '54188262bc4d591ba438d62a', '2017-10-04', '2017-10-04');
    end if;

    if not exists (select 1 from "masterIntegrationFields" where "id" = 236) then
      insert into "masterIntegrationFields" ("id", "masterIntegrationId", "name", "dataType", "isRequired", "isSecure","createdBy", "updatedBy", "createdAt", "updatedAt")
      values (236, '580ee981a337bd12008fc43f', 'password', 'string', true, true,'54188262bc4d591ba438d62a', '54188262bc4d591ba438d62a', '2017-10-04', '2017-10-04');
    end if;

    if not exists (select 1 from "masterIntegrationFields" where "id" = 237) then
      insert into "masterIntegrationFields" ("id", "masterIntegrationId", "name", "dataType", "isRequired", "isSecure","createdBy", "updatedBy", "createdAt", "updatedAt")
      values (237, '580ee981a337bd12008fc43f', 'email', 'string', true, false,'54188262bc4d591ba438d62a', '54188262bc4d591ba438d62a', '2017-10-04', '2017-10-04');
    end if;

    if not exists (select 1 from "masterIntegrationFields" where "id" = 238) then
      insert into "masterIntegrationFields" ("id", "masterIntegrationId", "name", "dataType", "isRequired", "isSecure","createdBy", "updatedBy", "createdAt", "updatedAt")
      values (238, '580ee981a337bd12008fc43f', 'accessToken', 'string', true, false,'54188262bc4d591ba438d62a', '54188262bc4d591ba438d62a', '2017-10-04', '2017-10-04');
    end if;

    -- masterIntegrationFields for hipchatKey
    if not exists (select 1 from "masterIntegrationFields" where "id" = 239) then
      insert into "masterIntegrationFields" ("id", "masterIntegrationId", "name", "dataType", "isRequired", "isSecure","createdBy", "updatedBy", "createdAt", "updatedAt")
      values (239, '59df56e9b3a7f6d8361c226a', 'token', 'string', true, false,'54188262bc4d591ba438d62a', '54188262bc4d591ba438d62a', '2017-10-12', '2017-10-12');
    end if;

    -- masterIntegrationFields for gcloudKey
    if not exists (select 1 from "masterIntegrationFields" where "id" = 240) then
      insert into "masterIntegrationFields" ("id", "masterIntegrationId", "name", "dataType", "isRequired", "isSecure","createdBy", "updatedBy", "createdAt", "updatedAt")
      values (240, '59df35075ece921592b443f6', 'JSON_key', 'string', true, false,'54188262bc4d591ba438d62a', '54188262bc4d591ba438d62a', '2016-06-01', '2016-06-01');
    end if;

    -- Fields for dockerRegistryLogin
    if not exists (select 1 from "masterIntegrationFields" where "id" = 241) then
      insert into "masterIntegrationFields" ("id", "masterIntegrationId", "name", "dataType", "isRequired", "isSecure","createdBy", "updatedBy", "createdAt", "updatedAt")
      values (241, '59d5e0104bfbba06001df4d6', 'url', 'string', false, false,'54188262bc4d591ba438d62a', '54188262bc4d591ba438d62a', '2017-10-13', '2017-10-13');
    end if;

    if not exists (select 1 from "masterIntegrationFields" where "id" = 242) then
      insert into "masterIntegrationFields" ("id", "masterIntegrationId", "name", "dataType", "isRequired", "isSecure","createdBy", "updatedBy", "createdAt", "updatedAt")
      values (242, '59d5e0104bfbba06001df4d6', 'username', 'string', true, false,'54188262bc4d591ba438d62a', '54188262bc4d591ba438d62a', '2017-10-13', '2017-10-13');
    end if;

    if not exists (select 1 from "masterIntegrationFields" where "id" = 243) then
      insert into "masterIntegrationFields" ("id", "masterIntegrationId", "name", "dataType", "isRequired", "isSecure","createdBy", "updatedBy", "createdAt", "updatedAt")
      values (243, '59d5e0104bfbba06001df4d6', 'password', 'string', true, true,'54188262bc4d591ba438d62a', '54188262bc4d591ba438d62a', '2017-10-14', '2017-10-14');
    end if;

    if not exists (select 1 from "masterIntegrationFields" where "id" = 244) then
      insert into "masterIntegrationFields" ("id", "masterIntegrationId", "name", "dataType", "isRequired", "isSecure","createdBy", "updatedBy", "createdAt", "updatedAt")
      values (244, '59d5e0104bfbba06001df4d6', 'email', 'string', true, false,'54188262bc4d591ba438d62a', '54188262bc4d591ba438d62a', '2017-10-15', '2017-10-15');
    end if;

    -- masterIntegrationFields for slackKey
    if not exists (select 1 from "masterIntegrationFields" where "id" = 245) then
      insert into "masterIntegrationFields" ("id", "masterIntegrationId", "name", "dataType", "isRequired", "isSecure","createdBy", "updatedBy", "createdAt", "updatedAt")
      values (245, '59eee00ef7bcf03ff7b62fc7', 'webhookUrl', 'string', true, false,'54188262bc4d591ba438d62a', '54188262bc4d591ba438d62a', '2017-10-24', '2017-10-24');
    end if;

    -- masterIntegrationFields for nodeCluster
    if not exists (select 1 from "masterIntegrationFields" where "id" = 246) then
      insert into "masterIntegrationFields" ("id", "masterIntegrationId", "name", "dataType", "isRequired", "isSecure","createdBy", "updatedBy", "createdAt", "updatedAt")
      values (246, '59eee00ef7bcf03ff7b62fc8', 'nodes', 'array', true, false, '54188262bc4d591ba438d62a', '54188262bc4d591ba438d62a', '2017-10-25', '2017-10-25');
    end if;

    if not exists (select 1 from "masterIntegrationFields" where "id" = 247) then
      insert into "masterIntegrationFields" ("id", "masterIntegrationId", "name", "dataType", "isRequired", "isSecure","createdBy", "updatedBy", "createdAt", "updatedAt")
      values (247, '59eee00ef7bcf03ff7b62fc8', 'publicKey', 'string', false, false, '54188262bc4d591ba438d62a', '54188262bc4d591ba438d62a', '2017-10-25', '2017-10-25');
    end if;

    if not exists (select 1 from "masterIntegrationFields" where "id" = 248) then
      insert into "masterIntegrationFields" ("id", "masterIntegrationId", "name", "dataType", "isRequired", "isSecure","createdBy", "updatedBy", "createdAt", "updatedAt")
      values (248, '59eee00ef7bcf03ff7b62fc8', 'privateKey', 'string', false, true, '54188262bc4d591ba438d62a', '54188262bc4d591ba438d62a', '2017-10-25', '2017-10-25');
    end if;

    -- masterIntegrationFields for azureDcosKey
    if not exists (select 1 from "masterIntegrationFields" where "id" = 249) then
      insert into "masterIntegrationFields" ("id", "masterIntegrationId", "name", "dataType", "isRequired", "isSecure","createdBy", "updatedBy", "createdAt", "updatedAt")
      values (249, '59eee00ef7bcf03ff7b62fc9', 'username', 'string', true, false, '54188262bc4d591ba438d62a', '54188262bc4d591ba438d62a', '2017-10-31', '2017-10-31');
    end if;

    if not exists (select 1 from "masterIntegrationFields" where "id" = 250) then
      insert into "masterIntegrationFields" ("id", "masterIntegrationId", "name", "dataType", "isRequired", "isSecure","createdBy", "updatedBy", "createdAt", "updatedAt")
      values (250, '59eee00ef7bcf03ff7b62fc9', 'url', 'string', true, false, '54188262bc4d591ba438d62a', '54188262bc4d591ba438d62a', '2017-10-31', '2017-10-31');
    end if;

    if not exists (select 1 from "masterIntegrationFields" where "id" = 251) then
      insert into "masterIntegrationFields" ("id", "masterIntegrationId", "name", "dataType", "isRequired", "isSecure","createdBy", "updatedBy", "createdAt", "updatedAt")
      values (251, '59eee00ef7bcf03ff7b62fc9', 'dcosPublicKey', 'string', false, false, '54188262bc4d591ba438d62a', '54188262bc4d591ba438d62a', '2017-10-31', '2017-10-31');
    end if;

    if not exists (select 1 from "masterIntegrationFields" where "id" = 252) then
      insert into "masterIntegrationFields" ("id", "masterIntegrationId", "name", "dataType", "isRequired", "isSecure","createdBy", "updatedBy", "createdAt", "updatedAt")
      values (252, '59eee00ef7bcf03ff7b62fc9', 'dcosPrivateKey', 'string', false, true, '54188262bc4d591ba438d62a', '54188262bc4d591ba438d62a', '2017-10-31', '2017-10-31');
    end if;

    -- masterIntegrationFields for amazonIamRole
    if not exists (select 1 from "masterIntegrationFields" where "id" = 253) then
      insert into "masterIntegrationFields" ("id", "masterIntegrationId", "name", "dataType", "isRequired", "isSecure","createdBy", "updatedBy", "createdAt", "updatedAt")
      values (253, '59eee00ef7bcf03ff7b62fd0', 'assumeRoleARN', 'string', true, false,'54188262bc4d591ba438d62a', '54188262bc4d591ba438d62a', '2017-10-31', '2017-10-31');
    end if;

    if not exists (select 1 from "masterIntegrationFields" where "id" = 254) then
      insert into "masterIntegrationFields" ("id", "masterIntegrationId", "name", "dataType", "isRequired", "isSecure","createdBy", "updatedBy", "createdAt", "updatedAt")
      values (254, '59eee00ef7bcf03ff7b62fd0', 'output', 'string', true, false,'54188262bc4d591ba438d62a', '54188262bc4d591ba438d62a', '2017-10-31', '2017-10-31');
    end if;

    if not exists (select 1 from "masterIntegrationFields" where "id" = 255) then
      insert into "masterIntegrationFields" ("id", "masterIntegrationId", "name", "dataType", "isRequired", "isSecure","createdBy", "updatedBy", "createdAt", "updatedAt")
      values (255, '59eee00ef7bcf03ff7b62fd0', 'url', 'string', true, false,'54188262bc4d591ba438d62a', '54188262bc4d591ba438d62a', '2017-10-31', '2017-10-31');
    end if;

    -- masterIntegrationFields for ddcKey
    if not exists (select 1 from "masterIntegrationFields" where "id" = 256) then
      insert into "masterIntegrationFields" ("id", "masterIntegrationId", "name", "dataType", "isRequired", "isSecure","createdBy", "updatedBy", "createdAt", "updatedAt")
      values (256, '59e71aa80552d20500e76ba8', 'username', 'string', true, false,'54188262bc4d591ba438d62a', '54188262bc4d591ba438d62a', '2017-10-31', '2017-10-31');
    end if;

    if not exists (select 1 from "masterIntegrationFields" where "id" = 257) then
      insert into "masterIntegrationFields" ("id", "masterIntegrationId", "name", "dataType", "isRequired", "isSecure","createdBy", "updatedBy", "createdAt", "updatedAt")
      values (257, '59e71aa80552d20500e76ba8', 'password', 'string', true, true,'54188262bc4d591ba438d62a', '54188262bc4d591ba438d62a', '2017-10-31', '2017-10-31');
    end if;

    if not exists (select 1 from "masterIntegrationFields" where "id" = 258) then
      insert into "masterIntegrationFields" ("id", "masterIntegrationId", "name", "dataType", "isRequired", "isSecure","createdBy", "updatedBy", "createdAt", "updatedAt")
      values (258, '59e71aa80552d20500e76ba8', 'url', 'string', true, false,'54188262bc4d591ba438d62a', '54188262bc4d591ba438d62a', '2017-10-31', '2017-10-31');
    end if;

    -- masterIntegrationFields for webhookV2

    if not exists (select 1 from "masterIntegrationFields" where "id" = 259) then
      insert into "masterIntegrationFields" ("id", "masterIntegrationId", "name", "dataType", "isRequired", "isSecure","createdBy", "updatedBy", "createdAt", "updatedAt")
      values (259, '59e71aa80552d20500e76ba9', 'webhookURL', 'string', true, false, '54188262bc4d591ba438d62a', '54188262bc4d591ba438d62a', '2017-11-03', '2017-11-03');
    end if;

    if not exists (select 1 from "masterIntegrationFields" where "id" = 260) then
      insert into "masterIntegrationFields" ("id", "masterIntegrationId", "name", "dataType", "isRequired", "isSecure","createdBy", "updatedBy", "createdAt", "updatedAt")
      values (260, '59e71aa80552d20500e76ba9', 'authorization', 'string', false, false, '54188262bc4d591ba438d62a', '54188262bc4d591ba438d62a', '2017-11-03', '2017-11-03');
    end if;

    -- masterIntegrationFields for dclKey
    if not exists (select 1 from "masterIntegrationFields" where "id" = 262) then
      insert into "masterIntegrationFields" ("id", "masterIntegrationId", "name", "dataType", "isRequired", "isSecure","createdBy", "updatedBy", "createdAt", "updatedAt")
      values (262, '59faf7b67fb80d78e55245bb', 'username', 'string', true, false,'54188262bc4d591ba438d62a', '54188262bc4d591ba438d62a', '2017-10-31', '2017-10-31');
    end if;

    if not exists (select 1 from "masterIntegrationFields" where "id" = 263) then
      insert into "masterIntegrationFields" ("id", "masterIntegrationId", "name", "dataType", "isRequired", "isSecure","createdBy", "updatedBy", "createdAt", "updatedAt")
      values (263, '59faf7b67fb80d78e55245bb', 'token', 'string', true, false,'54188262bc4d591ba438d62a', '54188262bc4d591ba438d62a', '2017-10-31', '2017-10-31');
    end if;

    if not exists (select 1 from "masterIntegrationFields" where "id" = 264) then
      insert into "masterIntegrationFields" ("id", "masterIntegrationId", "name", "dataType", "isRequired", "isSecure","createdBy", "updatedBy", "createdAt", "updatedAt")
      values (264, '59faf7b67fb80d78e55245bb', 'url', 'string', true, false,'54188262bc4d591ba438d62a', '54188262bc4d591ba438d62a', '2017-10-31', '2017-10-31');
    end if;

    -- END adding master integration fields

    -- Remove masterIntegrationFields

    -- Remove masterIntegrationFields for Vault
    delete from "masterIntegrationFields" where "masterIntegrationId"= (select id from "masterIntegrations" where "typeCode" = 5006 and
    "name" = 'VAULT');

    -- Remove old masterIntegrationFields from amazons3
    delete from "masterIntegrationFields" where "masterIntegrationId"= (select id from "masterIntegrations" where "typeCode" = 5005 and
    "name" = 'amazons3');

    -- Remove old masterIntegrationFields from github auth
    delete from "masterIntegrationFields" where id in (76, 77, 78);

    -- Remove redundant masterIntegrationFields from bitbucket auth
    delete from "masterIntegrationFields" where id in (82, 83, 84);

    -- Remove old masterIntegrationFields from bitbucket server auth
    delete from "masterIntegrationFields" where id in (95, 96, 98, 99, 100, 101);

    -- Remove old masterIntegrationFields from github enterprise auth
    delete from "masterIntegrationFields" where id in (104, 105, 106);

    -- remove masterIntegrationFields for clearbitKeys. Delete using objectId()
    if exists (select 1 from "masterIntegrationFields" where "masterIntegrationId" = '58c78481e34468d32114e125' and name = 'clearbitApiToken') then
      delete from "masterIntegrationFields" where "masterIntegrationId"= '58c78481e34468d32114e125';
    end if;

    -- Add masterIntegrationFields for pemKey
    if not exists (select 1 from "masterIntegrationFields" where "id" = 230) then
      insert into "masterIntegrationFields" ("id", "masterIntegrationId", "name", "dataType", "isRequired", "isSecure","createdBy", "updatedBy", "createdAt", "updatedAt")
      values (230, '59d3692f0c3f421becfae3f0', 'key', 'string', true, true,'54188262bc4d591ba438d62a', '54188262bc4d591ba438d62a', '2016-06-01', '2016-06-01');
    end if;

    -- Removing redundant master integrations

    -- AWS-ROOT
    if exists (select 1 from "masterIntegrations" where "name" = 'AWS' and "typeCode" = 5005 and "id" = '57467326b3cbfc0c004f9110') then
      delete from "masterIntegrationFields" where "masterIntegrationId" = '57467326b3cbfc0c004f9110';
    end if;

    -- SMTP
    if exists (select 1 from "masterIntegrations" where "name" = 'SMTP' and "typeCode" = 5003 and "id" = '57cea8056ce9c71800d31ab3') then
      delete from "masterIntegrationFields" where "masterIntegrationId" = '57cea8056ce9c71800d31ab3';
    end if;

    -- github auth
    if exists (select 1 from "masterIntegrations" where "name" = 'github' and "typeCode" = 5007 and "id" = '577de63321333398d11a35ac') then
      delete from "masterIntegrationFields" where "masterIntegrationId" = '577de63321333398d11a35ac';
    end if;

    -- bitbucket auth
    if exists (select 1 from "masterIntegrations" where "name" = 'bitbucket' and "typeCode" = 5007 and "id" = '577de63321333398d11a35ad') then
      delete from "masterIntegrationFields" where "masterIntegrationId" = '577de63321333398d11a35ad';
    end if;

    -- bitbucket server auth
    if exists (select 1 from "masterIntegrations" where "name" = 'bitbucketServer' and "typeCode" = 5007 and "id" = '577de63321333398d11a35ae') then
      delete from "masterIntegrationFields" where "masterIntegrationId" = '577de63321333398d11a35ae';
    end if;

    -- github enterprise auth
    if exists (select 1 from "masterIntegrations" where "name" = 'ghe' and "typeCode" = 5007 and "id" = '507f1f77bcf86cd799439011') then
      delete from "masterIntegrationFields" where "masterIntegrationId" = '507f1f77bcf86cd799439011';
    end if;

    -- Braintree
    if exists (select 1 from "masterIntegrations" where "name" = 'braintree' and "typeCode" = 5008 and "id" = '57aafd0673ea26cb053fe1ca') then
      delete from "masterIntegrationFields" where "masterIntegrationId" = '57aafd0673ea26cb053fe1ca';
    end if;

    -- Gmail
    if exists (select 1 from "masterIntegrations" where "name" = 'gmail' and "typeCode" = 5003 and "id" = '57e8ea9c14d3ef88e56fecb4') then
      delete from "masterIntegrationFields" where "masterIntegrationId" = '57e8ea9c14d3ef88e56fecb4';
    end if;

    -- Hubspot
    if exists (select 1 from "masterIntegrations" where "name" = 'hubspot' and "typeCode" = 5011 and "id" = '5811a2e9e73d22829eb0ab3c') then
      delete from "masterIntegrationFields" where "masterIntegrationId" = '5811a2e9e73d22829eb0ab3c';
    end if;

    -- Mailgun
    if exists (select 1 from "masterIntegrations" where "name" = 'mailgun' and "typeCode" = 5003 and "id" = '57e8ea91424bff9c871d7321') then
      delete from "masterIntegrationFields" where "masterIntegrationId" = '57e8ea91424bff9c871d7321';
    end if;

    -- Git Store
    if exists (select 1 from "masterIntegrations" where "name" = 'Git store' and "typeCode" = 5000 and "id" = '574ee696d49b091400b75f19') then
      delete from "masterIntegrationFields" where "masterIntegrationId" = '574ee696d49b091400b75f19';
    end if;

    -- END removing redundant master integrations

    -- Drop S3 artifacts masterIntegrationFields
    if exists (select 1 from information_schema.columns where table_name = 'masterIntegrationFields') then
      delete from "masterIntegrationFields" where id in (134, 135, 136);
    end if;

    -- END removing masterIntegrationFields


    -- Update masterIntegrationFields

    -- Update the name for masterIntegrationFields
    if exists (select 1 from "masterIntegrationFields" where "id" = 116) then
      update "masterIntegrationFields" set "name"='password' where "id"= 116;
    end if;

    -- username is no longer a required field for bitbucketServer account integrations
    update "masterIntegrationFields" set "isRequired" = false where "id" = 54;

    -- "port" is not a required field for github auth master integration
    update "masterIntegrationFields" set "isRequired" = false where "id" = 77;

    -- "port" is not a required field for bitbucket auth master integration
    update "masterIntegrationFields" set "isRequired" = false where "id" = 83;

  end
$$;
