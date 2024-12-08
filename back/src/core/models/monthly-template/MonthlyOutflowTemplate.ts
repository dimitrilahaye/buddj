import {
  MonthlyOutflowTemplateAmountCanNotBeLessThanOneError,
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
    if (props.amount < 1) {
      throw new MonthlyOutflowTemplateAmountCanNotBeLessThanOneError();
    }
    this.amount = props.amount;
  }
}
