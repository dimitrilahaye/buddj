import FetchWrapper from "./FetchWrapper.js";

export default class CbApi {
    #apiUrl = import.meta.env.VITE_API_URL;
    fetch = new FetchWrapper();

    /**
     * Authenticate the user to the app.
     * @return {Promise<null|string>}
     */
    async auth() {
        try {
            window.open(`${this.#apiUrl}/auth/google`, "_self");
        } catch (e) {
            return e.message;
        }
    }

    /**
     * Log out from the app.
     * @return {Promise<null>}
     */
    async logout() {
        return new Promise(async (res) => {
            await fetch(`${this.#apiUrl}/auth/logout`, {
                method: 'GET',
                credentials: "include",
                headers: {
                    Accept: "application/json",
                    "Content-Type": "application/json"
                }
            });
            res();
        });
    }

    async getMonths() {
        return await this.fetch.get('months/unarchived');
    }

    async getArchivedMonths() {
        return await this.fetch.get('months/archived');
    }

    async createMonth(data) {
        return await this.fetch.post('months', data);
    }

    async getMonthTemplate() {
        return await this.fetch.get('months/template');
    }

    async addExpense(monthId, weekId, expense) {
        return await this.fetch.post(`months/${monthId}/weeks/${weekId}/expenses/`, expense);
    }

    async addOutflow(monthId, outflow) {
        return await this.fetch.post(`months/${monthId}/outflows/`, outflow);
    }

    async manageExpensesChecking(monthId, weeklyBudgets) {
        return await this.fetch.put(`months/${monthId}/expenses/checking`, {weeklyBudgets});
    }

    async manageOutflowsChecking(monthId, body) {
        return await this.fetch.put(`months/${monthId}/outflows/checking`, body);
    }

    async archiveMonth(monthId) {
        return await this.fetch.put(`months/${monthId}/archive`);
    }

    async unarchiveMonth(monthId) {
        return await this.fetch.put(`months/${monthId}/unarchive`);
    }

    async deleteMonth(monthId) {
        return await this.fetch.delete(`months/${monthId}`);
    }

    async deleteExpense(monthId, weeklyId, expenseId) {
        return await this.fetch.delete(`months/${monthId}/weekly/${weeklyId}/expenses/${expenseId}`);
    }

    async deleteOutflow(monthId, outflowId) {
        return await this.fetch.delete(`months/${monthId}/outflows/${outflowId}`);
    }
}
