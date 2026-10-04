import Link from 'next/link';
import { Phone, MapPin, Clock, MessageCircle, ExternalLink } from 'lucide-react';

const InstagramIcon = ({ size = 20 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect width="20" height="20" x="2" y="2" rx="5" ry="5"/>
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
    <line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/>
  </svg>
);
import { CLINIC } from '@/config/clinic';
import styles from './Footer.module.css';

const QUICK_LINKS = [
  { label: 'Anasayfa', href: '/#hero' },
  { label: 'Hakkımızda', href: '/#hakkimizda' },
  { label: 'Yaptığımız İşler', href: '/#galeri' },
  { label: 'Yorumlar', href: '/yorumlar' },
  { label: 'Konum', href: '/#konum' },
];

const SERVICES = [
  'İmplant Tedavisi',
  'Ortodonti',
  'Estetik Diş Hekimliği',
  'Kanal Tedavisi',
  'Çocuk Diş Hekimliği',
  'Protez Tedavisi',
];

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={`container ${styles.container}`}>
        {/* Brand */}
        <div className={styles.brand}>
          <div className={styles.logo}>
            <svg width="36" height="36" viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect width="36" height="36" rx="10" fill="url(#footer-logo-grad)" />
              <path d="M18 8C14 8 11 11.5 11 15.5C11 19.5 13.5 22 15 24C16 25.3 17 27 18 28C19 27 20 25.3 21 24C22.5 22 25 19.5 25 15.5C25 11.5 22 8 18 8Z" fill="white" opacity="0.9"/>
              <path d="M18 12C16.3 12 15 13.5 15 15.2C15 17.5 18 20 18 20C18 20 21 17.5 21 15.2C21 13.5 19.7 12 18 12Z" fill="url(#footer-logo-grad2)" />
              <defs>
                <linearGradient id="footer-logo-grad" x1="0" y1="0" x2="36" y2="36" gradientUnits="userSpaceOnUse">
                  <stop stopColor="#48cae4"/>
                  <stop offset="1" stopColor="#00b4d8"/>
                </linearGradient>
                <linearGradient id="footer-logo-grad2" x1="15" y1="12" x2="21" y2="20" gradientUnits="userSpaceOnUse">
                  <stop stopColor="#48cae4"/>
                  <stop offset="1" stopColor="#00b4d8"/>
                </linearGradient>
              </defs>
            </svg>
            <div>
              <h3 className={styles.logoTitle}>Turhal Diş Kliniği</h3>
              <p className={styles.logoSub}>Ağız ve Diş Sağlığı Polikliniği</p>
            </div>
          </div>
          <p className={styles.brandDesc}>
            Modern tedavi yaklaşımı ve hasta odaklı hizmet anlayışıyla Turhal&apos;da sağlıklı gülüşler için yanınızdayız.
          </p>

          {/* Social Icons */}
          <div className={styles.socials}>
            <a
              href={`https://wa.me/${CLINIC.contact.whatsappRaw}`}
              target="_blank"
              rel="noopener noreferrer"
              className={styles.socialLink}
              aria-label="WhatsApp"
            >
              <MessageCircle size={20} />
            </a>
            <a
              href={CLINIC.social.instagram}
              target="_blank"
              rel="noopener noreferrer"
              className={styles.socialLink}
              aria-label="Instagram"
            >
              <InstagramIcon size={20} />
            </a>
            <a
              href={CLINIC.social.googleMaps}
              target="_blank"
              rel="noopener noreferrer"
              className={styles.socialLink}
              aria-label="Google Maps"
            >
              <MapPin size={20} />
            </a>
          </div>
        </div>

        {/* Quick Links */}
        <div className={styles.column}>
          <h4 className={styles.columnTitle}>Hızlı Erişim</h4>
          <ul className={styles.linkList}>
            {QUICK_LINKS.map((link) => (
              <li key={link.href}>
                <Link href={link.href} className={styles.link}>{link.label}</Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Services */}
        <div className={styles.column}>
          <h4 className={styles.columnTitle}>Hizmetlerimiz</h4>
          <ul className={styles.linkList}>
            {SERVICES.map((service) => (
              <li key={service}>
                <span className={styles.serviceItem}>{service}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Contact */}
        <div className={styles.column}>
          <h4 className={styles.columnTitle}>İletişim</h4>
          <div className={styles.contactList}>
            <div className={styles.contactItem}>
              <MapPin size={16} className={styles.contactIcon} />
              <span>{CLINIC.address.full}</span>
            </div>
            <div className={styles.contactItem}>
              <Phone size={16} className={styles.contactIcon} />
              <a href={`tel:${CLINIC.contact.phoneRaw}`}>{CLINIC.contact.phone}</a>
            </div>
            <div className={styles.contactItem}>
              <Clock size={16} className={styles.contactIcon} />
              <div>
                <span>{CLINIC.hours.label}: {CLINIC.hours.weekdays}</span>
                <br />
                <span className={styles.sunday}>Pazar: {CLINIC.hours.sunday}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className={styles.bottom}>
        <div className={`container ${styles.bottomInner}`}>
          <p className={styles.copyright}>
            © {new Date().getFullYear()} {CLINIC.name}. Tüm hakları saklıdır.
          </p>
        </div>
      </div>
    </footer>
  );
}
