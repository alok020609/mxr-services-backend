-- CreateEnum
CREATE TYPE "EmailServiceType" AS ENUM ('SMTP', 'SENDGRID', 'MAILGUN', 'AWS_SES');

-- CreateEnum
CREATE TYPE "SMSServiceType" AS ENUM ('TWILIO', 'AWS_SNS', 'MESSAGEBIRD');

-- CreateTable
CREATE TABLE "EmailService" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" "EmailServiceType" NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT false,
    "isDefault" BOOLEAN NOT NULL DEFAULT false,
    "config" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "EmailService_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SMSService" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" "SMSServiceType" NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT false,
    "isDefault" BOOLEAN NOT NULL DEFAULT false,
    "config" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SMSService_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "EmailService_type_key" ON "EmailService"("type");

-- CreateIndex
CREATE INDEX "EmailService_type_idx" ON "EmailService"("type");

-- CreateIndex
CREATE INDEX "EmailService_isActive_idx" ON "EmailService"("isActive");

-- CreateIndex
CREATE UNIQUE INDEX "SMSService_type_key" ON "SMSService"("type");

-- CreateIndex
CREATE INDEX "SMSService_type_idx" ON "SMSService"("type");

-- CreateIndex
CREATE INDEX "SMSService_isActive_idx" ON "SMSService"("isActive");
