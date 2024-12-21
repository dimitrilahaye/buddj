export default class RequestValidationError extends Error {
  constructor(serializer: string, message: string) {
    super(`${serializer}: ${message}`);
    this.name = "RequestValidationError";
  }
}
