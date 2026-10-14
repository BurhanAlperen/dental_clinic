import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/adminAuth";

export async function PATCH(request, { params }) {
    const { error } = await requireAuth("SUPER_ADMIN");
    if (error) return error;

    const id = parseInt((await params).id);
    const body = await request.json();
    const { name, description, isActive } = body;

    const service = await prisma.service.update({
        where: { id },
        data: {
            ...(name !== undefined && { name: name.trim() }),
            ...(description !== undefined && { description: description?.trim() || null }),
            ...(isActive !== undefined && { isActive }),
        },
    });

    return NextResponse.json({ success: true, service });
}

export async function DELETE(request, { params }) {
    const { error } = await requireAuth("SUPER_ADMIN");
    if (error) return error;

    const id = parseInt((await params).id);

    // Soft delete
    const service = await prisma.service.update({
        where: { id },
        data: { isActive: false },
    });

    return NextResponse.json({ success: true, service });
}
