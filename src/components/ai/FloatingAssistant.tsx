"use client";

import { useMemo, useState } from 'react';
import { usePathname } from 'next/navigation';
import { api } from '@/lib/axios';
import { useAuth } from '@/context/AuthContext';

type AssistantMessage = {
  role: 'assistant' | 'user';
  text: string;
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
  const blocks = [response.message.trim()];

  if (response.recommendations && response.recommendations.length > 0) {
    blocks.push(`Picks: ${response.recommendations.slice(0, 3).map((item) => item.title).join(', ')}`);
  }

  if (response.suggestions && response.suggestions.length > 0) {
    blocks.push(`Try: ${response.suggestions.slice(0, 3).map(labelSuggestionRoute).join(' | ')}`);
  }

  return blocks.join('\n\n');
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

  const quickPrompts = useMemo(() => getQuickPrompts(pathname), [pathname]);

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
        { role: 'assistant', text: formatAssistantResponse(response.data) },
      ]);
    } catch {
      const offlineResponse = buildOfflineAssistantResponse(trimmed, pathname);
      setLastSource('fallback');
      setMessages((current) => [
        ...current,
        {
          role: 'assistant',
          text: formatAssistantResponse(offlineResponse),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-x-4 bottom-4 z-[80] flex justify-end sm:inset-x-auto sm:bottom-6 sm:right-6">
      {isOpen ? (
        <div className="assistant-panel flex max-h-[78svh] w-full flex-col overflow-hidden sm:h-[560px] sm:w-[24rem]">
          <div className="flex items-center justify-between border-b border-[var(--color-border)] bg-[linear-gradient(180deg,rgba(20,20,22,0.98),rgba(10,10,12,0.94))] px-5 py-4">
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

          <div className="border-b border-[var(--color-border)] bg-black/25 px-5 py-3">
            <div className="grid grid-cols-2 gap-2 sm:flex sm:flex-wrap">
              {quickPrompts.map((prompt) => (
                <button
                  key={prompt}
                  type="button"
                  onClick={() => handleSend(prompt)}
                  disabled={isLoading}
                  className="secondary-button !w-full !justify-start !rounded-2xl !px-3 !py-2 text-left text-xs leading-5 whitespace-normal sm:!w-auto sm:!rounded-full"
                >
                  {prompt}
                </button>
              ))}
            </div>
          </div>

          <div className="flex-1 space-y-4 overflow-y-auto bg-[radial-gradient(circle_at_top,rgba(229,9,20,0.08),transparent_34%)] px-5 py-4">
            {messages.map((message, index) => (
              <div
                key={`${message.role}-${index}`}
                className={`max-w-[88%] rounded-2xl px-4 py-3 text-sm leading-6 whitespace-pre-line ${
                  message.role === 'assistant'
                    ? 'assistant-bubble text-white'
                    : 'ml-auto bg-red-600 text-white'
                }`}
              >
                {message.text}
              </div>
            ))}
            {isLoading && (
              <div className="assistant-bubble max-w-[88%] rounded-2xl px-4 py-3 text-sm text-[var(--color-muted)]">
                Thinking...
              </div>
            )}
          </div>

          <form
            onSubmit={(event) => {
              event.preventDefault();
              handleSend(input);
            }}
            className="border-t border-[var(--color-border)] bg-[rgba(10,10,12,0.98)] px-4 py-4"
          >
            <div className="flex items-end gap-2 sm:gap-3">
              <input
                value={input}
                onChange={(event) => setInput(event.target.value)}
                disabled={isLoading}
                placeholder="Ask about titles, plans, or navigation..."
                className="input-shell flex-1 !border-white/10 !bg-[#101014]"
              />
              <button type="submit" disabled={isLoading} className="primary-button shrink-0">
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
