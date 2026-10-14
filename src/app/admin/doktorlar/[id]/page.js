import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { ArrowLeft } from "lucide-react";
import DoctorProfile from "@/components/admin/DoctorProfile";

export default async function DoctorDetailPage({ params }) {
    const id = parseInt((await params).id);
    if (isNaN(id)) notFound();

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

    if (!doctor) notFound();

    return (
        <div>
            <div style={{ marginBottom: 20 }}>
                <Link
                    href="/admin/doktorlar"
                    style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 13, color: "#64748b", textDecoration: "none", fontWeight: 500 }}
                >
                    <ArrowLeft size={16} /> Doktorlara Dön
                </Link>
            </div>
            <DoctorProfile doctor={doctor} />
        </div>
    );
}
