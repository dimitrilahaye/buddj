import sinon from "sinon";

const idProviderStub = {
  get: sinon.stub(),
};

const monthRepositoryStub = {
  addExpenseToWeeklyBudget: sinon.stub(),
  addOutflow: sinon.stub(),
  archive: sinon.stub(),
  unarchive: sinon.stub(),
  delete: sinon.stub(),
  deleteExpense: sinon.stub(),
  deleteOutflow: sinon.stub(),
  manageExpensesChecking: sinon.stub(),
  manageOutflowsChecking: sinon.stub(),
  updateAccountCurrentBalance: sinon.stub(),
  save: sinon.stub(),
  findAllUnarchived: sinon.stub(),
  findAllArchived: sinon.stub(),
  getById: sinon.stub(),
  updateWeeklyBudgetCurrentBalance: sinon.stub(),
  getTransferableById: sinon.stub(),
  updateWeeklyBudgetInitialBalance: sinon.stub(),
};

const monthlyTemplateRepositoryStub = {
  getDefault: sinon.stub(),
};

const monthlyOutflowTemplateRepositoryStub = {
  getAllByTemplateId: sinon.stub(),
};

const monthlyBudgetTemplateRepositoryStub = {
  getAllByTemplateId: sinon.stub(),
};

const pendingDebitRepositoryStub = {
  getAll: sinon.stub(),
};

const yearlyOutflowRepositoryStub = {
  getAll: sinon.stub(),
  add: sinon.stub(),
  remove: sinon.stub(),
};

function resetStubs() {
  monthRepositoryStub.addExpenseToWeeklyBudget.reset();
  monthRepositoryStub.addOutflow.reset();
  monthRepositoryStub.archive.reset();
  monthRepositoryStub.unarchive.reset();
  monthRepositoryStub.delete.reset();
  monthRepositoryStub.deleteExpense.reset();
  monthRepositoryStub.deleteOutflow.reset();
  monthRepositoryStub.manageExpensesChecking.reset();
  monthRepositoryStub.manageOutflowsChecking.reset();
  monthRepositoryStub.updateAccountCurrentBalance.reset();
  monthRepositoryStub.save.reset();
  monthRepositoryStub.findAllUnarchived.reset();
  monthRepositoryStub.findAllArchived.reset();
  monthRepositoryStub.getById.reset();
  monthRepositoryStub.updateWeeklyBudgetCurrentBalance.reset();
  monthRepositoryStub.getTransferableById.reset();
  monthRepositoryStub.updateWeeklyBudgetInitialBalance.reset();
  pendingDebitRepositoryStub.getAll.reset();
  yearlyOutflowRepositoryStub.getAll.reset();
  yearlyOutflowRepositoryStub.add.reset();
  yearlyOutflowRepositoryStub.remove.reset();
  monthlyTemplateRepositoryStub.getDefault.reset();
  monthlyOutflowTemplateRepositoryStub.getAllByTemplateId.reset();
  monthlyBudgetTemplateRepositoryStub.getAllByTemplateId.reset();
  idProviderStub.get.reset();
}

export {
  monthRepositoryStub,
  pendingDebitRepositoryStub,
  yearlyOutflowRepositoryStub,
  monthlyTemplateRepositoryStub,
  monthlyOutflowTemplateRepositoryStub,
  monthlyBudgetTemplateRepositoryStub,
  idProviderStub,
  resetStubs,
};
