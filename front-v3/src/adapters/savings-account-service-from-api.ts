import type { SavingsAccountService } from '../application/savings-account/savings-account-service.js';
import type { SavingsAccountView, SavingsTrackerView } from '../application/savings-account/savings-account-types.js';
import { getReponseDataOrFail } from '../shared/get-reponse-data-or-fail.js';
import { handleHttpError, handleNotOkResponse } from '../shared/http-error.js';

/** Le back renvoie déjà la forme de la vue (montants en nombres, dates YYYY-MM-DD). */
export function createSavingsAccountServiceFromApi({ apiUrl }: { apiUrl: string }): SavingsAccountService {
  const baseUrl = apiUrl.replace(/\/$/, '');

  async function request<T>({
    path,
    method,
    body,
  }: {
    path: string;
    method: 'GET' | 'POST' | 'PATCH' | 'DELETE';
    body?: unknown;
  }): Promise<T> {
    let response: Response;
    try {
      response = await fetch(`${baseUrl}${path}`, {
        method,
        credentials: 'include',
        headers:
          body === undefined
            ? { Accept: 'application/json' }
            : { Accept: 'application/json', 'Content-Type': 'application/json' },
        body: body === undefined ? undefined : JSON.stringify(body),
      });
    } catch (err) {
      return handleHttpError({ err });
    }
    if (!response.ok) await handleNotOkResponse(response);
    return getReponseDataOrFail<T>(response, path);
  }

  const operationsPath = (savingsAccountId: string) =>
    `/savings-accounts/${encodeURIComponent(savingsAccountId)}/operations`;

  return {
    getAll() {
      return request<SavingsAccountView[]>({ path: '/savings-accounts', method: 'GET' });
    },
    addOperation({ savingsAccountId, operation }) {
      return request<SavingsAccountView>({ path: operationsPath(savingsAccountId), method: 'POST', body: operation });
    },
    updateOperation({ savingsAccountId, operationId, operation }) {
      return request<SavingsAccountView>({
        path: `${operationsPath(savingsAccountId)}/${encodeURIComponent(operationId)}`,
        method: 'PATCH',
        body: operation,
      });
    },
    deleteOperation({ savingsAccountId, operationId }) {
      return request<SavingsAccountView>({
        path: `${operationsPath(savingsAccountId)}/${encodeURIComponent(operationId)}`,
        method: 'DELETE',
      });
    },
    getTracker({ savingsAccountId, granularity, from, to }) {
      const query = new URLSearchParams({ granularity, from, to });
      return request<SavingsTrackerView>({
        path: `/savings-accounts/${encodeURIComponent(savingsAccountId)}/tracker?${query.toString()}`,
        method: 'GET',
      });
    },
  };
}
