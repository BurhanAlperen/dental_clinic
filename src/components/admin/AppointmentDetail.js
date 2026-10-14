"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
    User,
    Phone,
    Mail,
    Calendar,
    Clock,
    Stethoscope,
    FileText,
    CheckCircle2,
    XCircle,
    Edit3,
    Save,
    X,
    AlertTriangle,
    Clipboard,
} from "lucide-react";
import styles from "../../app/admin/admin.module.css";

const ISTANBUL_TZ = "Europe/Istanbul";

const STATUS_CONFIG = {
    PENDING: { label: "Onay Bekliyor", style: "pending" },
    CONFIRMED: { label: "Onaylandı", style: "confirmed" },
    CANCELLED: { label: "İptal Edildi", style: "cancelled" },
    COMPLETED: { label: "Tamamlandı", style: "completed" },
    NO_SHOW: { label: "Gelmedi", style: "noshow" },
};

const GENDER_LABELS = {
    FEMALE: "Kadın",
    MALE: "Erkek",
    UNSPECIFIED: "Belirtilmemiş",
};

function formatDateTime(dateStr) {
    try {
        return new Intl.DateTimeFormat("tr-TR", {
            timeZone: ISTANBUL_TZ,
            day: "numeric",
            month: "long",
            year: "numeric",
            weekday: "long",
            hour: "2-digit",
            minute: "2-digit",
        }).format(new Date(dateStr));
    } catch {
        return dateStr;
    }
}

function InfoRow({ icon: Icon, label, value }) {
    if (!value && value !== 0) return null;
    return (
        <div style={{ display: "flex", gap: 12, alignItems: "flex-start", paddingBottom: 14, borderBottom: "1px solid #f1f5f9" }}>
            <span style={{ flexShrink: 0, marginTop: 1 }}>
                <Icon size={16} color="#94a3b8" />
            </span>
            <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ margin: 0, fontSize: 11, fontWeight: 600, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.06em" }}>
                    {label}
                </p>
                <p style={{ margin: "3px 0 0", fontSize: 14, color: "#0f172a", fontWeight: 500 }}>
                    {value}
                </p>
            </div>
        </div>
    );
}

