"use client";

import { useState, useEffect, useCallback } from "react";
import {
    Scissors, Plus, RefreshCw, Edit3, Save, X, Trash2,
    CheckCircle2, XCircle, AlertTriangle
} from "lucide-react";
import styles from "../admin.module.css";

export default function ServicesPage() {
    const [services, setServices] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showAddModal, setShowAddModal] = useState(false);
    const [addForm, setAddForm] = useState({ name: "", description: "" });
    const [addLoading, setAddLoading] = useState(false);
    const [addError, setAddError] = useState("");
    const [editId, setEditId] = useState(null);
    const [editForm, setEditForm] = useState({ name: "", description: "" });

    const fetchServices = useCallback(async () => {
        setLoading(true);
        const res = await fetch("/api/admin/services?includeInactive=true");
        const data = await res.json();
        if (data.success) setServices(data.services);
        setLoading(false);
    }, []);

    useEffect(() => { fetchServices(); }, [fetchServices]);

    async function handleAdd(e) {
        e.preventDefault();
        setAddError("");
        setAddLoading(true);
        try {
            const res = await fetch("/api/admin/services", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(addForm),
            });
            const data = await res.json();
            if (!data.success) {
                setAddError(data.error || "Hizmet eklenemedi.");
            } else {
                setShowAddModal(false);
                setAddForm({ name: "", description: "" });
                fetchServices();
            }
        } finally {
            setAddLoading(false);
        }
    }

    async function handleEdit(id) {
        const res = await fetch(`/api/admin/services/${id}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(editForm),
        });
        if (res.ok) {
            setEditId(null);
            fetchServices();
        }
    }

    async function toggleActive(id, isActive) {
        await fetch(`/api/admin/services/${id}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ isActive: !isActive }),
        });
        fetchServices();
    }

    return (
        <div>
            <div className={styles.adminPageHeader}>
                <div>
                    <h2 className={styles.adminPageTitle}>Hizmet Yönetimi</h2>
                    <p className={styles.adminPageSubtitle}>{services.length} hizmet tanımlı</p>
                </div>
                <div style={{ display: "flex", gap: 10 }}>
                    <button onClick={fetchServices} className={`${styles.adminBtn} ${styles.adminBtnSecondary}`}>
                        <RefreshCw size={15} /> Yenile
                    </button>
                    <button onClick={() => setShowAddModal(true)} className={`${styles.adminBtn} ${styles.adminBtnPrimary}`}>
                        <Plus size={15} /> Hizmet Ekle
                    </button>
                </div>
            </div>

            <div className={styles.adminCard}>
                {loading ? (
                    <div className={styles.loadingState}>
                        <div className={styles.loadingSpinner} />
                        <span>Yükleniyor...</span>
                    </div>
                ) : services.length === 0 ? (
                    <div className={styles.emptyState}>
                        <Scissors size={48} className={styles.emptyStateIcon} />
                        <p className={styles.emptyStateTitle}>Hizmet tanımlanmamış</p>
                    </div>
                ) : (
                    <div style={{ overflowX: "auto" }}>
                        <table className={styles.adminTable}>
                            <thead>
                                <tr>
                                    <th>Hizmet Adı</th>
                                    <th>Açıklama</th>
                                    <th>Kullanım</th>
                                    <th>Durum</th>
                                    <th>İşlemler</th>
                                </tr>
                            </thead>
                            <tbody>
                                {services.map((srv) => (
                                    <tr key={srv.id}>
                                        <td style={{ fontWeight: 600 }}>
                                            {editId === srv.id ? (
                                                <input
                                                    className={styles.adminInput}
                                                    value={editForm.name}
                                                    onChange={(e) => setEditForm((p) => ({ ...p, name: e.target.value }))}
                                                    style={{ maxWidth: 200 }}
                                                />
                                            ) : srv.name}
                                        </td>
                                        <td style={{ fontSize: 13, color: "#64748b", maxWidth: 240 }}>
                                            {editId === srv.id ? (
                                                <input
                                                    className={styles.adminInput}
                                                    value={editForm.description}
                                                    onChange={(e) => setEditForm((p) => ({ ...p, description: e.target.value }))}
                                                />
                                            ) : (srv.description || "—")}
                                        </td>
                                        <td style={{ fontSize: 13 }}>{srv._count.appointmentServices} randevu</td>
                                        <td>
                                            {srv.isActive ? (
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
                                                {editId === srv.id ? (
                                                    <>
                                                        <button className={`${styles.adminBtn} ${styles.adminBtnPrimary} ${styles.adminBtnSm}`} onClick={() => handleEdit(srv.id)}>
                                                            <Save size={13} />
                                                        </button>
                                                        <button className={`${styles.adminBtn} ${styles.adminBtnSecondary} ${styles.adminBtnSm}`} onClick={() => setEditId(null)}>
                                                            <X size={13} />
                                                        </button>
                                                    </>
                                                ) : (
                                                    <>
                                                        <button
                                                            className={`${styles.adminBtn} ${styles.adminBtnGhost} ${styles.adminBtnSm}`}
                                                            onClick={() => { setEditId(srv.id); setEditForm({ name: srv.name, description: srv.description || "" }); }}
                                                        >
                                                            <Edit3 size={13} />
                                                        </button>
                                                        <button
                                                            className={`${styles.adminBtn} ${styles.adminBtnSm}`}
                                                            style={{
                                                                background: srv.isActive ? "#fff1f2" : "#f0fdf4",
                                                                color: srv.isActive ? "#be123c" : "#15803d",
                                                                border: `1px solid ${srv.isActive ? "#fecdd3" : "#bbf7d0"}`,
                                                            }}
                                                            onClick={() => toggleActive(srv.id, srv.isActive)}
                                                        >
                                                            {srv.isActive ? "Pasife Al" : "Aktifleştir"}
                                                        </button>
                                                    </>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Add Modal */}
            {showAddModal && (
                <div className={styles.adminModalOverlay} onClick={() => setShowAddModal(false)}>
                    <div className={styles.adminModal} onClick={(e) => e.stopPropagation()}>
                        <div className={styles.adminModalHeader}>
                            <span className={styles.adminModalTitle}>Yeni Hizmet Ekle</span>
                            <button className={`${styles.adminBtn} ${styles.adminBtnGhost} ${styles.adminBtnIcon}`} onClick={() => setShowAddModal(false)}>
                                <XCircle size={18} />
                            </button>
                        </div>
                        <form onSubmit={handleAdd}>
                            <div className={styles.adminModalBody} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                                {addError && (
                                    <div className={`${styles.adminAlert} ${styles.adminAlertError}`}>
                                        <AlertTriangle size={16} /> {addError}
                                    </div>
                                )}
                                <div className={styles.adminFormGroup} style={{ marginBottom: 0 }}>
                                    <label className={styles.adminLabel}>Hizmet Adı *</label>
                                    <input
                                        className={styles.adminInput}
                                        required
                                        placeholder="İmplant Tedavisi"
                                        value={addForm.name}
                                        onChange={(e) => setAddForm((p) => ({ ...p, name: e.target.value }))}
                                    />
                                </div>
                                <div className={styles.adminFormGroup} style={{ marginBottom: 0 }}>
                                    <label className={styles.adminLabel}>Açıklama (opsiyonel)</label>
                                    <textarea
                                        className={styles.adminTextarea}
                                        placeholder="Kısa açıklama..."
                                        value={addForm.description}
                                        onChange={(e) => setAddForm((p) => ({ ...p, description: e.target.value }))}
                                        rows={3}
                                    />
                                </div>
                            </div>
                            <div className={styles.adminModalFooter}>
                                <button type="button" className={`${styles.adminBtn} ${styles.adminBtnSecondary}`} onClick={() => setShowAddModal(false)}>İptal</button>
                                <button type="submit" className={`${styles.adminBtn} ${styles.adminBtnPrimary}`} disabled={addLoading}>
                                    <Plus size={15} /> {addLoading ? "Ekleniyor..." : "Ekle"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
