interface Transferable {
  transferBalanceTo(to: Transferable, amount: number);
  processTransfer(amount: number);
}

export default Transferable;
