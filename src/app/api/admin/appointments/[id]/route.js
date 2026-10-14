import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth, VALID_STATUSES } from "@/lib/adminAuth";

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
            notes: true,
        },
    },
    doctor: {
        select: {
            id: true,
            title: true,
            specialty: true,
            user: { select: { name: true, email: true } },
        },
    },
    services: {
        include: {
            service: { select: { id: true, name: true } },
        },
    },
};

/**
 * GET /api/admin/appointments/[id]
 * Randevu detayı
 */
export async function GET(request, { params }) {
    const { error, session } = await requireAuth("ANY");
    if (error) return error;

    const id = parseInt((await params).id);
    if (isNaN(id)) {
        return NextResponse.json({ success: false, error: "Geçersiz ID." }, { status: 400 });
    }

    const appointment = await prisma.appointment.findUnique({
        where: { id },
        include: appointmentInclude,
    });

    if (!appointment) {
        return NextResponse.json({ success: false, error: "Randevu bulunamadı." }, { status: 404 });
    }

    // Doktor kendi olmayan randevuya erişemez
    if (session.user.role === "DOCTOR" && appointment.doctorId !== session.user.doctorId) {
        return NextResponse.json(
            { success: false, error: "Bu randevuya erişim yetkiniz yok." },
            { status: 403 }
        );
    }

    return NextResponse.json({ success: true, appointment });
}

/**
 * PATCH /api/admin/appointments/[id]
 * Randevu güncelle (durum, notlar, hizmetler)
 */
export async function PATCH(request, { params }) {
    const { error, session } = await requireAuth("ANY");
    if (error) return error;

    const id = parseInt((await params).id);
    if (isNaN(id)) {
        return NextResponse.json({ success: false, error: "Geçersiz ID." }, { status: 400 });
    }

    const existing = await prisma.appointment.findUnique({
        where: { id },
        include: { services: true },
    });

    if (!existing) {
        return NextResponse.json({ success: false, error: "Randevu bulunamadı." }, { status: 404 });
    }

    // Doktor yetki kontrolü
    if (session.user.role === "DOCTOR" && existing.doctorId !== session.user.doctorId) {
        return NextResponse.json(
            { success: false, error: "Bu randevuyu düzenleme yetkiniz yok." },
            { status: 403 }
        );
    }

    try {
        const body = await request.json();
        const {
            status,
            patientNotes,
            cancellationReason,
            startAt,
            endAt,
            serviceIds,
            doctorId,
        } = body;

        // Doktorlar sadece belirli alanları değiştirebilir
        const doctorAllowedStatuses = ["CONFIRMED", "CANCELLED", "COMPLETED", "NO_SHOW"];
        if (
            session.user.role === "DOCTOR" &&
            status &&
            !doctorAllowedStatuses.includes(status)
        ) {
            return NextResponse.json(
                { success: false, error: "Bu duruma geçiş için yetkiniz yok." },
                { status: 403 }
            );
        }

        const updateData = {};

        if (status && VALID_STATUSES.includes(status)) {
            updateData.status = status;
        }
        if (patientNotes !== undefined) updateData.patientNotes = patientNotes || null;
        if (cancellationReason !== undefined) updateData.cancellationReason = cancellationReason || null;

        // Super Admin'e özel alanlar
        if (session.user.role === "SUPER_ADMIN") {
            if (startAt) updateData.startAt = new Date(startAt);
            if (endAt) updateData.endAt = new Date(endAt);
            if (doctorId) updateData.doctorId = parseInt(doctorId);

            // Zaman değişikliği varsa çakışma kontrolü
            if (startAt || endAt) {
                const newStart = startAt ? new Date(startAt) : existing.startAt;
                const newEnd = endAt ? new Date(endAt) : existing.endAt;
                const newDoctorId = doctorId ? parseInt(doctorId) : existing.doctorId;

                if (newEnd <= newStart) {
                    return NextResponse.json(
                        { success: false, error: "Bitiş saati başlangıç saatinden sonra olmalıdır." },
                        { status: 400 }
                    );
                }

                const newStatus = status || existing.status;
                if (["PENDING", "CONFIRMED"].includes(newStatus)) {
                    const conflict = await prisma.appointment.findFirst({
                        where: {
                            doctorId: newDoctorId,
                            status: { in: ["PENDING", "CONFIRMED"] },
                            NOT: { id },
                            AND: [
                                { startAt: { lt: newEnd } },
                                { endAt: { gt: newStart } },
                            ],
                        },
                    });

                    if (conflict) {
                        return NextResponse.json(
                            {
                                success: false,
                                error: "Seçilen zaman aralığında çakışan bir randevu var.",
                            },
                            { status: 409 }
                        );
                    }
                }
            }
        }

        const appointment = await prisma.appointment.update({
            where: { id },
            data: updateData,
            include: appointmentInclude,
        });

        // Hizmetleri güncelle (sadece Super Admin)
        if (session.user.role === "SUPER_ADMIN" && serviceIds !== undefined) {
            await prisma.appointmentService.deleteMany({ where: { appointmentId: id } });
            if (serviceIds.length > 0) {
                await prisma.appointmentService.createMany({
                    data: serviceIds.map((sid) => ({
                        appointmentId: id,
                        serviceId: parseInt(sid),
                    })),
                    skipDuplicates: true,
                });
            }
        }

        // Güncel randevuyu tekrar çek
        const updated = await prisma.appointment.findUnique({
            where: { id },
            include: appointmentInclude,
        });

        return NextResponse.json({ success: true, appointment: updated });
    } catch (err) {
        console.error("[Admin Appointments PATCH]", err);
        return NextResponse.json(
            { success: false, error: "Randevu güncellenirken hata oluştu." },
            { status: 500 }
        );
    }
}

/**
 * DELETE /api/admin/appointments/[id]
 * Sadece Super Admin silebilir
 */
export async function DELETE(request, { params }) {
    const { error } = await requireAuth("SUPER_ADMIN");
    if (error) return error;

    const id = parseInt((await params).id);
    if (isNaN(id)) {
        return NextResponse.json({ success: false, error: "Geçersiz ID." }, { status: 400 });
    }

    const existing = await prisma.appointment.findUnique({ where: { id } });
    if (!existing) {
        return NextResponse.json({ success: false, error: "Randevu bulunamadı." }, { status: 404 });
    }

    // İlişkili hizmetleri sil, sonra randevuyu sil
    await prisma.appointmentService.deleteMany({ where: { appointmentId: id } });
    await prisma.appointment.delete({ where: { id } });

    return NextResponse.json({ success: true, message: "Randevu silindi." });
}
