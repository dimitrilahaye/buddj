class YearlySavingsAddError extends Error {
  constructor() {
    super("Yearly savings: month must be between 1 and 12");
    this.name = "YearlySavingsAddError";
  }
}

class YearlySavingsIdDoesNotExistError extends Error {
  constructor() {
    super("Yearly savings: saving not found");
    this.name = "YearlySavingsIdDoesNotExistError";
  }
}

class YearlySavingTypeDoesNotExistError extends Error {
  constructor() {
    super("Yearly savings: type does not exist");
    this.name = "YearlySavingTypeDoesNotExistError";
  }
}

export {
  YearlySavingsAddError,
  YearlySavingsIdDoesNotExistError,
  YearlySavingTypeDoesNotExistError,
};
