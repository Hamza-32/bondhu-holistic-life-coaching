/**
 * Client-side crisis keyword detection (English, Bangla and Banglish). A match only shows a gentle
 * support card with helplines; it never blocks, saves, reports or sends anything anywhere.
 *
 * Phrases are matched after normalisation (lower case, NFC, apostrophes and punctuation removed,
 * whitespace collapsed), and only on word boundaries so "diet" never matches "die".
 */
const PHRASES = {
  en: [
    'suicide',
    'suicidal',
    'kill myself',
    'killing myself',
    'end my life',
    'ending my life',
    'take my own life',
    'take my life',
    'want to die',
    'wanna die',
    'wish i was dead',
    'wish i were dead',
    'better off dead',
    'better off without me',
    'no reason to live',
    'nothing to live for',
    'dont want to live',
    'dont want to be alive',
    'cant go on',
    'self harm',
    'selfharm',
    'hurt myself',
    'hurting myself',
    'cut myself',
    'cutting myself',
    'overdose',
  ],
  banglish: [
    'attohotta',
    'atmohotta',
    'attmohotta',
    'suicide korbo',
    'more jete chai',
    'morte chai',
    'mora jete chai',
    'mori jai',
    'bachte chai na',
    'bachte ichche kore na',
    'bachte iccha kore na',
    'nijeke shesh kore',
    'nijeke sesh kore',
    'nijer khoti korbo',
  ],
  bn: [
    'আত্মহত্যা',
    'আত্মহনন',
    'মরে যেতে চাই',
    'মরতে চাই',
    'মরে যাব',
    'মরে যাবো',
    'বাঁচতে চাই না',
    'বাঁচতে ইচ্ছা করে না',
    'বাঁচতে ইচ্ছে করে না',
    'বেঁচে থাকার কোনো মানে নেই',
    'নিজেকে শেষ করে',
    'নিজেকে মেরে',
    'নিজের ক্ষতি করব',
    'নিজের ক্ষতি করতে',
  ],
} as const;

export function normalise(text: string): string {
  return text
    .normalize('NFC')
    .toLowerCase()
    .replace(/['’`]/g, '')
    .replace(/[^\p{L}\p{M}\p{N}]+/gu, ' ')
    .trim();
}

const ALL = Object.values(PHRASES)
  .flat()
  .map((p) => normalise(p));

/** True when the text contains a crisis phrase in any supported language. */
export function detectCrisis(text: string): boolean {
  if (!text.trim()) return false;
  const padded = ` ${normalise(text)} `;
  return ALL.some((phrase) => padded.includes(` ${phrase} `));
}
