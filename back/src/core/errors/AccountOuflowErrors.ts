class AccountOutflowNotFoundError extends Error {
  constructor() {
    super("Sortie inconnue");
    this.name = "AccountOutflowNotFoundError";
  }
}

export { AccountOutflowNotFoundError };
