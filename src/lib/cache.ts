import {constants, Database, Statement} from 'bun:sqlite';

import {CacheError} from '@/lib/errors';
import {CacheEntry, CacheOptions} from '@/lib/types';

export class Cache {
  private readonly cleanupTimer?: Timer;
  private readonly options: Required<CacheOptions>;
  private readonly statements: {
    cleanup: Statement;
    clear: Statement;
    count: Statement;
    delete: Statement;
    get: Statement;
    hasKey: Statement;
    put: Statement;
  };
  private readonly store: Database;

  constructor(options: CacheOptions = {}) {
    this.options = {
      cleanupInterval: options.cleanupInterval ?? 300_000, // 5 minutes
      defaultTtl: options.defaultTtl ?? 3_600_000, // 1 hour default
      filename: options.filename || ':memory:', // Default to in-memory database
    };

    this.store = new Database(this.options.filename);

    // Enable Write-Ahead Logging (WAL) mode for better concurrency
    this.store.exec('PRAGMA journal_mode = WAL;');

    this.initializeSchema();

    try {
      this.statements = {
        cleanup: this.store.prepare(
          'DELETE FROM cache WHERE ttl IS NOT NULL AND ttl <= ?'
        ),
        clear: this.store.prepare('DELETE FROM cache'),
        count: this.store.prepare('SELECT COUNT(*) as count FROM cache'),
        delete: this.store.prepare('DELETE FROM cache WHERE key = ?'),
        get: this.store.prepare(
          'SELECT value, ttl, created_at FROM cache WHERE key = ?'
        ),
        hasKey: this.store.prepare('SELECT ttl FROM cache WHERE key = ?'),
        put: this.store.prepare(
          'INSERT OR REPLACE INTO cache (key, value, ttl, created_at) VALUES (?, ?, ?, ?)'
        ),
      };
    } catch (error) {
      throw new CacheError(`Failed to prepare statements: ${error}`, 'init');
    }

    if (this.options.cleanupInterval > 0) {
      this.cleanupTimer = setInterval(() => {
        try {
          this.cleanup();
        } catch (error) {
          console.warn('Cache cleanup failed:', error);
        }
      }, this.options.cleanupInterval);
    }
  }

  /**
   * Manually cleanup expired entries
   * @returns The number of entries removed
   */
  cleanup(): number {
    try {
      const result = this.statements.cleanup.run(Date.now());
      return result.changes;
    } catch (error) {
      throw new CacheError(`Failed to cleanup cache: ${error}`, 'cleanup');
    }
  }

  /**
   * Clears all entries from the cache
   */
  clear(): void {
    try {
      this.statements.clear.run();
    } catch (error) {
      throw new CacheError(`Failed to clear cache: ${error}`, 'clear');
    }
  }

  /**
   * Closes the database connection and stops cleanup timer
   */
  close(): void {
    if (this.cleanupTimer) {
      clearInterval(this.cleanupTimer);
    }
    this.store.close();
  }

  /**
   * Deletes a key from the cache
   * @param key The cache key to delete
   * @returns True if the key was deleted, false if it didn't exist
   */
  delete(key: string): boolean {
    if (!key) throw new CacheError('Key cannot be empty', 'delete');

    try {
      const result = this.statements.delete.run(key);
      return result.changes > 0;
    } catch (error) {
      throw new CacheError(`Failed to delete key "${key}": ${error}`, 'delete');
    }
  }

  /**
   * Retrieves a value from the cache
   * @param key The cache key
   * @returns The cached value or null if not found/expired
   */
  get<T = unknown>(key: string): null | T {
    if (!key) throw new CacheError('Key cannot be empty', 'get');

    try {
      const result = this.statements.get.get(key) as CacheEntry | null;

      if (!result) return null;

      const currentTime = Date.now();

      if (result.ttl !== null && result.ttl <= currentTime) {
        this.delete(key);
        return null;
      }

      if (result.value === null) return true as T;

      try {
        return JSON.parse(result.value) as T;
      } catch {
        return result.value as T;
      }
    } catch (error) {
      throw new CacheError(`Failed to get key "${key}": ${error}`, 'get');
    }
  }

  /**
   * Checks if a key exists in the cache (and is not expired)
   * @param key The cache key to check
   * @returns true if the key exists and is not expired
   */
  hasKey(key: string): boolean {
    if (!key) return false;

    try {
      const result = this.statements.hasKey.get(key) as CacheEntry | null;

      if (!result) return false;

      const currentTime = Date.now();
      if (result.ttl !== null && result.ttl <= currentTime) {
        this.delete(key);
        return false;
      }

      return true;
    } catch (error) {
      throw new CacheError(`Failed to check key "${key}": ${error}`, 'hasKey');
    }
  }

  /**
   * Stores a value in the cache
   * @param key The cache key
   * @param value The value to store
   * @param ttl Time to live in milliseconds (optional)
   * @returns true if successful
   */
  put(key: string, value: unknown, ttl?: number): boolean {
    if (!key) throw new CacheError('Key cannot be empty', 'put');

    const effectiveTtl = ttl ?? this.options.defaultTtl;
    const expirationTime = effectiveTtl > 0 ? Date.now() + effectiveTtl : null;
    const currentTime = Date.now();

    try {
      const serializedValue = value === true ? null : JSON.stringify(value);

      this.statements.put.run(
        key,
        serializedValue,
        expirationTime,
        currentTime
      );
      return true;
    } catch (error) {
      throw new CacheError(`Failed to put key "${key}": ${error}`, 'put');
    }
  }

  /**
   * Gets the number of entries in the cache
   * @return The number of entries in the cache
   */
  size(): number {
    try {
      const result = this.statements.count.get() as {count: number};
      return result.count;
    } catch (error) {
      throw new CacheError(`Failed to get cache size: ${error}`, 'size');
    }
  }

  private initializeSchema() {
    try {
      this.store.run(`
        CREATE TABLE IF NOT EXISTS cache (
          key TEXT PRIMARY KEY,
          value TEXT,
          ttl INTEGER,
          created_at INTEGER NOT NULL
        );
      `);

      this.store.run(`
        CREATE INDEX IF NOT EXISTS idx_cache_ttl ON cache(ttl) WHERE ttl IS NOT NULL;
      `);
    } catch (error) {
      throw new CacheError(`Failed to initialize schema: ${error}`, 'init');
    }
  }
}
