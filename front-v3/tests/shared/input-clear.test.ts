import { describe, it, expect, beforeEach, vi } from 'vitest';
import { fireEvent } from '@testing-library/dom';
import { attachInputClear } from '../../src/shared/input-clear.js';

function mountClearField(): { root: HTMLDivElement; input: HTMLInputElement; btn: HTMLButtonElement } {
  document.body.innerHTML = `
    <div class="buddj-input-clear-wrap" data-test-root>
      <input type="text" aria-label="Champ test" />
      <button type="button" class="buddj-input-clear-btn" data-buddj-input-clear aria-label="Effacer le champ test" hidden>
        <span aria-hidden="true">×</span>
      </button>
    </div>
  `;
  const root = document.querySelector('[data-test-root]') as HTMLDivElement;
  const input = root.querySelector('input') as HTMLInputElement;
  const btn = root.querySelector('[data-buddj-input-clear]') as HTMLButtonElement;
  return { root, input, btn };
}

describe('attachInputClear', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
  });

  it('masque le bouton tant que le champ est vide', () => {
    const { root, btn } = mountClearField();
    attachInputClear({ root });
    expect(btn.hidden).toBe(true);
  });

  it('affiche le bouton dès que le champ contient du texte', () => {
    const { root, input, btn } = mountClearField();
    attachInputClear({ root });
    fireEvent.input(input, { target: { value: 'hello' } });
    expect(btn.hidden).toBe(false);
  });

  it('au clic : vide le champ, émet input en bouillonnant, remet le focus sur le champ, masque le bouton', () => {
    const { root, input, btn } = mountClearField();
    attachInputClear({ root });
    fireEvent.input(input, { target: { value: 'à effacer' } });
    expect(btn.hidden).toBe(false);

    const inputSpy = vi.fn();
    input.addEventListener('input', inputSpy);

    fireEvent.click(btn);

    expect(input.value).toBe('');
    expect(inputSpy).toHaveBeenCalled();
    const ev = inputSpy.mock.calls[0]![0] as Event;
    expect(ev.bubbles).toBe(true);
    expect(document.activeElement).toBe(input);
    expect(btn.hidden).toBe(true);
  });

  it('ne fait rien si le bouton data-buddj-input-clear est absent', () => {
    document.body.innerHTML = `
      <div class="buddj-input-clear-wrap" data-test-root>
        <input type="text" />
      </div>
    `;
    const root = document.querySelector('[data-test-root]') as HTMLDivElement;
    expect(() => attachInputClear({ root })).not.toThrow();
  });

  it('ne fait rien si l’input est absent', () => {
    document.body.innerHTML = `
      <div class="buddj-input-clear-wrap" data-test-root>
        <button type="button" data-buddj-input-clear aria-label="Effacer" hidden>×</button>
      </div>
    `;
    const root = document.querySelector('[data-test-root]') as HTMLDivElement;
    expect(() => attachInputClear({ root })).not.toThrow();
  });
});
