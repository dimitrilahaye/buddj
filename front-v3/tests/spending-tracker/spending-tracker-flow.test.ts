/**
 * Écran « Suivi des dépenses » via bootstrap + service in-memory.
 * Aujourd'hui est figé au vendredi 13 novembre 2026.
 */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, screen, waitFor, within } from '@testing-library/dom';
import { createAuthServiceFromInMemory } from '../../src/adapters/auth-service-from-in-memory.js';
import {
  createSpendingTrackerServiceFromInMemory,
  type InMemoryTrackedSpending,
} from '../../src/adapters/spending-tracker-service-from-in-memory.js';
import '../../src/register-components.js';
import { bootstrap } from '../../src/bootstrap.js';
import { monthServiceEmpty } from '../helpers/month-service-empty.js';

const SPENDINGS: InMemoryTrackedSpending[] = [
  { id: 'vacances', kind: 'expense', label: 'Vacances', amount: 300, day: '2026-09-15', occurredAt: '2026-09-15T10:00:00.000Z' },
  { id: 'loyer', kind: 'outflow', label: 'Loyer', amount: 699.41, day: '2026-11-02', occurredAt: '2026-11-02T08:00:00.000Z' },
  { id: 'courses', kind: 'expense', label: 'Courses', amount: 42.1, day: '2026-11-12', occurredAt: '2026-11-12T17:00:00.000Z' },
  { id: 'edf', kind: 'outflow', label: 'EDF', amount: 114.62, day: '2026-11-12', occurredAt: '2026-11-12T08:00:00.000Z' },
  { id: 'boulangerie', kind: 'expense', label: 'Boulangerie', amount: 4.5, day: '2026-11-13', occurredAt: '2026-11-13T07:30:00.000Z' },
  { id: 'kebab', kind: 'expense', label: 'Kebab', amount: 12, day: '2026-11-13', occurredAt: '2026-11-13T12:15:00.000Z' },
];

function shellDocument(): void {
  document.body.innerHTML = `
    <buddj-toast></buddj-toast>
    <buddj-burger-panel id="burger-panel"></buddj-burger-panel>
    <main id="screen-outlet" role="main"></main>
  `;
}

function startOn(path: string, service = createSpendingTrackerServiceFromInMemory({ spendings: SPENDINGS })) {
  shellDocument();
  window.history.replaceState(null, '', path);
  bootstrap({
    authService: createAuthServiceFromInMemory(true),
    monthService: monthServiceEmpty,
    spendingTrackerService: service,
  });
  return service;
}

function totalText(): string {
  return screen.getByRole('status', { name: 'Total de la période' }).textContent ?? '';
}

