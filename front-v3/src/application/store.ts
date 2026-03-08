/**
 * Store générique : étend EventTarget, state typé T, getState/setState, emitStateChange, emitAction.
 */
export abstract class Store<T extends object> extends EventTarget {
  protected state: T;

  constructor(initialState: T) {
    super();
    this.state = { ...initialState };
  }

  getState(): T {
    return { ...this.state };
  }

  setState(partial: Partial<T>): void {
    this.state = { ...this.state, ...partial };
  }

  /**
   * Émet un event d'état (store → WC). Payload minimal dans detail.
   */
  emitStateChange<TDetail>(name: string, detail?: TDetail): void {
    this.dispatchEvent(new CustomEvent(name, { detail }));
  }

  /**
   * Helper pour les WC : envoie une action au store (synchrone).
   */
  emitAction(name: string, payload?: unknown): void {
    this.dispatchEvent(new CustomEvent(name, { detail: payload }));
  }
}
