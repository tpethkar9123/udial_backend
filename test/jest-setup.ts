import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../.env') });

// Force localhost for local testing if the host is set to 'redis' (docker hostname)
if (process.env.REDIS_URL && process.env.REDIS_URL.includes('://redis:')) {
  process.env.REDIS_URL = process.env.REDIS_URL.replace('://redis:', '://localhost:');
}
