import { Redis } from '@upstash/redis';

let redis: Redis | null = null;

function getRedis(): Redis | null {
  if (redis) return redis;

  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) return null;

  redis = new Redis({ url, token });
  return redis;
}

export async function getCached<T>(key: string): Promise<T | null> {
  const client = getRedis();
  if (!client) return null;

  try {
    const value = await client.get<T>(key);
    if (value !== null) console.info(`[redis] CACHE HIT ${key}`);
    else console.info(`[redis] CACHE MISS ${key}`);
    return value;
  } catch (error) {
    console.warn(`[redis] CACHE READ FAILED ${key}`, error);
    return null;
  }
}

export async function setCached<T>(key: string, value: T, ttlSeconds: number): Promise<void> {
  const client = getRedis();
  if (!client) return;

  try {
    await client.set(key, value, { ex: ttlSeconds });
    console.info(`[redis] CACHE SET ${key} ttl=${ttlSeconds}s`);
  } catch (error) {
    console.warn(`[redis] CACHE SET FAILED ${key}`, error);
  }
}

export async function invalidateCached(keys: string[]): Promise<void> {
  const client = getRedis();
  if (!client || keys.length === 0) return;

  try {
    await client.del(...keys);
    console.info(`[redis] CACHE INVALIDATED ${keys.join(', ')}`);
  } catch (error) {
    console.warn(`[redis] CACHE INVALIDATION FAILED ${keys.join(', ')}`, error);
  }
}
