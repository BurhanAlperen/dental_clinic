import { redirect } from "next/navigation";
import Link from "next/link";
import {
    CalendarCheck2, CalendarClock, ClipboardList,
    CheckCircle2, Clock, ArrowRight
} from "lucide-react";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import styles from "../admin.module.css";

const ISTANBUL_TZ = "Europe/Istanbul";

function getIstanbulTodayBounds() {
    const parts = new Intl.DateTimeFormat("en-US", {
        timeZone: ISTANBUL_TZ,
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
    }).formatToParts(new Date());

    const v = Object.fromEntries(
        parts.filter(({ type }) => type !== "literal").map(({ type, value }) => [type, value])
    );

    const start = new Date(Date.UTC(Number(v.year), Number(v.month) - 1, Number(v.day), -3));
    return { start, end: new Date(start.getTime() + 24 * 60 * 60 * 1000) };
}

function formatDateTime(date) {
    return new Intl.DateTimeFormat("tr-TR", {
        timeZone: ISTANBUL_TZ,
        day: "numeric",
        month: "long",
        weekday: "short",
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
    }).format(date);
}

function formatDate(date) {
    return new Intl.DateTimeFormat("tr-TR", {
        timeZone: ISTANBUL_TZ,
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
    }).format(date);
}

const STATUS_CONFIG = {
    PENDING: { label: "Onay Bekliyor", color: "#b45309", bg: "#fffbeb", border: "#fde68a" },
    CONFIRMED: { label: "Onaylandı", color: "#15803d", bg: "#f0fdf4", border: "#bbf7d0" },
    CANCELLED: { label: "İptal Edildi", color: "#be123c", bg: "#fff1f2", border: "#fecdd3" },
    COMPLETED: { label: "Tamamlandı", color: "#1d4ed8", bg: "#eff6ff", border: "#bfdbfe" },
    NO_SHOW: { label: "Gelmedi", color: "#475569", bg: "#f8fafc", border: "#e2e8f0" },
};

