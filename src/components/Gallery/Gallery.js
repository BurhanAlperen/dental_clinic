'use client';

import { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { X, ExternalLink, Star, ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react';
import { GALLERY_CATEGORIES, GALLERY_ITEMS } from '@/data/gallery';
import SectionHeader from '@/components/ui/SectionHeader';
import ScrollReveal from '@/components/ui/ScrollReveal';
import styles from './Gallery.module.css';

const InstagramIcon = ({ size = 20 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect width="20" height="20" x="2" y="2" rx="5" ry="5"/>
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
    <line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/>
  </svg>
);

export default function Gallery() {
  const [activeCategory, setActiveCategory] = useState('all');
  const [lightboxIndex, setLightboxIndex] = useState(null);
  const [touchStart, setTouchStart] = useState(null);
  const [touchEnd, setTouchEnd] = useState(null);

  const filtered =
    activeCategory === 'all'
      ? GALLERY_ITEMS.filter((item) => item.category !== 'hasta')
      : GALLERY_ITEMS.filter((item) => item.category === activeCategory);

  const currentItem = lightboxIndex !== null && filtered[lightboxIndex] ? filtered[lightboxIndex] : null;

  const closeLightbox = useCallback(() => setLightboxIndex(null), []);

  const goToPrev = useCallback((e) => {
    if (e) e.stopPropagation();
    setLightboxIndex((prev) => {
      if (prev === null) return 0;
      return prev > 0 ? prev - 1 : filtered.length - 1;
    });
  }, [filtered.length]);

  const goToNext = useCallback((e) => {
    if (e) e.stopPropagation();
    setLightboxIndex((prev) => {
      if (prev === null) return 0;
      return prev < filtered.length - 1 ? prev + 1 : 0;
    });
  }, [filtered.length]);

  // Klavye ok tuşları ve ESC ile geçiş
  useEffect(() => {
    if (lightboxIndex === null) return;

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        closeLightbox();
      } else if (e.key === 'ArrowLeft') {
        goToPrev();
      } else if (e.key === 'ArrowRight') {
        goToNext();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = originalOverflow;
    };
  }, [lightboxIndex, closeLightbox, goToPrev, goToNext]);

  // Mobil kaydırma (Swipe) desteği
  const handleTouchStart = (e) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    const distance = touchStart - touchEnd;
    const minSwipeDistance = 45;
    if (distance > minSwipeDistance) {
      goToNext();
    } else if (distance < -minSwipeDistance) {
      goToPrev();
    }
  };

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
                onClick={() => {
                  setActiveCategory(cat.id);
                  setLightboxIndex(null);
                }}
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
                onClick={() => setLightboxIndex(i)}
                role="button"
                tabIndex={0}
                aria-label={`${item.title} görselini büyüt`}
                onKeyDown={(e) => e.key === 'Enter' && setLightboxIndex(i)}
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

      {/* Kompakt & Geçişli Lightbox Modal */}
      {currentItem && (
        <div
          className={styles.lightbox}
          onClick={closeLightbox}
          role="dialog"
          aria-modal="true"
          aria-label="Görsel büyütme"
        >
          {/* Kapat Butonu */}
          <button
            className={styles.lightboxClose}
            onClick={closeLightbox}
            aria-label="Kapat"
          >
            <X size={20} />
          </button>

          {/* Sol / Önceki Butonu */}
          {filtered.length > 1 && (
            <button
              className={`${styles.lightboxNavBtn} ${styles.lightboxNavPrev}`}
              onClick={goToPrev}
              aria-label="Önceki"
            >
              <ChevronLeft size={24} />
            </button>
          )}

          {/* Sağ / Sonraki Butonu */}
          {filtered.length > 1 && (
            <button
              className={`${styles.lightboxNavBtn} ${styles.lightboxNavNext}`}
              onClick={goToNext}
              aria-label="Sonraki"
            >
              <ChevronRight size={24} />
            </button>
          )}

          {/* Modal Gövdesi */}
          <div
            className={styles.lightboxContent}
            onClick={(e) => e.stopPropagation()}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
          >
            {/* Görsel Alanı */}
            <div className={styles.lightboxImage}>
              <Image
                key={currentItem.id}
                src={currentItem.image}
                alt={currentItem.title}
                width={600}
                height={600}
                priority
                className={`${styles.lightboxImg} ${currentItem.image.endsWith('.svg') ? styles.svgImage : ''}`}
              />

              {/* Kategori Etiketi */}
              <span className={styles.lightboxBadge}>
                {GALLERY_CATEGORIES.find((c) => c.id === currentItem.category)?.label}
              </span>

              {/* Sayaç Rozeti (Örn: 2 / 3) */}
              {filtered.length > 1 && (
                <span className={styles.lightboxCounter}>
                  {lightboxIndex + 1} / {filtered.length}
                </span>
              )}
            </div>

            {/* Bilgi & İçerik Alanı */}
            <div className={styles.lightboxInfo}>
              <h3 className={styles.lightboxTitle}>{currentItem.title}</h3>
              <p className={styles.lightboxDesc}>{currentItem.description}</p>

              <div className={styles.lightboxActions}>
                {currentItem.googleUrl ? (
                  <a
                    href={currentItem.googleUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={styles.lightboxLink}
                  >
                    <ExternalLink size={15} />
                    Google Haritalar&apos;da Gör
                  </a>
                ) : currentItem.instagramUrl ? (
                  <a
                    href={currentItem.instagramUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={styles.lightboxLink}
                  >
                    <ExternalLink size={15} />
                    Instagram&apos;da Gör
                  </a>
                ) : null}

                {/* Mobil için Alt Navigasyon Kontrolleri */}
                {filtered.length > 1 && (
                  <div className={styles.mobileNavControls}>
                    <button
                      className={styles.mobileNavBtn}
                      onClick={goToPrev}
                      aria-label="Önceki"
                    >
                      <ChevronLeft size={18} />
                    </button>
                    <span className={styles.mobileNavCounter}>
                      {lightboxIndex + 1} / {filtered.length}
                    </span>
                    <button
                      className={styles.mobileNavBtn}
                      onClick={goToNext}
                      aria-label="Sonraki"
                    >
                      <ChevronRight size={18} />
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Nokta Göstergeleri (Dots) */}
            {filtered.length > 1 && filtered.length <= 12 && (
              <div className={styles.lightboxDots}>
                {filtered.map((item, idx) => (
                  <button
                    key={item.id}
                    className={`${styles.lightboxDot} ${idx === lightboxIndex ? styles.lightboxDotActive : ''}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      setLightboxIndex(idx);
                    }}
                    aria-label={`${item.title} (${idx + 1}/${filtered.length})`}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </section>
  );
}
