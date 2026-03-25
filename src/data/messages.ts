// 게임 메시지 템플릿

// === 한글 끝말잇기 ===
export const WORDCHAIN_MESSAGES = {
  greeting: [
    '{name}님 안녕! 끝말잇기 하러 왔구나? 재밌게 하자!',
    '반가워 {name}! 끝말잇기 준비됐어? 시작해볼까!',
    '{name}! 오늘 끝말잇기에서 누가 이길까? 해보자!',
  ],
  aiFirst: [
    '내가 먼저 시작할게! "{word}"!',
    '좋아, 내가 먼저! "{word}"!',
    '시작이다! "{word}"!',
  ],
  aiTurn: [
    '음... "{word}"! 이번엔 "{lastChar}"로 시작하는 단어를 말해봐!',
    '"{word}"! 자, "{lastChar}"로 시작하는 단어는?',
    '흐흐, "{word}"! "{lastChar}" 차례야!',
  ],
  playerSuccess: [
    '잘했어! "{word}" 좋은 단어네!',
    '오~ "{word}"! 대단한걸?',
    '"{word}"! 정답이야! 잘하는데?',
  ],
  playerInvalid: [
    '이 단어는 "{lastChar}"(으)로 시작해야 해! 다시 해봐!',
    '앗, "{lastChar}"(으)로 시작하는 단어를 말해줘!',
  ],
  playerDuplicate: [
    '이 단어는 이미 사용했어! 다른 단어를 생각해봐!',
  ],
  playerNotInDict: [
    '음... 이 단어는 사전에 없는 것 같아. 다른 단어를 말해줘!',
  ],
  aiLose: [
    '으으... 이번엔 내가 졌어! "{lastChar}"(으)로 시작하는 단어가 생각이 안 나!',
    '아, 모르겠다! "{lastChar}"는 너무 어려워! 네가 이겼어!',
  ],
  hint: [
    '힌트! "{lastChar}"(으)로 시작하는 단어로는... {category} 관련 단어가 있어!',
    '도와줄게! {category}에서 찾아봐! "{lastChar}"(으)로 시작해!',
  ],
  hintNoCategory: [
    '힌트! "{lastChar}"(으)로 시작하는 단어를 잘 생각해봐!',
  ],
  aiThinking: [
    '음... 생각 중이야...',
    '잠깐만, 생각하고 있어...',
  ],
};

// === 수도 맞추기 ===
export const CAPITAL_MESSAGES = {
  greeting: [
    '{name}님 안녕! 세계 수도를 맞춰볼까? 출발!',
    '반가워 {name}! 세계 여행을 떠나볼까?',
  ],
  question: [
    '{flag} {name}의 수도는 어디일까?',
    '{flag} {name}! 이 나라의 수도를 맞춰봐!',
  ],
  correct: [
    '정답이야! 대단해!',
    '맞았어! 잘 알고 있구나!',
    '완벽해! 정답!',
  ],
  correctWithHint: [
    '힌트를 봤지만 맞췄어! 잘했어!',
  ],
  wrong: [
    '아쉽다! 정답은 "{capital}"이야!',
    '틀렸어! "{capital}"이 정답이야! 다음엔 맞출 수 있을 거야!',
  ],
  hint: [
    '힌트! 초성은 "{hint}"이야!',
  ],
  result: [
    '{name}님, {score}점! {total}문제 중 {correct}개를 맞혔어!',
  ],
};

// === 영어 끝말잇기 ===
export const ENGLISH_MESSAGES = {
  greeting: [
    'Hi {name}! Ready for English word chain? Let\'s go!',
    'Welcome {name}! Let\'s play English word chain!',
  ],
  aiFirst: [
    'I\'ll start! "{word}"! Your turn with "{lastChar}"!',
    'Here we go! "{word}"! Now you say a word starting with "{lastChar}"!',
  ],
  aiTurn: [
    '"{word}"! Now your turn, start with "{lastChar}"!',
    'How about "{word}"? Your word starts with "{lastChar}"!',
  ],
  playerSuccess: [
    'Great job! "{word}" is a nice word!',
    'Awesome! "{word}"! You\'re good at this!',
  ],
  playerInvalid: [
    'Oops! Your word should start with "{lastChar}"! Try again!',
  ],
  playerDuplicate: [
    'That word was already used! Think of another one!',
  ],
  playerNotInDict: [
    'Hmm, I don\'t know that word. Try a different one!',
  ],
  aiLose: [
    'Oh no! I can\'t think of a word starting with "{lastChar}"! You win this round!',
  ],
  hint: [
    'Hint! Think of a {category} word starting with "{lastChar}"!',
  ],
  hintNoCategory: [
    'Hint! Think of a word starting with "{lastChar}"!',
  ],
  aiThinking: [
    'Let me think...',
    'Hmm, thinking...',
  ],
};

// 랜덤 메시지 선택
export function pickMessage(messages: string[], replacements: Record<string, string> = {}): string {
  const template = messages[Math.floor(Math.random() * messages.length)];
  return Object.entries(replacements).reduce(
    (msg, [key, val]) => msg.replace(new RegExp(`\\{${key}\\}`, 'g'), val),
    template
  );
}
