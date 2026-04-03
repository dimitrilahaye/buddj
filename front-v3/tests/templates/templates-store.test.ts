import { describe, it, expect } from 'vitest';
import { createTemplateServiceFromInMemory } from '../../src/adapters/template-service-from-in-memory.js';
import { createLoadTemplates } from '../../src/application/template/load-templates.js';
import { createUpdateTemplate } from '../../src/application/template/update-template.js';
import { createAddTemplateOutflow } from '../../src/application/template/add-template-outflow.js';
import { createDeleteTemplateOutflow } from '../../src/application/template/delete-template-outflow.js';
import { createAddTemplateBudget } from '../../src/application/template/add-template-budget.js';
import { createDeleteTemplateBudget } from '../../src/application/template/delete-template-budget.js';
import { TemplatesStore } from '../../src/application/template/templates-store.js';
import type { TemplateView } from '../../src/application/template/template-view.js';

const T1 = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa';
const O1 = 'cccccccc-cccc-cccc-cccc-cccccccccccc';
const B1 = 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb';

function baseTemplate(overrides: Partial<TemplateView> = {}): TemplateView {
  return {
    id: T1,
    name: 'Modèle A',
    isDefault: false,
    month: '2026-01-01T00:00:00.000Z',
    startingBalance: 0,
    outflows: [{ id: O1, label: 'Loyer', amount: 100, isChecked: false, pendingFrom: null }],
    budgets: [{ id: B1, name: 'Courses', initialBalance: 50, pendingFrom: null }],
    ...overrides,
  };
}

function createStore(initial: TemplateView[]) {
  const templateService = createTemplateServiceFromInMemory({ templates: initial, delayMs: 0 });
  return new TemplatesStore({
    loadTemplates: createLoadTemplates({ templateService }),
    updateTemplate: createUpdateTemplate({ templateService }),
    addTemplateOutflow: createAddTemplateOutflow({ templateService }),
    deleteTemplateOutflow: createDeleteTemplateOutflow({ templateService }),
    addTemplateBudget: createAddTemplateBudget({ templateService }),
    deleteTemplateBudget: createDeleteTemplateBudget({ templateService }),
  });
}

function waitStoreEvent(store: TemplatesStore, name: string): Promise<void> {
  return new Promise((resolve) => {
    store.addEventListener(name, () => resolve(), { once: true });
  });
}

describe('TemplatesStore + TemplateService in-memory', () => {
  it('charge la liste via loadTemplates', async () => {
    const store = createStore([baseTemplate()]);
    const loaded = waitStoreEvent(store, 'templatesLoaded');
    store.emitAction('loadTemplates');
    await loaded;
    expect(store.getState().templates).toHaveLength(1);
    expect(store.getState().templates[0]?.name).toBe('Modèle A');
    expect(store.getTemplateById(T1)?.outflows).toHaveLength(1);
  });

  it('met à jour le nom et le flag par défaut', async () => {
    const store = createStore([
      baseTemplate(),
      { ...baseTemplate({ id: 'dddddddd-dddd-dddd-dddd-dddddddddddd', name: 'B' }), outflows: [], budgets: [] },
    ]);
    const loaded = waitStoreEvent(store, 'templatesLoaded');
    store.emitAction('loadTemplates');
    await loaded;

    const done = waitStoreEvent(store, 'templateUpdateLoaded');
    store.emitAction('updateTemplate', { templateId: T1, name: 'Renommé', isDefault: true });
    await done;

    const t1 = store.getTemplateById(T1);
    expect(t1?.name).toBe('Renommé');
    expect(t1?.isDefault).toBe(true);
    expect(store.getTemplateById('dddddddd-dddd-dddd-dddd-dddddddddddd')?.isDefault).toBe(false);
  });

  it('ajoute et supprime une charge', async () => {
    const store = createStore([baseTemplate()]);
    const loaded = waitStoreEvent(store, 'templatesLoaded');
    store.emitAction('loadTemplates');
    await loaded;

    const addDone = waitStoreEvent(store, 'templateOutflowAddLoaded');
    store.emitAction('addTemplateOutflow', { templateId: T1, label: '💡 Test', amount: 20 });
    await addDone;
    expect(store.getTemplateById(T1)?.outflows.some((o) => o.label.includes('Test'))).toBe(true);

    const outId = store.getTemplateById(T1)?.outflows.find((o) => o.label.includes('Test'))?.id;
    expect(outId).toBeTruthy();

    const delDone = waitStoreEvent(store, 'templateOutflowDeleteLoaded');
    store.emitAction('deleteTemplateOutflow', { templateId: T1, outflowId: outId! });
    await delDone;
    expect(store.getTemplateById(T1)?.outflows.some((o) => o.label.includes('Test'))).toBe(false);
  });

  it('ajoute et supprime un budget', async () => {
    const store = createStore([baseTemplate()]);
    const loaded = waitStoreEvent(store, 'templatesLoaded');
    store.emitAction('loadTemplates');
    await loaded;

    const addDone = waitStoreEvent(store, 'templateBudgetAddLoaded');
    store.emitAction('addTemplateBudget', { templateId: T1, name: 'Loisirs', initialBalance: 30 });
    await addDone;
    expect(store.getTemplateById(T1)?.budgets.some((b) => b.name === 'Loisirs')).toBe(true);

    const bid = store.getTemplateById(T1)?.budgets.find((b) => b.name === 'Loisirs')?.id;
    expect(bid).toBeTruthy();

    const delDone = waitStoreEvent(store, 'templateBudgetDeleteLoaded');
    store.emitAction('deleteTemplateBudget', { templateId: T1, budgetId: bid! });
    await delDone;
    expect(store.getTemplateById(T1)?.budgets.some((b) => b.name === 'Loisirs')).toBe(false);
  });
});
