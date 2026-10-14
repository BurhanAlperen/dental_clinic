'use client';

import { useState, useEffect } from 'react';
import { Star, ExternalLink, MapPin, AlertCircle } from 'lucide-react';
import { CLINIC } from '@/config/clinic';
import SectionHeader from '@/components/ui/SectionHeader';
import ScrollReveal from '@/components/ui/ScrollReveal';
import Button from '@/components/ui/Button';
import styles from './Reviews.module.css';

function StarRating({ rating }) {
  return (
    <div className={styles.stars}>
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          size={16}
          fill={star <= rating ? '#f59e0b' : 'transparent'}
          color={star <= rating ? '#f59e0b' : '#d1d5db'}
          strokeWidth={1.5}
        />
      ))}
    </div>
  );
}

/**
 * Verilen yorum listesinden rastgele 4 tanesini seçer.
 * Her sayfa yenilendiğinde farklı yorumların görünmesini sağlar.
 */
function pickRandomFour(items) {
  if (!items || items.length === 0) return [];
  if (items.length <= 4) return [...items];
  const shuffled = [...items].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, 4);
}

export default function Reviews() {
  const [reviews, setReviews] = useState([]);
  const [rating, setRating] = useState(CLINIC.reviews.rating);
  const [totalReviews, setTotalReviews] = useState(CLINIC.reviews.totalReviews);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    let isMounted = true;

    async function loadReviews() {
      try {
        setLoading(true);
        setError(false);
        const res = await fetch('/api/reviews', { cache: 'no-store' });
        if (!res.ok) throw new Error('API yanıt vermedi');
        const data = await res.json();

        if (isMounted) {
          if (data.success && Array.isArray(data.reviews) && data.reviews.length > 0) {
            // Sitede HER ZAMAN yalnızca 4 yorum gösterilsin kuralı
            const selectedFour = pickRandomFour(data.reviews);
            setReviews(selectedFour);
            if (data.rating) setRating(data.rating);
            if (data.totalReviews) setTotalReviews(data.totalReviews);
          } else {
            // Canlı yorum alınamadı - sahte veri yok
            setReviews([]);
            setError(true);
          }
        }
      } catch (err) {
        if (isMounted) {
          console.error('Yorumlar yüklenirken hata:', err);
          setReviews([]);
          setError(true);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    loadReviews();

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <section id="yorumlar" className={`section ${styles.reviews}`}>
      <div className="container">
        <ScrollReveal>
          <SectionHeader
            badge="Hasta Yorumları"
            title="Hastalarımız"
            highlight="ne diyor?"
            description="Google üzerindeki gerçek hasta yorumlarımız ve değerlendirmelerimiz."
          />
        </ScrollReveal>

        {/* Trust Score */}
        <ScrollReveal>
          <div className={styles.trustScore}>
            <div className={styles.trustLeft}>
              <div className={styles.googleLogo}>
                <svg viewBox="0 0 24 24" width="28" height="28">
                  <path
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
                    fill="#4285F4"
                  />
                  <path
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    fill="#34A853"
                  />
                  <path
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    fill="#FBBC05"
                  />
                  <path
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    fill="#EA4335"
                  />
                </svg>
              </div>
              <div className={styles.trustInfo}>
                <div className={styles.trustRating}>
                  <span className={styles.ratingNumber}>{rating}</span>
                  <span className={styles.ratingMax}>/ 5</span>
                </div>
                <StarRating rating={5} />
                <span className={styles.reviewCount}>
                  {totalReviews} değerlendirme
                </span>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              href={CLINIC.reviews.googleUrl}
              target="_blank"
              rel="noopener noreferrer"
              icon={<ExternalLink size={16} />}
              iconPosition="right"
            >
              Google Yorumlarını Oku
            </Button>
          </div>
        </ScrollReveal>

        {/* Loading Skeleton - 4 Kart */}
        {loading && (
          <div className={styles.reviewGrid}>
            {[1, 2, 3, 4].map((n) => (
              <div key={n} className={styles.skeletonCard}>
                <div className={styles.reviewHeader}>
                  <div className={styles.skeletonAvatar} />
                  <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 6 }}>
                    <div className={`${styles.skeletonLine} ${styles.skeletonLineShort}`} />
                    <div className={`${styles.skeletonLine} ${styles.skeletonLineMid}`} style={{ height: 10 }} />
                  </div>
                </div>
                <div className={`${styles.skeletonLine} ${styles.skeletonLineMid}`} />
                <div className={styles.skeletonLine} />
              </div>
            ))}
          </div>
        )}

        {/* Error / Empty State - Sahte Yorum Yok */}
        {!loading && (error || reviews.length === 0) && (
          <div className={styles.emptyState}>
            <AlertCircle className={styles.emptyIcon} />
            <h3 className={styles.emptyTitle}>Google Yorumları Yüklenemiyor</h3>
            <p className={styles.emptyText}>
              Şu anda Google Haritalar üzerindeki yorumlarımıza ulaşılamadı. Kliniğimizin tüm hasta
              deneyimlerini ve 58 değerlendirmesini doğrudan Google Haritalar profilimiz üzerinden
              inceleyebilirsiniz.
            </p>
            <Button
              variant="primary"
              size="md"
              href={CLINIC.reviews.googleUrl}
              target="_blank"
              rel="noopener noreferrer"
              icon={<ExternalLink size={16} />}
              iconPosition="right"
            >
              Google Haritalar&apos;da İncele
            </Button>
          </div>
        )}

        {/* Gerçek Google Yorumları - HER ZAMAN YALNIZCA 4 YORUM */}
        {!loading && !error && reviews.length > 0 && (
          <div className={styles.reviewGrid}>
            {reviews.map((review, i) => (
              <ScrollReveal key={review.id || i} delay={i * 80}>
                <div className={styles.reviewCard}>
                  <div className={styles.reviewHeader}>
                    {review.avatar ? (
                      <img
                        src={review.avatar}
                        alt={review.author}
                        className={styles.avatar}
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      <div className={styles.avatar}>
                        {review.author ? review.author.charAt(0) : 'G'}
                      </div>
                    )}
                    <div>
                      <h4 className={styles.authorName}>{review.author}</h4>
                      <span className={styles.timeAgo}>{review.timeAgo}</span>
                    </div>
                  </div>
                  <StarRating rating={review.rating} />
                  <p className={styles.reviewText}>{review.text}</p>
                  <div className={styles.googleBadge}>
                    <svg viewBox="0 0 24 24" width="14" height="14">
                      <path
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
                        fill="#4285F4"
                      />
                      <path
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                        fill="#34A853"
                      />
                      <path
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                        fill="#FBBC05"
                      />
                      <path
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                        fill="#EA4335"
                      />
                    </svg>
                    <span>Google Doğrulanmış Yorum</span>
                  </div>
                </div>
              </ScrollReveal>
            ))}
          </div>
        )}

        {/* CTA */}
        <ScrollReveal>
          <div className={styles.bottomCta}>
            <Button
              variant="primary"
              href={CLINIC.reviews.googleUrl}
              target="_blank"
              rel="noopener noreferrer"
              icon={<ExternalLink size={16} />}
              iconPosition="right"
            >
              Tüm Google Yorumlarını Oku
            </Button>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
