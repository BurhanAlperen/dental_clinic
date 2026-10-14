"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import {
    Calendar, Search, Eye, CheckCircle2, XCircle,
    Clock, ChevronLeft, ChevronRight, RefreshCw, AlertTriangle
} from "lucide-react";
import styles from "../../admin.module.css";

const ISTANBUL_TZ = "Europe/Istanbul";

const STATUS_CONFIG = {
    PENDING: { label: "Onay Bekliyor", style: "pending" },
    CONFIRMED: { label: "Onaylandı", style: "confirmed" },
    CANCELLED: { label: "İptal Edildi", style: "cancelled" },
    COMPLETED: { label: "Tamamlandı", style: "completed" },
    NO_SHOW: { label: "Gelmedi", style: "noshow" },
};

function formatDateTime(dateStr) {
    try {
        return new Intl.DateTimeFormat("tr-TR", {
            timeZone: ISTANBUL_TZ,
            day: "numeric",
            month: "long",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        }).format(new Date(dateStr));
    } catch {
        return dateStr;
    }
}

export default function DoctorAppointmentsPage() {
    const [appointments, setAppointments] = useState([]);
    const [pagination, setPagination] = useState({ total: 0, page: 1, totalPages: 1 });
    const [loading, setLoading] = useState(true);
    const [filters, setFilters] = useState({ status: "", search: "", page: 1 });
    const [actionLoading, setActionLoading] = useState(null);
    const [actionError, setActionError] = useState("");

    const fetchAppointments = useCallback(async () => {
        setLoading(true);
        setActionError("");
        try {
            const params = new URLSearchParams();
            if (filters.status) params.set("status", filters.status);
            if (filters.search) params.set("search", filters.search);
            params.set("page", filters.page);
            params.set("pageSize", "15");

            const res = await fetch(`/api/admin/appointments?${params}`);
            const data = await res.json();
            if (data.success) {
                setAppointments(data.appointments);
                setPagination(data.pagination);
            }
        } catch (err) {
            console.error("Randevular yüklenemedi:", err);
        } finally {
            setLoading(false);
        }
    }, [filters]);

    useEffect(() => { fetchAppointments(); }, [fetchAppointments]);

    async function updateStatus(id, newStatus) {
        setActionLoading(id);
        setActionError("");
        try {
            const res = await fetch(`/api/admin/appointments/${id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ status: newStatus }),
            });
            const data = await res.json();
            if (data.success) {
                setAppointments((prev) =>
                    prev.map((a) => (a.id === id ? { ...a, status: newStatus } : a))
                );
            } else {
                setActionError(data.error || "İşlem başarısız.");
            }
        } finally {
            setActionLoading(null);
        }
    }

    function handleFilterChange(key, value) {
        setFilters((prev) => ({ ...prev, [key]: value, page: 1 }));
    }

    return (
        <div>
            <div className={styles.adminPageHeader}>
                <div>
                    <h2 className={styles.adminPageTitle}>Randevularım</h2>
                    <p className={styles.adminPageSubtitle}>Toplam {pagination.total} randevu</p>
                </div>
                <button onClick={fetchAppointments} className={`${styles.adminBtn} ${styles.adminBtnSecondary}`}>
                    <RefreshCw size={15} /> Yenile
                </button>
            </div>

            {actionError && (
                <div className={`${styles.adminAlert} ${styles.adminAlertError}`} style={{ marginBottom: 16 }}>
                    <AlertTriangle size={16} /> {actionError}
                </div>
            )}

            <div className={styles.adminCard} style={{ marginBottom: 20 }}>
                <div className={styles.filterBar}>
                    <div style={{ position: "relative", flex: 1 }}>
                        <Search size={15} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "#94a3b8" }} />
                        <input
                            type="text"
                            className={styles.filterSearchInput}
                            style={{ paddingLeft: 36 }}
                            placeholder="Hasta adı veya telefon ara..."
                            value={filters.search}
                            onChange={(e) => handleFilterChange("search", e.target.value)}
                        />
                    </div>
                    <select
                        className={styles.filterSelect}
                        value={filters.status}
                        onChange={(e) => handleFilterChange("status", e.target.value)}
                    >
                        <option value="">Tüm Durumlar</option>
                        {Object.entries(STATUS_CONFIG).map(([key, { label }]) => (
                            <option key={key} value={key}>{label}</option>
                        ))}
                    </select>
                </div>
            </div>

            <div className={styles.adminCard}>
                {loading ? (
                    <div className={styles.loadingState}>
                        <div className={styles.loadingSpinner} />
                        <span>Yükleniyor...</span>
                    </div>
                ) : appointments.length === 0 ? (
                    <div className={styles.emptyState}>
                        <Calendar size={48} className={styles.emptyStateIcon} />
                        <p className={styles.emptyStateTitle}>Randevu bulunamadı</p>
                        <p className={styles.emptyStateDesc}>Filtre kriterlerinizi değiştirin.</p>
                    </div>
                ) : (
                    <div style={{ overflowX: "auto" }}>
                        <table className={styles.adminTable}>
                            <thead>
                                <tr>
                                    <th>Hasta</th>
                                    <th>Tarih &amp; Saat</th>
                                    <th>Hizmetler</th>
                                    <th>Durum</th>
                                    <th>İşlemler</th>
                                </tr>
                            </thead>
                            <tbody>
                                {appointments.map((apt) => {
                                    const cfg = STATUS_CONFIG[apt.status] || STATUS_CONFIG.PENDING;
                                    const services = apt.services?.map((s) => s.service.name).join(", ") || "—";
                                    const isLoading = actionLoading === apt.id;

                                    return (
                                        <tr key={apt.id}>
                                            <td>
                                                <div>
                                                    <p style={{ fontWeight: 600, margin: 0 }}>
                                                        {apt.patient?.firstName} {apt.patient?.lastName}
                                                    </p>
                                                    <p style={{ fontSize: 12, color: "#94a3b8", margin: 0 }}>
                                                        {apt.patient?.phone}
                                                    </p>
                                                </div>
                                            </td>
                                            <td style={{ fontSize: 13, whiteSpace: "nowrap" }}>
                                                {formatDateTime(apt.startAt)}
                                            </td>
                                            <td style={{ fontSize: 12, color: "#64748b", maxWidth: 180, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                                                {services}
                                            </td>
                                            <td>
                                                <span className={`${styles.statusBadge} ${styles[cfg.style]}`}>
                                                    {cfg.label}
                                                </span>
                                            </td>
                                            <td>
                                                <div style={{ display: "flex", gap: 6 }}>
                                                    <Link
                                                        href={`/admin/randevular/${apt.id}`}
                                                        className={`${styles.adminBtn} ${styles.adminBtnGhost} ${styles.adminBtnSm}`}
                                                    >
                                                        <Eye size={14} />
                                                    </Link>

                                                    {apt.status === "PENDING" && (
                                                        <button
                                                            className={`${styles.adminBtn} ${styles.adminBtnSm}`}
                                                            style={{ background: "#f0fdf4", color: "#15803d", border: "1px solid #bbf7d0" }}
                                                            onClick={() => updateStatus(apt.id, "CONFIRMED")}
                                                            disabled={isLoading}
                                                            title="Onayla"
                                                        >
                                                            <CheckCircle2 size={14} />
                                                        </button>
                                                    )}

                                                    {apt.status === "CONFIRMED" && (
                                                        <button
                                                            className={`${styles.adminBtn} ${styles.adminBtnSm}`}
                                                            style={{ background: "#eff6ff", color: "#1d4ed8", border: "1px solid #bfdbfe" }}
                                                            onClick={() => updateStatus(apt.id, "COMPLETED")}
                                                            disabled={isLoading}
                                                            title="Tamamlandı"
                                                        >
                                                            <Clock size={14} />
                                                        </button>
                                                    )}

                                                    {["PENDING", "CONFIRMED"].includes(apt.status) && (
                                                        <button
                                                            className={`${styles.adminBtn} ${styles.adminBtnSm}`}
                                                            style={{ background: "#fff1f2", color: "#be123c", border: "1px solid #fecdd3" }}
                                                            onClick={() => updateStatus(apt.id, "CANCELLED")}
                                                            disabled={isLoading}
                                                            title="İptal Et"
                                                        >
                                                            <XCircle size={14} />
                                                        </button>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}

                {!loading && pagination.totalPages > 1 && (
                    <div className={styles.adminPagination}>
                        <span>{pagination.page} / {pagination.totalPages} sayfa · {pagination.total} kayıt</span>
                        <div className={styles.paginationBtns}>
                            <button
                                className={`${styles.adminBtn} ${styles.adminBtnSecondary} ${styles.adminBtnSm}`}
                                onClick={() => setFilters((p) => ({ ...p, page: p.page - 1 }))}
                                disabled={pagination.page <= 1}
                            >
                                <ChevronLeft size={14} />
                            </button>
                            <button
                                className={`${styles.adminBtn} ${styles.adminBtnSecondary} ${styles.adminBtnSm}`}
                                onClick={() => setFilters((p) => ({ ...p, page: p.page + 1 }))}
                                disabled={pagination.page >= pagination.totalPages}
                            >
                                <ChevronRight size={14} />
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
