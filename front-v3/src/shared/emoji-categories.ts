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
