'use client';

import { MapPin, Phone, Clock, Navigation } from 'lucide-react';
import { CLINIC } from '@/config/clinic';
import SectionHeader from '@/components/ui/SectionHeader';
import ScrollReveal from '@/components/ui/ScrollReveal';
import Button from '@/components/ui/Button';
import styles from './Location.module.css';

export default function Location() {
  return (
    <section id="konum" className={`section ${styles.location}`}>
      <div className="container">
        <ScrollReveal>
          <SectionHeader
            badge="Konum"
            title="Bizi"
            highlight="ziyaret edin"
            description="Turhal'ın merkezinde, kolayca ulaşabileceğiniz konumdayız."
          />
        </ScrollReveal>

        <div className={styles.grid}>
          {/* Info Card */}
          <ScrollReveal direction="left">
            <div className={styles.infoCard}>
              <div className={styles.infoItem}>
                <div className={styles.infoIcon}>
                  <MapPin size={22} />
                </div>
                <div>
                  <h3 className={styles.infoLabel}>Adres</h3>
                  <p className={styles.infoText}>{CLINIC.address.full}</p>
                </div>
              </div>

              <div className={styles.infoItem}>
                <div className={styles.infoIcon}>
                  <Phone size={22} />
                </div>
                <div>
                  <h3 className={styles.infoLabel}>Telefon</h3>
                  <p className={styles.infoText}>
                    <a href={`tel:${CLINIC.contact.phoneRaw}`}>{CLINIC.contact.phone}</a>
                  </p>
                  <p className={styles.infoSub}>
                    WhatsApp: <a href={`https://wa.me/${CLINIC.contact.whatsappRaw}`}>{CLINIC.contact.whatsapp}</a>
                  </p>
                </div>
              </div>

              <div className={styles.infoItem}>
                <div className={styles.infoIcon}>
                  <Clock size={22} />
                </div>
                <div>
                  <h3 className={styles.infoLabel}>Çalışma Saatleri</h3>
                  <p className={styles.infoText}>{CLINIC.hours.label}: {CLINIC.hours.weekdays}</p>
                  <p className={styles.infoSub}>Pazar: {CLINIC.hours.sunday}</p>
                </div>
              </div>

              <Button
                variant="primary"
                size="lg"
                href={CLINIC.social.googleMaps}
                target="_blank"
                rel="noopener noreferrer"
                icon={<Navigation size={18} />}
                fullWidth
              >
                Yol Tarifi Al
              </Button>
            </div>
          </ScrollReveal>

          {/* Map */}
          <ScrollReveal direction="right">
            <div className={styles.mapWrapper}>
              <iframe
                src={CLINIC.maps.embedUrl}
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="Özel Turhal Ağız ve Diş Sağlığı Polikliniği Konum"
                className={styles.mapFrame}
              />
            </div>
          </ScrollReveal>
        </div>
      </div>
    </section>
  );
}
