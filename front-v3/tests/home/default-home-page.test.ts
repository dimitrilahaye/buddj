import { describe, it, expect } from 'vitest';
import { screen } from '@testing-library/dom';
import { createAuthServiceFromInMemory } from '../../src/adapters/auth-service-from-in-memory.js';
import '../../src/register-components.js';
import { bootstrap } from '../../src/bootstrap.js';

describe('app bootstrap', () => {
  it('affiche la page Home avec le titre "Welcome on Buddj!" quand on visite /', async () => {
    document.body.innerHTML = '<main id="screen-outlet" role="main"></main>';
    window.history.replaceState(null, '', '/');

    bootstrap({ authService: createAuthServiceFromInMemory(false) });

    expect(screen.getByRole('heading', { level: 1, name: 'Welcome on Buddj!' })).exist;
  });
});
