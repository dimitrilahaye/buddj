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

function openChart(): void {
  fireEvent.click(screen.getByRole('button', { name: 'Graphiques' }));
}

/** Page de la feuille des graphiques consacrée à un encart. */
function chartsPage(panel: 'total' | 'categories' = 'total'): HTMLElement {
  return document.querySelector(`.spending-charts-sheet .swipe-sheet-page[data-page="${panel}"]`) as HTMLElement;
}

/** Courbe cumulée d'une page de la feuille des graphiques. */
function curveChart(panel: 'total' | 'categories' = 'total'): HTMLElement {
  return chartsPage(panel).querySelector('buddj-spending-tracker-chart figure') as HTMLElement;
}

/** Répartition en anneau d'une page de la feuille des graphiques. */
function pieChart(panel: 'total' | 'categories' = 'total'): HTMLElement {
  return chartsPage(panel).querySelector('buddj-spending-tracker-pie figure') as HTMLElement;
}

/** Feuille des graphiques ouverte, quelle que soit la page affichée. */
function openChartSheet(): HTMLElement | null {
  return screen.queryByRole('dialog', { name: /^Graphiques / });
}

function openRangePicker(): HTMLElement {
  fireEvent.click(screen.getByRole('button', { name: /^Dates : / }));
  return screen.getByRole('dialog', { name: 'Choisir une période' });
}

function pickDay(picker: HTMLElement, name: string): void {
  fireEvent.click(within(picker).getByRole('button', { name }));
}

