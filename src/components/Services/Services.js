'use client';

import { Drill, SmilePlus, Sparkles, Shield, Baby, CircleDot } from 'lucide-react';
import { CLINIC } from '@/config/clinic';
import SectionHeader from '@/components/ui/SectionHeader';
import ScrollReveal from '@/components/ui/ScrollReveal';
import styles from './Services.module.css';

const iconMap = {
  Drill,
  SmilePlus,
  Sparkles,
  Shield,
  Baby,
  CircleDot,
};

export default function Services() {
  return (
    <section id="hakkimizda" className={`section ${styles.services}`}>
      <div className="container">
        <ScrollReveal>
          <SectionHeader
            badge="Hizmetlerimiz"
            title="Uzman ekibimizle"
            highlight="yanınızdayız"
            description="Modern tedavi yöntemleri ve deneyimli hekim kadromuzla tüm ağız ve diş sağlığı ihtiyaçlarınız için hizmetinizdeyiz."
          />
        </ScrollReveal>

        <div className={styles.grid}>
          {CLINIC.services.map((service, i) => {
            const Icon = iconMap[service.icon] || CircleDot;
            return (
              <ScrollReveal key={service.id} delay={i * 80}>
                <div className={styles.card}>
                  <div className={styles.iconWrapper}>
                    <Icon size={28} strokeWidth={1.5} />
                  </div>
                  <h3 className={styles.cardTitle}>{service.title}</h3>
                  <p className={styles.cardDesc}>{service.description}</p>
                  <div className={styles.cardLine} />
                </div>
              </ScrollReveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}
