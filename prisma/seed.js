const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // Create default admin user
  const hashedPassword = await bcrypt.hash(process.env.ADMIN_PASSWORD || 'admin123', 10);
  
  const admin = await prisma.user.upsert({
    where: { email: process.env.ADMIN_EMAIL || 'admin@ecommerce.com' },
    update: {},
    create: {
      email: process.env.ADMIN_EMAIL || 'admin@ecommerce.com',
      password: hashedPassword,
      role: 'ADMIN',
      firstName: 'Admin',
      lastName: 'User',
      emailVerified: true,
      isActive: true,
    },
  });

  console.log('Created admin user:', admin.email);

  // Create default currency
  const usd = await prisma.currency.upsert({
    where: { code: 'USD' },
    update: {},
    create: {
      code: 'USD',
      name: 'US Dollar',
      symbol: '$',
      exchangeRate: 1,
      isActive: true,
      isDefault: true,
    },
  });

  console.log('Created default currency:', usd.code);

  // Create default language
  const english = await prisma.language.upsert({
    where: { code: 'en' },
    update: {},
    create: {
      code: 'en',
      name: 'English',
      isActive: true,
      isDefault: true,
    },
  });

  console.log('Created default language:', english.code);

  // Create default payment gateways
  const stripe = await prisma.paymentGateway.upsert({
    where: { type: 'STRIPE' },
    update: {},
    create: {
      name: 'Stripe',
      type: 'STRIPE',
      isActive: false,
      config: {},
      supportedCurrencies: ['USD', 'EUR', 'GBP'],
      supportedMethods: ['card', 'digital_wallet'],
    },
  });

  const razorpay = await prisma.paymentGateway.upsert({
    where: { type: 'RAZORPAY' },
    update: {},
    create: {
      name: 'Razorpay',
      type: 'RAZORPAY',
      isActive: false,
      config: {},
      supportedCurrencies: ['INR'],
      supportedMethods: ['card', 'upi', 'netbanking', 'wallet'],
    },
  });

  await prisma.paymentGateway.upsert({
    where: { type: 'PAYU' },
    update: {},
    create: {
      name: 'PayU',
      type: 'PAYU',
      isActive: false,
      config: {},
      supportedCurrencies: ['INR'],
      supportedMethods: ['card', 'upi', 'netbanking', 'wallet'],
    },
  });

  console.log('Created payment gateways');

  // Create default settings
  const settings = [
    { key: 'site_name', value: 'E-commerce Store', category: 'general', type: 'string' },
    { key: 'site_email', value: 'noreply@ecommerce.com', category: 'general', type: 'string' },
    { key: 'currency', value: 'USD', category: 'general', type: 'string' },
    { key: 'tax_enabled', value: 'true', category: 'tax', type: 'boolean' },
    { key: 'shipping_enabled', value: 'true', category: 'shipping', type: 'boolean' },
  ];

  for (const setting of settings) {
    await prisma.settings.upsert({
      where: { key: setting.key },
      update: {},
      create: setting,
    });
  }

  console.log('Created default settings');

  // Create sample category
  const category = await prisma.category.create({
    data: {
      name: 'Electronics',
      description: 'Electronic products',
      slug: 'electronics',
      isActive: true,
    },
  });

  console.log('Created sample category:', category.name);

  console.log('Seeding completed!');
}

main()
  .catch((e) => {
    console.error('Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });


