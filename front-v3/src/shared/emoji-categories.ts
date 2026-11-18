/**
 * Catégories d'emoji proposées par le drawer de choix d'emoji.
 * L'emoji en tête d'un libellé range la ligne dans sa catégorie (suivi des dépenses).
 */
export type EmojiCategory = { id: string; title: string; emojis: string[] };

export const EMOJI_CATEGORIES: EmojiCategory[] = [
  { id: 'money', title: 'Argent & finances', emojis: ['💰', '🐖', '💳', '💵', '💴', '💶', '💸', '🏦', '📈', '📉', '🧾'] },
  { id: 'housing', title: 'Logement', emojis: ['🏠', '🏡', '🏢', '🏬', '🔑', '🛏️'] },
  { id: 'transport', title: 'Transport', emojis: ['🚗', '🚕', '🚎', '🚌', '🚅', '🚄', '✈️', '🚲', '🛵', '⛽', '🅿️'] },
  { id: 'energy', title: 'Énergie', emojis: ['⚡', '💡', '🔌', '🔋', '🔥', '💧', '🛢️', '🌡️'] },
  { id: 'utilities', title: 'Utilitaires', emojis: ['📱', '💻', '🌐', '🌍', '📞', '📡', '📶', '🖨️', '✉️', '📮'] },
  { id: 'food', title: 'Alimentation', emojis: ['🍎', '🍽️', '☕', '🍔', '🍕', '🥐', '🥖', '🥗', '🍻', '🍫'] },
  { id: 'leisure', title: 'Shopping & loisirs', emojis: ['🛒', '🛍️', '🎬', '🍿', '🥤', '🎫', '🎟️', '🎮', '📺', '🎵', '📷', '🎁', '🎯', '🎪'] },
  { id: 'health', title: 'Santé', emojis: ['🏥', '💊', '🩺', '🦷', '🧴'] },
  { id: 'education', title: 'Éducation', emojis: ['📚', '✏️', '📖', '🎓', '📝'] },
  { id: 'travel', title: 'Voyage & vacances', emojis: ['🏝️', '🏨', '🌴', '✈️', '🧳', '🗺️', '☀️'] },
  { id: 'home', title: 'Maison & entretien', emojis: ['🧹', '🔧', '📦', '🛋️', '🪴', '🪣', '🧺'] },
  { id: 'personal', title: 'Personnel & style', emojis: ['💇', '👕', '👗', '💄', '💅'] },
  { id: 'pets', title: 'Animaux', emojis: ['🐕', '🐈', '🐠', '🐦'] },
  { id: 'misc', title: 'Divers', emojis: ['💐', '🎉', '📌', '🔔', '⏰', '📆', '🚬'] },
];

/** Catégorie des libellés sans emoji connu en tête. */
export const UNCATEGORIZED: EmojiCategory = { id: 'uncategorized', title: 'Sans catégorie', emojis: ['🏷️'] };

const LEADING_EMOJI_RE = /^\p{Extended_Pictographic}(?:️|‍\p{Extended_Pictographic})*/u;

/** ✈ et ✈️ désignent le même emoji : on ignore le sélecteur de variante. */
function normalizeEmoji(emoji: string): string {
  return emoji.replace(/️/g, '');
}

/** Un emoji présent dans deux catégories reste dans la première. */
const CATEGORY_BY_EMOJI = new Map<string, EmojiCategory>();
for (const category of EMOJI_CATEGORIES) {
  for (const emoji of category.emojis) {
    const key = normalizeEmoji(emoji);
    if (!CATEGORY_BY_EMOJI.has(key)) CATEGORY_BY_EMOJI.set(key, category);
  }
}

/** Catégorie d'un libellé « emoji texte », d'après son emoji de tête. */
export function categoryOfLabel(label: string): EmojiCategory {
  const match = label.trim().match(LEADING_EMOJI_RE);
  if (!match) return UNCATEGORIZED;
  return CATEGORY_BY_EMOJI.get(normalizeEmoji(match[0])) ?? UNCATEGORIZED;
}
