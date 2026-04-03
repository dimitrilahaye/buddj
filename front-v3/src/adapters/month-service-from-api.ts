import type { MonthService } from '../application/month/month-service.js';
import type { OutflowsCheckingPayload } from '../application/month/outflows-checking-payload.js';
import { getReponseDataOrFail } from '../shared/get-reponse-data-or-fail.js';
import {
  errorMessageFromUnknown,
  handleHttpError,
  handleNotOkResponse,
  readHttpErrorMessageFromResponse,
} from '../shared/http-error.js';
import { type ApiMonthPayload, mapApiMonthPayloadToView } from './map-api-month-to-view.js';

export function createMonthServiceFromApi({ apiUrl }: { apiUrl: string }): MonthService {
  const baseUrl = apiUrl.replace(/\/$/, '');
  return {
    async getUnarchivedMonths() {
      const url = `${baseUrl}/months/unarchived`;
      let response: Response;
      try {
        response = await fetch(url, {
          method: 'GET',
          credentials: 'include',
          headers: { Accept: 'application/json' },
        });
      } catch (err) {
        return handleHttpError({ err });
      }
      if (!response.ok) await handleNotOkResponse(response);
      const data = await getReponseDataOrFail<ApiMonthPayload[]>(response, '/months/unarchived');
      return data.map((row) => mapApiMonthPayloadToView(row));
    },
    async getArchivedMonths() {
      const url = `${baseUrl}/months/archived`;
      let response: Response;
      try {
        response = await fetch(url, {
          method: 'GET',
          credentials: 'include',
          headers: { Accept: 'application/json' },
        });
      } catch (err) {
        return handleHttpError({ err });
      }
      if (!response.ok) await handleNotOkResponse(response);
      const data = await getReponseDataOrFail<ApiMonthPayload[]>(response, '/months/archived');
      return data.map((row) => mapApiMonthPayloadToView(row));
    },
    async putExpensesChecking(monthId, body) {
      const url = `${baseUrl}/months/${encodeURIComponent(monthId)}/expenses/checking`;
      let response: Response;
      try {
        response = await fetch(url, {
          method: 'PUT',
          credentials: 'include',
          headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
        });
      } catch (err) {
        return handleHttpError({ err });
      }
      if (!response.ok) await handleNotOkResponse(response);
      const data = await getReponseDataOrFail<ApiMonthPayload>(response, url);
      return mapApiMonthPayloadToView(data);
    },
    async putOutflowsChecking({ monthId, body }: { monthId: string; body: OutflowsCheckingPayload }) {
      const url = `${baseUrl}/months/${encodeURIComponent(monthId)}/outflows/checking`;
      let response: Response;
      try {
        response = await fetch(url, {
          method: 'PUT',
          credentials: 'include',
          headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
        });
      } catch (err) {
        return handleHttpError({ err });
      }
      if (!response.ok) await handleNotOkResponse(response);
      const data = await getReponseDataOrFail<ApiMonthPayload>(response, url);
      return mapApiMonthPayloadToView(data);
    },
    async deleteExpense({ monthId, weeklyBudgetId, expenseId }) {
      const url = `${baseUrl}/months/${encodeURIComponent(monthId)}/weekly/${encodeURIComponent(weeklyBudgetId)}/expenses/${encodeURIComponent(expenseId)}`;
      let response: Response;
      try {
        response = await fetch(url, {
          method: 'DELETE',
          credentials: 'include',
          headers: { Accept: 'application/json' },
        });
      } catch (err) {
        return handleHttpError({ err });
      }
      if (!response.ok) await handleNotOkResponse(response);
      const data = await getReponseDataOrFail<ApiMonthPayload>(response, url);
      return mapApiMonthPayloadToView(data);
    },
    async deleteOutflow({ monthId, outflowId }) {
      const url = `${baseUrl}/months/${encodeURIComponent(monthId)}/outflows/${encodeURIComponent(outflowId)}`;
      let response: Response;
      try {
        response = await fetch(url, {
          method: 'DELETE',
          credentials: 'include',
          headers: { Accept: 'application/json' },
        });
      } catch (err) {
        return handleHttpError({ err });
      }
      if (!response.ok) await handleNotOkResponse(response);
      const data = await getReponseDataOrFail<ApiMonthPayload>(response, url);
      return mapApiMonthPayloadToView(data);
    },
    async createExpense({ monthId, weeklyBudgetId, label, amount }) {
      const url = `${baseUrl}/months/${encodeURIComponent(monthId)}/weeks/${encodeURIComponent(weeklyBudgetId)}/expenses`;
      let response: Response;
      try {
        response = await fetch(url, {
          method: 'POST',
          credentials: 'include',
          headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
          body: JSON.stringify({ label, amount }),
        });
      } catch (err) {
        return handleHttpError({ err });
      }
      if (!response.ok) await handleNotOkResponse(response);
      const data = await getReponseDataOrFail<ApiMonthPayload>(response, url);
      return mapApiMonthPayloadToView(data);
    },
    async createBudget({ monthId, name, initialBalance }) {
      const url = `${baseUrl}/months/${encodeURIComponent(monthId)}/budgets/`;
      let response: Response;
      try {
        response = await fetch(url, {
          method: 'POST',
          credentials: 'include',
          headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
          body: JSON.stringify({ name, initialBalance }),
        });
      } catch (err) {
        return handleHttpError({ err });
      }
      if (!response.ok) await handleNotOkResponse(response);
      const data = await getReponseDataOrFail<ApiMonthPayload>(response, url);
      return mapApiMonthPayloadToView(data);
    },
    async createOutflow({ monthId, label, amount }) {
      const url = `${baseUrl}/months/${encodeURIComponent(monthId)}/outflows/`;
      let response: Response;
      try {
        response = await fetch(url, {
          method: 'POST',
          credentials: 'include',
          headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
          body: JSON.stringify({ label, amount }),
        });
      } catch (err) {
        return handleHttpError({ err });
      }
      if (!response.ok) await handleNotOkResponse(response);
      const data = await getReponseDataOrFail<ApiMonthPayload>(response, url);
      return mapApiMonthPayloadToView(data);
    },
    async deleteBudget({ monthId, budgetId }) {
      const url = `${baseUrl}/months/${encodeURIComponent(monthId)}/budgets/${encodeURIComponent(budgetId)}`;
      let response: Response;
      try {
        response = await fetch(url, {
          method: 'DELETE',
          credentials: 'include',
          headers: { Accept: 'application/json' },
        });
      } catch (err) {
        throw new Error(errorMessageFromUnknown(err), { cause: err });
      }
      if (!response.ok) {
        const message = await readHttpErrorMessageFromResponse(response, `Erreur ${response.status}`);
        throw new Error(message);
      }
      const data = await getReponseDataOrFail<ApiMonthPayload>(response, url);
      return mapApiMonthPayloadToView(data);
    },
    async updateBudget({ monthId, budgetId, name }) {
      const url = `${baseUrl}/months/${encodeURIComponent(monthId)}/budgets/${encodeURIComponent(budgetId)}`;
      let response: Response;
      try {
        response = await fetch(url, {
          method: 'PATCH',
          credentials: 'include',
          headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
          body: JSON.stringify({ name }),
        });
      } catch (err) {
        return handleHttpError({ err });
      }
      if (!response.ok) await handleNotOkResponse(response);
      const data = await getReponseDataOrFail<ApiMonthPayload>(response, url);
      return mapApiMonthPayloadToView(data);
    },
    async transferFromWeeklyBudget({
      monthId,
      fromWeeklyBudgetId,
      destinationType,
      destinationId,
      amount,
    }) {
      const toSegment = destinationType === 'weekly-budget' ? 'weekly-budget' : 'account';
      const url = `${baseUrl}/months/${encodeURIComponent(monthId)}/transfer/from/weekly-budget/${encodeURIComponent(fromWeeklyBudgetId)}/to/${toSegment}/${encodeURIComponent(destinationId)}`;
      let response: Response;
      try {
        response = await fetch(url, {
          method: 'PUT',
          credentials: 'include',
          headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
          body: JSON.stringify({ amount }),
        });
      } catch (err) {
        return handleHttpError({ err });
      }
      if (!response.ok) await handleNotOkResponse(response);
      const data = await getReponseDataOrFail<ApiMonthPayload>(response, url);
      return mapApiMonthPayloadToView(data);
    },
    async transferFromAccount({ monthId, fromAccountId, toWeeklyBudgetId, amount }) {
      const url = `${baseUrl}/months/${encodeURIComponent(monthId)}/transfer/from/account/${encodeURIComponent(fromAccountId)}/to/weekly-budget/${encodeURIComponent(toWeeklyBudgetId)}`;
      let response: Response;
      try {
        response = await fetch(url, {
          method: 'PUT',
          credentials: 'include',
          headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
          body: JSON.stringify({ amount }),
        });
      } catch (err) {
        return handleHttpError({ err });
      }
      if (!response.ok) await handleNotOkResponse(response);
      const data = await getReponseDataOrFail<ApiMonthPayload>(response, url);
      return mapApiMonthPayloadToView(data);
    },
    async archiveMonth({ monthId }) {
      const url = `${baseUrl}/months/${encodeURIComponent(monthId)}/archive`;
      let response: Response;
      try {
        response = await fetch(url, {
          method: 'PUT',
          credentials: 'include',
          headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
          body: JSON.stringify({}),
        });
      } catch (err) {
        return handleHttpError({ err });
      }
      if (!response.ok) await handleNotOkResponse(response);
      const data = await getReponseDataOrFail<ApiMonthPayload>(response, url);
      return mapApiMonthPayloadToView(data);
    },
    async unarchiveMonth({ monthId }) {
      const url = `${baseUrl}/months/${encodeURIComponent(monthId)}/unarchive`;
      let response: Response;
      try {
        response = await fetch(url, {
          method: 'PUT',
          credentials: 'include',
          headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
          body: JSON.stringify({}),
        });
      } catch (err) {
        return handleHttpError({ err });
      }
      if (!response.ok) await handleNotOkResponse(response);
      const data = await getReponseDataOrFail<ApiMonthPayload[]>(response, url);
      return data.map((row) => mapApiMonthPayloadToView(row));
    },
    async deleteArchivedMonth({ monthId }) {
      const url = `${baseUrl}/months/${encodeURIComponent(monthId)}`;
      let response: Response;
      try {
        response = await fetch(url, {
          method: 'DELETE',
          credentials: 'include',
          headers: { Accept: 'application/json' },
        });
      } catch (err) {
        return handleHttpError({ err });
      }
      if (!response.ok) await handleNotOkResponse(response);
      const data = await getReponseDataOrFail<ApiMonthPayload[]>(response, url);
      return data.map((row) => mapApiMonthPayloadToView(row));
    },
  };
}
