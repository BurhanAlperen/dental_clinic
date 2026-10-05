'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import {
  Calendar as CalendarIcon,
  User,
  Phone,
  CheckCircle,
  AlertCircle,
  Stethoscope,
  Sparkles,
  ArrowLeft,
  MessageCircle,
  Clock,
  ShieldCheck,
} from 'lucide-react';
import Navbar from '@/components/Navbar/Navbar';
import Footer from '@/components/Footer/Footer';
import MobileActionBar from '@/components/MobileActionBar/MobileActionBar';
import SearchableServiceSelect from '@/components/Appointment/SearchableServiceSelect';
import AppointmentCalendar from '@/components/Appointment/AppointmentCalendar';
import ToastNotification from '@/components/Appointment/ToastNotification';
import { CLINIC } from '@/config/clinic';
import styles from './page.module.css';

function AppointmentContent() {
  const searchParams = useSearchParams();
  const initialDoctorParam = searchParams.get('doctor');

  // Selected Doctor
  const [selectedDoctor, setSelectedDoctor] = useState(null);

  // Selected Date & Time
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');

  // Form Fields
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('');
  const [gender, setGender] = useState('Kadın');
  const [selectedServices, setSelectedServices] = useState([]);
  const [notes, setNotes] = useState('');

  // States
  const [bookedSlots, setBookedSlots] = useState([]);
  const [doktorsitesiData, setDoktorsitesiData] = useState(null);
  const [isLoadingSync, setIsLoadingSync] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState('');
  const [notification, setNotification] = useState(null);
  const [lastAppointment, setLastAppointment] = useState(null);

  // Initialize doctor from query param if provided, otherwise leave unselected (null)
  useEffect(() => {
    if (initialDoctorParam) {
      const doc = CLINIC.doctors.find((d) => d.id === initialDoctorParam);
      if (doc) {
        setSelectedDoctor(doc);
        return;
      }
    }
    setSelectedDoctor(null);
  }, [initialDoctorParam]);

  // Fetch booked slots and Doktorsitesi live data
  const fetchSlotsAndSync = async (forceRefresh = false) => {
    try {
      // 1. Fetch local booked slots
      const resAppointments = await fetch('/api/appointments');
      if (resAppointments.ok) {
        const data = await resAppointments.json();
        if (data.bookedSlots) setBookedSlots(data.bookedSlots);
      }

      // 2. If Dt. Yakup Aşar, fetch live Doktorsitesi calendar
      if (selectedDoctor?.id === 'yakup-asar') {
        setIsLoadingSync(true);
        const url = forceRefresh
          ? '/api/appointments/doktorsitesi?refresh=true'
          : '/api/appointments/doktorsitesi';

        try {
          const resDoktorsitesi = await fetch(url);
          const data = await resDoktorsitesi.json();
          // Always set the response data (success or providerError)
          setDoktorsitesiData(data);
        } catch (fetchErr) {
          // Network-level failure
          setDoktorsitesiData({ providerError: true, success: false });
          console.error('[Doktorsitesi] Network error:', fetchErr);
        } finally {
          setIsLoadingSync(false);
        }
      } else {
        setDoktorsitesiData(null);
      }
    } catch (err) {
      console.error('Error fetching calendar data:', err);
      setIsLoadingSync(false);
    }
  };

  useEffect(() => {
    if (selectedDoctor) {
      fetchSlotsAndSync();
      // Reset selected time when doctor changes
      setSelectedTime('');
    } else {
      // If no doctor selected yet, fetch local booked slots
      fetch('/api/appointments')
        .then((res) => res.json())
        .then((data) => {
          if (data.bookedSlots) setBookedSlots(data.bookedSlots);
        })
        .catch((err) => console.error('Error fetching appointments:', err));
    }
  }, [selectedDoctor]);

  // 60-second auto-refresh poll for Yakup Aşar (matches cache TTL)
  useEffect(() => {
    if (selectedDoctor?.id !== 'yakup-asar') return;

    const interval = setInterval(() => {
      fetchSlotsAndSync(true);
    }, 60 * 1000);

    return () => clearInterval(interval);
  }, [selectedDoctor]);

  const handleSelectDateTime = (dateStr, timeStr) => {
    setSelectedDate(dateStr);
    setSelectedTime(timeStr);
    setFormError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');

    // Validations
    if (!selectedDoctor) {
      setFormError('Lütfen bir hekim seçiniz.');
      return;
    }
    if (!selectedDate || !selectedTime) {
      setFormError('Lütfen takvimden randevu tarihi ve saati seçiniz.');
      return;
    }
    if (!firstName.trim() || !lastName.trim()) {
      setFormError('Lütfen ad ve soyadınızı giriniz.');
      return;
    }
    if (!phone.trim() || phone.trim().length < 10) {
      setFormError('Lütfen geçerli bir telefon numarası giriniz.');
      return;
    }
    if (selectedServices.length === 0) {
      setFormError('Lütfen almak istediğiniz en az bir hizmet seçiniz.');
      return;
    }

    setIsSubmitting(true);

    try {
      const payload = {
        doctorId: selectedDoctor.id,
        doctorName: selectedDoctor.name,
        date: selectedDate,
        time: selectedTime,
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        phone: phone.trim(),
        gender,
        services: selectedServices,
        notes: notes.trim(),
      };

      const response = await fetch('/api/appointments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        setFormError(result.error || 'Randevu oluşturulamadı.');
        setIsSubmitting(false);
        return;
      }

      // If Dt. Yakup Aşar, forward to Doktorsitesi sync endpoint
      if (selectedDoctor.id === 'yakup-asar') {
        fetch('/api/appointments/doktorsitesi', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        }).catch((e) => console.warn('Doktorsitesi sync background notice:', e));
      }

      // Update local booked slots immediately
      setBookedSlots((prev) => [
        ...prev,
        { doctorId: selectedDoctor.id, date: selectedDate, time: selectedTime },
      ]);

      // Show top-right Green Checkmark Toast notification
      setNotification({
        appointment: result.appointment,
        timestamp: Date.now(),
      });

      setLastAppointment(result.appointment);
      setIsSubmitting(false);

      // Scroll smoothly to top
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err) {
      console.error('Submit error:', err);
      setFormError('Bağlantı hatası oluştu. Lütfen tekrar deneyiniz.');
      setIsSubmitting(false);
    }
  };

  const handleResetForm = () => {
    setSelectedTime('');
    setFirstName('');
    setLastName('');
    setPhone('');
    setSelectedServices([]);
    setNotes('');
    setLastAppointment(null);
  };

  return (
    <div className={styles.pageWrapper}>
      {/* Top-Right Green Checkmark Toast */}
      <ToastNotification notification={notification} onClose={() => setNotification(null)} />

      <Navbar darkHero={true} onAppointmentClick={() => window.scrollTo({ top: 400, behavior: 'smooth' })} />

      <main className={styles.main}>
        {/* Header Hero */}
        <section className={styles.headerSection}>
          <div className="container">
            <div className={styles.headerTopRow}>
              <Link href="/" className={styles.backLink}>
                <ArrowLeft size={16} />
                <span>Anasayfaya Dön</span>
              </Link>

              <div className={styles.headerBadge}>
                <Sparkles size={14} />
                <span>Online Randevu Sistemi</span>
              </div>
            </div>

            <h1 className={styles.headerTitle}>
              Randevunuzu <span className={styles.headerHighlight}>Kolayca</span> Oluşturun
            </h1>
            <p className={styles.headerDesc}>
              Dilediğiniz uzman hekimimizi seçin, takvimden uygun saatinizi belirleyin ve hızlıca randevunuzu tamamlayın.
            </p>
          </div>
        </section>

        <section className={styles.bookingSection}>
          <div className="container">
            {lastAppointment ? (
              /* Success Confirmation Card */
              <div className={styles.successCard}>
                <div className={styles.successCheckIcon}>
                  <CheckCircle size={48} className={styles.successSvg} />
                </div>
                <h2 className={styles.successTitle}>Randevunuz Başarıyla Oluşturuldu!</h2>
                <p className={styles.successDesc}>
                  Sayın <strong>{lastAppointment.firstName} {lastAppointment.lastName}</strong>, randevu talebiniz kliniğimize iletilmiştir.
                </p>

                <div className={styles.summaryBox}>
                  <div className={styles.summaryRow}>
                    <span className={styles.summaryLabel}>Hekim:</span>
                    <strong className={styles.summaryVal}>{lastAppointment.doctorName}</strong>
                  </div>
                  <div className={styles.summaryRow}>
                    <span className={styles.summaryLabel}>Tarih & Saat:</span>
                    <strong className={styles.summaryVal}>
                      {lastAppointment.date} — {lastAppointment.time}
                    </strong>
                  </div>
                  <div className={styles.summaryRow}>
                    <span className={styles.summaryLabel}>Hizmetler:</span>
                    <strong className={styles.summaryVal}>{lastAppointment.services.join(', ')}</strong>
                  </div>
                  <div className={styles.summaryRow}>
                    <span className={styles.summaryLabel}>Telefon:</span>
                    <strong className={styles.summaryVal}>{lastAppointment.phone}</strong>
                  </div>
                </div>

                <div className={styles.successActions}>
                  <a
                    href={`https://wa.me/${CLINIC.contact.whatsappRaw}?text=${encodeURIComponent(
                      `Merhaba, ${lastAppointment.date} saat ${lastAppointment.time} tarihindeki randevum hakkında bilgi almak istiyorum. (Ad Soyad: ${lastAppointment.firstName} ${lastAppointment.lastName})`
                    )}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={styles.whatsappBtn}
                  >
                    <MessageCircle size={18} />
                    <span>WhatsApp Teyidi Al</span>
                  </a>

                  <button type="button" onClick={handleResetForm} className={styles.newBookingBtn}>
                    Yeni Randevu Oluştur
                  </button>
                </div>
              </div>
            ) : (
              /* Booking Wizard Grid */
              <div className={styles.bookingGrid}>
                {/* Left Column: Doctor Selection & Calendar */}
                <div className={styles.leftColumn}>
                  {/* Step 1: Doctor Selection */}
                  <div className={styles.stepCard}>
                    <div className={styles.stepHeader}>
                      <div className={styles.stepNumber}>1</div>
                      <div>
                        <h3 className={styles.stepTitle}>Hekim Seçiniz</h3>
                        <p className={styles.stepSubtitle}>Tedavinizi gerçekleştirecek hekimi belirleyin</p>
                      </div>
                    </div>

                    <div className={styles.doctorsList}>
                      {CLINIC.doctors.map((doctor) => {
                        const isSelected = selectedDoctor?.id === doctor.id;
                        const isYakup = doctor.id === 'yakup-asar';

                        return (
                          <div
                            key={doctor.id}
                            className={`${styles.doctorCard} ${isSelected ? styles.doctorCardActive : ''}`}
                            onClick={() => setSelectedDoctor(doctor)}
                            role="button"
                            tabIndex={0}
                          >
                            <div className={styles.doctorImgWrapper}>
                              <Image
                                src={doctor.image}
                                alt={doctor.name}
                                width={64}
                                height={64}
                                className={styles.doctorImg}
                              />
                            </div>
                            <div className={styles.doctorInfo}>
                              <div className={styles.doctorNameRow}>
                                <h4 className={styles.doctorName}>{doctor.name}</h4>
                                {isYakup && (
                                  <span className={styles.doktorsitesiBadge} title="Doktorsitesi.com ile senkronize">
                                    ⚡ Doktorsitesi
                                  </span>
                                )}
                              </div>
                              <span className={styles.doctorTitle}>{doctor.title}</span>
                              <span className={styles.doctorSpecialty}>{doctor.specialty}</span>
                            </div>
                            <div className={`${styles.radioCircle} ${isSelected ? styles.radioActive : ''}`}>
                              {isSelected && <div className={styles.radioDot} />}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Step 2: Date & Time Calendar */}
                  <div className={styles.stepCard}>
                    <div className={styles.stepHeader}>
                      <div className={styles.stepNumber}>2</div>
                      <div>
                        <h3 className={styles.stepTitle}>Tarih ve Saat Seçiniz</h3>
                        <p className={styles.stepSubtitle}>Müsait randevu saatleri anlık olarak güncellenir</p>
                      </div>
                    </div>

                    <AppointmentCalendar
                      selectedDoctor={selectedDoctor}
                      selectedDate={selectedDate}
                      selectedTime={selectedTime}
                      onSelectDateTime={handleSelectDateTime}
                      bookedSlots={bookedSlots}
                      doktorsitesiData={doktorsitesiData}
                      isLoadingSync={isLoadingSync}
                      onRefreshSync={() => fetchSlotsAndSync(true)}
                    />
                  </div>
                </div>

                {/* Right Column: Patient Information Form */}
                <div className={styles.rightColumn}>
                  <div className={styles.stepCardSticky}>
                    <div className={styles.stepHeader}>
                      <div className={styles.stepNumber}>3</div>
                      <div>
                        <h3 className={styles.stepTitle}>Hasta Bilgileri</h3>
                        <p className={styles.stepSubtitle}>Randevunuzu tamamlamak için bilgilerinizi giriniz</p>
                      </div>
                    </div>

                    {formError && (
                      <div className={styles.errorBanner} role="alert">
                        <AlertCircle size={18} />
                        <span>{formError}</span>
                      </div>
                    )}

                    <form onSubmit={handleSubmit} className={styles.form}>
                      {/* First & Last Name */}
                      <div className={styles.nameRow}>
                        <div className={styles.fieldGroup}>
                          <label className={styles.label}>
                            <span>İsim</span>
                            <span className={styles.required}>*</span>
                          </label>
                          <input
                            type="text"
                            required
                            placeholder="Adınız"
                            className={styles.input}
                            value={firstName}
                            onChange={(e) => setFirstName(e.target.value)}
                          />
                        </div>

                        <div className={styles.fieldGroup}>
                          <label className={styles.label}>
                            <span>Soyisim</span>
                            <span className={styles.required}>*</span>
                          </label>
                          <input
                            type="text"
                            required
                            placeholder="Soyadınız"
                            className={styles.input}
                            value={lastName}
                            onChange={(e) => setLastName(e.target.value)}
                          />
                        </div>
                      </div>

                      {/* Phone */}
                      <div className={styles.fieldGroup}>
                        <label className={styles.label}>
                          <span>Telefon Numarası</span>
                          <span className={styles.required}>*</span>
                        </label>
                        <div className={styles.inputIconWrapper}>
                          <Phone size={16} className={styles.inputIcon} />
                          <input
                            type="tel"
                            required
                            placeholder="05XX XXX XX XX"
                            className={`${styles.input} ${styles.inputWithIcon}`}
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                          />
                        </div>
                      </div>

                      {/* Gender Selection */}
                      <div className={styles.fieldGroup}>
                        <label className={styles.label}>
                          <span>Cinsiyet</span>
                          <span className={styles.required}>*</span>
                        </label>
                        <div className={styles.genderRow}>
                          {['Kadın', 'Erkek', 'Belirtmek İstemiyorum'].map((item) => (
                            <label key={item} className={styles.genderOption}>
                              <input
                                type="radio"
                                name="gender"
                                value={item}
                                checked={gender === item}
                                onChange={(e) => setGender(e.target.value)}
                                className={styles.genderRadio}
                              />
                              <span className={styles.genderText}>{item}</span>
                            </label>
                          ))}
                        </div>
                      </div>

                      {/* Searchable Multi-Service Select Dropdown */}
                      <div className={styles.fieldGroup}>
                        <SearchableServiceSelect
                          selectedServices={selectedServices}
                          onChange={setSelectedServices}
                        />
                      </div>

                      {/* Notes / Message */}
                      <div className={styles.fieldGroup}>
                        <label className={styles.label}>
                          <span>Şikayetiniz veya Notunuz (Opsiyonel)</span>
                        </label>
                        <textarea
                          rows={3}
                          placeholder="Diş ağrısı, muayene veya özel bir talebiniz varsa belirtebilirsiniz..."
                          className={styles.textarea}
                          value={notes}
                          onChange={(e) => setNotes(e.target.value)}
                        />
                      </div>

                      {/* Submit Button */}
                      <button
                        type="submit"
                        disabled={isSubmitting}
                        className={styles.submitBtn}
                      >
                        {isSubmitting ? (
                          <span>Randevu Kaydediliyor...</span>
                        ) : (
                          <>
                            <CheckCircle size={18} />
                            <span>Randevuyu Onayla ve Oluştur</span>
                          </>
                        )}
                      </button>

                      <div className={styles.securityNote}>
                        <ShieldCheck size={14} />
                        <span>Kişisel verileriniz KVKK kapsamında korunmaktadır.</span>
                      </div>
                    </form>
                  </div>
                </div>
              </div>
            )}
          </div>
        </section>
      </main>

      <Footer />
      <MobileActionBar onAppointmentClick={() => window.scrollTo({ top: 400, behavior: 'smooth' })} />
    </div>
  );
}

export default function AppointmentPage() {
  return (
    <Suspense fallback={<div style={{ padding: '60px', textAlign: 'center' }}>Randevu sistemi yükleniyor...</div>}>
      <AppointmentContent />
    </Suspense>
  );
}
