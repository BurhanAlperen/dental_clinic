'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Menu, X, Phone } from 'lucide-react';
import { CLINIC } from '@/config/clinic';
import styles from './Navbar.module.css';

const NAV_ITEMS = [
  { label: 'Anasayfa', href: '#hero' },
  { label: 'Hakkımızda', href: '#hakkimizda' },
  { label: 'Yaptığımız İşler', href: '#galeri' },
  { label: 'Yorumlar', href: '/yorumlar' },
  { label: 'Konum', href: '#konum' },
];

export default function Navbar({ onAppointmentClick, darkHero = false }) {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    if (mobileOpen) {
      document.body.classList.add('modal-open');
    } else {
      document.body.classList.remove('modal-open');
    }
    return () => document.body.classList.remove('modal-open');
  }, [mobileOpen]);

  const handleNavClick = (e, href) => {
    setMobileOpen(false);
    if (href === '/yorumlar') {
      e.preventDefault();
      router.push('/yorumlar');
      return;
    }

    if (href.startsWith('#')) {
      if (pathname === '/') {
        e.preventDefault();
        const el = document.querySelector(href);
        if (el) {
          el.scrollIntoView({ behavior: 'smooth' });
        }
      } else {
        e.preventDefault();
        router.push(`/${href}`);
      }
    }
  };

  const isDarkHero = darkHero || pathname === '/randevu' || pathname?.startsWith('/randevu');

  return (
    <nav
      className={`${styles.navbar} ${scrolled ? styles.scrolled : ''} ${isDarkHero ? styles.darkHeroNav : ''}`}
      role="navigation"
      aria-label="Ana navigasyon"
    >
      <div className={`container ${styles.inner}`}>
        {/* Logo */}
        <Link href="/" className={styles.logo} aria-label="Anasayfa">
          <span className={styles.logoIcon}>
            <svg width="36" height="36" viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect width="36" height="36" rx="10" fill="url(#logo-grad)" />
              <path d="M18 8C14 8 11 11.5 11 15.5C11 19.5 13.5 22 15 24C16 25.3 17 27 18 28C19 27 20 25.3 21 24C22.5 22 25 19.5 25 15.5C25 11.5 22 8 18 8Z" fill="white" opacity="0.9"/>
              <path d="M18 12C16.3 12 15 13.5 15 15.2C15 17.5 18 20 18 20C18 20 21 17.5 21 15.2C21 13.5 19.7 12 18 12Z" fill="url(#logo-grad2)" />
              <defs>
                <linearGradient id="logo-grad" x1="0" y1="0" x2="36" y2="36" gradientUnits="userSpaceOnUse">
                  <stop stopColor="#00b4d8"/>
                  <stop offset="1" stopColor="#0096b7"/>
                </linearGradient>
                <linearGradient id="logo-grad2" x1="15" y1="12" x2="21" y2="20" gradientUnits="userSpaceOnUse">
                  <stop stopColor="#00b4d8"/>
                  <stop offset="1" stopColor="#0096b7"/>
                </linearGradient>
              </defs>
            </svg>
          </span>
          <div className={styles.logoText}>
            <span className={styles.logoTitle}>Turhal</span>
            <span className={styles.logoSub}>Diş Kliniği</span>
          </div>
        </Link>

        {/* Desktop Menu */}
        <ul className={styles.menu}>
          {NAV_ITEMS.map((item) => {
            const linkHref = item.href.startsWith('#')
              ? pathname === '/'
                ? item.href
                : `/${item.href}`
              : item.href;

            return (
              <li key={item.href}>
                <a
                  href={linkHref}
                  className={styles.menuLink}
                  onClick={(e) => handleNavClick(e, item.href)}
                >
                  {item.label}
                </a>
              </li>
            );
          })}
        </ul>

        {/* CTA + Mobile Toggle */}
        <div className={styles.actions}>
          <a href={`tel:${CLINIC.contact.phoneRaw}`} className={styles.phoneLink} aria-label="Bizi arayın">
            <Phone size={18} />
            <span>{CLINIC.contact.phone}</span>
          </a>
          <Link
            href="/randevu"
            className={styles.ctaBtn}
            aria-label="Randevu Al"
          >
            Randevu Al
          </Link>
          <button
            className={styles.hamburger}
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label={mobileOpen ? 'Menüyü kapat' : 'Menüyü aç'}
            aria-expanded={mobileOpen}
          >
            {mobileOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <div className={`${styles.mobileMenu} ${mobileOpen ? styles.mobileOpen : ''}`}>
        <div className={styles.mobileInner}>
          <ul className={styles.mobileList}>
            {NAV_ITEMS.map((item, i) => {
              const linkHref = item.href.startsWith('#')
                ? pathname === '/'
                  ? item.href
                  : `/${item.href}`
                : item.href;

              return (
                <li key={item.href} style={{ animationDelay: `${i * 50}ms` }}>
                  <a
                    href={linkHref}
                    className={styles.mobileLink}
                    onClick={(e) => handleNavClick(e, item.href)}
                  >
                    {item.label}
                  </a>
                </li>
              );
            })}
          </ul>
          <div className={styles.mobileCta}>
            <Link
              href="/randevu"
              className={styles.mobileCtaBtn}
              onClick={() => setMobileOpen(false)}
            >
              Randevu Al
            </Link>
            <a href={`tel:${CLINIC.contact.phoneRaw}`} className={styles.mobilePhoneBtn}>
              <Phone size={18} />
              {CLINIC.contact.phone}
            </a>
          </div>
        </div>
      </div>
    </nav>
  );
}
