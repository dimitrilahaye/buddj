/**
 * Point d'entrée : enregistrement des composants + bootstrap (router, auth, routes).
 */
import '../styles.css';
import './register-components.js';
import { createAuthServiceFromApi } from './adapters/auth-service-from-api.js';
import { createMonthServiceFromApi } from './adapters/month-service-from-api.js';
import { bootstrap } from './bootstrap.js';
import { buildConfigFromEnv } from './config.js';

const config = buildConfigFromEnv();
bootstrap({
  config,
  authService: createAuthServiceFromApi({ apiUrl: config.apiUrl }),
  monthService: createMonthServiceFromApi({ apiUrl: config.apiUrl }),
});
