import { Redis } from '@upstash/redis';
import { Neuron } from '@/domain/neuron.types';
import { INITIAL_NETWORK } from '@/data/mock-data';

// Initialize Redis from environment variables provided by Vercel
const redis = Redis.fromEnv();

// NOTA: En una aplicación real con múltiples usuarios, la clave debería ser única por usuario.
// Por ejemplo: `user-network-state:${userId}`.
// Por simplicidad, usamos una clave global para este proyecto.
const NETWORK_STATE_KEY = 'global-network-state';

/**
 * Obtiene el estado actual de la red desde Upstash Redis.
 * Si no existe un estado guardado, devuelve el estado inicial y lo guarda.
 * @returns {Promise<Neuron[]>} El estado actual de la red.
 */
export async function getNetworkState(): Promise<Neuron[]> {
  let state = await redis.get<Neuron[]>(NETWORK_STATE_KEY);

  if (!state) {
    // Si no hay estado en Redis, inicialízalo con el estado por defecto.
    console.log('[STATE-MANAGER] No state found in Redis. Initializing with default state.');
    await redis.set(NETWORK_STATE_KEY, INITIAL_NETWORK);
    return INITIAL_NETWORK;
  }

  return state;
}

/**
 * Guarda un nuevo estado de la red en Upstash Redis.
 * @param {Neuron[]} newState - El nuevo estado de la red para guardar.
 * @returns {Promise<void>}
 */
export async function setNetworkState(newState: Neuron[]): Promise<void> {
  await redis.set(NETWORK_STATE_KEY, newState);
}

/**
 * Resetea el estado de la red en Upstash Redis al estado inicial.
 * @returns {Promise<Neuron[]>} El estado de la red después de resetear.
 */
export async function resetNetworkState(): Promise<Neuron[]> {
  await redis.set(NETWORK_STATE_KEY, INITIAL_NETWORK);
  console.log('[STATE-MANAGER] Network state has been reset in Redis.');
  return INITIAL_NETWORK;
}