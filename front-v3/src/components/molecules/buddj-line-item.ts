/**
 * Ligne réutilisable : emoji + intitulé (ellipsis) + montant (buddj-amount) + slot actions.
 * Optionnel : slot "prefix" (ex. checkbox) + attribut checkable-for pour rendre la zone principale cliquable.
 * Attribut no-inner-padding : pas de padding sur la zone main (ex. quand le parent pad déjà la row).
 * Attribut amount : nombre (le WC formate en « X € » pour l'affichage).
 * Attribut hide-amount : masque le montant (ex. liste de templates).
 */
import { formatEuros } from '../../shared/goal.js';

export class BuddjLineItem extends HTMLElement {
  static readonly tagName = 'buddj-line-item';

  static get observedAttributes(): string[] {
    return ['icon', 'label', 'amount', 'checkable-for', 'no-inner-padding', 'hide-amount'];
  }

  private _iconEl: HTMLElement | null = null;
  private _labelEl: HTMLElement | null = null;
  private _amountEl: HTMLElement | null = null;

  connectedCallback(): void {
    if (this.shadowRoot) return;
    const checkableFor = this.getAttribute('checkable-for');
    const hasInnerPadding = !this.hasAttribute('no-inner-padding');

    const root = this.attachShadow({ mode: 'open' });

    const style = document.createElement('style');
    style.textContent = `
      :host {
        display: block;
        min-height: 2rem;
        background: var(--bg-card);
        border-radius: var(--radius);
        border: 1px solid rgba(255, 255, 255, 0.08);
        box-shadow: var(--shadow);
        overflow: hidden;
        transition: border-color 0.2s ease, background 0.2s ease;
      }
      :host([no-inner-padding]) { min-height: 0; }
      .line-item-inner {
        display: flex;
        align-items: center;
        gap: 0.75rem;
        width: 100%;
        min-width: 0;
        min-height: inherit;
      }
      .line-item-main {
        flex: 1;
        min-width: 0;
        display: flex;
        align-items: center;
        gap: 0.75rem;
        cursor: default;
      }
      .line-item-main[for] { cursor: pointer; user-select: none; }
      .line-item-main--padded { padding: 0.5rem 0.85rem; }
      .line-item-content {
        display: flex;
        align-items: center;
        gap: 0.75rem;
        flex: 1;
        min-width: 0;
      }
      .line-item-icon {
        font-size: 1rem;
        margin-right: 0.25rem;
        opacity: 0.9;
        flex-shrink: 0;
      }
      .line-item-label {
        flex: 1;
        min-width: 0;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }
      .line-item-label .buddj-text-ellipsis__inner {
        display: block;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        color: var(--navy);
      }
      .line-item-actions {
        display: flex;
        align-items: center;
        gap: 0.25rem;
        flex-shrink: 0;
      }
      :host(:not([no-inner-padding])) .line-item-actions {
        padding-right: 0.5rem;
      }
      .line-item-amount-wrap {
        display: flex;
        flex-direction: column;
        align-items: flex-end;
        min-width: 0;
        max-width: 7rem;
        flex-shrink: 1;
      }
      buddj-amount .amount-value {
        font-family: var(--font-head);
        font-weight: 700;
        font-size: 0.95rem;
        min-width: 4rem;
        text-align: right;
        color: var(--coral);
      }
      .line-item-amount-simple {
        display: flex;
        flex-direction: column;
        align-items: flex-end;
      }
    `;
    root.appendChild(style);

    const inner = this.createInnerContainer();
    const main = this.createMainZone(checkableFor, hasInnerPadding);
    main.appendChild(this.createContentBlock());
    if (!this.hasAttribute('hide-amount')) {
      main.appendChild(this.createAmountBlock());
    }
    inner.appendChild(main);
    inner.appendChild(this.createActionsBlock());

    this.updateContent();
    root.appendChild(inner);

    if (checkableFor) {
      main.addEventListener('click', (e) => {
        e.preventDefault();
        const slot = root.querySelector<HTMLSlotElement>('slot[name="prefix"]');
        const nodes = slot?.assignedNodes() ?? [];
        const checkbox = nodes.find(
          (n): n is HTMLInputElement => n.nodeType === Node.ELEMENT_NODE && (n as HTMLInputElement).type === 'checkbox'
        );
        if (checkbox) {
          checkbox.checked = !checkbox.checked;
          checkbox.dispatchEvent(new Event('change', { bubbles: true }));
        }
      });
    }
  }

  /** Conteneur flex principal de la ligne (inner). */
  private createInnerContainer(): HTMLDivElement {
    const inner = document.createElement('div');
    inner.className = 'line-item-inner';
    return inner;
  }

  /** Zone principale cliquable (label ou div) : contiendra le contenu + le montant. */
  private createMainZone(checkableFor: string | null, hasInnerPadding: boolean): HTMLElement {
    const main = document.createElement(checkableFor ? 'label' : 'div');
    main.className = 'line-item-main' + (hasInnerPadding ? ' line-item-main--padded' : '');
    main.setAttribute('part', 'main');
    if (checkableFor) main.setAttribute('for', checkableFor);
    return main;
  }

  /** Bloc contenu : slot prefix (ex. checkbox) + icône + intitulé (ellipsis). */
  private createContentBlock(): HTMLDivElement {
    const contentDiv = document.createElement('div');
    contentDiv.className = 'line-item-content';

    const prefixSlot = document.createElement('slot');
    prefixSlot.name = 'prefix';
    contentDiv.appendChild(prefixSlot);

    const iconSpan = document.createElement('span');
    iconSpan.className = 'line-item-icon';
    iconSpan.setAttribute('aria-hidden', 'true');
    this._iconEl = iconSpan;

    const labelEl = document.createElement('buddj-text-ellipsis');
    labelEl.className = 'line-item-label';
    this._labelEl = labelEl;

    contentDiv.appendChild(iconSpan);
    contentDiv.appendChild(labelEl);
    return contentDiv;
  }

  /** Bloc montant : buddj-amount. */
  private createAmountBlock(): HTMLDivElement {
    const amountWrap = document.createElement('div');
    amountWrap.className = 'line-item-amount-wrap';

    const amountSimple = document.createElement('div');
    amountSimple.className = 'line-item-amount-simple';
    const amountEl = document.createElement('buddj-amount');
    this._amountEl = amountEl;
    amountSimple.appendChild(amountEl);

    amountWrap.appendChild(amountSimple);
    return amountWrap;
  }

  /** Bloc actions : slot pour les boutons (supprimer, etc.). */
  private createActionsBlock(): HTMLDivElement {
    const actionsWrap = document.createElement('div');
    actionsWrap.className = 'line-item-actions';
    actionsWrap.setAttribute('part', 'actions');
    const actionsSlot = document.createElement('slot');
    actionsSlot.name = 'actions';
    actionsWrap.appendChild(actionsSlot);
    return actionsWrap;
  }

  attributeChangedCallback(): void {
    this.updateContent();
  }

  private updateContent(): void {
    if (!this._iconEl || !this._labelEl) return;
    const icon = this.getAttribute('icon') ?? '';
    const label = this.getAttribute('label') ?? '';
    this._iconEl.textContent = icon;
    this._labelEl.setAttribute('text', label);
    if (this._amountEl) {
      const amountNum = parseFloat(this.getAttribute('amount') ?? '0') || 0;
      this._amountEl.setAttribute('value', formatEuros(amountNum));
    }
  }
}

customElements.define(BuddjLineItem.tagName, BuddjLineItem);
