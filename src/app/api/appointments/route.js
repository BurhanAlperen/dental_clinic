import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

const ISTANBUL_TZ = 'Europe/Istanbul';

/**
 * Istanbul saat dilimine göre Date nesnesini YYYY-MM-DD ve HH:mm formatına dönüştürür.
 */
function formatIstanbulDateTime(date) {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: ISTANBUL_TZ,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).formatToParts(date);

  const map = Object.fromEntries(parts.map((p) => [p.type, p.value]));
  return {
    date: `${map.year}-${map.month}-${map.day}`,
    time: `${map.hour}:${map.minute}`,
  };
}

/**
 * Verilen YYYY-MM-DD ve HH:mm değerlerini Istanbul saat dilimine göre UTC Date nesnelerine çevirir.
 * Türkiye yıl boyu UTC+3 kullanır.
 */
function parseIstanbulDateTime(dateStr, timeStr, durationMinutes = 30) {
  const [year, month, day] = dateStr.split('-').map(Number);
  const [hour, minute] = timeStr.split(':').map(Number);

  // UTC+3 ofseti: saat - 3
  const startAt = new Date(Date.UTC(year, month - 1, day, hour - 3, minute));
  const endAt = new Date(startAt.getTime() + durationMinutes * 60 * 1000);

  return { startAt, endAt };
}

/**
 * Doktor nesnesinden frontend slug değerini çözer.
 */
function getDoctorSlug(doctor) {
  if (!doctor) return null;
  const name = doctor.user?.name || '';
  const email = doctor.user?.email || '';

  if (name.includes('Mustafa') || email.includes('mustafa')) return 'mustafa-tarik-arslan';
  if (name.includes('Ceren') || email.includes('ceren')) return 'ceren-ozkalay';
  if (name.includes('Yakup') || email.includes('yakup')) return 'yakup-asar';

  return `doctor-${doctor.id}`;
}

/**
 * Frontend'den gelen doctorId (slug veya id) veya doctorName değerine göre DB'deki Doktoru bulur.
 */
async function resolveDoctor(doctorId, doctorName) {
  // 1. Sayısal ID ise
  if (!isNaN(doctorId) && Number.isInteger(Number(doctorId))) {
    const doc = await prisma.doctor.findUnique({
      where: { id: parseInt(doctorId, 10) },
      include: { user: true },
    });
    if (doc) return doc;
  }

  // 2. Slug eşleşmesi
  if (doctorId === 'mustafa-tarik-arslan' || (doctorName && doctorName.includes('Mustafa'))) {
    const doc = await prisma.doctor.findFirst({
      where: {
        OR: [
          { user: { name: { contains: 'Mustafa' } } },
          { user: { email: { contains: 'mustafa' } } },
        ],
      },
      include: { user: true },
    });
    if (doc) return doc;
  }

  if (doctorId === 'ceren-ozkalay' || (doctorName && doctorName.includes('Ceren'))) {
    const doc = await prisma.doctor.findFirst({
      where: {
        OR: [
          { user: { name: { contains: 'Ceren' } } },
          { user: { email: { contains: 'ceren' } } },
        ],
      },
      include: { user: true },
    });
    if (doc) return doc;
  }

  if (doctorId === 'yakup-asar' || (doctorName && doctorName.includes('Yakup'))) {
    const doc = await prisma.doctor.findFirst({
      where: {
        OR: [
          { user: { name: { contains: 'Yakup' } } },
          { user: { email: { contains: 'yakup' } } },
        ],
      },
      include: { user: true },
    });
    if (doc) return doc;
  }

  // 3. Genel fallback: hekim adından unvanı temizleyip arama
  if (doctorName) {
    const clean = doctorName.replace(/^(Uzm\.\s*Dt\.|Dt\.|Dr\.)\s*/i, '').trim();
    if (clean) {
      const doc = await prisma.doctor.findFirst({
        where: { user: { name: { contains: clean } } },
        include: { user: true },
      });
      if (doc) return doc;
    }
  }

  return null;
}

