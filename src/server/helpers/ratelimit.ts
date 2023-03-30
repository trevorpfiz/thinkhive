import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

// Create a new ratelimiter, that allows 10 requests per 10 seconds
export const rateLimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(10, '10 s'),
  analytics: true,
});

// Upload limiter, 10 requests per 10 seconds
export const uploadLimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(200, '10 s'),
  analytics: true,
});

// Upload limiter, 10 requests per 10 seconds
export const uploadLimitDay = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(1000, '86400 s'),
  analytics: true,
});

// Message limiter, 10 requests per 10 seconds
export const messageLimitMinute = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(15, '60 s'),
  analytics: true,
});

// Message limiter, 10 requests per 10 seconds
export const messageLimitDay = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(200, '86400 s'),
  analytics: true,
});
