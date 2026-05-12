/*
  Warnings:

  - You are about to drop the column `customFields` on the `EventSignup` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "EventSignup" DROP COLUMN "customFields",
ADD COLUMN     "responses" JSONB NOT NULL DEFAULT '{}',
ALTER COLUMN "name" DROP NOT NULL,
ALTER COLUMN "email" DROP NOT NULL;

-- AlterTable
ALTER TABLE "SiteEvent" ADD COLUMN     "collectSignups" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "formSchema" JSONB NOT NULL DEFAULT '[]';