export default async function DoctorDashboardPage() {
    const session = await auth();
    if (!session?.user || session.user.role !== "DOCTOR") redirect("/admin/login");

    const doctorId = session.user.doctorId;
    if (!doctorId) redirect("/admin/login");

    const { start: todayStart, end: todayEnd } = getIstanbulTodayBounds();

    const [doctor, todayCount, pendingCount, upcomingApts] = await Promise.all([
        prisma.doctor.findUnique({
            where: { id: doctorId },
            include: { user: { select: { name: true } } },
        }),
        prisma.appointment.count({
            where: { doctorId, startAt: { gte: todayStart, lt: todayEnd } },
        }),
        prisma.appointment.count({
            where: { doctorId, status: "PENDING" },
        }),
        prisma.appointment.findMany({
            where: {
                doctorId,
                startAt: { gte: new Date() },
                status: { in: ["PENDING", "CONFIRMED"] },
            },
            orderBy: { startAt: "asc" },
            take: 10,
            include: {
                patient: { select: { firstName: true, lastName: true, phone: true } },
                services: { include: { service: { select: { name: true } } } },
            },
        }),
    ]);

    const doctorFullName = [doctor?.title, doctor?.user?.name].filter(Boolean).join(" ");

    return (
        <div>
            {/* Welcome Banner */}
            <div
                style={{
                    background: "linear-gradient(135deg, #0a1628 0%, #1a2d4a 60%, #0a3444 100%)",
                    borderRadius: 20,
                    padding: "28px 32px",
                    marginBottom: 24,
                    boxShadow: "0 8px 32px rgba(0,0,0,0.12)",
                }}
            >
                <p style={{ fontSize: 12, color: "#48cae4", fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 8 }}>
                    DOKTOR PANELİ
                </p>
                <h1 style={{ fontSize: 24, fontWeight: 800, color: "#fff", margin: 0, fontFamily: "'Inter', sans-serif" }}>
                    Hoş geldin, {doctorFullName || session.user.name?.split(" ")[0]} 👋
                </h1>
                <p style={{ fontSize: 14, color: "rgba(255,255,255,0.5)", marginTop: 6 }}>
                    {formatDate(new Date())}
                </p>
            </div>

            {/* Stats */}
            <div className={styles.statsGrid} style={{ gridTemplateColumns: "repeat(3, 1fr)", marginBottom: 24 }}>
                <div className={styles.statCard}>
                    <div className={styles.statCardTop}>
                        <div className={styles.statCardIcon} style={{ background: "#eff6ff" }}>
                            <CalendarClock size={20} color="#1d4ed8" />
                        </div>
                    </div>
                    <div className={styles.statCardValue}>{todayCount}</div>
                    <div className={styles.statCardLabel}>Bugünkü Randevularım</div>
                </div>
                <div className={styles.statCard}>
                    <div className={styles.statCardTop}>
                        <div className={styles.statCardIcon} style={{ background: "#fffbeb" }}>
                            <ClipboardList size={20} color="#b45309" />
                        </div>
                    </div>
                    <div className={styles.statCardValue}>{pendingCount}</div>
                    <div className={styles.statCardLabel}>Onay Bekleyen</div>
                </div>
                <div className={styles.statCard}>
                    <div className={styles.statCardTop}>
                        <div className={styles.statCardIcon} style={{ background: "#f0fdf4" }}>
                            <CalendarCheck2 size={20} color="#15803d" />
                        </div>
                    </div>
                    <div className={styles.statCardValue}>{upcomingApts.length}</div>
                    <div className={styles.statCardLabel}>Yaklaşan Randevu</div>
                </div>
            </div>

            {/* Upcoming Appointments */}
            <div className={styles.adminCard}>
                <div className={styles.adminCardHeader}>
                    <div>
                        <div className={styles.adminCardTitle}>Yaklaşan Randevularım</div>
                        <div className={styles.adminCardSubtitle}>Onaylı ve bekleyen gelecek randevular</div>
                    </div>
                    <Link
                        href="/admin/doktor/randevular"
                        style={{ display: "inline-flex", alignItems: "center", gap: 4, fontSize: 13, color: "#00b4d8", fontWeight: 600, textDecoration: "none" }}
                    >
                        Tümünü Gör <ArrowRight size={14} />
                    </Link>
                </div>

                {upcomingApts.length === 0 ? (
                    <div className={styles.emptyState}>
                        <CheckCircle2 size={48} style={{ color: "#bbf7d0", margin: "0 auto 16px" }} />
                        <p className={styles.emptyStateTitle}>Yaklaşan randevu bulunmuyor</p>
                        <p className={styles.emptyStateDesc}>Yeni randevular burada görünecek.</p>
                    </div>
                ) : (
                    <ul style={{ listStyle: "none", margin: 0, padding: 0 }}>
                        {upcomingApts.map((apt) => {
                            const cfg = STATUS_CONFIG[apt.status];
                            const services = apt.services.map((s) => s.service.name).join(", ");
                            return (
                                <li
                                    key={apt.id}
                                    style={{
                                        display: "flex",
                                        alignItems: "center",
                                        gap: 14,
                                        padding: "14px 20px",
                                        borderBottom: "1px solid #f1f5f9",
                                    }}
                                >
                                    <div
                                        style={{
                                            width: 42,
                                            height: 42,
                                            borderRadius: 11,
                                            background: cfg?.bg || "#f8fafc",
                                            display: "flex",
                                            alignItems: "center",
                                            justifyContent: "center",
                                            flexShrink: 0,
                                        }}
                                    >
                                        {apt.status === "PENDING" ? (
                                            <Clock size={18} color={cfg?.color} />
                                        ) : (
                                            <CheckCircle2 size={18} color={cfg?.color} />
                                        )}
                                    </div>
                                    <div style={{ flex: 1, minWidth: 0 }}>
                                        <p style={{ margin: 0, fontSize: 14, fontWeight: 700, color: "#0f172a" }}>
                                            {apt.patient.firstName} {apt.patient.lastName}
                                        </p>
                                        <p style={{ margin: "2px 0 0", fontSize: 12, color: "#94a3b8" }}>
                                            {apt.patient.phone} · {services || "Hizmet seçilmemiş"}
                                        </p>
                                    </div>
                                    <div style={{ textAlign: "right", flexShrink: 0 }}>
                                        <p style={{ margin: 0, fontSize: 13, fontWeight: 600, color: "#475569" }}>
                                            {formatDateTime(apt.startAt)}
                                        </p>
                                        <span
                                            style={{
                                                display: "inline-block",
                                                marginTop: 3,
                                                padding: "2px 8px",
                                                borderRadius: 9999,
                                                fontSize: 11,
                                                fontWeight: 600,
                                                background: cfg?.bg,
                                                color: cfg?.color,
                                                border: `1px solid ${cfg?.border}`,
                                            }}
                                        >
                                            {cfg?.label}
                                        </span>
                                    </div>
                                    <Link
                                        href={`/admin/randevular/${apt.id}`}
                                        style={{
                                            flexShrink: 0,
                                            padding: "7px",
                                            borderRadius: 8,
                                            background: "#f8fafc",
                                            border: "1px solid #e2e8f0",
                                            display: "flex",
                                            alignItems: "center",
                                            color: "#64748b",
                                        }}
                                    >
                                        <ArrowRight size={14} />
                                    </Link>
                                </li>
                            );
                        })}
                    </ul>
                )}
            </div>
        </div>
    );
}
