/**
 * @deprecated
 */
export default interface UpdateExpenseCommand {
  monthId: string;
  originalWeeklyId: string;
  newWeeklyId: string;
  expenseId: string;
  label: string;
  amount: number;
}
