export default class RequestValidationError extends Error {
  constructor(serializer: string | null, message: string) {
    let m = message;
    if (serializer) {
      m = `${serializer}: ${message}`;
    }
    super(m);
    this.name = "RequestValidationError";
  }
}
