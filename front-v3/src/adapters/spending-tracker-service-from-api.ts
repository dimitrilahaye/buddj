import type { SpendingTrackerService } from '../application/spending-tracker/spending-tracker-service.js';
import type { ApiSpendingTrackerPayload } from '../application/spending-tracker/spending-tracker-types.js';
import { getReponseDataOrFail } from '../shared/get-reponse-data-or-fail.js';
import { handleHttpError, handleNotOkResponse } from '../shared/http-error.js';
import { mapApiSpendingTrackerToView } from './map-api-spending-tracker-to-view.js';

export function createSpendingTrackerServiceFromApi({ apiUrl }: { apiUrl: string }): SpendingTrackerService {
  const baseUrl = apiUrl.replace(/\/$/, '');
  return {
    async get({ granularity, from, to }) {
      const query = new URLSearchParams({ granularity, from, to });
      const url = `${baseUrl}/spending-tracker?${query.toString()}`;
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
      const data = await getReponseDataOrFail<ApiSpendingTrackerPayload>(response, '/spending-tracker');
      return mapApiSpendingTrackerToView(data);
    },
  };
}
