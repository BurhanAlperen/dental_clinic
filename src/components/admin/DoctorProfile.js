"use client";

import { useState } from "react";
import {
    User, Mail, CalendarDays, Clock, Plus, Trash2,
    CheckCircle2, Edit3, Save, X, AlertTriangle
} from "lucide-react";
import styles from "../../app/admin/admin.module.css";

const ISTANBUL_TZ = "Europe/Istanbul";
const DAY_NAMES = ["Pazartesi", "Salı", "Çarşamba", "Perşembe", "Cuma", "Cumartesi", "Pazar"];

function minutesToTime(min) {
    return `${String(Math.floor(min / 60)).padStart(2, "0")}:${String(min % 60).padStart(2, "0")}`;
}

function timeToMinutes(time) {
    const [h, m] = time.split(":").map(Number);
    return h * 60 + m;
}

function formatDateTime(dateStr) {
    return new Intl.DateTimeFormat("tr-TR", {
        timeZone: ISTANBUL_TZ,
        day: "numeric",
        month: "long",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    }).format(new Date(dateStr));
}

export default function DoctorProfile({ doctor: initialDoctor }) {
    const [doctor, setDoctor] = useState(initialDoctor);
    const [editInfo, setEditInfo] = useState(false);
    const [infoForm, setInfoForm] = useState({
        name: doctor.user.name,
        email: doctor.user.email,
        title: doctor.title || "",
        specialtyTitle: doctor.specialtyTitle || "",
        specialty: doctor.specialty || "",
        bio: doctor.bio || "",
    });
    const [infoLoading, setInfoLoading] = useState(false);
    const [infoError, setInfoError] = useState("");
    const [infoSuccess, setInfoSuccess] = useState("");

    // Availability state
    const [availabilities, setAvailabilities] = useState(
        doctor.availabilities.map((a) => ({ ...a, _key: a.id }))
    );
    const [availLoading, setAvailLoading] = useState(false);

    // Blocked times state
    const [blockedTimes, setBlockedTimes] = useState(doctor.blockedTimes);
    const [showBlockedForm, setShowBlockedForm] = useState(false);
    const [blockedForm, setBlockedForm] = useState({ startAt: "", endAt: "", reason: "" });
    const [blockedLoading, setBlockedLoading] = useState(false);

    const initials = (doctor.user.name || "?").split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase();
    const fullName = [doctor.title, doctor.user.name].filter(Boolean).join(" ");

    async function saveInfo() {
        setInfoLoading(true);
        setInfoError("");
        try {
            const res = await fetch(`/api/admin/doctors/${doctor.id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(infoForm),
            });
            const data = await res.json();
            if (!data.success) {
                setInfoError(data.error || "Güncelleme başarısız.");
            } else {
                setDoctor((prev) => ({
                    ...prev,
                    ...data.doctor,
                    user: { ...prev.user, name: infoForm.name, email: infoForm.email },
                }));
                setEditInfo(false);
                setInfoSuccess("Profil güncellendi.");
                setTimeout(() => setInfoSuccess(""), 3000);
            }
        } finally {
            setInfoLoading(false);
        }
    }

    function addAvailability() {
        setAvailabilities((prev) => [
            ...prev,
            { _key: Date.now(), dayOfWeek: 1, startMinute: 540, endMinute: 1020, isActive: true },
        ]);
    }

    function removeAvailability(key) {
        setAvailabilities((prev) => prev.filter((a) => a._key !== key));
    }

    function updateAvailability(key, field, value) {
        setAvailabilities((prev) =>
            prev.map((a) => (a._key === key ? { ...a, [field]: value } : a))
        );
    }

    async function saveAvailabilities() {
        setAvailLoading(true);
        try {
            const res = await fetch(`/api/admin/doctors/${doctor.id}/availability`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ availabilities }),
            });
            if (res.ok) {
                setInfoSuccess("Çalışma saatleri kaydedildi.");
                setTimeout(() => setInfoSuccess(""), 3000);
            }
        } finally {
            setAvailLoading(false);
        }
    }

    async function deleteBlockedTime(id) {
        await fetch(`/api/admin/blocked-times/${id}`, { method: "DELETE" });
        setBlockedTimes((prev) => prev.filter((b) => b.id !== id));
    }

    async function addBlockedTime(e) {
        e.preventDefault();
        setBlockedLoading(true);
        try {
            const res = await fetch(`/api/admin/doctors/${doctor.id}/blocked-times`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    startAt: new Date(blockedForm.startAt).toISOString(),
                    endAt: new Date(blockedForm.endAt).toISOString(),
                    reason: blockedForm.reason,
                }),
            });
            const data = await res.json();
            if (data.success) {
                setBlockedTimes((prev) => [...prev, data.blockedTime]);
                setShowBlockedForm(false);
                setBlockedForm({ startAt: "", endAt: "", reason: "" });
            }
        } finally {
            setBlockedLoading(false);
        }
    }

    return (
        <div>
            {/* Success Banner */}
            {infoSuccess && (
                <div className={`${styles.adminAlert} ${styles.adminAlertSuccess}`} style={{ marginBottom: 16 }}>
                    <CheckCircle2 size={16} /> {infoSuccess}
                </div>
            )}

            <div style={{ display: "grid", gridTemplateColumns: "minmax(0,1fr) 340px", gap: 20, alignItems: "start" }}>
                {/* Left: Profile Info */}
                <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
                    <div className={styles.adminCard}>
                        <div className={styles.adminCardHeader}>
                            <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                                <div
                                    style={{
                                        width: 56,
                                        height: 56,
                                        borderRadius: "50%",
                                        background: "linear-gradient(135deg, #dbeafe, #bfdbfe)",
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        fontSize: 20,
                                        fontWeight: 800,
                                        color: "#1d4ed8",
                                        flexShrink: 0,
                                    }}
                                >
                                    {initials}
                                </div>
                                <div>
                                    <div className={styles.adminCardTitle}>{fullName}</div>
                                    <div className={styles.adminCardSubtitle}>{doctor.specialty || "Diş Hekimi"}</div>
                                </div>
                            </div>
                            {!editInfo ? (
                                <button className={`${styles.adminBtn} ${styles.adminBtnSecondary} ${styles.adminBtnSm}`} onClick={() => setEditInfo(true)}>
                                    <Edit3 size={14} /> Düzenle
                                </button>
                            ) : (
                                <div style={{ display: "flex", gap: 6 }}>
                                    <button className={`${styles.adminBtn} ${styles.adminBtnSecondary} ${styles.adminBtnSm}`} onClick={() => setEditInfo(false)}>
                                        <X size={14} /> İptal
                                    </button>
                                    <button className={`${styles.adminBtn} ${styles.adminBtnPrimary} ${styles.adminBtnSm}`} onClick={saveInfo} disabled={infoLoading}>
                                        <Save size={14} /> {infoLoading ? "Kaydediliyor..." : "Kaydet"}
                                    </button>
                                </div>
                            )}
                        </div>

                        <div style={{ padding: "20px 24px" }}>
                            {infoError && <div className={`${styles.adminAlert} ${styles.adminAlertError}`}><AlertTriangle size={16} /> {infoError}</div>}

                            {editInfo ? (
                                <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                                        <div className={styles.adminFormGroup} style={{ marginBottom: 0 }}>
                                            <label className={styles.adminLabel}>Ad Soyad</label>
                                            <input className={styles.adminInput} value={infoForm.name} onChange={(e) => setInfoForm((p) => ({ ...p, name: e.target.value }))} />
                                        </div>
                                        <div className={styles.adminFormGroup} style={{ marginBottom: 0 }}>
                                            <label className={styles.adminLabel}>E-posta</label>
                                            <input type="email" className={styles.adminInput} value={infoForm.email} onChange={(e) => setInfoForm((p) => ({ ...p, email: e.target.value }))} />
                                        </div>
                                    </div>
                                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                                        <div className={styles.adminFormGroup} style={{ marginBottom: 0 }}>
                                            <label className={styles.adminLabel}>Unvan</label>
                                            <input className={styles.adminInput} value={infoForm.title} onChange={(e) => setInfoForm((p) => ({ ...p, title: e.target.value }))} placeholder="Uzm. Dt." />
                                        </div>
                                        <div className={styles.adminFormGroup} style={{ marginBottom: 0 }}>
                                            <label className={styles.adminLabel}>Uzmanlık Başlığı</label>
                                            <input className={styles.adminInput} value={infoForm.specialtyTitle} onChange={(e) => setInfoForm((p) => ({ ...p, specialtyTitle: e.target.value }))} />
                                        </div>
                                    </div>
                                    <div className={styles.adminFormGroup} style={{ marginBottom: 0 }}>
                                        <label className={styles.adminLabel}>Uzmanlık Alanı</label>
                                        <input className={styles.adminInput} value={infoForm.specialty} onChange={(e) => setInfoForm((p) => ({ ...p, specialty: e.target.value }))} />
                                    </div>
                                    <div className={styles.adminFormGroup} style={{ marginBottom: 0 }}>
                                        <label className={styles.adminLabel}>Biyografi</label>
                                        <textarea className={styles.adminTextarea} value={infoForm.bio} onChange={(e) => setInfoForm((p) => ({ ...p, bio: e.target.value }))} rows={4} />
                                    </div>
                                </div>
                            ) : (
                                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                                    <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                                        <Mail size={14} color="#94a3b8" />
                                        <span style={{ fontSize: 14 }}>{doctor.user.email}</span>
                                    </div>
                                    <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                                        <CalendarDays size={14} color="#94a3b8" />
                                        <span style={{ fontSize: 14 }}>{doctor._count.appointments} randevu</span>
                                    </div>
                                    {doctor.bio && (
                                        <p style={{ fontSize: 13, color: "#64748b", marginTop: 8, lineHeight: 1.6 }}>{doctor.bio}</p>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Çalışma Saatleri */}
                    <div className={styles.adminCard}>
                        <div className={styles.adminCardHeader}>
                            <div>
                                <div className={styles.adminCardTitle}>Çalışma Saatleri</div>
                                <div className={styles.adminCardSubtitle}>Haftalık çalışma takvimi</div>
                            </div>
                            <div style={{ display: "flex", gap: 8 }}>
                                <button className={`${styles.adminBtn} ${styles.adminBtnSecondary} ${styles.adminBtnSm}`} onClick={addAvailability}>
                                    <Plus size={14} /> Ekle
                                </button>
                                <button className={`${styles.adminBtn} ${styles.adminBtnPrimary} ${styles.adminBtnSm}`} onClick={saveAvailabilities} disabled={availLoading}>
                                    <Save size={14} /> {availLoading ? "Kaydediliyor..." : "Kaydet"}
                                </button>
                            </div>
                        </div>

                        <div style={{ padding: "16px 24px", display: "flex", flexDirection: "column", gap: 10 }}>
                            {availabilities.length === 0 ? (
                                <p style={{ fontSize: 14, color: "#94a3b8", textAlign: "center", padding: "20px 0" }}>
                                    Çalışma saati tanımlanmamış.
                                </p>
                            ) : (
                                availabilities.map((a) => (
                                    <div key={a._key} style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 14px", background: "#f8fafc", borderRadius: 10, border: "1px solid #e2e8f0" }}>
                                        <select
                                            className={styles.filterSelect}
                                            style={{ minWidth: 110 }}
                                            value={a.dayOfWeek}
                                            onChange={(e) => updateAvailability(a._key, "dayOfWeek", parseInt(e.target.value))}
                                        >
                                            {DAY_NAMES.map((d, i) => (
                                                <option key={i} value={i + 1}>{d}</option>
                                            ))}
                                        </select>
                                        <Clock size={14} color="#94a3b8" />
                                        <input
                                            type="time"
                                            className={styles.filterSelect}
                                            style={{ width: 100 }}
                                            value={minutesToTime(a.startMinute)}
                                            onChange={(e) => updateAvailability(a._key, "startMinute", timeToMinutes(e.target.value))}
                                        />
                                        <span style={{ color: "#94a3b8", fontSize: 13 }}>–</span>
                                        <input
                                            type="time"
                                            className={styles.filterSelect}
                                            style={{ width: 100 }}
                                            value={minutesToTime(a.endMinute)}
                                            onChange={(e) => updateAvailability(a._key, "endMinute", timeToMinutes(e.target.value))}
                                        />
                                        <label style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13, marginLeft: "auto", cursor: "pointer" }}>
                                            <input
                                                type="checkbox"
                                                checked={a.isActive}
                                                onChange={(e) => updateAvailability(a._key, "isActive", e.target.checked)}
                                            />
                                            Aktif
                                        </label>
                                        <button
                                            className={`${styles.adminBtn} ${styles.adminBtnDanger} ${styles.adminBtnIcon} ${styles.adminBtnSm}`}
                                            onClick={() => removeAvailability(a._key)}
                                            type="button"
                                        >
                                            <Trash2 size={14} />
                                        </button>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>

                {/* Right: Blocked Times */}
                <div className={styles.adminCard}>
                    <div className={styles.adminCardHeader}>
                        <div>
                            <div className={styles.adminCardTitle}>İzinler &amp; Kapalı Zamanlar</div>
                            <div className={styles.adminCardSubtitle}>Yaklaşan bloklu dönemler</div>
                        </div>
                        <button
                            className={`${styles.adminBtn} ${styles.adminBtnSecondary} ${styles.adminBtnSm}`}
                            onClick={() => setShowBlockedForm(!showBlockedForm)}
                        >
                            <Plus size={14} /> Ekle
                        </button>
                    </div>

                    {showBlockedForm && (
                        <form onSubmit={addBlockedTime} style={{ padding: "16px 20px", borderBottom: "1px solid #f1f5f9", background: "#f8fafc", display: "flex", flexDirection: "column", gap: 10 }}>
                            <div className={styles.adminFormGroup} style={{ marginBottom: 0 }}>
                                <label className={styles.adminLabel}>Başlangıç</label>
                                <input type="datetime-local" className={styles.adminInput} required value={blockedForm.startAt} onChange={(e) => setBlockedForm((p) => ({ ...p, startAt: e.target.value }))} />
                            </div>
                            <div className={styles.adminFormGroup} style={{ marginBottom: 0 }}>
                                <label className={styles.adminLabel}>Bitiş</label>
                                <input type="datetime-local" className={styles.adminInput} required value={blockedForm.endAt} onChange={(e) => setBlockedForm((p) => ({ ...p, endAt: e.target.value }))} />
                            </div>
                            <div className={styles.adminFormGroup} style={{ marginBottom: 0 }}>
                                <label className={styles.adminLabel}>Neden (opsiyonel)</label>
                                <input className={styles.adminInput} placeholder="İzin, toplantı..." value={blockedForm.reason} onChange={(e) => setBlockedForm((p) => ({ ...p, reason: e.target.value }))} />
                            </div>
                            <button type="submit" className={`${styles.adminBtn} ${styles.adminBtnPrimary}`} disabled={blockedLoading} style={{ justifyContent: "center" }}>
                                {blockedLoading ? "Ekleniyor..." : "Ekle"}
                            </button>
                        </form>
                    )}

                    <div style={{ padding: "8px 0" }}>
                        {blockedTimes.length === 0 ? (
                            <div style={{ padding: "32px 20px", textAlign: "center", color: "#94a3b8", fontSize: 13 }}>
                                <CheckCircle2 size={32} style={{ margin: "0 auto 10px", color: "#bbf7d0" }} />
                                Kapalı zaman yok.
                            </div>
                        ) : (
                            blockedTimes.map((bt) => (
                                <div key={bt.id} style={{ padding: "12px 20px", borderBottom: "1px solid #f1f5f9", display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 10 }}>
                                    <div>
                                        <p style={{ margin: 0, fontSize: 13, fontWeight: 700, color: "#0f172a" }}>
                                            {formatDateTime(bt.startAt)}
                                        </p>
                                        <p style={{ margin: "2px 0 0", fontSize: 12, color: "#94a3b8" }}>
                                            → {formatDateTime(bt.endAt)}
                                        </p>
                                        {bt.reason && (
                                            <p style={{ margin: "4px 0 0", fontSize: 12, color: "#64748b" }}>{bt.reason}</p>
                                        )}
                                    </div>
                                    <button
                                        className={`${styles.adminBtn} ${styles.adminBtnDanger} ${styles.adminBtnIcon} ${styles.adminBtnSm}`}
                                        onClick={() => deleteBlockedTime(bt.id)}
                                    >
                                        <Trash2 size={14} />
                                    </button>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
