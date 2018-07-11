do $$
  begin

    if not exists (select 1 from information_schema.columns where table_name = 'systemCodes') then
    -- This is the base table, do not add any fields here. Add them below.
      create table "systemCodes" (
        "code" INT PRIMARY KEY,
        "name" VARCHAR(255) NOT NULL,
        "group" VARCHAR(255) NOT NULL,
        "createdBy" VARCHAR(24) NOT NULL,
        "updatedBy" VARCHAR(24) NOT NULL,
        "createdAt" timestamp with time zone NOT NULL,
        "updatedAt" timestamp with time zone NOT NULL
      );
    end if;

    -- Remove systemCodes.id and set code as primary key
    if exists (select 1 from information_schema.columns where table_name = 'systemCodes' and column_name = 'id') then
      alter table "systemCodes" drop column id;
      alter table "systemCodes" add constraint "systemCodes_pkey" primary key (code);
    end if;

    -- Remove systemCodes.propertyBag
    if exists (select 1 from information_schema.columns where table_name = 'systemCodes' and column_name = 'propertyBag') then
      alter table "systemCodes" drop column "propertyBag";
    end if;

    -- Add systemCodeCodeU index
    if not exists (select 1 from pg_indexes where tablename = 'systemCodes' and indexname = 'systemCodeCodeU') then
      create unique index "systemCodeCodeU" on "systemCodes" using btree("code");
    end if;

    -- Add systemCodeGroupNameU index
    if not exists (select 1 from pg_indexes where tablename = 'systemCodes' and indexname = 'systemCodeGroupNameU') then
      create unique index "systemCodeGroupNameU" on "systemCodes" using btree("group", name);
    end if;

    -- Add systemCodeGroupI index
    if not exists (select 1 from pg_indexes where tablename = 'systemCodes' and indexname = 'systemCodeGroupI') then
      create index "systemCodeGroupI" on "systemCodes" using btree("group");
    end if;

    -- insert all systemCodes
    if not exists (select 1 from "systemCodes" where code = 1000) then
      insert into "systemCodes" ("code", "name", "group", "createdBy", "updatedBy", "createdAt", "updatedAt")
      values (1000, 'gitRepo', 'resource', '54188262bc4d591ba438d62a', '54188262bc4d591ba438d62a', '2016-06-01', '2016-06-01');
    end if;

    if not exists (select 1 from "systemCodes" where code = 1001) then
      insert into "systemCodes" ("code", "name", "group", "createdBy", "updatedBy", "createdAt", "updatedAt")
      values (1001, 'image', 'resource', '54188262bc4d591ba438d62a', '54188262bc4d591ba438d62a', '2016-06-01', '2016-06-01');
    end if;

    if not exists (select 1 from "systemCodes" where code = 1003) then
      insert into "systemCodes" ("code", "name", "group", "createdBy", "updatedBy", "createdAt", "updatedAt")
      values (1003, 'dockerOptions', 'resource', '54188262bc4d591ba438d62a', '54188262bc4d591ba438d62a', '2016-06-01', '2016-06-01');
    end if;

    if not exists (select 1 from "systemCodes" where code = 1004) then
      insert into "systemCodes" ("code", "name", "group", "createdBy", "updatedBy", "createdAt", "updatedAt")
      values (1004, 'params', 'resource', '54188262bc4d591ba438d62a', '54188262bc4d591ba438d62a', '2016-06-01', '2016-06-01');
    end if;

    if not exists (select 1 from "systemCodes" where code = 1006) then
      insert into "systemCodes" ("code", "name", "group", "createdBy", "updatedBy", "createdAt", "updatedAt")
      values (1006, 'replicas', 'resource', '54188262bc4d591ba438d62a', '54188262bc4d591ba438d62a', '2016-06-01', '2016-06-01');
    end if;

    if not exists (select 1 from "systemCodes" where code = 1008) then
      insert into "systemCodes" ("code", "name", "group", "createdBy", "updatedBy", "createdAt", "updatedAt")
      values (1008, 'kickStart', 'resource', '54188262bc4d591ba438d62a', '54188262bc4d591ba438d62a', '2016-06-01', '2016-06-01');
    end if;

    if not exists (select 1 from "systemCodes" where code = 1010) then
      insert into "systemCodes" ("code", "name", "group", "createdBy", "updatedBy", "createdAt", "updatedAt")
      values (1010, 'time', 'resource', '54188262bc4d591ba438d62a', '54188262bc4d591ba438d62a', '2016-06-01', '2016-06-01');
    end if;

    if not exists (select 1 from "systemCodes" where code = 1012) then
      insert into "systemCodes" ("code", "name", "group", "createdBy", "updatedBy", "createdAt", "updatedAt")
      values (1012, 'version', 'resource', '54188262bc4d591ba438d62a', '54188262bc4d591ba438d62a', '2016-06-01', '2016-06-01');
    end if;

    if not exists (select 1 from "systemCodes" where code = 1013) then
      insert into "systemCodes" ("code", "name", "group", "createdBy", "updatedBy", "createdAt", "updatedAt")
      values (1013, 'trigger', 'resource', '54188262bc4d591ba438d62a', '54188262bc4d591ba438d62a', '2016-06-01', '2016-06-01');
    end if;

    if not exists (select 1 from "systemCodes" where code = 1014) then
      insert into "systemCodes" ("code", "name", "group", "createdBy", "updatedBy", "createdAt", "updatedAt")
      values (1014, 'syncRepo', 'resource', '54188262bc4d591ba438d62a', '54188262bc4d591ba438d62a', '2016-06-01', '2016-06-01');
    end if;

    if not exists (select 1 from "systemCodes" where code = 1015) then
      insert into "systemCodes" ("code", "name", "group", "createdBy", "updatedBy", "createdAt", "updatedAt")
      values (1015, 'cluster', 'resource', '54188262bc4d591ba438d62a', '54188262bc4d591ba438d62a', '2016-06-01', '2016-06-01');
    end if;

    if not exists (select 1 from "systemCodes" where code = 1016) then
      insert into "systemCodes" ("code", "name", "group", "createdBy", "updatedBy", "createdAt", "updatedAt")
      values (1016, 'notification', 'resource', '54188262bc4d591ba438d62a', '54188262bc4d591ba438d62a', '2016-06-01', '2016-06-01');
    end if;

    if not exists (select 1 from "systemCodes" where code = 1017) then
      insert into "systemCodes" ("code", "name", "group", "createdBy", "updatedBy", "createdAt", "updatedAt")
      values (1017, 'loadBalancer', 'resource', '54188262bc4d591ba438d62a', '54188262bc4d591ba438d62a', '2016-06-01', '2016-06-01');
    end if;

    if not exists (select 1 from "systemCodes" where code = 1018) then
      insert into "systemCodes" ("code", "name", "group", "createdBy", "updatedBy", "createdAt", "updatedAt")
      values (1018, 'integration', 'resource', '54188262bc4d591ba438d62a', '54188262bc4d591ba438d62a', '2016-06-01', '2016-06-01');
    end if;

    if not exists (select 1 from "systemCodes" where code = 1019) then
      insert into "systemCodes" ("code", "name", "group", "createdBy", "updatedBy", "createdAt", "updatedAt")
      values (1019, 'file', 'resource', '54188262bc4d591ba438d62a', '54188262bc4d591ba438d62a', '2016-06-01', '2016-06-01');
    end if;

    if not exists (select 1 from "systemCodes" where code = 1020) then
      insert into "systemCodes" ("code", "name", "group", "createdBy", "updatedBy", "createdAt", "updatedAt")
      values (1020, 'ciRepo', 'resource', '54188262bc4d591ba438d62a', '54188262bc4d591ba438d62a', '2016-06-01', '2016-06-01');
    end if;

    if not exists (select 1 from "systemCodes" where code = 1021) then
      insert into "systemCodes" ("code", "name", "group", "createdBy", "updatedBy", "createdAt", "updatedAt")
      values (1021, 'cliConfig', 'resource', '54188262bc4d591ba438d62a', '54188262bc4d591ba438d62a', '2016-06-01', '2016-06-01');
    end if;

    if not exists (select 1 from "systemCodes" where code = 1022) then
      insert into "systemCodes" ("code", "name", "group", "createdBy", "updatedBy", "createdAt", "updatedAt")
      values (1022, 'state', 'resource', '54188262bc4d591ba438d62a', '54188262bc4d591ba438d62a', '2016-06-01', '2016-06-01');
    end if;

    if not exists (select 1 from "systemCodes" where code = 1023) then
      insert into "systemCodes" ("code", "name", "group", "createdBy", "updatedBy", "createdAt", "updatedAt")
      values (1023, 'externalCIServer', 'resource', '54188262bc4d591ba438d62a', '54188262bc4d591ba438d62a', '2016-06-01', '2016-06-01');
    end if;

    if not exists (select 1 from "systemCodes" where code = 1024) then
      insert into "systemCodes" ("code", "name", "group", "createdBy", "updatedBy", "createdAt", "updatedAt")
      values (1024, 'webhook', 'resource', '54188262bc4d591ba438d62a', '54188262bc4d591ba438d62a', '2016-06-01', '2016-06-01');
    end if;

    if not exists (select 1 from "systemCodes" where code = 2000) then
      insert into "systemCodes" ("code", "name", "group", "createdBy", "updatedBy", "createdAt", "updatedAt")
      values (2000, 'manifest', 'resource', '54188262bc4d591ba438d62a', '54188262bc4d591ba438d62a', '2016-06-01', '2016-06-01');
    end if;

    if not exists (select 1 from "systemCodes" where code = 2005) then
      insert into "systemCodes" ("code", "name", "group", "createdBy", "updatedBy", "createdAt", "updatedAt")
      values (2005, 'runCI', 'resource', '54188262bc4d591ba438d62a', '54188262bc4d591ba438d62a', '2016-06-01', '2016-06-01');
    end if;

    if not exists (select 1 from "systemCodes" where code = 2007) then
      insert into "systemCodes" ("code", "name", "group", "createdBy", "updatedBy", "createdAt", "updatedAt")
      values (2007, 'runSh', 'resource', '54188262bc4d591ba438d62a', '54188262bc4d591ba438d62a', '2016-06-01', '2016-06-01');
    end if;

    if not exists (select 1 from "systemCodes" where code = 2008) then
      insert into "systemCodes" ("code", "name", "group", "createdBy", "updatedBy", "createdAt", "updatedAt")
      values (2008, 'release', 'resource', '54188262bc4d591ba438d62a', '54188262bc4d591ba438d62a', '2016-06-01', '2016-06-01');
    end if;

    if not exists (select 1 from "systemCodes" where code = 2009) then
      insert into "systemCodes" ("code", "name", "group", "createdBy", "updatedBy", "createdAt", "updatedAt")
      values (2009, 'rSync', 'resource', '54188262bc4d591ba438d62a', '54188262bc4d591ba438d62a', '2016-06-01', '2016-06-01');
    end if;

    if not exists (select 1 from "systemCodes" where code = 2010) then
      insert into "systemCodes" ("code", "name", "group", "createdBy", "updatedBy", "createdAt", "updatedAt")
      values (2010, 'deploy', 'resource', '54188262bc4d591ba438d62a', '54188262bc4d591ba438d62a', '2016-06-01', '2016-06-01');
    end if;

    if not exists (select 1 from "systemCodes" where code = 2011) then
      insert into "systemCodes" ("code", "name", "group", "createdBy", "updatedBy", "createdAt", "updatedAt")
      values (2011, 'jenkinsJob', 'resource', '54188262bc4d591ba438d62a', '54188262bc4d591ba438d62a', '2016-06-01', '2016-06-01');
    end if;

    if not exists (select 1 from "systemCodes" where code = 2012) then
      insert into "systemCodes" ("code", "name", "group", "createdBy", "updatedBy", "createdAt", "updatedAt")
      values (2012, 'ciJob', 'resource', '54188262bc4d591ba438d62a', '54188262bc4d591ba438d62a', '2016-06-01', '2016-06-01');
    end if;

    if not exists (select 1 from "systemCodes" where code = 2013) then
      insert into "systemCodes" ("code", "name", "group", "createdBy", "updatedBy", "createdAt", "updatedAt")
      values (2013, 'provision', 'resource', '54188262bc4d591ba438d62a', '54188262bc4d591ba438d62a', '2016-06-01', '2016-06-01');
    end if;

    if not exists (select 1 from "systemCodes" where code = 2014) then
      insert into "systemCodes" ("code", "name", "group", "createdBy", "updatedBy", "createdAt", "updatedAt")
      values (2014, 'runCLI', 'resource', '54188262bc4d591ba438d62a', '54188262bc4d591ba438d62a', '2016-06-01', '2016-06-01');
    end if;

    if not exists (select 1 from "systemCodes" where code = 2015) then
      insert into "systemCodes" ("code", "name", "group", "createdBy", "updatedBy", "createdAt", "updatedAt")
      values (2015, 'externalCI', 'resource', '54188262bc4d591ba438d62a', '54188262bc4d591ba438d62a', '2016-06-01', '2016-06-01');
    end if;

    if not exists (select 1 from "systemCodes" where code = 4000) then
      insert into "systemCodes" ("code", "name", "group", "createdBy", "updatedBy", "createdAt", "updatedAt")
      values (4000, 'queued', 'status', '54188262bc4d591ba438d62a', '54188262bc4d591ba438d62a', '2016-06-01', '2016-06-01');
    end if;
    if not exists (select 1 from "systemCodes" where code = 4001) then
      insert into "systemCodes" ("code", "name", "group", "createdBy", "updatedBy", "createdAt", "updatedAt")
      values (4001, 'processing', 'status', '54188262bc4d591ba438d62a', '54188262bc4d591ba438d62a', '2016-06-01', '2016-06-01');
    end if;
    if not exists (select 1 from "systemCodes" where code = 4002) then
      insert into "systemCodes" ("code", "name", "group", "createdBy", "updatedBy", "createdAt", "updatedAt")
      values (4002, 'success', 'status', '54188262bc4d591ba438d62a', '54188262bc4d591ba438d62a', '2016-06-01', '2016-06-01');
    end if;
    if not exists (select 1 from "systemCodes" where code = 4003) then
      insert into "systemCodes" ("code", "name", "group", "createdBy", "updatedBy", "createdAt", "updatedAt")
      values (4003, 'failure', 'status', '54188262bc4d591ba438d62a', '54188262bc4d591ba438d62a', '2016-06-01', '2016-06-01');
    end if;
    if not exists (select 1 from "systemCodes" where code = 4004) then
      insert into "systemCodes" ("code", "name", "group", "createdBy", "updatedBy", "createdAt", "updatedAt")
      values (4004, 'error', 'status', '54188262bc4d591ba438d62a', '54188262bc4d591ba438d62a', '2016-06-01', '2016-06-01');
    end if;
    if not exists (select 1 from "systemCodes" where code = 4005) then
      insert into "systemCodes" ("code", "name", "group", "createdBy", "updatedBy", "createdAt", "updatedAt")
      values (4005, 'waiting', 'status', '54188262bc4d591ba438d62a', '54188262bc4d591ba438d62a', '2016-06-01', '2016-06-01');
    end if;
    if not exists (select 1 from "systemCodes" where code = 4006) then
      insert into "systemCodes" ("code", "name", "group", "createdBy", "updatedBy", "createdAt", "updatedAt")
      values (4006, 'cancelled', 'status', '54188262bc4d591ba438d62a', '54188262bc4d591ba438d62a', '2016-06-01', '2016-06-01');
    end if;
    if not exists (select 1 from "systemCodes" where code = 4007) then
      insert into "systemCodes" ("code", "name", "group", "createdBy", "updatedBy", "createdAt", "updatedAt")
      values (4007, 'unstable', 'status', '54188262bc4d591ba438d62a', '54188262bc4d591ba438d62a', '2016-06-01', '2016-06-01');
    end if;
    if not exists (select 1 from "systemCodes" where code = 4008) then
      insert into "systemCodes" ("code", "name", "group", "createdBy", "updatedBy", "createdAt", "updatedAt")
      values (4008, 'skipped', 'status', '54188262bc4d591ba438d62a', '54188262bc4d591ba438d62a', '2016-06-01', '2016-06-01');
    end if;
    if not exists (select 1 from "systemCodes" where code = 4009) then
      insert into "systemCodes" ("code", "name", "group", "createdBy", "updatedBy", "createdAt", "updatedAt")
      values (4009, 'timeout', 'status', '54188262bc4d591ba438d62a', '54188262bc4d591ba438d62a', '2016-06-01', '2016-06-01');
    end if;

    if not exists (select 1 from "systemCodes" where code = 5000) then
      insert into "systemCodes" ("code", "name", "group", "createdBy", "updatedBy", "createdAt", "updatedAt")
      values (5000, 'scm', 'integration', '54188262bc4d591ba438d62a', '54188262bc4d591ba438d62a', '2016-06-01', '2016-06-01');
    end if;

    if not exists (select 1 from "systemCodes" where code = 5001) then
      insert into "systemCodes" ("code", "name", "group", "createdBy", "updatedBy", "createdAt", "updatedAt")
      values (5001, 'hub', 'integration', '54188262bc4d591ba438d62a', '54188262bc4d591ba438d62a', '2016-06-01', '2016-06-01');
    end if;

    if not exists (select 1 from "systemCodes" where code = 5002) then
      insert into "systemCodes" ("code", "name", "group", "createdBy", "updatedBy", "createdAt", "updatedAt")
      values (5002, 'deploy', 'integration', '54188262bc4d591ba438d62a', '54188262bc4d591ba438d62a', '2016-06-01', '2016-06-01');
    end if;

    if not exists (select 1 from "systemCodes" where code = 5003) then
      insert into "systemCodes" ("code", "name", "group", "createdBy", "updatedBy", "createdAt", "updatedAt")
      values (5003, 'notification', 'integration', '54188262bc4d591ba438d62a', '54188262bc4d591ba438d62a', '2016-06-01', '2016-06-01');
    end if;

    if not exists (select 1 from "systemCodes" where code = 5004) then
      insert into "systemCodes" ("code", "name", "group", "createdBy", "updatedBy", "createdAt", "updatedAt")
      values (5004, 'key', 'integration', '54188262bc4d591ba438d62a', '54188262bc4d591ba438d62a', '2016-06-01', '2016-06-01');
    end if;

    if not exists (select 1 from "systemCodes" where code = 5005) then
      insert into "systemCodes" ("code", "name", "group", "createdBy", "updatedBy", "createdAt", "updatedAt")
      values (5005, 'cloudproviders', 'integration', '54188262bc4d591ba438d62a', '54188262bc4d591ba438d62a', '2016-06-01', '2016-06-01');
    end if;

    if not exists (select 1 from "systemCodes" where code = 5006) then
      insert into "systemCodes" ("code", "name", "group", "createdBy", "updatedBy", "createdAt", "updatedAt")
      values (5006, 'secretsBackend', 'integration', '54188262bc4d591ba438d62a', '54188262bc4d591ba438d62a', '2016-06-01', '2016-06-01');
    end if;

    if not exists (select 1 from "systemCodes" where code = 5007) then
      insert into "systemCodes" ("code", "name", "group", "createdBy", "updatedBy", "createdAt", "updatedAt")
      values (5007, 'auth', 'integration', '54188262bc4d591ba438d62a', '54188262bc4d591ba438d62a', '2016-06-01', '2016-06-01');
    end if;

    if not exists (select 1 from "systemCodes" where code = 5008) then
      insert into "systemCodes" ("code", "name", "group", "createdBy", "updatedBy", "createdAt", "updatedAt")
      values (5008, 'payment', 'integration', '54188262bc4d591ba438d62a', '54188262bc4d591ba438d62a', '2016-06-01', '2016-06-01');
    end if;

    if not exists (select 1 from "systemCodes" where code = 5009) then
      insert into "systemCodes" ("code", "name", "group", "createdBy", "updatedBy", "createdAt", "updatedAt")
      values (5009, 'externalci', 'integration', '54188262bc4d591ba438d62a', '54188262bc4d591ba438d62a', '2016-06-01', '2016-06-01');
    end if;

    if not exists (select 1 from "systemCodes" where code = 5010) then
      insert into "systemCodes" ("code", "name", "group", "createdBy", "updatedBy", "createdAt", "updatedAt")
      values (5010, 'artifact', 'integration', '54188262bc4d591ba438d62a', '54188262bc4d591ba438d62a', '2016-06-01', '2016-06-01');
    end if;

    if not exists (select 1 from "systemCodes" where code = 5011) then
      insert into "systemCodes" ("code", "name", "group", "createdBy", "updatedBy", "createdAt", "updatedAt")
      values (5011, 'mktg', 'integration', '54188262bc4d591ba438d62a', '54188262bc4d591ba438d62a', '2016-06-01', '2016-06-01');
    end if;

    if not exists (select 1 from "systemCodes" where code = 5012) then
      insert into "systemCodes" ("code", "name", "group", "createdBy", "updatedBy", "createdAt", "updatedAt")
      values (5012, 'generic', 'integration', '54188262bc4d591ba438d62a', '54188262bc4d591ba438d62a', '2016-06-01', '2016-06-01');
    end if;

    if not exists (select 1 from "systemCodes" where code = 0) then
      insert into "systemCodes" ("code", "name", "group", "createdBy", "updatedBy", "createdAt", "updatedAt")
      values (0, 'WAITING', 'statusCodes', '54188262bc4d591ba438d62a', '54188262bc4d591ba438d62a', '2016-06-01', '2016-06-01');
    end if;

    if not exists (select 1 from "systemCodes" where code = 10) then
      insert into "systemCodes" ("code", "name", "group", "createdBy", "updatedBy", "createdAt", "updatedAt")
      values (10, 'QUEUED', 'statusCodes', '54188262bc4d591ba438d62a', '54188262bc4d591ba438d62a', '2016-06-01', '2016-06-01');
    end if;

    if not exists (select 1 from "systemCodes" where code = 20) then
      insert into "systemCodes" ("code", "name", "group", "createdBy", "updatedBy", "createdAt", "updatedAt")
      values (20, 'PROCESSING', 'statusCodes', '54188262bc4d591ba438d62a', '54188262bc4d591ba438d62a', '2016-06-01', '2016-06-01');
    end if;

    if not exists (select 1 from "systemCodes" where code = 30) then
      insert into "systemCodes" ("code", "name", "group", "createdBy", "updatedBy", "createdAt", "updatedAt")
      values (30, 'SUCCESS', 'statusCodes', '54188262bc4d591ba438d62a', '54188262bc4d591ba438d62a', '2016-06-01', '2016-06-01');
    end if;

    if not exists (select 1 from "systemCodes" where code = 40) then
      insert into "systemCodes" ("code", "name", "group", "createdBy", "updatedBy", "createdAt", "updatedAt")
      values (40, 'SKIPPED', 'statusCodes', '54188262bc4d591ba438d62a', '54188262bc4d591ba438d62a', '2016-06-01', '2016-06-01');
    end if;

    if not exists (select 1 from "systemCodes" where code = 50) then
      insert into "systemCodes" ("code", "name", "group", "createdBy", "updatedBy", "createdAt", "updatedAt")
      values (50, 'UNSTABLE', 'statusCodes', '54188262bc4d591ba438d62a', '54188262bc4d591ba438d62a', '2016-06-01', '2016-06-01');
    end if;

    if not exists (select 1 from "systemCodes" where code = 60) then
      insert into "systemCodes" ("code", "name", "group", "createdBy", "updatedBy", "createdAt", "updatedAt")
      values (60, 'TIMEOUT', 'statusCodes', '54188262bc4d591ba438d62a', '54188262bc4d591ba438d62a', '2016-06-01', '2016-06-01');
    end if;

    if not exists (select 1 from "systemCodes" where code = 70) then
      insert into "systemCodes" ("code", "name", "group", "createdBy", "updatedBy", "createdAt", "updatedAt")
      values (70, 'CANCELED', 'statusCodes', '54188262bc4d591ba438d62a', '54188262bc4d591ba438d62a', '2016-06-01', '2016-06-01');
    end if;

    if not exists (select 1 from "systemCodes" where code = 80) then
      insert into "systemCodes" ("code", "name", "group", "createdBy", "updatedBy", "createdAt", "updatedAt")
      values (80, 'FAILED', 'statusCodes', '54188262bc4d591ba438d62a', '54188262bc4d591ba438d62a', '2016-06-01', '2016-06-01');
    end if;

    if not exists (select 1 from "systemCodes" where code = 90) then
      insert into "systemCodes" ("code", "name", "group", "createdBy", "updatedBy", "createdAt", "updatedAt")
      values (90, 'STOPPED', 'statusCodes', '54188262bc4d591ba438d62a', '54188262bc4d591ba438d62a', '2016-06-01', '2016-06-01');
    end if;

    if not exists (select 1 from "systemCodes" where code = 100) then
      insert into "systemCodes" ("code", "name", "group", "createdBy", "updatedBy", "createdAt", "updatedAt")
      values (100, 'NOTINITIALIZED', 'statusCodes', '54188262bc4d591ba438d62a', '54188262bc4d591ba438d62a', '2016-06-01', '2016-06-01');
    end if;

    if not exists (select 1 from "systemCodes" where code = 101) then
      insert into "systemCodes" ("code", "name", "group", "createdBy", "updatedBy", "createdAt", "updatedAt")
      values (101, 'NOTDEPLOYED', 'statusCodes', '54188262bc4d591ba438d62a', '54188262bc4d591ba438d62a', '2016-06-01', '2016-06-01');
    end if;

    if not exists (select 1 from "systemCodes" where code = 110) then
      insert into "systemCodes" ("code", "name", "group", "createdBy", "updatedBy", "createdAt", "updatedAt")
      values (110, 'DELETING', 'statusCodes', '54188262bc4d591ba438d62a', '54188262bc4d591ba438d62a', '2016-06-01', '2016-06-01');
    end if;

    if not exists (select 1 from "systemCodes" where code = 120) then
      insert into "systemCodes" ("code", "name", "group", "createdBy", "updatedBy", "createdAt", "updatedAt")
      values (120, 'DELETED', 'statusCodes', '54188262bc4d591ba438d62a', '54188262bc4d591ba438d62a', '2016-06-01', '2016-06-01');
    end if;

    if not exists (select 1 from "systemCodes" where code = 130) then
      insert into "systemCodes" ("code", "name", "group", "createdBy", "updatedBy", "createdAt", "updatedAt")
      values (130, 'CACHED', 'statusCodes', '54188262bc4d591ba438d62a', '54188262bc4d591ba438d62a', '2016-06-01', '2016-06-01');
    end if;

    if not exists (select 1 from "systemCodes" where code = 6000) then
      insert into "systemCodes" ("code", "name", "group", "createdBy", "updatedBy", "createdAt", "updatedAt")
      values (6000, 'member', 'roles', '54188262bc4d591ba438d62a', '54188262bc4d591ba438d62a', '2016-06-01', '2016-06-01');
    end if;

    if not exists (select 1 from "systemCodes" where code = 6010) then
      insert into "systemCodes" ("code", "name", "group", "createdBy", "updatedBy", "createdAt", "updatedAt")
      values (6010, 'collaborator', 'roles', '54188262bc4d591ba438d62a', '54188262bc4d591ba438d62a', '2016-06-01', '2016-06-01');
    end if;

    if not exists (select 1 from "systemCodes" where code = 6020) then
      insert into "systemCodes" ("code", "name", "group", "createdBy", "updatedBy", "createdAt", "updatedAt")
      values (6020, 'admin', 'roles', '54188262bc4d591ba438d62a', '54188262bc4d591ba438d62a', '2016-06-01', '2016-06-01');
    end if;

    -- Codes for system-level roles
    if not exists (select 1 from "systemCodes" where code = 6040) then
      insert into "systemCodes" ("code", "name", "group", "createdBy", "updatedBy", "createdAt", "updatedAt")
      values (6040, 'publicUser', 'roles', '54188262bc4d591ba438d62a', '54188262bc4d591ba438d62a', '2016-06-01', '2016-06-01');
    end if;

    if not exists (select 1 from "systemCodes" where code = 6050) then
      insert into "systemCodes" ("code", "name", "group", "createdBy", "updatedBy", "createdAt", "updatedAt")
      values (6050, 'freeUser', 'roles', '54188262bc4d591ba438d62a', '54188262bc4d591ba438d62a', '2016-06-01', '2016-06-01');
    end if;

    if not exists (select 1 from "systemCodes" where code = 6060) then
      insert into "systemCodes" ("code", "name", "group", "createdBy", "updatedBy", "createdAt", "updatedAt")
      values (6060, 'justUser', 'roles', '54188262bc4d591ba438d62a', '54188262bc4d591ba438d62a', '2016-06-01', '2016-06-01');
    end if;

    if not exists (select 1 from "systemCodes" where code = 6070) then
      insert into "systemCodes" ("code", "name", "group", "createdBy", "updatedBy", "createdAt", "updatedAt")
      values (6070, 'opsUser', 'roles', '54188262bc4d591ba438d62a', '54188262bc4d591ba438d62a', '2016-06-01', '2016-06-01');
    end if;

    if not exists (select 1 from "systemCodes" where code = 6080) then
      insert into "systemCodes" ("code", "name", "group", "createdBy", "updatedBy", "createdAt", "updatedAt")
      values (6080, 'superUser', 'roles', '54188262bc4d591ba438d62a', '54188262bc4d591ba438d62a', '2016-06-01', '2016-06-01');
    end if;

    if not exists (select 1 from "systemCodes" where code = 6090) then
      insert into "systemCodes" ("code", "name", "group", "createdBy", "updatedBy", "createdAt", "updatedAt")
      values (6090, 'betaUser', 'roles', '54188262bc4d591ba438d62a', '54188262bc4d591ba438d62a', '2016-06-01', '2016-06-01');
    end if;

    if not exists (select 1 from "systemCodes" where code = 6100) then
      insert into "systemCodes" ("code", "name", "group", "createdBy", "updatedBy", "createdAt", "updatedAt")
      values (6100, 'serviceUser', 'roles', '54188262bc4d591ba438d62a', '54188262bc4d591ba438d62a', '2016-06-01', '2016-06-01');
    end if;

    if not exists (select 1 from "systemCodes" where code = 6110) then
      insert into "systemCodes" ("code", "name", "group", "createdBy", "updatedBy", "createdAt", "updatedAt")
      values (6110, 'publicPipelineUser', 'roles', '54188262bc4d591ba438d62a', '54188262bc4d591ba438d62a', '2016-06-01', '2016-06-01');
    end if;

    -- Codes for nodeType
    if not exists (select 1 from "systemCodes" where code = 7000) then
      insert into "systemCodes" ("code", "name", "group", "createdBy", "updatedBy", "createdAt", "updatedAt")
      values (7000, 'custom', 'nodeType', '54188262bc4d591ba438d62a', '54188262bc4d591ba438d62a', '2016-06-01', '2016-06-01');
    end if;

    if not exists (select 1 from "systemCodes" where code = 7001) then
      insert into "systemCodes" ("code", "name", "group", "createdBy", "updatedBy", "createdAt", "updatedAt")
      values (7001, 'dynamic', 'nodeType', '54188262bc4d591ba438d62a', '54188262bc4d591ba438d62a', '2016-06-01', '2016-06-01');
    end if;

    if not exists (select 1 from "systemCodes" where code = 7002) then
      insert into "systemCodes" ("code", "name", "group", "createdBy", "updatedBy", "createdAt", "updatedAt")
      values (7002, 'system', 'nodeType', '54188262bc4d591ba438d62a', '54188262bc4d591ba438d62a', '2016-06-01', '2016-06-01');
    end if;

    if not exists (select 1 from "systemCodes" where code = 7003) then
      insert into "systemCodes" ("code", "name", "group", "createdBy", "updatedBy", "createdAt", "updatedAt")
      values (7003, 'service', 'nodeType', '54188262bc4d591ba438d62a', '54188262bc4d591ba438d62a', '2016-06-01', '2016-06-01');
    end if;

    -- Add systemCodes for archType
    if not exists (select 1 from "systemCodes" where code = 8000) then
      insert into "systemCodes" ("code", "name", "group", "createdBy", "updatedBy", "createdAt", "updatedAt")
      values (8000, 'x86_64', 'archType', '54188262bc4d591ba438d62a', '54188262bc4d591ba438d62a', '2016-06-01', '2016-06-01');
    end if;

    if not exists (select 1 from "systemCodes" where code = 8001) then
      insert into "systemCodes" ("code", "name", "group", "createdBy", "updatedBy", "createdAt", "updatedAt")
      values (8001, 'aarch64', 'archType', '54188262bc4d591ba438d62a', '54188262bc4d591ba438d62a', '2016-06-01', '2016-06-01');
    end if;

    if not exists (select 1 from "systemCodes" where code = 8002) then
      insert into "systemCodes" ("code", "name", "group", "createdBy", "updatedBy", "createdAt", "updatedAt")
      values (8002, 'aarch32', 'archType', '54188262bc4d591ba438d62a', '54188262bc4d591ba438d62a', '2018-04-11', '2018-04-11');
    end if;

    -- Add systemCodes for operatingSystem
    if not exists (select 1 from "systemCodes" where code = 9000) then
      insert into "systemCodes" ("code", "name", "group", "createdBy", "updatedBy", "createdAt", "updatedAt")
      values (9000, 'Ubuntu_14.04', 'osType', '54188262bc4d591ba438d62a', '54188262bc4d591ba438d62a', '2017-12-06', '2017-12-06');
    end if;

    if not exists (select 1 from "systemCodes" where code = 9001) then
      insert into "systemCodes" ("code", "name", "group", "createdBy", "updatedBy", "createdAt", "updatedAt")
      values (9001, 'Ubuntu_16.04', 'osType', '54188262bc4d591ba438d62a', '54188262bc4d591ba438d62a', '2017-07-06', '2017-07-06');
    end if;

    if not exists (select 1 from "systemCodes" where code = 9002) then
      insert into "systemCodes" ("code", "name", "group", "createdBy", "updatedBy", "createdAt", "updatedAt")
      values (9002, 'WindowsServer_2016', 'osType', '54188262bc4d591ba438d62a', '54188262bc4d591ba438d62a', '2017-07-06', '2017-07-06');
    end if;

    if not exists (select 1 from "systemCodes" where code = 9003) then
      insert into "systemCodes" ("code", "name", "group", "createdBy", "updatedBy", "createdAt", "updatedAt")
      values (9003, 'macOS_10.12', 'osType', '54188262bc4d591ba438d62a', '54188262bc4d591ba438d62a', '2017-07-06', '2017-07-06');
    end if;

    if not exists (select 1 from "systemCodes" where code = 9004) then
      insert into "systemCodes" ("code", "name", "group", "createdBy", "updatedBy", "createdAt", "updatedAt")
      values (9004, 'CentOS_7', 'osType', '54188262bc4d591ba438d62a', '54188262bc4d591ba438d62a', '2017-07-06', '2017-07-06');
    end if;

    if not exists (select 1 from "systemCodes" where code = 9005) then
      insert into "systemCodes" ("code", "name", "group", "createdBy", "updatedBy", "createdAt", "updatedAt")
      values (9005, 'RHEL_7', 'osType', '54188262bc4d591ba438d62a', '54188262bc4d591ba438d62a', '2017-07-06', '2017-07-06');
    end if;

    -- Add systemCodes for clusterTypes
    if not exists (select 1 from "systemCodes" where code = 10000) then
      insert into "systemCodes" ("code", "name", "group", "createdBy", "updatedBy", "createdAt", "updatedAt")
      values (10000, 'dynamic__x86_64__Ubuntu_14.04__c4.large', 'clusterType', '54188262bc4d591ba438d62a', '54188262bc4d591ba438d62a', '2017-12-12', '2017-12-12');
    end if;

    delete from "systemCodes" where code = 10001 and name = 'dynamic__x86_64__Ubuntu__14.04__c4.xlarge';
    if not exists (select 1 from "systemCodes" where code = 10001) then
      insert into "systemCodes" ("code", "name", "group", "createdBy", "updatedBy", "createdAt", "updatedAt")
      values (10001, 'dynamic__x86_64__Ubuntu_14.04__c4.xlarge', 'clusterType', '54188262bc4d591ba438d62a', '54188262bc4d591ba438d62a', '2017-12-12', '2017-12-12');
    end if;

    if not exists (select 1 from "systemCodes" where code = 10002) then
      insert into "systemCodes" ("code", "name", "group", "createdBy", "updatedBy", "createdAt", "updatedAt")
      values (10002, 'dynamic__x86_64__Ubuntu_14.04__c4.2xlarge', 'clusterType', '54188262bc4d591ba438d62a', '54188262bc4d591ba438d62a', '2017-12-12', '2017-12-12');
    end if;

    if not exists (select 1 from "systemCodes" where code = 10003) then
      insert into "systemCodes" ("code", "name", "group", "createdBy", "updatedBy", "createdAt", "updatedAt")
      values (10003, 'custom__x86_64__Ubuntu_14.04', 'clusterType', '54188262bc4d591ba438d62a', '54188262bc4d591ba438d62a', '2017-12-12', '2017-12-12');
    end if;

    if not exists (select 1 from "systemCodes" where code = 10004) then
      insert into "systemCodes" ("code", "name", "group", "createdBy", "updatedBy", "createdAt", "updatedAt")
      values (10004, 'custom__x86_64__Ubuntu_16.04', 'clusterType', '54188262bc4d591ba438d62a', '54188262bc4d591ba438d62a', '2017-12-12', '2017-12-12');
    end if;

    if not exists (select 1 from "systemCodes" where code = 10005) then
      insert into "systemCodes" ("code", "name", "group", "createdBy", "updatedBy", "createdAt", "updatedAt")
      values (10005, 'custom__aarch64__Ubuntu_16.04', 'clusterType', '54188262bc4d591ba438d62a', '54188262bc4d591ba438d62a', '2017-12-12', '2017-12-12');
    end if;

    if not exists (select 1 from "systemCodes" where code = 10006) then
      insert into "systemCodes" ("code", "name", "group", "createdBy", "updatedBy", "createdAt", "updatedAt")
      values (10006, 'custom__x86_64__macOS_10.12', 'clusterType', '54188262bc4d591ba438d62a', '54188262bc4d591ba438d62a', '2017-12-12', '2017-12-12');
    end if;

    if not exists (select 1 from "systemCodes" where code = 10007) then
      insert into "systemCodes" ("code", "name", "group", "createdBy", "updatedBy", "createdAt", "updatedAt")
      values (10007, 'custom__x86_64__WindowsServer_2016', 'clusterType', '54188262bc4d591ba438d62a', '54188262bc4d591ba438d62a', '2017-12-12', '2017-12-12');
    end if;

    if not exists (select 1 from "systemCodes" where code = 10008) then
      insert into "systemCodes" ("code", "name", "group", "createdBy", "updatedBy", "createdAt", "updatedAt")
      values (10008, 'custom__x86_64__CentOS_7', 'clusterType', '54188262bc4d591ba438d62a', '54188262bc4d591ba438d62a', '2017-12-12', '2017-12-12');
    end if;

    if not exists (select 1 from "systemCodes" where code = 10009) then
      insert into "systemCodes" ("code", "name", "group", "createdBy", "updatedBy", "createdAt", "updatedAt")
      values (10009, 'dynamic__x86_64__WindowsServer_2016__c4.large', 'clusterType', '54188262bc4d591ba438d62a', '54188262bc4d591ba438d62a', '2018-03-06', '2018-03-06');
    end if;

    if not exists (select 1 from "systemCodes" where code = 10010) then
      insert into "systemCodes" ("code", "name", "group", "createdBy", "updatedBy", "createdAt", "updatedAt")
      values (10010, 'dynamic__x86_64__Ubuntu_16.04__c4.large', 'clusterType', '54188262bc4d591ba438d62a', '54188262bc4d591ba438d62a', '2018-03-28', '2018-03-28');
    end if;

    if not exists (select 1 from "systemCodes" where code = 10011) then
      insert into "systemCodes" ("code", "name", "group", "createdBy", "updatedBy", "createdAt", "updatedAt")
      values (10011, 'custom__x86_64__RHEL_7', 'clusterType', '54188262bc4d591ba438d62a', '54188262bc4d591ba438d62a', '2018-03-06', '2018-03-06');
    end if;

    if not exists (select 1 from "systemCodes" where code = 10012) then
      insert into "systemCodes" ("code", "name", "group", "createdBy", "updatedBy", "createdAt", "updatedAt")
      values (10012, 'dynamic__x86_64__WindowsServer_2016__c4.xlarge', 'clusterType', '54188262bc4d591ba438d62a', '54188262bc4d591ba438d62a', '2018-03-26', '2018-03-26');
    end if;

    if not exists (select 1 from "systemCodes" where code = 10013) then
      insert into "systemCodes" ("code", "name", "group", "createdBy", "updatedBy", "createdAt", "updatedAt")
      values (10013, 'dynamic__x86_64__WindowsServer_2016__c4.2xlarge', 'clusterType', '54188262bc4d591ba438d62a', '54188262bc4d591ba438d62a', '2018-03-26', '2018-03-26');
    end if;

    if not exists (select 1 from "systemCodes" where code = 10014) then
      insert into "systemCodes" ("code", "name", "group", "createdBy", "updatedBy", "createdAt", "updatedAt")
      values (10014, 'dynamic__x86_64__CentOS_7__c4.large', 'clusterType', '54188262bc4d591ba438d62a', '54188262bc4d591ba438d62a', '2018-03-26', '2018-03-26');
    end if;

    if not exists (select 1 from "systemCodes" where code = 10015) then
      insert into "systemCodes" ("code", "name", "group", "createdBy", "updatedBy", "createdAt", "updatedAt")
      values (10015, 'dynamic__x86_64__CentOS_7__c4.xlarge', 'clusterType', '54188262bc4d591ba438d62a', '54188262bc4d591ba438d62a', '2018-03-26', '2018-03-26');
    end if;

    if not exists (select 1 from "systemCodes" where code = 10016) then
      insert into "systemCodes" ("code", "name", "group", "createdBy", "updatedBy", "createdAt", "updatedAt")
      values (10016, 'dynamic__x86_64__CentOS_7__c4.2xlarge', 'clusterType', '54188262bc4d591ba438d62a', '54188262bc4d591ba438d62a', '2018-03-26', '2018-03-26');
    end if;

    if not exists (select 1 from "systemCodes" where code = 10017) then
      insert into "systemCodes" ("code", "name", "group", "createdBy", "updatedBy", "createdAt", "updatedAt")
      values (10017, 'dynamic__x86_64__Ubuntu_16.04__c4.xlarge', 'clusterType', '54188262bc4d591ba438d62a', '54188262bc4d591ba438d62a', '2018-03-28', '2018-03-28');
    end if;

    if not exists (select 1 from "systemCodes" where code = 10018) then
      insert into "systemCodes" ("code", "name", "group", "createdBy", "updatedBy", "createdAt", "updatedAt")
      values (10018, 'dynamic__x86_64__Ubuntu_16.04__c4.2xlarge', 'clusterType', '54188262bc4d591ba438d62a', '54188262bc4d591ba438d62a', '2018-03-28', '2018-03-28');
    end if;

    if not exists (select 1 from "systemCodes" where code = 10019) then
      insert into "systemCodes" ("code", "name", "group", "createdBy", "updatedBy", "createdAt", "updatedAt")
      values (10019, 'custom__aarch32__Ubuntu_16.04', 'clusterType', '54188262bc4d591ba438d62a', '54188262bc4d591ba438d62a', '2018-04-11', '2018-04-11');
    end if;

    if not exists (select 1 from "systemCodes" where code = 10020) then
      insert into "systemCodes" ("code", "name", "group", "createdBy", "updatedBy", "createdAt", "updatedAt")
      values (10020, 'restricted__aarch64__Ubuntu_16.04', 'clusterType', '54188262bc4d591ba438d62a', '54188262bc4d591ba438d62a', '2018-06-27', '2018-06-27');
    end if;

    if not exists (select 1 from "systemCodes" where code = 10021) then
      insert into "systemCodes" ("code", "name", "group", "createdBy", "updatedBy", "createdAt", "updatedAt")
      values (10021, 'restricted__aarch32__Ubuntu_16.04', 'clusterType', '54188262bc4d591ba438d62a', '54188262bc4d591ba438d62a', '2018-07-11', '2018-07-11');
    end if;

    -- Add systemCodes for jobStatesMap
    if not exists (select 1 from "systemCodes" where code = 201) then
      insert into "systemCodes" ("code", "name", "group", "createdBy", "updatedBy", "createdAt", "updatedAt")
      values (201, 'run', 'jobStatesMapType', '54188262bc4d591ba438d62a', '54188262bc4d591ba438d62a', '2016-06-01', '2016-06-01');
    end if;

    if not exists (select 1 from "systemCodes" where code = 202) then
      insert into "systemCodes" ("code", "name", "group", "createdBy", "updatedBy", "createdAt", "updatedAt")
      values (202, 'build', 'jobStatesMapType', '54188262bc4d591ba438d62a', '54188262bc4d591ba438d62a', '2016-06-01', '2016-06-01');
    end if;

    if not exists (select 1 from "systemCodes" where code = 301) then
      insert into "systemCodes" ("code", "name", "group", "createdBy", "updatedBy", "createdAt", "updatedAt")
      values (301, 'branch', 'jobStatesMapContextType', '54188262bc4d591ba438d62a', '54188262bc4d591ba438d62a', '2016-06-01', '2016-06-01');
    end if;

    if not exists (select 1 from "systemCodes" where code = 302) then
      insert into "systemCodes" ("code", "name", "group", "createdBy", "updatedBy", "createdAt", "updatedAt")
      values (302, 'tag', 'jobStatesMapContextType', '54188262bc4d591ba438d62a', '54188262bc4d591ba438d62a', '2016-06-01', '2016-06-01');
    end if;

    if not exists (select 1 from "systemCodes" where code = 303) then
      insert into "systemCodes" ("code", "name", "group", "createdBy", "updatedBy", "createdAt", "updatedAt")
      values (303, 'release', 'jobStatesMapContextType', '54188262bc4d591ba438d62a', '54188262bc4d591ba438d62a', '2016-06-01', '2016-06-01');
    end if;

    if not exists (select 1 from "systemCodes" where code = 304) then
      insert into "systemCodes" ("code", "name", "group", "createdBy", "updatedBy", "createdAt", "updatedAt")
      values (304, 'pr', 'jobStatesMapContextType', '54188262bc4d591ba438d62a', '54188262bc4d591ba438d62a', '2016-06-01', '2016-06-01');
    end if;

    if not exists (select 1 from "systemCodes" where code = 305) then
      insert into "systemCodes" ("code", "name", "group", "createdBy", "updatedBy", "createdAt", "updatedAt")
      values (305, 'deploy', 'jobStatesMapContextType', '54188262bc4d591ba438d62a', '54188262bc4d591ba438d62a', '2016-06-01', '2016-06-01');
    end if;

    if not exists (select 1 from "systemCodes" where code = 306) then
      insert into "systemCodes" ("code", "name", "group", "createdBy", "updatedBy", "createdAt", "updatedAt")
      values (306, 'manifest', 'jobStatesMapContextType', '54188262bc4d591ba438d62a', '54188262bc4d591ba438d62a', '2016-06-01', '2016-06-01');
    end if;

    if not exists (select 1 from "systemCodes" where code = 307) then
      insert into "systemCodes" ("code", "name", "group", "createdBy", "updatedBy", "createdAt", "updatedAt")
      values (307, 'runCI', 'jobStatesMapContextType', '54188262bc4d591ba438d62a', '54188262bc4d591ba438d62a', '2016-06-01', '2016-06-01');
    end if;

    if not exists (select 1 from "systemCodes" where code = 308) then
      insert into "systemCodes" ("code", "name", "group", "createdBy", "updatedBy", "createdAt", "updatedAt")
      values (308, 'runSh', 'jobStatesMapContextType', '54188262bc4d591ba438d62a', '54188262bc4d591ba438d62a', '2016-06-01', '2016-06-01');
    end if;

    if not exists (select 1 from "systemCodes" where code = 309) then
      insert into "systemCodes" ("code", "name", "group", "createdBy", "updatedBy", "createdAt", "updatedAt")
      values (309, 'ciJob', 'jobStatesMapContextType', '54188262bc4d591ba438d62a', '54188262bc4d591ba438d62a', '2016-06-01', '2016-06-01');
    end if;

    if not exists (select 1 from "systemCodes" where code = 310) then
      insert into "systemCodes" ("code", "name", "group", "createdBy", "updatedBy", "createdAt", "updatedAt")
      values (310, 'jenkinsJob', 'jobStatesMapContextType', '54188262bc4d591ba438d62a', '54188262bc4d591ba438d62a', '2016-06-01', '2016-06-01');
    end if;

    if not exists (select 1 from "systemCodes" where code = 311) then
      insert into "systemCodes" ("code", "name", "group", "createdBy", "updatedBy", "createdAt", "updatedAt")
      values (311, 'rSync', 'jobStatesMapContextType', '54188262bc4d591ba438d62a', '54188262bc4d591ba438d62a', '2016-06-01', '2016-06-01');
    end if;

    if not exists (select 1 from "systemCodes" where code = 312) then
      insert into "systemCodes" ("code", "name", "group", "createdBy", "updatedBy", "createdAt", "updatedAt")
      values (312, 'runCLI', 'jobStatesMapContextType', '54188262bc4d591ba438d62a', '54188262bc4d591ba438d62a', '2016-06-01', '2016-06-01');
    end if;

    if not exists (select 1 from "systemCodes" where code = 313) then
      insert into "systemCodes" ("code", "name", "group", "createdBy", "updatedBy", "createdAt", "updatedAt")
      values (313, 'provision', 'jobStatesMapContextType', '54188262bc4d591ba438d62a', '54188262bc4d591ba438d62a', '2016-06-01', '2016-06-01');
    end if;

    if not exists (select 1 from "systemCodes" where code = 314) then
      insert into "systemCodes" ("code", "name", "group", "createdBy", "updatedBy", "createdAt", "updatedAt")
      values (314, 'releaseTag', 'jobStatesMapContextType', '54188262bc4d591ba438d62a', '54188262bc4d591ba438d62a', '2016-06-01', '2016-06-01');
    end if;

    if not exists (select 1 from "systemCodes" where code = 315) then
      insert into "systemCodes" ("code", "name", "group", "createdBy", "updatedBy", "createdAt", "updatedAt")
      values (315, 'externalCI', 'jobStatesMapContextType', '54188262bc4d591ba438d62a', '54188262bc4d591ba438d62a', '2016-06-01', '2016-06-01');
    end if;

    -- Codes for views and viewObjects
    if not exists (select 1 from "systemCodes" where code = 400) then
      insert into "systemCodes" ("code", "name", "group", "createdBy", "updatedBy", "createdAt", "updatedAt")
      values (400, 'project', 'viewObjectType', '54188262bc4d591ba438d62a', '54188262bc4d591ba438d62a', '2016-06-01', '2016-06-01');
    end if;

    if not exists (select 1 from "systemCodes" where code = 401) then
      insert into "systemCodes" ("code", "name", "group", "createdBy", "updatedBy", "createdAt", "updatedAt")
      values (401, 'flag', 'viewObjectType', '54188262bc4d591ba438d62a', '54188262bc4d591ba438d62a', '2016-06-01', '2016-06-01');
    end if;

    if not exists (select 1 from "systemCodes" where code = 402) then
      insert into "systemCodes" ("code", "name", "group", "createdBy", "updatedBy", "createdAt", "updatedAt")
      values (402, 'job', 'viewObjectType', '54188262bc4d591ba438d62a', '54188262bc4d591ba438d62a', '2016-06-01', '2016-06-01');
    end if;

    if not exists (select 1 from "systemCodes" where code = 403) then
      insert into "systemCodes" ("code", "name", "group", "createdBy", "updatedBy", "createdAt", "updatedAt")
      values (403, 'showResources', 'viewObjectType', '54188262bc4d591ba438d62a', '54188262bc4d591ba438d62a', '2016-06-01', '2016-06-01');
    end if;

    if not exists (select 1 from "systemCodes" where code = 404) then
      insert into "systemCodes" ("code", "name", "group", "createdBy", "updatedBy", "createdAt", "updatedAt")
      values (404, 'showOrphanedResources', 'viewObjectType', '54188262bc4d591ba438d62a', '54188262bc4d591ba438d62a', '2016-06-01', '2016-06-01');
    end if;

    if not exists (select 1 from "systemCodes" where code = 405) then
      insert into "systemCodes" ("code", "name", "group", "createdBy", "updatedBy", "createdAt", "updatedAt")
      values (405, 'showDeletedResources', 'viewObjectType', '54188262bc4d591ba438d62a', '54188262bc4d591ba438d62a', '2016-06-01', '2016-06-01');
    end if;

    if not exists (select 1 from "systemCodes" where code = 406) then
      insert into "systemCodes" ("code", "name", "group", "createdBy", "updatedBy", "createdAt", "updatedAt")
      values (406, 'showSPOGView', 'viewObjectType', '54188262bc4d591ba438d62a', '54188262bc4d591ba438d62a', '2016-06-01', '2016-06-01');
    end if;

    if not exists (select 1 from "systemCodes" where code = 407) then
      insert into "systemCodes" ("code", "name", "group", "createdBy", "updatedBy", "createdAt", "updatedAt")
      values (407, 'collapseSideBar', 'viewObjectType', '54188262bc4d591ba438d62a', '54188262bc4d591ba438d62a', '2016-06-01', '2016-06-01');
    end if;

    if not exists (select 1 from "systemCodes" where code = 408) then
      insert into "systemCodes" ("code", "name", "group", "createdBy", "updatedBy", "createdAt", "updatedAt")
      values (408, 'showBetaSPOGView', 'viewObjectType', '54188262bc4d591ba438d62a', '54188262bc4d591ba438d62a', '2016-06-01', '2016-06-01');
    end if;

    if not exists (select 1 from "systemCodes" where code = 409) then
      insert into "systemCodes" ("code", "name", "group", "createdBy", "updatedBy", "createdAt", "updatedAt")
      values (409, 'defaultSpogLayout', 'viewObjectType', '54188262bc4d591ba438d62a', '54188262bc4d591ba438d62a', '2018-03-08', '2018-03-08');
    end if;

    if not exists (select 1 from "systemCodes" where code = 500) then
      insert into "systemCodes" ("code", "name", "group", "createdBy", "updatedBy", "createdAt", "updatedAt")
      values (500, 'accountDashboard', 'viewType', '54188262bc4d591ba438d62a', '54188262bc4d591ba438d62a', '2016-06-01', '2016-06-01');
    end if;

    if not exists (select 1 from "systemCodes" where code = 501) then
      insert into "systemCodes" ("code", "name", "group", "createdBy", "updatedBy", "createdAt", "updatedAt")
      values (501, 'subscriptionDashboard', 'viewType', '54188262bc4d591ba438d62a', '54188262bc4d591ba438d62a', '2016-06-01', '2016-06-01');
    end if;

    if not exists (select 1 from "systemCodes" where code = 502) then
      insert into "systemCodes" ("code", "name", "group", "createdBy", "updatedBy", "createdAt", "updatedAt")
      values (502, 'projectDashboard', 'viewType', '54188262bc4d591ba438d62a', '54188262bc4d591ba438d62a', '2016-06-01', '2016-06-01');
    end if;

    if not exists (select 1 from "systemCodes" where code = 503) then
      insert into "systemCodes" ("code", "name", "group", "createdBy", "updatedBy", "createdAt", "updatedAt")
      values (503, 'customDashboard', 'viewType', '54188262bc4d591ba438d62a', '54188262bc4d591ba438d62a', '2016-06-01', '2016-06-01');
    end if;

    if not exists (select 1 from "systemCodes" where code = 504) then
      insert into "systemCodes" ("code", "name", "group", "createdBy", "updatedBy", "createdAt", "updatedAt")
      values (504, 'account', 'viewType', '54188262bc4d591ba438d62a', '54188262bc4d591ba438d62a', '2016-06-01', '2016-06-01');
    end if;

    if not exists (select 1 from "systemCodes" where code = 505) then
      insert into "systemCodes" ("code", "name", "group", "createdBy", "updatedBy", "createdAt", "updatedAt")
      values (505, 'showNotBuilt', 'viewObjectType', '54188262bc4d591ba438d62a', '54188262bc4d591ba438d62a', '2018-06-25', '2018-06-25');
    end if;

    -- Remove unused systemCodes
    delete from "systemCodes" where "code" = 1002 and "name" = 'ecsCluster' and "group" = 'resource';

    delete from "systemCodes" where "code" = 1005 and "name" = 'dclCluster' and "group" = 'resource';

    delete from "systemCodes" where "code" = 1007 and "name" = 'gkeCluster' and "group" = 'resource';

    delete from "systemCodes" where "code" = 1009 and "name" = 'ddcCluster' and "group" = 'resource';

    delete from "systemCodes" where "code" = 1011 and "name" = 'tripubCluster' and "group" = 'resource';

    delete from "systemCodes" where "code" = 2001 and "name" = 'ecsDeploy' and "group" = 'resource';

    delete from "systemCodes" where "code" = 3001 and "name" = 'ecsDeploySteps' and "group" = 'resource';

    delete from "systemCodes" where "code" = 2003 and "name" = 'gkeDeploy' and "group" = 'resource';

    delete from "systemCodes" where "code" = 3003 and "name" = 'gkeDeploySteps' and "group" = 'resource';

    delete from "systemCodes" where "code" = 2006 and "name" = 'tripubDeploy' and "group" = 'resource';

    delete from "systemCodes" where "code" = 3006 and "name" = 'tripubDeploySteps' and "group" = 'resource';

    delete from "systemCodes" where "code" = 2002 and "name" = 'dclDeploy' and "group" = 'resource';

    delete from "systemCodes" where "code" = 3002 and "name" = 'dclDeploySteps' and "group" = 'resource';

    delete from "systemCodes" where "code" = 2004 and "name" = 'ddcDeploy' and "group" = 'resource';

    delete from "systemCodes" where "code" = 3004 and "name" = 'ddcDeploySteps' and "group" = 'resource';

    delete from "systemCodes" where "code" = 3000 and "name" = 'manifestSteps' and "group" = 'resource';

    delete from "systemCodes" where "code" = 3005 and "name" = 'runCISteps' and "group" = 'resource';

    delete from "systemCodes" where "code" = 3007 and "name" = 'runShSteps' and "group" = 'resource';

    delete from "systemCodes" where "code" = 3008 and "name" = 'releaseSteps' and "group" = 'resource';

    delete from "systemCodes" where "code" = 3009 and "name" = 'rSyncSteps' and "group" = 'resource';

    delete from "systemCodes" where "code" = 3010 and "name" = 'deploySteps' and "group" = 'resource';

  end
$$;
