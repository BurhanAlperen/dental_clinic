import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/adminAuth";

/**
 * GET /api/admin/doctors/[id]/blocked-times
 */
export async function GET(request, { params }) {
    const { error } = await requireAuth("SUPER_ADMIN");
    if (error) return error;

    const doctorId = parseInt((await params).id);
    const blockedTimes = await prisma.doctorBlockedTime.findMany({
        where: { doctorId, endAt: { gte: new Date() } },
        orderBy: { startAt: "asc" },
    });

    return NextResponse.json({ success: true, blockedTimes });
}

/**
 * POST /api/admin/doctors/[id]/blocked-times
 * Yeni blok zaman ekle
 */
export async function POST(request, { params }) {
    const { error } = await requireAuth("SUPER_ADMIN");
    if (error) return error;

    const doctorId = parseInt((await params).id);
    const body = await request.json();
    const { startAt, endAt, reason } = body;

    if (!startAt || !endAt) {
        return NextResponse.json(
            { success: false, error: "Başlangıç ve bitiş zamanı zorunludur." },
            { status: 400 }
        );
    }

    const blockedTime = await prisma.doctorBlockedTime.create({
        data: {
            doctorId,
            startAt: new Date(startAt),
            endAt: new Date(endAt),
            reason: reason?.trim() || null,
        },
    });

    return NextResponse.json({ success: true, blockedTime }, { status: 201 });
}
