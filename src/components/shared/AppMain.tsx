"use client";

import { usePathname } from "next/navigation";

const OVERLAY_NAVBAR_ROUTES = new Set([
  "/",
  "/about",
  "/blog",
  "/contact",
  "/faq",
  "/privacy",
  "/terms",
]);

function shouldOverlayNavbar(pathname: string) {
  return OVERLAY_NAVBAR_ROUTES.has(pathname);
}

export default function AppMain({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const pathname = usePathname();
  const mainClassName = pathname && shouldOverlayNavbar(pathname) ? "grow" : "grow pt-20";

  return <main className={mainClassName}>{children}</main>;
}
