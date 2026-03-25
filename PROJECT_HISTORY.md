# 프로젝트 개발 히스토리

## 프로젝트 개요
- **프로젝트명**: 잼톡 JamTalk (미니게임 플랫폼)
- **배포 URL**: https://minigame-love.lovable.app
- **기술 스택**: React 18 + TypeScript + Vite + Tailwind CSS + shadcn/ui
- **백엔드**: Supabase (Lovable Cloud) — Edge Functions
- **외부 SDK**: Klleon SDK v1.3.0 (디지털 휴먼 아바타)

---

## Phase 1: 한글 끝말잇기 (단일 게임)

### 핵심 구현
- 한글 끝말잇기 게임 로직 (`useWordChain` 훅)
- 두음법칙 처리 (`applyDueum`)
- 로컬 사전 기반 단어 검증 + Gemini AI 폴백 검증
- Supabase Edge Function (`word-chain`) — AI 단어 생성/검증
- 5라운드 제한, 점수 시스템
- AI가 1~2라운드에서 의도적으로 지는 로직 (`pickAiLoseRounds`)
- 10초 자동 힌트 타이머

### Klleon SDK 통합
- 디지털 휴먼 아바타를 사용한 TTS 발화
- `<avatar-container>`를 `index.html`에 정적 정의
- `AvatarContainer` 컴포넌트가 마운트 시 DOM 이동, 언마운트 시 회수
- `useKlleonSdk` 훅으로 SDK 라이프사이클 관리

### UI/UX
- Start → Greeting (이름 입력) → Playing → Result 4단계 게임 플로우
- 음성 입력 지원 (`useVoiceInput`)
- 단어 체인 시각화 (`ChainArea`)
- 결과 공유 카드 생성 (`shareCard.ts`)

---

## Phase 2: 멀티 게임 플랫폼 확장

### 구조 변경
- 단일 게임 → 3종 게임 플랫폼으로 리팩토링
- `App.tsx`: `AppPhase` (`home` | `game`) 상태 관리
- `HomeScreen`: 게임 선택 화면 + 홈 아바타
- 각 게임별 독립 컴포넌트 + 전용 훅

### 추가된 게임들

#### 🌍 수도 맞추기 (`CapitalGame` + `useCapitalQuiz`)
- 10라운드, 나라별 수도 맞추기
- 힌트 사용 시 점수 감소 (10점 → 5점)
- 초성 힌트 시스템
- 로컬 데이터 기반 (`src/data/capitals.ts`)

#### 🇺🇸 영어 끝말잇기 (`EnglishChainGame` + `useEnglishChain`)
- 영어 단어 끝말잇기 (마지막 글자 → 첫 글자)
- AI가 쉬운 끝글자 단어를 우선 선택
- 3~5라운드 후 AI 패배 로직
- 로컬 영어 사전 기반 (`src/data/englishDict.ts`)

### 아바타 시스템
- 각 화면별 고유 아바타 ID:
  - 홈: `a56767cb-0090-11ef-8ee1-0abbf354c5cc`
  - 끝말잇기: `a57d4b8e-0090-11ef-8ee1-0abbf354c5cc`
  - 수도 맞추기: `a5c6df24-0090-11ef-8ee1-0abbf354c5cc`
  - 영어 끝말잇기: `a55bf757-0090-11ef-8ee1-0abbf354c5cc`

---

## SDK 이슈 해결 히스토리

### 문제 1: 페이지 전환 시 SDK destroy → 재초기화 실패
- **원인**: React 상태 변경으로 컴포넌트 언마운트 → `destroy()` 호출 → 새 컴포넌트 마운트 시 SDK가 아직 정리 중
- **해결**: `destroyPromise` 글로벌 동기화 패턴 도입
  - 언마운트 시 `destroy()` + 1.5초 대기 Promise 생성
  - 다음 마운트 시 `await destroyPromise` 후 `init()` 호출

### 문제 2: `stopSpeech is not a function` 에러
- **원인**: SDK destroy 후 메서드가 사라진 상태에서 호출 시도
- **해결**: `sendTextMessage`에서 `typeof KC.stopSpeech === 'function'` 방어 코드 추가

### 문제 3: 스크립트 재로드 시 글로벌 충돌
- **시도**: 매 전환마다 script 태그 제거 후 재삽입 → 실패
- **최종 해결**: `loadSDKOnce()`로 스크립트 1회만 로드, `destroy()` → `init()` 사이클로 관리

### 현재 미해결 이슈
- **페이지 전환 시 SDK가 destroy되는 근본 문제**: React 컴포넌트 언마운트 시 cleanup에서 `destroy()`를 호출하는 구조. 홈→게임 전환 시 이전 아바타 세션이 destroy되고 새 세션이 init되어야 하는데, SDK 내부 cleanup(~1300ms)과 새 init의 타이밍 충돌이 발생할 수 있음.

---

## 프로젝트 구조

```
src/
├── App.tsx                    # 앱 라우팅 (home/game 전환)
├── types.ts                   # 타입 정의 + 게임 설정 + Klleon SDK 타입
├── components/
│   ├── HomeScreen.tsx          # 게임 선택 홈
│   ├── WordChainGame.tsx       # 한글 끝말잇기 게임
│   ├── CapitalGame.tsx         # 수도 맞추기 게임
│   ├── EnglishChainGame.tsx    # 영어 끝말잇기 게임
│   ├── AvatarContainer.tsx     # Klleon 아바타 DOM 관리
│   ├── Header.tsx              # 게임 헤더 (라운드/점수)
│   ├── ChainArea.tsx           # 단어 체인 시각화
│   ├── InputArea.tsx           # 텍스트/음성 입력
│   ├── StartOverlay.tsx        # 게임 시작 오버레이
│   ├── ResultOverlay.tsx       # 결과 오버레이
│   └── GreetingOverlay.tsx     # 인사 오버레이
├── hooks/
│   ├── useKlleonSdk.ts         # Klleon SDK 라이프사이클
│   ├── useWordChain.ts         # 한글 끝말잇기 로직
│   ├── useCapitalQuiz.ts       # 수도 맞추기 로직
│   ├── useEnglishChain.ts      # 영어 끝말잇기 로직
│   └── useVoiceInput.ts        # Web Speech API 음성 입력
├── data/
│   ├── dictionary.ts           # 한글 사전 + 두음법칙 맵
│   ├── capitals.ts             # 나라/수도 데이터
│   ├── englishDict.ts          # 영어 사전
│   └── messages.ts             # 게임 메시지 템플릿
├── utils/
│   └── shareCard.ts            # 결과 공유 카드 생성
supabase/
└── functions/
    └── word-chain/index.ts     # AI 단어 생성/검증 Edge Function
```

---

## 환경 변수

| 변수 | 용도 |
|------|------|
| `VITE_KLLEON_SDK_KEY` | Klleon SDK 인증 키 |
| `VITE_KLLEON_AVATAR_ID` | 기본 아바타 ID (각 게임별로 오버라이드) |
| `VITE_SUPABASE_URL` | Supabase 프로젝트 URL |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | Supabase anon key |

---

## 디자인 시스템

- **폰트**: Noto Sans KR (400/600/700/900)
- **메인 컬러**: `#6C5CE7` (wordchain-primary)
- **게임별 테마 컬러**:
  - 끝말잇기: `#6C5CE7` (보라)
  - 수도 맞추기: `#0984E3` (파랑)
  - 영어 끝말잇기: `#00B894` (초록)
- **배경**: `#D2CEEC` (wordchain-bg)
- **커스텀 애니메이션**: float, pulseRing, popIn, slideUp, micPulse, hintGlow
