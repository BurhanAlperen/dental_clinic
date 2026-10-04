'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { X, ExternalLink, Camera, Star, ArrowRight } from 'lucide-react';

const InstagramIcon = ({ size = 20 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect width="20" height="20" x="2" y="2" rx="5" ry="5"/>
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
    <line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/>
  </svg>
);
import { GALLERY_CATEGORIES, GALLERY_ITEMS } from '@/data/gallery';
import SectionHeader from '@/components/ui/SectionHeader';
import ScrollReveal from '@/components/ui/ScrollReveal';
import styles from './Gallery.module.css';

export default function Gallery() {
  const [activeCategory, setActiveCategory] = useState('all');
  const [lightbox, setLightbox] = useState(null);

  const filtered =
    activeCategory === 'all'
      ? GALLERY_ITEMS.filter((item) => item.category !== 'hasta')
      : GALLERY_ITEMS.filter((item) => item.category === activeCategory);

  const closeLightbox = () => setLightbox(null);

  return (
    <section id="galeri" className={`section ${styles.gallery}`}>
      <div className="container">
        <ScrollReveal>
          <SectionHeader
            badge="Yaptığımız İşler"
            title="Kliniğimizden"
            highlight="kareler"
            description="Tedavilerimiz, klinik ortamımız ve hasta deneyimlerimizden öne çıkan paylaşımlar."
          />
        </ScrollReveal>

        {/* Category Filter */}
        <ScrollReveal>
          <div className={styles.filters}>
            {GALLERY_CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                className={`${styles.filterBtn} ${activeCategory === cat.id ? styles.filterActive : ''}`}
                onClick={() => setActiveCategory(cat.id)}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </ScrollReveal>

        {/* Grid */}
        <div className={styles.grid}>
          {filtered.map((item, i) => (
            <ScrollReveal key={item.id} delay={i * 80}>
              <div
                className={styles.card}
                onClick={() => setLightbox(item)}
                role="button"
                tabIndex={0}
                aria-label={`${item.title} görselini büyüt`}
                onKeyDown={(e) => e.key === 'Enter' && setLightbox(item)}
              >
                <div className={styles.cardImage}>
                  <Image
                    src={item.image}
                    alt={item.title}
                    width={400}
                    height={400}
                    className={styles.img}
                    loading="lazy"
                  />
                  <div className={styles.cardOverlay}>
                    {item.googleUrl ? (
                      <Star size={24} fill="#f59e0b" color="#f59e0b" />
                    ) : (
                      <InstagramIcon size={24} />
                    )}
                    <span>{item.category === 'hasta' ? 'Yorumu Oku' : 'Görüntüle'}</span>
                  </div>
                </div>
                <div className={styles.cardContent}>
                  <span className={styles.cardCategory}>
                    {GALLERY_CATEGORIES.find((c) => c.id === item.category)?.label}
                  </span>
                  <h3 className={styles.cardTitle}>{item.title}</h3>
                </div>
              </div>
            </ScrollReveal>
          ))}
        </div>

        {/* Hasta Deneyimi - More reviews CTA */}
        {activeCategory === 'hasta' ? (
          <ScrollReveal>
            <div className={styles.moreReviewsContainer}>
              <Link href="/yorumlar" className={styles.moreReviewsBtn}>
                <Star size={18} fill="#f59e0b" color="#f59e0b" />
                <span>Daha fazla yoruma göz at</span>
                <ArrowRight size={18} />
              </Link>
            </div>
          </ScrollReveal>
        ) : (
          /* Follow CTA */
          <ScrollReveal>
            <div className={styles.followCta}>
              <InstagramIcon size={20} />
              <span>Daha fazlası için</span>
              <a
                href="https://www.instagram.com/turhaldisklinigi/"
                target="_blank"
                rel="noopener noreferrer"
                className={styles.followLink}
              >
                @turhaldisklinigi
              </a>
              <span>hesabımızı takip edin</span>
            </div>
          </ScrollReveal>
        )}
      </div>

      {/* Lightbox */}
      {lightbox && (
        <div className={styles.lightbox} onClick={closeLightbox} role="dialog" aria-modal="true" aria-label="Görsel büyütme">
          <button className={styles.lightboxClose} onClick={closeLightbox} aria-label="Kapat">
            <X size={24} />
          </button>
          <div className={styles.lightboxContent} onClick={(e) => e.stopPropagation()}>
            <div className={styles.lightboxImage}>
              <Image
                src={lightbox.image}
                alt={lightbox.title}
                width={800}
                height={800}
                className={styles.lightboxImg}
              />
            </div>
            <div className={styles.lightboxInfo}>
              <h3 className={styles.lightboxTitle}>{lightbox.title}</h3>
              <p className={styles.lightboxDesc}>{lightbox.description}</p>
              {lightbox.googleUrl ? (
                <a
                  href={lightbox.googleUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={styles.lightboxLink}
                >
                  <ExternalLink size={16} />
                  Google Haritalar&apos;da Gör
                </a>
              ) : lightbox.instagramUrl ? (
                <a
                  href={lightbox.instagramUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={styles.lightboxLink}
                >
                  <ExternalLink size={16} />
                  Instagram&apos;da Gör
                </a>
              ) : null}
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
