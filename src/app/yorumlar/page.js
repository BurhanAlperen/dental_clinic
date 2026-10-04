'use client';

import { Star, ExternalLink, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { CLINIC } from '@/config/clinic';
import Button from '@/components/ui/Button';
import Navbar from '@/components/Navbar/Navbar';
import Footer from '@/components/Footer/Footer';
import AppointmentModal from '@/components/AppointmentModal/AppointmentModal';
import MobileActionBar from '@/components/MobileActionBar/MobileActionBar';
import { useState } from 'react';
import styles from './page.module.css';

const ALL_REVIEWS = [
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
  {
    id: 5,
    author: 'Ali R.',
    rating: 5,
    text: 'Dolgu tedavimi burada yaptırdım. Çok hızlı ve ağrısız bir şekilde tamamlandı. Teşekkürler.',
    timeAgo: '2 hafta önce',
  },
  {
    id: 6,
    author: 'Fatma S.',
    rating: 4,
    text: 'Diş beyazlatma tedavisi için geldim. Sonuçlardan memnunum, klinik çok temiz ve hijyenik.',
    timeAgo: '1 ay önce',
  },
];

function StarRating({ rating, size = 16 }) {
  return (
    <div className={styles.stars}>
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          size={size}
          fill={star <= rating ? '#f59e0b' : 'transparent'}
          color={star <= rating ? '#f59e0b' : '#d1d5db'}
          strokeWidth={1.5}
        />
      ))}
    </div>
  );
}

export default function YorumlarPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      <Navbar onAppointmentClick={() => setIsModalOpen(true)} />
      <main className={styles.main}>
        <div className="container">
          {/* Back link */}
          <Link href="/" className={styles.backLink}>
            <ArrowLeft size={18} />
            Anasayfa
          </Link>

          {/* Header */}
          <div className={styles.header}>
            <h1 className={styles.title}>Google Yorumları</h1>
            <p className={styles.subtitle}>
              Hastalarımızın {CLINIC.name} hakkındaki değerlendirmeleri
            </p>
          </div>

          {/* Summary Card */}
          <div className={styles.summaryCard}>
            <div className={styles.summaryLeft}>
              <span className={styles.summaryRating}>{CLINIC.reviews.rating}</span>
              <StarRating rating={5} size={24} />
              <span className={styles.summaryCount}>
                {CLINIC.reviews.totalReviews} Google değerlendirmesi
              </span>
            </div>
            <div className={styles.summaryBars}>
              {[
                { stars: 5, percent: 92 },
                { stars: 4, percent: 6 },
                { stars: 3, percent: 2 },
                { stars: 2, percent: 0 },
                { stars: 1, percent: 0 },
              ].map((bar) => (
                <div key={bar.stars} className={styles.barRow}>
                  <span className={styles.barLabel}>{bar.stars}</span>
                  <Star size={12} fill="#f59e0b" color="#f59e0b" />
                  <div className={styles.barTrack}>
                    <div className={styles.barFill} style={{ width: `${bar.percent}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Reviews List */}
          <div className={styles.reviewList}>
            {ALL_REVIEWS.map((review) => (
              <div key={review.id} className={styles.reviewCard}>
                <div className={styles.reviewHeader}>
                  <div className={styles.avatar}>{review.author.charAt(0)}</div>
                  <div>
                    <h3 className={styles.authorName}>{review.author}</h3>
                    <span className={styles.timeAgo}>{review.timeAgo}</span>
                  </div>
                </div>
                <StarRating rating={review.rating} />
                <p className={styles.reviewText}>{review.text}</p>
              </div>
            ))}
          </div>

          {/* Google CTA */}
          <div className={styles.googleCta}>
            <p className={styles.ctaText}>Tüm yorumları Google Maps üzerinde görüntüleyin</p>
            <Button
              variant="primary"
              size="lg"
              href={CLINIC.reviews.googleUrl}
              target="_blank"
              rel="noopener noreferrer"
              icon={<ExternalLink size={18} />}
              iconPosition="right"
            >
              Google Maps&apos;te Tüm Yorumları Gör
            </Button>
          </div>
        </div>
      </main>
      <Footer />
      <MobileActionBar onAppointmentClick={() => setIsModalOpen(true)} />
      <AppointmentModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </>
  );
}
