-- AlterTable
ALTER TABLE "Product" ADD COLUMN     "brand" TEXT,
ADD COLUMN     "cancellationPolicy" JSONB,
ADD COLUMN     "careInstructions" TEXT,
ADD COLUMN     "countryOfOrigin" TEXT,
ADD COLUMN     "exchangePolicy" JSONB,
ADD COLUMN     "manufacturerInfo" JSONB,
ADD COLUMN     "modelNumber" TEXT,
ADD COLUMN     "originalPrice" DECIMAL(10,2),
ADD COLUMN     "refundPolicy" JSONB,
ADD COLUMN     "returnPolicy" JSONB,
ADD COLUMN     "shippingPolicy" JSONB,
ADD COLUMN     "weightDimensions" JSONB;
