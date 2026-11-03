-- Rename duplicate usernames so the unique index can be created.
UPDATE "user" u
SET "name" = u."name" || '-' || LEFT(u."id", 4)
FROM (
  SELECT "id", ROW_NUMBER() OVER (PARTITION BY LOWER("name") ORDER BY "createdAt", "id") AS rn
  FROM "user"
) d
WHERE u."id" = d."id" AND d.rn > 1;

DROP TABLE "session";
DROP TABLE "account";
DROP TABLE "verification";

DROP INDEX "user_email_key";
ALTER TABLE "user" DROP COLUMN "email", DROP COLUMN "emailVerified";

CREATE UNIQUE INDEX "user_name_key" ON "user"("name");
