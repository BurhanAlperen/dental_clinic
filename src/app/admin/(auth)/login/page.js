"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Activity, Mail, Lock, Eye, EyeOff, AlertCircle } from "lucide-react";

export default function AdminLoginPage() {
    const router = useRouter();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    async function handleSubmit(event) {
        event.preventDefault();
        setError("");
        setLoading(true);

        try {
            const result = await signIn("credentials", {
                email,
                password,
                redirect: false,
            });

            if (result?.error) {
                setError("E-posta veya parola hatalı. Lütfen kontrol edin.");
                return;
            }

            // Rol bazlı yönlendirme (session'dan okuyamayız, callback üzerinden yönleniyoruz)
            // Next.js refresh ile session'ı güncelleyip middleware yönlendirecek
            router.push("/admin");
            router.refresh();
        } catch {
            setError("Giriş sırasında bir hata oluştu. Lütfen tekrar dene.");
        } finally {
            setLoading(false);
        }
    }

    return (
        <main
            style={{
                minHeight: "100vh",
                background: "linear-gradient(135deg, #0a1628 0%, #1a2d4a 50%, #0a1628 100%)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                padding: "24px 16px",
                fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
            }}
        >
            {/* Background decoration */}
            <div
                aria-hidden="true"
                style={{
                    position: "fixed",
                    inset: 0,
                    backgroundImage:
                        "radial-gradient(ellipse at 20% 50%, rgba(0, 180, 216, 0.08) 0%, transparent 60%), radial-gradient(ellipse at 80% 20%, rgba(72, 202, 228, 0.06) 0%, transparent 60%)",
                    pointerEvents: "none",
                }}
            />

            <div style={{ width: "100%", maxWidth: 420, position: "relative" }}>
                {/* Card */}
                <div
                    style={{
                        background: "#ffffff",
                        borderRadius: 24,
                        boxShadow: "0 25px 50px rgba(0,0,0,0.3), 0 0 0 1px rgba(255,255,255,0.05)",
                        overflow: "hidden",
                    }}
                >
                    {/* Card Header */}
                    <div
                        style={{
                            background: "linear-gradient(135deg, #0a1628, #1a2d4a)",
                            padding: "32px 32px 28px",
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "center",
                            gap: 16,
                        }}
                    >
                        <div
                            style={{
                                width: 56,
                                height: 56,
                                background: "linear-gradient(135deg, #00b4d8, #0096b7)",
                                borderRadius: 16,
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                boxShadow: "0 8px 24px rgba(0, 180, 216, 0.35)",
                            }}
                        >
                            <Activity size={26} color="#fff" />
                        </div>
                        <div style={{ textAlign: "center" }}>
                            <h1
                                style={{
                                    fontSize: 20,
                                    fontWeight: 800,
                                    color: "#fff",
                                    margin: 0,
                                    letterSpacing: "-0.01em",
                                }}
                            >
                                Turhal Diş Kliniği
                            </h1>
                            <p
                                style={{
                                    fontSize: 13,
                                    color: "rgba(255,255,255,0.5)",
                                    marginTop: 4,
                                    letterSpacing: "0.06em",
                                    textTransform: "uppercase",
                                    fontWeight: 500,
                                }}
                            >
                                Yönetim Paneli
                            </p>
                        </div>
                    </div>

                    {/* Form */}
                    <div style={{ padding: "28px 32px 32px" }}>
                        <p style={{ fontSize: 14, color: "#64748b", marginBottom: 24, textAlign: "center" }}>
                            Hesabınıza giriş yapın
                        </p>

                        {error && (
                            <div
                                role="alert"
                                style={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: 8,
                                    padding: "11px 14px",
                                    background: "#fff1f2",
                                    border: "1.5px solid #fecdd3",
                                    borderRadius: 10,
                                    marginBottom: 20,
                                    fontSize: 13,
                                    color: "#be123c",
                                    fontWeight: 500,
                                }}
                            >
                                <AlertCircle size={15} />
                                {error}
                            </div>
                        )}

                        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                            {/* Email */}
                            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                                <label
                                    htmlFor="email"
                                    style={{ fontSize: 13, fontWeight: 600, color: "#0f172a" }}
                                >
                                    E-posta adresi
                                </label>
                                <div style={{ position: "relative" }}>
                                    <span
                                        style={{
                                            position: "absolute",
                                            left: 12,
                                            top: "50%",
                                            transform: "translateY(-50%)",
                                            color: "#94a3b8",
                                        }}
                                    >
                                        <Mail size={16} />
                                    </span>
                                    <input
                                        id="email"
                                        type="email"
                                        autoComplete="username"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        required
                                        placeholder="ornek@klinik.com"
                                        style={{
                                            width: "100%",
                                            padding: "11px 14px 11px 38px",
                                            border: "1.5px solid #e2e8f0",
                                            borderRadius: 10,
                                            fontSize: 14,
                                            color: "#0f172a",
                                            outline: "none",
                                            transition: "border-color 0.15s",
                                            boxSizing: "border-box",
                                            fontFamily: "inherit",
                                        }}
                                        onFocus={(e) => (e.target.style.borderColor = "#00b4d8")}
                                        onBlur={(e) => (e.target.style.borderColor = "#e2e8f0")}
                                    />
                                </div>
                            </div>

                            {/* Password */}
                            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                                <label
                                    htmlFor="password"
                                    style={{ fontSize: 13, fontWeight: 600, color: "#0f172a" }}
                                >
                                    Parola
                                </label>
                                <div style={{ position: "relative" }}>
                                    <span
                                        style={{
                                            position: "absolute",
                                            left: 12,
                                            top: "50%",
                                            transform: "translateY(-50%)",
                                            color: "#94a3b8",
                                        }}
                                    >
                                        <Lock size={16} />
                                    </span>
                                    <input
                                        id="password"
                                        type={showPassword ? "text" : "password"}
                                        autoComplete="current-password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        required
                                        placeholder="Parolanı gir"
                                        style={{
                                            width: "100%",
                                            padding: "11px 42px 11px 38px",
                                            border: "1.5px solid #e2e8f0",
                                            borderRadius: 10,
                                            fontSize: 14,
                                            color: "#0f172a",
                                            outline: "none",
                                            transition: "border-color 0.15s",
                                            boxSizing: "border-box",
                                            fontFamily: "inherit",
                                        }}
                                        onFocus={(e) => (e.target.style.borderColor = "#00b4d8")}
                                        onBlur={(e) => (e.target.style.borderColor = "#e2e8f0")}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        style={{
                                            position: "absolute",
                                            right: 12,
                                            top: "50%",
                                            transform: "translateY(-50%)",
                                            background: "none",
                                            border: "none",
                                            cursor: "pointer",
                                            color: "#94a3b8",
                                            padding: 2,
                                        }}
                                        aria-label={showPassword ? "Parolayı gizle" : "Parolayı göster"}
                                    >
                                        {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                    </button>
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                style={{
                                    marginTop: 4,
                                    padding: "13px 20px",
                                    background: loading
                                        ? "#94a3b8"
                                        : "linear-gradient(135deg, #00b4d8, #0096b7)",
                                    color: "#fff",
                                    border: "none",
                                    borderRadius: 12,
                                    fontSize: 15,
                                    fontWeight: 700,
                                    cursor: loading ? "not-allowed" : "pointer",
                                    transition: "all 0.2s",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    gap: 8,
                                    fontFamily: "inherit",
                                    boxShadow: loading ? "none" : "0 4px 14px rgba(0, 180, 216, 0.35)",
                                }}
                            >
                                {loading ? (
                                    <>
                                        <span
                                            style={{
                                                width: 16,
                                                height: 16,
                                                border: "2px solid rgba(255,255,255,0.4)",
                                                borderTopColor: "#fff",
                                                borderRadius: "50%",
                                                animation: "loginSpin 0.7s linear infinite",
                                                display: "inline-block",
                                            }}
                                        />
                                        Giriş yapılıyor...
                                    </>
                                ) : (
                                    "Giriş Yap"
                                )}
                            </button>
                        </form>

                        <p style={{ marginTop: 20, textAlign: "center", fontSize: 12, color: "#94a3b8" }}>
                            Yalnızca yetkili personel erişebilir.
                        </p>
                    </div>
                </div>

                <p style={{ textAlign: "center", marginTop: 20, fontSize: 12, color: "rgba(255,255,255,0.3)" }}>
                    © 2025 Turhal Diş Kliniği · Tüm hakları saklıdır.
                </p>
            </div>

            <style>{`@keyframes loginSpin { to { transform: rotate(360deg); } }`}</style>
        </main>
    );
}