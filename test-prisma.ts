import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import * as dotenv from 'dotenv';

dotenv.config();

async function main() {
  console.log('Testing Prisma v7 connection...');
  console.log('DATABASE_URL:', process.env.DATABASE_URL ? 'Defined' : 'Undefined');

  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  const adapter = new PrismaPg(pool);
  const prisma = new PrismaClient({ adapter });

  try {
    await prisma.$connect();
    console.log('Connected successfully!');
    
    // Try a simple query
    const userCount = await prisma.user.count();
    console.log('User count:', userCount);
    
    await prisma.$disconnect();
    console.log('Disconnected.');
  } catch (error) {
    console.error('Connection failed:', JSON.stringify(error, Object.getOwnPropertyNames(error), 2));
    process.exit(1);
  }
}

main();
