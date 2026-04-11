"use client";

import { useEffect, useMemo, useRef, useState } from 'react';
import { usePathname } from 'next/navigation';
import { api } from '@/lib/axios';
import { useAuth } from '@/context/AuthContext';

type AssistantMessage = {
  role: 'assistant' | 'user';
  text: string;
  recommendations?: string[];
  suggestions?: string[];
};

type AssistantResponse = {
  source: 'groq' | 'fallback';
  message: string;
  suggestions: string[];
  recommendations?: Array<{
    id: string;
    title: string;
    href: string;
  }>;
};

const HIDDEN_PATH_PREFIXES = ['/login', '/register', '/forgot-password', '/reset-password', '/admin', '/checkout', '/movie-checkout', '/subscribe'];

function isHiddenPath(pathname: string) {
  return HIDDEN_PATH_PREFIXES.some((prefix) => pathname.startsWith(prefix));
}

function getQuickPrompts(pathname: string) {
  const prompts = [
    'What should I watch next?',
    'Which premium plan fits me best?',
    'Show me something top rated tonight.',
  ];

  if (pathname.startsWith('/movies/')) {
    prompts.unshift('Give me a quick review summary for this title.');
  } else {
    prompts.unshift('Help me navigate the catalog.');
  }

  return prompts;
}

