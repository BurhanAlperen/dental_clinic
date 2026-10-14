"use client";

import { useState, useEffect, createContext, useContext } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { signOut } from "next-auth/react";
import {
    LayoutDashboard,
    CalendarDays,
    Users,
    Stethoscope,
    Scissors,
    Menu,
    X,
    LogOut,
    ChevronRight,
    Activity,
    Plus,
    ShieldCheck,
} from "lucide-react";
import styles from "../../app/admin/admin.module.css";

// Super Admin nav
const superAdminNav = [
    {
        group: "Genel Bakış",
        items: [
            { href: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true },
        ],
    },
    {
        group: "Randevu Yönetimi",
        items: [
            { href: "/admin/randevular", label: "Tüm Randevular", icon: CalendarDays },
            { href: "/admin/randevular/yeni", label: "Yeni Randevu", icon: Plus },
        ],
    },
    {
        group: "Klinik Yönetimi",
        items: [
            { href: "/admin/doktorlar", label: "Doktorlar", icon: Stethoscope },
            { href: "/admin/hastalar", label: "Hastalar", icon: Users },
            { href: "/admin/hizmetler", label: "Hizmetler", icon: Scissors },
        ],
    },
];

// Doctor nav
const doctorNav = [
    {
        group: "Genel Bakış",
        items: [
            { href: "/admin/doktor", label: "Panelim", icon: LayoutDashboard, exact: true },
        ],
    },
    {
        group: "Randevularım",
        items: [
            { href: "/admin/doktor/randevular", label: "Randevularım", icon: CalendarDays },
        ],
    },
];

// Context for sharing sidebar toggle across layout
export const SidebarContext = createContext({ open: false, toggle: () => {} });

export function AdminLayoutShell({ children, user }) {
    const [sidebarOpen, setSidebarOpen] = useState(false);

    return (
        <SidebarContext.Provider value={{ open: sidebarOpen, toggle: () => setSidebarOpen((v) => !v) }}>
            <div className={styles.adminRoot}>
                <div className={styles.adminShell}>
                    <AdminSidebarInner
                        user={user}
                        open={sidebarOpen}
                        onClose={() => setSidebarOpen(false)}
                    />
                    <div className={styles.adminContent}>
                        {children}
                    </div>
                </div>
            </div>
        </SidebarContext.Provider>
    );
}

function AdminSidebarInner({ user, open, onClose }) {
    const pathname = usePathname();
    const router = useRouter();
    const isSuperAdmin = user?.role === "SUPER_ADMIN";
    const navGroups = isSuperAdmin ? superAdminNav : doctorNav;

    useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth >= 1024) onClose();
        };
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, [onClose]);

    // Close on route change (mobile)
    useEffect(() => {
        onClose();
    }, [pathname]);

    function isActive(href, exact = false) {
        if (exact) return pathname === href;
        return pathname.startsWith(href);
    }

    async function handleSignOut() {
        await signOut({ redirect: false });
        router.push("/admin/login");
        router.refresh();
    }

    const initials = (user?.name || "?")
        .split(" ")
        .map((w) => w[0])
        .join("")
        .slice(0, 2)
        .toUpperCase();

    return (
        <>
            {/* Overlay */}
            {open && (
                <div
                    className={`${styles.adminSidebarOverlay} ${styles.open}`}
                    onClick={onClose}
                    aria-hidden="true"
                />
            )}

            {/* Sidebar */}
            <aside
                className={styles.adminSidebar}
                style={{ transform: open ? "translateX(0)" : undefined }}
            >
                {/* Brand */}
                <div className={styles.sidebarBrand}>
                    <div className={styles.sidebarBrandTop}>
                        <div className={styles.sidebarLogo}>
                            <div className={styles.sidebarLogoIcon}>
                                <Activity size={18} color="#fff" />
                            </div>
                            <div className={styles.sidebarLogoText}>
                                <span className={styles.sidebarClinicName}>Turhal Diş</span>
                                <span className={styles.sidebarPanelLabel}>
                                    {isSuperAdmin ? "Yönetim Paneli" : "Doktor Paneli"}
                                </span>
                            </div>
                        </div>
                        <button
                            className={styles.sidebarCloseBtn}
                            onClick={onClose}
                            aria-label="Menüyü kapat"
                        >
                            <X size={18} />
                        </button>
                    </div>

                    {/* User Card */}
                    <div className={styles.sidebarUserCard}>
                        <div className={styles.sidebarUserAvatar}>{initials}</div>
                        <div className={styles.sidebarUserInfo}>
                            <div className={styles.sidebarUserName}>{user?.name || "Kullanıcı"}</div>
                            <div className={styles.sidebarUserRole}>
                                {isSuperAdmin ? (
                                    <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
                                        <ShieldCheck size={10} /> Super Admin
                                    </span>
                                ) : (
                                    <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
                                        <Stethoscope size={10} /> Doktor
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Nav */}
                <nav className={styles.sidebarNav} aria-label="Admin navigasyon">
                    {navGroups.map((group) => (
                        <div key={group.group} className={styles.sidebarNavGroup}>
                            <p className={styles.sidebarNavGroupLabel}>{group.group}</p>
                            {group.items.map((item) => {
                                const Icon = item.icon;
                                const active = isActive(item.href, item.exact);
                                return (
                                    <Link
                                        key={item.href}
                                        href={item.href}
                                        className={`${styles.sidebarNavItem} ${active ? styles.active : ""}`}
                                    >
                                        <Icon size={18} className={styles.navIcon} />
                                        <span>{item.label}</span>
                                        {active && (
                                            <ChevronRight
                                                size={14}
                                                style={{ marginLeft: "auto", opacity: 0.5 }}
                                            />
                                        )}
                                    </Link>
                                );
                            })}
                        </div>
                    ))}
                </nav>

                {/* Footer */}
                <div className={styles.sidebarFooter}>
                    <button
                        className={styles.sidebarNavItem}
                        onClick={handleSignOut}
                        style={{ width: "100%" }}
                    >
                        <LogOut size={18} style={{ color: "#f87171" }} />
                        <span style={{ color: "#f87171" }}>Çıkış Yap</span>
                    </button>
                </div>
            </aside>
        </>
    );
}

export default function AdminSidebar({ user }) {
    return null; // Kullanılmıyor — AdminLayoutShell kullan
}
