'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { X, MessageCircle, Phone, Mail, Calendar, User, Send, CheckCircle } from 'lucide-react';
import { CLINIC } from '@/config/clinic';
import styles from './AppointmentModal.module.css';

const TREATMENTS = [
  'İmplant Tedavisi',
  'Ortodonti',
  'Estetik Diş Hekimliği',
  'Kanal Tedavisi',
  'Çocuk Diş Hekimliği',
  'Protez Tedavisi',
  'Diş Beyazlatma',
  'Diş Çekimi',
  'Dolgu',
  'Genel Kontrol',
  'Diğer',
];

export default function AppointmentModal({ isOpen, onClose }) {
  const [form, setForm] = useState({
    name: '',
    phone: '',
    email: '',
    treatment: '',
    date: '',
    message: '',
  });
  const [errors, setErrors] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const modalRef = useRef(null);
  const firstInputRef = useRef(null);

  const hasEmail = !!CLINIC.contact.email;

  // Focus trap & ESC handling
  useEffect(() => {
    if (!isOpen) return;

    document.body.classList.add('modal-open');
    firstInputRef.current?.focus();

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.body.classList.remove('modal-open');
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  const validate = useCallback(() => {
    const newErrors = {};
    if (!form.name.trim()) newErrors.name = 'Ad Soyad gerekli';
    if (!form.phone.trim()) newErrors.phone = 'Telefon numarası gerekli';
    else if (!/^[0-9\s\-\+\(\)]{7,}$/.test(form.phone.trim()))
      newErrors.phone = 'Geçerli bir telefon numarası girin';
    if (!form.treatment) newErrors.treatment = 'İşlem seçiniz';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [form]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const handleWhatsApp = () => {
    if (!validate()) return;
    const message = CLINIC.whatsappTemplate({
      name: form.name,
      phone: form.phone,
      treatment: form.treatment,
      date: form.date || 'Belirtilmedi',
      message: form.message || 'Yok',
    });
    window.open(`https://wa.me/${CLINIC.contact.whatsappRaw}?text=${message}`, '_blank');
    setSubmitted(true);
  };

  const handlePhone = () => {
    window.location.href = `tel:${CLINIC.contact.phoneRaw}`;
  };

  const handleEmail = () => {
    if (!validate()) return;
    const subject = encodeURIComponent(`Randevu Talebi - ${form.name}`);
    const body = encodeURIComponent(
      `Ad Soyad: ${form.name}\nTelefon: ${form.phone}\nİşlem: ${form.treatment}\nTercih edilen tarih: ${form.date || 'Belirtilmedi'}\nMesaj: ${form.message || 'Yok'}`
    );
    window.location.href = `mailto:${CLINIC.contact.email}?subject=${subject}&body=${body}`;
    setSubmitted(true);
  };

  const handleClose = () => {
    setSubmitted(false);
    setForm({ name: '', phone: '', email: '', treatment: '', date: '', message: '' });
    setErrors({});
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div
      className={styles.backdrop}
      onClick={(e) => e.target === e.currentTarget && handleClose()}
      role="dialog"
      aria-modal="true"
      aria-label="Randevu formu"
    >
      <div className={styles.modal} ref={modalRef}>
        <button className={styles.closeBtn} onClick={handleClose} aria-label="Kapat">
          <X size={20} />
        </button>

        {submitted ? (
          <div className={styles.success}>
            <div className={styles.successIcon}>
              <CheckCircle size={48} />
            </div>
            <h3 className={styles.successTitle}>Teşekkürler!</h3>
            <p className={styles.successText}>
              Randevu talebiniz iletildi. En kısa sürede sizinle iletişime geçeceğiz.
            </p>
            <button className={styles.successBtn} onClick={handleClose}>
              Tamam
            </button>
          </div>
        ) : (
          <>
            <div className={styles.header}>
              <div className={styles.headerIcon}>
                <Calendar size={24} />
              </div>
              <h2 className={styles.title}>Randevu Oluştur</h2>
              <p className={styles.subtitle}>
                Formu doldurun, size en uygun zamanda randevu oluşturalım.
              </p>
            </div>

            <div className={styles.form}>
              {/* Ad Soyad */}
              <div className={styles.field}>
                <label htmlFor="apt-name" className={styles.label}>
                  <User size={16} />
                  Ad Soyad *
                </label>
                <input
                  ref={firstInputRef}
                  id="apt-name"
                  name="name"
                  type="text"
                  value={form.name}
                  onChange={handleChange}
                  placeholder="Adınız ve Soyadınız"
                  className={`${styles.input} ${errors.name ? styles.inputError : ''}`}
                  autoComplete="name"
                />
                {errors.name && <span className={styles.error}>{errors.name}</span>}
              </div>

              {/* Telefon */}
              <div className={styles.field}>
                <label htmlFor="apt-phone" className={styles.label}>
                  <Phone size={16} />
                  Telefon Numarası *
                </label>
                <input
                  id="apt-phone"
                  name="phone"
                  type="tel"
                  value={form.phone}
                  onChange={handleChange}
                  placeholder="05XX XXX XX XX"
                  className={`${styles.input} ${errors.phone ? styles.inputError : ''}`}
                  autoComplete="tel"
                />
                {errors.phone && <span className={styles.error}>{errors.phone}</span>}
              </div>

              {/* E-posta */}
              <div className={styles.field}>
                <label htmlFor="apt-email" className={styles.label}>
                  <Mail size={16} />
                  E-posta
                </label>
                <input
                  id="apt-email"
                  name="email"
                  type="email"
                  value={form.email}
                  onChange={handleChange}
                  placeholder="ornek@email.com"
                  className={styles.input}
                  autoComplete="email"
                />
              </div>

              {/* İşlem */}
              <div className={styles.field}>
                <label htmlFor="apt-treatment" className={styles.label}>
                  İlgilenilen İşlem *
                </label>
                <select
                  id="apt-treatment"
                  name="treatment"
                  value={form.treatment}
                  onChange={handleChange}
                  className={`${styles.select} ${errors.treatment ? styles.inputError : ''}`}
                >
                  <option value="">Seçiniz...</option>
                  {TREATMENTS.map((t) => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
                {errors.treatment && <span className={styles.error}>{errors.treatment}</span>}
              </div>

              {/* Tarih */}
              <div className={styles.field}>
                <label htmlFor="apt-date" className={styles.label}>
                  <Calendar size={16} />
                  Tercih Edilen Tarih
                </label>
                <input
                  id="apt-date"
                  name="date"
                  type="date"
                  value={form.date}
                  onChange={handleChange}
                  className={styles.input}
                  min={new Date().toISOString().split('T')[0]}
                />
              </div>

              {/* Mesaj */}
              <div className={styles.field}>
                <label htmlFor="apt-message" className={styles.label}>
                  Mesaj
                </label>
                <textarea
                  id="apt-message"
                  name="message"
                  value={form.message}
                  onChange={handleChange}
                  placeholder="Eklemek istediğiniz bilgiler..."
                  className={styles.textarea}
                  rows={3}
                />
              </div>
            </div>

            {/* Action Buttons */}
            <div className={styles.actions}>
              <p className={styles.actionsLabel}>Nasıl iletişime geçmek istersiniz?</p>
              <div className={styles.actionGrid}>
                <button className={`${styles.actionBtn} ${styles.whatsapp}`} onClick={handleWhatsApp}>
                  <MessageCircle size={20} />
                  <span>WhatsApp ile Gönder</span>
                </button>
                <button className={`${styles.actionBtn} ${styles.phone}`} onClick={handlePhone}>
                  <Phone size={20} />
                  <span>Telefonla Ara</span>
                </button>
                {hasEmail && (
                  <button className={`${styles.actionBtn} ${styles.email}`} onClick={handleEmail}>
                    <Mail size={20} />
                    <span>E-posta ile Gönder</span>
                  </button>
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
