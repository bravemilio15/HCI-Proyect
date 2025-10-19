// Sistema de caché simple en memoria para optimizar requests de IA
// Reduce costos de API y mejora velocidad de respuesta
// Implementa LRU (Least Recently Used) para limitar tamaño

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  expiresAt: number;
  lastAccessed: number; // Para LRU
}

class SimpleCache<T> {
  private cache: Map<string, CacheEntry<T>>;
  private defaultTTL: number;
  private maxSize: number; // Límite LRU

  constructor(defaultTTLMinutes: number = 60, maxSize: number = 1000) {
    this.cache = new Map();
    this.defaultTTL = defaultTTLMinutes * 60 * 1000; // Convertir a ms
    this.maxSize = maxSize;
  }

  /**
   * Generar clave de caché normalizada
   */
  private normalizeKey(key: string): string {
    return key.toLowerCase().trim().replace(/\s+/g, ' ');
  }

  /**
   * Guardar en caché con LRU (elimina entradas antiguas si se alcanza el límite)
   */
  set(key: string, data: T, ttlMinutes?: number): void {
    const normalizedKey = this.normalizeKey(key);
    const ttl = ttlMinutes ? ttlMinutes * 60 * 1000 : this.defaultTTL;
    const now = Date.now();

    // LRU: Si alcanzamos el límite, eliminar la entrada menos recientemente usada
    if (this.cache.size >= this.maxSize && !this.cache.has(normalizedKey)) {
      this.evictLRU();
    }

    this.cache.set(normalizedKey, {
      data,
      timestamp: now,
      expiresAt: now + ttl,
      lastAccessed: now
    });
  }

  /**
   * Eliminar la entrada menos recientemente usada (LRU eviction)
   */
  private evictLRU(): void {
    let oldestKey: string | null = null;
    let oldestTime = Infinity;

    for (const [key, entry] of this.cache.entries()) {
      if (entry.lastAccessed < oldestTime) {
        oldestTime = entry.lastAccessed;
        oldestKey = key;
      }
    }

    if (oldestKey) {
      this.cache.delete(oldestKey);
      console.log('[CACHE-LRU] Evicted oldest entry:', oldestKey.substring(0, 50));
    }
  }

  /**
   * Obtener de caché (actualiza lastAccessed para LRU)
   */
  get(key: string): T | null {
    const normalizedKey = this.normalizeKey(key);
    const entry = this.cache.get(normalizedKey);

    if (!entry) {
      return null;
    }

    const now = Date.now();

    // Verificar si expiró
    if (now > entry.expiresAt) {
      this.cache.delete(normalizedKey);
      return null;
    }

    // LRU: Actualizar timestamp de último acceso
    entry.lastAccessed = now;

    return entry.data;
  }

  /**
   * Verificar si existe en caché
   */
  has(key: string): boolean {
    return this.get(key) !== null;
  }

  /**
   * Limpiar caché expirado
   */
  cleanup(): void {
    const now = Date.now();
    for (const [key, entry] of this.cache.entries()) {
      if (now > entry.expiresAt) {
        this.cache.delete(key);
      }
    }
  }

  /**
   * Limpiar todo el caché
   */
  clear(): void {
    this.cache.clear();
  }

  /**
   * Obtener estadísticas del caché (incluye info LRU)
   */
  getStats() {
    const now = Date.now();
    let valid = 0;
    let expired = 0;

    for (const entry of this.cache.values()) {
      if (now > entry.expiresAt) {
        expired++;
      } else {
        valid++;
      }
    }

    return {
      total: this.cache.size,
      valid,
      expired,
      maxSize: this.maxSize,
      utilizationPercent: ((this.cache.size / this.maxSize) * 100).toFixed(2) + '%'
    };
  }
}

// Instancias de caché para diferentes tipos de datos
// Hints: caché de 30 minutos (preguntas similares pueden repetirse en una sesión)
export const hintCache = new SimpleCache<string>(30);

// Explanations: caché de 60 minutos (conceptos son más estáticos)
export const explanationCache = new SimpleCache<string>(60);

// Limpiar caché expirado cada 5 minutos
if (typeof window === 'undefined') {
  // Solo en el servidor
  setInterval(() => {
    hintCache.cleanup();
    explanationCache.cleanup();
  }, 5 * 60 * 1000);
}
