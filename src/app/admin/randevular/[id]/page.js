import { notFound } from "next/navigation";
import Link from "next/link";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import AppointmentDetail from "@/components/admin/AppointmentDetail";
import styles from "../../admin.module.css";
import { ArrowLeft } from "lucide-react";

export default async function AppointmentDetailPage({ params }) {
    const session = await auth();
    const id = parseInt((await params).id);

    if (isNaN(id)) notFound();

    const appointment = await prisma.appointment.findUnique({
        where: { id },
        include: {
            patient: true,
            doctor: {
                include: {
                    user: { select: { name: true, email: true } },
                },
            },
            services: { include: { service: true } },
        },
    });

    if (!appointment) notFound();

    // Doktor sadece kendi randevusunu görebilir
    if (
        session.user.role === "DOCTOR" &&
        appointment.doctorId !== session.user.doctorId
    ) {
        notFound();
    }

    const services = await prisma.service.findMany({
        where: { isActive: true },
        orderBy: { name: "asc" },
    });

    const backHref =
        session.user.role === "SUPER_ADMIN"
            ? "/admin/randevular"
            : "/admin/doktor/randevular";

    return (
        <div>
            <div style={{ marginBottom: 20 }}>
                <Link
                    href={backHref}
                    style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 6,
                        fontSize: 13,
                        color: "#64748b",
                        textDecoration: "none",
                        fontWeight: 500,
                    }}
                >
                    <ArrowLeft size={16} /> Geri Dön
                </Link>
            </div>

            <AppointmentDetail
                appointment={appointment}
                services={services}
                userRole={session.user.role}
            />
        </div>
    );
}
