# PRD: 잼톡(JamTalk) — AI 미니게임 플랫폼

## 1. 제품 개요

**제품명**: 잼톡 (JamTalk)
**한 줄 설명**: 재미있는 대화가 톡! 톡! 터지는 AI 교육용 미니게임 플랫폼
**대상 사용자**: 어린이/학생 (한국어 사용자)  
**핵심 가치**: 디지털 휴먼 아바타와의 상호작용을 통한 재미있는 학습 경험

---

## 2. 핵심 기능

### 2.1 디지털 휴먼 아바타 (Klleon SDK)
- 각 게임/화면마다 고유한 아바타 캐릭터 표시
- 게임 진행 중 TTS(Text-to-Speech)로 음성 안내
- 상태별 표정 변화: thinking, happy, surprised, sad, waiting, celebrating, lose
- SDK 라이프사이클: init → ready → (게임 진행) → destroy

### 2.2 홈 화면
- 아바타가 표시되는 좌측 영역
- 3종 게임 선택 버튼이 있는 우측 영역
- 반응형 레이아웃 (모바일: 상하 배치, 데스크탑: 좌우 배치)

### 2.3 게임 1: 한글 끝말잇기 🔤
- **규칙**: AI가 먼저 단어를 말하면, 플레이어가 끝 글자로 시작하는 단어를 이어감
- **특수 규칙**: 두음법칙 적용 (ㄹ→ㄴ, ㄴ→ㅇ 등)
- **라운드**: 5라운드
- **점수**: 각 단어 성공 시 1점 (AI, 플레이어 모두)
- **검증**: 로컬 사전 우선 → Gemini AI 폴백 검증
- **AI 난이도 조절**: 3~5라운드 중 1~2라운드에서 AI가 의도적으로 패배
- **힌트**: 10초 무응답 시 자동 힌트, 수동 힌트 버튼
- **게임 플로우**:
  1. Start: 게임 시작 오버레이
  2. Greeting: 플레이어 이름 입력
  3. Playing: 실제 게임 진행
  4. Result: 결과 표시 + 공유

### 2.4 게임 2: 수도 맞추기 🌍
- **규칙**: 나라 이름과 국기를 보고 수도를 맞춤
- **라운드**: 10라운드
- **점수**: 정답 10점, 힌트 사용 후 정답 5점
- **힌트**: 수도 초성 공개 (예: 서울 → "ㅅㅇ")
- **데이터**: 로컬 JSON (외부 API 불필요)

### 2.5 게임 3: 영어 끝말잇기 🇺🇸
- **규칙**: 영어 단어의 마지막 글자로 시작하는 단어를 이어감
- **라운드**: 5라운드
- **AI 전략**: 쉬운 끝글자(e, s, t 등) 단어를 우선 선택하여 플레이어에게 유리하게
- **AI 난이도**: 3~5라운드 후 AI가 패배
- **검증**: 로컬 영어 사전 기반
- **힌트**: 카테고리 힌트 제공

---

## 3. 기술 아키텍처

### 3.1 프론트엔드
- **프레임워크**: React 18 + TypeScript
- **빌드**: Vite
- **스타일링**: Tailwind CSS + shadcn/ui
- **상태 관리**: React hooks (useState, useRef, useCallback)
- **라우팅**: 없음 (단일 페이지, 상태 기반 화면 전환)

### 3.2 백엔드
- **플랫폼**: Supabase (Lovable Cloud)
- **Edge Function**: `word-chain` — Gemini AI를 통한 한글 단어 생성/검증
  - AI Gateway: `https://ai.gateway.lovable.dev/v1/chat/completions`
  - Tool calling 방식으로 구조화된 응답

### 3.3 외부 SDK
- **Klleon SDK v1.3.0**: 디지털 휴먼 아바타
  - CDN: `https://web.sdk.klleon.io/1.3.0/klleon-chat.umd.js`
  - 인증: SDK Key + Avatar ID
  - 주요 메서드: `init()`, `destroy()`, `echo()`, `stopSpeech()`
  - 이벤트: `onStatusEvent` (AVATAR_READY, AVATAR_LOADING, AVATAR_ERROR, DISCONNECTED)

### 3.4 핵심 기술 제약사항
1. **Klleon SDK는 SPA 전환에 취약**: destroy→init 사이 ~1.5초 대기 필요
2. **`<avatar-container>` 엘리먼트**: index.html에 정적 선언 필수 (SDK가 커스텀 엘리먼트를 찾음)
3. **SDK 메서드 방어 코드 필수**: destroy 후 메서드 참조가 사라질 수 있음
4. **Lovable 프리뷰에서 SDK 비활성화**: hostname에 `id-preview--` 포함 시 mockMode

---

## 4. 데이터 모델

### 4.1 게임 설정 (`types.ts`)
```typescript
type GameId = 'wordchain' | 'capital' | 'english';

interface GameConfig {
  id: GameId;
  name: string;        // 한글 이름
  nameEn: string;      // 영문 이름
  emoji: string;       // 이모지
  description: string; // 설명
  themeColor: string;  // 테마 색상 hex
  themeGradient: string;
  avatarId: string;    // Klleon 아바타 ID
}
```

### 4.2 게임 상태
```typescript
type GamePhase = 'start' | 'greeting' | 'playing' | 'result';
type AppPhase = 'home' | 'game';
```

### 4.3 DB 테이블
- 현재 없음 (모든 데이터 클라이언트 로컬)

---

## 5. UI/UX 사양

### 5.1 레이아웃
- 최대 너비: `max-w-5xl` (1024px)
- 높이: `100dvh` (dynamic viewport height)
- 게임 화면: Header + Avatar + ChainArea + InputArea

### 5.2 디자인 토큰
- 폰트: Noto Sans KR
- 배경: `#D2CEEC`
- 게임별 테마: 보라(끝말잇기), 파랑(수도), 초록(영어)

### 5.3 반응형
- 홈: `md:flex-row` (768px+에서 좌우 배치)
- 게임: 단일 컬럼 (모바일 최적화)

---

## 6. 알려진 이슈 및 개선 필요사항

### 미해결
- [ ] 페이지 전환 시 SDK destroy/init 타이밍 안정성 개선
- [ ] 게임 결과 DB 저장 (리더보드)
- [ ] 사용자 인증 (현재 없음)

### 잠재적 개선
- [ ] 게임 추가 확장 (새 게임 타입)
- [ ] 아바타 표정 애니메이션 세분화
- [ ] 오프라인 모드 (SDK 없이 텍스트만)
- [ ] 다국어 지원
