"use client";

import { useContext } from "react";
import { usePathname } from "next/navigation";
import { Menu } from "lucide-react";
import { SidebarContext } from "@/components/admin/AdminSidebar";
import styles from "../../app/admin/admin.module.css";

function getPageTitle(pathname) {
    const routes = {
        "/admin": "Dashboard",
        "/admin/randevular": "Randevu Yönetimi",
        "/admin/randevular/yeni": "Yeni Randevu",
        "/admin/doktorlar": "Doktor Yönetimi",
        "/admin/hastalar": "Hasta Yönetimi",
        "/admin/hizmetler": "Hizmet Yönetimi",
        "/admin/doktor": "Doktor Panelim",
        "/admin/doktor/randevular": "Randevularım",
    };

    if (routes[pathname]) return routes[pathname];
    if (pathname.startsWith("/admin/randevular/")) return "Randevu Detayı";
    if (pathname.startsWith("/admin/doktorlar/")) return "Doktor Profili";
    if (pathname.startsWith("/admin/hastalar/")) return "Hasta Detayı";
    return "Yönetim Paneli";
}

export default function AdminTopbar({ user }) {
    const { toggle } = useContext(SidebarContext);
    const pathname = usePathname();
    const pageTitle = getPageTitle(pathname);

    const initials = (user?.name || "?")
        .split(" ")
        .map((w) => w[0])
        .join("")
        .slice(0, 2)
        .toUpperCase();

    return (
        <header className={styles.adminTopbar}>
            <div className={styles.topbarLeft}>
                <button
                    className={styles.menuToggleBtn}
                    onClick={toggle}
                    aria-label="Menüyü aç/kapat"
                    style={{ display: "flex" }}
                >
                    <Menu size={20} />
                </button>
                <h1 className={styles.topbarTitle}>{pageTitle}</h1>
            </div>

            <div className={styles.topbarRight}>
                <div className={styles.topbarUserBadge}>
                    <span
                        style={{
                            width: 28,
                            height: 28,
                            borderRadius: "50%",
                            background: "linear-gradient(135deg, #00b4d8, #0096b7)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontSize: 11,
                            fontWeight: 700,
                            color: "#fff",
                            flexShrink: 0,
                        }}
                    >
                        {initials}
                    </span>
                    <span style={{ fontSize: 13, fontWeight: 600 }}>{user?.name}</span>
                </div>
            </div>
        </header>
    );
}
