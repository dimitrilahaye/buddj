export default class FetchWrapper {
    #apiUrl = import.meta.env.VITE_API_URL;

    async get(url, queryObject = null) {
        let urlForFetch = this.#buildUrl(url, queryObject);
        return await this.#fetch(urlForFetch, 'GET');
    }

    async delete(url, queryObject = null) {
        let urlForFetch = this.#buildUrl(url, queryObject);
        return await this.#fetch(urlForFetch, 'DELETE');
    }

    async post(url, body = {}, queryObject = null) {
        let urlForFetch = this.#buildUrl(url, queryObject);
        return await this.#fetch(urlForFetch, 'POST', body);
    }

    async put(url, body = {}, queryObject = null) {
        let urlForFetch = this.#buildUrl(url, queryObject);
        return await this.#fetch(urlForFetch, 'PUT', body);
    }

    #buildUrl(url, queryObject) {
        let urlForFetch = url;
        if (queryObject !== null) {
            const query = new URLSearchParams(queryObject);
            urlForFetch += ('?' + query);
        }
        return urlForFetch;
    }

    async #fetch(url, method, body = null) {
        return new Promise(async (res, rej) => {
            try {
                const fetchParams = {
                    method,
                    credentials: "include",
                    body: body !== null ? JSON.stringify(body) : undefined,
                    headers: {
                        Accept: "application/json",
                        "Content-Type": "application/json"
                    }
                };
                const result = await fetch(`${this.#apiUrl}/${url}`, fetchParams);
                if (result.status === 401) {
                    rej(result.statusText);
                }
                const json = await result.json();
                if (json.success === true) {
                    res(json.data);
                }
                if (json.success === false) {
                    rej(json.message);
                }
            } catch (e) {
                rej(e.message);
            }
        });
    }
}
