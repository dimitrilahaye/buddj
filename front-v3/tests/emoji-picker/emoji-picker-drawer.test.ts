import { beforeEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, screen, within } from '@testing-library/dom';
import '../../src/register-components.js';
import type { BuddjEmojiPickerDrawerElement } from '../../src/components/organisms/buddj-emoji-picker-drawer.js';

function drawer(): BuddjEmojiPickerDrawerElement {
  return document.getElementById('picker') as BuddjEmojiPickerDrawerElement;
}

function openPicker(onSelect = vi.fn()): HTMLElement {
  drawer().open({ onSelect });
  return screen.getByRole('dialog', { name: 'Choisir un emoji' });
}

function isOpen(): boolean {
  return drawer().classList.contains('emoji-picker-drawer--open');
}

function isExpanded(): boolean {
  return drawer().classList.contains('emoji-picker-drawer--expanded');
}

/** Tire la poignée de `dy` pixels (négatif : vers le haut). */
function pull(dialog: HTMLElement, dy: number): void {
  const header = dialog.querySelector('.emoji-picker-drawer-header') as HTMLElement;
  fireEvent.pointerDown(header, { pointerId: 1, clientY: 500 });
  fireEvent.pointerMove(header, { pointerId: 1, clientY: 500 + dy / 2 });
  fireEvent.pointerMove(header, { pointerId: 1, clientY: 500 + dy });
  fireEvent.pointerUp(header, { pointerId: 1, clientY: 500 + dy });
}

describe('drawer de choix d’emoji', () => {
  beforeEach(() => {
    document.body.innerHTML = '<buddj-emoji-picker-drawer id="picker"></buddj-emoji-picker-drawer>';
  });

  it('s’ouvre à sa taille par défaut', () => {
    openPicker();
    expect(isOpen()).toBe(true);
    expect(isExpanded()).toBe(false);
  });

  it('tiré vers le haut, passe en grand', () => {
    const dialog = openPicker();
    pull(dialog, -120);
    expect(isExpanded()).toBe(true);
    expect(isOpen()).toBe(true);
  });

  it('tiré vers le bas depuis le grand, revient à la taille par défaut, puis se ferme au geste suivant', () => {
    const dialog = openPicker();
    pull(dialog, -120);

    pull(dialog, 120);
    expect(isOpen()).toBe(true);
    expect(isExpanded()).toBe(false);

    pull(dialog, 120);
    expect(isOpen()).toBe(false);
  });

  it('un petit geste ne change rien', () => {
    const dialog = openPicker();
    pull(dialog, 20);
    expect(isOpen()).toBe(true);
    pull(dialog, -20);
    expect(isExpanded()).toBe(false);
  });

  it('la poignée bascule au clavier entre taille par défaut et grand', () => {
    const dialog = openPicker();
    const handle = within(dialog).getByRole('button', { name: 'Agrandir ou réduire' });
    fireEvent.click(handle);
    expect(isExpanded()).toBe(true);
    expect(handle.getAttribute('aria-expanded')).toBe('true');
    fireEvent.click(handle);
    expect(isExpanded()).toBe(false);
  });

  it('se ferme avec la croix', () => {
    const dialog = openPicker();
    fireEvent.click(within(dialog).getByRole('button', { name: 'Fermer' }));
    expect(isOpen()).toBe(false);
  });

  it('se ferme au clic en dehors', () => {
    openPicker();
    fireEvent.click(drawer().querySelector('[data-emoji-picker-drawer-backdrop]') as HTMLElement);
    expect(isOpen()).toBe(false);
  });

  it('se rouvre à sa taille par défaut après avoir été fermé en grand', () => {
    const dialog = openPicker();
    pull(dialog, -120);
    fireEvent.click(within(dialog).getByRole('button', { name: 'Fermer' }));
    openPicker();
    expect(isExpanded()).toBe(false);
  });

  it('transmet l’emoji choisi puis se ferme', () => {
    const onSelect = vi.fn();
    const dialog = openPicker(onSelect);
    fireEvent.click(within(dialog).getByRole('button', { name: 'Choisir 🚗' }));
    expect(onSelect).toHaveBeenCalledWith('🚗');
    expect(isOpen()).toBe(false);
  });
});
