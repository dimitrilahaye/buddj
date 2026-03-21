import { createMonthServiceFromInMemory } from '../../src/adapters/month-service-from-in-memory.js';
import type { MonthService } from '../../src/application/month/month-service.js';

/** Mois in-memory vides pour les tests qui ne couvrent pas le chargement des mois sur /budgets. */
export const monthServiceEmpty: MonthService = createMonthServiceFromInMemory({ months: [] });
