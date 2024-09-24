import chai from "chai";
import cap from 'chai-as-promised';
import sinonChai from "sinon-chai";
import sinon from "sinon";

const expect = chai.expect;

chai.use(sinonChai);
chai.use(cap);

export class Clock {
    private clock: sinon.SinonFakeTimers | null = null;
    start(date: Date): void {
        this.clock = sinon.useFakeTimers({
            now: date,
            shouldAdvanceTime: true,
            toFake: ["Date"],
        });
    }
    restore(): void {
        this.clock?.restore();
    }
}

export default expect;
