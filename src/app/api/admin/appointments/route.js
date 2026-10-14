import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth, VALID_STATUSES } from "@/lib/adminAuth";

// Randevu include şablonu
const appointmentInclude = {
    patient: {
        select: {
            id: true,
            firstName: true,
            lastName: true,
            phone: true,
            email: true,
            gender: true,
            nationalId: true,
        },
    },
    doctor: {
        select: {
            id: true,
            title: true,
            specialty: true,
            user: { select: { name: true } },
        },
    },
    services: {
        include: {
            service: { select: { id: true, name: true } },
        },
    },
};

/**
 * GET /api/admin/appointments
 * Super Admin: tüm randevular
 * Doctor: sadece kendi randevuları
 */
export async function GET(request) {
    const { error, session } = await requireAuth("ANY");
    if (error) return error;

    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const doctorId = searchParams.get("doctorId");
    const patientId = searchParams.get("patientId");
    const dateFrom = searchParams.get("dateFrom");
    const dateTo = searchParams.get("dateTo");
    const search = searchParams.get("search");
    const page = Math.max(1, parseInt(searchParams.get("page") || "1"));
    const pageSize = Math.min(100, parseInt(searchParams.get("pageSize") || "20"));

    const where = {};

    // Doktor sadece kendi randevularını görebilir
    if (session.user.role === "DOCTOR") {
        where.doctorId = session.user.doctorId;
    } else if (doctorId) {
        where.doctorId = parseInt(doctorId);
    }

    if (patientId) where.patientId = parseInt(patientId);
    if (status && VALID_STATUSES.includes(status)) {
        where.status = status;
    }
    if (dateFrom || dateTo) {
        where.startAt = {};
        if (dateFrom) where.startAt.gte = new Date(dateFrom);
        if (dateTo) where.startAt.lte = new Date(dateTo);
    }

    // İsim araması
    if (search) {
        where.patient = {
            OR: [
                { firstName: { contains: search } },
                { lastName: { contains: search } },
                { phone: { contains: search } },
            ],
        };
    }

    const [total, appointments] = await Promise.all([
        prisma.appointment.count({ where }),
        prisma.appointment.findMany({
            where,
            include: appointmentInclude,
            orderBy: { startAt: "desc" },
            skip: (page - 1) * pageSize,
            take: pageSize,
        }),
    ]);

    return NextResponse.json({
        success: true,
        appointments,
        pagination: {
            total,
            page,
            pageSize,
            totalPages: Math.ceil(total / pageSize),
        },
    });
}

/**
 * POST /api/admin/appointments
 * Yeni randevu oluştur (sadece Super Admin)
 */
export async function POST(request) {
    const { error, session } = await requireAuth("SUPER_ADMIN");
    if (error) return error;

    try {
        const body = await request.json();
        const {
            doctorId,
            patientId,
            startAt,
            endAt,
            status = "PENDING",
            patientNotes,
            serviceIds,
            // Yeni hasta bilgileri
            patient,
        } = body;

        if (!doctorId || !startAt || !endAt) {
            return NextResponse.json(
                { success: false, error: "Doktor, başlangıç ve bitiş saati zorunludur." },
                { status: 400 }
            );
        }

        const startDate = new Date(startAt);
        const endDate = new Date(endAt);

        if (endDate <= startDate) {
            return NextResponse.json(
                { success: false, error: "Bitiş saati başlangıç saatinden sonra olmalıdır." },
                { status: 400 }
            );
        }

        // Doktor var mı?
        const doctor = await prisma.doctor.findUnique({
            where: { id: parseInt(doctorId) },
        });
        if (!doctor) {
            return NextResponse.json(
                { success: false, error: "Doktor bulunamadı." },
                { status: 404 }
            );
        }

        // Çakışma kontrolü
        const conflict = await prisma.appointment.findFirst({
            where: {
                doctorId: parseInt(doctorId),
                status: { in: ["PENDING", "CONFIRMED"] },
                AND: [
                    { startAt: { lt: endDate } },
                    { endAt: { gt: startDate } },
                ],
            },
        });

        if (conflict) {
            return NextResponse.json(
                {
                    success: false,
                    error: "Bu doktor için seçilen zaman aralığında çakışan bir randevu bulunuyor.",
                },
                { status: 409 }
            );
        }

        let resolvedPatientId = patientId;

        // Yeni hasta oluştur
        if (!patientId && patient) {
            const { firstName, lastName, phone, email, gender, nationalId, notes } = patient;
            if (!firstName || !lastName || !phone || !gender) {
                return NextResponse.json(
                    { success: false, error: "Hasta bilgileri eksik." },
                    { status: 400 }
                );
            }

            // Telefon veya TC'ye göre var mı bak
            let existingPatient = null;
            if (nationalId) {
                existingPatient = await prisma.patient.findUnique({
                    where: { nationalId },
                });
            }

            if (!existingPatient) {
                existingPatient = await prisma.patient.create({
                    data: {
                        firstName: firstName.trim(),
                        lastName: lastName.trim(),
                        phone: phone.trim(),
                        email: email?.trim() || "",
                        gender: gender || "UNSPECIFIED",
                        nationalId: nationalId?.trim() || null,
                        notes: notes?.trim() || null,
                    },
                });
            }
            resolvedPatientId = existingPatient.id;
        }

        if (!resolvedPatientId) {
            return NextResponse.json(
                { success: false, error: "Hasta bilgisi zorunludur." },
                { status: 400 }
            );
        }

        const appointment = await prisma.appointment.create({
            data: {
                doctorId: parseInt(doctorId),
                patientId: resolvedPatientId,
                startAt: startDate,
                endAt: endDate,
                status: VALID_STATUSES.includes(status) ? status : "PENDING",
                patientNotes: patientNotes?.trim() || null,
                services: serviceIds?.length
                    ? {
                        create: serviceIds.map((sid) => ({
                            serviceId: parseInt(sid),
                        })),
                    }
                    : undefined,
            },
            include: appointmentInclude,
        });

        return NextResponse.json({ success: true, appointment }, { status: 201 });
    } catch (err) {
        console.error("[Admin Appointments POST]", err);
        return NextResponse.json(
            { success: false, error: "Randevu oluşturulurken bir hata oluştu." },
            { status: 500 }
        );
    }
}
