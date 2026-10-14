import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/adminAuth";

/**
 * GET /api/admin/patients
 */
export async function GET(request) {
    const { error } = await requireAuth("SUPER_ADMIN");
    if (error) return error;

    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search");
    const page = Math.max(1, parseInt(searchParams.get("page") || "1"));
    const pageSize = Math.min(100, parseInt(searchParams.get("pageSize") || "20"));

    const where = {};
    if (search) {
        where.OR = [
            { firstName: { contains: search } },
            { lastName: { contains: search } },
            { phone: { contains: search } },
            { nationalId: { contains: search } },
        ];
    }

    const [total, patients] = await Promise.all([
        prisma.patient.count({ where }),
        prisma.patient.findMany({
            where,
            include: {
                _count: { select: { appointments: true } },
            },
            orderBy: { lastName: "asc" },
            skip: (page - 1) * pageSize,
            take: pageSize,
        }),
    ]);

    return NextResponse.json({
        success: true,
        patients,
        pagination: { total, page, pageSize, totalPages: Math.ceil(total / pageSize) },
    });
}
