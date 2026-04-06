import type { ProjectService } from '../application/project/project-service.js';
import type { ProjectCategory, ProjectView } from '../application/project/project-view.js';
import { getReponseDataOrFail } from '../shared/get-reponse-data-or-fail.js';
import { handleHttpError, handleNotOkResponse } from '../shared/http-error.js';

type ApiProjectPayload = {
  id: string;
  name: string;
  target: number;
  totalAmount: number;
  canRollback: boolean;
  canReApply: boolean;
  canFinish: boolean;
  category: ProjectCategory;
};

function mapApiProjectPayloadToView({ payload }: { payload: ApiProjectPayload }): ProjectView {
  return {
    id: payload.id,
    name: payload.name,
    target: payload.target,
    totalAmount: payload.totalAmount,
    canRollback: payload.canRollback,
    canReApply: payload.canReApply,
    canFinish: payload.canFinish,
    category: payload.category,
  };
}

export function createProjectServiceFromApi({ apiUrl }: { apiUrl: string }): ProjectService {
  const baseUrl = apiUrl.replace(/\/$/, '');

  return {
    async getAllByCategory({ category }) {
      const url = `${baseUrl}/projects/category/${encodeURIComponent(category)}`;
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
      const data = await getReponseDataOrFail<ApiProjectPayload[]>(response, url);
      return data.map((payload) => mapApiProjectPayloadToView({ payload }));
    },

    async create({ name, target, category }) {
      const url = `${baseUrl}/projects`;
      let response: Response;
      try {
        response = await fetch(url, {
          method: 'POST',
          credentials: 'include',
          headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
          body: JSON.stringify({ name, target, category }),
        });
      } catch (err) {
        return handleHttpError({ err });
      }
      if (!response.ok) await handleNotOkResponse(response);
      const data = await getReponseDataOrFail<ApiProjectPayload>(response, url);
      return mapApiProjectPayloadToView({ payload: data });
    },

    async update({ projectId, name, target }) {
      const url = `${baseUrl}/projects/${encodeURIComponent(projectId)}`;
      let response: Response;
      try {
        response = await fetch(url, {
          method: 'PATCH',
          credentials: 'include',
          headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
          body: JSON.stringify({ name, target }),
        });
      } catch (err) {
        return handleHttpError({ err });
      }
      if (!response.ok) await handleNotOkResponse(response);
      const data = await getReponseDataOrFail<ApiProjectPayload>(response, url);
      return mapApiProjectPayloadToView({ payload: data });
    },

    async addAmount({ projectId, amount }) {
      const url = `${baseUrl}/projects/${encodeURIComponent(projectId)}/add`;
      let response: Response;
      try {
        response = await fetch(url, {
          method: 'PATCH',
          credentials: 'include',
          headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
          body: JSON.stringify({ amount }),
        });
      } catch (err) {
        return handleHttpError({ err });
      }
      if (!response.ok) await handleNotOkResponse(response);
      const data = await getReponseDataOrFail<ApiProjectPayload>(response, url);
      return mapApiProjectPayloadToView({ payload: data });
    },

    async rollback({ projectId }) {
      const url = `${baseUrl}/projects/${encodeURIComponent(projectId)}/rollback`;
      let response: Response;
      try {
        response = await fetch(url, {
          method: 'PATCH',
          credentials: 'include',
          headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
          body: JSON.stringify({}),
        });
      } catch (err) {
        return handleHttpError({ err });
      }
      if (!response.ok) await handleNotOkResponse(response);
      const data = await getReponseDataOrFail<ApiProjectPayload>(response, url);
      return mapApiProjectPayloadToView({ payload: data });
    },

    async reApply({ projectId }) {
      const url = `${baseUrl}/projects/${encodeURIComponent(projectId)}/re-apply`;
      let response: Response;
      try {
        response = await fetch(url, {
          method: 'PATCH',
          credentials: 'include',
          headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
          body: JSON.stringify({}),
        });
      } catch (err) {
        return handleHttpError({ err });
      }
      if (!response.ok) await handleNotOkResponse(response);
      const data = await getReponseDataOrFail<ApiProjectPayload>(response, url);
      return mapApiProjectPayloadToView({ payload: data });
    },

    async remove({ projectId }) {
      const url = `${baseUrl}/projects/${encodeURIComponent(projectId)}`;
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
      return;
    },
  };
}
