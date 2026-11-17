class YearlySavingsAddError extends Error {
  constructor() {
    super("Mois incorrect");
    this.name = "YearlySavingsAddError";
  }
}

class YearlySavingsIdDoesNotExistError extends Error {
  constructor() {
    super("Économie annuelle inconnue");
    this.name = "YearlySavingsIdDoesNotExistError";
  }
}

class YearlySavingTypeDoesNotExistError extends Error {
  constructor() {
    super("Ce type d'économie annuelle est inconnu");
    this.name = "YearlySavingTypeDoesNotExistError";
  }
}

class YearlySavingLabelCanNotBeEmptyError extends Error {
  constructor() {
    super("Le libellé ne peut pas être vide");
    this.name = "YearlySavingLabelCanNotBeEmptyError";
  }
}

class YearlySavingAmountMustBePositiveError extends Error {
  constructor() {
    super("Le montant doit être positif");
    this.name = "YearlySavingAmountMustBePositiveError";
  }
}

export {
  YearlySavingLabelCanNotBeEmptyError,
  YearlySavingAmountMustBePositiveError,
  YearlySavingsAddError,
  YearlySavingsIdDoesNotExistError,
  YearlySavingTypeDoesNotExistError,
};
