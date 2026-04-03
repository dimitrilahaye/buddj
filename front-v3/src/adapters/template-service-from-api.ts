import type { TemplateService } from '../application/template/template-service.js';
import type { TemplateView } from '../application/template/template-view.js';
import { getReponseDataOrFail } from '../shared/get-reponse-data-or-fail.js';
import { errorMessageFromUnknown, handleHttpError, handleNotOkResponse } from '../shared/http-error.js';
import { type ApiTemplatePayload, mapApiTemplatePayloadToView } from './map-api-template-to-view.js';

export function createTemplateServiceFromApi({ apiUrl }: { apiUrl: string }): TemplateService {
  const baseUrl = apiUrl.replace(/\/$/, '');

  async function parseTemplateResponse(response: Response, routeLabel: string): Promise<TemplateView> {
    if (!response.ok) await handleNotOkResponse(response);
    const data = await getReponseDataOrFail<ApiTemplatePayload>(response, routeLabel);
    return mapApiTemplatePayloadToView(data);
  }

  return {
    async getAllTemplates() {
      const url = `${baseUrl}/months/template`;
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
      const data = await getReponseDataOrFail<ApiTemplatePayload[]>(response, url);
      return data.map((row) => mapApiTemplatePayloadToView(row));
    },

    async updateTemplate({ templateId, name, isDefault }) {
      const url = `${baseUrl}/monthly-templates/${encodeURIComponent(templateId)}`;
      let response: Response;
      try {
        response = await fetch(url, {
          method: 'PATCH',
          credentials: 'include',
          headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
          body: JSON.stringify({ name, isDefault }),
        });
      } catch (err) {
        return handleHttpError({ err });
      }
      return parseTemplateResponse(response, url);
    },

    async addTemplateOutflow({ templateId, label, amount }) {
      const url = `${baseUrl}/monthly-templates/${encodeURIComponent(templateId)}/monthly-outflows`;
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
      const data = await getReponseDataOrFail<ApiTemplatePayload>(response, url);
      return mapApiTemplatePayloadToView(data);
    },

    async deleteTemplateOutflow({ templateId, outflowId }) {
      const url = `${baseUrl}/monthly-templates/${encodeURIComponent(templateId)}/monthly-outflows/${encodeURIComponent(outflowId)}`;
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
      return parseTemplateResponse(response, url);
    },

    async addTemplateBudget({ templateId, name, initialBalance }) {
      const url = `${baseUrl}/monthly-templates/${encodeURIComponent(templateId)}/monthly-budgets`;
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
      const data = await getReponseDataOrFail<ApiTemplatePayload>(response, url);
      return mapApiTemplatePayloadToView(data);
    },

    async deleteTemplateBudget({ templateId, budgetId }) {
      const url = `${baseUrl}/monthly-templates/${encodeURIComponent(templateId)}/monthly-budgets/${encodeURIComponent(budgetId)}`;
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
      return parseTemplateResponse(response, url);
    },
  };
}
