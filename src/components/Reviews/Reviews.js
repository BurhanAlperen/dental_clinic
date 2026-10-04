'use client';

import { Star, ExternalLink } from 'lucide-react';
import { CLINIC } from '@/config/clinic';
import SectionHeader from '@/components/ui/SectionHeader';
import ScrollReveal from '@/components/ui/ScrollReveal';
import Button from '@/components/ui/Button';
import styles from './Reviews.module.css';

const SAMPLE_REVIEWS = [
  {
    id: 1,
    author: 'Ahmet Y.',
    rating: 5,
    text: 'Harika bir klinik! Mustafa Bey çok ilgili ve başarılı bir hekim. Tedavimden çok memnun kaldım. Kesinlikle tavsiye ederim.',
    timeAgo: '2 ay önce',
  },
  {
    id: 2,
    author: 'Elif K.',
    rating: 5,
    text: 'Ceren Hanım çok güler yüzlü ve profesyonel. Diş tedavimden hiç korkmadım. Klinik çok temiz ve modern.',
    timeAgo: '1 ay önce',
  },
  {
    id: 3,
    author: 'Mehmet A.',
    rating: 5,
    text: 'İmplant tedavimi burada yaptırdım. Sonuç mükemmel oldu. Tüm ekibe teşekkür ederim, çok memnunum.',
    timeAgo: '3 hafta önce',
  },
  {
    id: 4,
    author: 'Zeynep T.',
    rating: 5,
    text: 'Çocuğumu ilk defa dişçiye götürdüm ve hiç ağlamadı. Çok sabırlı ve ilgili bir ekip. Turhal\'ın en iyi diş kliniği!',
    timeAgo: '1 hafta önce',
  },
];

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

export default function Reviews() {
  return (
    <section id="yorumlar" className={`section ${styles.reviews}`}>
      <div className="container">
        <ScrollReveal>
          <SectionHeader
            badge="Hasta Yorumları"
            title="Hastalarımız"
            highlight="ne diyor?"
            description="Google üzerindeki hasta yorumlarımız ve değerlendirmelerimiz."
          />
        </ScrollReveal>

        {/* Trust Score */}
        <ScrollReveal>
          <div className={styles.trustScore}>
            <div className={styles.trustLeft}>
              <div className={styles.googleLogo}>
                <svg viewBox="0 0 24 24" width="28" height="28">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                </svg>
              </div>
              <div className={styles.trustInfo}>
                <div className={styles.trustRating}>
                  <span className={styles.ratingNumber}>{CLINIC.reviews.rating}</span>
                  <span className={styles.ratingMax}>/ 5</span>
                </div>
                <StarRating rating={5} />
                <span className={styles.reviewCount}>
                  {CLINIC.reviews.totalReviews} değerlendirme
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

        {/* Review Cards */}
        <div className={styles.reviewGrid}>
          {SAMPLE_REVIEWS.map((review, i) => (
            <ScrollReveal key={review.id} delay={i * 100}>
              <div className={styles.reviewCard}>
                <div className={styles.reviewHeader}>
                  <div className={styles.avatar}>
                    {review.author.charAt(0)}
                  </div>
                  <div>
                    <h4 className={styles.authorName}>{review.author}</h4>
                    <span className={styles.timeAgo}>{review.timeAgo}</span>
                  </div>
                </div>
                <StarRating rating={review.rating} />
                <p className={styles.reviewText}>{review.text}</p>
                <div className={styles.googleBadge}>
                  <svg viewBox="0 0 24 24" width="14" height="14">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                  </svg>
                  <span>Google Yorumu</span>
                </div>
              </div>
            </ScrollReveal>
          ))}
        </div>

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