/**
 * GET: Veritabanındaki dolu randevuları (ve kapalı zaman aralıklarını) listeler.
 */
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const doctorParam = searchParams.get('doctorId');
    const dateParam = searchParams.get('date');

    // Filtreleme koşulları: PENDING ve CONFIRMED randevular dolu sayılır
    const where = {
      status: { in: ['PENDING', 'CONFIRMED'] },
    };

    // Belirli bir doktor filtrelendiyse
    if (doctorParam) {
      const targetDoc = await resolveDoctor(doctorParam);
      if (targetDoc) {
        where.doctorId = targetDoc.id;
      }
    }

    // Belirli bir tarih filtrelendiyse (Istanbul saat dilimine göre gün başı ve sonu)
    if (dateParam) {
      const { startAt: dayStart } = parseIstanbulDateTime(dateParam, '00:00', 0);
      const { startAt: dayEnd } = parseIstanbulDateTime(dateParam, '23:59', 1);
      where.startAt = { gte: dayStart, lte: dayEnd };
    }

    const [dbAppointments, blockedTimes] = await Promise.all([
      prisma.appointment.findMany({
        where,
        include: {
          doctor: { select: { id: true, title: true, user: { select: { name: true, email: true } } } },
          patient: { select: { firstName: true, lastName: true } },
          services: { include: { service: { select: { name: true } } } },
        },
        orderBy: { startAt: 'asc' },
      }),
      prisma.doctorBlockedTime.findMany({
        where: {
          endAt: { gte: new Date() },
        },
        include: {
          doctor: { select: { id: true, title: true, user: { select: { name: true, email: true } } } },
        },
      }),
    ]);

    const bookedSlots = [];
    const appointments = [];

    // 1. Randevuları bookedSlots formatına dönüştür
    for (const apt of dbAppointments) {
      const { date, time } = formatIstanbulDateTime(apt.startAt);
      const slug = getDoctorSlug(apt.doctor);

      appointments.push({
        id: `apt-${apt.id}`,
        dbId: apt.id,
        doctorId: slug || String(apt.doctorId),
        doctorDbId: apt.doctorId,
        doctorName: [apt.doctor?.title, apt.doctor?.user?.name].filter(Boolean).join(' '),
        date,
        time,
        firstName: apt.patient?.firstName || '',
        lastName: apt.patient?.lastName || '',
        services: apt.services?.map((s) => s.service?.name).filter(Boolean) || [],
        status: apt.status,
      });

      // Hem slug (örn: 'mustafa-tarik-arslan') hem de sayısal ID için slot ekle
      if (slug) {
        bookedSlots.push({
          doctorId: slug,
          doctorDbId: apt.doctorId,
          date,
          time,
        });
      }

      bookedSlots.push({
        doctorId: String(apt.doctorId),
        doctorDbId: apt.doctorId,
        date,
        time,
      });
    }

    // 2. Doktorların kapalı/izinli saatlerini (DoctorBlockedTime) slot slot ekle
    for (const block of blockedTimes) {
      const slug = getDoctorSlug(block.doctor);
      let curr = new Date(block.startAt);
      const end = new Date(block.endAt);

      while (curr < end) {
        const { date, time } = formatIstanbulDateTime(curr);
        if (slug) {
          bookedSlots.push({
            doctorId: slug,
            doctorDbId: block.doctorId,
            date,
            time,
          });
        }
        bookedSlots.push({
          doctorId: String(block.doctorId),
          doctorDbId: block.doctorId,
          date,
          time,
        });

        // 30 dakika ilerle
        curr = new Date(curr.getTime() + 30 * 60 * 1000);
      }
    }

    return NextResponse.json({
      success: true,
      appointments,
      bookedSlots,
    });
  } catch (error) {
    console.error('[API/appointments] GET error:', error);
    return NextResponse.json(
      { success: false, error: 'Randevu verileri alınırken bir hata oluştu.' },
      { status: 500 }
    );
  }
}

/**
 * POST: Yeni randevuyu doğrudan veritabanına kaydeder.
 */
