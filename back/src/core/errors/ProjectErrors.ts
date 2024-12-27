class ProjectNotFoundError extends Error {
  constructor() {
    super("Aucun projet trouvé pour l'id donné");
    this.name = "ProjectNotFoundError";
  }
}

class AddedInactiveLogError extends Error {
  constructor() {
    super("Vous ne pouvez pas ajouter un montant inactif");
    this.name = "AddedInactiveLogError";
  }
}

class AddedOlderLogError extends Error {
  constructor() {
    super(
      "Vous ne pouvez pas ajouter un montant antérieur au dernier montant ajouté"
    );
    this.name = "AddedOlderLogError";
  }
}

class ProjectNameCanNotBeEmptyError extends Error {
  constructor() {
    super("Le nom ne peut pas être vide");
    this.name = "ProjectNameCanNotBeEmptyError";
  }
}

class ProjectTargetMustBePositiveError extends Error {
  constructor() {
    super("L'objectif doit être un montant positif");
    this.name = "ProjectTargetMustBePositiveError";
  }
}

class ProjectAmountMustBePositiveError extends Error {
  constructor() {
    super("Un montant de projet doit être positif");
    this.name = "ProjectAmountMustBePositiveError";
  }
}

class UnknownCategoryError extends Error {
  constructor(category: string) {
    super(`La catégorie "${category}" n'existe pas`);
    this.name = "UnknownCategoryError";
  }
}

export {
  AddedInactiveLogError,
  AddedOlderLogError,
  ProjectNameCanNotBeEmptyError,
  ProjectTargetMustBePositiveError,
  ProjectAmountMustBePositiveError,
  ProjectNotFoundError,
  UnknownCategoryError,
};
