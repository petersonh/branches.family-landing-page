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
      { label: 'Our Story', href: '/about' },
      { label: 'Shipping & Returns', href: '/shipping-and-returns' },
    ],
  },
  {
    id: 'questions',
    title: 'Questions?',
    links: [
      { label: 'FAQ', href: '/faq' },
      { label: 'Privacy Policy', href: '/privacy-policy' },
    ],
  },
  {
    id: 'legal',
    title: 'Legal',
    links: [
      { label: 'Blog', href: '/blog' },
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

type SocialPlatform = 'instagram' | 'tiktok' | 'facebook' | 'x' | 'pinterest';

const panels: Panel[] = [
  {
    headingTag: 'h1',
    heading: 'Your Family Story, Beautifully Told',
    body: 'Build your tree or import one you\'ve already made. We\'ll turn it into a stunning print and a living family site - in minutes.',
    cta: 'Get Started ➳',
  },
  {
    heading: 'How It Works',
    body: 'Branches.Family turns your family history into a piece of art. Add names, dates, and photos - we\'ll transform them into illustrated portraits and arrange everything into a tree that\'s uniquely yours. Share it online with family or order a print for your wall.',
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
    body: 'Branches.Family currently offers a free builder and a print-ready digital download. Once your artwork is ready, there is nothing physical to ship, so delivery happens digitally.',
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
    body: 'Yes. Branches.Family is designed for both new family trees and ones you have already started elsewhere.',
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
  {
    heading: 'Who handles the printing?',
    body: 'We partner with Prodigi, a professional print fulfillment service trusted by creators and businesses worldwide. They produce gallery-quality prints on premium materials and handle packaging and delivery on our behalf.',
  },
  {
    heading: 'Where are the prints produced?',
    body: 'Prodigi operates fulfillment centres around the world. When you place an order, they automatically route it to the facility closest to your shipping address, which helps keep delivery times short and shipping costs down.',
  },
  {
    heading: 'How much does shipping cost?',
    body: 'Shipping costs vary depending on your location and the size of your print. You can see an estimated shipping price on the preview page before you commit to an order — no surprises at checkout.',
  },
  {
    heading: 'Where is Branches.Family based?',
    body: 'Branches.Family is based in Toronto, Canada. The product is built and maintained here, though prints can be shipped to most countries worldwide through our fulfillment partner.',
  },
  {
    heading: 'How are the illustrated portraits created?',
    body: 'Portraits are generated using AI style transfer. You upload a photo and our system transforms it into a hand-illustrated look that matches the aesthetic of your tree. The result is a consistent, cohesive visual style across every family member.',
  },
  {
    heading: 'What types of AI does Branches.Family use?',
    body: 'We use style transfer technology to turn portrait photos into illustrated artwork. This is a specific branch of AI focused on applying artistic styles to images — it is not generative AI that creates faces from scratch. Your photos remain the foundation of every portrait.',
  },
  {
    heading: 'Which AI model provider do you use?',
    body: 'We use Replicate as our model hosting provider. Replicate gives us access to high-quality style transfer models with reliable performance, so your portraits are processed quickly and consistently.',
  },
  {
    heading: 'What is the maximum number of people I can add to a tree?',
    body: 'We have stress-tested trees with up to 150 family members and everything renders smoothly. If your family tree is larger than that, please reach out through the contact form on the home page and we will work with you to make sure it displays properly.',
  },
  {
    heading: 'Can you add a feature I am looking for?',
    body: 'Possibly! We are always looking for ways to improve Branches.Family. If there is a feature you would like to see, send us a message through the contact form on the home page. We read every request and use them to guide what we build next.',
  },
  {
    heading: 'Will there be more portrait styles to choose from?',
    body: 'Yes. We are actively working on expanding the range of illustration styles available. Our goal is to offer a variety of artistic looks so you can pick the one that best fits your family tree.',
  },
];

const privacySections: InfoSection[] = [
  {
    heading: 'Your Data',
    body: 'When you use our family tree generator, the photos and text you provide are sent securely to our server for processing. We do not store this data after your images and previews are created. Once processing is complete, it is automatically deleted from our systems.',
  },
  {
    heading: 'Image Processing',
    body: "To create the artwork, some information such as photos is also sent to Google's servers for image processing. Google may temporarily store this content to generate the requested output, but we do not allow them to use your data for advertising or profiling.",
  },
  {
    heading: 'Printed Products',
    body: "If you order a printed product, the final artwork file is securely sent to Printful's API for production and fulfillment. Printful may temporarily store the file as part of the printing process. We do not keep a copy, and we do not allow Printful to use it for marketing or other purposes.",
  },
  {
    heading: 'Third Parties',
    body: 'We do not sell, rent, or share your personal information with third parties for marketing.',
  },
  {
    heading: 'Analytics',
    body: 'Basic usage data such as page visits and performance metrics may be collected through standard analytics tools to help improve the service.',
  },
  {
    heading: 'Consent & Questions',
    body: 'By using this website, you consent to this processing. If you have any questions about how your data is handled, please contact us using the form on the home page.',
  },
];

const socialLinks: Array<{ label: string; platform: SocialPlatform; href: string }> = [
  { label: 'Instagram', platform: 'instagram', href: '#' },
  { label: 'TikTok', platform: 'tiktok', href: '#' },
  { label: 'Facebook', platform: 'facebook', href: '#' },
  { label: 'Pinterest', platform: 'pinterest', href: '#' },
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

  if (platform === 'pinterest') {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M12 2C6.48 2 2 6.48 2 12c0 4.08 2.46 7.58 5.97 9.1-.08-.74-.16-1.88.03-2.69.17-.73 1.12-4.74 1.12-4.74s-.29-.57-.29-1.41c0-1.32.77-2.31 1.72-2.31.81 0 1.2.61 1.2 1.34 0 .82-.52 2.04-.79 3.17-.22.94.47 1.71 1.4 1.71 1.68 0 2.97-1.77 2.97-4.33 0-2.26-1.63-3.84-3.95-3.84-2.69 0-4.27 2.02-4.27 4.11 0 .81.31 1.69.7 2.16.08.09.09.18.07.27-.07.3-.24.94-.27 1.07-.04.18-.14.22-.33.13-1.23-.57-2-2.37-2-3.81 0-3.1 2.25-5.95 6.49-5.95 3.41 0 6.06 2.43 6.06 5.67 0 3.39-2.14 6.11-5.1 6.11-1 0-1.93-.52-2.25-1.13l-.61 2.34c-.22.86-.82 1.93-1.22 2.59.92.28 1.9.44 2.91.44 5.52 0 10-4.48 10-10S17.52 2 12 2Z" fill="currentColor" />
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
  subtitle,
  intro,
  sections,
  onNavigate,
  onScrollToPanel,
  faqLayout,
  heroImage,
  placeholderImage,
  placeholderText,
}: {
  title: string;
  subtitle?: string;
  intro: string | React.ReactNode;
  sections: InfoSection[];
  onNavigate: (route: AppRoute) => void;
  onScrollToPanel: (panelIndex: number) => void;
  faqLayout?: boolean;
  heroImage?: string;
  placeholderImage?: string;
  placeholderText?: string;
}) {
  return (
    <div className="info-page-shell">
      <header className="site-header info-page-header">
        <div className="header-inner">
          <a href="/" onClick={(e) => { e.preventDefault(); onNavigate('/'); }}>
            <img className="site-logo logo-vertical" src="/images/logo.svg" alt="Branches.Family" />
            <img className="site-logo logo-horizontal" src="/images/logo_horizontal.svg" alt="Branches.Family" />
          </a>
          <nav aria-label="Primary navigation">
            <ul className="nav-list">
              {navItems.map((item) => (
                <li key={item.label}>
                  <a
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      onScrollToPanel(item.panelIndex);
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

      <main className="info-page-main">
        <div className="info-content-card">
          <section className="info-hero">
            <div className="info-hero-heading">
              {heroImage && <img src={heroImage} alt="" className="info-hero-image" />}
              <div className="info-hero-titles">
                <h1>{title}</h1>
                {subtitle && <p className="info-hero-subtitle">{subtitle}</p>}
              </div>
            </div>
            <hr className="info-hero-divider" />
            {intro && (
              <div className="info-hero-intro">
                {typeof intro === 'string' ? (
                  intro.split('\n\n').map((paragraph, i) => (
                    <p key={i}>{paragraph}</p>
                  ))
                ) : (
                  intro
                )}
              </div>
            )}
          </section>

          {placeholderImage ? (
            <div className="info-placeholder">
              <img src={placeholderImage} alt={placeholderText || ''} className="info-placeholder-image" />
              {placeholderText && <p className="info-placeholder-text">{placeholderText}</p>}
            </div>
          ) : sections.length > 0 && (
            faqLayout ? (
              <section className="faq-list">
                {sections.map((section) => (
                  <div key={section.heading} className="faq-item">
                    <h2 className="faq-question">{section.heading}</h2>
                    {typeof section.body === 'string' ? <p className="faq-answer">{section.body}</p> : section.body}
                  </div>
                ))}
              </section>
            ) : (
              <section className="info-section-grid">
                {sections.map((section) => (
                  <article key={section.heading} className="info-card">
                    <h2>{section.heading}</h2>
                    {typeof section.body === 'string' ? <p>{section.body}</p> : section.body}
                  </article>
                ))}
              </section>
            )
          )}
        </div>
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
              <img className="site-logo logo-vertical" src="/images/logo.svg" alt="Branches.Family" />
              <img className="site-logo logo-horizontal" src="/images/logo_horizontal.svg" alt="Branches.Family" />
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
      document.title = 'Branches.Family';
    } else if (route === '/about') {
      document.title = 'Our Story | Branches.Family';
    } else if (route === '/blog') {
      document.title = 'Blog | Branches.Family';
    } else if (route === '/privacy-policy') {
      document.title = 'Privacy Policy | Branches.Family';
    } else if (route === '/shipping-and-returns') {
      document.title = 'Shipping and Returns | Branches.Family';
    } else {
      document.title = 'FAQ | Branches.Family';
    }
  }, [route]);

  if (route === '/about') {
    return (
      <InfoPage
        title="Our Story"
        subtitle="How a grandfather's tree became a platform for every family"
        heroImage="/images/new_tree_icon.svg"
        intro={
          <>
            <p>Years ago, my grandfather passed down a family tree he and my dad had created. It mapped our family's journey from <strong>Ireland to Canada</strong> more than 200 years ago. The tree was filled with names, dates, and handwritten notes connecting generations across an ocean. While it was an important piece of our history, I always felt I could give it an upgrade using my background in <strong>visual arts</strong> and <strong>graphics programming</strong>. 🎨</p>
            <p>When I eventually had kids of my own, the mission became more urgent. I wanted to create a family tree they'd be <em>proud to pass down</em> to their own children someday — something visual, personal, and built to last. I started experimenting with ways to combine family data with illustrated portraits and found that the result was far more engaging than any spreadsheet or chart I had seen before. 🌳</p>
            <p>After many late nights, plenty of coffee ☕ and coding, <strong>Branches.Family</strong> was born. What started as a personal project for my own family quickly grew into something I wanted to share with others. The goal has always been the same: make it easy for <em>anyone</em> to build a beautiful family tree, whether you are starting from scratch or picking up where a grandparent left off.</p>
            <p>— Peter (Founder)</p>
          </>
        }
        sections={[]}
        onNavigate={navigateTo}
        onScrollToPanel={navigateToPanel}
      />
    );
  }

  if (route === '/blog') {
    return (
      <InfoPage
        title="Blog"
        subtitle="Stories, updates, and ideas for preserving family history"
        heroImage="/images/blog_icon.svg"
        intro=""
        sections={[]}
        placeholderImage="/images/under_construction.svg"
        placeholderText="Under construction"
        onNavigate={navigateTo}
        onScrollToPanel={navigateToPanel}
      />
    );
  }

  if (route === '/privacy-policy') {
    return (
      <InfoPage
        title="Privacy Policy"
        subtitle="We take your privacy seriously"
        heroImage="/images/privacy_icon.svg"
        intro=""
        sections={privacySections}
        onNavigate={navigateTo}
        onScrollToPanel={navigateToPanel}
      />
    );
  }

  if (route === '/shipping-and-returns') {
    return (
      <InfoPage
        title="Shipping & Returns"
        subtitle="Delivery details and what to do if something needs attention"
        heroImage="/images/shipping_icon.svg"
        intro=""
        sections={shippingSections}
        onNavigate={navigateTo}
        onScrollToPanel={navigateToPanel}
      />
    );
  }

  if (route === '/faq') {
    return (
      <InfoPage
        title="Frequently Asked Questions"
        subtitle="The basics, all in one place"
        heroImage="/images/faq_icon.svg"
        intro=""
        sections={faqSections}
        faqLayout
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