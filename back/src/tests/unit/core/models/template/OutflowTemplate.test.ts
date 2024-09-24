import expect from "../../../../test-helpers.js";
import OutflowTemplate from "../../../../../core/models/template/OutflowTemplate.js";

describe("Unit | Core | Models | Template | OutflowTemplate", function () {
    describe("#constructor", function () {
        it("should give an outflow template with right data", function () {
            // given
            const props = {
                label: 'outlfow',
                amount: 10.05,
            };

            // when
            const outflow = new OutflowTemplate(props);

            // then
            expect(outflow).to.deep.equal({...props, isChecked: false});
        });
    });
});
