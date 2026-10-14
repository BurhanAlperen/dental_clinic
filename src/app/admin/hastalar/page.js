"use client";

import { useState, useEffect, useCallback } from "react";
import {
    Users, Search, Phone, Mail, ChevronLeft, ChevronRight, RefreshCw
} from "lucide-react";
import styles from "../admin.module.css";

export default function PatientsPage() {
    const [patients, setPatients] = useState([]);
    const [pagination, setPagination] = useState({ total: 0, page: 1, totalPages: 1 });
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [page, setPage] = useState(1);

    const fetchPatients = useCallback(async () => {
        setLoading(true);
        const params = new URLSearchParams({ page, pageSize: 20 });
        if (search) params.set("search", search);
        const res = await fetch(`/api/admin/patients?${params}`);
        const data = await res.json();
        if (data.success) {
            setPatients(data.patients);
            setPagination(data.pagination);
        }
        setLoading(false);
    }, [search, page]);

    useEffect(() => { fetchPatients(); }, [fetchPatients]);

    // Debounce search
    useEffect(() => { setPage(1); }, [search]);

    const GENDER_LABELS = { FEMALE: "Kadın", MALE: "Erkek", UNSPECIFIED: "—" };

    return (
        <div>
            <div className={styles.adminPageHeader}>
                <div>
                    <h2 className={styles.adminPageTitle}>Hasta Yönetimi</h2>
                    <p className={styles.adminPageSubtitle}>Toplam {pagination.total} hasta kaydı</p>
                </div>
                <button onClick={fetchPatients} className={`${styles.adminBtn} ${styles.adminBtnSecondary}`}>
                    <RefreshCw size={15} /> Yenile
                </button>
            </div>

            <div className={styles.adminCard} style={{ marginBottom: 20 }}>
                <div className={styles.filterBar}>
                    <div style={{ position: "relative", flex: 1 }}>
                        <Search size={15} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "#94a3b8" }} />
                        <input
                            type="text"
                            className={styles.filterSearchInput}
                            style={{ paddingLeft: 36 }}
                            placeholder="Ad, soyad, telefon veya TC ara..."
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
                ) : patients.length === 0 ? (
                    <div className={styles.emptyState}>
                        <Users size={48} className={styles.emptyStateIcon} />
                        <p className={styles.emptyStateTitle}>Hasta bulunamadı</p>
                    </div>
                ) : (
                    <div style={{ overflowX: "auto" }}>
                        <table className={styles.adminTable}>
                            <thead>
                                <tr>
                                    <th>Hasta</th>
                                    <th>Telefon</th>
                                    <th>E-posta</th>
                                    <th>Cinsiyet</th>
                                    <th>Randevu Sayısı</th>
                                </tr>
                            </thead>
                            <tbody>
                                {patients.map((p) => {
                                    const initials = [p.firstName[0], p.lastName?.[0]].filter(Boolean).join("").toUpperCase();
                                    return (
                                        <tr key={p.id}>
                                            <td>
                                                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                                                    <div
                                                        style={{
                                                            width: 34,
                                                            height: 34,
                                                            borderRadius: "50%",
                                                            background: "linear-gradient(135deg, #fef3c7, #fde68a)",
                                                            display: "flex",
                                                            alignItems: "center",
                                                            justifyContent: "center",
                                                            fontSize: 12,
                                                            fontWeight: 700,
                                                            color: "#b45309",
                                                            flexShrink: 0,
                                                        }}
                                                    >
                                                        {initials}
                                                    </div>
                                                    <div>
                                                        <p style={{ fontWeight: 600, margin: 0, fontSize: 14 }}>
                                                            {p.firstName} {p.lastName}
                                                        </p>
                                                        {p.nationalId && (
                                                            <p style={{ fontSize: 11, color: "#94a3b8", margin: 0 }}>
                                                                TC: {p.nationalId.slice(0, 3)}*****{p.nationalId.slice(-3)}
                                                            </p>
                                                        )}
                                                    </div>
                                                </div>
                                            </td>
                                            <td>
                                                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                                                    <Phone size={13} color="#94a3b8" />
                                                    <span style={{ fontSize: 13 }}>{p.phone}</span>
                                                </div>
                                            </td>
                                            <td>
                                                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                                                    <Mail size={13} color="#94a3b8" />
                                                    <span style={{ fontSize: 13 }}>{p.email || "—"}</span>
                                                </div>
                                            </td>
                                            <td style={{ fontSize: 13, color: "#64748b" }}>{GENDER_LABELS[p.gender]}</td>
                                            <td style={{ fontSize: 13, fontWeight: 600 }}>{p._count.appointments}</td>
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
                            <button className={`${styles.adminBtn} ${styles.adminBtnSecondary} ${styles.adminBtnSm}`} onClick={() => setPage((p) => p - 1)} disabled={page <= 1}>
                                <ChevronLeft size={14} />
                            </button>
                            <button className={`${styles.adminBtn} ${styles.adminBtnSecondary} ${styles.adminBtnSm}`} onClick={() => setPage((p) => p + 1)} disabled={page >= pagination.totalPages}>
                                <ChevronRight size={14} />
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
