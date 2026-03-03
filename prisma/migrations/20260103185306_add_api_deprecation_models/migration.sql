-- CreateEnum
CREATE TYPE "DeprecationStatus" AS ENUM ('ANNOUNCED', 'DEPRECATED', 'SUNSET');

-- CreateEnum
CREATE TYPE "APIVersionStatus" AS ENUM ('CURRENT', 'DEPRECATED', 'SUNSET');

-- CreateTable
CREATE TABLE "ApiDeprecation" (
    "id" TEXT NOT NULL,
    "endpoint" TEXT NOT NULL,
    "version" TEXT NOT NULL,
    "replacement" TEXT,
    "deprecationDate" TIMESTAMP(3) NOT NULL,
    "sunsetDate" TIMESTAMP(3) NOT NULL,
    "status" "DeprecationStatus" NOT NULL DEFAULT 'ANNOUNCED',
    "noticePeriod" INTEGER NOT NULL DEFAULT 90,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ApiDeprecation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ApiVersion" (
    "id" TEXT NOT NULL,
    "version" TEXT NOT NULL,
    "status" "APIVersionStatus" NOT NULL DEFAULT 'CURRENT',
    "releaseDate" TIMESTAMP(3),
    "deprecationDate" TIMESTAMP(3),
    "sunsetDate" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ApiVersion_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ApiDeprecation_endpoint_idx" ON "ApiDeprecation"("endpoint");

-- CreateIndex
CREATE INDEX "ApiDeprecation_version_idx" ON "ApiDeprecation"("version");

-- CreateIndex
CREATE INDEX "ApiDeprecation_status_idx" ON "ApiDeprecation"("status");

-- CreateIndex
CREATE INDEX "ApiDeprecation_deprecationDate_idx" ON "ApiDeprecation"("deprecationDate");

-- CreateIndex
CREATE UNIQUE INDEX "ApiVersion_version_key" ON "ApiVersion"("version");

-- CreateIndex
CREATE INDEX "ApiVersion_version_idx" ON "ApiVersion"("version");

-- CreateIndex
CREATE INDEX "ApiVersion_status_idx" ON "ApiVersion"("status");
