'use client';

import { useState, useMemo } from 'react';
import { ChevronLeft, ChevronRight, Clock, CheckCircle2, RefreshCw, ShieldCheck, Stethoscope } from 'lucide-react';
import styles from './AppointmentCalendar.module.css';

// All standard 30-minute time slots matching Doktorsitesi and clinic schedule
const ALL_TIME_SLOTS = [
  '09:30', '10:00', '10:30', '11:00', '11:30', '12:00', '12:30',
  '13:00', '13:30', '14:00', '14:30', '15:00', '15:30', '16:00',
  '16:30', '17:00', '17:30', '18:00', '18:30', '19:00', '19:30',
  '20:00', '20:30', '21:00', '21:30', '22:00', '22:30'
];

export default function AppointmentCalendar({
  selectedDoctor,
  selectedDate,
  selectedTime,
  onSelectDateTime,
  bookedSlots = [],
  doktorsitesiData = null,
  isLoadingSync = false,
  onRefreshSync,
}) {
  const [dayOffset, setDayOffset] = useState(0);
  const [showAllHours, setShowAllHours] = useState(false);

  // Generate 4 consecutive days starting from today + dayOffset
  const days = useMemo(() => {
    const list = [];
    const today = new Date();

    const turkishDays = ['Paz', 'Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt'];
    const turkishMonths = [
      'Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran',
      'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'
    ];

    for (let i = 0; i < 4; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + dayOffset + i);

      const isToday = dayOffset + i === 0;
      const isTomorrow = dayOffset + i === 1;

      let dayLabel = turkishDays[date.getDay()];
      if (isToday) dayLabel = 'Bugün';
      else if (isTomorrow) dayLabel = 'Yarın';

      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const d = String(date.getDate()).padStart(2, '0');
      const dateStr = `${year}-${month}-${d}`;
      const displayDate = `${date.getDate()} ${turkishMonths[date.getMonth()]}`;

      list.push({
        fullDate: dateStr,
        dayLabel,
        displayDate,
        isToday,
        isSunday: date.getDay() === 0,
        offsetIndex: dayOffset + i,
      });
    }
    return list;
  }, [dayOffset]);

  // Check if a time is in the past for today's date
  const isTimePastForToday = (dateStr, timeStr) => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const d = String(today.getDate()).padStart(2, '0');
    const todayStr = `${year}-${month}-${d}`;

    if (dateStr !== todayStr) return false;

    const [hours, minutes] = timeStr.split(':').map(Number);
    const currentHours = today.getHours();
    const currentMinutes = today.getMinutes();

    if (hours < currentHours) return true;
    if (hours === currentHours && minutes <= currentMinutes) return true;

    return false;
  };

  // Determine current month/year for header
  const headerTitle = useMemo(() => {
    const firstDay = new Date();
    firstDay.setDate(firstDay.getDate() + dayOffset);
    const turkishMonths = [
      'Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran',
      'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'
    ];
    return `${turkishMonths[firstDay.getMonth()]} ${firstDay.getFullYear()}`;
  }, [dayOffset]);

  // Check if a time slot is taken/booked
  const isSlotBooked = (dateStr, timeStr, offsetIndex) => {
    // 1. Check local booked appointments in Turhal clinic database
    const isLocallyBooked = bookedSlots.some(
      (b) => b.doctorId === selectedDoctor?.id && b.date === dateStr && b.time === timeStr
    );
    if (isLocallyBooked) return true;

    // 2. For Dt. Yakup Aşar: check Doktorsitesi real-time schedule
    if (selectedDoctor?.id === 'yakup-asar' && doktorsitesiData) {
      const daySchedule = doktorsitesiData.scheduleByOffset?.[offsetIndex];
      if (daySchedule) {
        if (daySchedule.busy?.includes(timeStr)) return true;
        if (daySchedule.available?.includes(timeStr)) return false;
        return true;
      }

      if (doktorsitesiData.busySlots) {
        const isBusy = doktorsitesiData.busySlots.some(
          (slot) => slot.dateOffset === offsetIndex && slot.time === timeStr
        );
        if (isBusy) return true;
      }
    }

    return false;
  };

  // Get available slots for a given day (filtering past hours if today)
  const getDaySlots = (day) => {
    let slots = ALL_TIME_SLOTS;
    if (day.isToday) {
      slots = slots.filter((time) => !isTimePastForToday(day.fullDate, time));
    }
    return showAllHours ? slots : slots.slice(0, 10);
  };

  return (
    <div className={styles.calendarContainer}>
      <div className={styles.header}>
        <div className={styles.titleWrapper}>
          <Clock size={20} className={styles.titleIcon} />
          <h3 className={styles.title}>Randevu Tarihi ve Saati Seçin</h3>
        </div>

        {/* Month & Navigation */}
        <div className={styles.navControls}>
          <button
            type="button"
            className={styles.navBtn}
            onClick={() => setDayOffset(Math.max(0, dayOffset - 4))}
            disabled={dayOffset === 0}
            aria-label="Önceki günler"
          >
            <ChevronLeft size={18} />
          </button>
          <span className={styles.monthLabel}>{headerTitle}</span>
          <button
            type="button"
            className={styles.navBtn}
            onClick={() => setDayOffset(dayOffset + 4)}
            aria-label="Sonraki günler"
          >
            <ChevronRight size={18} />
          </button>
        </div>
      </div>

      {/* Doctor Selection Guidance or Doktorsitesi Sync Banner */}
      {!selectedDoctor ? (
        <div className={styles.selectDoctorBanner}>
          <Stethoscope size={16} className={styles.selectDoctorIcon} />
          <span>Hekiminize özel müsaitlik takvimini görüntülemek için lütfen <strong>1. Adımdan hekim seçiniz</strong>.</span>
        </div>
      ) : (
        selectedDoctor.id === 'yakup-asar' && (
          <div className={styles.syncBanner}>
            <div className={styles.syncPulse} />
            <div className={styles.syncInfo}>
              <span className={styles.syncTitle}>
                ⚡ <strong>Doktorsitesi.com</strong> Canlı Takvim Senkronizasyonu Aktif
              </span>
              <span className={styles.syncSub}>
                Randevu saatleri 30 dakikada bir otomatik taranır ve boşalan kontenjanlar anında açılır.
              </span>
            </div>

            <button
              type="button"
              className={styles.syncRefreshBtn}
              onClick={onRefreshSync}
              disabled={isLoadingSync}
              title="Doktorsitesi saatlerini anlık güncelle"
              aria-label="Doktorsitesi senkronizasyonunu yenile"
            >
              <RefreshCw size={14} className={isLoadingSync ? styles.syncSpinner : ''} />
              <span>{isLoadingSync ? 'Güncelleniyor...' : 'Yenile'}</span>
            </button>
          </div>
        )
      )}

      {/* Day Columns Grid */}
      <div className={styles.daysGrid}>
        {days.map((day) => {
          const daySlots = getDaySlots(day);

          return (
            <div key={day.fullDate} className={styles.dayColumn}>
              {/* Day Header */}
              <div
                className={`${styles.dayHeader} ${
                  selectedDate === day.fullDate ? styles.dayHeaderActive : ''
                } ${day.isSunday ? styles.dayHeaderClosed : ''}`}
              >
                <span className={styles.dayName}>{day.dayLabel}</span>
                <span className={styles.dayDate}>{day.displayDate}</span>
              </div>

              {/* Slots */}
              <div className={styles.slotsList}>
                {day.isSunday ? (
                  <div className={styles.closedBadge}>
                    <span>Pazar Kapalı</span>
                  </div>
                ) : daySlots.length === 0 ? (
                  <div className={styles.closedBadge}>
                    <span>Müsait saat kalmadı</span>
                  </div>
                ) : (
                  daySlots.map((time) => {
                    const booked = isSlotBooked(day.fullDate, time, day.offsetIndex);
                    const isSelected = selectedDate === day.fullDate && selectedTime === time;

                    return (
                      <button
                        key={time}
                        type="button"
                        disabled={booked}
                        className={`${styles.slotBtn} ${
                          isSelected ? styles.slotSelected : ''
                        } ${booked ? styles.slotBooked : ''}`}
                        onClick={() => onSelectDateTime(day.fullDate, time)}
                      >
                        <span>{time}</span>
                        {booked && <span className={styles.bookedTag}>Dolu</span>}
                      </button>
                    );
                  })
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Expand / Collapse Button */}
      <div className={styles.expandWrapper}>
        <button
          type="button"
          className={styles.expandBtn}
          onClick={() => setShowAllHours(!showAllHours)}
        >
          {showAllHours ? 'Daha az saat göster ▲' : 'Daha fazla saat göster ▼'}
        </button>
      </div>

      {/* Selected Slot Summary Bar */}
      {selectedDate && selectedTime && (
        <div className={styles.selectedSlotBar}>
          <CheckCircle2 size={18} className={styles.selectedIcon} />
          <span>
            Seçilen Randevu: <strong>{selectedDate}</strong> saat <strong>{selectedTime}</strong>
          </span>
        </div>
      )}
    </div>
  );
}
