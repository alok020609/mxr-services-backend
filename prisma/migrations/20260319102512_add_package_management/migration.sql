-- CreateEnum
CREATE TYPE "PackageOptionType" AS ENUM ('NUMBER', 'SELECT', 'BOOLEAN');

-- AlterTable
ALTER TABLE "CartItem" ADD COLUMN     "packageCustomization" JSONB,
ADD COLUMN     "packageId" TEXT;

-- AlterTable
ALTER TABLE "OrderItem" ADD COLUMN     "packageCustomizationSnapshot" JSONB,
ADD COLUMN     "packageId" TEXT;

-- CreateTable
CREATE TABLE "PackageTaxonomy" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "level" INTEGER NOT NULL DEFAULT 0,
    "parentId" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "metadata" JSONB,
    "tenantId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PackageTaxonomy_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Package" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "basePrice" DECIMAL(10,2) NOT NULL,
    "defaultFeatures" JSONB DEFAULT '[]',
    "isPopular" BOOLEAN NOT NULL DEFAULT false,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "taxonomyId" TEXT,
    "categoryId" TEXT,
    "tenantId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Package_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PackageOption" (
    "id" TEXT NOT NULL,
    "packageId" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "type" "PackageOptionType" NOT NULL,
    "config" JSONB NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "isRequired" BOOLEAN NOT NULL DEFAULT false,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PackageOption_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "PackageTaxonomy_parentId_idx" ON "PackageTaxonomy"("parentId");

-- CreateIndex
CREATE INDEX "PackageTaxonomy_tenantId_idx" ON "PackageTaxonomy"("tenantId");

-- CreateIndex
CREATE INDEX "PackageTaxonomy_isActive_idx" ON "PackageTaxonomy"("isActive");

-- CreateIndex
CREATE UNIQUE INDEX "PackageTaxonomy_slug_parentId_key" ON "PackageTaxonomy"("slug", "parentId");

-- CreateIndex
CREATE UNIQUE INDEX "Package_slug_key" ON "Package"("slug");

-- CreateIndex
CREATE INDEX "Package_slug_idx" ON "Package"("slug");

-- CreateIndex
CREATE INDEX "Package_taxonomyId_idx" ON "Package"("taxonomyId");

-- CreateIndex
CREATE INDEX "Package_categoryId_idx" ON "Package"("categoryId");

-- CreateIndex
CREATE INDEX "Package_isActive_idx" ON "Package"("isActive");

-- CreateIndex
CREATE INDEX "Package_tenantId_idx" ON "Package"("tenantId");

-- CreateIndex
CREATE INDEX "PackageOption_packageId_idx" ON "PackageOption"("packageId");

-- CreateIndex
CREATE INDEX "CartItem_packageId_idx" ON "CartItem"("packageId");

-- CreateIndex
CREATE INDEX "OrderItem_packageId_idx" ON "OrderItem"("packageId");

-- AddForeignKey
ALTER TABLE "PackageTaxonomy" ADD CONSTRAINT "PackageTaxonomy_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "PackageTaxonomy"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Package" ADD CONSTRAINT "Package_taxonomyId_fkey" FOREIGN KEY ("taxonomyId") REFERENCES "PackageTaxonomy"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Package" ADD CONSTRAINT "Package_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PackageOption" ADD CONSTRAINT "PackageOption_packageId_fkey" FOREIGN KEY ("packageId") REFERENCES "Package"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CartItem" ADD CONSTRAINT "CartItem_packageId_fkey" FOREIGN KEY ("packageId") REFERENCES "Package"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrderItem" ADD CONSTRAINT "OrderItem_packageId_fkey" FOREIGN KEY ("packageId") REFERENCES "Package"("id") ON DELETE SET NULL ON UPDATE CASCADE;
