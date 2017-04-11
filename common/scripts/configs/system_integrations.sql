do $$
  begin

    if not exists (select 1 from information_schema.columns where table_name = 'systemIntegrations') then
    -- This is the base table, do not add any fields here. Add them below.
      create table "systemIntegrations" (
        "id" VARCHAR(24) PRIMARY KEY NOT NULL,
        "systemIntegrationId" SERIAL,
        "name" VARCHAR(80) NOT NULL,
        "masterIntegrationId" VARCHAR(24) NOT NULL,
        "masterName" VARCHAR(80) NOT NULL,
        "isEnabled" BOOLEAN DEFAULT false NOT NULL,
        "createdBy" VARCHAR(24) NOT NULL,
        "updatedBy" VARCHAR(24) NOT NULL,
        "createdAt" timestamp with time zone NOT NULL,
        "updatedAt" timestamp with time zone NOT NULL
      );
    end if;

    -- Drop unique index on name
    if exists (select 1 from pg_indexes where tablename = 'systemIntegrations' and indexname = 'sysIntNameU') then
      drop index "sysIntNameU";
    end if;

    -- Add unique index on systemIntegrationId
    if not exists (select 1 from pg_indexes where tablename = 'systemIntegrations' and indexname = 'sysIntSysIntIdU') then
      create index "sysIntSysIntIdU" on "systemIntegrations" using btree("systemIntegrationId");
    end if;

    -- Add foreign key relationships
    if not exists (select 1 from pg_constraint where conname = 'systemIntegrations_masterIntegrationId_fkey') then
      alter table "systemIntegrations" add constraint "systemIntegrations_masterIntegrationId_fkey" foreign key ("masterIntegrationId") references "masterIntegrations"(id) on update restrict on delete restrict;
    end if;

    -- Remove formJSONValues column
    if exists (select 1 from information_schema.columns where table_name = 'systemIntegrations' and column_name = 'formJSONValues') then
      alter table "systemIntegrations" drop column "formJSONValues";
    end if;

    -- Remove masterType column
    if exists (select 1 from information_schema.columns where table_name = 'systemIntegrations' and column_name = 'masterType') then
      alter table "systemIntegrations" drop column "masterType";
    end if;

    -- Remove masterDisplayName column
    if exists (select 1 from information_schema.columns where table_name = 'systemIntegrations' and column_name = 'masterDisplayName') then
      alter table "systemIntegrations" drop column "masterDisplayName";
    end if;

    -- Remove systemIntegrations
    delete from "systemIntegrations" where "name" = 'vault';

    delete from "systemIntegrations" where "name" = 'amazons3';

  end
$$;
