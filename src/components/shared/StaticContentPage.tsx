import Link from 'next/link';

type StaticContentPageProps = {
  eyebrow: string;
  title: string;
  intro: string;
  sections: Array<{
    title: string;
    body: string[];
  }>;
};

export default function StaticContentPage({
  eyebrow,
  title,
  intro,
  sections,
}: StaticContentPageProps) {
  return (
    <div className="min-h-screen bg-[var(--color-background)] text-[var(--color-foreground)]">
      <section className="border-b border-[var(--color-border)] bg-[radial-gradient(circle_at_top,rgba(229,9,20,0.18),transparent_32%),linear-gradient(180deg,rgba(255,255,255,0.02),transparent)]">
        <div className="mx-auto max-w-6xl px-4 pb-20 pt-28 sm:px-6 sm:pb-24 sm:pt-32 lg:px-8">
          <span className="pill-label">{eyebrow}</span>
          <h1 className="mt-6 max-w-3xl text-4xl font-black tracking-tight sm:text-5xl">{title}</h1>
          <p className="mt-5 max-w-3xl text-lg leading-8 text-[var(--color-muted)]">{intro}</p>
        </div>
      </section>

      <section className="mx-auto grid max-w-6xl gap-10 px-4 py-14 sm:px-6 lg:grid-cols-[minmax(0,1fr)_320px] lg:px-8">
        <div className="space-y-6">
          {sections.map((section) => (
            <article key={section.title} className="surface-panel p-6 sm:p-8">
              <h2 className="text-2xl font-bold">{section.title}</h2>
              <div className="mt-4 space-y-4 text-[var(--color-muted)]">
                {section.body.map((paragraph) => (
                  <p key={paragraph} className="leading-7">
                    {paragraph}
                  </p>
                ))}
              </div>
            </article>
          ))}
        </div>

        <aside className="surface-panel h-fit p-6 sm:p-8 lg:sticky lg:top-28">
          <h2 className="text-xl font-bold">Explore More</h2>
          <p className="mt-3 text-sm leading-6 text-[var(--color-muted)]">
            Keep the browsing flow going with deeper discovery, plans, and editorial highlights.
          </p>
          <div className="mt-6 space-y-3">
            <Link href="/explore" className="secondary-button w-full justify-center">
              Explore Catalog
            </Link>
            <Link href="/#pricing" className="primary-button w-full justify-center">
              View Premium Plans
            </Link>
            <Link href="/faq" className="secondary-button w-full justify-center">
              Read FAQ
            </Link>
          </div>
        </aside>
      </section>
    </div>
  );
}
