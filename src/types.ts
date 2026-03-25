export type GameId = 'wordchain' | 'capital' | 'english' | 'speaking';
export type GamePhase = 'start' | 'greeting' | 'playing' | 'result';
export type AppPhase = 'home' | 'game';
export type Turn = 'ai' | 'player';

export interface GameConfig {
  id: GameId;
  name: string;
  nameEn: string;
  emoji: string;
  description: string;
  catchphrase: string;
  teacherName: string;
  teacherImage: string;
  themeColor: string;
  themeBg: string;
  themeGradient: string;
  avatarId: string;
}

export interface WordChip {
  word: string;
  type: 'ai' | 'player';
}

export interface Score {
  player: number;
  ai: number;
}

export interface CountryData {
  name: string;
  capital: string;
  flag: string;
  hint: string;
}

export const HOME_AVATAR_ID = 'a56767cb-0090-11ef-8ee1-0abbf354c5cc';

export const GAME_CONFIGS: Record<GameId, GameConfig> = {
  wordchain: {
    id: 'wordchain',
    name: '우리말 대결',
    nameEn: 'Korean Word Battle',
    emoji: '',
    description: '하나 선생님이랑 우리말로 대결해 보자!',
    catchphrase: '하나 선생님과\n우리말 대결!',
    teacherName: '하나',
    teacherImage: '/images/hana.png',
    themeColor: '#6C5CE7',
    themeBg: '#F0EDFF',
    themeGradient: 'from-[#6C5CE7] to-[#A29BFE]',
    avatarId: 'a57d4b8e-0090-11ef-8ee1-0abbf354c5cc',
  },
  capital: {
    id: 'capital',
    name: '나라 여행 퀴즈',
    nameEn: 'World Travel Quiz',
    emoji: '',
    description: '지구 선생님이랑 세계 여행을 떠나자!',
    catchphrase: '지구 선생님과\n세계 여행 출발!',
    teacherName: '지구',
    teacherImage: '/images/jigu.png',
    themeColor: '#0984E3',
    themeBg: '#EDF5FF',
    themeGradient: 'from-[#0984E3] to-[#74B9FF]',
    avatarId: 'a5c6df24-0090-11ef-8ee1-0abbf354c5cc',
  },
  english: {
    id: 'english',
    name: 'ABC 놀이',
    nameEn: 'ABC Play',
    emoji: '',
    description: '에밀리랑 영어 단어로 놀아 보자!',
    catchphrase: '에밀리와 함께\nABC 대결!',
    teacherName: '에밀리',
    teacherImage: '/images/emily.png',
    themeColor: '#00B894',
    themeBg: '#EAFFF8',
    themeGradient: 'from-[#00B894] to-[#55EFC4]',
    avatarId: 'a588091f-0090-11ef-8ee1-0abbf354c5cc',
  },
  speaking: {
    id: 'speaking',
    name: '따라 말해봐!',
    nameEn: 'Say It Like Me',
    emoji: '',
    description: '에밀리가 말하면 나도 따라 말해 보자!',
    catchphrase: '에밀리가 말하면\n나도 따라 말해!',
    teacherName: '에밀리',
    teacherImage: '/images/emily.png',
    themeColor: '#E17055',
    themeBg: '#FFF0ED',
    themeGradient: 'from-[#E17055] to-[#FAB1A0]',
    avatarId: 'a588091f-0090-11ef-8ee1-0abbf354c5cc',
  },
};

// Klleon SDK global type
declare global {
  interface Window {
    KlleonChat?: {
      init: (config: { sdk_key: string; avatar_id: string }) => Promise<void>;
      echo: (message: string) => void;
      stopSpeech: () => void;
      startStt: () => void;
      endStt: () => void;
      cancelStt: () => void;
      destroy: () => Promise<void>;
      onStatusEvent?: (event: { type: string }) => void;
      onChatEvent?: (event: { type: string; data?: { text?: string } }) => void;
    };
    __klleonSDKReady?: Promise<void>;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    SpeechRecognition?: any;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    webkitSpeechRecognition?: any;
  }
}
