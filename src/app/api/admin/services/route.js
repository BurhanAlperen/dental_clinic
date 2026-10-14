import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/adminAuth";

/**
 * GET /api/admin/services
 */
export async function GET(request) {
    const { error } = await requireAuth("ANY");
    if (error) return error;

    const { searchParams } = new URL(request.url);
    const includeInactive = searchParams.get("includeInactive") === "true";

    const services = await prisma.service.findMany({
        where: includeInactive ? {} : { isActive: true },
        include: {
            _count: { select: { appointmentServices: true } },
        },
        orderBy: { name: "asc" },
    });

    return NextResponse.json({ success: true, services });
}

/**
 * POST /api/admin/services
 */
export async function POST(request) {
    const { error } = await requireAuth("SUPER_ADMIN");
    if (error) return error;

    const body = await request.json();
    const { name, description } = body;

    if (!name?.trim()) {
        return NextResponse.json(
            { success: false, error: "Hizmet adı zorunludur." },
            { status: 400 }
        );
    }

    try {
        const service = await prisma.service.create({
            data: {
                name: name.trim(),
                description: description?.trim() || null,
                isActive: true,
            },
        });
        return NextResponse.json({ success: true, service }, { status: 201 });
    } catch (err) {
        if (err.code === "P2002") {
            return NextResponse.json(
                { success: false, error: "Bu isimde bir hizmet zaten mevcut." },
                { status: 409 }
            );
        }
        return NextResponse.json(
            { success: false, error: "Hizmet oluşturulurken hata oluştu." },
            { status: 500 }
        );
    }
}