function labelSuggestionRoute(route: string) {
  if (route.startsWith('/movies/')) {
    return 'This title';
  }

  if (route.startsWith('/series/')) {
    return 'This series';
  }

  const labels: Record<string, string> = {
    '/explore': 'Explore',
    '/movies': 'Movies',
    '/series': 'Series',
    '/profile': 'Profile',
    '/#pricing': 'Plans',
    '/subscribe/monthly': 'Monthly plan',
    '/subscribe/yearly': 'Yearly plan',
  };

  return labels[route] || route.replace(/^\//, '') || 'Home';
}

function formatAssistantResponse(response: AssistantResponse) {
  return {
    role: 'assistant' as const,
    text: response.message.trim(),
    recommendations: response.recommendations?.slice(0, 3).map((item) => item.title) || [],
    suggestions: response.suggestions?.slice(0, 3).map(labelSuggestionRoute) || [],
  };
}

function buildOfflineAssistantResponse(message: string, pathname: string): AssistantResponse {
  const lower = message.toLowerCase();
  const onMoviePage = pathname.startsWith('/movies/');

  if (/plan|price|pricing|subscription|premium/.test(lower)) {
    return {
      source: 'fallback',
      message: 'Premium help is still available. Monthly works best if you want flexibility, ar yearly plan usually gives better value if you watch regularly.',
      suggestions: ['/#pricing', '/subscribe/monthly', '/subscribe/yearly'],
      recommendations: [],
    };
  }

  if (/where|navigate|page|route|kothay|kothae|jabo/.test(lower)) {
    return {
      source: 'fallback',
      message: 'Quick route map: Explore for filters, Movies for film-only browsing, Series for TV discovery, ar Profile-e tomar personal activity thakbe.',
      suggestions: ['/explore', '/movies', '/series'],
      recommendations: [],
    };
  }

  if (onMoviePage && /summary|review|audience|opinion|ki bolche/.test(lower)) {
    return {
      source: 'fallback',
      message: 'This title page already has an AI review snapshot section. Approved reviews barle summary aro sharp hobe, ar niche audience reviews-o dekhte parbe.',
      suggestions: [pathname, '/explore'],
      recommendations: [],
    };
  }

  if (/hi|hello|hey|bro/.test(lower)) {
    return {
      source: 'fallback',
      message: 'I can still help with routes, plans, and what to watch next even while the live assistant is unstable. Tell me your mood and I will guide you.',
      suggestions: ['/explore', '/movies', '/#pricing'],
      recommendations: [],
    };
  }

  return {
    source: 'fallback',
    message: onMoviePage
      ? 'Live assistant is taking a break, but this page still gives you trailer access, audience reviews, and an AI snapshot to help you decide fast.'
      : 'Live assistant is temporarily unavailable, but you can keep browsing through Explore, Movies, Series, and the pricing section without losing momentum.',
    suggestions: onMoviePage ? [pathname, '/explore', '/movies'] : ['/explore', '/movies', '/series'],
    recommendations: [],
  };
}

export default function FloatingAssistant() {
  const pathname = usePathname();
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [lastSource, setLastSource] = useState<'groq' | 'fallback'>('fallback');
  const [messages, setMessages] = useState<AssistantMessage[]>([
    {
      role: 'assistant',
      text: 'Need help finding something to watch? I can suggest titles, explain plans, and guide you around CineTube.',
    },
  ]);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const quickPrompts = useMemo(() => getQuickPrompts(pathname), [pathname]);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const frame = window.requestAnimationFrame(() => {
      messagesEndRef.current?.scrollIntoView({ block: 'end', behavior: 'smooth' });
    });

    return () => window.cancelAnimationFrame(frame);
  }, [isLoading, isOpen, messages]);

  if (!pathname || isHiddenPath(pathname)) {
    return null;
  }

  const handleSend = async (message: string) => {
    const trimmed = message.trim();
    if (!trimmed || isLoading) {
      return;
    }

    setMessages((current) => [...current, { role: 'user', text: trimmed }]);
    setInput('');
    setIsLoading(true);

    try {
      const mediaId = pathname.startsWith('/movies/') ? pathname.split('/').pop() : undefined;
      const response = await api.post<AssistantResponse>('/ai/chat', {
        message: trimmed,
        context: {
          pathname,
          mediaId,
        },
      });

      setLastSource(response.data.source);
      setMessages((current) => [
        ...current,
        formatAssistantResponse(response.data),
      ]);
    } catch {
      const offlineResponse = buildOfflineAssistantResponse(trimmed, pathname);
      setLastSource('fallback');
      setMessages((current) => [
        ...current,
        formatAssistantResponse(offlineResponse),
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  // Check if conversation has started (more than 1 message means user interacted)
  const isChatStarted = messages.length > 1;

  return (
    <div className="fixed inset-x-4 bottom-4 z-[80] flex justify-end sm:inset-x-auto sm:bottom-6 sm:right-6">
      {isOpen ? (
        <div className="assistant-panel flex max-h-[78svh] w-full min-h-0 flex-col overflow-hidden rounded-2xl bg-[#0a0a0c] sm:h-[560px] sm:w-[24rem]">
          
          {/* Header - added shrink-0 to prevent squashing */}
          <div className="flex shrink-0 items-center justify-between border-b border-[var(--color-border)] bg-[linear-gradient(180deg,rgba(20,20,22,0.98),rgba(10,10,12,0.94))] px-5 py-4">
            <div>
              <p className="text-sm font-black uppercase tracking-[0.24em] text-red-400">CineTube AI</p>
              <p className="mt-1 text-sm text-[var(--color-muted)]">
                {user ? 'Personalized assistant' : 'Guest assistant'}
              </p>
              <p className={`mt-2 inline-flex rounded-full border px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.18em] ${
                lastSource === 'groq'
                  ? 'border-emerald-500/30 bg-emerald-500/12 text-emerald-300'
                  : 'border-white/10 bg-white/[0.06] text-[var(--color-muted)]'
              }`}>
                {lastSource === 'groq' ? 'Live Groq' : 'Fallback ready'}
              </p>
            </div>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="secondary-button !rounded-full !px-3 !py-2"
            >
              Close
            </button>
          </div>

          {/* Quick Prompts - Hide once user starts chatting to give more space */}
          {!isChatStarted && (
            <div className="shrink-0 border-b border-[var(--color-border)] bg-black/25 px-5 py-3 transition-all duration-300">
              <div className="flex flex-wrap gap-2">
                {quickPrompts.map((prompt) => (
                  <button
                    key={prompt}
                    type="button"
                    onClick={() => handleSend(prompt)}
                    disabled={isLoading}
                    className="secondary-button !justify-start !rounded-2xl !px-3 !py-2 text-left text-xs leading-5 whitespace-normal"
                  >
                    {prompt}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Chat Messages Area - flex-1 and min-h-0 so it scrolls properly */}
          <div className="assistant-scrollbar flex min-h-0 flex-1 flex-col gap-4 overflow-x-hidden overflow-y-auto bg-[radial-gradient(circle_at_top,rgba(229,9,20,0.08),transparent_34%)] px-5 py-4">
            {messages.map((message, index) => (
              <div
                key={`${message.role}-${index}`}
                className={`w-full min-w-0 max-w-[90%] rounded-2xl px-4 py-3 text-sm leading-6 ${
                  message.role === 'assistant'
                    ? 'assistant-bubble text-white'
                    : 'ml-auto bg-red-600 text-white'
                }`}
              >
                <p className="whitespace-pre-line break-words">{message.text}</p>
                
                {/* Assistant Recommendations */}
                {message.role === 'assistant' && Boolean(message.recommendations?.length) && (
                  <div className="mt-4 rounded-2xl border border-white/[0.08] bg-black/20 px-3 py-3">
                    <p className="text-[11px] font-black uppercase tracking-[0.18em] text-red-300">Picks</p>
                    <div className="mt-2 flex flex-col gap-2">
                      {message.recommendations?.map((item) => (
                        <p key={item} className="text-sm leading-6 text-white/90">
                          {item}
                        </p>
                      ))}
                    </div>
                  </div>
                )}

                {/* AI inline suggestions inside message */}
                {message.role === 'assistant' && Boolean(message.suggestions?.length) && (
                  <div className="mt-4 flex flex-wrap gap-2">
                    {message.suggestions?.map((item) => (
                      <span
                        key={item}
                        className="rounded-full border border-white/10 bg-white/[0.06] px-3 py-1.5 text-[11px] font-semibold text-[var(--color-muted)]"
                      >
                        {item}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            ))}
            {isLoading && (
              <div className="assistant-bubble max-w-[88%] rounded-2xl px-4 py-3 text-sm text-[var(--color-muted)]">
                Thinking...
              </div>
            )}
            <div ref={messagesEndRef} className="h-1 shrink-0" />
          </div>

          {/* Input Form - Added shrink-0 and relative positioning to prevent it from hiding under chat */}
          <form
            onSubmit={(event) => {
              event.preventDefault();
              handleSend(input);
            }}
            className="relative z-10 shrink-0 border-t border-[var(--color-border)] bg-[rgba(10,10,12,0.98)] px-4 py-4"
          >
            <div className="flex items-center gap-2 sm:gap-3">
              <input
                value={input}
                onChange={(event) => setInput(event.target.value)}
                disabled={isLoading}
                placeholder="Ask about titles, plans, or navigation..."
                className="input-shell min-w-0 flex-1 !border-white/10 !bg-[#101014]"
              />
              <button type="submit" disabled={isLoading} className="primary-button shrink-0 !px-5 !py-3">
                Send
              </button>
            </div>
          </form>
          
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className="primary-button border border-red-400/20 shadow-[0_0_28px_rgba(229,9,20,0.32)] backdrop-blur-md"
        >
          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-4l-4 4v-4z" />
          </svg>
          AI Assistant
        </button>
      )}
    </div>
  );
}