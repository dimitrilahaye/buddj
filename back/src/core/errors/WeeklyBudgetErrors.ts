class WeeklyBudgetNotFoundError extends Error {
  constructor() {
    super("Budget inconnu");
    this.name = "WeeklyBudgetNotFoundError";
  }
}

class AccountBudgetNameCantBeEmptyError extends Error {
  constructor() {
    super("Le nom ne peut pas être vide");
    this.name = "AccountBudgetNameCantBeEmptyError";
  }
}

class AccountBudgetCanNotBeRemovedError extends Error {
  constructor() {
    super("Vous ne pouvez pas supprimer ce budget");
    this.name = "AccountBudgetCanNotBeRemovedError";
  }
}

export {
  WeeklyBudgetNotFoundError,
  AccountBudgetNameCantBeEmptyError,
  AccountBudgetCanNotBeRemovedError,
};
