export const primaryNavLinks = [
  { href: '/', label: 'Home' },
  { href: '/movies', label: 'Movies' },
  { href: '/series', label: 'Series' },
  { href: '/explore', label: 'Explore' },
  { href: '/#pricing', label: 'Plans' },
  { href: '/about', label: 'About' },
];

export const discoveryLinks = [
  { href: '/explore?sort=popularity', label: 'Trending Now', description: 'See what is pulling the biggest audience right now.' },
  { href: '/explore?sort=highest-rated', label: 'Top Rated', description: 'Browse the strongest audience-rated titles first.' },
  { href: '/explore?mediaType=MOVIE', label: 'Movies Only', description: 'Jump straight into film discovery with unified filters.' },
  { href: '/explore?mediaType=TV', label: 'Series Only', description: 'Switch to TV-focused browsing without changing the experience.' },
  { href: '/explore?rating=7', label: 'Critics Favorites', description: 'Filter down to titles with stronger audience signals.' },
];

export const commonGenres = [
  'Action',
  'Adventure',
  'Animation',
  'Comedy',
  'Crime',
  'Drama',
  'Fantasy',
  'Horror',
  'Mystery',
  'Romance',
  'Sci-Fi',
  'Thriller',
];

export const genreSpotlights = [
  {
    title: 'Pulse-Pounding Action',
    description: 'Explosive spectacle, revenge arcs, and crowd-pleasing set pieces for instant momentum.',
    href: '/explore?genre=Action&sort=popularity',
    accent: 'from-red-600/30 to-orange-500/10',
  },
  {
    title: 'Mind-Bending Sci-Fi',
    description: 'Parallel worlds, future tech, and high-concept twists for your late-night sessions.',
    href: '/explore?genre=Sci-Fi&sort=highest-rated',
    accent: 'from-cyan-500/20 to-blue-500/10',
  },
  {
    title: 'Character-Driven Drama',
    description: 'Award-caliber performances and emotional storytelling with lasting impact.',
    href: '/explore?genre=Drama&sort=highest-rated',
    accent: 'from-yellow-500/20 to-red-500/10',
  },
  {
    title: 'Mystery & Thriller',
    description: 'Twists, clues, and tense reveals for viewers who like staying one step behind.',
    href: '/explore?genre=Thriller&sort=most-reviewed',
    accent: 'from-fuchsia-500/15 to-red-500/10',
  },
];

export const platformStats = [
  { label: 'Curated Titles', value: '250+', note: 'Across local picks and synced discovery.' },
  { label: 'Community Reviews', value: '1.2K+', note: 'Audience sentiment keeps discovery honest.' },
  { label: 'Premium Access', value: '4K', note: 'Subscription-ready premium titles and rentals.' },
  { label: 'Discovery Paths', value: '10+', note: 'Genre, rating, explore, search, and editorial rails.' },
];

export const testimonials = [
  {
    name: 'Nadia Rahman',
    role: 'Frequent Weekend Viewer',
    quote: 'CineTube feels focused. I can go from discovery to reviews to checkout without losing context.',
  },
  {
    name: 'Sabbir Hasan',
    role: 'Series Marathon Fan',
    quote: 'The mix of trending titles, ratings, and watchlist tracking makes this feel way more polished than a typical student project.',
  },
  {
    name: 'Arif Mahmud',
    role: 'Premium Subscriber',
    quote: 'The premium path is clear, and the title pages actually help me decide if a movie is worth my time.',
  },
];

export const faqItems = [
  {
    question: 'What can I do with a free account?',
    answer: 'Free members can browse the catalog, read approved audience reviews, maintain a watchlist, and access free titles.',
  },
  {
    question: 'How does Premium work?',
    answer: 'Premium unlocks subscription-only titles, a cleaner viewing experience, and a faster path into paid content flows.',
  },
  {
    question: 'Can I rent or buy a title instead of subscribing?',
    answer: 'Yes. Premium movies support one-time rent or buy flows so users do not have to commit to a recurring plan.',
  },
  {
    question: 'Why are some reviews missing from a title page?',
    answer: 'Reviews pass through moderation first, so only approved reviews appear publicly on detail pages.',
  },
];

