import expect from "../../../../../test-helpers.js";
import AccountOutflow from "../../../../../../core/models/month/account/AccountOutflow.js";

describe("Unit | Core | Models | Month | Account | AccountOutflow", function () {
    describe("#constructor", function () {
        it("should give an account outflow with right data", function () {
            // given
            const props = {
                id: 'uuid',
                label: 'outlfow',
                amount: 10.05,
                isChecked: true,
            };

            // when
            const outflow = new AccountOutflow(props);

            // then
            expect(outflow).to.deep.equal(props);
        });
        it("should give an account outflow with data with default isChecked false", function () {
            // given
            const props = {
                id: 'uuid',
                label: 'outlfow',
                amount: 10.05,
            };

            // when
            const outflow = new AccountOutflow(props);

            // then
            expect(outflow).to.deep.equal({...props, isChecked: false});
        });
    });

    describe("#check", function () {
        it("should check the outflow", function () {
            // given
            const outflow = new AccountOutflow({
                id: 'uuid',
                label: 'outlfow',
                amount: 10.05,
                isChecked: false,
            });

            // when
            outflow.check();

            // then
            expect(outflow.isChecked).to.be.true;
        });
    });

    describe("#uncheck", function () {
        it("should uncheck the outflow", function () {
            // given
            const outflow = new AccountOutflow({
                id: 'uuid',
                label: 'outlfow',
                amount: 10.05,
                isChecked: true,
            });

            // when
            outflow.uncheck();

            // then
            expect(outflow.isChecked).to.be.false;
        });
    });
});
