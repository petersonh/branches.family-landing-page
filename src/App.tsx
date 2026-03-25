import { ReactNode, useCallback, useEffect, useRef, useState } from 'react';
import PhotoSwipeLightbox from 'photoswipe/lightbox';
import 'photoswipe/style.css';

type AppRoute = '/' | '/about' | '/blog' | '/privacy-policy' | '/shipping-and-returns' | '/faq';

// Maps nav labels to their corresponding panel index
const navItems: { label: string; panelIndex: number }[] = [
  { label: 'About', panelIndex: 1 },
  { label: 'Gallery', panelIndex: 2 },
  { label: 'Pricing', panelIndex: 3 },
  { label: 'Contact', panelIndex: 4 },
];

const footerColumns: {
  id: string;
  title: string;
  links: Array<
    | { label: string; panelIndex: number }
    | { label: string; href: AppRoute }
  >;
}[] = [
  {
    id: 'explore',
    title: 'Explore',
    links: [
      { label: 'About', href: '/about' },
      { label: 'Blog', href: '/blog' },
    ],
  },
  {
    id: 'questions',
    title: 'Questions?',
    links: [
      { label: 'Shipping and Returns', href: '/shipping-and-returns' },
      { label: 'FAQ', href: '/faq' },
    ],
  },
  {
    id: 'legal',
    title: 'Legal',
    links: [
      { label: 'Privacy Policy', href: '/privacy-policy' },
    ],
  },
];

const BAND_HEIGHT = 700; // must match the value in the scroll handler

interface GalleryItem {
  thumbnail: string;
  full: string;
  width: number;
  height: number;
}

interface Panel {
  heading: string;
  body: string | ReactNode;
  cta?: string;
  headingTag?: 'h1' | 'h2';
  image?: string;
  gallery?: GalleryItem[];
  contactForm?: boolean;
}

interface InfoSection {
  heading: string;
  body: ReactNode;
}

type SocialPlatform = 'instagram' | 'tiktok' | 'facebook' | 'x';

const panels: Panel[] = [
  {
    headingTag: 'h1',
    heading: 'Your Family Story, Beautifully Told',
    body: 'Build your tree or import one you\'ve already made. We\'ll turn it into a stunning print and a living family site - in minutes.',
    cta: 'Get Started ➳',
  },
  {
    heading: 'How It Works',
    body: 'Branches turns your family history into a piece of art. Add names, dates, and photos - we\'ll transform them into illustrated portraits and arrange everything into a tree that\'s uniquely yours. Share it online with family or order a print for your wall.',
    cta: 'Build Your Tree ➳',
    image: '/images/photo_to_painting.png',
  },
  {
    heading: 'Trees We Love',
    body: 'A few of our favorite trees. Browse the gallery to see what\'s possible - from small families to sprawling ones.',
    gallery: [
      { thumbnail: '/images/gallery/image_0_thumbnail.png', full: '/images/gallery/image_0.png', width: 2110, height: 1359 },
      { thumbnail: '/images/gallery/image_1_thumbnail.png', full: '/images/gallery/image_1.png', width: 2110, height: 1359 },
      { thumbnail: '/images/gallery/image_2_thumbnail.png', full: '/images/gallery/image_2.png', width: 2110, height: 1359 },
      { thumbnail: '/images/gallery/image_2_thumbnail.png', full: '/images/gallery/image_2.png', width: 2110, height: 1359 },
      { thumbnail: '/images/gallery/image_2_thumbnail.png', full: '/images/gallery/image_2.png', width: 2110, height: 1359 },
      { thumbnail: '/images/gallery/image_2_thumbnail.png', full: '/images/gallery/image_2.png', width: 2110, height: 1359 },
    ],
  },
  {
    heading: 'Pricing',
    body: (
      <>
        Build and share your tree for free - no account required. When you're ready to make it real:<br />
        <ul>
          <li>Print-ready digital download $29</li>
          <li><em>Shipped Prints Coming Soon!</em></li>
        </ul>
      </>
    ),
    cta: 'Start for Free ➳',
  },
  {
    heading: 'Get in Touch',
    body: 'Questions or feedback? Drop me a line - I\'d love to hear from you.',
    contactForm: true,
  },
];