export async function POST(request) {
  try {
    const data = await request.json();
    const {
      doctorId,
      doctorName,
      date,
      time,
      firstName,
      lastName,
      tcNo,
      phone,
      email,
      gender,
      services,
      notes,
    } = data;

    // Zorunlu alan kontrolü
    if (
      !doctorId ||
      !date ||
      !time ||
      !firstName ||
      !lastName ||
      !tcNo ||
      !phone ||
      !email ||
      !gender ||
      !services ||
      services.length === 0
    ) {
      return NextResponse.json(
        { success: false, error: 'Lütfen tüm zorunlu alanları doldurunuz.' },
        { status: 400 }
      );
    }

    // T.C. Kimlik No validasyonu (11 hane)
    const cleanTc = String(tcNo).trim();
    if (!/^\d{11}$/.test(cleanTc)) {
      return NextResponse.json(
        { success: false, error: 'T.C. Kimlik Numarası 11 haneli olmalıdır.' },
        { status: 400 }
      );
    }

    // Telefon numarası validasyonu (05 ile başlamalı ve 11 hane olmalı)
    const rawPhone = String(phone).replace(/\D/g, '');
    if (!rawPhone.startsWith('05') || rawPhone.length !== 11) {
      return NextResponse.json(
        { success: false, error: 'Telefon numarası 05 ile başlamalı ve 11 haneli olmalıdır (05XX XXX XX XX).' },
        { status: 400 }
      );
    }

    // E-posta validasyonu
    const cleanEmail = String(email || '').trim().toLowerCase();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[cC][oO][mM](\.[a-zA-Z]{2,})?$/i;
    if (!cleanEmail.includes('@') || !cleanEmail.includes('.com') || !emailRegex.test(cleanEmail)) {
      return NextResponse.json(
        { success: false, error: 'Lütfen geçerli bir e-posta adresi giriniz (Örn: example@gmail.com).' },
        { status: 400 }
      );
    }

    // 1. Doktoru veritabanında bul
    const doctor = await resolveDoctor(doctorId, doctorName);
    if (!doctor) {
      return NextResponse.json(
        { success: false, error: 'Seçilen doktor sistemde bulunamadı.' },
        { status: 404 }
      );
    }

    // 2. Tarih ve saat dönüşümü (Istanbul Saat Dilimi, 30 dakikalık randevu süresi)
    const { startAt, endAt } = parseIstanbulDateTime(date, time, 30);

    // 3. Veritabanında çakışma kontrolü (PENDING veya CONFIRMED randevular saati kilitler)
    const conflict = await prisma.appointment.findFirst({
      where: {
        doctorId: doctor.id,
        status: { in: ['PENDING', 'CONFIRMED'] },
        AND: [
          { startAt: { lt: endAt } },
          { endAt: { gt: startAt } },
        ],
      },
    });

    if (conflict) {
      return NextResponse.json(
        { success: false, error: 'Seçtiğiniz randevu saati az önce rezerve edilmiştir. Lütfen başka bir saat seçiniz.' },
        { status: 409 }
      );
    }

    // 4. Doktorun kapalı/izinli zaman aralığı kontrolü
    const blocked = await prisma.doctorBlockedTime.findFirst({
      where: {
        doctorId: doctor.id,
        AND: [
          { startAt: { lt: endAt } },
          { endAt: { gt: startAt } },
        ],
      },
    });

    if (blocked) {
      return NextResponse.json(
        { success: false, error: 'Doktorumuz bu saat aralığında müsait değildir. Lütfen başka bir saat seçiniz.' },
        { status: 409 }
      );
    }

    // 5. Dt. Yakup Aşar için Doktorsitesi anlık doğrulama koruması
    if (doctorId === 'yakup-asar') {
      try {
        const dsRes = await fetch(
          `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/api/appointments/doktorsitesi?refresh=true`,
          { cache: 'no-store' }
        );

        if (dsRes.ok) {
          const dsData = await dsRes.json();
          if (dsData.success && dsData.scheduleByDate) {
            const daySchedule = dsData.scheduleByDate[date];
            if (daySchedule) {
              const isAvailableOnDs = daySchedule.available?.includes(time);
              if (!isAvailableOnDs) {
                return NextResponse.json(
                  {
                    success: false,
                    error: 'Seçtiğiniz saat Doktorsitesi takviminde müsait değil. Lütfen başka bir saat seçiniz.',
                  },
                  { status: 409 }
                );
              }
            }
          }
        }
      } catch (dsErr) {
        console.warn('[Appointments] Doktorsitesi validation warning:', dsErr.message);
      }
    }

    // 6. Hastayı bul veya oluştur (T.C. Kimlik No veya Telefon numarasına göre)
    const genderMap = {
      Kadın: 'FEMALE',
      Erkek: 'MALE',
      'Belirtmek istemiyorum': 'UNSPECIFIED',
    };
    const mappedGender = genderMap[gender] || 'UNSPECIFIED';

    let patient = await prisma.patient.findFirst({
      where: {
        OR: [
          { nationalId: cleanTc },
          { phone: phone.trim() },
        ],
      },
    });

    if (patient) {
      // Hasta varsa güncel iletişim bilgilerini güncelle
      patient = await prisma.patient.update({
        where: { id: patient.id },
        data: {
          firstName: firstName.trim(),
          lastName: lastName.trim(),
          nationalId: cleanTc,
          phone: phone.trim(),
          email: cleanEmail,
          gender: mappedGender,
          notes: notes ? notes.trim() : patient.notes,
        },
      });
    } else {
      // Yeni hasta kaydı oluştur
      patient = await prisma.patient.create({
        data: {
          firstName: firstName.trim(),
          lastName: lastName.trim(),
          nationalId: cleanTc,
          phone: phone.trim(),
          email: cleanEmail,
          gender: mappedGender,
          notes: notes ? notes.trim() : null,
        },
      });
    }

    // 7. Seçilen hizmetleri DB'den bul veya eksikse oluştur
    const serviceNames = Array.isArray(services) ? services : [services];
    const serviceRecords = [];

    for (const sName of serviceNames) {
      const cleanName = String(sName).trim();
      if (!cleanName) continue;

      let sRec = await prisma.service.findUnique({
        where: { name: cleanName },
      });

      if (!sRec) {
        sRec = await prisma.service.create({
          data: {
            name: cleanName,
            isActive: true,
          },
        });
      }
      serviceRecords.push(sRec);
    }

    // 8. Randevu kaydını veritabanında oluştur
    const appointment = await prisma.appointment.create({
      data: {
        doctorId: doctor.id,
        patientId: patient.id,
        startAt,
        endAt,
        status: 'PENDING',
        patientNotes: notes ? notes.trim() : null,
        services: {
          create: serviceRecords.map((s) => ({
            service: { connect: { id: s.id } },
          })),
        },
      },
      include: {
        doctor: { select: { id: true, title: true, user: { select: { name: true } } } },
        patient: true,
        services: { include: { service: true } },
      },
    });

    const slug = getDoctorSlug(doctor);

    return NextResponse.json({
      success: true,
      message: 'Randevunuz başarıyla oluşturuldu ve onay için kliniğe iletildi.',
      appointment: {
        id: `apt-${appointment.id}`,
        dbId: appointment.id,
        doctorId: slug || String(doctor.id),
        doctorDbId: doctor.id,
        doctorName: [doctor.title, doctor.user?.name].filter(Boolean).join(' '),
        date,
        time,
        firstName: patient.firstName,
        lastName: patient.lastName,
        tcNo: patient.nationalId,
        phone: patient.phone,
        email: patient.email,
        gender,
        services: serviceRecords.map((s) => s.name),
        notes: appointment.patientNotes,
        status: appointment.status,
        createdAt: appointment.createdAt.toISOString(),
      },
    });
  } catch (error) {
    console.error('[API/appointments] POST error:', error);
    return NextResponse.json(
      { success: false, error: 'Randevu veritabanına kaydedilirken bir hata oluştu.' },
      { status: 500 }
    );
  }
}
