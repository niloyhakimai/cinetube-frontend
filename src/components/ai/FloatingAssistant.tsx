"use client";

import { useEffect, useMemo, useRef, useState } from 'react';
import { usePathname } from 'next/navigation';
import { api } from '@/lib/axios';
import { useAuth } from '@/context/AuthContext';

type AssistantMessage = {
  role: 'assistant' | 'user';
  text: string;
  recommendations?: Array<{
    id: string;
    title: string;
    href: string;
  }>;
  suggestions?: string[];
};

type ChatHistoryEntry = Pick<AssistantMessage, 'role' | 'text'>;

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

function normalizeRecommendationKey(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]/g, '');
}

function serializeRecommendationTitles(
  recommendations: Array<{ title: string }> | undefined,
) {
  return (recommendations || [])
    .map((item) => normalizeRecommendationKey(item.title))
    .filter(Boolean)
    .join('|');
}

function formatAssistantResponse(response: AssistantResponse) {
  const uniqueRecommendations = (response.recommendations || []).filter((item, index, items) => {
    const titleKey = normalizeRecommendationKey(item.title);

    return items.findIndex((entry) => normalizeRecommendationKey(entry.title) === titleKey) === index;
  });

  return {
    role: 'assistant' as const,
    text: response.message.trim(),
    recommendations: uniqueRecommendations.slice(0, 3),
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

    const history: ChatHistoryEntry[] = messages.slice(-6).map(({ role, text }) => ({
      role,
      text,
    }));
    const excludeMediaIds = messages
      .flatMap((entry) => entry.recommendations?.map((item) => item.id) || [])
      .slice(-12);
    const excludeTitles = messages
      .flatMap((entry) => entry.recommendations?.map((item) => item.title) || [])
      .slice(-20);

    setMessages((current) => [...current, { role: 'user', text: trimmed }]);
    setInput('');
    setIsLoading(true);

    try {
      const mediaId = pathname.startsWith('/movies/') ? pathname.split('/').pop() : undefined;
      const response = await api.post<AssistantResponse>('/ai/chat', {
        message: trimmed,
        history,
        excludeMediaIds,
        excludeTitles,
        context: {
          pathname,
          mediaId,
        },
      });

      setLastSource(response.data.source);
      setMessages((current) => {
        const formatted = formatAssistantResponse(response.data);
        const previousRecommendations = [...current]
          .reverse()
          .find((entry) => entry.role === 'assistant' && (entry.recommendations?.length || 0) > 0)
          ?.recommendations;
        const previousRecommendationTitles = serializeRecommendationTitles(previousRecommendations);
        const currentRecommendationTitles = serializeRecommendationTitles(formatted.recommendations);

        if (previousRecommendationTitles && currentRecommendationTitles && previousRecommendationTitles === currentRecommendationTitles) {
          formatted.recommendations = [];
        }

        return [...current, formatted];
      });
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
        <div className="assistant-panel flex max-h-[78svh] w-full min-h-0 flex-col overflow-hidden rounded-2xl sm:h-[560px] sm:w-[24rem]">
          <div className="flex shrink-0 items-center justify-between border-b border-[var(--color-border)] bg-[var(--assistant-header-bg)] px-5 py-4 backdrop-blur-xl">
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

          {!isChatStarted && (
            <div className="shrink-0 border-b border-[var(--color-border)] bg-[var(--assistant-section-bg)] px-5 py-3 transition-all duration-300">
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

          <div className="assistant-scrollbar flex min-h-0 flex-1 flex-col gap-4 overflow-x-hidden overflow-y-auto bg-[var(--assistant-chat-bg)] px-5 py-4">
            {messages.map((message, index) => (
              <div
                key={`${message.role}-${index}`}
                className={`w-full min-w-0 max-w-[90%] rounded-2xl px-4 py-3 text-sm leading-6 ${
                  message.role === 'assistant'
                    ? 'assistant-bubble text-[var(--assistant-foreground)]'
                    : 'ml-auto bg-red-600 text-white'
                }`}
              >
                <p className="whitespace-pre-line break-words">{message.text}</p>
                
                {message.role === 'assistant' && Boolean(message.recommendations?.length) && (
                  <div className="mt-4 rounded-2xl border border-[var(--assistant-chip-border)] bg-[var(--assistant-inline-bg)] px-3 py-3">
                    <p className="text-[11px] font-black uppercase tracking-[0.18em] text-red-300">Picks</p>
                    <div className="mt-2 flex flex-col gap-2">
                      {message.recommendations?.map((item) => (
                        <p key={item.id} className="text-sm leading-6">
                          {item.title}
                        </p>
                      ))}
                    </div>
                  </div>
                )}

                {message.role === 'assistant' && Boolean(message.suggestions?.length) && (
                  <div className="mt-4 flex flex-wrap gap-2">
                    {message.suggestions?.map((item) => (
                      <span
                        key={item}
                        className="rounded-full border border-[var(--assistant-chip-border)] bg-[var(--assistant-chip-bg)] px-3 py-1.5 text-[11px] font-semibold text-[var(--color-muted)]"
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

          <form
            onSubmit={(event) => {
              event.preventDefault();
              handleSend(input);
            }}
            className="relative z-10 shrink-0 border-t border-[var(--color-border)] bg-[var(--assistant-input-bg)] px-4 py-4 backdrop-blur-xl"
          >
            <div className="flex items-center gap-2 sm:gap-3">
              <input
                value={input}
                onChange={(event) => setInput(event.target.value)}
                disabled={isLoading}
                placeholder="Ask about titles, plans, or navigation..."
                className="input-shell min-w-0 flex-1 !border-[var(--assistant-field-border)] !bg-[var(--assistant-field-bg)]"
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
