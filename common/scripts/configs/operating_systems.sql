do $$
  begin

    if not exists (select 1 from information_schema.columns where table_name = 'operatingSystems') then
    -- This is the base table, do not add any fields here. Add them below.
      create table "operatingSystems" (
        "id" SERIAL PRIMARY KEY,
        "code" INT NOT NULL,
        "name" VARCHAR(255) NOT NULL,
        "archTypeCode" INT NOT NULL,
        "createdBy" VARCHAR(24) NOT NULL,
        "updatedBy" VARCHAR(24) NOT NULL,
        "createdAt" timestamp with time zone NOT NULL,
        "updatedAt" timestamp with time zone NOT NULL
      );
    end if;

    -- Add operatingSystemCodeArchTypeCodeU index
    if not exists (select 1 from pg_indexes where tablename = 'operatingSystems' and indexname = 'operatingSystemCodeArchTypeCodeU') then
      create unique index "operatingSystemCodeArchTypeCodeU" on "operatingSystems" using btree("code", "archTypeCode");
    end if;

    -- insert all operatingSystems
    if not exists (select 1 from "operatingSystems" where code = 10) then
      insert into "operatingSystems" ("code", "name", "archTypeCode", "createdBy", "updatedBy", "createdAt", "updatedAt")
      values (10, 'Ubuntu_14.04', 8000, '54188262bc4d591ba438d62a', '54188262bc4d591ba438d62a', '2016-06-01', '2016-06-01');
    end if;

    if not exists (select 1 from "operatingSystems" where code = 20) then
      insert into "operatingSystems" ("code", "name", "archTypeCode", "createdBy", "updatedBy", "createdAt", "updatedAt")
      values (20, 'Ubuntu_16.04', 8000, '54188262bc4d591ba438d62a', '54188262bc4d591ba438d62a', '2016-06-01', '2016-06-01');
    end if;

    if not exists (select 1 from "operatingSystems" where code = 30) then
      insert into "operatingSystems" ("code", "name", "archTypeCode", "createdBy", "updatedBy", "createdAt", "updatedAt")
      values (20, 'Ubuntu_16.04', 8001, '54188262bc4d591ba438d62a', '54188262bc4d591ba438d62a', '2016-06-01', '2016-06-01');
    end if;

  end
$$;
