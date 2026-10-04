import Link from 'next/link';
import { Phone, MessageCircle, Calendar } from 'lucide-react';
import { CLINIC } from '@/config/clinic';
import styles from './MobileActionBar.module.css';

export default function MobileActionBar({ onAppointmentClick }) {
  return (
    <div className={styles.bar} role="navigation" aria-label="Hızlı işlemler">
      <a
        href={`tel:${CLINIC.contact.phoneRaw}`}
        className={styles.action}
        aria-label="Telefonla ara"
      >
        <Phone size={20} />
        <span>Ara</span>
      </a>
      <a
        href={`https://wa.me/${CLINIC.contact.whatsappRaw}`}
        target="_blank"
        rel="noopener noreferrer"
        className={`${styles.action} ${styles.whatsapp}`}
        aria-label="WhatsApp ile mesaj gönder"
      >
        <MessageCircle size={20} />
        <span>WhatsApp</span>
      </a>
      <Link
        href="/randevu"
        className={`${styles.action} ${styles.appointment}`}
        aria-label="Randevu al"
      >
        <Calendar size={20} />
        <span>Randevu Al</span>
      </Link>
    </div>
  );
}
