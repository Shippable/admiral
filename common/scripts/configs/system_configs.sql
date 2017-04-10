do $$
  begin
    if not exists (select 1 from information_schema.columns where table_name = 'systemConfigs') then
    -- This is the base table, do not add any fields here. Add them below.
      create table "systemConfigs" (
        "id" INT PRIMARY KEY NOT NULL,
        "defaultMinionCount" INT DEFAULT 1 NOT NULL,
        "autoSelectBuilderToken" BOOLEAN DEFAULT false NOT NULL,
        "buildTimeoutMS" INT DEFAULT 3600000 NOT NULL,
        "defaultPrivateJobQuota" INT DEFAULT 150 NOT NULL,
        "vaultUrl" VARCHAR(255) DEFAULT '' NOT NULL,
        "runMode" VARCHAR(255) DEFAULT 'production' NOT NULL,
        "createdAt" timestamp with time zone NOT NULL,
        "updatedAt" timestamp with time zone NOT NULL
      );
    end if;

    -- Drop fields here:
    if exists (select 1 from information_schema.columns where table_name = 'systemConfigs' and column_name = 'execImage') then
      alter table "systemConfigs" drop column "execImage";
    end if;

    if exists (select 1 from information_schema.columns where table_name = 'systemConfigs' and column_name = 'dynamicNodesSystemIntegrationId') then
      alter table "systemConfigs" drop column "dynamicNodesSystemIntegrationId";
    end if;

    if exists (select 1 from information_schema.columns where table_name = 'systemConfigs' and column_name = 'vaultRefreshTimeInSec') then
      alter table "systemConfigs" drop column "vaultRefreshTimeInSec";
    end if;

    if exists (select 1 from information_schema.columns where table_name = 'systemConfigs' and column_name = 'serverEnabled') then
      alter table "systemConfigs" drop column "serverEnabled";
    end if;

    if exists (select 1 from information_schema.columns where table_name = 'systemConfigs' and column_name = 'defaultPipelineCount') then
      alter table "systemConfigs" drop column "defaultPipelineCount";
    end if;

    if exists (select 1 from information_schema.columns where table_name = 'systemConfigs' and column_name = 'segmentMktgKey') then
      alter table "systemConfigs" drop column "segmentMktgKey";
    end if;

    -- Add new fields here:
    if not exists (select 1 from information_schema.columns where table_name = 'systemConfigs' and column_name = 'systemNodePrivateKey') then
      alter table "systemConfigs" add column "systemNodePrivateKey" TEXT default '';
    end if;

    if not exists (select 1 from information_schema.columns where table_name = 'systemConfigs' and column_name = 'systemNodePublicKey') then
      alter table "systemConfigs" add column "systemNodePublicKey" VARCHAR(1020) default '';
    end if;

    if not exists (select 1 from information_schema.columns where table_name = 'systemConfigs' and column_name = 'allowSystemNodes') then
      alter table "systemConfigs" add column "allowSystemNodes" BOOLEAN default false;
    end if;

    if not exists (select 1 from information_schema.columns where table_name = 'systemConfigs' and column_name = 'allowDynamicNodes') then
      alter table "systemConfigs" add column "allowDynamicNodes" BOOLEAN default false;
    end if;

    if not exists (select 1 from information_schema.columns where table_name = 'systemConfigs' and column_name = 'allowCustomNodes') then
      alter table "systemConfigs" add column "allowCustomNodes" BOOLEAN default false;
    end if;

    if not exists (select 1 from information_schema.columns where table_name = 'systemConfigs' and column_name = 'consoleMaxLifespan') then
      alter table "systemConfigs" add column "consoleMaxLifespan" INT default 0;
    end if;

    if not exists (select 1 from information_schema.columns where table_name = 'systemConfigs' and column_name = 'consoleCleanupHour') then
      alter table "systemConfigs" add column "consoleCleanupHour" INT default 0;
    end if;

    if exists (select 1 from information_schema.columns where table_name = 'systemConfigs' and column_name = 'customHostDockerVersion' and data_type = 'integer') then
      alter table "systemConfigs" alter column "customHostDockerVersion" type VARCHAR(24);
    end if;

    if not exists (select 1 from information_schema.columns where table_name = 'systemConfigs' and column_name = 'customHostDockerVersion') then
      alter table "systemConfigs" add column "customHostDockerVersion" VARCHAR(24) default '1.11.1';
    end if;

    if not exists (select 1 from information_schema.columns where table_name = 'systemConfigs' and column_name = 'awsAccountId') then
      alter table "systemConfigs" add column "awsAccountId" varchar(12) default '';
    end if;

    if not exists (select 1 from information_schema.columns where table_name = 'systemConfigs' and column_name = 'jobConsoleBatchSize') then
      alter table "systemConfigs" add column "jobConsoleBatchSize" INTEGER default 10;
    end if;

    if not exists (select 1 from information_schema.columns where table_name = 'systemConfigs' and column_name = 'jobConsoleBufferTimeInterval') then
      alter table "systemConfigs" add column "jobConsoleBufferTimeInterval" INTEGER default 3000;
    end if;

    if not exists (select 1 from information_schema.columns where table_name = 'systemConfigs' and column_name = 'defaultCronLoopHours') then
      alter table "systemConfigs" add column "defaultCronLoopHours" INTEGER default 2;
    end if;

    if not exists (select 1 from information_schema.columns where table_name = 'systemConfigs' and column_name = 'apiRetryInterval') then
      alter table "systemConfigs" add column "apiRetryInterval" INTEGER default 3;
    end if;

    if not exists (select 1 from information_schema.columns where table_name = 'systemConfigs' and column_name = 'truck') then
      alter table "systemConfigs" add column "truck" BOOLEAN default false;
    end if;

    if not exists (select 1 from information_schema.columns where table_name = 'systemConfigs' and column_name = 'hubspotShouldSimulate') then
      alter table "systemConfigs" add column "hubspotShouldSimulate" BOOLEAN default true;
    end if;

    if not exists (select 1 from information_schema.columns where table_name = 'systemConfigs' and column_name = 'hubspotTimeLimit') then
      alter table "systemConfigs" add column "hubspotTimeLimit" INTEGER default 10;
    end if;

    if not exists (select 1 from information_schema.columns where table_name = 'systemConfigs' and column_name = 'hubspotListId') then
      alter table "systemConfigs" add column "hubspotListId" INTEGER default 123;
    end if;

    if not exists (select 1 from information_schema.columns where table_name = 'systemConfigs' and column_name = 'rootS3Bucket') then
      alter table "systemConfigs" add column "rootS3Bucket" varchar(64) default '';
    end if;

    if not exists (select 1 from information_schema.columns where table_name = 'systemConfigs' and column_name = 'nodeScriptsLocation') then
      alter table "systemConfigs" add column "nodeScriptsLocation" varchar(255) default '/home/shippable/scripts/node';
    end if;

    if not exists (select 1 from information_schema.columns where table_name = 'systemConfigs' and column_name = 'enforcePrivateJobQuota') then
      alter table "systemConfigs" add column "enforcePrivateJobQuota" BOOLEAN default false not null;
    end if;

    if not exists (select 1 from information_schema.columns where table_name = 'systemConfigs' and column_name = 'technicalSupportAvailable') then
      alter table "systemConfigs" add column "technicalSupportAvailable" BOOLEAN default false not null;
    end if;

    if not exists (select 1 from information_schema.columns where table_name = 'systemConfigs' and column_name = 'customNodesAdminOnly') then
      alter table "systemConfigs" add column "customNodesAdminOnly" BOOLEAN default false not null;
    end if;

    if not exists (select 1 from information_schema.columns where table_name = 'systemConfigs' and column_name = 'allowedSystemImageFamily') then
      alter table "systemConfigs" add column "allowedSystemImageFamily" TEXT default 'shippable/minv2|drydock/';
    end if;

    if not exists (select 1 from information_schema.columns where table_name = 'systemConfigs' and column_name = 'isBootstrapped') then
      alter table "systemConfigs" add column "isBootstrapped" BOOLEAN default false NOT NULL;
    end if;

    if not exists (select 1 from information_schema.columns where table_name = 'systemConfigs' and column_name = 'release') then
      alter table "systemConfigs" add column "release" VARCHAR(24) default 'master' NOT NULL;
    end if;

    if not exists (select 1 from information_schema.columns where table_name = 'systemConfigs' and column_name = 'services') then
      alter table "systemConfigs" add column "services" TEXT;
    end if;

    if not exists (select 1 from information_schema.columns where table_name = 'systemConfigs' and column_name = 'db') then
      alter table "systemConfigs" add column "db" TEXT;
    end if;

    if not exists (select 1 from information_schema.columns where table_name = 'systemConfigs' and column_name = 'msg') then
      alter table "systemConfigs" add column "msg" TEXT;
    end if;

    if not exists (select 1 from information_schema.columns where table_name = 'systemConfigs' and column_name = 'state') then
      alter table "systemConfigs" add column "state" TEXT;
    end if;

    if not exists (select 1 from information_schema.columns where table_name = 'systemConfigs' and column_name = 'secrets') then
      alter table "systemConfigs" add column "secrets" TEXT;
    end if;

    if not exists (select 1 from information_schema.columns where table_name = 'systemConfigs' and column_name = 'redis') then
      alter table "systemConfigs" add column "redis" TEXT;
    end if;

    if not exists (select 1 from information_schema.columns where table_name = 'systemConfigs' and column_name = 'master') then
      alter table "systemConfigs" add column "master" TEXT;
    end if;

    if not exists (select 1 from information_schema.columns where table_name = 'systemConfigs' and column_name = 'workers') then
      alter table "systemConfigs" add column "workers" TEXT;
    end if;

    -- Alter any defaults here:
    if exists (select 1 from information_schema.columns where table_name = 'systemConfigs' and column_name = 'autoSelectBuilderToken') then
      alter table "systemConfigs" alter column "autoSelectBuilderToken" set default false;
    end if;

    if exists (select 1 from information_schema.columns where table_name = 'systemConfigs' and column_name = 'jobConsoleBatchSize') then
      alter table "systemConfigs" alter column "jobConsoleBatchSize" set default 10;
    end if;

    if exists (select 1 from information_schema.columns where table_name = 'systemConfigs' and column_name = 'jobConsoleBufferTimeInterval') then
      alter table "systemConfigs" alter column "jobConsoleBufferTimeInterval" set default 3000;
    end if;

    if exists (select 1 from information_schema.columns where table_name = 'systemConfigs' and column_name = 'truck') then
      alter table "systemConfigs" alter column "truck" set default false;
    end if;

    if exists (select 1 from information_schema.columns where table_name = 'systemConfigs' and column_name = 'runMode') then
      alter table "systemConfigs" alter column "runMode" set default 'production';
    end if;

    if exists (select 1 from information_schema.columns where table_name = 'systemConfigs' and column_name = 'apiRetryInterval') then
      alter table "systemConfigs" alter column "apiRetryInterval" set default 3;
    end if;


    alter table "systemConfigs" owner to "apiuser";
  end
