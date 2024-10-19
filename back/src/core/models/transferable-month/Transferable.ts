interface Transferable {
  transferRemainingBalanceTo(to: Transferable);
  processTransfer(amount: number);
}

export default Transferable;
