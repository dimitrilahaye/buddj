/**
 * Dropdown d’actions : bouton trigger + panneau avec items.
 * Émet buddj-dropdown-action avec { actionId, targetId } au clic sur un item.
 * Slots : trigger (bouton), items (boutons avec data-action="id").
 * Attribut position : "center" (défaut) | "left" | "right" — alignement du panneau par rapport au trigger.
 */
export class BuddjActionsDropdown extends HTMLElement {
  static readonly tagName = 'buddj-actions-dropdown';

  static get observedAttributes(): string[] {
    return ['target-id', 'position'];
  }

  private _panel: HTMLElement | null = null;
  private _boundCloseOnOutside = (e: Event) => this.closeOnOutside(e);

  connectedCallback(): void {
    if (this.shadowRoot) return;

    const root = this.attachShadow({ mode: 'open' });
    root.innerHTML = `
      <style>
        :host {
          display: inline-block;
          position: relative;
        }
        .dropdown-trigger {
          cursor: pointer;
        }
        .dropdown-panel {
          display: none;
          position: absolute;
          top: 100%;
          margin-top: 0.25rem;
          min-width: 12rem;
          background: var(--bg-card);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: var(--radius);
          box-shadow: var(--shadow);
          z-index: 100;
          padding: 0.25rem 0;
        }
        .dropdown-panel.dropdown-panel--center {
          left: 50%;
          transform: translateX(-50%);
        }
        .dropdown-panel.dropdown-panel--left {
          left: 0;
        }
        .dropdown-panel.dropdown-panel--right {
          right: 0;
        }
        .dropdown-panel.dropdown-panel--open {
          display: block;
        }
        .dropdown-panel.dropdown-panel--upward {
          top: auto;
          bottom: 100%;
          margin-top: 0;
          margin-bottom: 0.25rem;
        }
        .dropdown-panel.dropdown-panel--upward.dropdown-panel--center {
          transform: translateX(-50%);
        }
        ::slotted([slot="items"]) {
          display: block;
          width: 100%;
          padding: 0.5rem 0.75rem;
          text-align: left;
          font-size: 0.9rem;
          border: none;
          background: none;
          color: var(--navy);
          cursor: pointer;
          font-family: inherit;
        }
        ::slotted([slot="items"]:hover:not(:disabled)) {
          background: rgba(255, 255, 255, 0.06);
        }
        ::slotted([slot="items"]:disabled) {
          opacity: 0.5;
          cursor: not-allowed;
        }
        ::slotted([slot="items"][data-variant="victory"]) {
          color: var(--mint);
        }
        ::slotted([slot="items"][data-variant="danger"]) {
          color: var(--danger, #e5534b);
        }
        ::slotted([slot="items"][data-variant="danger"]:hover:not(:disabled)) {
          background: rgba(229, 83, 75, 0.12);
        }
      </style>
      <div class="dropdown-trigger">
        <slot name="trigger"></slot>
      </div>
      <div class="dropdown-panel" role="menu" aria-hidden="true" aria-label="Actions">
        <slot name="items"></slot>
      </div>
    `;

    this._panel = root.querySelector('.dropdown-panel');
    this.applyPositionClass();
    const trigger = root.querySelector('.dropdown-trigger');
    trigger?.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      this.toggle();
    });
    root.addEventListener('click', (e) => this.onPanelClick(e));
    document.addEventListener('click', this._boundCloseOnOutside);
  }

  disconnectedCallback(): void {
    document.removeEventListener('click', this._boundCloseOnOutside);
  }

  attributeChangedCallback(name: string): void {
    if (name === 'position') {
      this.applyPositionClass();
    }
  }

  private applyPositionClass(): void {
    if (!this._panel) return;
    const pos = (this.getAttribute('position') ?? 'center').toLowerCase();
    this._panel.classList.remove('dropdown-panel--center', 'dropdown-panel--left', 'dropdown-panel--right');
    const positionClass =
      pos === 'left' ? 'dropdown-panel--left' : pos === 'right' ? 'dropdown-panel--right' : 'dropdown-panel--center';
    this._panel.classList.add(positionClass);
  }

  private toggle(): void {
    if (!this._panel) return;
    const wasOpen = this._panel.classList.contains('dropdown-panel--open');
    if (wasOpen) {
      this.close();
      return;
    }
    this._panel.classList.remove('dropdown-panel--upward');
    this._panel.classList.add('dropdown-panel--open');
    this._panel.setAttribute('aria-hidden', 'false');
    this.closeOtherDropdowns();
    requestAnimationFrame(() => this.adjustPosition());
  }

  close(): void {
    if (!this._panel) return;
    this._panel.classList.remove('dropdown-panel--open', 'dropdown-panel--upward');
    this._panel.setAttribute('aria-hidden', 'true');
  }

  private adjustPosition(): void {
    if (!this._panel || !this._panel.classList.contains('dropdown-panel--open')) return;
    const rect = this._panel.getBoundingClientRect();
    if (rect.bottom > window.innerHeight) {
      this._panel.classList.add('dropdown-panel--upward');
    }
  }

  private closeOnOutside(e: Event): void {
    const target = e.target as Node;
    if (this.contains(target) || this.shadowRoot?.contains(target)) return;
    this.close();
  }

  private closeOtherDropdowns(): void {
    const all = document.querySelectorAll<BuddjActionsDropdown>(BuddjActionsDropdown.tagName);
    all.forEach((el) => {
      if (el !== this) el.close();
    });
  }

  private onPanelClick(e: Event): void {
    const target = (e.target as Element).closest?.('[slot="items"]');
    if (!target) return;
    const actionId = (target as Element).getAttribute('data-action');
    if (!actionId) return;
    e.preventDefault();
    this.close();
    const targetId = this.getAttribute('target-id') ?? this.getAttribute('data-target-id') ?? '';
    this.dispatchEvent(
      new CustomEvent('buddj-dropdown-action', {
        bubbles: true,
        composed: true,
        detail: { actionId, targetId },
      })
    );
  }
}

customElements.define(BuddjActionsDropdown.tagName, BuddjActionsDropdown);
