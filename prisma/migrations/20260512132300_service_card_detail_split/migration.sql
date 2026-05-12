/*
  Warnings:

  - You are about to drop the column `content` on the `ServicePage` table. All the data in the column will be lost.
  - You are about to drop the column `coverImageUrl` on the `ServicePage` table. All the data in the column will be lost.
  - You are about to drop the `ServiceField` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "ServiceField" DROP CONSTRAINT "ServiceField_serviceId_fkey";

-- AlterTable
ALTER TABLE "ServicePage" DROP COLUMN "content",
DROP COLUMN "coverImageUrl",
ADD COLUMN     "cardContent" JSONB NOT NULL DEFAULT '{}',
ADD COLUMN     "detailContent" JSONB NOT NULL DEFAULT '{}',
ADD COLUMN     "hasDetailPage" BOOLEAN NOT NULL DEFAULT false;

-- DropTable
DROP TABLE "ServiceField";
