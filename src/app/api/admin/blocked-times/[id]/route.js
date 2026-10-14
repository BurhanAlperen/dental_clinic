import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/adminAuth";

/**
 * DELETE /api/admin/blocked-times/[id]
 */
export async function DELETE(request, { params }) {
    const { error } = await requireAuth("SUPER_ADMIN");
    if (error) return error;

    const id = parseInt((await params).id);
    await prisma.doctorBlockedTime.delete({ where: { id } });

    return NextResponse.json({ success: true });
}