$$;

do $$
  begin
    if not exists (select 1 from "systemConfigs" where "id" = 1) then
        insert into "systemConfigs"
          (
            "id",
            "createdAt",
            "updatedAt"
          )
        values
          (
            1,
            CURRENT_TIMESTAMP,
            CURRENT_TIMESTAMP
          );
    end if;
  end
$$;

-- Alter table to set NOT NULL here:
do $$
  begin
    if exists (select 1 from information_schema.columns where table_name = 'systemConfigs' and column_name = 'vaultUrl') then
      alter table "systemConfigs" alter column "vaultUrl" set not null;
    end if;

    if exists (select 1 from information_schema.columns where table_name = 'systemConfigs' and column_name = 'customHostDockerVersion') then
      alter table "systemConfigs" alter column "customHostDockerVersion" set not null;
    end if;

    if exists (select 1 from information_schema.columns where table_name = 'systemConfigs' and column_name = 'jobConsoleBatchSize') then
      alter table "systemConfigs" alter column "jobConsoleBatchSize" set not null;
    end if;

    if exists (select 1 from information_schema.columns where table_name = 'systemConfigs' and column_name = 'jobConsoleBufferTimeInterval') then
      alter table "systemConfigs" alter column "jobConsoleBufferTimeInterval" set not null;
    end if;

    if exists (select 1 from information_schema.columns where table_name = 'systemConfigs' and column_name = 'defaultCronLoopHours') then
      alter table "systemConfigs" alter column "defaultCronLoopHours" set not null;
    end if;

    if exists (select 1 from information_schema.columns where table_name = 'systemConfigs' and column_name = 'apiRetryInterval') then
      alter table "systemConfigs" alter column "apiRetryInterval" set not null;
    end if;

    if exists (select 1 from information_schema.columns where table_name = 'systemConfigs' and column_name = 'rootS3Bucket') then
      alter table "systemConfigs" alter column "rootS3Bucket" set not null;
    end if;

    if exists (select 1 from information_schema.columns where table_name = 'systemConfigs' and column_name = 'autoSelectBuilderToken') then
      alter table "systemConfigs" alter column "autoSelectBuilderToken" set not null;
    end if;

    if exists (select 1 from information_schema.columns where table_name = 'systemConfigs' and column_name = 'truck') then
      alter table "systemConfigs" alter column "truck" set not null;
    end if;

    if exists (select 1 from information_schema.columns where table_name = 'systemConfigs' and column_name = 'allowedSystemImageFamily') then
      alter table "systemConfigs" alter column "allowedSystemImageFamily" set not null;
    end if;
  end
$$;
