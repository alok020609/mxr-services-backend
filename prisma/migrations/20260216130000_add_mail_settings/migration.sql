-- CreateTable
CREATE TABLE "MailSettings" (
    "id" TEXT NOT NULL,
    "config" JSONB NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MailSettings_pkey" PRIMARY KEY ("id")
);

-- Seed default mail settings (singleton row)
INSERT INTO "MailSettings" ("id", "config", "updatedAt") VALUES (
  'default',
  '{"triggers":{"orderPlaced":false,"orderShipped":false,"invoiceCreated":false,"invoiceSent":false},"details":{"includeOrderSummary":true,"includeInvoicePdf":true,"includeShippingAddress":true}}'::jsonb,
  NOW()
);
