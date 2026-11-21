export class SavingsAccountNotFoundError extends Error {
  constructor() {
    super("Le compte épargne n'existe pas");
    this.name = "SavingsAccountNotFoundError";
  }
}

export class SavingsAccountOperationNotFoundError extends Error {
  constructor() {
    super("L'opération n'existe pas");
    this.name = "SavingsAccountOperationNotFoundError";
  }
}

export class SavingsAccountOperationAmountMustBePositiveError extends Error {
  constructor() {
    super("Le montant de l'opération doit être supérieur à zéro");
    this.name = "SavingsAccountOperationAmountMustBePositiveError";
  }
}

export class SavingsAccountTrackerRangeError extends Error {
  constructor() {
    super("La date de début doit précéder la date de fin");
    this.name = "SavingsAccountTrackerRangeError";
  }
}
