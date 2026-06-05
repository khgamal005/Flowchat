import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

import { PrismaClient } from '@prisma/client';
import { PrismaNeon } from '@prisma/adapter-neon';

const prisma = new PrismaClient({
  adapter: new PrismaNeon({
    connectionString: process.env.DATABASE_URL,
  }),
});

const users = await prisma.user.findMany({ select: { id: true, email: true, name: true, createdAt: true } });
console.log('Users:', JSON.stringify(users, null, 2));

const accounts = await prisma.account.findMany({ select: { id: true, userId: true, provider: true, providerAccountId: true } });
console.log('Accounts:', JSON.stringify(accounts, null, 2));

await prisma.$disconnect();
