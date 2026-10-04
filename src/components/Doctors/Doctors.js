'use client';

import Image from 'next/image';
import { Calendar } from 'lucide-react';
import { CLINIC } from '@/config/clinic';
import SectionHeader from '@/components/ui/SectionHeader';
import ScrollReveal from '@/components/ui/ScrollReveal';
import Button from '@/components/ui/Button';
import styles from './Doctors.module.css';

export default function Doctors({ onAppointmentClick }) {
  return (
    <section id="hekimlerimiz" className={`section ${styles.doctors}`}>
      <div className="container">
        <ScrollReveal>
          <SectionHeader
            badge="Hekim Kadromuz"
            title="Deneyimli"
            highlight="hekimlerimiz"
            description="Alanında uzman hekim kadromuz, en son teknoloji ve tedavi yöntemlerini kullanarak sağlığınızı öncelikli kılar."
          />
        </ScrollReveal>

        <div className={styles.grid}>
          {CLINIC.doctors.map((doctor, i) => (
            <ScrollReveal key={doctor.id} delay={i * 150}>
              <div className={styles.card}>
                <div className={styles.imageWrapper}>
                  <Image
                    src={doctor.image}
                    alt={`${doctor.name} - ${doctor.title}`}
                    width={400}
                    height={400}
                    className={styles.image}
                  />
                  <div className={styles.imageOverlay} />
                </div>
                <div className={styles.info}>
                  <span className={styles.specialty}>{doctor.specialty}</span>
                  <h3 className={styles.name}>{doctor.name}</h3>
                  <p className={styles.title}>{doctor.title}</p>
                  <p className={styles.bio}>{doctor.bio}</p>
                  <Button
                    variant="primary"
                    size="sm"
                    href={`/randevu?doctor=${doctor.id}`}
                    icon={<Calendar size={16} />}
                  >
                    Randevu Al
                  </Button>
                </div>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
}
