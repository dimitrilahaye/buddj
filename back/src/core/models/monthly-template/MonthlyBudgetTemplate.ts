import {
  MonthlyBudgetTemplateNameCanNotBeEmptyError,
  MonthlyBudgetTemplateInitialBalanceCanNotBeLessThanOneError,
} from "../../errors/MonthlyTemplateErrors.js";

export default class MonthlyBudgetTemplate {
  id: string;
  name: string;
  initialBalance: number;

  constructor(props: { id: string; name: string; initialBalance: number }) {
    this.id = props.id;
    if (props.name.length === 0) {
      throw new MonthlyBudgetTemplateNameCanNotBeEmptyError();
    }
    this.name = props.name;
    if (props.initialBalance < 1) {
      throw new MonthlyBudgetTemplateInitialBalanceCanNotBeLessThanOneError();
    }
    this.initialBalance = Number(props.initialBalance.toFixed(2));
  }
}
