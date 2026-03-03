/*
  Warnings:

  - You are about to drop the `ShippingCarrier` table. If the table is not empty, all the data it contains will be lost.

*/
-- CreateEnum
CREATE TYPE "LogisticsProviderType" AS ENUM ('SHIPROCKET', 'DELHIVERY', 'CLICKPOST', 'VAMASHIP', 'SHIPJEE', 'INDISPEED', 'ULIP');

-- DropForeignKey
ALTER TABLE "ShippingLabel" DROP CONSTRAINT "ShippingLabel_carrierId_fkey";

-- DropTable
DROP TABLE "ShippingCarrier";

-- CreateTable
CREATE TABLE "LogisticsProvider" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" "LogisticsProviderType" NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT false,
    "isDefault" BOOLEAN NOT NULL DEFAULT false,
    "config" JSONB NOT NULL,
    "supportedRegions" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "supportedServices" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "webhookUrl" TEXT,
    "webhookSecret" TEXT,
    "priority" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LogisticsProvider_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LogisticsShipment" (
    "id" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,
    "providerId" TEXT NOT NULL,
    "providerShipmentId" TEXT,
    "awbNumber" TEXT,
    "trackingNumber" TEXT,
    "status" TEXT NOT NULL,
    "providerStatus" TEXT,
    "rate" DECIMAL(10,2),
    "labelUrl" TEXT,
    "manifestUrl" TEXT,
    "pickupScheduled" BOOLEAN NOT NULL DEFAULT false,
    "pickupDate" TIMESTAMP(3),
    "estimatedDelivery" TIMESTAMP(3),
    "actualDelivery" TIMESTAMP(3),
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LogisticsShipment_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "LogisticsProvider_type_key" ON "LogisticsProvider"("type");

-- CreateIndex
CREATE INDEX "LogisticsProvider_type_idx" ON "LogisticsProvider"("type");

-- CreateIndex
CREATE INDEX "LogisticsProvider_isActive_idx" ON "LogisticsProvider"("isActive");

-- CreateIndex
CREATE INDEX "LogisticsProvider_isActive_priority_idx" ON "LogisticsProvider"("isActive", "priority");

-- CreateIndex
CREATE INDEX "LogisticsShipment_orderId_idx" ON "LogisticsShipment"("orderId");

-- CreateIndex
CREATE INDEX "LogisticsShipment_providerId_idx" ON "LogisticsShipment"("providerId");

-- CreateIndex
CREATE INDEX "LogisticsShipment_trackingNumber_idx" ON "LogisticsShipment"("trackingNumber");

-- CreateIndex
CREATE INDEX "LogisticsShipment_awbNumber_idx" ON "LogisticsShipment"("awbNumber");

-- CreateIndex
CREATE INDEX "LogisticsShipment_status_idx" ON "LogisticsShipment"("status");

-- CreateIndex
CREATE UNIQUE INDEX "LogisticsShipment_orderId_providerId_key" ON "LogisticsShipment"("orderId", "providerId");

-- AddForeignKey
ALTER TABLE "LogisticsShipment" ADD CONSTRAINT "LogisticsShipment_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LogisticsShipment" ADD CONSTRAINT "LogisticsShipment_providerId_fkey" FOREIGN KEY ("providerId") REFERENCES "LogisticsProvider"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ShippingLabel" ADD CONSTRAINT "ShippingLabel_carrierId_fkey" FOREIGN KEY ("carrierId") REFERENCES "LogisticsProvider"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
