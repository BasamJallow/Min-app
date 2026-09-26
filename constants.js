// Faste data som flere skærme deler.
// weight: adfærd og situationsspørgsmål vægtes højest, brain teasers lavest.

export const CATEGORIES = [
  { key: 'behavior', name: 'Adfærd', desc: 'Træn STAR-metoden', icon: '💬', weight: 1.5 },
  { key: 'professional', name: 'Faglig', desc: 'Kompetencer fra opslaget', icon: '💼', weight: 1.25 },
  { key: 'motivation', name: 'Motivation', desc: 'Hvorfor lige dem?', icon: '💡', weight: 1 },
  { key: 'brain', name: 'Brain Teasers', desc: 'Vis din tankeproces', icon: '🧠', weight: 0.75 },
];
