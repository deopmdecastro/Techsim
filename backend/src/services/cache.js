import { createClient } from 'redis';
import { env } from '../config/env.js';

let client;

export async function getRedis() {
  if (!client) {
    client = createClient({ url: env.redisUrl });
    client.on('error', error => console.error('Redis error', error));
    await client.connect();
  }
  return client;
}

export async function cacheJson(key, ttlSeconds, value) {
  const redis = await getRedis();
  await redis.set(key, JSON.stringify(value), { EX: ttlSeconds });
}

export async function readCachedJson(key) {
  const redis = await getRedis();
  const raw = await redis.get(key);
  return raw ? JSON.parse(raw) : null;
}

export async function invalidateByPrefix(prefix) {
  const redis = await getRedis();
  const keys = await redis.keys(`${prefix}*`);
  if (keys.length) await redis.del(keys);
}
