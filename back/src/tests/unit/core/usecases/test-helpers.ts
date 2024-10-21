import sinon from "sinon";

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
}

export { monthRepositoryStub, resetStubs };
