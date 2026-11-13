import sinon from "sinon";
import expect from "../../../test-helpers.js";
import NodeEventBus from "../../../../providers/events/NodeEventBus.js";

const flushHandlers = () => new Promise((resolve) => setImmediate(resolve));

describe("Unit | Providers | Events | NodeEventBus", function () {
  it("should call the subscribed handler with the published payload", async function () {
    // given
    const bus = new NodeEventBus();
    const handler = sinon.stub().resolves();
    bus.subscribe("expenseDeleted", handler);

    // when
    bus.publish("expenseDeleted", { expenseId: "expense-id" });
    await flushHandlers();

    // then
    expect(handler).to.have.been.calledOnceWithExactly({
      expenseId: "expense-id",
    });
  });

  it("should not call the handler synchronously during publish", function () {
    // given
    const bus = new NodeEventBus();
    const handler = sinon.stub().resolves();
    bus.subscribe("outflowDeleted", handler);

    // when
    bus.publish("outflowDeleted", { outflowId: "outflow-id" });

    // then
    expect(handler).not.to.have.been.called;
  });

  it("should only call the handlers of the published event", async function () {
    // given
    const bus = new NodeEventBus();
    const expenseHandler = sinon.stub().resolves();
    const outflowHandler = sinon.stub().resolves();
    bus.subscribe("expenseDeleted", expenseHandler);
    bus.subscribe("outflowDeleted", outflowHandler);

    // when
    bus.publish("outflowDeleted", { outflowId: "outflow-id" });
    await flushHandlers();

    // then
    expect(outflowHandler).to.have.been.calledOnce;
    expect(expenseHandler).not.to.have.been.called;
  });

  it("should log a failing handler without throwing to the publisher", async function () {
    // given
    const logger = { error: sinon.stub() };
    const bus = new NodeEventBus(logger);
    const error = new Error("db down");
    bus.subscribe("expenseDeleted", sinon.stub().rejects(error));

    // when
    expect(() =>
      bus.publish("expenseDeleted", { expenseId: "expense-id" })
    ).not.to.throw();
    await flushHandlers();
    await flushHandlers();

    // then
    expect(logger.error).to.have.been.calledOnceWith(
      '[events] handler for "expenseDeleted" failed',
      error
    );
  });
});
