import { RateLimiter } from "limiter"

type RateLimitConfig = {
  tokensPerInterval: number
  interval: number | "second" | "minute" | "hour" | "day"
  fireImmediately?: boolean
}

const limiters = new Map<string, RateLimiter>()

const DEFAULT_CONFIG: RateLimitConfig = {
  tokensPerInterval: 10,
  interval: "minute",
  fireImmediately: true
}

export async function checkRateLimit(
  identifier: string, 
  config: RateLimitConfig = DEFAULT_CONFIG
): Promise<boolean> {
  if (!limiters.has(identifier)) {
    limiters.set(
      identifier, 
      new RateLimiter({ 
        tokensPerInterval: config.tokensPerInterval, 
        interval: config.interval,
        fireImmediately: config.fireImmediately 
      })
    )
  }

  const limiter = limiters.get(identifier)!
  const remainingRequests = await limiter.removeTokens(1)
  
  return remainingRequests >= 0
}

// Clean up old limiters periodically to prevent memory leaks
setInterval(() => {
  // This is a naive cleanup strategy. 
  // In a production app with high traffic, use an LRU cache or Redis.
  if (limiters.size > 10000) {
    limiters.clear()
  }
}, 1000 * 60 * 60) // Clear every hour
