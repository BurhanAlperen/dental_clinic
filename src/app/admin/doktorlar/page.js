"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import {
    Stethoscope,
    Search,
    Plus,
    RefreshCw,
    User,
    CheckCircle2,
    XCircle,
    ChevronRight,
    CalendarDays,
} from "lucide-react";
import styles from "../admin.module.css";

export default function DoctorsPage() {
    const [doctors, setDoctors] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [showAddModal, setShowAddModal] = useState(false);
    const [addForm, setAddForm] = useState({
        name: "", email: "", password: "", title: "", specialtyTitle: "", specialty: "",
    });
    const [addLoading, setAddLoading] = useState(false);
    const [addError, setAddError] = useState("");

    const fetchDoctors = useCallback(async () => {
        setLoading(true);
        const res = await fetch("/api/admin/doctors?includeInactive=true");
        const data = await res.json();
        if (data.success) setDoctors(data.doctors);
        setLoading(false);
    }, []);

    useEffect(() => { fetchDoctors(); }, [fetchDoctors]);

    const filtered = doctors.filter((d) => {
        const name = [d.title, d.user.name].filter(Boolean).join(" ").toLowerCase();
        return name.includes(search.toLowerCase()) || d.user.email.includes(search.toLowerCase());
    });

    async function handleAddDoctor(e) {
        e.preventDefault();
        setAddError("");
        setAddLoading(true);
        try {
            const res = await fetch("/api/admin/doctors", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(addForm),
            });
            const data = await res.json();
            if (!data.success) {
                setAddError(data.error || "Doktor eklenemedi.");
            } else {
                setShowAddModal(false);
                setAddForm({ name: "", email: "", password: "", title: "", specialtyTitle: "", specialty: "" });
                fetchDoctors();
            }
        } finally {
            setAddLoading(false);
        }
    }

    async function toggleActive(doctorId, isActive) {
        await fetch(`/api/admin/doctors/${doctorId}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ isActive: !isActive }),
        });
        fetchDoctors();
    }

    return (
        <div>
            <div className={styles.adminPageHeader}>
                <div>
                    <h2 className={styles.adminPageTitle}>Doktor Yönetimi</h2>
                    <p className={styles.adminPageSubtitle}>{doctors.length} doktor kayıtlı</p>
                </div>
                <div style={{ display: "flex", gap: 10 }}>
                    <button onClick={fetchDoctors} className={`${styles.adminBtn} ${styles.adminBtnSecondary}`}>
                        <RefreshCw size={15} /> Yenile
                    </button>
                    <button
                        onClick={() => setShowAddModal(true)}
                        className={`${styles.adminBtn} ${styles.adminBtnPrimary}`}
                    >
                        <Plus size={15} /> Doktor Ekle
                    </button>
                </div>
            </div>

            <div className={styles.adminCard} style={{ marginBottom: 20 }}>
                <div className={styles.filterBar}>
                    <div style={{ position: "relative", flex: 1 }}>
                        <Search size={15} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "#94a3b8" }} />
                        <input
                            type="text"
                            className={styles.filterSearchInput}
                            style={{ paddingLeft: 36 }}
                            placeholder="İsim veya e-posta ara..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>
                </div>
            </div>

            <div className={styles.adminCard}>
                {loading ? (
                    <div className={styles.loadingState}>
                        <div className={styles.loadingSpinner} />
                        <span>Yükleniyor...</span>
                    </div>
                ) : filtered.length === 0 ? (
                    <div className={styles.emptyState}>
                        <Stethoscope size={48} className={styles.emptyStateIcon} />
                        <p className={styles.emptyStateTitle}>Doktor bulunamadı</p>
                    </div>
                ) : (
                    <div style={{ overflowX: "auto" }}>
                        <table className={styles.adminTable}>
                            <thead>
                                <tr>
                                    <th>Doktor</th>
                                    <th>Uzmanlık</th>
                                    <th>E-posta</th>
                                    <th>Randevular</th>
                                    <th>Durum</th>
                                    <th>İşlemler</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filtered.map((d) => {
                                    const fullName = [d.title, d.user.name].filter(Boolean).join(" ");
                                    const initials = (d.user.name || "?").split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase();
                                    return (
                                        <tr key={d.id}>
                                            <td>
                                                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                                                    <div className={styles.doctorAvatar}>{initials}</div>
                                                    <div>
                                                        <p style={{ fontWeight: 700, margin: 0, fontSize: 14 }}>{fullName}</p>
                                                        {d.specialtyTitle && (
                                                            <p style={{ fontSize: 12, color: "#94a3b8", margin: 0 }}>{d.specialtyTitle}</p>
                                                        )}
                                                    </div>
                                                </div>
                                            </td>
                                            <td style={{ fontSize: 13, color: "#64748b" }}>{d.specialty || "—"}</td>
                                            <td style={{ fontSize: 13, color: "#64748b" }}>{d.user.email}</td>
                                            <td>
                                                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                                                    <CalendarDays size={14} color="#94a3b8" />
                                                    <span style={{ fontSize: 13 }}>{d._count.appointments}</span>
                                                </div>
                                            </td>
                                            <td>
                                                {d.isActive ? (
                                                    <span className={`${styles.statusBadge} ${styles.confirmed}`}>
                                                        <CheckCircle2 size={11} /> Aktif
                                                    </span>
                                                ) : (
                                                    <span className={`${styles.statusBadge} ${styles.cancelled}`}>
                                                        <XCircle size={11} /> Pasif
                                                    </span>
                                                )}
                                            </td>
                                            <td>
                                                <div style={{ display: "flex", gap: 6 }}>
                                                    <Link
                                                        href={`/admin/doktorlar/${d.id}`}
                                                        className={`${styles.adminBtn} ${styles.adminBtnGhost} ${styles.adminBtnSm}`}
                                                    >
                                                        <ChevronRight size={14} /> Profil
                                                    </Link>
                                                    <button
                                                        className={`${styles.adminBtn} ${styles.adminBtnSm}`}
                                                        style={{
                                                            background: d.isActive ? "#fff1f2" : "#f0fdf4",
                                                            color: d.isActive ? "#be123c" : "#15803d",
                                                            border: `1px solid ${d.isActive ? "#fecdd3" : "#bbf7d0"}`,
                                                        }}
                                                        onClick={() => toggleActive(d.id, d.isActive)}
                                                    >
                                                        {d.isActive ? "Pasife Al" : "Aktifleştir"}
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Add Doctor Modal */}
            {showAddModal && (
                <div className={styles.adminModalOverlay} onClick={() => setShowAddModal(false)}>
                    <div className={styles.adminModal} onClick={(e) => e.stopPropagation()}>
                        <div className={styles.adminModalHeader}>
                            <span className={styles.adminModalTitle}>Yeni Doktor Ekle</span>
                            <button className={`${styles.adminBtn} ${styles.adminBtnGhost} ${styles.adminBtnIcon}`} onClick={() => setShowAddModal(false)}>
                                <XCircle size={18} />
                            </button>
                        </div>
                        <form onSubmit={handleAddDoctor}>
                            <div className={styles.adminModalBody} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                                {addError && (
                                    <div className={`${styles.adminAlert} ${styles.adminAlertError}`}>
                                        {addError}
                                    </div>
                                )}
                                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                                    <div className={styles.adminFormGroup} style={{ marginBottom: 0 }}>
                                        <label className={styles.adminLabel}>Ad Soyad *</label>
                                        <input className={styles.adminInput} required value={addForm.name} onChange={(e) => setAddForm((p) => ({ ...p, name: e.target.value }))} placeholder="Dr. Ad Soyad" />
                                    </div>
                                    <div className={styles.adminFormGroup} style={{ marginBottom: 0 }}>
                                        <label className={styles.adminLabel}>E-posta *</label>
                                        <input type="email" className={styles.adminInput} required value={addForm.email} onChange={(e) => setAddForm((p) => ({ ...p, email: e.target.value }))} placeholder="doktor@klinik.com" />
                                    </div>
                                </div>
                                <div className={styles.adminFormGroup} style={{ marginBottom: 0 }}>
                                    <label className={styles.adminLabel}>Parola *</label>
                                    <input type="password" className={styles.adminInput} required minLength={8} value={addForm.password} onChange={(e) => setAddForm((p) => ({ ...p, password: e.target.value }))} placeholder="En az 8 karakter" />
                                </div>
                                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                                    <div className={styles.adminFormGroup} style={{ marginBottom: 0 }}>
                                        <label className={styles.adminLabel}>Unvan</label>
                                        <input className={styles.adminInput} value={addForm.title} onChange={(e) => setAddForm((p) => ({ ...p, title: e.target.value }))} placeholder="Uzm. Dt." />
                                    </div>
                                    <div className={styles.adminFormGroup} style={{ marginBottom: 0 }}>
                                        <label className={styles.adminLabel}>Uzmanlık Başlığı</label>
                                        <input className={styles.adminInput} value={addForm.specialtyTitle} onChange={(e) => setAddForm((p) => ({ ...p, specialtyTitle: e.target.value }))} placeholder="Uzman Diş Hekimi" />
                                    </div>
                                </div>
                                <div className={styles.adminFormGroup} style={{ marginBottom: 0 }}>
                                    <label className={styles.adminLabel}>Uzmanlık Alanı</label>
                                    <input className={styles.adminInput} value={addForm.specialty} onChange={(e) => setAddForm((p) => ({ ...p, specialty: e.target.value }))} placeholder="İmplant, Ortodonti..." />
                                </div>
                            </div>
                            <div className={styles.adminModalFooter}>
                                <button type="button" className={`${styles.adminBtn} ${styles.adminBtnSecondary}`} onClick={() => setShowAddModal(false)}>
                                    İptal
                                </button>
                                <button type="submit" className={`${styles.adminBtn} ${styles.adminBtnPrimary}`} disabled={addLoading}>
                                    <Plus size={15} /> {addLoading ? "Ekleniyor..." : "Doktor Ekle"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
