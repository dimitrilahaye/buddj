/**
 * Écran Liste des templates : clic sur un template pour accéder à ses détails.
 * Chaque template est un buddj-line-item (sans actions, sans checkable). Le template par défaut porte la mention « Par défaut ».
 */
import { escapeAttr } from '../../shared/escape.js';

const DEFAULT_TEMPLATE_EMOJI = '📆';

export interface TemplateListItem {
  id: string;
  name: string;
  isDefault: boolean;
  /** Emoji du template. Par défaut : 📆 */
  icon?: string;
}

const MOCK_TEMPLATES: TemplateListItem[] = [
  { id: 't1', name: 'Mon template principal', isDefault: true },
  { id: 't2', name: 'Vacances', isDefault: false, icon: '🏖️' },
  { id: 't3', name: 'Déménagement', isDefault: false, icon: '📦' },
  { id: 't4', name: 'Rentrée scolaire', isDefault: false, icon: '📚' },
  { id: 't5', name: 'Noël', isDefault: false, icon: '🎄' },
  { id: 't6', name: 'Travaux maison', isDefault: false, icon: '🔧' },
  { id: 't7', name: 'Mariage', isDefault: false, icon: '💒' },
  { id: 't8', name: 'Projet voiture', isDefault: false, icon: '🚗' },
  { id: 't9', name: 'Sport & bien-être', isDefault: false, icon: '💪' },
  { id: 't10', name: 'Abonnements', isDefault: false, icon: '📱' },
  { id: 't11', name: 'Courses & alimentation', isDefault: false, icon: '🛒' },
  { id: 't12', name: 'Loisirs', isDefault: false, icon: '🎮' },
  { id: 't13', name: 'Santé', isDefault: false, icon: '🏥' },
  { id: 't14', name: 'Enfants', isDefault: false, icon: '👶' },
  { id: 't15', name: 'Animaux', isDefault: false, icon: '🐕' },
  { id: 't16', name: 'Impot sur le revenu', isDefault: false, icon: '📋' },
  { id: 't17', name: 'Épargne projet', isDefault: false, icon: '🐷' },
  { id: 't18', name: 'Cadeaux', isDefault: false, icon: '🎁' },
  { id: 't19', name: 'Restaurant & sorties', isDefault: false, icon: '🍽️' },
  { id: 't20', name: 'Vacances été', isDefault: false, icon: '☀️' },
  { id: 't21', name: 'Vacances ski', isDefault: false, icon: '⛷️' },
  { id: 't22', name: 'Assurances', isDefault: false, icon: '🛡️' },
  { id: 't23', name: 'Énergie', isDefault: false, icon: '⚡' },
  { id: 't24', name: 'Télécom', isDefault: false, icon: '📶' },
  { id: 't25', name: 'Crédit immobilier', isDefault: false, icon: '🏠' },
];

export class BuddjScreenTemplates extends HTMLElement {
  static readonly tagName = 'buddj-screen-templates';

  private _templates: TemplateListItem[] = [...MOCK_TEMPLATES];
  private _onDefaultChanged = (e: Event): void => {
    const ev = e as CustomEvent<{ templateId: string; isDefault: boolean }>;
    const { templateId, isDefault } = ev.detail ?? {};
    if (!templateId) return;
    const t = this._templates.find((x) => x.id === templateId);
    if (!t) return;
    t.isDefault = isDefault;
    if (isDefault) {
      this._templates.forEach((x) => {
        if (x.id !== templateId) x.isDefault = false;
      });
    }
    this.render();
  };

  getTemplateById(id: string): TemplateListItem | undefined {
    return this._templates.find((t) => t.id === id);
  }

  connectedCallback(): void {
    if (this.querySelector('.templates-list')) return;
    this.render();
    this.attachListeners();
    document.addEventListener('buddj-template-default-changed', this._onDefaultChanged);
  }

  disconnectedCallback(): void {
    document.removeEventListener('buddj-template-default-changed', this._onDefaultChanged);
  }

  private render(): void {
    const main = document.createElement('main');
    main.className = 'screen screen--templates';
    main.id = 'templates';
    main.innerHTML = `
      <div class="screen-sticky-header-wrap templates-sticky-wrap">
        <header class="screen-header">
          <h1 class="title">Gérer les templates</h1>
        </header>
      </div>
      <section class="templates-list"></section>
    `;
    const listSection = main.querySelector('.templates-list')!;
    if (this._templates.length === 0) {
      listSection.innerHTML = '<p class="templates-empty">Aucun template.</p>';
    } else {
      for (const t of this._templates) {
        const link = document.createElement('a');
        link.href = `/templates/${escapeAttr(t.id)}`;
        link.className = 'template-list-item';
        link.setAttribute('data-template-id', t.id);
        const lineItem = document.createElement('buddj-line-item');
        lineItem.setAttribute('icon', t.icon ?? DEFAULT_TEMPLATE_EMOJI);
        lineItem.setAttribute('label', t.name);
        lineItem.setAttribute('hide-amount', '');
        if (t.isDefault) {
          const badge = document.createElement('span');
          badge.slot = 'actions';
          badge.className = 'template-list-badge';
          badge.textContent = 'Par défaut';
          lineItem.appendChild(badge);
        }
        link.appendChild(lineItem);
        listSection.appendChild(link);
      }
    }
    this.innerHTML = '';
    this.appendChild(main);
  }

  private attachListeners(): void {
    // Navigation gérée par le router (clic sur les liens)
  }
}

export const TEMPLATE_DEFAULT_CHANGED = 'buddj-template-default-changed';

customElements.define(BuddjScreenTemplates.tagName, BuddjScreenTemplates);
