\echo 'Updating isOrphaned to false wherever it is null'
update projects set "isOrphaned" = false where "isOrphaned" is NULL;
\echo 'Creating temp table for projects.id'
create temp table temp_pa as select id from projects;
\echo 'Removing projects from temp table where project.id is present in projectAccounts'
delete from temp_pa using "projectAccounts" where "projectAccounts"."projectId" = temp_pa.id;
\echo 'Updating projects.isOrphaned to true if project.id is present in temp table'
update projects set "isOrphaned" = true from temp_pa where temp_pa.id = projects.id;
\echo 'Dropping temp table'
drop table temp_pa;

-- Migration Script to populate jobstatesMap
\echo "Running migrations to populate jobstatesMap"
do $$
  begin
    if not exists(select 1 from "jobStatesMap" where "createdAt" < '2017-02-15 11:59:24.172+00' limit 1) then
      -- Migration Script to populate jobstatesMap for runs
      create temp table tjsm as WITH cte AS (
        SELECT "id", "projectId", "branchName", "runNumber", "createdAt", "statusCode", "isGitTag", "isPullRequest", "pullRequestNumber", "isRelease", "gitTagName", "releaseName", "subscriptionId", "createdBy", "commitSha", "updatedBy", "updatedAt", ROW_NUMBER() OVER (PARTITION BY "projectId", "branchName", "statusCode", "isGitTag", "isPullRequest", "isRelease" ORDER BY "createdAt" desc)
          AS rn FROM runs WHERE "statusCode" in (30, 40, 50, 60, 70, 80) and "branchName" is not null
      )
      SELECT "id", "projectId" as pid, "branchName" as bn, "runNumber", "createdAt", "statusCode", "isGitTag", "isPullRequest", "pullRequestNumber", "isRelease", "gitTagName", "releaseName", "subscriptionId", "commitSha", "createdBy", "updatedBy", "updatedAt"
      FROM cte
      WHERE rn = 1;

      -- add required columns to temp table tjsm
      alter table tjsm add column "contextTypeCode" int, add column "contextValue" varchar(255), add column "lastSuccessfulJobId" varchar(24), add column "lastFailedJobId" varchar(24), add column "lastUnstableJobId" varchar(24), add column "lastTimedoutJobId" varchar(24), add column "contextDetail" varchar(255);

      -- update null fields
      update tjsm T set "isPullRequest" = false where "isPullRequest" is null;
      update tjsm T set "isGitTag" = false where "isGitTag" is null;
      update tjsm T set "isRelease" = false where "isRelease" is null;
      update tjsm T set "releaseName" = T."gitTagName" where "isRelease" = true and "releaseName" is null;

      -- update contextTypeCode, contextValue
      update tjsm set "contextTypeCode" = 302, "contextValue" = tjsm."gitTagName", "contextDetail" = tjsm."commitSha" where "isGitTag" = true;
      update tjsm set "contextTypeCode" = 314, "contextValue" = tjsm."releaseName", "contextDetail" = tjsm."gitTagName" where "isRelease" = true;
      update tjsm set "contextTypeCode" = 304, "contextValue" = tjsm."pullRequestNumber", "contextDetail" = tjsm.bn where "isPullRequest" = true;
      update tjsm set "contextTypeCode" = 301, "contextValue" = tjsm.bn, "contextDetail" = tjsm."commitSha" where "isPullRequest" = false and "isGitTag" = false and "isRelease" = false;
      update tjsm set "updatedBy" = tjsm."createdBy" where "updatedBy" is null;

      -- update lastSuccessfulJobId, lastUnstableJobId, lastTimedoutJobId, lastFailedJobId
      update tjsm T1 set "lastSuccessfulJobId" = T2.id from tjsm T2 where T1."contextTypeCode" = T2."contextTypeCode" and T1."contextValue" = T2."contextValue" and T1.pid = T2.pid and T2."statusCode" = 30;

      update tjsm T1 set "lastUnstableJobId" = T2.id from tjsm T2 where T1."contextTypeCode" = T2."contextTypeCode" and T1."contextValue" = T2."contextValue" and T1.pid = T2.pid and T2."statusCode" = 50;

      update tjsm T1 set "lastTimedoutJobId" = T2.id from tjsm T2 where T1."contextTypeCode" = T2."contextTypeCode" and T1."contextValue" = T2."contextValue" and T1.pid = T2.pid and T2."statusCode" = 60;

      update tjsm T1 set "lastFailedJobId" = T2.id from tjsm T2 where T1."contextTypeCode" = T2."contextTypeCode" and T1."contextValue" = T2."contextValue" and T1.pid = T2.pid and T2."statusCode" = 80;

      -- creating a temp table temptjsm which have only latest records
      create temp table temptjsm as WITH cte AS (
        SELECT id,pid, "createdAt", "contextTypeCode", "contextValue", "contextDetail", "statusCode", "subscriptionId", "createdBy", "updatedBy", "updatedAt", "lastSuccessfulJobId", "lastUnstableJobId", "lastTimedoutJobId", "lastFailedJobId",
        ROW_NUMBER() OVER (PARTITION BY "pid", "contextTypeCode", "contextValue" ORDER BY "createdAt" desc)
        AS rn
        FROM tjsm
      )
      SELECT "id",pid, "createdAt", "statusCode", "contextTypeCode", "contextValue", "contextDetail", "lastSuccessfulJobId", "lastUnstableJobId", "lastTimedoutJobId", "lastFailedJobId", "subscriptionId", "createdBy", "updatedBy", "updatedAt"
      FROM cte
      WHERE rn = 1;

      -- insert if not present
      INSERT INTO "jobStatesMap" ("projectId", "subscriptionId", "jobTypeCode", "contextTypeCode", "contextValue", "contextDetail", "lastSuccessfulJobId", "lastUnstableJobId", "lastTimedoutJobId", "lastFailedJobId", "lastJobId", "createdBy", "updatedBy", "updatedAt", "createdAt")
      SELECT T1.pid, T1."subscriptionId", 201, T1."contextTypeCode", T1."contextValue", T1."contextDetail", T1."lastSuccessfulJobId", T1."lastUnstableJobId", T1."lastTimedoutJobId", T1."lastFailedJobId", T1.id, T1."createdBy", T1."updatedBy", T1."updatedAt", T1."createdAt" FROM temptjsm T1 left join "jobStatesMap" T2 on T1.pid = T2."projectId" and T1."contextTypeCode" = T2."contextTypeCode" and T1."contextValue" = T2."contextValue" where T2."projectId" IS NULL and T2."contextTypeCode" is null and T2."contextValue" is null;

      -- update if present
      update "jobStatesMap" T1 set "lastSuccessfulJobId" = T2."lastSuccessfulJobId" from temptjsm T2 where T1."projectId" = T2.pid and T1."contextTypeCode" = T2."contextTypeCode" and T1."contextValue" = T2."contextValue" and T1."lastSuccessfulJobId" is null and T2."lastSuccessfulJobId" is not null;

      update "jobStatesMap" T1 set "lastUnstableJobId" = T2."lastUnstableJobId" from temptjsm T2 where T1."projectId" = T2.pid and T1."contextTypeCode" = T2."contextTypeCode" and T1."contextValue" = T2."contextValue" and T1."lastUnstableJobId" is null and T2."lastUnstableJobId" is not null;

      update "jobStatesMap" T1 set "lastTimedoutJobId" = T2."lastTimedoutJobId" from temptjsm T2 where T1."projectId" = T2.pid and T1."contextTypeCode" = T2."contextTypeCode" and T1."contextValue" = T2."contextValue" and T1."lastTimedoutJobId" is null and T2."lastTimedoutJobId" is not null;

      update "jobStatesMap" T1 set "lastFailedJobId" = T2."lastFailedJobId" from temptjsm T2 where T1."projectId" = T2.pid and T1."contextTypeCode" = T2."contextTypeCode" and T1."contextValue" = T2."contextValue" and T1."lastFailedJobId" is null and T2."lastFailedJobId" is not null;

      update "jobStatesMap" T1 set "contextDetail" = T2."contextDetail" from temptjsm T2 where T1."projectId" = T2.pid and T1."contextTypeCode" = T2."contextTypeCode" and T1."contextValue" = T2."contextValue" and T1."contextDetail" is null and T2."contextDetail" is not null;

      drop table tjsm;
      drop table temptjsm;


      -- Migration Script to populate jobstatesMap for builds

      create temp table tjsm as WITH cte AS (
        SELECT "id", "projectId", "resourceId", "createdAt", "statusCode", "subscriptionId", "updatedAt",
          ROW_NUMBER() OVER (PARTITION BY "projectId", "resourceId", "statusCode" ORDER BY "createdAt" desc)
          AS rn
          FROM builds
          WHERE "statusCode" in (4002, 4003, 4004, 4006, 4008)
      )
      SELECT "id", "projectId" as pid, "resourceId" as rid, "createdAt", "statusCode", "subscriptionId", "updatedAt"
      FROM cte
      WHERE rn = 1;

      create temp table rtjsm as WITH cte AS (
         SELECT "id", "projectId", "createdAt", "createdBy", "updatedBy", "name", "typeCode", "isJob", "lastVersionName"
         FROM resources
         WHERE "isJob" = true
      )
      SELECT "id", "projectId" as rpid, "createdAt", "createdBy", "updatedBy", "name" as "contextValue", "typeCode" as "contextTypeCode", "lastVersionName" as "contextDetail"
      FROM cte;

      -- add required columns to temp table tjsm
      alter table tjsm add column "contextValue" varchar(255), add column "contextTypeCode" int, add column "contextDetail" varchar(255), add column "lastSuccessfulJobId" varchar(24), add column "lastFailedJobId" varchar(24), add column "createdBy" varchar(24), add column "updatedBy" varchar(24);

      -- update contextTypeCode, contextValue

      update rtjsm set "contextTypeCode" = system_codes_join.after from (
        select system_codes_right.code as before, system_codes_left.code as after
          from "systemCodes" system_codes_left join "systemCodes" system_codes_right
          on system_codes_left.name = system_codes_right.name and system_codes_left.group = 'jobStatesMapContextType' and system_codes_right.group = 'resource'
        ) as system_codes_join
        where rtjsm."contextTypeCode" = system_codes_join.before;

      update tjsm T1 set "contextValue" = T2."contextValue", "contextTypeCode" = T2."contextTypeCode", "createdBy" = T2."createdBy", "updatedBy" = T2."updatedBy", "contextDetail" = T2."contextDetail" from rtjsm T2 where T1.rid = T2.id;

      -- update lastSuccessfulJobId, lastFailedJobId
      update tjsm T1 set "lastSuccessfulJobId" = T2.id from tjsm T2 where T1."contextTypeCode" = T2."contextTypeCode" and T1."contextValue" = T2."contextValue" and T1.pid = T2.pid and T2."statusCode" = 4002 and T1.rid = T2.rid;

      update tjsm T1 set "lastFailedJobId" = T2.id from tjsm T2 where T1."contextTypeCode" = T2."contextTypeCode" and T1."contextValue" = T2."contextValue" and T1.pid = T2.pid and T2."statusCode" = 4003 and T1.rid = T2.rid;

      -- creating a temp table temptjsm which have only latest records
      create temp table temptjsm as WITH cte AS (
        SELECT id, pid, rid, "createdAt", "contextTypeCode", "contextValue", "contextDetail", "statusCode", "subscriptionId", "createdBy", "updatedBy", "updatedAt", "lastSuccessfulJobId", "lastFailedJobId",
          ROW_NUMBER() OVER (PARTITION BY "rid", "contextTypeCode", "contextValue" ORDER BY "createdAt" desc)
          AS rn FROM tjsm
      )
      SELECT "id", pid, rid, "createdAt", "statusCode", "contextTypeCode", "contextValue", "contextDetail", "lastSuccessfulJobId", "lastFailedJobId", "subscriptionId", "createdBy", "updatedBy", "updatedAt"
      FROM cte
      WHERE rn = 1;

      -- insert if not present
      INSERT INTO "jobStatesMap" ("projectId", "subscriptionId", "resourceId", "jobTypeCode", "contextTypeCode", "contextValue", "contextDetail", "lastSuccessfulJobId", "lastFailedJobId", "lastJobId", "createdBy", "updatedBy", "updatedAt", "createdAt")
      SELECT T1.pid, T1."subscriptionId", T1.rid, 202, T1."contextTypeCode", T1."contextValue", T1."contextDetail", T1."lastSuccessfulJobId", T1."lastFailedJobId", T1.id, T1."createdBy", T1."updatedBy", T1."updatedAt", T1."createdAt"
      FROM temptjsm T1
      left join "jobStatesMap" T2
      on T1.pid = T2."projectId" and T1."contextTypeCode" = T2."contextTypeCode" and T1."contextValue" = T2."contextValue"
      where T2."projectId" IS NULL and T2."contextTypeCode" is null and T2."contextValue" is null;

      -- update if present
      update "jobStatesMap" T1 set "lastSuccessfulJobId" = T2."lastSuccessfulJobId" from temptjsm T2 where T1."jobTypeCode" = 202 and T1."resourceId" = T2.rid and T1."contextTypeCode" = T2."contextTypeCode" and T1."contextValue" = T2."contextValue" and T1."lastSuccessfulJobId" is null and T2."lastSuccessfulJobId" is not null;

      update "jobStatesMap" T1 set "lastFailedJobId" = T2."lastFailedJobId" from temptjsm T2 where T1."jobTypeCode" = 202 and T1."resourceId" = T2.rid and T1."contextTypeCode" = T2."contextTypeCode" and T1."contextValue" = T2."contextValue" and T1."lastFailedJobId" is null and T2."lastFailedJobId" is not null;

      update "jobStatesMap" T1 set "contextDetail" = T2."contextDetail" from temptjsm T2 where T1."jobTypeCode" = 202 and T1."resourceId" = T2.rid and T1."contextTypeCode" = T2."contextTypeCode" and T1."contextValue" = T2."contextValue" and T1."contextDetail" is null and T2."contextDetail" is not null;

      drop table tjsm;
      drop table rtjsm;
      drop table temptjsm;
    end if;
  end
$$;
\echo "Completed running migrations to populate jobstatesMap"

-- Migrations to populate `endedAt` property in builds table
\echo 'Updating builds.endedAt to buildJobs.endedAt where builds.endedAt is null'
update builds set "endedAt" = "buildJobs"."endedAt" from "buildJobs" where builds.id = "buildJobs"."buildId" and builds."endedAt" is null;

\echo "Sucessfully completed post_install migrations"

-- Migrations to populate "isPaid" column in subscriptions table
\echo 'Updating subscriptions.isPaid = true where subscriptions.braintreeSubscriptionId is not null'
update subscriptions set "isPaid" = true where "braintreeSubscriptionId" is not null and "isPaid" is null;

\echo 'Updating subscriptions.isPaid = false where subscriptions.braintreeSubscriptionId is null'
update subscriptions set "isPaid" = false where "braintreeSubscriptionId" is null and "isPaid" is null;

\echo 'Updating subscriptions.isPaid = true if payment systemIntegration doesnt exist(for server installation)'
update subscriptions set "isPaid" = true where not exists (select 1 from "systemIntegrations" where name = 'payment' and "isEnabled" = true) and "isPaid" is not true;
