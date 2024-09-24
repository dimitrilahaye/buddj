import IdProvider from "../ports/providers/IdProvider.js";
import AccountOutflow from "../models/month/account/AccountOutflow.js";

export default class AccountOutflowFactory {
    constructor(public readonly idProvider: IdProvider) {
    }

    create(command: any): AccountOutflow {
        return new AccountOutflow({
            id: this.idProvider.get(),
            amount: command.amount,
            label: command.label,
            isChecked: false,
        });
    }
}
