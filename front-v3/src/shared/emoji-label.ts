const LEADING_EMOJI_RE =
  /^(\p{Extended_Pictographic}(?:\uFE0F|\u200d\p{Extended_Pictographic})*)\s*(.*)$/u;

/**
 * Si le libellé commence par un émoji, le retourne et le texte sans cet émoji ; sinon icône par défaut.
 */
export function splitLeadingEmoji({
  label,
  defaultIcon,
}: {
  label: string;
  defaultIcon: string;
}): { icon: string; text: string } {
  const trimmed = label.trim();
  const m = trimmed.match(LEADING_EMOJI_RE);
  if (m) {
    const icon = m[1] ?? defaultIcon;
    const rest = (m[2] ?? '').trim();
    return { icon, text: rest || trimmed };
  }
  return { icon: defaultIcon, text: trimmed };
}