const shippingSections: InfoSection[] = [
  {
    heading: 'Digital Delivery',
    body: 'Branches currently offers a free builder and a print-ready digital download. Once your artwork is ready, there is nothing physical to ship, so delivery happens digitally.',
  },
  {
    heading: 'Printed Orders',
    body: 'Shipped prints are still in progress. When print fulfillment goes live, this page will be updated with production windows, shipping timing, and destination details.',
  },
  {
    heading: 'Returns and Fixes',
    body: 'Because each tree is personalized, custom artwork may need revision rather than a standard return. If something looks wrong with names, dates, layout, or exported files, use the contact form and we can review the issue with you.',
  },
  {
    heading: 'Need Help?',
    body: 'If you are unsure whether your order is ready to export, or you want help before paying for a download, get in touch through the contact section on the home page.',
  },
];

const faqSections: InfoSection[] = [
  {
    heading: 'Do I need an account to start?',
    body: 'No. The current landing page flow is built around starting for free without creating an account first.',
  },
  {
    heading: 'Can I import a tree I already made?',
    body: 'Yes. Branches is designed for both new family trees and ones you have already started elsewhere.',
  },
  {
    heading: 'Can I add photographs?',
    body: 'Yes. Photos are part of the process and can be used to help turn your tree into illustrated artwork.',
  },
  {
    heading: 'Can I share the tree before ordering anything?',
    body: 'Yes. The product is intended to be shared with family online before you decide whether to purchase a print-ready file.',
  },
  {
    heading: 'Are physical prints available now?',
    body: 'Not yet. Print-ready digital downloads are available now, and shipped prints are listed as coming soon.',
  },
];

const aboutSections: InfoSection[] = [
  {
    heading: 'What Branches Is For',
    body: 'Branches is built for families who want something more personal than a chart and more flexible than a one-off print order. It is a way to gather names, dates, stories, and photographs into a family tree that feels worth keeping.',
  },
  {
    heading: 'How It Starts',
    body: 'You can begin from scratch or bring in a tree you already have. From there, Branches helps shape the information into a visual layout that is easier to share with relatives and easier to turn into artwork.',
  },
  {
    heading: 'Why It Exists',
    body: 'Family history often lives in scattered notes, old albums, and the memories of one or two relatives. Branches is meant to help capture those details while they are still close at hand.',
  },
  {
    heading: 'Who It Helps',
    body: 'It is especially useful for reunion organizers, parents building something to pass down, and the family member who usually ends up collecting everyone’s corrections and forgotten names.',
  },
];

const blogSections: InfoSection[] = [
  {
    heading: 'A Place for Future Stories',
    body: 'The Branches blog is not populated yet, but this page is where updates, family history ideas, product notes, and examples of thoughtful tree-building will live.',
  },
  {
    heading: 'What You Can Expect',
    body: 'Future posts can cover topics like organizing family photos, collecting names before reunions, preparing a tree for printing, and preserving stories alongside dates and places.',
  },
  {
    heading: 'Built Slowly and Carefully',
    body: 'Rather than filling this section with generic articles, the plan is to publish practical pieces that are genuinely useful for families making something together.',
  },
];

const privacySections: InfoSection[] = [
  {
    heading: 'What You Share',
    body: 'When you use Branches, the text and images you provide may be processed so the app can generate previews and family-tree artwork. That information is used to deliver the requested experience, not to build advertising profiles.',
  },
  {
    heading: 'How It Is Used',
    body: 'Uploaded content is handled for the purpose of creating artwork, previews, and exports. If third-party services are involved in image generation or fulfillment, they are used as part of that workflow rather than for unrelated marketing.',
  },
  {
    heading: 'What Is Not the Goal',
    body: 'Branches is not designed around selling personal information or turning family content into audience data. The purpose is to help families make and preserve a meaningful record.',
  },
  {
    heading: 'Questions About Data',
    body: 'If you want clarification about how a photo, message, or export is handled, use the contact section on the home page and ask directly before submitting anything sensitive.',
  },
];

const socialLinks: Array<{ label: string; platform: SocialPlatform; href: string }> = [
  { label: 'Instagram', platform: 'instagram', href: '#' },
  { label: 'TikTok', platform: 'tiktok', href: '#' },
  { label: 'Facebook', platform: 'facebook', href: '#' },
  { label: 'X', platform: 'x', href: '#' },
];

