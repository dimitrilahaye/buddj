export type BuddjApiResponse<TData> = {
  success?: boolean;
  data?: TData;
};

/**
 * Lit le JSON d’une réponse OK déjà vérifiée ; attend `{ success: true, data }`.
 * @param routeLabel — ex. `/months/unarchived` (message d’erreur)
 */
export async function getReponseDataOrFail<TData>(
  response: Response,
  routeLabel: string,
): Promise<TData> {
  const body = (await response.json()) as BuddjApiResponse<TData>;
  if (!body?.success || body.data === undefined || body.data === null) {
    throw new Error(`Réponse invalide pour ${routeLabel}`);
  }
  return body.data;
}
