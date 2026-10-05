import { NextResponse } from 'next/server';

/**
 * In-memory appointment storage (and seed appointments)
 * Stores booked appointments per doctor, date and time
 */
let appointments = [
  {
    id: 'apt-seed-1',
    doctorId: 'mustafa-tarik-arslan',
    doctorName: 'Uzm. Dt. Mustafa Tarık Arslan',
    date: '2026-09-23',
    time: '11:00',
    firstName: 'Can',
    lastName: 'Demir',
    phone: '0532 111 22 33',
    gender: 'Erkek',
    services: ['İmplant Tedavisi'],
    status: 'confirmed',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'apt-seed-2',
    doctorId: 'ceren-ozkalay',
    doctorName: 'Dt. Ceren Özkalay',
    date: '2026-09-23',
    time: '14:30',
    firstName: 'Selin',
    lastName: 'Kaya',
    phone: '0544 555 66 77',
    gender: 'Kadın',
    services: ['Diş Beyazlatma'],
    status: 'confirmed',
    createdAt: new Date().toISOString(),
  },
];

// GET: List all booked slots (or filter by doctorId)
export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const doctorId = searchParams.get('doctorId');
  const date = searchParams.get('date');

  let filtered = [...appointments];
  if (doctorId) {
    filtered = filtered.filter((a) => a.doctorId === doctorId);
  }
  if (date) {
    filtered = filtered.filter((a) => a.date === date);
  }

  // Extract booked slots for easy calendar disable check
  const bookedSlots = filtered.map((a) => ({
    doctorId: a.doctorId,
    date: a.date,
    time: a.time,
  }));

  return NextResponse.json({
    success: true,
    appointments: filtered,
    bookedSlots,
  });
}

// POST: Book a new appointment
export async function POST(request) {
  try {
    const data = await request.json();
    const { doctorId, doctorName, date, time, firstName, lastName, phone, gender, services, notes } = data;

    // Validation
    if (!doctorId || !date || !time || !firstName || !lastName || !phone || !gender || !services || services.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Lütfen tüm zorunlu alanları doldurunuz.' },
        { status: 400 }
      );
    }

    // Check if slot is already booked locally
    const isSlotTaken = appointments.some(
      (a) => a.doctorId === doctorId && a.date === date && a.time === time
    );

    if (isSlotTaken) {
      return NextResponse.json(
        { success: false, error: 'Seçtiğiniz randevu saati az önce rezerve edilmiştir. Lütfen başka bir saat seçiniz.' },
        { status: 409 }
      );
    }

    // For Dt. Yakup Aşar: re-validate against live Doktorsitesi data at booking time
    // This prevents race conditions between display cache and actual availability.
    if (doctorId === 'yakup-asar') {
      try {
        const dsRes = await fetch(
          `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/api/appointments/doktorsitesi?refresh=true`,
          { cache: 'no-store' }
        );

        if (!dsRes.ok) {
          // Doktorsitesi unreachable at booking time — reject to avoid phantom bookings
          return NextResponse.json(
            {
              success: false,
              error:
                'Randevu saatleri şu anda doğrulanamıyor. Lütfen birkaç saniye sonra tekrar deneyin.',
            },
            { status: 503 }
          );
        }

        const dsData = await dsRes.json();

        if (!dsData.success || !dsData.scheduleByDate) {
          return NextResponse.json(
            {
              success: false,
              error:
                'Randevu saatleri şu anda doğrulanamıyor. Lütfen birkaç saniye sonra tekrar deneyin.',
            },
            { status: 503 }
          );
        }

        const daySchedule = dsData.scheduleByDate[date];
        if (daySchedule) {
          // If slot is not explicitly in available list, reject it
          const isAvailableOnDs = daySchedule.available?.includes(time);
          if (!isAvailableOnDs) {
            return NextResponse.json(
              {
                success: false,
                error:
                  'Seçtiğiniz saat Doktorsitesi takviminde müsait değil. Lütfen başka bir saat seçiniz.',
              },
              { status: 409 }
            );
          }
        }
      } catch (dsErr) {
        console.error('[Appointments] Doktorsitesi re-validation error:', dsErr.message);
        return NextResponse.json(
          {
            success: false,
            error:
              'Randevu saatleri şu anda doğrulanamıyor. Lütfen birkaç saniye sonra tekrar deneyin.',
          },
          { status: 503 }
        );
      }
    }

    const newAppointment = {
      id: `apt-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
      doctorId,
      doctorName: doctorName || 'Diş Hekimi',
      date,
      time,
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      phone: phone.trim(),
      gender,
      services: Array.isArray(services) ? services : [services],
      notes: notes ? notes.trim() : '',
      status: 'confirmed',
      createdAt: new Date().toISOString(),
    };

    appointments.push(newAppointment);

    return NextResponse.json({
      success: true,
      message: 'Randevunuz başarıyla oluşturuldu.',
      appointment: newAppointment,
    });
  } catch (error) {
    console.error('Error creating appointment:', error);
    return NextResponse.json(
      { success: false, error: 'Randevu oluşturulurken bir hata oluştu.' },
      { status: 500 }
    );
  }
}
