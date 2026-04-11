"use client";

import { Suspense, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import AdvancedSearch from './AdvancedSearch';
import { useAuth } from '@/context/AuthContext';
import { discoveryLinks, primaryNavLinks } from '@/content/site';

function SearchFallback() {
  return <div className="h-11 w-full max-w-sm animate-pulse rounded-full border border-[var(--nav-border-strong)] bg-[var(--nav-shell-bg)]"></div>;
}

function isActiveNavLink(pathname: string, href: string) {
  if (href.startsWith('/#')) {
    return false;
  }

  if (href === '/') {
    return pathname === '/';
  }

  return pathname === href || pathname.startsWith(`${href}/`);
}
export default function Navbar() {
  const router = useRouter();
  const pathname = usePathname();
  const { user, logout, isHydrated } = useAuth();
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isDiscoverOpen, setIsDiscoverOpen] = useState(false);
  const navRef = useRef<HTMLElement | null>(null);
  const desktopCoreLinks = primaryNavLinks.filter((link) => !['/#pricing', '/about'].includes(link.href));
  const desktopOverflowLinks = primaryNavLinks.filter((link) => ['/#pricing', '/about'].includes(link.href));

  const closeMenus = () => {
    setIsMobileOpen(false);
    setIsSearchOpen(false);
    setIsProfileOpen(false);
    setIsDiscoverOpen(false);
  };

  const handleLogout = () => {
    logout();
    closeMenus();
    toast.success('Logged out successfully!');
    router.push('/login');
  };

  useEffect(() => {
    document.documentElement.dataset.theme = 'dark';
    document.documentElement.style.colorScheme = 'dark';
    try {
      window.localStorage.removeItem('cinetube-theme');
    } catch (error) {
      // Ignore storage access issues and keep the navbar usable.
    }

    const handlePointerDown = (event: MouseEvent) => {
      if (!navRef.current?.contains(event.target as Node)) {
        closeMenus();
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        closeMenus();
      }
    };

    document.addEventListener('mousedown', handlePointerDown);
    window.addEventListener('keydown', handleEscape);

    return () => {
      document.removeEventListener('mousedown', handlePointerDown);
      window.removeEventListener('keydown', handleEscape);
    };
  }, []);

  return (
    <nav ref={navRef} className="fixed inset-x-0 top-0 z-50 bg-transparent">
      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between gap-2 px-4 sm:px-6 lg:px-8">
        <div className="relative z-20 flex min-w-0 flex-1 items-center gap-3 md:flex-none lg:gap-4 xl:gap-5">
          <Link href="/" className="shrink-0 leading-none text-[1.4rem] font-black uppercase tracking-[0.08em] text-red-500 sm:text-[1.5rem] sm:tracking-[0.1em] lg:text-[1.55rem] lg:tracking-[0.11em] xl:text-[1.7rem] xl:tracking-[0.12em] 2xl:text-[1.82rem] 2xl:tracking-[0.13em]">
            CineTube
          </Link>

          <div className="hidden shrink-0 items-center gap-0.5 rounded-full border border-[var(--nav-border-strong)] bg-[var(--nav-pill-bg)] p-1.5 shadow-[0_20px_45px_rgba(0,0,0,0.2)] backdrop-blur-xl lg:flex">
            {desktopCoreLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`whitespace-nowrap rounded-full px-2.5 py-2 text-[12px] font-semibold transition-all xl:px-3 xl:text-[13px] 2xl:px-4 2xl:text-sm ${
                  isActiveNavLink(pathname, link.href)
                    ? 'bg-red-600 text-white shadow-[0_0_18px_rgba(229,9,20,0.24)]'
                    : 'text-[var(--nav-muted)] hover:bg-[var(--nav-hover-bg)] hover:text-[var(--nav-foreground)]'
                }`}
              >
                {link.label}
              </Link>
            ))}

            <div
              className="relative z-50"
              onMouseEnter={() => {
                setIsDiscoverOpen(true);
                setIsProfileOpen(false);
              }}
              onMouseLeave={() => setIsDiscoverOpen(false)}
            >
              <button
                type="button"
                onClick={() => setIsDiscoverOpen((current) => !current)}
                className={`flex min-w-[4.7rem] items-center justify-center gap-1.5 whitespace-nowrap rounded-full px-2.5 py-2 text-[12px] font-semibold transition-all xl:min-w-[4.9rem] xl:px-3 xl:text-[13px] 2xl:min-w-[7.2rem] 2xl:px-4 2xl:text-sm ${
                  isDiscoverOpen
                    ? 'bg-[var(--nav-hover-bg)] text-[var(--nav-foreground)]'
                    : 'text-[var(--nav-muted)] hover:bg-[var(--nav-hover-bg)] hover:text-[var(--nav-foreground)]'
                }`}
              >
                <span className="hidden 2xl:inline">Discover</span>
                <span className="inline 2xl:hidden">More</span>
                <svg
                  className={`h-4 w-4 shrink-0 transition-transform ${isDiscoverOpen ? 'rotate-180 text-[var(--nav-foreground)]' : 'text-[var(--nav-muted)]'}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {isDiscoverOpen && (
                <div className="absolute left-1/2 top-full z-[130] w-[360px] -translate-x-1/2 pt-4">
                  <div className="overflow-hidden rounded-[28px] border border-[var(--nav-border-strong)] bg-[var(--nav-panel-bg)] p-3 shadow-[0_32px_90px_rgba(0,0,0,0.38)] backdrop-blur-2xl">
                    {discoveryLinks.map((link) => (
                      <Link
                        key={link.href}
                        href={link.href}
                        onClick={closeMenus}
                        className="block rounded-2xl px-4 py-3 transition-colors hover:bg-[var(--nav-hover-bg)]"
                      >
                        <p className="font-bold text-[var(--nav-foreground)]">{link.label}</p>
                        <p className="mt-1 text-sm leading-6 text-[var(--nav-muted)]">{link.description}</p>
                      </Link>
                    ))}

                    <div className="2xl:hidden">
                      <div className="mx-2 my-2 border-t border-[var(--nav-border-strong)]" />
                      {desktopOverflowLinks.map((link) => (
                        <Link
                          key={link.href}
                          href={link.href}
                          onClick={closeMenus}
                          className="block rounded-2xl px-4 py-3 transition-colors hover:bg-[var(--nav-hover-bg)]"
                        >
                          <p className="font-bold text-[var(--nav-foreground)]">{link.label}</p>
                        </Link>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="hidden min-w-0 flex-1 items-center justify-end gap-2 md:flex lg:gap-3">
          <div
            className="relative z-10 w-full max-w-[170px] lg:max-w-[180px] xl:max-w-[220px] 2xl:max-w-[320px]"
            onMouseEnter={() => setIsDiscoverOpen(false)}
            onFocusCapture={() => setIsDiscoverOpen(false)}
          >
            <Suspense fallback={<SearchFallback />}>
              <AdvancedSearch />
            </Suspense>
          </div>

          {!isHydrated ? (
            <div className="h-10 w-24 rounded-full bg-white/10 animate-pulse"></div>
          ) : user ? (
            <div className="relative">
              <button
                type="button"
                onClick={() => {
                  setIsProfileOpen((current) => !current);
                  setIsDiscoverOpen(false);
                }}
                className="flex h-11 w-11 items-center justify-center overflow-hidden rounded-full border border-red-500/35 bg-red-600 text-lg font-black text-white shadow-[0_0_24px_rgba(229,9,20,0.2)] transition-transform hover:scale-[1.02]"
              >
                {user.avatarUrl ? (
                  <img src={user.avatarUrl} alt={user.name} className="h-full w-full object-cover" />
                ) : (
                  user.name.charAt(0).toUpperCase()
                )}
              </button>

              {isProfileOpen && (
                <div className="absolute right-0 top-full z-[140] mt-4 w-72 overflow-hidden rounded-[28px] border border-[var(--nav-border-strong)] bg-[var(--nav-panel-bg)] p-2 shadow-[0_34px_95px_rgba(0,0,0,0.38)] backdrop-blur-2xl">
                  <div className="border-b border-[var(--color-border)] px-4 py-4">
                    <p className="truncate font-bold text-[var(--nav-foreground)]">{user.name}</p>
                    <p className="truncate text-sm text-[var(--color-muted)]">{user.email}</p>
                  </div>
                  <Link href="/profile" onClick={closeMenus} className="mt-1 block rounded-2xl px-4 py-3 text-sm font-medium text-[var(--nav-muted)] transition-colors hover:bg-[var(--nav-hover-bg)] hover:text-[var(--nav-foreground)]">
                    My Profile
                  </Link>
                  <Link href="/watchlist" onClick={closeMenus} className="block rounded-2xl px-4 py-3 text-sm font-medium text-[var(--nav-muted)] transition-colors hover:bg-[var(--nav-hover-bg)] hover:text-[var(--nav-foreground)]">
                    My Watchlist
                  </Link>
                  {user.role !== 'USER' && (
                    <Link href="/admin" onClick={closeMenus} className="block rounded-2xl px-4 py-3 text-sm font-medium text-[var(--nav-muted)] transition-colors hover:bg-[var(--nav-hover-bg)] hover:text-[var(--nav-foreground)]">
                      Dashboard
                    </Link>
                  )}
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="mt-1 block w-full rounded-2xl px-4 py-3 text-left text-sm font-medium text-red-400 transition-colors hover:bg-red-500/10"
                  >
                    Sign Out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <Link href="/login" className="primary-button shrink-0 whitespace-nowrap !px-5 !py-3 text-sm">
              Sign In
            </Link>
          )}
        </div>

        <div className="ml-auto flex shrink-0 items-center justify-end gap-1.5 md:hidden">
          <button
            type="button"
            onClick={() => {
              setIsSearchOpen((current) => !current);
              setIsMobileOpen(false);
            }}
            className="secondary-button !rounded-full !px-3 !py-2"
          >
            Search
          </button>
          <button
            type="button"
            onClick={() => {
              setIsMobileOpen((current) => !current);
              setIsSearchOpen(false);
            }}
            className="secondary-button !rounded-full !px-3 !py-2"
          >
            Menu
          </button>
        </div>
      </div>

      {isSearchOpen && (
        <div className="border-t border-[var(--color-border)] bg-[var(--nav-drawer-bg)] px-4 py-4 backdrop-blur-xl md:hidden">
          <Suspense fallback={<SearchFallback />}>
            <AdvancedSearch />
          </Suspense>
        </div>
      )}

      {isMobileOpen && (
        <div className="border-t border-[var(--color-border)] bg-[var(--nav-drawer-bg)] px-4 py-4 backdrop-blur-xl md:hidden">
          <div className="space-y-2">
            {primaryNavLinks.map((link) => (
              <Link key={link.href} href={link.href} onClick={closeMenus} className="block rounded-2xl px-4 py-3 font-semibold text-[var(--nav-muted)] transition-colors hover:bg-[var(--nav-hover-bg)] hover:text-[var(--nav-foreground)]">
                {link.label}
              </Link>
            ))}

            <div className="surface-panel p-3">
              <p className="px-2 pb-2 text-xs font-black uppercase tracking-[0.24em] text-red-400">Discover</p>
              {discoveryLinks.map((link) => (
                <Link key={link.href} href={link.href} onClick={closeMenus} className="block rounded-xl px-3 py-3 text-sm text-[var(--nav-muted)] transition-colors hover:bg-[var(--nav-hover-bg)] hover:text-[var(--nav-foreground)]">
                  {link.label}
                </Link>
              ))}
            </div>

            {user ? (
              <div className="surface-panel p-3">
                <p className="px-2 pb-3 text-sm text-[var(--nav-foreground)]">{user.name}</p>
                <Link href="/profile" onClick={closeMenus} className="block rounded-xl px-3 py-3 text-sm text-[var(--nav-muted)] transition-colors hover:bg-[var(--nav-hover-bg)] hover:text-[var(--nav-foreground)]">
                  My Profile
                </Link>
                <Link href="/watchlist" onClick={closeMenus} className="block rounded-xl px-3 py-3 text-sm text-[var(--nav-muted)] transition-colors hover:bg-[var(--nav-hover-bg)] hover:text-[var(--nav-foreground)]">
                  My Watchlist
                </Link>
                {user.role !== 'USER' && (
                  <Link href="/admin" onClick={closeMenus} className="block rounded-xl px-3 py-3 text-sm text-[var(--nav-muted)] transition-colors hover:bg-[var(--nav-hover-bg)] hover:text-[var(--nav-foreground)]">
                    Dashboard
                  </Link>
                )}
                <button type="button" onClick={handleLogout} className="mt-2 w-full rounded-xl bg-red-600 px-4 py-3 text-left font-semibold text-white transition-colors hover:bg-red-700">
                  Sign Out
                </button>
              </div>
            ) : (
              <Link href="/login" onClick={closeMenus} className="primary-button w-full justify-center">
                Sign In
              </Link>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
