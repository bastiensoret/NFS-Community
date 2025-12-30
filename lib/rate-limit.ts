import { LRUCache } from 'lru-cache'

// Global cache instance to persist across invocations
// Key: identifier, Value: [count, startTime]
// Using a tuple for memory efficiency
const tokenCache = new LRUCache<string, [number, number]>({
  max: 10000,
  ttl: 60000, // Default TTL 60s
})

export async function checkRateLimit(identifier: string, limit: number = 10, windowDuration: number = 60000): Promise<boolean> {
  const now = Date.now()
  const current = tokenCache.get(identifier)

  if (!current) {
    // New window
    tokenCache.set(identifier, [1, now], { ttl: windowDuration })
    return true
  }

  const [count, startTime] = current
  
  if (count >= limit) {
    return false
  }

  // Calculate remaining TTL to preserve the window from the initial start time
  const elapsedTime = now - startTime
  const remainingTTL = Math.max(0, windowDuration - elapsedTime)

  if (remainingTTL <= 0) {
      // Should have expired, but if slightly off, reset
      tokenCache.set(identifier, [1, now], { ttl: windowDuration })
      return true
  }

  // Increment count, keep original start time, set remaining TTL
  tokenCache.set(identifier, [count + 1, startTime], { ttl: remainingTTL })
  
  return true
}
