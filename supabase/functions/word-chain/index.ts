// Supabase Edge Function: word-chain
// AI-powered Korean word generation and validation via Gemini

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const AI_GATEWAY = 'https://ai.gateway.lovable.dev/v1/chat/completions';

interface RequestBody {
  action: 'generate' | 'validate';
  lastChar?: string;
  word?: string;
  usedWords?: string[];
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { action, lastChar, word, usedWords = [] } = await req.json() as RequestBody;

    if (action === 'generate' && lastChar) {
      const response = await fetch(AI_GATEWAY, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'gemini-2.0-flash',
          messages: [
            {
              role: 'system',
              content: `당신은 한글 끝말잇기 게임을 하는 AI입니다.
규칙: "${lastChar}"(으)로 시작하는 한국어 단어를 하나 제안하세요.
- 초등학생이 알 수 있는 쉬운 단어만 사용
- 이미 사용된 단어: ${usedWords.join(', ')}
- 두음법칙 적용 가능 (예: 리→이, 녀→여)
반드시 tool을 사용하여 응답하세요.`,
            },
            { role: 'user', content: `"${lastChar}"(으)로 시작하는 단어를 말해주세요.` },
          ],
          tools: [{
            type: 'function',
            function: {
              name: 'suggest_word',
              description: '끝말잇기 단어를 제안합니다',
              parameters: {
                type: 'object',
                properties: {
                  word: { type: 'string', description: '제안할 단어' },
                  message: { type: 'string', description: '게임 메시지' },
                },
                required: ['word', 'message'],
              },
            },
          }],
          tool_choice: { type: 'function', function: { name: 'suggest_word' } },
        }),
      });

      const data = await response.json();
      const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];
      if (toolCall) {
        const args = JSON.parse(toolCall.function.arguments);
        return new Response(JSON.stringify(args), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      return new Response(JSON.stringify({ word: null, message: '단어를 생성할 수 없습니다.' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (action === 'validate' && word) {
      const response = await fetch(AI_GATEWAY, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'gemini-2.0-flash',
          messages: [
            {
              role: 'system',
              content: `당신은 한국어 단어 검증기입니다. 주어진 단어가 실제 한국어 단어인지 판별하세요.
반드시 tool을 사용하여 응답하세요.`,
            },
            { role: 'user', content: `"${word}"는 실제 한국어 단어인가요?` },
          ],
          tools: [{
            type: 'function',
            function: {
              name: 'validate_word',
              description: '단어의 유효성을 검증합니다',
              parameters: {
                type: 'object',
                properties: {
                  isValid: { type: 'boolean', description: '유효한 단어인지 여부' },
                  word: { type: 'string', description: '검증한 단어' },
                  message: { type: 'string', description: '검증 결과 메시지' },
                },
                required: ['isValid', 'word', 'message'],
              },
            },
          }],
          tool_choice: { type: 'function', function: { name: 'validate_word' } },
        }),
      });

      const data = await response.json();
      const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];
      if (toolCall) {
        const args = JSON.parse(toolCall.function.arguments);
        return new Response(JSON.stringify(args), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      // Fallback: accept the word
      return new Response(JSON.stringify({ isValid: true, word, message: '확인되었습니다.' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({ error: 'Invalid action' }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: String(error) }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
