import {
  MonthlyOutflowTemplateAmountMustBeGreaterThanZeroError,
  MonthlyOutflowTemplateLabelCanNotBeEmptyError,
} from "../../errors/MonthlyTemplateErrors.js";

export default class MonthlyOutflowTemplate {
  id: string;
  amount: number;
  label: string;

  constructor(props: { id: string; label: string; amount: number }) {
    this.id = props.id;
    if (props.label.length === 0) {
      throw new MonthlyOutflowTemplateLabelCanNotBeEmptyError();
    }
    this.label = props.label;
    if (props.amount <= 0) {
      throw new MonthlyOutflowTemplateAmountMustBeGreaterThanZeroError();
    }
    this.amount = props.amount;
  }
}
