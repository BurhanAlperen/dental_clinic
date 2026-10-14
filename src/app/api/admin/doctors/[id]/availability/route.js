import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/adminAuth";

/**
 * GET /api/admin/doctors/[id]/availability
 * Doktor çalışma saatleri
 */
export async function GET(request, { params }) {
    const { error } = await requireAuth("SUPER_ADMIN");
    if (error) return error;

    const doctorId = parseInt((await params).id);
    const availabilities = await prisma.doctorAvailability.findMany({
        where: { doctorId },
        orderBy: { dayOfWeek: "asc" },
    });

    return NextResponse.json({ success: true, availabilities });
}

/**
 * PUT /api/admin/doctors/[id]/availability
 * Çalışma saatlerini toplu güncelle (replace)
 */
export async function PUT(request, { params }) {
    const { error } = await requireAuth("SUPER_ADMIN");
    if (error) return error;

    const doctorId = parseInt((await params).id);
    const body = await request.json();
    const { availabilities } = body; // [{ dayOfWeek, startMinute, endMinute, isActive }]

    if (!Array.isArray(availabilities)) {
        return NextResponse.json(
            { success: false, error: "availabilities dizisi gerekli." },
            { status: 400 }
        );
    }

    // Mevcut müsaitlikleri sil, yeniden ekle
    await prisma.doctorAvailability.deleteMany({ where: { doctorId } });

    const created = await prisma.doctorAvailability.createMany({
        data: availabilities.map((a) => ({
            doctorId,
            dayOfWeek: a.dayOfWeek,
            startMinute: a.startMinute,
            endMinute: a.endMinute,
            isActive: a.isActive !== false,
        })),
    });

    return NextResponse.json({ success: true, count: created.count });
}
