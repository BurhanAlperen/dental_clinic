import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/adminAuth";

/**
 * GET /api/admin/doctors
 * Tüm aktif doktorları listele
 */
export async function GET(request) {
    const { error } = await requireAuth("ANY");
    if (error) return error;

    const { searchParams } = new URL(request.url);
    const includeInactive = searchParams.get("includeInactive") === "true";

    const where = includeInactive ? {} : { isActive: true };

    const doctors = await prisma.doctor.findMany({
        where,
        include: {
            user: { select: { id: true, name: true, email: true, isActive: true, role: true } },
            _count: {
                select: { appointments: true },
            },
        },
        orderBy: { user: { name: "asc" } },
    });

    return NextResponse.json({ success: true, doctors });
}

/**
 * POST /api/admin/doctors
 * Yeni doktor ve kullanıcı oluştur (Super Admin)
 */
export async function POST(request) {
    const { error } = await requireAuth("SUPER_ADMIN");
    if (error) return error;

    try {
        const body = await request.json();
        const {
            name,
            email,
            password,
            title,
            specialtyTitle,
            specialty,
            photoUrl,
            bio,
        } = body;

        if (!name || !email || !password) {
            return NextResponse.json(
                { success: false, error: "Ad, e-posta ve parola zorunludur." },
                { status: 400 }
            );
        }

        const { hash } = await import("bcryptjs");
        const passwordHash = await hash(password, 12);

        const user = await prisma.user.create({
            data: {
                name: name.trim(),
                email: email.trim().toLowerCase(),
                passwordHash,
                role: "DOCTOR",
                isActive: true,
                doctor: {
                    create: {
                        title: title?.trim() || null,
                        specialtyTitle: specialtyTitle?.trim() || null,
                        specialty: specialty?.trim() || null,
                        photoUrl: photoUrl?.trim() || null,
                        bio: bio?.trim() || null,
                        isActive: true,
                    },
                },
            },
            include: {
                doctor: true,
            },
        });

        return NextResponse.json({ success: true, user }, { status: 201 });
    } catch (err) {
        if (err.code === "P2002") {
            return NextResponse.json(
                { success: false, error: "Bu e-posta adresi zaten kayıtlı." },
                { status: 409 }
            );
        }
        console.error("[Admin Doctors POST]", err);
        return NextResponse.json(
            { success: false, error: "Doktor oluşturulurken hata oluştu." },
            { status: 500 }
        );
    }
}
