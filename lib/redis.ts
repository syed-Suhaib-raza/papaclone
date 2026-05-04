import Redis from "ioredis"

let client: Redis | null = null

function getRedisClient(): Redis | null {
  if (!process.env.REDIS_URL) return null
  if (client) return client

  try {
    client = new Redis(process.env.REDIS_URL, {
      maxRetriesPerRequest: 1,
      enableReadyCheck: false,
      lazyConnect: false,
    })

    client.on("error", (err) => {
      console.warn("[Redis] connection error – caching disabled:", err.message)
      client = null
    })

    return client
  } catch (err) {
    console.warn("[Redis] failed to initialise:", err)
    return null
  }
}

export async function cacheGet<T>(key: string): Promise<T | null> {
  try {
    const redis = getRedisClient()
    if (!redis) return null
    const raw = await redis.get(key)
    return raw ? (JSON.parse(raw) as T) : null
  } catch {
    return null
  }
}

export async function cacheSet(key: string, value: unknown, ttlSeconds: number): Promise<void> {
  try {
    const redis = getRedisClient()
    if (!redis) return
    await redis.set(key, JSON.stringify(value), "EX", ttlSeconds)
  } catch {}
}

export async function cacheDel(key: string): Promise<void> {
  try {
    const redis = getRedisClient()
    if (!redis) return
    await redis.del(key)
  } catch {}
}
