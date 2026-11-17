/**
 * Menu ⋮ « Modifier / Supprimer » d’une ligne (dépense, charge, budget de template ou annuel).
 * Même markup que les lignes de l’écran Nouveau mois.
 */

export type LineMenuHandlers = {
  onEdit: () => void;
  onDelete: () => void;
};

/** Crée le dropdown à placer dans le slot `actions` d’un `buddj-line-item`. */
export function createLineActionsMenu({ subject }: { subject: string }): HTMLElement {
  const dropdown = document.createElement('buddj-actions-dropdown');
  dropdown.setAttribute('position', 'right');
  dropdown.className = 'line-actions-menu';
  dropdown.slot = 'actions';

  const trigger = document.createElement('button');
  trigger.type = 'button';
  trigger.className = 'btn btn-menu-dots';
  trigger.slot = 'trigger';
  trigger.title = `Actions sur ${subject}`;
  trigger.setAttribute('aria-label', `Actions sur ${subject}`);
  trigger.textContent = '⋮';

  const edit = document.createElement('button');
  edit.type = 'button';
  edit.slot = 'items';
  edit.dataset.action = 'edit';
  edit.textContent = 'Modifier';

  const separator = document.createElement('hr');
  separator.slot = 'items';
  separator.className = 'dropdown-menu-separator';
  separator.setAttribute('aria-hidden', 'true');

  const del = document.createElement('button');
  del.type = 'button';
  del.slot = 'items';
  del.dataset.action = 'delete';
  del.dataset.variant = 'danger';
  del.textContent = 'Supprimer';

  dropdown.append(trigger, edit, separator, del);
  return dropdown;
}

/**
 * Écoute les actions du menu de la ligne. L’événement est stoppé ici pour ne pas
 * déclencher le menu d’un parent (ex. la carte budget qui contient la dépense).
 */
export function listenLineMenuActions(host: HTMLElement, { onEdit, onDelete }: LineMenuHandlers): void {
  host.addEventListener('buddj-dropdown-action', (e: Event) => {
    const dropdown = (e.target as Element | null)?.closest?.('buddj-actions-dropdown');
    if (!dropdown || dropdown.closest(host.tagName.toLowerCase()) !== host) return;
    e.stopPropagation();
    const actionId = (e as CustomEvent<{ actionId: string }>).detail?.actionId;
    if (actionId === 'edit') onEdit();
    else if (actionId === 'delete') onDelete();
  });
}

