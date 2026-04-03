import type { ApiYearlyOutflowsPayload } from '../application/yearly-outflows/yearly-outflows-types.js';
import type { YearlyOutflowsService } from '../application/yearly-outflows/yearly-outflows-service.js';
import { mapApiYearlyOutflowsPayloadToView } from '../application/yearly-outflows/yearly-outflows-view.js';
import { getReponseDataOrFail } from '../shared/get-reponse-data-or-fail.js';
import { handleHttpError, handleNotOkResponse } from '../shared/http-error.js';

function bodyForAdd(input: {
  kind: 'outflow' | 'budget';
  month: number;
  label: string;
  amount: number;
}): Record<string, unknown> {
  if (input.kind === 'outflow') {
    return {
      type: 'outflow',
      month: input.month,
      label: input.label.trim(),
      amount: input.amount,
    };
  }
  return {
    type: 'budget',
    month: input.month,
    label: input.label.trim(),
    amount: input.amount,
  };
}

export function createYearlyOutflowsServiceFromApi({ apiUrl }: { apiUrl: string }): YearlyOutflowsService {
  const baseUrl = apiUrl.replace(/\/$/, '');
  return {
    async getAll() {
      const url = `${baseUrl}/yearly-outflows`;
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
      const data = await getReponseDataOrFail<ApiYearlyOutflowsPayload>(response, '/yearly-outflows');
      return mapApiYearlyOutflowsPayloadToView(data);
    },
    async add(input) {
      const url = `${baseUrl}/yearly-outflows`;
      let response: Response;
      try {
        response = await fetch(url, {
          method: 'POST',
          credentials: 'include',
          headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
          body: JSON.stringify(bodyForAdd(input)),
        });
      } catch (err) {
        return handleHttpError({ err });
      }
      if (!response.ok) await handleNotOkResponse(response);
      const data = await getReponseDataOrFail<ApiYearlyOutflowsPayload>(response, '/yearly-outflows');
      return mapApiYearlyOutflowsPayloadToView(data);
    },
    async remove({ id }) {
      const url = `${baseUrl}/yearly-outflows/${encodeURIComponent(id)}`;
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
      const data = await getReponseDataOrFail<ApiYearlyOutflowsPayload>(response, url);
      return mapApiYearlyOutflowsPayloadToView(data);
    },
  };
}
