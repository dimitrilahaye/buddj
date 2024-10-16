/**
 * @deprecated
 */
export default class UpdateExpenseCommandError extends Error {
  constructor(message: string) {
    super("UpdateExpenseCommand: " + message);
    this.name = "UpdateExpenseCommandError";
  }
}
