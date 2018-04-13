do $$
  begin
    -- set isInternal flag in all bbs accountIntegrations created from v6.3.4 or earlier
    if exists (select 1 from information_schema.columns where table_name = 'accountIntegrations' and column_name = 'isInternal') then
      UPDATE "accountIntegrations" SET "isInternal" = true where "masterName"= 'bitbucketServer';
    end if;
  end
$$;