export default function AppointmentDetail({ appointment: initialApt, services, userRole }) {
    const router = useRouter();
    const [apt, setApt] = useState(initialApt);
    const [editMode, setEditMode] = useState(false);
    const [statusEdit, setStatusEdit] = useState(apt.status);
    const [notesEdit, setNotesEdit] = useState(apt.patientNotes || "");
    const [cancelReasonEdit, setCancelReasonEdit] = useState(apt.cancellationReason || "");
    const [selectedServices, setSelectedServices] = useState(
        apt.services.map((s) => String(s.service.id))
    );
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    const isSuperAdmin = userRole === "SUPER_ADMIN";
    const cfg = STATUS_CONFIG[apt.status] || STATUS_CONFIG.PENDING;
    const doctorName = [apt.doctor?.title, apt.doctor?.user?.name].filter(Boolean).join(" ");

    const allowedStatuses = isSuperAdmin
        ? Object.keys(STATUS_CONFIG)
        : ["CONFIRMED", "CANCELLED", "COMPLETED", "NO_SHOW"];

    async function handleSave() {
        setError("");
        setSuccess("");
        setLoading(true);
        try {
            const body = {
                status: statusEdit,
                patientNotes: notesEdit,
                cancellationReason: cancelReasonEdit,
            };
            if (isSuperAdmin) {
                body.serviceIds = selectedServices.map(Number);
            }

            const res = await fetch(`/api/admin/appointments/${apt.id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(body),
            });
            const data = await res.json();
            if (!data.success) {
                setError(data.error || "Güncelleme başarısız.");
            } else {
                setApt(data.appointment);
                setEditMode(false);
                setSuccess("Randevu güncellendi.");
                setTimeout(() => setSuccess(""), 3000);
            }
        } catch {
            setError("Sunucu hatası. Lütfen tekrar deneyin.");
        } finally {
            setLoading(false);
        }
    }

    function toggleService(sid) {
        setSelectedServices((prev) =>
            prev.includes(sid) ? prev.filter((s) => s !== sid) : [...prev, sid]
        );
    }

    return (
        <div style={{ display: "grid", gridTemplateColumns: "minmax(0,1fr) 360px", gap: 20, alignItems: "start" }}>
            {/* Left: Detail Card */}
            <div className={styles.adminCard}>
                <div className={styles.adminCardHeader}>
                    <div>
                        <div className={styles.adminCardTitle}>
                            Randevu #{apt.id}
                        </div>
                        <div className={styles.adminCardSubtitle}>
                            Oluşturulma: {formatDateTime(apt.createdAt)}
                        </div>
                    </div>
                    <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                        <span className={`${styles.statusBadge} ${styles[cfg.style]}`}>
                            {cfg.label}
                        </span>
                        {!editMode ? (
                            <button
                                className={`${styles.adminBtn} ${styles.adminBtnSecondary} ${styles.adminBtnSm}`}
                                onClick={() => setEditMode(true)}
                            >
                                <Edit3 size={14} /> Düzenle
                            </button>
                        ) : (
                            <div style={{ display: "flex", gap: 6 }}>
                                <button
                                    className={`${styles.adminBtn} ${styles.adminBtnSecondary} ${styles.adminBtnSm}`}
                                    onClick={() => { setEditMode(false); setError(""); }}
                                >
                                    <X size={14} /> İptal
                                </button>
                                <button
                                    className={`${styles.adminBtn} ${styles.adminBtnPrimary} ${styles.adminBtnSm}`}
                                    onClick={handleSave}
                                    disabled={loading}
                                >
                                    <Save size={14} /> {loading ? "Kaydediliyor..." : "Kaydet"}
                                </button>
                            </div>
                        )}
                    </div>
                </div>

                <div style={{ padding: "20px 24px" }}>
                    {error && (
                        <div className={`${styles.adminAlert} ${styles.adminAlertError}`}>
                            <AlertTriangle size={16} /> {error}
                        </div>
                    )}
                    {success && (
                        <div className={`${styles.adminAlert} ${styles.adminAlertSuccess}`}>
                            <CheckCircle2 size={16} /> {success}
                        </div>
                    )}

                    {/* Durum Değiştir */}
                    {editMode && (
                        <div className={styles.adminFormGroup}>
                            <label className={styles.adminLabel}>Randevu Durumu</label>
                            <select
                                className={styles.adminSelect}
                                value={statusEdit}
                                onChange={(e) => setStatusEdit(e.target.value)}
                            >
                                {allowedStatuses.map((s) => (
                                    <option key={s} value={s}>
                                        {STATUS_CONFIG[s].label}
                                    </option>
                                ))}
                            </select>
                        </div>
                    )}

                    {/* Tarih/Saat */}
                    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                        <InfoRow icon={Calendar} label="Randevu Tarihi" value={formatDateTime(apt.startAt)} />
                        <InfoRow icon={Clock} label="Bitiş Saati" value={formatDateTime(apt.endAt)} />
                        <InfoRow icon={Stethoscope} label="Doktor" value={doctorName} />

                        {/* Hizmetler */}
                        <div style={{ display: "flex", gap: 12, alignItems: "flex-start", paddingBottom: 14, borderBottom: "1px solid #f1f5f9" }}>
                            <span style={{ flexShrink: 0, marginTop: 1 }}>
                                <Clipboard size={16} color="#94a3b8" />
                            </span>
                            <div style={{ flex: 1 }}>
                                <p style={{ margin: 0, fontSize: 11, fontWeight: 600, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.06em" }}>
                                    Hizmetler
                                </p>
                                {editMode && isSuperAdmin ? (
                                    <div style={{ marginTop: 8, display: "flex", flexWrap: "wrap", gap: 8 }}>
                                        {services.map((srv) => {
                                            const isSelected = selectedServices.includes(String(srv.id));
                                            return (
                                                <button
                                                    key={srv.id}
                                                    type="button"
                                                    onClick={() => toggleService(String(srv.id))}
                                                    style={{
                                                        padding: "5px 12px",
                                                        borderRadius: 8,
                                                        fontSize: 12,
                                                        fontWeight: 600,
                                                        cursor: "pointer",
                                                        border: isSelected ? "1.5px solid #00b4d8" : "1.5px solid #e2e8f0",
                                                        background: isSelected ? "#e0f7fd" : "#fff",
                                                        color: isSelected ? "#0096b7" : "#64748b",
                                                        transition: "all 0.15s",
                                                    }}
                                                >
                                                    {srv.name}
                                                </button>
                                            );
                                        })}
                                    </div>
                                ) : (
                                    <div style={{ marginTop: 4, display: "flex", flexWrap: "wrap", gap: 6 }}>
                                        {apt.services.length === 0 ? (
                                            <span style={{ fontSize: 14, color: "#94a3b8" }}>—</span>
                                        ) : (
                                            apt.services.map((s) => (
                                                <span
                                                    key={s.service.id}
                                                    style={{
                                                        padding: "3px 10px",
                                                        borderRadius: 8,
                                                        fontSize: 12,
                                                        fontWeight: 600,
                                                        background: "#e0f7fd",
                                                        color: "#0096b7",
                                                        border: "1px solid #b3ecf9",
                                                    }}
                                                >
                                                    {s.service.name}
                                                </span>
                                            ))
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Notlar */}
                        <div style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
                            <span style={{ flexShrink: 0, marginTop: 1 }}>
                                <FileText size={16} color="#94a3b8" />
                            </span>
                            <div style={{ flex: 1 }}>
                                <p style={{ margin: 0, fontSize: 11, fontWeight: 600, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.06em" }}>
                                    Hasta Notu
                                </p>
                                {editMode ? (
                                    <textarea
                                        className={styles.adminTextarea}
                                        style={{ marginTop: 6 }}
                                        value={notesEdit}
                                        onChange={(e) => setNotesEdit(e.target.value)}
                                        rows={3}
                                        placeholder="Not ekle..."
                                    />
                                ) : (
                                    <p style={{ margin: "3px 0 0", fontSize: 14, color: "#0f172a" }}>
                                        {apt.patientNotes || "—"}
                                    </p>
                                )}
                            </div>
                        </div>

                        {/* İptal Nedeni */}
                        {(apt.status === "CANCELLED" || (editMode && statusEdit === "CANCELLED")) && (
                            <div style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
                                <span style={{ flexShrink: 0, marginTop: 1 }}>
                                    <XCircle size={16} color="#f87171" />
                                </span>
                                <div style={{ flex: 1 }}>
                                    <p style={{ margin: 0, fontSize: 11, fontWeight: 600, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.06em" }}>
                                        İptal Nedeni
                                    </p>
                                    {editMode ? (
                                        <input
                                            className={styles.adminInput}
                                            style={{ marginTop: 6 }}
                                            value={cancelReasonEdit}
                                            onChange={(e) => setCancelReasonEdit(e.target.value)}
                                            placeholder="İptal nedeni girin..."
                                        />
                                    ) : (
                                        <p style={{ margin: "3px 0 0", fontSize: 14, color: "#be123c" }}>
                                            {apt.cancellationReason || "Belirtilmemiş"}
                                        </p>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Right: Patient Info */}
            <div className={styles.adminCard}>
                <div className={styles.adminCardHeader}>
                    <div className={styles.adminCardTitle}>Hasta Bilgileri</div>
                </div>
                <div style={{ padding: "20px 24px", display: "flex", flexDirection: "column", gap: 14 }}>
                    <InfoRow
                        icon={User}
                        label="Ad Soyad"
                        value={`${apt.patient?.firstName} ${apt.patient?.lastName}`}
                    />
                    <InfoRow icon={Phone} label="Telefon" value={apt.patient?.phone} />
                    <InfoRow icon={Mail} label="E-posta" value={apt.patient?.email} />
                    <InfoRow
                        icon={User}
                        label="Cinsiyet"
                        value={GENDER_LABELS[apt.patient?.gender] || "—"}
                    />
                    {apt.patient?.nationalId && (
                        <InfoRow
                            icon={FileText}
                            label="T.C. Kimlik No"
                            value={`${apt.patient.nationalId.slice(0, 3)}*****${apt.patient.nationalId.slice(-3)}`}
                        />
                    )}
                    {apt.patient?.notes && (
                        <InfoRow icon={FileText} label="Genel Not" value={apt.patient.notes} />
                    )}
                </div>
            </div>
        </div>
    );
}
