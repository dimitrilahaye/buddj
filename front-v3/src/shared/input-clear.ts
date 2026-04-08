/**
 * Bouton d'effacement pour champs texte (comportement homogène desktop + iOS).
 * Le conteneur doit contenir un seul `input` et un `button[data-buddj-input-clear]`.
 */
export function attachInputClear({ root }: { root: HTMLElement }): void {
  const input = root.querySelector<HTMLInputElement>('input');
  const btn = root.querySelector<HTMLButtonElement>('[data-buddj-input-clear]');
  if (!input || !btn) return;

  const sync = (): void => {
    btn.hidden = (input.value ?? '').length === 0;
  };

  sync();
  input.addEventListener('input', sync);
  btn.addEventListener('click', () => {
    input.value = '';
    input.dispatchEvent(new Event('input', { bubbles: true }));
    input.focus();
    sync();
  });
}
