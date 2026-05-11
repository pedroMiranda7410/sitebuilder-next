-- AlterTable
ALTER TABLE "ServicePage" ADD COLUMN     "coverImageUrl" TEXT;

-- CreateTable
CREATE TABLE "SectionField" (
    "id" TEXT NOT NULL,
    "sectionId" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "translatable" BOOLEAN NOT NULL DEFAULT true,
    "placeholder" TEXT,
    "helpText" TEXT,
    "required" BOOLEAN NOT NULL DEFAULT false,
    "position" INTEGER NOT NULL DEFAULT 0,
    "options" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SectionField_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ServiceField" (
    "id" TEXT NOT NULL,
    "serviceId" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "translatable" BOOLEAN NOT NULL DEFAULT true,
    "placeholder" TEXT,
    "helpText" TEXT,
    "required" BOOLEAN NOT NULL DEFAULT false,
    "position" INTEGER NOT NULL DEFAULT 0,
    "options" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ServiceField_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "SectionField_sectionId_key_key" ON "SectionField"("sectionId", "key");

-- CreateIndex
CREATE UNIQUE INDEX "ServiceField_serviceId_key_key" ON "ServiceField"("serviceId", "key");

-- AddForeignKey
ALTER TABLE "SectionField" ADD CONSTRAINT "SectionField_sectionId_fkey" FOREIGN KEY ("sectionId") REFERENCES "Section"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ServiceField" ADD CONSTRAINT "ServiceField_serviceId_fkey" FOREIGN KEY ("serviceId") REFERENCES "ServicePage"("id") ON DELETE CASCADE ON UPDATE CASCADE;
