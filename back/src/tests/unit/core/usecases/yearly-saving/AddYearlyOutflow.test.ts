import expect from "../../../../test-helpers.js";
import { yearlyOutflowRepositoryStub } from "../test-helpers.js";
import AddYearlyOutflow, {
  AddYearlyOutflowCommand,
} from "../../../../../core/usecases/yearly-saving/AddYearlyOutflow.js";
import YearlyOutflows from "../../../../../core/models/yearly-outflows/YearlyOutflows.js";
import sinon from "sinon";
import YearlyOutflow from "../../../../../core/models/yearly-outflows/YearlyOutflow.js";
import YearlyBudget from "../../../../../core/models/yearly-outflows/YearlyBudget.js";

describe("Unit | Core | Usecases | AddYearlyOutflow", function () {
  describe("For outflow", () => {
    it("should call the repository and return the savings", async () => {
      // given
      const foundList = new YearlyOutflows();
      const listAddSpy = sinon.spy(foundList, "add");
      yearlyOutflowRepositoryStub.getAll.resolves(foundList);
      yearlyOutflowRepositoryStub.add.resolves(foundList);
      const expectedId = "uuid";
      const idProvider = {
        get: sinon.stub<any, string>(),
      };
      const factory = {
        create: sinon.stub(),
        idProvider,
      };
      idProvider.get.returns(expectedId);
      const usecase = new AddYearlyOutflow(
        yearlyOutflowRepositoryStub,
        factory
      );
      const command: AddYearlyOutflowCommand = {
        label: "label",
        amount: 10,
        month: 1,
        type: "outflow",
      };
      const expectedOutflow = new YearlyOutflow({
        ...command,
        id: expectedId,
      });
      factory.create.withArgs(command).returns(expectedOutflow);

      // when
      const list = await usecase.execute(command);

      // then
      expect(yearlyOutflowRepositoryStub.getAll).to.have.been.calledOnce;
      expect(factory.create).to.have.been.calledOnce;
      expect(listAddSpy).to.have.been.calledWithExactly(expectedOutflow);
      expect(yearlyOutflowRepositoryStub.add).to.have.been.calledWithExactly(
        expectedOutflow
      );
      expect(list).to.deep.equal(foundList);

      yearlyOutflowRepositoryStub.getAll.reset();
      factory.create.reset();
      yearlyOutflowRepositoryStub.add.reset();
    });
  });

  describe("For budget", () => {
    it("should call the repository and return the savings", async () => {
      // given
      const foundList = new YearlyOutflows();
      const listAddSpy = sinon.spy(foundList, "add");
      yearlyOutflowRepositoryStub.getAll.resolves(foundList);
      yearlyOutflowRepositoryStub.add.resolves(foundList);
      const expectedId = "uuid";
      const idProvider = {
        get: sinon.stub<any, string>(),
      };
      const factory = {
        create: sinon.stub(),
        idProvider,
      };
      idProvider.get.returns(expectedId);
      const usecase = new AddYearlyOutflow(
        yearlyOutflowRepositoryStub,
        factory
      );
      const command: AddYearlyOutflowCommand = {
        label: "label",
        amount: 10,
        month: 1,
        type: "budget",
      };
      const expectedBudget = new YearlyBudget({
        ...command,
        initialBalance: command.amount,
        name: command.label,
        id: expectedId,
      });
      factory.create.withArgs(command).returns(expectedBudget);

      // when
      const list = await usecase.execute(command);

      // then
      expect(yearlyOutflowRepositoryStub.getAll).to.have.been.calledOnce;
      expect(factory.create).to.have.been.calledOnce;
      expect(listAddSpy).to.have.been.calledWithExactly(expectedBudget);
      expect(yearlyOutflowRepositoryStub.add).to.have.been.calledWithExactly(
        expectedBudget
      );
      expect(list).to.deep.equal(foundList);

      yearlyOutflowRepositoryStub.getAll.reset();
      factory.create.reset();
      yearlyOutflowRepositoryStub.add.reset();
    });
  });
});
