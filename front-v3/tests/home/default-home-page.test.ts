import { describe, it, expect } from 'vitest';
import { screen } from '@testing-library/dom';

describe('app bootstrap', () => {
  it('affiche la page Home avec le titre "Welcome on Buddj!" quand on visite /', async () => {
    document.body.innerHTML = '<main id="screen-outlet" role="main"></main>';
    window.history.replaceState(null, '', '/');

    await import('../../src/main.js');

    expect(screen.getByRole('heading', { level: 1, name: 'Welcome on Buddj!' })).exist;
  });
});
