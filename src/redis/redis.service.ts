import { Injectable } from '@nestjs/common';
import Redis from 'ioredis';

@Injectable()
export class RedisService {
  private client: Redis;

  constructor() {
    if (!process.env.REDIS_URL) {
      throw new Error('REDIS_URL environment variable is not set');
    }
    this.client = new Redis(process.env.REDIS_URL as string);
  }

  async get(key: string) {
    return this.client.get(key);
  }

  async set(key: string, value: string, ttl?: number) {
    if (ttl) {
      return this.client.set(key, value, 'EX', ttl);
    }
    return this.client.set(key, value);
  }
}
