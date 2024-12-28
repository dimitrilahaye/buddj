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

export {
  YearlySavingsAddError,
  YearlySavingsIdDoesNotExistError,
  YearlySavingTypeDoesNotExistError,
};
