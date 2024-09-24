import sinon from "sinon";
import expect from "../../../test-helpers.js";
import MonthCreationCommand from "../../../../core/commands/MonthCreationCommand.js";
import CreateNewMonth from "../../../../core/usecases/CreateNewMonth.js";
import {monthRepositoryStub} from "./test-helpers.js";

describe("Unit | Core | Usecases | CreateNewMonth", function () {
    it("should return a new created month", async function () {
        // given
        const command: MonthCreationCommand = {
            date: new Date(),
            initialBalance: 2000,
            outflows: [
                {
                    label: 'outlfow',
                    amount: 10.05,
                },
            ],
            weeklyBudgets: [
                {
                    name: 'Semaine 1',
                    initialBalance: 200,
                },
                {
                    name: 'Semaine 2',
                    initialBalance: 200,
                },
                {
                    name: 'Semaine 3',
                    initialBalance: 200,
                },
                {
                    name: 'Semaine 4',
                    initialBalance: 200,
                },
                {
                    name: 'Semaine 5',
                    initialBalance: 200,
                },
            ],
        };
        const monthFactoryStub = {
            idProvider: { get: sinon.stub() },
            create: sinon.stub(),
        };
        const monthFromFactory = Symbol('monthFromFactory');
        monthFactoryStub.create.withArgs(command).returns(monthFromFactory);

        const savedMonth = Symbol('savedMonth');
        monthRepositoryStub.save.withArgs(monthFromFactory).resolves(savedMonth);

        const usecase = new CreateNewMonth(monthRepositoryStub, monthFactoryStub);

        // when
        const newMonth = await usecase.execute(command);

        // then
        expect(newMonth).to.deep.equal(savedMonth);
    });
});
