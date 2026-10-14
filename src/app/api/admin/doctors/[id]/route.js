import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/adminAuth";

/**
 * GET /api/admin/doctors/[id]
 */
export async function GET(request, { params }) {
    const { error } = await requireAuth("ANY");
    if (error) return error;

    const id = parseInt((await params).id);
    const doctor = await prisma.doctor.findUnique({
        where: { id },
        include: {
            user: { select: { id: true, name: true, email: true, isActive: true } },
            availabilities: { orderBy: { dayOfWeek: "asc" } },
            blockedTimes: {
                where: { endAt: { gte: new Date() } },
                orderBy: { startAt: "asc" },
            },
            _count: { select: { appointments: true } },
        },
    });

    if (!doctor) {
        return NextResponse.json({ success: false, error: "Doktor bulunamadı." }, { status: 404 });
    }

    return NextResponse.json({ success: true, doctor });
}

/**
 * PATCH /api/admin/doctors/[id]
 */
export async function PATCH(request, { params }) {
    const { error } = await requireAuth("SUPER_ADMIN");
    if (error) return error;

    const id = parseInt((await params).id);
    const body = await request.json();
    const { title, specialtyTitle, specialty, photoUrl, bio, isActive, name, email } = body;

    try {
        const doctor = await prisma.doctor.update({
            where: { id },
            data: {
                ...(title !== undefined && { title: title || null }),
                ...(specialtyTitle !== undefined && { specialtyTitle: specialtyTitle || null }),
                ...(specialty !== undefined && { specialty: specialty || null }),
                ...(photoUrl !== undefined && { photoUrl: photoUrl || null }),
                ...(bio !== undefined && { bio: bio || null }),
                ...(isActive !== undefined && { isActive }),
                ...(name || email
                    ? {
                        user: {
                            update: {
                                ...(name && { name }),
                                ...(email && { email: email.toLowerCase() }),
                                ...(isActive !== undefined && { isActive }),
                            },
                        },
                    }
                    : {}),
            },
            include: {
                user: { select: { id: true, name: true, email: true, isActive: true } },
            },
        });

        return NextResponse.json({ success: true, doctor });
    } catch (err) {
        console.error("[Admin Doctors PATCH]", err);
        return NextResponse.json(
            { success: false, error: "Doktor güncellenirken hata oluştu." },
            { status: 500 }
        );
    }
}

/**
 * DELETE /api/admin/doctors/[id]
 * Sadece pasif hale getirir (soft delete)
 */
export async function DELETE(request, { params }) {
    const { error } = await requireAuth("SUPER_ADMIN");
    if (error) return error;

    const id = parseInt((await params).id);

    await prisma.doctor.update({
        where: { id },
        data: {
            isActive: false,
            user: { update: { isActive: false } },
        },
    });

    return NextResponse.json({ success: true, message: "Doktor pasife alındı." });
}
