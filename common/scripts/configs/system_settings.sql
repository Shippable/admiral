do $$
  begin
    if not exists (select 1 from information_schema.columns where table_name = 'systemSettings') then
    -- This is the base table, do not add any fields here. Add them below.
      create table "systemSettings" (
        "id" INT PRIMARY KEY NOT NULL,
        "defaultMinionCount" INT DEFAULT 1 NOT NULL,
        "autoSelectBuilderToken" BOOLEAN DEFAULT false NOT NULL,
        "buildTimeoutMS" INT DEFAULT 3600000 NOT NULL,
        "defaultPrivateJobQuota" INT DEFAULT 150 NOT NULL,
        "serviceUserToken" VARCHAR(36) NOT NULL,
        "runMode" VARCHAR(36) DEFAULT 'production' NOT NULL,
        "allowSystemNodes" BOOLEAN DEFAULT true NOT NULL,
        "allowDynamicNodes" BOOLEAN DEFAULT false NOT NULL,
        "allowCustomNodes" BOOLEAN DEFAULT true NOT NULL,
        "awsAccountId" VARCHAR(12),
        "jobConsoleBatchSize" INTEGER DEFAULT 10 NOT NULL,
        "jobConsoleBufferTimeIntervalMS" INTEGER DEFAULT 3000 NOT NULL,
        "apiRetryIntervalMS" INTEGER DEFAULT 3000 NOT NULL,
        "truck" BOOLEAN DEFAULT false NOT NULL,
        "hubspotListId" INTEGER,
        "hubspotShouldSimulate" BOOLEAN,
        "rootS3Bucket" VARCHAR(64) NOT NULL,
        "nodeScriptsLocation" VARCHAR(255) NOT NULL,
        "enforcePrivateJobQuota" BOOLEAN DEFAULT false NOT NULL,
        "technicalSupportAvailable" BOOLEAN DEFAULT false NOT NULL,
        "customNodesAdminOnly" BOOLEAN DEFAULT false NOT NULL,
        "allowedSystemImageFamily" TEXT NOT NULL,
        "releaseVersion" VARCHAR(24) DEFAULT 'master' NOT NULL,
        "services" TEXT,
        "db" TEXT,
        "msg" TEXT,
        "state" TEXT,
        "secrets" TEXT,
        "redis" TEXT,
        "master" TEXT,
        "workers" TEXT,
        "mktgPageAggsLastDtTm" timestamp with time zone,
        "mktgCTAAggsLastDtTm" timestamp with time zone,
        "defaultMinionInstanceSize" VARCHAR(255),
        "createdAt" timestamp with time zone NOT NULL,
        "updatedAt" timestamp with time zone NOT NULL
      );
    end if;
  end
$$;

do $$
  begin
    if not exists (select 1 from "systemSettings" where "id" = 1) then
        insert into "systemSettings"
          (
            "id",
            "serviceUserToken",
            "rootS3Bucket",
            "nodeScriptsLocation",
            "allowedSystemImageFamily",
            "defaultMinionInstanceSize",
            "createdAt",
            "updatedAt"
          )
        values
          (
            1,
            '',
            '',
            '/home/shippable/scripts/node',
            'shippable/minv2|drydock/',
            'c4.large',
            CURRENT_TIMESTAMP,
            CURRENT_TIMESTAMP
          );
    end if;
  end
$$;
