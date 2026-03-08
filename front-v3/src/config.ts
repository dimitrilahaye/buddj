/**
 * Config de l’app : toutes les variables d’environnement sont lues au bootstrap
 * et exposées via un objet typé, injecté là où nécessaire.
 * En dev, les vars doivent être préfixées par VITE_ dans .env pour être exposées (Vite).
 */
export interface AppConfig {
  apiUrl: string;
}

/** Env Vite (import.meta.env) typé pour la config. */
type ViteEnv = { VITE_API_URL?: string };

/**
 * Construit la config à partir des variables d’environnement (import.meta.env).
 * Utilisé au bootstrap ; en test, on peut injecter une config via BootstrapOptions.
 */
export function buildConfigFromEnv(): AppConfig {
  const env = (import.meta as { env?: ViteEnv }).env;
  const apiUrl = typeof env?.VITE_API_URL === 'string' && env.VITE_API_URL !== ''
    ? env.VITE_API_URL
    : null;
  if (apiUrl === null) {
    throw new Error('VITE_API_URL is not set');
  }
  return { apiUrl };
}
