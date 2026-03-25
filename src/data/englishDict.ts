// English dictionary keyed by first letter
export const ENGLISH_DICT: Record<string, string[]> = {
  a: ['apple', 'ant', 'airplane', 'animal', 'art', 'arm', 'air', 'age', 'angel', 'adventure'],
  b: ['banana', 'bear', 'bird', 'book', 'bridge', 'butter', 'bus', 'bell', 'boat', 'basket'],
  c: ['cat', 'car', 'cake', 'cloud', 'chair', 'cheese', 'castle', 'circle', 'candle', 'crystal'],
  d: ['dog', 'door', 'dragon', 'dance', 'dream', 'diamond', 'desk', 'deer', 'dolphin', 'dust'],
  e: ['elephant', 'eagle', 'earth', 'engine', 'eye', 'egg', 'evening', 'energy', 'emerald', 'ear'],
  f: ['fish', 'flower', 'fire', 'forest', 'friend', 'frog', 'fruit', 'flag', 'fan', 'feather'],
  g: ['garden', 'gold', 'grape', 'guitar', 'game', 'gate', 'gift', 'glass', 'globe', 'grass'],
  h: ['house', 'horse', 'heart', 'hat', 'honey', 'hammer', 'hill', 'hero', 'horn', 'hand'],
  i: ['island', 'ice', 'idea', 'iron', 'insect', 'instrument', 'ink', 'ivory'],
  j: ['jungle', 'jewel', 'juice', 'jump', 'jacket', 'jar', 'jet'],
  k: ['king', 'kite', 'kitchen', 'key', 'knight', 'kangaroo', 'kitten', 'kingdom'],
  l: ['lion', 'lake', 'light', 'leaf', 'lemon', 'letter', 'lamp', 'ladder', 'land', 'love'],
  m: ['moon', 'mountain', 'mouse', 'music', 'magic', 'mirror', 'map', 'mango', 'milk', 'medal'],
  n: ['nature', 'night', 'nest', 'nose', 'net', 'needle', 'note', 'nurse', 'name'],
  o: ['ocean', 'orange', 'owl', 'olive', 'opera', 'orbit', 'orchid'],
  p: ['piano', 'planet', 'penguin', 'puzzle', 'parrot', 'pearl', 'panda', 'paint', 'park', 'prince'],
  q: ['queen', 'quiz', 'quilt', 'quest'],
  r: ['rainbow', 'river', 'robot', 'rocket', 'rain', 'rabbit', 'rose', 'ring', 'road', 'ruler'],
  s: ['star', 'sun', 'sea', 'snake', 'snow', 'stone', 'silver', 'smile', 'space', 'story'],
  t: ['tree', 'tiger', 'train', 'turtle', 'thunder', 'tower', 'trumpet', 'treasure', 'table', 'tear'],
  u: ['umbrella', 'unicorn', 'universe', 'unit'],
  v: ['violin', 'valley', 'village', 'voice', 'vine', 'vest', 'victory'],
  w: ['water', 'wind', 'whale', 'winter', 'wizard', 'wing', 'window', 'world', 'wave', 'wood'],
  x: ['xylophone'],
  y: ['yellow', 'yard', 'yarn', 'yoga'],
  z: ['zebra', 'zoo', 'zone', 'zero'],
};

// Word categories for hints
export const ENGLISH_CATEGORIES: Record<string, string> = {
  apple: 'fruit', banana: 'fruit', grape: 'fruit', lemon: 'fruit', mango: 'fruit', orange: 'fruit',
  cat: 'animal', dog: 'animal', bear: 'animal', bird: 'animal', deer: 'animal', dolphin: 'animal',
  eagle: 'animal', elephant: 'animal', fish: 'animal', frog: 'animal', horse: 'animal', insect: 'animal',
  kangaroo: 'animal', kitten: 'animal', lion: 'animal', mouse: 'animal', owl: 'animal', panda: 'animal',
  parrot: 'animal', penguin: 'animal', rabbit: 'animal', snake: 'animal', tiger: 'animal', turtle: 'animal',
  whale: 'animal', zebra: 'animal',
  piano: 'instrument', guitar: 'instrument', trumpet: 'instrument', violin: 'instrument', xylophone: 'instrument',
  car: 'vehicle', bus: 'vehicle', train: 'vehicle', airplane: 'vehicle', boat: 'vehicle', rocket: 'vehicle',
  tree: 'nature', flower: 'nature', forest: 'nature', garden: 'nature', lake: 'nature', mountain: 'nature',
  ocean: 'nature', rain: 'nature', rainbow: 'nature', river: 'nature', snow: 'nature', star: 'nature',
  sun: 'nature', wind: 'nature', cloud: 'nature',
};

// Easy ending letters (more words start with these)
export const EASY_END_LETTERS = ['e', 't', 'r', 's', 'n', 'y', 'd'];

// Hard ending letters (few words start with these)
export const HARD_END_LETTERS = ['x', 'z', 'j', 'q', 'v'];

// Good starting words
export const START_WORDS = ['apple', 'elephant', 'orange', 'eagle', 'tiger', 'star', 'tree', 'rain'];

// Find all words starting with a letter
export function findEnglishWords(letter: string): string[] {
  return ENGLISH_DICT[letter.toLowerCase()] || [];
}

// Check if word exists in dictionary
export function isEnglishWord(word: string): boolean {
  const lower = word.toLowerCase();
  const firstLetter = lower[0];
  const words = ENGLISH_DICT[firstLetter];
  return words ? words.includes(lower) : false;
}
