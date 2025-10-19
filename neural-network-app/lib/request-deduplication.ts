// Sistema de deduplicación de requests
// Evita múltiples llamadas a la API para la misma pregunta simultáneamente

interface PendingRequest<T> {
  promise: Promise<T>;
  timestamp: number;
}

class RequestDeduplicator<T> {
  private pendingRequests: Map<string, PendingRequest<T>>;
  private timeout: number;

  constructor(timeoutMs: number = 30000) {
    this.pendingRequests = new Map();
    this.timeout = timeoutMs;
  }

  /**
   * Normalizar clave de request
   */
  private normalizeKey(key: string): string {
    return key.toLowerCase().trim().replace(/\s+/g, ' ');
  }

  /**
   * Ejecutar request con deduplicación
   * Si hay una request pendiente con la misma clave, retorna esa promesa
   * Si no, ejecuta la nueva request
   */
  async deduplicate(key: string, requestFn: () => Promise<T>): Promise<T> {
    const normalizedKey = this.normalizeKey(key);

    // Verificar si hay una request pendiente
    const pending = this.pendingRequests.get(normalizedKey);
    if (pending) {
      // Verificar si no expiró (timeout)
      if (Date.now() - pending.timestamp < this.timeout) {
        console.log('[DEDUP] Reusando request pendiente:', normalizedKey.substring(0, 50));
        return pending.promise;
      } else {
        // Request antigua, eliminar
        this.pendingRequests.delete(normalizedKey);
      }
    }

    // Nueva request
    console.log('[DEDUP] Nueva request:', normalizedKey.substring(0, 50));
    const promise = requestFn();

    // Guardar como pendiente
    this.pendingRequests.set(normalizedKey, {
      promise,
      timestamp: Date.now()
    });

    // Limpiar cuando termine (éxito o error)
    promise
      .finally(() => {
        this.pendingRequests.delete(normalizedKey);
      });

    return promise;
  }

  /**
   * Limpiar todas las requests pendientes
   */
  clear(): void {
    this.pendingRequests.clear();
  }

  /**
   * Obtener número de requests pendientes
   */
  getPendingCount(): number {
    return this.pendingRequests.size;
  }
}

// Instancias globales para diferentes tipos de requests
export const hintDeduplicator = new RequestDeduplicator<string>();
export const explanationDeduplicator = new RequestDeduplicator<string>();
