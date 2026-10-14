import { redirect } from "next/navigation";
import Link from "next/link";
import {
    CalendarCheck2,
    CalendarClock,
    ClipboardList,
    Stethoscope,
    Users,
    TrendingUp,
    ArrowRight,
    CheckCircle2,
    Clock,
    XCircle,
    AlertTriangle,
} from "lucide-react";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import styles from "./admin.module.css";

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

    // UTC+3 yıl boyu sabit olduğundan gün başı 21:00 UTC
    const start = new Date(Date.UTC(Number(v.year), Number(v.month) - 1, Number(v.day), -3));

    return { start, end: new Date(start.getTime() + 24 * 60 * 60 * 1000) };
}

function formatDateTime(date) {
    return new Intl.DateTimeFormat("tr-TR", {
        timeZone: ISTANBUL_TZ,
        day: "numeric",
        month: "long",
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
    PENDING: { label: "Onay Bekliyor", icon: Clock, color: "#b45309", bg: "#fffbeb", border: "#fde68a" },
    CONFIRMED: { label: "Onaylandı", icon: CheckCircle2, color: "#15803d", bg: "#f0fdf4", border: "#bbf7d0" },
    CANCELLED: { label: "İptal Edildi", icon: XCircle, color: "#be123c", bg: "#fff1f2", border: "#fecdd3" },
    COMPLETED: { label: "Tamamlandı", icon: CheckCircle2, color: "#1d4ed8", bg: "#eff6ff", border: "#bfdbfe" },
    NO_SHOW: { label: "Gelmedi", icon: AlertTriangle, color: "#475569", bg: "#f8fafc", border: "#e2e8f0" },
};

export default async function AdminDashboardPage() {
    const session = await auth();

    if (!session?.user) redirect("/admin/login");
    if (session.user.role !== "SUPER_ADMIN") redirect("/admin/doktor");

    const { start: todayStart, end: todayEnd } = getIstanbulTodayBounds();

    const [
        totalAppointments,
        pendingCount,
        confirmedCount,
        todayCount,
        activeDoctors,
        totalPatients,
        upcomingAppointments,
        pendingAppointments,
    ] = await Promise.all([
        prisma.appointment.count(),
        prisma.appointment.count({ where: { status: "PENDING" } }),
        prisma.appointment.count({ where: { status: "CONFIRMED" } }),
        prisma.appointment.count({
            where: { startAt: { gte: todayStart, lt: todayEnd } },
        }),
        prisma.doctor.count({ where: { isActive: true } }),
        prisma.patient.count(),
        prisma.appointment.findMany({
            where: {
                startAt: { gte: new Date() },
                status: { in: ["PENDING", "CONFIRMED"] },
            },
            orderBy: { startAt: "asc" },
            take: 8,
            include: {
                patient: { select: { firstName: true, lastName: true } },
                doctor: { select: { title: true, user: { select: { name: true } } } },
                services: { include: { service: { select: { name: true } } } },
            },
        }),
        prisma.appointment.findMany({
            where: { status: "PENDING" },
            orderBy: { createdAt: "asc" },
            take: 5,
            include: {
                patient: { select: { firstName: true, lastName: true, phone: true } },
                doctor: { select: { title: true, user: { select: { name: true } } } },
                services: { include: { service: { select: { name: true } } } },
            },
        }),
    ]);

    const statsCards = [
        {
            label: "Bugünkü Randevular",
            value: todayCount,
            icon: CalendarClock,
            iconBg: "#eff6ff",
            iconColor: "#1d4ed8",
        },
        {
            label: "Onay Bekliyor",
            value: pendingCount,
            icon: ClipboardList,
            iconBg: "#fffbeb",
            iconColor: "#b45309",
            href: "/admin/randevular?status=PENDING",
        },
        {
            label: "Onaylanan",
            value: confirmedCount,
            icon: CalendarCheck2,
            iconBg: "#f0fdf4",
            iconColor: "#15803d",
        },
        {
            label: "Aktif Doktorlar",
            value: activeDoctors,
            icon: Stethoscope,
            iconBg: "#fdf4ff",
            iconColor: "#7e22ce",
        },
        {
            label: "Toplam Hasta",
            value: totalPatients,
            icon: Users,
            iconBg: "#fff7ed",
            iconColor: "#c2410c",
        },
        {
            label: "Toplam Randevu",
            value: totalAppointments,
            icon: TrendingUp,
            iconBg: "#f0fdf4",
            iconColor: "#0f766e",
        },
    ];

    return (
        <div>
            {/* Hoşgeldin Banner */}
            <div
                style={{
                    background: "linear-gradient(135deg, #0a1628 0%, #1a2d4a 60%, #0a3444 100%)",
                    borderRadius: 20,
                    padding: "28px 32px",
                    marginBottom: 24,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    flexWrap: "wrap",
                    gap: 16,
                    boxShadow: "0 8px 32px rgba(0,0,0,0.12)",
                }}
            >
                <div>
                    <p style={{ fontSize: 12, color: "#48cae4", fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 6 }}>
                        TURHAL DİŞ KLİNİĞİ
                    </p>
                    <h1 style={{ fontSize: 26, fontWeight: 800, color: "#fff", margin: 0, fontFamily: "'Inter', sans-serif" }}>
                        Hoş geldin, {session.user.name?.split(" ")[0] || "Yönetici"} 👋
                    </h1>
                    <p style={{ fontSize: 14, color: "rgba(255,255,255,0.5)", marginTop: 6 }}>
                        {formatDate(new Date())}
                    </p>
                </div>
                <Link
                    href="/admin/randevular/yeni"
                    style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 8,
                        padding: "11px 20px",
                        background: "linear-gradient(135deg, #00b4d8, #0096b7)",
                        color: "#fff",
                        borderRadius: 12,
                        fontSize: 14,
                        fontWeight: 700,
                        textDecoration: "none",
                        boxShadow: "0 4px 14px rgba(0, 180, 216, 0.4)",
                    }}
                >
                    <CalendarCheck2 size={16} />
                    Yeni Randevu
                </Link>
            </div>

            {/* Stats Grid */}
            <div className={styles.statsGrid} style={{ gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))" }}>
                {statsCards.map(({ label, value, icon: Icon, iconBg, iconColor, href }) => {
                    const inner = (
                        <>
                            <div className={styles.statCardTop}>
                                <div
                                    className={styles.statCardIcon}
                                    style={{ background: iconBg }}
                                >
                                    <Icon size={20} color={iconColor} />
                                </div>
                            </div>
                            <div className={styles.statCardValue}>{value}</div>
                            <div className={styles.statCardLabel}>{label}</div>
                        </>
                    );
                    return href ? (
                        <Link
                            key={label}
                            href={href}
                            className={styles.statCard}
                            style={{ textDecoration: "none", cursor: "pointer", display: "block" }}
                        >
                            {inner}
                        </Link>
                    ) : (
                        <div key={label} className={styles.statCard}>
                            {inner}
                        </div>
                    );
                })}
            </div>

            {/* İki kolon: Yaklaşan Randevular + Bekleyen Talepler */}
            <div
                style={{
                    display: "grid",
                    gridTemplateColumns: "minmax(0,1fr) 360px",
                    gap: 20,
                    marginTop: 24,
                }}
            >
                {/* Yaklaşan Randevular */}
                <div className={styles.adminCard}>
                    <div className={styles.adminCardHeader}>
                        <div>
                            <div className={styles.adminCardTitle}>Yaklaşan Randevular</div>
                            <div className={styles.adminCardSubtitle}>Onaylı ve bekleyen gelecek randevular</div>
                        </div>
                        <Link
                            href="/admin/randevular"
                            style={{
                                display: "inline-flex",
                                alignItems: "center",
                                gap: 4,
                                fontSize: 13,
                                color: "#00b4d8",
                                fontWeight: 600,
                                textDecoration: "none",
                            }}
                        >
                            Tümünü gör <ArrowRight size={14} />
                        </Link>
                    </div>

                    {upcomingAppointments.length === 0 ? (
                        <div className={styles.emptyState}>
                            <CalendarClock className={styles.emptyStateIcon} size={48} />
                            <p className={styles.emptyStateTitle}>Yaklaşan randevu yok</p>
                            <p className={styles.emptyStateDesc}>Yeni randevular oluştuğunda burada görünecek.</p>
                        </div>
                    ) : (
                        <ul style={{ listStyle: "none", margin: 0, padding: 0 }}>
                            {upcomingAppointments.map((apt) => {
                                const cfg = STATUS_CONFIG[apt.status];
                                const StatusIcon = cfg?.icon || Clock;
                                const doctorName = [apt.doctor.title, apt.doctor.user.name].filter(Boolean).join(" ");
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
                                                width: 40,
                                                height: 40,
                                                borderRadius: 10,
                                                background: cfg?.bg || "#f8fafc",
                                                display: "flex",
                                                alignItems: "center",
                                                justifyContent: "center",
                                                flexShrink: 0,
                                            }}
                                        >
                                            <StatusIcon size={18} color={cfg?.color || "#475569"} />
                                        </div>
                                        <div style={{ flex: 1, minWidth: 0 }}>
                                            <p style={{ margin: 0, fontSize: 14, fontWeight: 600, color: "#0f172a" }}>
                                                {apt.patient.firstName} {apt.patient.lastName}
                                            </p>
                                            <p style={{ margin: "2px 0 0", fontSize: 12, color: "#94a3b8", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                                                {doctorName} · {services || "Hizmet seçilmemiş"}
                                            </p>
                                        </div>
                                        <div style={{ textAlign: "right", flexShrink: 0 }}>
                                            <p style={{ margin: 0, fontSize: 12, fontWeight: 600, color: "#475569" }}>
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
                                    </li>
                                );
                            })}
                        </ul>
                    )}
                </div>

                {/* Bekleyen Talepler */}
                <div className={styles.adminCard}>
                    <div className={styles.adminCardHeader}>
                        <div>
                            <div className={styles.adminCardTitle}>Bekleyen Talepler</div>
                            <div className={styles.adminCardSubtitle}>{pendingCount} onay bekliyor</div>
                        </div>
                    </div>

                    {pendingAppointments.length === 0 ? (
                        <div className={styles.emptyState} style={{ padding: "40px 20px" }}>
                            <CheckCircle2 size={40} color="#bbf7d0" style={{ margin: "0 auto 12px" }} />
                            <p className={styles.emptyStateTitle}>Bekleyen talep yok</p>
                        </div>
                    ) : (
                        <ul style={{ listStyle: "none", margin: 0, padding: "8px 0" }}>
                            {pendingAppointments.map((apt) => {
                                const doctorName = [apt.doctor.title, apt.doctor.user.name].filter(Boolean).join(" ");
                                const services = apt.services.map((s) => s.service.name).join(", ");
                                return (
                                    <li key={apt.id} style={{ padding: "12px 20px" }}>
                                        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 8 }}>
                                            <div style={{ flex: 1, minWidth: 0 }}>
                                                <p style={{ margin: 0, fontSize: 14, fontWeight: 700, color: "#0f172a" }}>
                                                    {apt.patient.firstName} {apt.patient.lastName}
                                                </p>
                                                <p style={{ margin: "2px 0 0", fontSize: 12, color: "#64748b" }}>{apt.patient.phone}</p>
                                                <p style={{ margin: "2px 0 0", fontSize: 12, color: "#94a3b8", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                                                    {doctorName}
                                                </p>
                                                <p style={{ margin: "4px 0 0", fontSize: 12, color: "#64748b" }}>
                                                    {formatDateTime(apt.startAt)}
                                                </p>
                                            </div>
                                            <Link
                                                href={`/admin/randevular/${apt.id}`}
                                                style={{
                                                    flexShrink: 0,
                                                    display: "inline-flex",
                                                    alignItems: "center",
                                                    padding: "6px 10px",
                                                    background: "#00b4d8",
                                                    color: "#fff",
                                                    borderRadius: 8,
                                                    fontSize: 12,
                                                    fontWeight: 600,
                                                    textDecoration: "none",
                                                    gap: 4,
                                                }}
                                            >
                                                İncele <ArrowRight size={12} />
                                            </Link>
                                        </div>
                                        <div style={{ marginTop: 8, height: 1, background: "#f1f5f9" }} />
                                    </li>
                                );
                            })}
                        </ul>
                    )}

                    {pendingCount > 5 && (
                        <div style={{ padding: "12px 20px", borderTop: "1px solid #f1f5f9" }}>
                            <Link
                                href="/admin/randevular?status=PENDING"
                                style={{
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    gap: 4,
                                    fontSize: 13,
                                    color: "#00b4d8",
                                    fontWeight: 600,
                                    textDecoration: "none",
                                }}
                            >
                                +{pendingCount - 5} daha <ArrowRight size={13} />
                            </Link>
                        </div>
                    )}
                </div>
            </div>

            {/* Quick Actions */}
            <div
                style={{
                    marginTop: 20,
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))",
                    gap: 12,
                }}
            >
                {[
                    { href: "/admin/randevular", label: "Randevu Listesi", icon: CalendarCheck2, color: "#1d4ed8" },
                    { href: "/admin/doktorlar", label: "Doktorlar", icon: Stethoscope, color: "#7e22ce" },
                    { href: "/admin/hastalar", label: "Hastalar", icon: Users, color: "#c2410c" },
                    { href: "/admin/hizmetler", label: "Hizmetler", icon: TrendingUp, color: "#0f766e" },
                ].map(({ href, label, icon: Icon, color }) => (
                    <Link
                        key={href}
                        href={href}
                        className={styles.quickActionLink}
                    >
                        <span
                            style={{
                                width: 36,
                                height: 36,
                                borderRadius: 10,
                                background: `${color}18`,
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                flexShrink: 0,
                            }}
                        >
                            <Icon size={18} color={color} />
                        </span>
                        {label}
                    </Link>
                ))}
            </div>
        </div>
    );
}
