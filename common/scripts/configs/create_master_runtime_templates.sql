do $$
  begin
    if exists (select 1 from information_schema.columns where table_name = 'runtimeTemplates') then
      -- x86_64 Ubuntu_14.04 Master
      if not exists (select 1 from "runtimeTemplates" where "archTypeCode" = 8000 and "osTypeCode" = 9000 and "version" = 'Master') then
        insert into "runtimeTemplates" ("archTypeCode", "osTypeCode", "version", "drydockOrg", "drydockFamily", "drydockTag", "defaultTaskImage", "reqProcImage", "isDefault", "createdAt", "updatedAt")
        values (8000, 9000, 'Master', 'drydock', 'u16', 'master', 'microbase', 'reqproc', false, '2018-01-16', '2018-01-16');
      end if;

      -- x86_64 Ubuntu_16.04 Master
      if not exists (select 1 from "runtimeTemplates" where "archTypeCode" = 8000 and "osTypeCode" = 9001 and "version" = 'Master') then
        insert into "runtimeTemplates" ("archTypeCode", "osTypeCode", "version", "drydockOrg", "drydockFamily", "drydockTag", "defaultTaskImage", "reqProcImage", "isDefault", "createdAt", "updatedAt")
        values (8000, 9001, 'Master', 'drydock', 'u16', 'master', 'microbase', 'reqproc', false, '2018-01-16', '2018-01-16');
      end if;

      -- aarch64 Ubuntu_16.04 Master
      if not exists (select 1 from "runtimeTemplates" where "archTypeCode" = 8001 and "osTypeCode" = 9001 and "version" = 'Master') then
        insert into "runtimeTemplates" ("archTypeCode", "osTypeCode", "version", "drydockOrg", "drydockFamily", "drydockTag", "defaultTaskImage", "reqProcImage", "isDefault", "createdAt", "updatedAt")
        values (8001, 9001, 'Master', 'drydockaarch64', 'u16', 'master', 'microbase', 'reqproc', false, '2018-01-16', '2018-01-16');
      end if;

      -- x86_64 WindowsServer_2016 Master
      if not exists (select 1 from "runtimeTemplates" where "archTypeCode" = 8000 and "osTypeCode" = 9002 and "version" = 'Master') then
        insert into "runtimeTemplates" ("archTypeCode", "osTypeCode", "version", "drydockOrg", "drydockFamily", "drydockTag", "defaultTaskImage", "reqProcImage", "isDefault", "createdAt", "updatedAt")
        values (8000, 9002, 'Master', 'drydock', 'w16', 'master', 'w16microbase', 'w16reqproc', false, '2018-01-16', '2018-01-16');
      end if;

      -- x86_64 macOS_10.12 Master
      if not exists (select 1 from "runtimeTemplates" where "archTypeCode" = 8000 and "osTypeCode" = 9003 and "version" = 'Master') then
        insert into "runtimeTemplates" ("archTypeCode", "osTypeCode", "version", "drydockOrg", "drydockFamily", "drydockTag", "defaultTaskImage", "reqProcImage", "isDefault", "createdAt", "updatedAt")
        values (8000, 9003, 'Master', 'drydock', 'u16', 'master', 'microbase', 'm10reqproc', false, '2018-01-16', '2018-01-16');
      end if;

      -- x86_64 CentOS_7 Master
      if not exists (select 1 from "runtimeTemplates" where "archTypeCode" = 8000 and "osTypeCode" = 9004 and "version" = 'Master') then
        insert into "runtimeTemplates" ("archTypeCode", "osTypeCode", "version", "drydockOrg", "drydockFamily", "drydockTag", "defaultTaskImage", "reqProcImage", "isDefault", "createdAt", "updatedAt")
        values (8000, 9004, 'Master', 'drydock', 'u16', 'master', 'microbase', 'reqproc', false, '2018-01-16', '2018-01-16');
      end if;
    end if;
  end
$$;
