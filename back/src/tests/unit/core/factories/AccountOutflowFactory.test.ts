import sinon from "sinon";
import expect from "../../../test-helpers.js";
import AccountOutflow from "../../../../core/models/month/account/AccountOutflow.js";
import AccountOutflowFactory from "../../../../core/factories/AccountOutflowFactory.js";

describe("Unit | Core | Factories | AccountOutflowFactory", function () {
    describe("#create", function () {
        it("should give an outflow with right data", function () {
            // given
            const idProvider = {
                get: sinon.stub<any, string>(),
            };
            idProvider.get.returns('uuid');

            const factory = new AccountOutflowFactory(idProvider);
            const command = {
                label: 'TAN',
                amount: 10,
            };

            // when
            const expense = factory.create(command);

            // then
            expect(expense).to.be.instanceof(AccountOutflow);
            expect(expense).to.deep.equal({
                id: 'uuid',
                label: 'TAN',
                amount: 10,
                isChecked: false,
            });
        });
    });
});
