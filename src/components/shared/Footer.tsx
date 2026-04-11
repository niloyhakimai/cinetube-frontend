import Link from 'next/link';
import { blogHighlights, primaryNavLinks } from '@/content/site';

const supportLinks = [
  { href: '/contact', label: 'Contact' },
  { href: '/faq', label: 'FAQ' },
  { href: '/privacy', label: 'Privacy' },
  { href: '/terms', label: 'Terms' },
];

export default function Footer() {
  return (
    <footer className="border-t border-[var(--color-border)] bg-[var(--footer-bg)] backdrop-blur-xl">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-12 sm:px-6 lg:grid-cols-[1.2fr_1fr_1fr] lg:px-8">
        <div>
          <h2 className="text-2xl font-black uppercase tracking-[0.24em] text-red-500">CineTube</h2>
          <p className="mt-4 max-w-md text-sm leading-7 text-[var(--color-muted)]">
            A polished movie and series discovery platform built around streaming-style browsing, premium access, and community reviews.
          </p>
        </div>

        <div>
          <h3 className="text-sm font-black uppercase tracking-[0.24em] text-[var(--footer-heading)]">Navigate</h3>
          <div className="mt-4 space-y-3">
            {primaryNavLinks.map((link) => (
              <Link key={link.href} href={link.href} className="block text-sm text-[var(--color-muted)] transition-colors hover:text-[var(--footer-heading)]">
                {link.label}
              </Link>
            ))}
          </div>
        </div>

        <div>
          <h3 className="text-sm font-black uppercase tracking-[0.24em] text-[var(--footer-heading)]">Support</h3>
          <div className="mt-4 space-y-3">
            {supportLinks.map((link) => (
              <Link key={link.href} href={link.href} className="block text-sm text-[var(--color-muted)] transition-colors hover:text-[var(--footer-heading)]">
                {link.label}
              </Link>
            ))}
            <Link href="/blog" className="block text-sm text-[var(--color-muted)] transition-colors hover:text-[var(--footer-heading)]">
              Blog
            </Link>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl border-t border-[var(--color-border)] px-4 py-10 sm:px-6 lg:px-8">
        <div>
          <h3 className="text-sm font-black uppercase tracking-[0.24em] text-[var(--footer-heading)]">Editorial</h3>
          <div className="mt-4 grid gap-4 lg:grid-cols-3">
            {blogHighlights.map((item) => (
              <div key={item.slug}>
                <Link href="/blog" className="text-sm font-semibold text-[var(--footer-heading)] transition-colors hover:text-red-400">
                  {item.title}
                </Link>
                <p className="mt-1 text-xs leading-6 text-[var(--color-muted)]">{item.excerpt}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="border-t border-[var(--color-border)] px-4 py-5 text-center text-xs text-[var(--color-muted)]">
        &copy; {new Date().getFullYear()} CineTube. All rights reserved.
      </div>
    </footer>
  );
}
