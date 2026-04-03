import 'dotenv/config';
import { PrismaClient, OrderStatus, PaymentMethod, PaymentMode } from '../src/generated/prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import * as bcrypt from 'bcrypt';

const adapter = new PrismaPg({ connectionString: process.env['DATABASE_URL']! });
const prisma = new PrismaClient({ adapter });

function randomInt(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomPick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function generateReferenceCode(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = '';
  for (let i = 0; i < 8; i++) code += chars[Math.floor(Math.random() * chars.length)];
  return code;
}

const CUSTOMER_NAMES = [
  'Emma Wilson', 'James Chen', 'Sofia Rodriguez', 'Liam O\'Brien',
  'Aisha Patel', 'Noah Kim', 'Olivia Brown', 'Ethan Nguyen',
  'Mia Johnson', 'Lucas Garcia', 'Isabella Lee', 'Mason Davis',
  'Charlotte Martinez', 'Logan Anderson', 'Amelia Taylor', 'Alexander Thomas',
  'Harper White', 'Benjamin Harris', 'Evelyn Clark', 'William Lewis',
];

async function main() {
  console.log('🌱 Seeding database...\n');

  // ── Clean existing data ──
  console.log('🗑️  Clearing existing data...');
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.stripeEvent.deleteMany();
  await prisma.menuItem.deleteMany();
  await prisma.menuCategory.deleteMany();
  await prisma.venue.deleteMany();
  await prisma.user.deleteMany();
  console.log('   Done.\n');

  // ── Create demo user ──
  console.log('👤 Creating demo user...');
  const passwordHash = await bcrypt.hash('password123', 10);
  const user = await prisma.user.create({
    data: {
      email: 'demo@bitebyte.app',
      passwordHash,
    },
  });
  console.log(`   Email: demo@bitebyte.app / Password: password123\n`);

  // ── Create venues ──
  console.log('🏪 Creating venues...');

  const venue1 = await prisma.venue.create({
    data: {
      name: 'The Golden Fork',
      slug: 'the-golden-fork',
      paymentMode: PaymentMode.BOTH,
      ownerId: user.id,
    },
  });

  const venue2 = await prisma.venue.create({
    data: {
      name: 'Street Bites Food Truck',
      slug: 'street-bites',
      paymentMode: PaymentMode.PAY_AT_COUNTER,
      ownerId: user.id,
    },
  });

  console.log(`   ${venue1.name} (${venue1.slug})`);
  console.log(`   ${venue2.name} (${venue2.slug})\n`);

  // ── Menu for The Golden Fork ──
  console.log('📋 Creating menus...');

  const startersCategory = await prisma.menuCategory.create({
    data: { venueId: venue1.id, name: 'Starters', sortOrder: 0 },
  });
  const mainsCategory = await prisma.menuCategory.create({
    data: { venueId: venue1.id, name: 'Mains', sortOrder: 1 },
  });
  const dessertsCategory = await prisma.menuCategory.create({
    data: { venueId: venue1.id, name: 'Desserts', sortOrder: 2 },
  });
  const drinksCategory = await prisma.menuCategory.create({
    data: { venueId: venue1.id, name: 'Drinks', sortOrder: 3 },
  });

  const venue1Items = await Promise.all([
    // Starters
    prisma.menuItem.create({ data: { venueId: venue1.id, categoryId: startersCategory.id, name: 'Bruschetta', description: 'Toasted sourdough with tomato, basil, and garlic', price: 8.50, sortOrder: 0 } }),
    prisma.menuItem.create({ data: { venueId: venue1.id, categoryId: startersCategory.id, name: 'Soup of the Day', description: 'Chef\'s daily selection with crusty bread', price: 7.00, sortOrder: 1 } }),
    prisma.menuItem.create({ data: { venueId: venue1.id, categoryId: startersCategory.id, name: 'Calamari', description: 'Crispy fried squid with aioli', price: 11.00, sortOrder: 2 } }),
    prisma.menuItem.create({ data: { venueId: venue1.id, categoryId: startersCategory.id, name: 'Caesar Salad', description: 'Romaine, parmesan, croutons, house dressing', price: 9.50, sortOrder: 3 } }),
    // Mains
    prisma.menuItem.create({ data: { venueId: venue1.id, categoryId: mainsCategory.id, name: 'Grilled Salmon', description: 'Atlantic salmon with lemon butter, seasonal veg', price: 24.00, sortOrder: 0 } }),
    prisma.menuItem.create({ data: { venueId: venue1.id, categoryId: mainsCategory.id, name: 'Wagyu Burger', description: '200g wagyu patty, aged cheddar, truffle aioli, brioche bun', price: 22.00, sortOrder: 1 } }),
    prisma.menuItem.create({ data: { venueId: venue1.id, categoryId: mainsCategory.id, name: 'Mushroom Risotto', description: 'Arborio rice, wild mushrooms, truffle oil, parmesan', price: 19.00, sortOrder: 2 } }),
    prisma.menuItem.create({ data: { venueId: venue1.id, categoryId: mainsCategory.id, name: 'Fish & Chips', description: 'Beer-battered cod, hand-cut chips, tartare sauce', price: 18.50, sortOrder: 3 } }),
    prisma.menuItem.create({ data: { venueId: venue1.id, categoryId: mainsCategory.id, name: 'Steak Frites', description: '250g sirloin, herb butter, fries, peppercorn sauce', price: 28.00, sortOrder: 4 } }),
    // Desserts
    prisma.menuItem.create({ data: { venueId: venue1.id, categoryId: dessertsCategory.id, name: 'Tiramisu', description: 'Classic Italian coffee dessert', price: 10.00, sortOrder: 0 } }),
    prisma.menuItem.create({ data: { venueId: venue1.id, categoryId: dessertsCategory.id, name: 'Chocolate Lava Cake', description: 'Warm fondant with vanilla ice cream', price: 12.00, sortOrder: 1 } }),
    prisma.menuItem.create({ data: { venueId: venue1.id, categoryId: dessertsCategory.id, name: 'Crème Brûlée', description: 'Vanilla bean custard, caramelized sugar', price: 9.00, sortOrder: 2 } }),
    // Drinks
    prisma.menuItem.create({ data: { venueId: venue1.id, categoryId: drinksCategory.id, name: 'Espresso', description: 'Double shot', price: 4.00, sortOrder: 0 } }),
    prisma.menuItem.create({ data: { venueId: venue1.id, categoryId: drinksCategory.id, name: 'Fresh Lemonade', description: 'Homemade with mint', price: 5.50, sortOrder: 1 } }),
    prisma.menuItem.create({ data: { venueId: venue1.id, categoryId: drinksCategory.id, name: 'Sparkling Water', description: '750ml bottle', price: 4.50, sortOrder: 2 } }),
    prisma.menuItem.create({ data: { venueId: venue1.id, categoryId: drinksCategory.id, name: 'House Red Wine', description: 'Glass of Shiraz', price: 12.00, sortOrder: 3 } }),
  ]);

  // ── Menu for Street Bites ──
  const wrapsCategory = await prisma.menuCategory.create({
    data: { venueId: venue2.id, name: 'Wraps & Bowls', sortOrder: 0 },
  });
  const sidesCategory = await prisma.menuCategory.create({
    data: { venueId: venue2.id, name: 'Sides', sortOrder: 1 },
  });
  const coldDrinksCategory = await prisma.menuCategory.create({
    data: { venueId: venue2.id, name: 'Cold Drinks', sortOrder: 2 },
  });

  const venue2Items = await Promise.all([
    prisma.menuItem.create({ data: { venueId: venue2.id, categoryId: wrapsCategory.id, name: 'Chicken Shawarma Wrap', description: 'Spiced chicken, garlic sauce, pickles', price: 13.00, sortOrder: 0 } }),
    prisma.menuItem.create({ data: { venueId: venue2.id, categoryId: wrapsCategory.id, name: 'Falafel Bowl', description: 'Crispy falafel, hummus, tabbouleh, tahini', price: 12.00, sortOrder: 1 } }),
    prisma.menuItem.create({ data: { venueId: venue2.id, categoryId: wrapsCategory.id, name: 'Korean BBQ Wrap', description: 'Bulgogi beef, kimchi slaw, sriracha mayo', price: 14.00, sortOrder: 2 } }),
    prisma.menuItem.create({ data: { venueId: venue2.id, categoryId: sidesCategory.id, name: 'Sweet Potato Fries', description: 'With chipotle dip', price: 6.00, sortOrder: 0 } }),
    prisma.menuItem.create({ data: { venueId: venue2.id, categoryId: sidesCategory.id, name: 'Loaded Nachos', description: 'Cheese, jalapeños, sour cream, salsa', price: 9.00, sortOrder: 1 } }),
    prisma.menuItem.create({ data: { venueId: venue2.id, categoryId: coldDrinksCategory.id, name: 'Iced Coffee', description: 'Cold brew with oat milk', price: 5.00, sortOrder: 0 } }),
    prisma.menuItem.create({ data: { venueId: venue2.id, categoryId: coldDrinksCategory.id, name: 'Mango Smoothie', description: 'Fresh mango, banana, coconut milk', price: 7.00, sortOrder: 1 } }),
  ]);

  console.log(`   The Golden Fork: ${venue1Items.length} items across 4 categories`);
  console.log(`   Street Bites: ${venue2Items.length} items across 3 categories\n`);

  // ── Generate orders spanning ~2 months ──
  console.log('📦 Generating orders over the last 60 days...');

  const now = new Date();
  const allStatuses: OrderStatus[] = ['RECEIVED', 'PREPARING', 'READY', 'COMPLETED'];
  const referenceCodes = new Set<string>();

  let venue1OrderCount = 0;
  let venue2OrderCount = 0;

  for (let daysAgo = 60; daysAgo >= 0; daysAgo--) {
    const date = new Date(now);
    date.setDate(date.getDate() - daysAgo);
    date.setHours(0, 0, 0, 0);

    const isWeekend = date.getDay() === 0 || date.getDay() === 6;

    // Venue 1 — busier restaurant, growing over time
    const v1BaseOrders = isWeekend ? randomInt(8, 16) : randomInt(4, 12);
    // Growth trend: more orders in recent weeks
    const growthMultiplier = 1 + ((60 - daysAgo) / 60) * 0.5;
    const v1Orders = Math.round(v1BaseOrders * growthMultiplier);

    for (let i = 0; i < v1Orders; i++) {
      const hour = randomInt(11, 22);
      const minute = randomInt(0, 59);
      const orderDate = new Date(date);
      orderDate.setHours(hour, minute, randomInt(0, 59));

      const itemCount = randomInt(1, 4);
      const orderItems: { menuItemId: string; name: string; price: number; quantity: number }[] = [];
      const usedItems = new Set<string>();

      for (let j = 0; j < itemCount; j++) {
        const item = randomPick(venue1Items);
        if (usedItems.has(item.id)) continue;
        usedItems.add(item.id);
        orderItems.push({
          menuItemId: item.id,
          name: item.name,
          price: Number(item.price),
          quantity: randomInt(1, 3),
        });
      }

      if (orderItems.length === 0) continue;

      const totalAmount = orderItems.reduce((sum, oi) => sum + oi.price * oi.quantity, 0);
      const paymentMethod: PaymentMethod = Math.random() > 0.3 ? 'STRIPE' : 'PAY_AT_COUNTER';

      // Recent orders can be in various statuses, older ones are completed
      let status: OrderStatus;
      if (daysAgo <= 1) {
        status = randomPick(allStatuses);
      } else {
        status = 'COMPLETED';
      }

      let refCode: string;
      do { refCode = generateReferenceCode(); } while (referenceCodes.has(refCode));
      referenceCodes.add(refCode);

      await prisma.order.create({
        data: {
          venueId: venue1.id,
          status,
          paymentMethod,
          totalAmount,
          referenceCode: refCode,
          customerName: randomPick(CUSTOMER_NAMES),
          createdAt: orderDate,
          updatedAt: orderDate,
          items: {
            create: orderItems.map((oi) => ({
              menuItemId: oi.menuItemId,
              itemNameAtOrder: oi.name,
              unitPriceAtOrder: oi.price,
              quantity: oi.quantity,
              createdAt: orderDate,
            })),
          },
        },
      });
      venue1OrderCount++;
    }

    // Venue 2 — smaller food truck, fewer orders
    const v2Orders = isWeekend ? randomInt(3, 8) : randomInt(1, 5);

    for (let i = 0; i < v2Orders; i++) {
      const hour = randomInt(11, 20);
      const minute = randomInt(0, 59);
      const orderDate = new Date(date);
      orderDate.setHours(hour, minute, randomInt(0, 59));

      const itemCount = randomInt(1, 3);
      const orderItems: { menuItemId: string; name: string; price: number; quantity: number }[] = [];
      const usedItems = new Set<string>();

      for (let j = 0; j < itemCount; j++) {
        const item = randomPick(venue2Items);
        if (usedItems.has(item.id)) continue;
        usedItems.add(item.id);
        orderItems.push({
          menuItemId: item.id,
          name: item.name,
          price: Number(item.price),
          quantity: randomInt(1, 2),
        });
      }

      if (orderItems.length === 0) continue;

      const totalAmount = orderItems.reduce((sum, oi) => sum + oi.price * oi.quantity, 0);

      let status: OrderStatus;
      if (daysAgo <= 1) {
        status = randomPick(allStatuses);
      } else {
        status = 'COMPLETED';
      }

      let refCode: string;
      do { refCode = generateReferenceCode(); } while (referenceCodes.has(refCode));
      referenceCodes.add(refCode);

      await prisma.order.create({
        data: {
          venueId: venue2.id,
          status,
          paymentMethod: 'PAY_AT_COUNTER',
          totalAmount,
          referenceCode: refCode,
          customerName: randomPick(CUSTOMER_NAMES),
          createdAt: orderDate,
          updatedAt: orderDate,
          items: {
            create: orderItems.map((oi) => ({
              menuItemId: oi.menuItemId,
              itemNameAtOrder: oi.name,
              unitPriceAtOrder: oi.price,
              quantity: oi.quantity,
              createdAt: orderDate,
            })),
          },
        },
      });
      venue2OrderCount++;
    }

    // Progress indicator
    if (daysAgo % 10 === 0) {
      process.stdout.write(`   Day ${61 - daysAgo}/61...`);
      process.stdout.write(` (${venue1OrderCount + venue2OrderCount} orders so far)\n`);
    }
  }

  console.log(`\n✅ Seeding complete!`);
  console.log(`   📊 The Golden Fork: ${venue1OrderCount} orders`);
  console.log(`   📊 Street Bites: ${venue2OrderCount} orders`);
  console.log(`   📊 Total: ${venue1OrderCount + venue2OrderCount} orders over 60 days`);
  console.log(`\n   Login: demo@bitebyte.app / password123`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
