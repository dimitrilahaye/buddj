import { Component, Inject, Signal } from '@angular/core';
import {
  MONTHLY_TEMPLATES_STORE,
  MonthlyTemplatesStoreInterface,
} from '../../stores/monthlyTemplates/monthlyTemplates.store.interface';
import { MonthTemplate } from '../../models/monthTemplate.model';
import { DesignSystemModule } from '../../design-system/design-system.module';
import { CommonModule } from '@angular/common';
import { HeaderBackButtonComponent } from '../header-back-button/header-back-button.component';
import { Router } from '@angular/router';

@Component({
  selector: 'app-monthly-templates',
  standalone: true,
  imports: [CommonModule, DesignSystemModule, HeaderBackButtonComponent],
  templateUrl: './monthly-templates.component.html',
  styleUrl: './monthly-templates.component.scss',
})
export class MonthlyTemplatesComponent {
  templatesSignal: Signal<MonthTemplate[]>;

  constructor(
    @Inject(MONTHLY_TEMPLATES_STORE)
    private readonly monthlyTemplatesStore: MonthlyTemplatesStoreInterface,
    private router: Router
  ) {
    this.templatesSignal = this.monthlyTemplatesStore.getAll();
  }

  get templates() {
    return this.templatesSignal();
  }

  getDefaultInfo(template: MonthTemplate) {
    return template.isDefault ? '(défaut)' : '';
  }

  goToTemplatePage(templateId: string, event: Event) {
    this.router.navigate(['/monthly-templates', templateId]);
    event.stopPropagation();
  }
}