describe('écran suivi des dépenses', () => {
  beforeEach(() => {
    vi.useFakeTimers({ toFake: ['Date'], now: new Date(2026, 10, 13, 18, 0) });
  });

  afterEach(() => {
    vi.useRealTimers();
    window.history.replaceState(null, '', '/');
  });

  it('s’ouvre sur le mois en cours, jour par jour', async () => {
    const service = startOn('/spending-tracker');

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: 'Suivi des dépenses', level: 1 })).toBeTruthy();
      expect(totalText()).toContain('872,63 €');
    });
    expect((screen.getByRole('radio', { name: 'Ce mois' }) as HTMLInputElement).checked).toBe(true);
    expect((screen.getByLabelText('Du') as HTMLInputElement).value).toBe('2026-11-01');
    expect((screen.getByLabelText('Au') as HTMLInputElement).value).toBe('2026-11-13');
    expect(service.calls).toEqual([{ granularity: 'day', from: '2026-11-01', to: '2026-11-13' }]);
    const bars = screen.getByRole('list', { name: 'Dépenses par jour' });
    expect(within(bars).getAllByRole('listitem')).toHaveLength(13);
    expect(totalText()).toContain('Dépenses 58,60 €');
    expect(totalText()).toContain('Sorties 814,03 €');
  });

  it('le raccourci Aujourd’hui affiche directement le détail du jour, du plus gros au plus petit', async () => {
    const service = startOn('/spending-tracker');
    await waitFor(() => expect(totalText()).toContain('872,63 €'));

    fireEvent.click(screen.getByRole('radio', { name: "Aujourd'hui" }));

    await waitFor(() => expect(totalText()).toContain('16,50 €'));
    expect(service.calls.at(-1)).toEqual({ granularity: 'day', from: '2026-11-13', to: '2026-11-13' });
    const entries = screen.getByRole('list', { name: /^Dépenses : .*13 nov\./ });
    expect(within(entries).getAllByRole('listitem').map((li) => li.getAttribute('aria-label'))).toEqual([
      'Kebab : 12,00 €',
      'Boulangerie : 4,50 €',
    ]);
  });

  it('le raccourci Cette semaine part du lundi', async () => {
    const service = startOn('/spending-tracker');
    await waitFor(() => expect(totalText()).toContain('872,63 €'));

    fireEvent.click(screen.getByRole('radio', { name: 'Cette semaine' }));

    await waitFor(() => expect(totalText()).toContain('173,22 €'));
    expect(service.calls.at(-1)).toEqual({ granularity: 'day', from: '2026-11-09', to: '2026-11-13' });
  });

  it('une plage longue choisie aux date-pickers décoche les raccourcis et regroupe par mois', async () => {
    const service = startOn('/spending-tracker');
    await waitFor(() => expect(totalText()).toContain('872,63 €'));

    fireEvent.change(screen.getByLabelText('Du'), { target: { value: '2026-01-01' } });

    await waitFor(() => expect(totalText()).toContain('1172,63 €'));
    expect(service.calls.at(-1)).toEqual({ granularity: 'month', from: '2026-01-01', to: '2026-11-13' });
    for (const name of ["Aujourd'hui", 'Cette semaine', 'Ce mois']) {
      expect((screen.getByRole('radio', { name }) as HTMLInputElement).checked).toBe(false);
    }
    const bars = screen.getByRole('list', { name: 'Dépenses par mois' });
    expect(within(bars).getAllByRole('listitem')).toHaveLength(11);
    expect(within(bars).getByRole('button', { name: 'septembre 2026 : 300,00 €' })).toBeTruthy();
  });

  it('une plage moyenne est regroupée par semaine', async () => {
    const service = startOn('/spending-tracker');
    await waitFor(() => expect(totalText()).toContain('872,63 €'));

    fireEvent.change(screen.getByLabelText('Du'), { target: { value: '2026-09-01' } });

    await waitFor(() => expect(screen.getByRole('list', { name: 'Dépenses par semaine' })).toBeTruthy());
    expect(service.calls.at(-1)).toEqual({ granularity: 'week', from: '2026-09-01', to: '2026-11-13' });
  });

  it('signale une plage inversée sans recharger', async () => {
    const service = startOn('/spending-tracker');
    await waitFor(() => expect(totalText()).toContain('872,63 €'));

    fireEvent.change(screen.getByLabelText('Du'), { target: { value: '2026-11-20' } });

    expect(screen.getByRole('alert').textContent).toBe('La date de début doit précéder la date de fin.');
    expect(service.calls).toHaveLength(1);
  });

  it('filtre par type sans recharger et empêche de tout décocher', async () => {
    const service = startOn('/spending-tracker');
    await waitFor(() => expect(totalText()).toContain('872,63 €'));

    fireEvent.click(screen.getByRole('checkbox', { name: 'Sorties' }));

    await waitFor(() => expect(totalText()).toContain('58,60 €'));
    expect(totalText()).toContain('Sorties 0,00 €');
    expect((screen.getByRole('checkbox', { name: 'Dépenses' }) as HTMLInputElement).disabled).toBe(true);
    expect(service.calls).toHaveLength(1);

    fireEvent.click(screen.getByRole('checkbox', { name: 'Sorties' }));

    await waitFor(() => expect(totalText()).toContain('872,63 €'));
    expect((screen.getByRole('checkbox', { name: 'Dépenses' }) as HTMLInputElement).disabled).toBe(false);
  });

  it('affiche puis masque le détail d’un jour au clic sur sa barre', async () => {
    startOn('/spending-tracker');
    await waitFor(() => expect(totalText()).toContain('872,63 €'));
    const bar = screen.getByRole('button', { name: /12 nov\. : 156,72 €$/ });

    fireEvent.click(bar);

    const detail = await screen.findByRole('list', { name: /^Dépenses : .*12 nov\./ });
    expect(within(detail).getAllByRole('listitem').map((li) => li.getAttribute('aria-label'))).toEqual([
      'EDF : 114,62 €',
      'Courses : 42,10 €',
    ]);
    expect(within(detail).getByText('Sortie')).toBeTruthy();
    expect(screen.getByRole('button', { name: /12 nov\. : 156,72 €$/ }).getAttribute('aria-pressed')).toBe('true');

    fireEvent.click(screen.getByRole('button', { name: /12 nov\. : 156,72 €$/ }));

    expect(screen.queryByRole('list', { name: /^Dépenses : .*12 nov\./ })).toBeNull();
  });

  it('trace la courbe cumulée entre le résumé et le détail, avec une légende par type', async () => {
    startOn('/spending-tracker');
    await waitFor(() => expect(totalText()).toContain('872,63 €'));

    const chart = screen.getByRole('figure');
    expect(within(chart).getByText('Cumul sur la période')).toBeTruthy();
    expect(within(chart).getByText('Dépenses')).toBeTruthy();
    expect(within(chart).getByText('Sorties')).toBeTruthy();
    expect(screen.getByRole('group', { name: /^Cumul de 872,63 € au .*13 nov\./ })).toBeTruthy();
    const summary = screen.getByRole('status', { name: 'Total de la période' });
    expect(summary.compareDocumentPosition(chart) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
  });

  it('parcourt la courbe au clavier et ouvre le détail de la période avec Entrée', async () => {
    startOn('/spending-tracker');
    await waitFor(() => expect(totalText()).toContain('872,63 €'));
    const plot = screen.getByRole('group', { name: /^Cumul de/ });

    fireEvent.keyDown(plot, { key: 'ArrowLeft' });
    fireEvent.keyDown(plot, { key: 'ArrowLeft' });

    const readout = screen.getByRole('status', { name: 'Valeurs de la période survolée' });
    expect(readout.textContent).toMatch(/12 nov\./);
    expect(readout.textContent).toContain('856,13 € cumulés');
    expect(readout.textContent).toContain('156,72 € ce jour');

    fireEvent.keyDown(plot, { key: 'Enter' });

    const detail = await screen.findByRole('list', { name: /^Dépenses : .*12 nov\./ });
    expect(within(detail).getAllByRole('listitem')).toHaveLength(2);
  });

  it('suit le filtre par type : une seule série, sans légende', async () => {
    startOn('/spending-tracker');
    await waitFor(() => expect(totalText()).toContain('872,63 €'));

    fireEvent.click(screen.getByRole('checkbox', { name: 'Sorties' }));

    await waitFor(() => expect(screen.getByRole('group', { name: /^Cumul de 58,60 €/ })).toBeTruthy());
    const chart = screen.getByRole('figure');
    expect(within(chart).queryByText('Sorties')).toBeNull();
    expect(within(chart).queryByText('Dépenses')).toBeNull();
  });

  it('trace la journée heure par heure jusqu’à l’heure actuelle', async () => {
    startOn('/spending-tracker');
    await waitFor(() => expect(totalText()).toContain('872,63 €'));

    fireEvent.click(screen.getByRole('radio', { name: "Aujourd'hui" }));

    await waitFor(() => expect(totalText()).toContain('16,50 €'));
    const plot = screen.getByRole('group', { name: /^Cumul de 16,50 € à 18 h\./ });
    expect(plot.getAttribute('aria-label')).not.toContain('Entrée');
    const bars = screen.getByRole('list', { name: 'Dépenses par jour' });
    expect(within(bars).getAllByRole('listitem')).toHaveLength(1);

    // La boulangerie est à 07:30 UTC, heure locale selon le fuseau de la machine.
    const hour = new Date('2026-11-13T07:30:00.000Z').getHours();
    // Le premier appui se place sur 18 h, chaque suivant recule d'une heure.
    for (let i = 0; i <= 18 - hour; i++) fireEvent.keyDown(plot, { key: 'ArrowLeft' });

    const readout = screen.getByRole('status', { name: 'Valeurs de la période survolée' });
    expect(readout.textContent).toContain(`${hour} h – ${hour + 1} h`);
    expect(readout.textContent).toContain('4,50 € cumulés');
    expect(readout.textContent).toContain('4,50 € cette heure-là');
  });

  it('indique une période sans dépense et explique comment le suivi se remplit', async () => {
    startOn('/spending-tracker', createSpendingTrackerServiceFromInMemory({ spendings: [] }));

    expect(await screen.findByText('Aucune dépense sur cette période.')).toBeTruthy();
    expect(screen.getByText(/apparaissent ici au fil de l’eau/)).toBeTruthy();
    expect(screen.queryByRole('list', { name: 'Dépenses par jour' })).toBeNull();
    const results = screen.getByRole('region', { name: 'Résultats du suivi des dépenses' });
    expect(within(results).queryByRole('alert')).toBeNull();
  });

  it('affiche un message clair quand le chargement échoue, puis réessaie', async () => {
    const working = createSpendingTrackerServiceFromInMemory({ spendings: SPENDINGS });
    let failures = 1;
    const flaky = {
      async get(input: Parameters<typeof working.get>[0]) {
        if (failures-- > 0) throw new Error('Erreur réseau');
        return working.get(input);
      },
    };
    startOn('/spending-tracker', flaky as typeof working);

    const results = await screen.findByRole('region', { name: 'Résultats du suivi des dépenses' });
    const alert = await within(results).findByRole('alert');
    expect(alert.textContent).toContain('Impossible d’afficher ton suivi pour le moment');
    expect(alert.textContent).not.toContain('Erreur réseau');
    expect(screen.queryByRole('status', { name: 'Total de la période' })).toBeNull();

    fireEvent.click(within(alert).getByRole('button', { name: 'Réessayer' }));

    await waitFor(() => expect(totalText()).toContain('872,63 €'));
    expect(within(results).queryByRole('alert')).toBeNull();
    expect(working.calls).toEqual([{ granularity: 'day', from: '2026-11-01', to: '2026-11-13' }]);
  });
});
