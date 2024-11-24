class YearlyOutflowsAddError extends Error {
  constructor() {
    super("Yearly outflows: month must be between 1 and 12");
    this.name = "YearlyOutflowsAddError";
  }
}

class YearlyOutflowsIdDoesNotExistError extends Error {
  constructor() {
    super("Yearly outflows: outflow not found");
    this.name = "YearlyOutflowsIdDoesNotExistError";
  }
}

export { YearlyOutflowsAddError, YearlyOutflowsIdDoesNotExistError };
