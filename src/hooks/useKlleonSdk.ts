import { useState, useEffect, useCallback, useRef } from 'react';

const SDK_KEY = import.meta.env.VITE_KLLEON_SDK_KEY || '';

let destroyPromise: Promise<void> | null = null;

function isMockMode(): boolean {
  return !SDK_KEY || window.location.hostname.includes('id-preview--');
}

export function useKlleonSdk(avatarId: string) {
  const [isReady, setIsReady] = useState(false);
  const [sdkStatus, setSdkStatus] = useState<'loading' | 'ready' | 'error'>('loading');
  const [isSpeaking, setIsSpeaking] = useState(false);
  const mockMode = isMockMode();
  const avatarIdRef = useRef(avatarId);
  const isReadyRef = useRef(false);
  const speechEndResolveRef = useRef<(() => void) | null>(null);

  avatarIdRef.current = avatarId;

  useEffect(() => {
    if (mockMode) {
      setIsReady(true);
      setSdkStatus('ready');
      isReadyRef.current = true;
      return;
    }

    let cancelled = false;
    isReadyRef.current = false;

    async function initSDK() {
      try {
        // 1. Wait for previous cleanup to finish
        if (destroyPromise) {
          console.log('[SDK] Waiting for previous destroy...');
          await destroyPromise;
          destroyPromise = null;
        }
        if (cancelled) return;

        // 2. Wait for SDK script
        if (window.__klleonSDKReady) {
          await window.__klleonSDKReady;
        }
        if (cancelled) return;

        const KC = window.KlleonChat;
        if (!KC) {
          setSdkStatus('error');
          return;
        }

        // 3. Show container
        const el = document.getElementById('klleon-avatar');
        if (el) el.style.display = 'block';

        // 4. Init with new avatar
        console.log(`[SDK] init avatar_id: ${avatarIdRef.current}`);
        await KC.init({
          sdk_key: SDK_KEY,
          avatar_id: avatarIdRef.current,
        });

        if (cancelled) return;

        // 5. Handlers
        KC.onStatusEvent = (event: { type: string }) => {
          if (cancelled) return;
          if (event.type === 'AVATAR_ERROR' || event.type === 'DISCONNECTED') {
            setSdkStatus('error');
            isReadyRef.current = false;
          }
        };

        KC.onChatEvent = (event: { type: string }) => {
          if (cancelled) return;
          if (event.type === 'SPEECH_START') setIsSpeaking(true);
          if (event.type === 'SPEECH_END') {
            setIsSpeaking(false);
            if (speechEndResolveRef.current) {
              speechEndResolveRef.current();
              speechEndResolveRef.current = null;
            }
          }
        };

        setIsReady(true);
        setSdkStatus('ready');
        isReadyRef.current = true;
        console.log('[SDK] Ready');

      } catch (err) {
        console.error('[SDK] Init failed:', err);
        if (!cancelled) setSdkStatus('error');
      }
    }

    initSDK();

    // Cleanup: destroy + hide + clear DOM
    return () => {
      cancelled = true;
      setIsReady(false);
      setIsSpeaking(false);
      setSdkStatus('loading');
      isReadyRef.current = false;
      speechEndResolveRef.current = null;

      // Hide immediately
      const el = document.getElementById('klleon-avatar');
      if (el) {
        el.style.display = 'none';
      }

      // Destroy SDK session (async)
      const KC = window.KlleonChat;
      if (KC && typeof KC.destroy === 'function') {
        destroyPromise = (async () => {
          try {
            console.log('[SDK] Destroying...');
            await KC.destroy();
            console.log('[SDK] Destroyed');
          } catch {}
          // Clear old video/canvas after destroy
          const avatarEl = document.getElementById('klleon-avatar');
          if (avatarEl) avatarEl.innerHTML = '';
          // Wait for SDK internal cleanup
          await new Promise(r => setTimeout(r, 1500));
        })();
      }
    };
  }, [avatarId, mockMode]);

  const echo = useCallback((message: string, retries = 3) => {
    if (mockMode) return;
    if (!isReadyRef.current) {
      if (retries > 0) {
        setTimeout(() => echo(message, retries - 1), 500);
      }
      return;
    }
    const KC = window.KlleonChat;
    if (!KC) return;
    if (typeof KC.stopSpeech === 'function') {
      try { KC.stopSpeech(); } catch {}
    }
    if (typeof KC.echo === 'function') {
      try { KC.echo(message); } catch {}
    }
  }, [mockMode]);

  const echoAndWait = useCallback(async (message: string, fallbackMs = 15000): Promise<void> => {
    // Wait until SDK is ready (poll every 500ms, max 10s)
    if (!mockMode) {
      let waited = 0;
      while (!isReadyRef.current && waited < 10000) {
        await new Promise(r => setTimeout(r, 500));
        waited += 500;
      }
      console.log(`[SDK] echoAndWait: ready after ${waited}ms`);
    }

    return new Promise(resolve => {
      const timer = setTimeout(() => {
        speechEndResolveRef.current = null;
        resolve();
      }, fallbackMs);

      speechEndResolveRef.current = () => {
        clearTimeout(timer);
        resolve();
      };

      if (mockMode) {
        clearTimeout(timer);
        speechEndResolveRef.current = null;
        setTimeout(resolve, Math.min(message.length * 80, 5000));
        return;
      }

      // Direct SDK call (bypass echo retry since we already waited for ready)
      const KC = window.KlleonChat;
      if (KC) {
        if (typeof KC.stopSpeech === 'function') {
          try { KC.stopSpeech(); } catch {}
        }
        if (typeof KC.echo === 'function') {
          try { KC.echo(message); } catch {}
        }
      }
    });
  }, [mockMode]);

  const stopSpeech = useCallback(() => {
    if (mockMode || !isReadyRef.current) return;
    const KC = window.KlleonChat;
    if (KC && typeof KC.stopSpeech === 'function') {
      try { KC.stopSpeech(); } catch {}
    }
  }, [mockMode]);

  return { isReady, mockMode, isSpeaking, sdkStatus, echo, echoAndWait, stopSpeech };
}
