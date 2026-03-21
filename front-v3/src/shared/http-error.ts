/**
 * Gestion partagée des erreurs HTTP : affiche un toast puis lance une erreur.
 * Aligné sur le comportement de l’interceptor front-v2 (401 → "Vous n'êtes pas connectés", sinon message backend).
 */
import { getToast } from '../components/atoms/buddj-toast.js';

/**
 * Affiche le message d’erreur adapté dans le toast (variant error) puis lance une Error dont le message est ce texte.
 * À appeler quand une requête HTTP échoue (status 4xx/5xx ou erreur réseau). Le catch n’a qu’à utiliser err.message.
 */
const DEFAULT_ERROR_MESSAGE = 'Erreur réseau';

function messageFromUnknown(err: unknown): string {
  return err instanceof Error ? err.message : DEFAULT_ERROR_MESSAGE;
}

/** Message d’erreur à partir d’une exception fetch (réseau, etc.) — sans toast. */
export function errorMessageFromUnknown(err: unknown): string {
  return messageFromUnknown(err);
}

/**
 * Affiche le message d'erreur adapté dans le toast (variant error) puis lance une Error dont le message est ce texte.
 * Accepte soit { status?, message } soit { status?, err } ; si err est fourni, message dérivé via err instanceof Error ? err.message : 'Erreur réseau'.
 */
export function handleHttpError(
  arg: { status?: number; message: string } | { status?: number; err: unknown }
): never {
  const toaster = getToast();
  const message = 'message' in arg ? arg.message : messageFromUnknown(arg.err);
  const displayMessage = arg.status === 401 ? "Vous n'êtes pas connectés" : message;
  toaster?.show({ message: displayMessage, variant: 'error', durationMs: 3000 });
  throw new Error(displayMessage);
}

/**
 * Lit le message d’erreur depuis une réponse HTTP non OK (body.message si JSON, sinon defaultMessage).
 * Pour 401, retourne le libellé dédié — aligné sur handleHttpError (sans toast).
 */
export async function readHttpErrorMessageFromResponse(
  response: Response,
  defaultMessage = DEFAULT_ERROR_MESSAGE
): Promise<string> {
  let message = defaultMessage;
  try {
    const body = await response.json();
    if (body && typeof body.message === 'string') message = body.message;
  } catch (e) {
    console.error('Erreur lors de la lecture du corps de la réponse', e);
  }
  if (response.status === 401) return "Vous n'êtes pas connectés";
  return message;
}

/**
 * Lit le message d'erreur depuis le corps JSON de la réponse (body.message), sinon utilise defaultMessage,
 * puis appelle handleHttpError. À utiliser pour toute réponse !response.ok.
 */
export async function handleNotOkResponse(
  response: Response,
  defaultMessage = DEFAULT_ERROR_MESSAGE
): Promise<never> {
  const message = await readHttpErrorMessageFromResponse(response, defaultMessage);
  handleHttpError({ status: response.status, message });
}