function SocialIcon({ platform }: { platform: SocialPlatform }) {
  if (platform === 'instagram') {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <rect x="3.25" y="3.25" width="17.5" height="17.5" rx="5.25" fill="none" stroke="currentColor" strokeWidth="1.8" />
        <circle cx="12" cy="12" r="4.2" fill="none" stroke="currentColor" strokeWidth="1.8" />
        <circle cx="17.3" cy="6.7" r="1.2" fill="currentColor" />
      </svg>
    );
  }

  if (platform === 'tiktok') {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M14.2 4.2c.4 1.6 1.4 2.8 3.2 3.3v2.6c-1.2 0-2.3-.3-3.3-1v5.6a4.9 4.9 0 1 1-4.9-4.9c.4 0 .8 0 1.1.1v2.8a2.3 2.3 0 1 0 1.3 2.1V4.2h2.6Z" fill="currentColor" />
      </svg>
    );
  }

  if (platform === 'facebook') {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M13.3 20v-6.6h2.3l.4-2.8h-2.7V8.8c0-.8.2-1.4 1.4-1.4H16V4.9c-.2 0-.9-.1-1.8-.1-2.7 0-4.4 1.6-4.4 4.6v1.2H7.5v2.8h2.3V20h3.5Z" fill="currentColor" />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M5.1 4h3.6l3.9 5.6L17.5 4H20l-6.2 7.2L20.6 20H17l-4.2-6.1L7.4 20H4.9l6.6-7.7L5.1 4Zm3.1 1.9H7.1l9 12.2h1.1L8.2 5.9Z" fill="currentColor" />
    </svg>
  );
}

function getRouteFromPath(pathname: string): AppRoute {
  const normalizedPath = pathname.replace(/\/+$/, '') || '/';

  if (normalizedPath === '/about') return '/about';
  if (normalizedPath === '/blog') return '/blog';
  if (normalizedPath === '/privacy-policy') return '/privacy-policy';
  if (normalizedPath === '/shipping-and-returns') return '/shipping-and-returns';
  if (normalizedPath === '/faq') return '/faq';
  return '/';
}