function goBackMonths(picker: HTMLElement, count: number): void {
  for (let i = 0; i < count; i++) fireEvent.click(within(picker).getByRole('button', { name: 'Mois précédent' }));
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
    expect(screen.getByRole('button', { name: 'Dates : du 1 nov. au 13 nov.' })).toBeTruthy();
    expect(service.calls).toEqual([{ granularity: 'day', from: '2026-11-01', to: '2026-11-13' }]);
    const bars = screen.getByRole('list', { name: 'Dépenses par jour' });
    const [periodRow, ...dayRows] = within(bars).getAllByRole('listitem');
    expect(periodRow!.getAttribute('aria-label')).toBe('Toute la période, novembre 2026 : 872,63 €');
    expect(dayRows).toHaveLength(13);
    expect(totalText()).toContain('Dépenses 58,60 €');
    expect(totalText()).toContain('Sorties 814,03 €');
  });

  it('le raccourci Aujourd’hui affiche directement le détail du jour, du plus ancien au plus récent', async () => {
    const service = startOn('/spending-tracker');
    await waitFor(() => expect(totalText()).toContain('872,63 €'));

    fireEvent.click(screen.getByRole('radio', { name: "Aujourd'hui" }));

    await waitFor(() => expect(totalText()).toContain('16,50 €'));
    expect(service.calls.at(-1)).toEqual({ granularity: 'day', from: '2026-11-13', to: '2026-11-13' });
    const entries = screen.getByRole('list', { name: /^Dépenses : .*13 nov\./ });
    expect(within(entries).getAllByRole('listitem').map((li) => li.getAttribute('aria-label'))).toEqual([
      'Boulangerie : 4,50 €',
      'Kebab : 12,00 €',
    ]);
  });

  it('le raccourci Cette semaine part du lundi', async () => {
    const service = startOn('/spending-tracker');
    await waitFor(() => expect(totalText()).toContain('872,63 €'));

    fireEvent.click(screen.getByRole('radio', { name: 'Cette semaine' }));

    await waitFor(() => expect(totalText()).toContain('173,22 €'));
    expect(service.calls.at(-1)).toEqual({ granularity: 'day', from: '2026-11-09', to: '2026-11-13' });
    expect(screen.getByRole('listitem', { name: 'Toute la période, semaine du 9 nov. : 173,22 €' })).toBeTruthy();
  });

  it('chaque récap s’ouvre sous la ligne cliquée, y compris celui de toute la période, en un bloc chronologique par jour', async () => {
    startOn('/spending-tracker');
    await waitFor(() => expect(totalText()).toContain('872,63 €'));

    fireEvent.click(screen.getByRole('radio', { name: 'Cette semaine' }));
    await waitFor(() => expect(totalText()).toContain('173,22 €'));

    const periodName = 'Toute la période, semaine du 9 nov. : 173,22 €';
    fireEvent.click(screen.getByRole('button', { name: periodName }));

    expect(screen.getByRole('button', { name: periodName }).getAttribute('aria-pressed')).toBe('true');
    const periodRow = screen.getByRole('listitem', { name: periodName });
    expect(within(periodRow).getAllByRole('heading', { level: 3 }).map((h) => h.textContent)).toEqual([
      'jeudi 12 nov.',
      'vendredi 13 nov.',
    ]);
    const entriesOf = (day: string): Array<string | null> =>
      within(within(periodRow).getByRole('list', { name: `Dépenses : ${day}` }))
        .getAllByRole('listitem')
        .map((li) => li.getAttribute('aria-label'));
    expect(entriesOf('jeudi 12 nov.')).toEqual(['EDF : 114,62 €', 'Courses : 42,10 €']);
    expect(entriesOf('vendredi 13 nov.')).toEqual(['Boulangerie : 4,50 €', 'Kebab : 12,00 €']);
    expect(within(periodRow).getByLabelText('Total du jeudi 12 nov. : 156,72 €')).toBeTruthy();
    expect(within(periodRow).getByLabelText('Total du vendredi 13 nov. : 16,50 €')).toBeTruthy();

    const dayName = /12 nov\.? : 156,72 €$/;
    fireEvent.click(screen.getByRole('button', { name: dayName }));
    const dayRow = screen.getByRole('button', { name: dayName }).closest('li') as HTMLElement;
    expect(within(dayRow).getByRole('list', { name: /^Dépenses : .*12 nov\./ })).toBeTruthy();
    expect(within(dayRow).getByRole('heading', { level: 3 }).textContent).toBe('jeudi 12 nov.');
    expect(within(dayRow).getByLabelText('Total du jeudi 12 nov. : 156,72 €')).toBeTruthy();
    expect(screen.getAllByRole('list', { name: /^Dépenses : / })).toHaveLength(1);

    fireEvent.click(screen.getByRole('button', { name: dayName }));
    expect(screen.queryByRole('list', { name: /^Dépenses : / })).toBeNull();
  });

  it('une plage longue choisie au calendrier décoche les raccourcis et regroupe par mois', async () => {
    const service = startOn('/spending-tracker');
    await waitFor(() => expect(totalText()).toContain('872,63 €'));

    const picker = openRangePicker();
    goBackMonths(picker, 10);
    expect(within(picker).getByRole('heading', { name: 'janvier 2026' })).toBeTruthy();
    pickDay(picker, 'jeudi 1 janvier 2026');
    for (let i = 0; i < 10; i++) fireEvent.click(within(picker).getByRole('button', { name: 'Mois suivant' }));
    pickDay(picker, 'vendredi 13 novembre 2026');
    fireEvent.click(within(picker).getByRole('button', { name: 'Valider' }));

    await waitFor(() => expect(totalText()).toContain('1172,63 €'));
    expect(service.calls.at(-1)).toEqual({ granularity: 'month', from: '2026-01-01', to: '2026-11-13' });
    for (const name of ["Aujourd'hui", 'Cette semaine', 'Ce mois']) {
      expect((screen.getByRole('radio', { name }) as HTMLInputElement).checked).toBe(false);
    }
    const bars = screen.getByRole('list', { name: 'Dépenses par mois' });
    const [periodRow, ...monthRows] = within(bars).getAllByRole('listitem');
    expect(periodRow!.getAttribute('aria-label')).toBe('Toute la période, du 1 janv. au 13 nov. : 1172,63 €');
    expect(monthRows).toHaveLength(11);
    expect(within(bars).getByRole('button', { name: 'septembre 2026 : 300,00 €' })).toBeTruthy();
    expect(screen.queryByRole('dialog', { name: 'Choisir une période' })).toBeNull();
    expect(screen.getByRole('button', { name: 'Dates : du 1 janv. au 13 nov.' })).toBeTruthy();
  });

  it('une plage moyenne est regroupée par semaine', async () => {
    const service = startOn('/spending-tracker');
    await waitFor(() => expect(totalText()).toContain('872,63 €'));

    const picker = openRangePicker();
    goBackMonths(picker, 2);
    pickDay(picker, 'mardi 1 septembre 2026');
    fireEvent.click(within(picker).getByRole('button', { name: 'Mois suivant' }));
    fireEvent.click(within(picker).getByRole('button', { name: 'Mois suivant' }));
    pickDay(picker, 'vendredi 13 novembre 2026');
    fireEvent.click(within(picker).getByRole('button', { name: 'Valider' }));

    await waitFor(() => expect(screen.getByRole('list', { name: 'Dépenses par semaine' })).toBeTruthy());
    expect(service.calls.at(-1)).toEqual({ granularity: 'week', from: '2026-09-01', to: '2026-11-13' });
  });

  it('valider sans date de fin affiche ce seul jour', async () => {
    const service = startOn('/spending-tracker');
    await waitFor(() => expect(totalText()).toContain('872,63 €'));

    const picker = openRangePicker();
    pickDay(picker, 'jeudi 12 novembre 2026');
    expect(within(picker).getByRole('status').textContent).toContain('valide pour ce seul jour');
    fireEvent.click(within(picker).getByRole('button', { name: 'Valider' }));

    await waitFor(() => expect(totalText()).toContain('156,72 €'));
    expect(service.calls.at(-1)).toEqual({ granularity: 'day', from: '2026-11-12', to: '2026-11-12' });
    expect(screen.getByRole('button', { name: 'Dates : jeu. 12 nov.' })).toBeTruthy();
    const entries = screen.getByRole('list', { name: /^Dépenses : .*12 nov\./ });
    expect(within(entries).getAllByRole('listitem')).toHaveLength(2);
  });

  it('un jour antérieur au début choisi devient le nouveau début', async () => {
    const service = startOn('/spending-tracker');
    await waitFor(() => expect(totalText()).toContain('872,63 €'));

    const picker = openRangePicker();
    pickDay(picker, 'jeudi 12 novembre 2026');
    pickDay(picker, 'lundi 9 novembre 2026');
    pickDay(picker, 'mercredi 11 novembre 2026');
    fireEvent.click(within(picker).getByRole('button', { name: 'Valider' }));

    await waitFor(() => expect(service.calls).toHaveLength(2));
    expect(service.calls.at(-1)).toEqual({ granularity: 'day', from: '2026-11-09', to: '2026-11-11' });
  });

  it('s’ouvre sur la période en cours, aujourd’hui mis en évidence', async () => {
    startOn('/spending-tracker');
    await waitFor(() => expect(totalText()).toContain('872,63 €'));

    const picker = openRangePicker();

    expect(within(picker).getByRole('heading', { name: 'novembre 2026' })).toBeTruthy();
    const pressed = within(picker)
      .getAllByRole('button', { pressed: true })
      .map((b) => b.getAttribute('aria-label'));
    expect(pressed).toEqual(['dimanche 1 novembre 2026', 'vendredi 13 novembre 2026']);
    expect(within(picker).getByRole('button', { name: 'vendredi 13 novembre 2026' }).getAttribute('aria-current')).toBe('date');
  });

  it('permet de choisir une période dans le futur', async () => {
    const service = startOn('/spending-tracker');
    await waitFor(() => expect(totalText()).toContain('872,63 €'));

    const picker = openRangePicker();
    pickDay(picker, 'vendredi 13 novembre 2026');
    fireEvent.click(within(picker).getByRole('button', { name: 'Mois suivant' }));
    expect(within(picker).getByRole('heading', { name: 'décembre 2026' })).toBeTruthy();
    pickDay(picker, 'jeudi 31 décembre 2026');
    fireEvent.click(within(picker).getByRole('button', { name: 'Valider' }));

    await waitFor(() => expect(service.calls).toHaveLength(2));
    expect(service.calls.at(-1)).toEqual({ granularity: 'week', from: '2026-11-13', to: '2026-12-31' });
    expect(screen.getByRole('button', { name: 'Dates : du 13 nov. au 31 déc.' })).toBeTruthy();
  });

  it('annuler ferme le calendrier sans recharger', async () => {
    const service = startOn('/spending-tracker');
    await waitFor(() => expect(totalText()).toContain('872,63 €'));

    const picker = openRangePicker();
    pickDay(picker, 'jeudi 12 novembre 2026');
    fireEvent.click(within(picker).getByRole('button', { name: 'Annuler' }));

    expect(screen.queryByRole('dialog', { name: 'Choisir une période' })).toBeNull();
    expect(service.calls).toHaveLength(1);
    expect((screen.getByRole('radio', { name: 'Ce mois' }) as HTMLInputElement).checked).toBe(true);
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

  it('ouvre les graphiques en grand via l’icône du tableau de bord, la courbe au-dessus de la répartition', async () => {
    startOn('/spending-tracker');
    await waitFor(() => expect(totalText()).toContain('872,63 €'));

    const dashboard = screen.getByRole('region', { name: 'Tableau de bord' });
    const toggle = (): HTMLElement => within(dashboard).getByRole('button', { name: 'Graphiques' });
    expect(toggle().getAttribute('aria-expanded')).toBe('false');
    expect(openChartSheet()).toBeNull();

    openChart();
    const sheet = screen.getByRole('dialog', { name: 'Graphiques du total' });
    expect(toggle().getAttribute('aria-expanded')).toBe('true');
    expect(within(curveChart()).getByText('Cumul sur la période')).toBeTruthy();
    expect(within(pieChart()).getByText('Répartition dépenses / sorties')).toBeTruthy();
    expect(curveChart().compareDocumentPosition(pieChart()) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();

    fireEvent.click(within(sheet).getByRole('button', { name: 'Fermer' }));
    expect(openChartSheet()).toBeNull();
    expect(toggle().getAttribute('aria-expanded')).toBe('false');
    expect(document.activeElement).toBe(toggle());
  });

  it('trace la courbe cumulée avec une légende par type', async () => {
    startOn('/spending-tracker');
    await waitFor(() => expect(totalText()).toContain('872,63 €'));
    openChart();

    const chart = curveChart();
    expect(within(chart).getByText('Cumul sur la période')).toBeTruthy();
    expect(within(chart).getByText('Dépenses')).toBeTruthy();
    expect(within(chart).getByText('Sorties')).toBeTruthy();
    expect(within(chartsPage()).getByRole('group', { name: /^Cumul de 872,63 € au .*13 nov\./ })).toBeTruthy();
  });

  it('parcourt la courbe au clavier, et un clic y pose le réticule sans fermer la feuille', async () => {
    startOn('/spending-tracker');
    await waitFor(() => expect(totalText()).toContain('872,63 €'));
    openChart();
    const plot = within(chartsPage()).getByRole('group', { name: /^Cumul de/ });
    expect(plot.getAttribute('aria-label')).not.toContain('Entrée');

    fireEvent.keyDown(plot, { key: 'ArrowLeft' });
    fireEvent.keyDown(plot, { key: 'ArrowLeft' });

    const readout = screen.getByRole('status', { name: 'Valeurs de la période survolée' });
    expect(readout.textContent).toMatch(/12 nov\./);
    expect(readout.textContent).toContain('856,13 € cumulés');
    expect(readout.textContent).toContain('156,72 € ce jour');

    fireEvent.keyDown(plot, { key: 'Enter' });
    fireEvent.click(plot, { clientX: 10 });

    expect(openChartSheet()).toBeTruthy();
    expect(screen.getByRole('status', { name: 'Valeurs de la période survolée' }).textContent).toContain('cumulés');
    expect(screen.queryByRole('list', { name: /^Dépenses : / })).toBeNull();
  });

  it('masque ou réaffiche une courbe via sa légende, sans jamais tout masquer', async () => {
    startOn('/spending-tracker');
    await waitFor(() => expect(totalText()).toContain('872,63 €'));
    openChart();
    const legend = (name: string): HTMLElement => within(curveChart()).getByRole('button', { name: `Courbe ${name}` });
    expect(legend('Sorties').getAttribute('aria-pressed')).toBe('true');

    fireEvent.click(legend('Sorties'));

    expect(legend('Sorties').getAttribute('aria-pressed')).toBe('false');
    expect(within(chartsPage()).getByRole('group', { name: /^Cumul de 58,60 €/ })).toBeTruthy();
    expect((legend('Dépenses') as HTMLButtonElement).disabled).toBe(true);

    fireEvent.click(legend('Sorties'));

    expect(legend('Sorties').getAttribute('aria-pressed')).toBe('true');
    expect((legend('Dépenses') as HTMLButtonElement).disabled).toBe(false);
    expect(within(chartsPage()).getByRole('group', { name: /^Cumul de 872,63 €/ })).toBeTruthy();
  });

  it('suit le filtre par type : une seule série, sans légende', async () => {
    startOn('/spending-tracker');
    await waitFor(() => expect(totalText()).toContain('872,63 €'));
    openChart();

    fireEvent.click(screen.getByRole('checkbox', { name: 'Sorties' }));

    await waitFor(() => expect(within(chartsPage()).getByRole('group', { name: /^Cumul de 58,60 €/ })).toBeTruthy());
    const chart = curveChart();
    expect(within(chart).queryByText('Sorties')).toBeNull();
    expect(within(chart).queryByText('Dépenses')).toBeNull();
  });

  it('trace la journée heure par heure jusqu’à l’heure actuelle, sans ligne de synthèse', async () => {
    startOn('/spending-tracker');
    await waitFor(() => expect(totalText()).toContain('872,63 €'));

    fireEvent.click(screen.getByRole('radio', { name: "Aujourd'hui" }));

    await waitFor(() => expect(totalText()).toContain('16,50 €'));
    openChart();
    const plot = within(chartsPage()).getByRole('group', { name: /^Cumul de 16,50 € à 18 h\./ });
    expect(plot.getAttribute('aria-label')).not.toContain('Entrée');
    const bars = screen.getByRole('list', { name: 'Dépenses par jour' });
    // Une seule ligne (sans synthèse), le récap du jour s'ouvre dedans.
    expect(bars.children).toHaveLength(1);

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
  describe('tableau de bord', () => {
    const CATEGORIZED: InMemoryTrackedSpending[] = [
      { id: 'loyer', kind: 'outflow', label: '🏠 Loyer', amount: 700, day: '2026-11-02', occurredAt: '2026-11-02T08:00:00.000Z' },
      { id: 'edf', kind: 'outflow', label: '⚡ EDF', amount: 100, day: '2026-11-12', occurredAt: '2026-11-12T08:00:00.000Z' },
      { id: 'pizza', kind: 'expense', label: '🍕 Pizza', amount: 20, day: '2026-11-12', occurredAt: '2026-11-12T19:00:00.000Z' },
      { id: 'primeur', kind: 'expense', label: '🍎 Primeur', amount: 6, day: '2026-11-13', occurredAt: '2026-11-13T09:00:00.000Z' },
      { id: 'tabac', kind: 'expense', label: '🚬 Tabac', amount: 13, day: '2026-11-13', occurredAt: '2026-11-13T10:00:00.000Z' },
    ];

    function dashboard(): HTMLElement {
      return screen.getByRole('region', { name: 'Tableau de bord' });
    }

    async function startCategorized(): Promise<void> {
      startOn('/spending-tracker', createSpendingTrackerServiceFromInMemory({ spendings: CATEGORIZED }));
      await waitFor(() => expect(totalText()).toContain('839,00 €'));
    }

    it('s’affiche par défaut avec le total et ses moyennes par jour, par semaine et par mois', async () => {
      startOn('/spending-tracker');
      await waitFor(() => expect(totalText()).toContain('872,63 €'));

      const tabs = within(dashboard()).getAllByRole('tab');
      expect(tabs.map((t) => [t.textContent?.trim(), t.getAttribute('aria-selected')])).toEqual([
        ['Total', 'true'],
        ['Par catégorie', 'false'],
      ]);
      const averages = within(dashboard()).getByRole('list', { name: 'Moyennes' });
      expect(within(averages).getAllByRole('listitem').map((li) => li.getAttribute('aria-label'))).toEqual([
        'Moyenne par jour : 67,13 €',
        'Moyenne par semaine : 469,88 €',
        'Moyenne par mois : 2043,13 €',
      ]);
    });

    it('n’affiche pas de moyenne sur une seule journée', async () => {
      startOn('/spending-tracker');
      await waitFor(() => expect(totalText()).toContain('872,63 €'));

      fireEvent.click(screen.getByRole('radio', { name: "Aujourd'hui" }));

      await waitFor(() => expect(totalText()).toContain('16,50 €'));
      expect(within(dashboard()).queryByRole('list', { name: 'Moyennes' })).toBeNull();
    });

    it('liste les catégories de la plus coûteuse à la moins coûteuse, avec leur moyenne', async () => {
      await startCategorized();

      fireEvent.click(within(dashboard()).getByRole('tab', { name: 'Par catégorie' }));

      expect(within(dashboard()).getByRole('tab', { name: 'Par catégorie' }).getAttribute('aria-selected')).toBe('true');
      const list = within(dashboard()).getByRole('list', { name: 'Dépenses par catégorie' });
      const rows = within(list).getAllByRole('listitem');
      expect(rows.map((li) => li.getAttribute('aria-label'))).toEqual([
        'Logement : 700,00 €',
        'Énergie : 100,00 €',
        'Alimentation : 26,00 €',
        'Divers : 13,00 €',
      ]);
      expect(rows[2]!.textContent).toContain('2,00 € / jour');
    });

    it('ouvre l’encart Total en grand avec les moyennes des dépenses et des sorties', async () => {
      await startCategorized();

      fireEvent.click(within(dashboard()).getByRole('button', { name: 'Ouvrir en grand : Total' }));

      const sheet = screen.getByRole('dialog', { name: 'Total' });
      const page = sheet.querySelector('.swipe-sheet-page[data-page="total"]') as HTMLElement;
      const rows = within(page)
        .getAllByRole('row')
        .map((row) => within(row).queryAllByRole('cell').map((c) => c.textContent));
      expect(rows).toContainEqual(['839,00 €', '39,00 €', '800,00 €']);
      expect(rows).toContainEqual(['64,54 €', '3,00 €', '61,54 €']);
      expect(within(page).getByRole('rowheader', { name: 'par semaine' })).toBeTruthy();
      expect(within(page).getByRole('rowheader', { name: 'Moyennes' })).toBeTruthy();
      expect(within(page).getByText('Moyennes sur 13 jours écoulés.')).toBeTruthy();

      fireEvent.click(within(sheet).getByRole('button', { name: 'Fermer' }));
      expect(screen.queryByRole('dialog', { name: 'Total' })).toBeNull();
    });

    it('ouvre l’encart Par catégorie en grand avec un tableau par catégorie, parts et moyennes repliées, et se ferme avec Échap', async () => {
      await startCategorized();

      fireEvent.click(within(dashboard()).getByRole('button', { name: 'Ouvrir en grand : Par catégorie' }));

      const sheet = screen.getByRole('dialog', { name: 'Par catégorie' });
      const tables = sheet.querySelectorAll('.swipe-sheet-page[data-page="categories"] table');
      expect([...tables].map((t) => t.querySelector('caption')?.textContent?.trim())).toEqual([
        'Logement',
        'Énergie',
        'Alimentation',
        'Divers',
      ]);
      const food = within(sheet).getByRole('table', { name: 'Alimentation' });
      expect((food.querySelector('.spending-dashboard-category-fill') as HTMLElement).style.width).toBe('3.10%');
      const rows = (): Array<Array<string | null | undefined>> =>
        within(food)
          .getAllByRole('row')
          .slice(1)
          .map((row) => [within(row).queryByRole('rowheader')?.textContent ?? null, ...within(row).queryAllByRole('cell').map((c) => c.textContent?.replace(/\s+/g, ' ').trim())]);
      // Le bouton suit la ligne de la période, au-dessus du bloc qu'il déplie, ouvert ou non.
      expect(rows()).toEqual([
        ['Sur la période', '26,00 €', '26,00 €', '0,00 €'],
        [null, 'Parts et moyennes'],
      ]);

      const toggle = within(food).getByRole('button', { name: 'Parts et moyennes : Alimentation' });
      expect(toggle.getAttribute('aria-expanded')).toBe('false');
      fireEvent.click(toggle);
      expect(toggle.getAttribute('aria-expanded')).toBe('true');

      expect(rows()).toEqual([
        ['Sur la période', '26,00 €', '26,00 €', '0,00 €'],
        [null, 'Parts et moyennes'],
        ['Parts'],
        ['sur toute la période', '3,1 %', '3,1 %', '0 %'],
        ['sur l’ensemble des catégories', '3,1 %', '66,7 %', '0 %'],
        ['Moyennes'],
        ['par jour', '2,00 €', '2,00 €', '0,00 €'],
        ['par semaine', '14,00 €', '14,00 €', '0,00 €'],
        ['par mois', '60,88 €', '60,88 €', '0,00 €'],
      ]);
      // Les autres catégories restent repliées.
      expect(within(sheet).getByRole('button', { name: 'Parts et moyennes : Logement' }).getAttribute('aria-expanded')).toBe('false');
      expect(within(dashboard()).getByRole('tab', { name: 'Par catégorie' }).getAttribute('aria-selected')).toBe('true');

      fireEvent.keyDown(sheet, { key: 'Escape' });
      expect(screen.queryByRole('dialog', { name: 'Par catégorie' })).toBeNull();
    });

    it('signale par des points qu’on passe d’un encart à l’autre, y compris ouvert en grand', async () => {
      await startCategorized();
      const activeDots = (root: Element): string[] =>
        [...root.querySelectorAll<HTMLElement>('.pager-dot--active')].map((d) => d.dataset.dot!);

      expect(dashboard().querySelectorAll('.pager-dot')).toHaveLength(2);
      expect(activeDots(dashboard())).toEqual(['total']);
      fireEvent.click(dashboard().querySelector('.pager-dot[data-dot="categories"]')!);
      expect(within(dashboard()).getByRole('tab', { name: 'Par catégorie' }).getAttribute('aria-selected')).toBe('true');
      expect(activeDots(dashboard())).toEqual(['categories']);

      fireEvent.click(within(dashboard()).getByRole('button', { name: 'Ouvrir en grand : Total' }));
      const sheet = screen.getByRole('dialog', { name: 'Total' });
      expect(sheet.querySelectorAll('.pager-dots')).toHaveLength(2);
      expect(activeDots(sheet)).toEqual(['total', 'total']);

      fireEvent.click(sheet.querySelector('.swipe-sheet-dots--bottom .pager-dot[data-dot="categories"]')!);
      expect(screen.getByRole('dialog', { name: 'Par catégorie' })).toBe(sheet);
      expect(activeDots(sheet)).toEqual(['categories', 'categories']);
      expect(within(dashboard()).getByRole('tab', { name: 'Par catégorie' }).getAttribute('aria-selected')).toBe('true');

      fireEvent.keyDown(within(sheet).getByRole('button', { name: 'Fermer' }), { key: 'ArrowLeft' });
      expect(screen.getByRole('dialog', { name: 'Total' })).toBe(sheet);
      expect(within(dashboard()).getByRole('tab', { name: 'Total' }).getAttribute('aria-selected')).toBe('true');
    });

    it('présente les graphiques du total par type et ceux par catégorie, et passe des uns aux autres avec l’encart observé', async () => {
      await startCategorized();
      openChart();
      const sheet = screen.getByRole('dialog', { name: 'Graphiques du total' });
      const parts = (panel: 'total' | 'categories'): Array<string | null> =>
        within(within(pieChart(panel)).getByRole('list', { name: 'Parts' }))
          .getAllByRole('listitem')
          .map((li) => li.getAttribute('aria-label')?.replace(/\s/g, ' ') ?? null);

      expect(within(curveChart('total')).getByText('Cumul sur la période')).toBeTruthy();
      expect(within(curveChart('total')).getByText('Sorties')).toBeTruthy();
      expect(parts('total')).toEqual(['Sorties : 800,00 €, 95,4 %', 'Dépenses : 39,00 €, 4,6 %']);

      expect(within(curveChart('categories')).getByText('Cumul par catégorie')).toBeTruthy();
      const legend = curveChart('categories').querySelector('.spending-chart-legend') as HTMLElement;
      expect([...legend.children].map((item) => item.textContent)).toEqual([
        'Divers',
        'Alimentation',
        'Énergie',
        'Logement',
      ]);
      expect(within(chartsPage('categories')).getByRole('group', { name: /^Cumul de 839,00 €/ })).toBeTruthy();
      expect(within(pieChart('categories')).getByText('Répartition par catégorie')).toBeTruthy();
      expect(parts('categories')).toEqual([
        'Logement : 700,00 €, 83,4 %',
        'Énergie : 100,00 €, 11,9 %',
        'Alimentation : 26,00 €, 3,1 %',
        'Divers : 13,00 €, 1,5 %',
      ]);

      const activeDots = (): string[] =>
        [...sheet.querySelectorAll<HTMLElement>('.pager-dot--active')].map((d) => d.dataset.dot!);
      expect(activeDots()).toEqual(['total', 'total']);
      fireEvent.click(sheet.querySelector('.swipe-sheet-dots--bottom .pager-dot[data-dot="categories"]')!);
      expect(screen.getByRole('dialog', { name: 'Graphiques par catégorie' })).toBe(sheet);
      expect(activeDots()).toEqual(['categories', 'categories']);
      expect(within(dashboard()).getByRole('tab', { name: 'Par catégorie' }).getAttribute('aria-selected')).toBe('true');

      fireEvent.keyDown(within(sheet).getByRole('button', { name: 'Fermer' }), { key: 'ArrowLeft' });
      expect(screen.getByRole('dialog', { name: 'Graphiques du total' })).toBe(sheet);
      expect(within(dashboard()).getByRole('tab', { name: 'Total' }).getAttribute('aria-selected')).toBe('true');

      fireEvent.keyDown(sheet, { key: 'Escape' });
      expect(openChartSheet()).toBeNull();
    });

    it('ouvre les graphiques sur l’encart observé, et l’anneau donne au centre la part ciblée', async () => {
      await startCategorized();
      fireEvent.click(within(dashboard()).getByRole('tab', { name: 'Par catégorie' }));

      openChart();

      expect(screen.getByRole('dialog', { name: 'Graphiques par catégorie' })).toBeTruthy();
      const center = pieChart('categories').querySelector('.spending-pie-center') as HTMLElement;
      expect(center.textContent).toContain('839,00 €');
      fireEvent.focusIn(within(pieChart('categories')).getAllByRole('listitem')[1]!);
      expect(center.textContent?.replace(/\s+/g, ' ').trim()).toBe('100,00 € Énergie · 11,9 %');
    });
  });
});
