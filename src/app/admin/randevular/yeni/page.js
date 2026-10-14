"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
    ArrowLeft,
    User,
    Stethoscope,
    Calendar,
    Clock,
    FileText,
    Phone,
    Mail,
    IdCard,
    AlertTriangle,
    CheckCircle2,
    Plus,
} from "lucide-react";
import styles from "../../admin.module.css";

const ISTANBUL_TZ = "Europe/Istanbul";
const GENDER_OPTIONS = [
    { value: "FEMALE", label: "Kadın" },
    { value: "MALE", label: "Erkek" },
    { value: "UNSPECIFIED", label: "Belirtmek İstemiyorum" },
];

function toLocalDatetimeValue(date) {
    // Input[datetime-local] için YYYY-MM-DDTHH:mm formatı
    const d = new Date(date);
    const pad = (n) => String(n).padStart(2, "0");
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function getDefaultStart() {
    const now = new Date();
    now.setMinutes(Math.ceil(now.getMinutes() / 30) * 30, 0, 0);
    now.setHours(now.getHours() + 1);
    return now;
}

export default function NewAppointmentPage() {
    const router = useRouter();
    const [doctors, setDoctors] = useState([]);
    const [services, setServices] = useState([]);
    const [patients, setPatients] = useState([]);
    const [patientSearch, setPatientSearch] = useState("");
    const [showPatientResults, setShowPatientResults] = useState(false);

    const defaultStart = getDefaultStart();
    const defaultEnd = new Date(defaultStart.getTime() + 30 * 60000);

    const [form, setForm] = useState({
        doctorId: "",
        startAt: toLocalDatetimeValue(defaultStart),
        endAt: toLocalDatetimeValue(defaultEnd),
        status: "PENDING",
        patientNotes: "",
        serviceIds: [],
        // Hasta seçimi
        patientId: "",
        // Ya da yeni hasta
        firstName: "",
        lastName: "",
        phone: "",
        email: "",
        gender: "UNSPECIFIED",
        nationalId: "",
    });

    const [useExistingPatient, setUseExistingPatient] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        Promise.all([
            fetch("/api/admin/doctors").then((r) => r.json()),
            fetch("/api/admin/services").then((r) => r.json()),
        ]).then(([d, s]) => {
            if (d.success) setDoctors(d.doctors);
            if (s.success) setServices(s.services);
        });
    }, []);

    useEffect(() => {
        if (!patientSearch || patientSearch.length < 2) {
            setPatients([]);
            return;
        }
        const timer = setTimeout(async () => {
            const res = await fetch(`/api/admin/patients?search=${encodeURIComponent(patientSearch)}&pageSize=10`);
            const data = await res.json();
            if (data.success) setPatients(data.patients);
        }, 300);
        return () => clearTimeout(timer);
    }, [patientSearch]);

    function setField(key, value) {
        setForm((prev) => ({ ...prev, [key]: value }));
    }

    function toggleService(sid) {
        setForm((prev) => ({
            ...prev,
            serviceIds: prev.serviceIds.includes(sid)
                ? prev.serviceIds.filter((s) => s !== sid)
                : [...prev.serviceIds, sid],
        }));
    }

    async function handleSubmit(e) {
        e.preventDefault();
        setError("");
        setLoading(true);

        try {
            const body = {
                doctorId: parseInt(form.doctorId),
                startAt: new Date(form.startAt).toISOString(),
                endAt: new Date(form.endAt).toISOString(),
                status: form.status,
                patientNotes: form.patientNotes,
                serviceIds: form.serviceIds,
            };

            if (useExistingPatient && form.patientId) {
                body.patientId = parseInt(form.patientId);
            } else {
                body.patient = {
                    firstName: form.firstName,
                    lastName: form.lastName,
                    phone: form.phone,
                    email: form.email,
                    gender: form.gender,
                    nationalId: form.nationalId || null,
                };
            }

            const res = await fetch("/api/admin/appointments", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(body),
            });
            const data = await res.json();

            if (!data.success) {
                setError(data.error || "Randevu oluşturulamadı.");
            } else {
                router.push(`/admin/randevular/${data.appointment.id}`);
            }
        } catch (err) {
            setError("Sunucu hatası. Lütfen tekrar deneyin.");
        } finally {
            setLoading(false);
        }
    }

    return (
        <div>
            <div style={{ marginBottom: 20 }}>
                <Link
                    href="/admin/randevular"
                    style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 13, color: "#64748b", textDecoration: "none", fontWeight: 500 }}
                >
                    <ArrowLeft size={16} /> Geri Dön
                </Link>
            </div>

            <div className={styles.adminPageHeader}>
                <div>
                    <h2 className={styles.adminPageTitle}>Yeni Randevu Oluştur</h2>
                    <p className={styles.adminPageSubtitle}>Hasta ve doktor seçerek randevu oluşturun</p>
                </div>
            </div>

            <form onSubmit={handleSubmit}>
                <div style={{ display: "grid", gridTemplateColumns: "minmax(0,1fr) 340px", gap: 20, alignItems: "start" }}>
                    {/* Left Column */}
                    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
                        {/* Doktor + Zaman */}
                        <div className={styles.adminCard}>
                            <div className={styles.adminCardHeader}>
                                <div className={styles.adminCardTitle}>Randevu Bilgileri</div>
                            </div>
                            <div style={{ padding: "20px 24px", display: "flex", flexDirection: "column", gap: 16 }}>
                                {error && (
                                    <div className={`${styles.adminAlert} ${styles.adminAlertError}`}>
                                        <AlertTriangle size={16} /> {error}
                                    </div>
                                )}

                                <div className={styles.adminFormGroup} style={{ marginBottom: 0 }}>
                                    <label className={styles.adminLabel}>
                                        <Stethoscope size={14} style={{ display: "inline", marginRight: 6 }} />
                                        Doktor *
                                    </label>
                                    <select
                                        className={styles.adminSelect}
                                        value={form.doctorId}
                                        onChange={(e) => setField("doctorId", e.target.value)}
                                        required
                                    >
                                        <option value="">Doktor seçin</option>
                                        {doctors.map((d) => (
                                            <option key={d.id} value={d.id}>
                                                {[d.title, d.user.name].filter(Boolean).join(" ")}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                                    <div className={styles.adminFormGroup} style={{ marginBottom: 0 }}>
                                        <label className={styles.adminLabel}>
                                            <Calendar size={14} style={{ display: "inline", marginRight: 6 }} />
                                            Başlangıç *
                                        </label>
                                        <input
                                            type="datetime-local"
                                            className={styles.adminInput}
                                            value={form.startAt}
                                            onChange={(e) => setField("startAt", e.target.value)}
                                            required
                                        />
                                    </div>
                                    <div className={styles.adminFormGroup} style={{ marginBottom: 0 }}>
                                        <label className={styles.adminLabel}>
                                            <Clock size={14} style={{ display: "inline", marginRight: 6 }} />
                                            Bitiş *
                                        </label>
                                        <input
                                            type="datetime-local"
                                            className={styles.adminInput}
                                            value={form.endAt}
                                            onChange={(e) => setField("endAt", e.target.value)}
                                            required
                                        />
                                    </div>
                                </div>

                                <div className={styles.adminFormGroup} style={{ marginBottom: 0 }}>
                                    <label className={styles.adminLabel}>Durum</label>
                                    <select
                                        className={styles.adminSelect}
                                        value={form.status}
                                        onChange={(e) => setField("status", e.target.value)}
                                    >
                                        <option value="PENDING">Onay Bekliyor</option>
                                        <option value="CONFIRMED">Onaylandı</option>
                                    </select>
                                </div>

                                <div className={styles.adminFormGroup} style={{ marginBottom: 0 }}>
                                    <label className={styles.adminLabel}>
                                        <FileText size={14} style={{ display: "inline", marginRight: 6 }} />
                                        Hasta Notu (opsiyonel)
                                    </label>
                                    <textarea
                                        className={styles.adminTextarea}
                                        value={form.patientNotes}
                                        onChange={(e) => setField("patientNotes", e.target.value)}
                                        placeholder="Şikayet, özel talep..."
                                        rows={3}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Hizmetler */}
                        <div className={styles.adminCard}>
                            <div className={styles.adminCardHeader}>
                                <div className={styles.adminCardTitle}>Hizmetler</div>
                            </div>
                            <div style={{ padding: "16px 24px", display: "flex", flexWrap: "wrap", gap: 8 }}>
                                {services.map((srv) => {
                                    const selected = form.serviceIds.includes(srv.id);
                                    return (
                                        <button
                                            key={srv.id}
                                            type="button"
                                            onClick={() => toggleService(srv.id)}
                                            style={{
                                                padding: "7px 14px",
                                                borderRadius: 9,
                                                fontSize: 13,
                                                fontWeight: 600,
                                                cursor: "pointer",
                                                border: selected ? "1.5px solid #00b4d8" : "1.5px solid #e2e8f0",
                                                background: selected ? "#e0f7fd" : "#f8fafc",
                                                color: selected ? "#0096b7" : "#475569",
                                                transition: "all 0.15s",
                                                fontFamily: "inherit",
                                            }}
                                        >
                                            {selected && <CheckCircle2 size={12} style={{ display: "inline", marginRight: 5 }} />}
                                            {srv.name}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    </div>

                    {/* Right: Hasta */}
                    <div className={styles.adminCard}>
                        <div className={styles.adminCardHeader}>
                            <div className={styles.adminCardTitle}>Hasta</div>
                            <div style={{ display: "flex", gap: 6 }}>
                                <button
                                    type="button"
                                    onClick={() => setUseExistingPatient(false)}
                                    style={{
                                        padding: "5px 12px",
                                        borderRadius: 8,
                                        fontSize: 12,
                                        fontWeight: 600,
                                        border: !useExistingPatient ? "1.5px solid #00b4d8" : "1.5px solid #e2e8f0",
                                        background: !useExistingPatient ? "#e0f7fd" : "#fff",
                                        color: !useExistingPatient ? "#0096b7" : "#64748b",
                                        cursor: "pointer",
                                        fontFamily: "inherit",
                                    }}
                                >
                                    Yeni Hasta
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setUseExistingPatient(true)}
                                    style={{
                                        padding: "5px 12px",
                                        borderRadius: 8,
                                        fontSize: 12,
                                        fontWeight: 600,
                                        border: useExistingPatient ? "1.5px solid #00b4d8" : "1.5px solid #e2e8f0",
                                        background: useExistingPatient ? "#e0f7fd" : "#fff",
                                        color: useExistingPatient ? "#0096b7" : "#64748b",
                                        cursor: "pointer",
                                        fontFamily: "inherit",
                                    }}
                                >
                                    Mevcut
                                </button>
                            </div>
                        </div>

                        <div style={{ padding: "16px 24px", display: "flex", flexDirection: "column", gap: 14 }}>
                            {useExistingPatient ? (
                                <div style={{ position: "relative" }}>
                                    <label className={styles.adminLabel} style={{ marginBottom: 6, display: "block" }}>Hasta Ara</label>
                                    <input
                                        className={styles.adminInput}
                                        placeholder="Ad, soyad veya telefon..."
                                        value={patientSearch}
                                        onChange={(e) => { setPatientSearch(e.target.value); setShowPatientResults(true); }}
                                        onFocus={() => setShowPatientResults(true)}
                                    />
                                    {showPatientResults && patients.length > 0 && (
                                        <div
                                            style={{
                                                position: "absolute",
                                                top: "100%",
                                                left: 0,
                                                right: 0,
                                                background: "#fff",
                                                border: "1.5px solid #e2e8f0",
                                                borderRadius: 10,
                                                boxShadow: "0 8px 24px rgba(0,0,0,0.1)",
                                                zIndex: 50,
                                                overflow: "hidden",
                                                marginTop: 4,
                                            }}
                                        >
                                            {patients.map((p) => (
                                                <button
                                                    key={p.id}
                                                    type="button"
                                                    onClick={() => {
                                                        setField("patientId", p.id);
                                                        setPatientSearch(`${p.firstName} ${p.lastName}`);
                                                        setShowPatientResults(false);
                                                    }}
                                                    style={{
                                                        display: "block",
                                                        width: "100%",
                                                        textAlign: "left",
                                                        padding: "10px 14px",
                                                        border: "none",
                                                        background: "none",
                                                        cursor: "pointer",
                                                        borderBottom: "1px solid #f1f5f9",
                                                        fontFamily: "inherit",
                                                    }}
                                                    onMouseEnter={(e) => (e.currentTarget.style.background = "#f8fafc")}
                                                    onMouseLeave={(e) => (e.currentTarget.style.background = "none")}
                                                >
                                                    <p style={{ margin: 0, fontSize: 14, fontWeight: 600 }}>
                                                        {p.firstName} {p.lastName}
                                                    </p>
                                                    <p style={{ margin: "1px 0 0", fontSize: 12, color: "#94a3b8" }}>
                                                        {p.phone}
                                                    </p>
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                    {form.patientId && (
                                        <p style={{ marginTop: 6, fontSize: 12, color: "#15803d", fontWeight: 600 }}>
                                            <CheckCircle2 size={12} style={{ display: "inline", marginRight: 4 }} />
                                            Hasta seçildi (ID: {form.patientId})
                                        </p>
                                    )}
                                </div>
                            ) : (
                                <>
                                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                                        <div className={styles.adminFormGroup} style={{ marginBottom: 0 }}>
                                            <label className={styles.adminLabel}>Ad *</label>
                                            <input className={styles.adminInput} required={!useExistingPatient} placeholder="İsim" value={form.firstName} onChange={(e) => setField("firstName", e.target.value)} />
                                        </div>
                                        <div className={styles.adminFormGroup} style={{ marginBottom: 0 }}>
                                            <label className={styles.adminLabel}>Soyad *</label>
                                            <input className={styles.adminInput} required={!useExistingPatient} placeholder="Soyisim" value={form.lastName} onChange={(e) => setField("lastName", e.target.value)} />
                                        </div>
                                    </div>
                                    <div className={styles.adminFormGroup} style={{ marginBottom: 0 }}>
                                        <label className={styles.adminLabel}>
                                            <Phone size={13} style={{ display: "inline", marginRight: 5 }} />
                                            Telefon *
                                        </label>
                                        <input className={styles.adminInput} required={!useExistingPatient} placeholder="05XX XXX XX XX" value={form.phone} onChange={(e) => setField("phone", e.target.value)} />
                                    </div>
                                    <div className={styles.adminFormGroup} style={{ marginBottom: 0 }}>
                                        <label className={styles.adminLabel}>
                                            <Mail size={13} style={{ display: "inline", marginRight: 5 }} />
                                            E-posta
                                        </label>
                                        <input type="email" className={styles.adminInput} placeholder="ornek@email.com" value={form.email} onChange={(e) => setField("email", e.target.value)} />
                                    </div>
                                    <div className={styles.adminFormGroup} style={{ marginBottom: 0 }}>
                                        <label className={styles.adminLabel}>
                                            <IdCard size={13} style={{ display: "inline", marginRight: 5 }} />
                                            T.C. Kimlik No
                                        </label>
                                        <input className={styles.adminInput} placeholder="11 haneli TC" maxLength={11} value={form.nationalId} onChange={(e) => setField("nationalId", e.target.value.replace(/\D/g, "").slice(0, 11))} />
                                    </div>
                                    <div className={styles.adminFormGroup} style={{ marginBottom: 0 }}>
                                        <label className={styles.adminLabel}>Cinsiyet *</label>
                                        <select className={styles.adminSelect} required value={form.gender} onChange={(e) => setField("gender", e.target.value)}>
                                            {GENDER_OPTIONS.map((o) => (
                                                <option key={o.value} value={o.value}>{o.label}</option>
                                            ))}
                                        </select>
                                    </div>
                                </>
                            )}
                        </div>

                        <div style={{ padding: "0 24px 24px" }}>
                            <button
                                type="submit"
                                className={`${styles.adminBtn} ${styles.adminBtnPrimary}`}
                                style={{ width: "100%", justifyContent: "center" }}
                                disabled={loading}
                            >
                                <Plus size={16} />
                                {loading ? "Oluşturuluyor..." : "Randevu Oluştur"}
                            </button>
                        </div>
                    </div>
                </div>
            </form>
        </div>
    );
}