function SiteFooter({
  onNavigate,
  onScrollToPanel,
}: {
  onNavigate: (route: AppRoute) => void;
  onScrollToPanel: (panelIndex: number) => void;
}) {
  return (
    <footer className="site-footer">
      <div className="footer-inner">
        <div className="footer-grid">
          <section className="footer-lead footer-social-block" aria-label="Social media">
            <div className="footer-social-links">
              {socialLinks.map((link) => (
                <a key={link.platform} className="footer-social-link" href={link.href} aria-label={link.label}>
                  <SocialIcon platform={link.platform} />
                </a>
              ))}
            </div>
          </section>

          {footerColumns.map((column) => (
            <section key={column.id} className="footer-column" aria-label={column.title}>
              <ul className="footer-links">
                {column.links.map((link) => (
                  <li key={link.label}>
                    {'panelIndex' in link ? (
                      <button
                        type="button"
                        className="footer-link"
                        onClick={() => onScrollToPanel(link.panelIndex)}
                      >
                        {link.label}
                      </button>
                    ) : (
                      <button
                        type="button"
                        className="footer-link"
                        onClick={() => onNavigate(link.href)}
                      >
                        {link.label}
                      </button>
                    )}
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>

        <div className="copyright">
          <span>&copy; {new Date().getFullYear()} Branches.Family</span>
        </div>
      </div>
    </footer>
  );
}

function InfoPage({
  title,
  intro,
  sections,
  currentRoute,
  onNavigate,
  onScrollToPanel,
}: {
  title: string;
  intro: string;
  sections: InfoSection[];
  currentRoute: AppRoute;
  onNavigate: (route: AppRoute) => void;
  onScrollToPanel: (panelIndex: number) => void;
}) {
  return (
    <div className="info-page-shell">
      <header className="subpage-header">
        <div className="subpage-header-inner">
          <button type="button" className="site-logo-button" onClick={() => onNavigate('/')}>
            <img className="site-logo" src="/images/logo.svg" alt="Branches Family Artwork" />
          </button>

          <nav className="subpage-nav" aria-label="Secondary navigation">
            <button type="button" className="subpage-link" onClick={() => onNavigate('/')}>
              Home
            </button>
            <button
              type="button"
              className={`subpage-link${currentRoute === '/about' ? ' is-active' : ''}`}
              onClick={() => onNavigate('/about')}
            >
              About
            </button>
            <button
              type="button"
              className={`subpage-link${currentRoute === '/blog' ? ' is-active' : ''}`}
              onClick={() => onNavigate('/blog')}
            >
              Blog
            </button>
            <button
              type="button"
              className={`subpage-link${currentRoute === '/privacy-policy' ? ' is-active' : ''}`}
              onClick={() => onNavigate('/privacy-policy')}
            >
              Privacy Policy
            </button>
            <button
              type="button"
              className={`subpage-link${currentRoute === '/shipping-and-returns' ? ' is-active' : ''}`}
              onClick={() => onNavigate('/shipping-and-returns')}
            >
              Shipping and Returns
            </button>
            <button
              type="button"
              className={`subpage-link${currentRoute === '/faq' ? ' is-active' : ''}`}
              onClick={() => onNavigate('/faq')}
            >
              FAQ
            </button>
          </nav>
        </div>
      </header>

      <main className="info-page-main">
        <section className="info-hero">
          <p className="info-eyebrow">Helpful Details</p>
          <h1>{title}</h1>
          <p>{intro}</p>
        </section>

        <section className="info-section-grid">
          {sections.map((section) => (
            <article key={section.heading} className="info-card">
              <h2>{section.heading}</h2>
              {typeof section.body === 'string' ? <p>{section.body}</p> : section.body}
            </article>
          ))}
        </section>
      </main>

      <SiteFooter onNavigate={onNavigate} onScrollToPanel={onScrollToPanel} />
    </div>
  );
}

function LandingPage({
  initialPanelIndex,
  onPanelNavigationHandled,
  onNavigate,
}: {
  initialPanelIndex: number | null;
  onPanelNavigationHandled: () => void;
  onNavigate: (route: AppRoute) => void;
}) {
  const panelRefs = useRef<(HTMLElement | null)[]>([]);
  const treeRef = useRef<HTMLImageElement>(null);
  const fixedWrapRef = useRef<HTMLDivElement>(null);

  // Initialize PhotoSwipe
  useEffect(() => {
    const lightbox = new PhotoSwipeLightbox({
      gallery: '.gallery-grid',
      children: 'a',
      pswpModule: () => import('photoswipe'),
    });
    lightbox.init();
    return () => lightbox.destroy();
  }, []);

  const scrollToPanel = useCallback((panelIndex: number) => {
    if (window.innerWidth <= 700) {
      // Mobile: scroll to the actual DOM element
      const el = panelRefs.current[panelIndex];
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    } else {
      // Desktop: scroll to the center of the panel's band
      const target = panelIndex * BAND_HEIGHT + BAND_HEIGHT / 2;
      window.scrollTo({ top: target, behavior: 'smooth' });
    }
  }, []);

  useEffect(() => {
    if (initialPanelIndex === null) return;

    scrollToPanel(initialPanelIndex);
    onPanelNavigationHandled();
  }, [initialPanelIndex, onPanelNavigationHandled, scrollToPanel]);

  useEffect(() => {
    const onScroll = () => {
      // On mobile (≤700px) the layout is normal flow — skip all scroll effects
      if (window.innerWidth <= 700) return;

      const y = window.scrollY;
      const count = panels.length;

      // Each panel owns a scroll band; transitions crossfade between adjacent panels
      const bandHeight = BAND_HEIGHT;
      const fadeZone = 150; // px over which each fade happens
      const gap = 100;      // dead zone between fade-out and fade-in

      const winHeight = window.innerHeight;

      // Parallax: translate tree so its bottom is reached at the Contact panel
      const contactBandCenter = (count - 1) * bandHeight + bandHeight / 2;
      if (treeRef.current) {
        const treeHeight = treeRef.current.offsetHeight;
        const viewportHeight = window.innerHeight;
        const maxTravel = treeHeight - viewportHeight + 80; // 80px = top offset
        const parallaxT = Math.min(1, Math.max(0, y / contactBandCenter));
        treeRef.current.style.transform = `translateY(${-parallaxT * maxTravel}px)`;
      }

      // Translate the entire fixed layer up once the footer comes into view
      const spacer = document.querySelector('.scroll-spacer') as HTMLElement | null;
      if (fixedWrapRef.current && spacer) {
        const spacerBottom = spacer.offsetTop + spacer.offsetHeight;
        const overscroll = y + winHeight - spacerBottom;
        if (overscroll > 0) {
          fixedWrapRef.current.style.transform = `translateY(${-overscroll}px)`;
        } else {
          fixedWrapRef.current.style.transform = '';
        }
      }

      for (let i = 0; i < count; i++) {
        const el = panelRefs.current[i];
        if (!el) continue;

        const bandStart = i * bandHeight;
        const bandEnd = bandStart + bandHeight;

        // Fade-out ends early (bandEnd - gap), fade-in starts at bandStart
        // This leaves a gap where neither panel is visible
        let opacity: number;
        if (i === 0) {
          // First panel: fully visible until fade-out begins
          const outEnd = bandEnd - gap;
          opacity = y < outEnd - fadeZone ? 1 : 1 - Math.min(1, (y - (outEnd - fadeZone)) / fadeZone);
        } else if (i === count - 1) {
          // Last panel: fade in then fade out before footer
          const fadeIn = Math.min(1, Math.max(0, (y - bandStart) / fadeZone));
          const outEnd = bandEnd - gap;
          const fadeOut = y < outEnd - fadeZone ? 1 : 1 - Math.min(1, (y - (outEnd - fadeZone)) / fadeZone);
          opacity = Math.min(fadeIn, fadeOut);
        } else {
          // Middle panels: fade in then fade out
          const fadeIn = Math.min(1, Math.max(0, (y - bandStart) / fadeZone));
          const outEnd = bandEnd - gap;
          const fadeOut = y < outEnd - fadeZone ? 1 : 1 - Math.min(1, (y - (outEnd - fadeZone)) / fadeZone);
          opacity = Math.min(fadeIn, fadeOut);
        }

        el.style.opacity = String(opacity);
        el.style.pointerEvents = opacity > 0.5 ? 'auto' : 'none';
      }
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <div className="page-shell">
      <div className="fixed-content" ref={fixedWrapRef}>
        <header className="site-header">
          <div className="header-inner">
            <a href="#" onClick={(e) => { e.preventDefault(); window.scrollTo({ top: 0, behavior: 'smooth' }); }}>
              <img className="site-logo" src="/images/logo.svg" alt="Branches Family Artwork" />
            </a>
            <nav aria-label="Primary navigation">
              <ul className="nav-list">
                {navItems.map((item) => (
                  <li key={item.label}>
                    <a
                      href="#"
                      onClick={(e) => {
                        e.preventDefault();
                        scrollToPanel(item.panelIndex);
                      }}
                    >
                      {item.label}
                    </a>
                  </li>
                ))}
              </ul>
            </nav>
          </div>
        </header>

        <img className="mobile-hero" src="/images/mobile_hero.png" alt="Family tree artwork" />

        {panels.map((panel, i) => (
          <section
            key={i}
            className="fixed-panel"
            ref={(el) => { panelRefs.current[i] = el; }}
            style={i > 0 ? { opacity: 0 } : undefined}
            {...(i === 0 ? { 'aria-labelledby': 'landing-heading' } : {})}
          >
            <div className="fixed-panel-inner">
              {panel.headingTag === 'h1' ? (
                <h1 id="landing-heading">{panel.heading}</h1>
              ) : (
                <h2>{panel.heading}</h2>
              )}
              {typeof panel.body === 'string' ? (
                <p>{panel.body}</p>
              ) : (
                panel.body
              )}
              {panel.image && (
                <img className="panel-image" src={panel.image} alt="" />
              )}
              {panel.gallery && (
                <div className="gallery-grid">
                  {panel.gallery.map((item, j) => (
                    <a
                      key={j}
                      className="gallery-thumb-btn"
                      href={item.full}
                      data-pswp-width={item.width}
                      data-pswp-height={item.height}
                      target="_blank"
                      rel="noreferrer"
                    >
                      <img src={item.thumbnail} alt={`Gallery tree ${j + 1}`} />
                    </a>
                  ))}
                </div>
              )}
              {panel.contactForm && (
                <form className="contact-form" onSubmit={(e) => e.preventDefault()}>
                  <input type="text" placeholder="Name" required />
                  <input type="email" placeholder="Email" required />
                  <textarea placeholder="Message" rows={4} required />
                  <span className="cta-shadow-wrap"><button type="submit" className="cta-button">Send Message</button></span>
                </form>
              )}
              {panel.cta && (
                <span className="cta-shadow-wrap">
                  <a className="cta-button" href="#">
                    {panel.cta}
                  </a>
                </span>
              )}
            </div>
          </section>
        ))}

        <div className="tree-visual" aria-hidden="true">
          <img ref={treeRef} src="/images/tree.png" alt="" />
        </div>
      </div>

      <div className="scroll-spacer" />

      <SiteFooter onNavigate={onNavigate} onScrollToPanel={scrollToPanel} />
    </div>
  );
}

export default function App() {
  const [route, setRoute] = useState<AppRoute>(() => getRouteFromPath(window.location.pathname));
  const [pendingPanelIndex, setPendingPanelIndex] = useState<number | null>(null);

  const navigateTo = useCallback((nextRoute: AppRoute) => {
    if (nextRoute === route) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    window.history.pushState({}, '', nextRoute);
    setPendingPanelIndex(null);
    setRoute(nextRoute);
    window.scrollTo({ top: 0, behavior: 'auto' });
  }, [route]);

  const navigateToPanel = useCallback((panelIndex: number) => {
    if (route === '/') {
      setPendingPanelIndex(panelIndex);
      return;
    }

    window.history.pushState({}, '', '/');
    setRoute('/');
    setPendingPanelIndex(panelIndex);
    window.scrollTo({ top: 0, behavior: 'auto' });
  }, [route]);

  useEffect(() => {
    const onPopState = () => {
      setPendingPanelIndex(null);
      setRoute(getRouteFromPath(window.location.pathname));
    };

    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, []);

  useEffect(() => {
    if (route === '/') {
      document.title = 'Branches Family Artwork';
    } else if (route === '/about') {
      document.title = 'About | Branches Family Artwork';
    } else if (route === '/blog') {
      document.title = 'Blog | Branches Family Artwork';
    } else if (route === '/privacy-policy') {
      document.title = 'Privacy Policy | Branches Family Artwork';
    } else if (route === '/shipping-and-returns') {
      document.title = 'Shipping and Returns | Branches Family Artwork';
    } else {
      document.title = 'FAQ | Branches Family Artwork';
    }
  }, [route]);

  if (route === '/about') {
    return (
      <InfoPage
        title="About Branches"
        intro="A short introduction to what Branches is trying to make easier: turning family records and photographs into something beautiful enough to share and keep."
        sections={aboutSections}
        currentRoute={route}
        onNavigate={navigateTo}
        onScrollToPanel={navigateToPanel}
      />
    );
  }

  if (route === '/blog') {
    return (
      <InfoPage
        title="Branches Blog"
        intro="A simple home for future writing about preserving family history, building better trees, and making sure the details survive beyond one generation."
        sections={blogSections}
        currentRoute={route}
        onNavigate={navigateTo}
        onScrollToPanel={navigateToPanel}
      />
    );
  }

  if (route === '/privacy-policy') {
    return (
      <InfoPage
        title="Privacy Policy"
        intro="A plain-language overview of how information provided to Branches may be used while creating family-tree artwork and related exports."
        sections={privacySections}
        currentRoute={route}
        onNavigate={navigateTo}
        onScrollToPanel={navigateToPanel}
      />
    );
  }

  if (route === '/shipping-and-returns') {
    return (
      <InfoPage
        title="Shipping and Returns"
        intro="A short overview of how delivery works today, what is still coming soon, and what to do if something about your tree needs attention."
        sections={shippingSections}
        currentRoute={route}
        onNavigate={navigateTo}
        onScrollToPanel={navigateToPanel}
      />
    );
  }

  if (route === '/faq') {
    return (
      <InfoPage
        title="Frequently Asked Questions"
        intro="The basics, collected in one place, for anyone deciding whether Branches is the right way to turn family history into something shareable and printable."
        sections={faqSections}
        currentRoute={route}
        onNavigate={navigateTo}
        onScrollToPanel={navigateToPanel}
      />
    );
  }

  return (
    <LandingPage
      initialPanelIndex={pendingPanelIndex}
      onPanelNavigationHandled={() => setPendingPanelIndex(null)}
      onNavigate={navigateTo}
    />
  );
}