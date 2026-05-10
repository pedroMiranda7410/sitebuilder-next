-- AlterTable
ALTER TABLE "Tenant" ADD COLUMN     "defaultLang" TEXT NOT NULL DEFAULT 'pt',
ADD COLUMN     "languages" TEXT[] DEFAULT ARRAY['pt']::TEXT[];
