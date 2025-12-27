import { LRUCache } from 'lru-cache'

type RateLimitOptions = {
  interval: number // milliseconds
  uniqueTokenPerInterval: number // max number of unique tokens
}

function rateLimit(options: RateLimitOptions) {
  const tokenCache = new LRUCache<string, number[]>({
    max: options.uniqueTokenPerInterval || 500,
    ttl: options.interval || 60000,
  })

  return {
    check: (limit: number, token: string) =>
      new Promise<void>((resolve, reject) => {
        const tokenCount = tokenCache.get(token) || [0]
        if (tokenCount[0] === 0) {
          tokenCache.set(token, tokenCount)
        }
        tokenCount[0] += 1

        const currentUsage = tokenCount[0]
        const isRateLimited = currentUsage > limit
        
        if (isRateLimited) {
          reject(new Error('Rate limit exceeded'))
        } else {
          resolve()
        }
      }),
  }
}

// Global limiter instance
const limiter = rateLimit({
  interval: 60 * 1000, // 1 minute
  uniqueTokenPerInterval: 500,
})

export async function checkRateLimit(identifier: string, limit: number = 10) {
  try {
    // Limit to 'limit' requests per minute per identifier
    await limiter.check(limit, identifier)
    return true
  } catch {
    return false
  }
}