export const blogHighlights = [
  {
    slug: 'inside-cinetube-discovery',
    title: 'How CineTube Balances Editorial Picks With Audience Signals',
    excerpt: 'A look at how featured titles, reviews, and browsing filters work together to keep discovery useful.',
  },
  {
    slug: 'building-a-premium-experience',
    title: 'Designing A Premium Streaming Flow Without Losing Simplicity',
    excerpt: 'Why the subscription, rent, and buy paths need to feel connected instead of fragmented.',
  },
  {
    slug: 'community-review-moderation',
    title: 'Moderation, Spoilers, And Keeping Review Spaces Helpful',
    excerpt: 'A quick breakdown of why review approval matters to the long-term quality of movie discovery.',
  },
];

export const publicPageContent = {
  about: {
    eyebrow: 'About CineTube',
    title: 'A cinematic discovery platform built for modern browsing.',
    intro: 'CineTube brings together premium subscriptions, rentals, watchlists, reviews, and TMDB-powered discovery in one polished experience.',
    sections: [
      {
        title: 'What We Solve',
        body: [
          'Most movie platforms split discovery, community, and payments across disconnected surfaces. CineTube keeps them aligned so a viewer can move from curiosity to confidence to checkout without friction.',
          'The product is shaped around streaming-style browsing patterns: strong hero storytelling, quick comparisons, social proof from reviews, and a clear premium path.',
        ],
      },
      {
        title: 'What Makes It Strong',
        body: [
          'CineTube already supports authentication, watchlists, Stripe payments, review moderation, Google login, TMDB sync, and a multi-surface browsing flow.',
          'That foundation makes it a strong base for assignment requirements now and AI-driven discovery later.',
        ],
      },
    ],
  },
  contact: {
    eyebrow: 'Contact',
    title: 'Reach the CineTube team for support, feedback, or collaboration.',
    intro: 'Whether you found a bug, need account help, or want to talk product direction, this page gives users a clean support path.',
    sections: [
      {
        title: 'Support',
        body: [
          'Email: support@cinetube.com',
          'Response target: within 24 business hours for account and billing questions.',
        ],
      },
      {
        title: 'Partnerships',
        body: [
          'Email: partnerships@cinetube.com',
          'Use this channel for curation, editorial, and catalog collaboration ideas.',
        ],
      },
      {
        title: 'Office Hours',
        body: [
          'Monday to Friday, 10:00 AM to 6:00 PM (UTC+6).',
        ],
      },
    ],
  },
  faq: {
    eyebrow: 'FAQ',
    title: 'Common questions from viewers and subscribers.',
    intro: 'These answers focus on the decisions users ask about most often: accounts, premium access, reviews, and how title access works.',
    sections: faqItems.map((item) => ({
      title: item.question,
      body: [item.answer],
    })),
  },
  privacy: {
    eyebrow: 'Privacy',
    title: 'Clear data handling for accounts, viewing behavior, and billing flows.',
    intro: 'This static policy keeps the assignment complete while explaining the product’s current data boundaries in straightforward language.',
    sections: [
      {
        title: 'Account Data',
        body: [
          'CineTube stores the information needed to authenticate users, maintain profiles, and support subscription status.',
          'Passwords are stored as hashes rather than plain text.',
        ],
      },
      {
        title: 'Usage Signals',
        body: [
          'Watchlists, ratings, reviews, and content activity can be used to improve personalization and feature quality.',
        ],
      },
      {
        title: 'Payments',
        body: [
          'Payments are processed through Stripe, and CineTube stores the payment history needed for entitlement and account history.',
        ],
      },
    ],
  },
  terms: {
    eyebrow: 'Terms',
    title: 'Usage expectations for content, subscriptions, and community features.',
    intro: 'These terms cover the assignment’s production-style requirements with direct language that fits the current feature set.',
    sections: [
      {
        title: 'Account Responsibility',
        body: [
          'Users are responsible for keeping their login credentials secure and for activity performed through their accounts.',
        ],
      },
      {
        title: 'Premium Access',
        body: [
          'Subscription and one-time purchase entitlements apply only while billing remains valid and in good standing.',
        ],
      },
      {
        title: 'Community Content',
        body: [
          'Reviews and comments may be moderated, hidden, or removed when they violate platform expectations or create spoiler-heavy noise.',
        ],
      },
    ],
  },
  blog: {
    eyebrow: 'Editorial',
    title: 'Product thinking, discovery design, and streaming-inspired platform notes.',
    intro: 'CineTube’s editorial layer gives the homepage more depth and helps the project feel assignment-complete instead of just API-complete.',
    sections: blogHighlights.map((item) => ({
      title: item.title,
      body: [item.excerpt],
    })),
  },
};
