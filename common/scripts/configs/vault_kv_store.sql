create table if not exists "vault_kv_store" (
  parent_path text collate "C" not null,
  path        text collate "C",
  key         text collate "C",
  value       bytea,
  constraint pkey primary key (path, key)
);
create index if not exists parent_path_idx on vault_kv_store(parent_path);
alter table "vault_kv_store" owner to "apiuser";
