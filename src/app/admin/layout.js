import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { AdminLayoutShell } from "@/components/admin/AdminSidebar";
import AdminTopbar from "@/components/admin/AdminTopbar";
import styles from "./admin.module.css";

export default async function AdminLayout({ children }) {
    const session = await auth();

    if (!session?.user) {
        redirect("/admin/login");
    }

    return (
        <AdminLayoutShell user={session.user}>
            <AdminTopbar user={session.user} />
            <main className={styles.adminPageArea}>
                {children}
            </main>
        </AdminLayoutShell>
    );
}
