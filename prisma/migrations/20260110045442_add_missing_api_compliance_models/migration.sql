-- CreateTable
CREATE TABLE "APIUsage" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "endpoint" TEXT NOT NULL,
    "method" TEXT NOT NULL,
    "responseTime" INTEGER,
    "statusCode" INTEGER NOT NULL,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "APIUsage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LegalDocument" (
    "id" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "version" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "effectiveDate" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LegalDocument_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserAcceptance" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "documentType" TEXT NOT NULL,
    "documentVersion" TEXT NOT NULL,
    "acceptedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "ipAddress" TEXT,
    "userAgent" TEXT,

    CONSTRAINT "UserAcceptance_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TaxNexus" (
    "id" TEXT NOT NULL,
    "country" TEXT NOT NULL,
    "state" TEXT,
    "city" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TaxNexus_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "APIUsage_userId_idx" ON "APIUsage"("userId");

-- CreateIndex
CREATE INDEX "APIUsage_endpoint_idx" ON "APIUsage"("endpoint");

-- CreateIndex
CREATE INDEX "APIUsage_createdAt_idx" ON "APIUsage"("createdAt");

-- CreateIndex
CREATE INDEX "APIUsage_userId_createdAt_idx" ON "APIUsage"("userId", "createdAt");

-- CreateIndex
CREATE INDEX "LegalDocument_type_idx" ON "LegalDocument"("type");

-- CreateIndex
CREATE INDEX "LegalDocument_isActive_idx" ON "LegalDocument"("isActive");

-- CreateIndex
CREATE INDEX "LegalDocument_type_isActive_idx" ON "LegalDocument"("type", "isActive");

-- CreateIndex
CREATE INDEX "UserAcceptance_userId_idx" ON "UserAcceptance"("userId");

-- CreateIndex
CREATE INDEX "UserAcceptance_documentType_idx" ON "UserAcceptance"("documentType");

-- CreateIndex
CREATE INDEX "UserAcceptance_userId_documentType_idx" ON "UserAcceptance"("userId", "documentType");

-- CreateIndex
CREATE UNIQUE INDEX "UserAcceptance_userId_documentType_documentVersion_key" ON "UserAcceptance"("userId", "documentType", "documentVersion");

-- CreateIndex
CREATE INDEX "TaxNexus_country_idx" ON "TaxNexus"("country");

-- CreateIndex
CREATE INDEX "TaxNexus_country_state_idx" ON "TaxNexus"("country", "state");

-- CreateIndex
CREATE INDEX "TaxNexus_isActive_idx" ON "TaxNexus"("isActive");

-- CreateIndex
CREATE UNIQUE INDEX "TaxNexus_country_state_city_key" ON "TaxNexus"("country", "state", "city");

-- AddForeignKey
ALTER TABLE "APIUsage" ADD CONSTRAINT "APIUsage_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserAcceptance" ADD CONSTRAINT "UserAcceptance_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
