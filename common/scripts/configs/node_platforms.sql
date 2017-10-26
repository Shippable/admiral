do $$
  begin

    if not exists (select 1 from information_schema.columns where table_name = 'nodePlatforms') then
    -- This is the base table, do not add any fields here. Add them below.
      create table "nodePlatforms" (
        "id" SERIAL PRIMARY KEY,
        "archTypeCode" INT NOT NULL,
        "operatingSystemCode" INT NOT NULL,
        "createdBy" VARCHAR(24) NOT NULL,
        "updatedBy" VARCHAR(24) NOT NULL,
        "createdAt" timestamp with time zone NOT NULL,
        "updatedAt" timestamp with time zone NOT NULL
      );
    end if;

    -- Add archTypeCodeOperatingSystemCodeU index
    if not exists (select 1 from pg_indexes where tablename = 'nodePlatforms' and indexname = 'archTypeCodeOperatingSystemCodeU') then
      create unique index "archTypeCodeOperatingSystemCodeU" on "nodePlatforms" using btree("archTypeCode", "operatingSystemCode");
    end if;


    -- Adds foreign key constraint on archTypeCode
    if not exists (select 1 from pg_constraint where conname = 'nodePlatforms_archTypeCode_fkey') then
      alter table "nodePlatforms" add constraint "nodePlatforms_archTypeCode_fkey" foreign key ("archTypeCode") references "systemCodes"(code) on update restrict on delete restrict;
    end if;

    -- Adds foreign key constraint on operatingSystemCode
    if not exists (select 1 from pg_constraint where conname = 'nodePlatforms_operatingSystemCode_fkey') then
      alter table "nodePlatforms" add constraint "nodePlatforms_operatingSystemCode_fkey" foreign key ("operatingSystemCode") references "systemCodes"(code) on update restrict on delete restrict;
    end if;

    -- insert all nodePlatforms
    if not exists (select 1 from "nodePlatforms" where "archTypeCode" = 8000 and "operatingSystemCode" = 9001) then
      insert into "nodePlatforms" ("archTypeCode", "operatingSystemCode", "createdBy", "updatedBy", "createdAt", "updatedAt")
      values (8000, 9001, '54188262bc4d591ba438d62a', '54188262bc4d591ba438d62a', '2016-06-01', '2016-06-01');
    end if;
  end
$$;
