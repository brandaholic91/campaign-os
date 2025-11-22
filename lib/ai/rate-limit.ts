export interface TokenBucketOptions {
  capacity: number
  refillIntervalMs: number
  tokensPerInterval: number
}

export class TokenBucket {
  private capacity: number
  private tokens: number
  private refillIntervalMs: number
  private tokensPerInterval: number
  private lastRefill: number

  constructor(options: TokenBucketOptions) {
    this.capacity = options.capacity
    this.tokens = options.capacity
    this.refillIntervalMs = options.refillIntervalMs
    this.tokensPerInterval = options.tokensPerInterval
    this.lastRefill = Date.now()
  }

  private refill() {
    const now = Date.now()
    const elapsed = now - this.lastRefill
    if (elapsed < this.refillIntervalMs) {
      return
    }

    const cycles = Math.floor(elapsed / this.refillIntervalMs)
    const tokensToAdd = cycles * this.tokensPerInterval
    this.tokens = Math.min(this.capacity, this.tokens + tokensToAdd)
    this.lastRefill += cycles * this.refillIntervalMs
  }

  tryRemoveTokens(count = 1): boolean {
    this.refill()
    if (this.tokens < count) {
      return false
    }
    this.tokens -= count
    return true
  }

  getAvailableTokens(): number {
    this.refill()
    return this.tokens
  }
}

