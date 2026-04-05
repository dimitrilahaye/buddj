import { describe, it, expect, beforeEach } from 'vitest';
import { screen, waitFor, fireEvent, within } from '@testing-library/dom';
import '../../src/register-components.js';

describe('buddj-calculator-drawer — Recharger', () => {
  beforeEach(() => {
    document.body.innerHTML = '<buddj-calculator-drawer id="calc-test"></buddj-calculator-drawer>';
  });

  it('après Recharger, la saisie de chiffres fonctionne quand le drawer a été ouvert à zéro (sans valeur initiale affichée)', async () => {
    const el = document.getElementById('calc-test') as HTMLElement & {
      open: (o: {
        initialValue: string;
        startWithInitialValue?: boolean;
        onValidate: (v: string) => void;
        onCancel: () => void;
      }) => void;
    };
    el.open({
      initialValue: '0',
      startWithInitialValue: false,
      onValidate: () => {},
      onCancel: () => {},
    });
    await waitFor(() => {
      expect(screen.getByRole('dialog', { name: 'Solde actuel' })).toBeTruthy();
    });
    const dialog = screen.getByRole('dialog', { name: 'Solde actuel' });
    fireEvent.click(within(dialog).getByRole('button', { name: 'Recharger' }));
    fireEvent.click(within(dialog).getByRole('button', { name: '5' }));
    expect(within(dialog).getByText('5 €')).toBeTruthy();
  });

  it('après Recharger, la saisie fonctionne quand la valeur initiale affichée est zéro', async () => {
    const el = document.getElementById('calc-test') as HTMLElement & {
      open: (o: {
        initialValue: string;
        startWithInitialValue?: boolean;
        onValidate: (v: string) => void;
        onCancel: () => void;
      }) => void;
    };
    el.open({
      initialValue: '0',
      startWithInitialValue: true,
      onValidate: () => {},
      onCancel: () => {},
    });
    await waitFor(() => {
      expect(screen.getByRole('dialog', { name: 'Solde actuel' })).toBeTruthy();
    });
    const dialog = screen.getByRole('dialog', { name: 'Solde actuel' });
    fireEvent.click(within(dialog).getByRole('button', { name: 'Recharger' }));
    fireEvent.click(within(dialog).getByRole('button', { name: '8' }));
    expect(within(dialog).getByText('8 €')).toBeTruthy();
  });
});
