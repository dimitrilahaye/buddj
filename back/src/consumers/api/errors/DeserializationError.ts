export default class DeserializationError extends Error {
  constructor(serializer: string, message: string) {
    super(`${serializer}: ${message}`);
    this.name = "DeserializationError";
  }
}
