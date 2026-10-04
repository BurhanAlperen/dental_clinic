'use client';

import { useEffect } from 'react';
import { Check, X, Calendar, User, Stethoscope } from 'lucide-react';
import styles from './ToastNotification.module.css';

export default function ToastNotification({ notification, onClose }) {
  useEffect(() => {
    if (!notification) return;
    const timer = setTimeout(() => {
      onClose();
    }, 7000);
    return () => clearTimeout(timer);
  }, [notification, onClose]);

  if (!notification) return null;

  return (
    <div className={styles.toastOverlay} role="alert" aria-live="assertive">
      <div className={styles.toastCard}>
        {/* Animated Green Checkmark Circle */}
        <div className={styles.checkCircle}>
          <svg className={styles.checkSvg} viewBox="0 0 52 52">
            <circle className={styles.checkCircleBg} cx="26" cy="26" r="25" fill="none" />
            <path className={styles.checkCheck} fill="none" d="M14.1 27.2l7.1 7.2 16.7-16.8" />
          </svg>
        </div>

        {/* Content */}
        <div className={styles.content}>
          <div className={styles.header}>
            <h4 className={styles.title}>Randevunuz Oluşturuldu!</h4>
            <span className={styles.badge}>Başarılı</span>
          </div>
          <p className={styles.message}>
            Randevu talebiniz sisteme başarıyla kaydedildi. En kısa sürede sizinle iletişime geçilecektir.
          </p>

          {/* Details */}
          {notification.appointment && (
            <div className={styles.details}>
              <div className={styles.detailItem}>
                <Stethoscope size={14} className={styles.detailIcon} />
                <span>{notification.appointment.doctorName}</span>
              </div>
              <div className={styles.detailItem}>
                <Calendar size={14} className={styles.detailIcon} />
                <span>
                  {notification.appointment.date} • Saat {notification.appointment.time}
                </span>
              </div>
              <div className={styles.detailItem}>
                <User size={14} className={styles.detailIcon} />
                <span>
                  {notification.appointment.firstName} {notification.appointment.lastName}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Close button */}
        <button
          type="button"
          className={styles.closeBtn}
          onClick={onClose}
          aria-label="Bildirimi kapat"
        >
          <X size={16} />
        </button>

        {/* Progress bar */}
        <div className={styles.progressBar} />
      </div>
    </div>
  );
}
