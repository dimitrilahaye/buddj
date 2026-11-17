class AccountOutflowNotFoundError extends Error {
  constructor() {
    super("Sortie inconnue");
    this.name = "AccountOutflowNotFoundError";
  }
}

class AccountOutflowLabelCanNotBeEmptyError extends Error {
  constructor() {
    super("Le libellé ne peut pas être vide");
    this.name = "AccountOutflowLabelCanNotBeEmptyError";
  }
}

class AccountOutflowAmountMustBePositiveError extends Error {
  constructor() {
    super("Le montant de la sortie doit être positif");
    this.name = "AccountOutflowAmountMustBePositiveError";
  }
}

export {
  AccountOutflowNotFoundError,
  AccountOutflowLabelCanNotBeEmptyError,
  AccountOutflowAmountMustBePositiveError,
};
