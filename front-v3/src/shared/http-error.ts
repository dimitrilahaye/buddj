/**
 * Gestion partagée des erreurs HTTP : affiche un toast puis lance une erreur.
 * Aligné sur le comportement de l’interceptor front-v2 (401 → "Vous n'êtes pas connectés", sinon message backend).
 */
import { getToast } from '../components/atoms/buddj-toast.js';

/**
 * Affiche le message d’erreur adapté dans le toast (variant error) puis lance une Error dont le message est ce texte.
 * À appeler quand une requête HTTP échoue (status 4xx/5xx ou erreur réseau). Le catch n’a qu’à utiliser err.message.
 */
export function handleHttpError({
  status,
  message,
}: {
  status?: number;
  message: string;
}): never {
  const toaster = getToast();
  const displayMessage = status === 401 ? "Vous n'êtes pas connectés" : message;
  toaster?.show({ message: displayMessage, variant: 'error', durationMs: 3000 });
  throw new Error(displayMessage);
}
