import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../.env') });

process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
process.env.PGSSLMODE = 'no-verify';

// Force localhost for local testing if the host is set to 'redis' (docker hostname)
if (process.env.REDIS_URL && process.env.REDIS_URL.includes('://redis:')) {
  process.env.REDIS_URL = process.env.REDIS_URL.replace('://redis:', '://localhost:');
}

// Ensure e2e tests can connect to RDS locally by disabling certificate verification if needed
if (process.env.DATABASE_URL && process.env.DATABASE_URL.includes('sslmode=require')) {
  process.env.DATABASE_URL = process.env.DATABASE_URL.replace('sslmode=require', 'sslmode=no-verify');
}
