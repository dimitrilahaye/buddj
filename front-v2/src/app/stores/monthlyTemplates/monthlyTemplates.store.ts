import { Injectable, Signal, signal } from '@angular/core';
import { MonthlyTemplatesStoreInterface } from './monthlyTemplates.store.interface';
import { MonthTemplate } from '../../models/monthTemplate.model';

@Injectable({
  providedIn: 'root',
})
export class MonthlyTemplatesStore implements MonthlyTemplatesStoreInterface {
  private readonly _all = signal<MonthTemplate[]>([]);

  getAll(): Signal<MonthTemplate[]> {
    return this._all.asReadonly();
  }

  addAll(templates: MonthTemplate[]): void {
    this._all.update(() => {
      return templates;
    });
  }

  replaceOne(template: MonthTemplate): void {
    this._all.update((templates) => {
      const filteredTemplates = templates.filter((t) => t.id !== template.id);

      return [...filteredTemplates, template];
    });
  }

  getById(id: string): Signal<MonthTemplate | null> {
    const all = this._all();
    const template = all.find((t) => t.id === id);
    if (!template) {
      return signal(null);
    }
    template.outflows.sort((a, b) => a.label.localeCompare(b.label));
    template.budgets.sort((a, b) => a.name.localeCompare(b.name));
    return signal(template);
  }
}
