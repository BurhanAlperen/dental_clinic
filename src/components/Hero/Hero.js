'use client';

import Image from 'next/image';
import { ArrowRight, Phone, Play } from 'lucide-react';
import { CLINIC } from '@/config/clinic';
import Button from '@/components/ui/Button';
import styles from './Hero.module.css';

export default function Hero({ onAppointmentClick }) {
  const scrollToGallery = (e) => {
    e.preventDefault();
    document.querySelector('#galeri')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section id="hero" className={styles.hero}>
      {/* Background decoration */}
      <div className={styles.bgDecor}>
        <div className={styles.bgCircle1} />
        <div className={styles.bgCircle2} />
      </div>

      <div className={`container ${styles.container}`}>
        {/* Left Content */}
        <div className={styles.content}>
          <span className={styles.badge}>
            <span className={styles.badgeDot} />
            Turhal&apos;da sağlıklı gülüşler için
          </span>

          <h1 className={styles.title}>
            Gülüşünüz,
            <br />
            <span className={styles.titleHighlight}>en güzel haline</span>
            <br />
            kavuşsun.
          </h1>

          <p className={styles.description}>
            Özel Turhal Ağız ve Diş Sağlığı Polikliniği&apos;nde uzman hekim kadromuz,
            modern tedavi yaklaşımımız ve hasta odaklı hizmet anlayışımızla
            sağlıklı gülüşler için yanınızdayız.
          </p>

          <div className={styles.buttons}>
            <Button
              variant="primary"
              size="lg"
              href="/randevu"
              icon={<ArrowRight size={18} />}
              iconPosition="right"
            >
              Randevu Oluştur
            </Button>
            <Button
              variant="outline"
              size="lg"
              onClick={scrollToGallery}
              icon={<Play size={16} />}
            >
              Yaptığımız İşleri İncele
            </Button>
          </div>

          {/* Trust indicators */}
          <div className={styles.trust}>
            <div className={styles.trustItem}>
              <span className={styles.trustNumber}>4.9</span>
              <div className={styles.trustStars}>★★★★★</div>
              <span className={styles.trustLabel}>Google Puanı</span>
            </div>
            <div className={styles.trustDivider} />
            <div className={styles.trustItem}>
              <span className={styles.trustNumber}>{CLINIC.doctors.length}</span>
              <span className={styles.trustLabel}>Uzman Hekim</span>
            </div>
            <div className={styles.trustDivider} />
            <div className={styles.trustItem}>
              <span className={styles.trustNumber}>10+</span>
              <span className={styles.trustLabel}>Yıllık Deneyim</span>
            </div>
          </div>
        </div>

        {/* Right Image */}
        <div className={styles.imageWrapper}>
          <div className={styles.imageContainer}>
            <Image
              src="/images/hero/clinic.png"
              alt="Özel Turhal Ağız ve Diş Sağlığı Polikliniği modern tedavi odası"
              width={600}
              height={600}
              priority
              className={styles.heroImage}
            />
          </div>
          {/* Floating card */}
          <div className={styles.floatingCard}>
            <div className={styles.floatingIcon}>
              <Phone size={20} />
            </div>
            <div className={styles.floatingContent}>
              <span className={styles.floatingLabel}>Randevu için bizi arayın</span>
              <a href={`tel:${CLINIC.contact.phoneRaw}`} className={styles.floatingPhone}>
                {CLINIC.contact.phone}
              </a>
            </div>
          </div>

          {/* Decorative elements */}
          <div className={styles.decorDots} />
        </div>
      </div>
    </section>
  );
}
