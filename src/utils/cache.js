/**
 * Simple in-memory cache implementation
 */
class Cache {
    constructor() {
        this.cache = new Map();
        this.ttl = new Map();
    }

    /**
     * Set a value in the cache with an optional TTL (time to live) in milliseconds
     * @param {string} key - The cache key
     * @param {any} value - The value to cache
     * @param {number} ttl - Time to live in milliseconds (optional)
     */
    set(key, value, ttl = null) {
        this.cache.set(key, value);
        
        if (ttl) {
            const expiry = Date.now() + ttl;
            this.ttl.set(key, expiry);
            
            // Set up automatic cleanup after TTL
            setTimeout(() => {
                if (this.ttl.get(key) <= Date.now()) {
                    this.delete(key);
                }
            }, ttl);
        }
    }

    /**
     * Get a value from the cache
     * @param {string} key - The cache key
     * @returns {any|null} - The cached value or null if not found or expired
     */
    get(key) {
        // Check if key exists and not expired
        if (this.ttl.has(key) && this.ttl.get(key) <= Date.now()) {
            this.delete(key);
            return null;
        }
        
        return this.cache.get(key) || null;
    }

    /**
     * Delete a value from the cache
     * @param {string} key - The cache key
     */
    delete(key) {
        this.cache.delete(key);
        this.ttl.delete(key);
    }

    /**
     * Clear the entire cache
     */
    clear() {
        this.cache.clear();
        this.ttl.clear();
    }

    /**
     * Check if a key exists in the cache and is not expired
     * @param {string} key - The cache key
     * @returns {boolean} - True if the key exists and is not expired
     */
    has(key) {
        if (!this.cache.has(key)) {
            return false;
        }
        
        if (this.ttl.has(key) && this.ttl.get(key) <= Date.now()) {
            this.delete(key);
            return false;
        }
        
        return true;
    }
}

// Create a singleton instance
const cacheInstance = new Cache();

export default cacheInstance;