import { defineConfig } from '@prisma/config';
import * as dotenv from 'dotenv';

dotenv.config();

// Use a placeholder URL for CI environments where only `prisma generate` is needed
const databaseUrl = process.env.DATABASE_URL || 'postgresql://placeholder:placeholder@localhost:5432/placeholder';

export default defineConfig({
  schema: 'prisma/schema.prisma',
  datasource: {
    url: databaseUrl,
  },
});
