export interface WordHint {
  word: string;
  meaning: string;
}

export interface SpeakingPattern {
  id: number;
  sentence: string;
  korean: string;
  wordHints: WordHint[];
}

export const SPEAKING_PATTERNS: SpeakingPattern[] = [
  {
    id: 1,
    sentence: 'Can I have a glass of water, please?',
    korean: '물 한 잔 주시겠어요?',
    wordHints: [
      { word: 'glass', meaning: '잔, 유리컵' },
      { word: 'water', meaning: '물' },
      { word: 'please', meaning: '부탁합니다' },
    ],
  },
  {
    id: 2,
    sentence: 'I would like to order a cheeseburger.',
    korean: '치즈버거 하나 주문하고 싶어요.',
    wordHints: [
      { word: 'would', meaning: '~하고 싶다 (정중한 표현)' },
      { word: 'order', meaning: '주문하다' },
      { word: 'cheeseburger', meaning: '치즈버거' },
    ],
  },
  {
    id: 3,
    sentence: 'Excuse me, where is the nearest subway station?',
    korean: '실례합니다, 가장 가까운 지하철역이 어디예요?',
    wordHints: [
      { word: 'Excuse', meaning: '실례합니다' },
      { word: 'nearest', meaning: '가장 가까운' },
      { word: 'subway', meaning: '지하철' },
      { word: 'station', meaning: '역' },
    ],
  },
  {
    id: 4,
    sentence: 'Could you take a picture of us, please?',
    korean: '저희 사진 좀 찍어 주시겠어요?',
    wordHints: [
      { word: 'Could', meaning: '~해 주시겠어요? (정중한 부탁)' },
      { word: 'picture', meaning: '사진' },
      { word: 'please', meaning: '부탁합니다' },
    ],
  },
];
