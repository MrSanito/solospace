"use client"

import { useEffect } from "react";
import { useAuth } from "@/components/auth/AuthContext";
import Sidebar from "@/components/layout/Sidebar";
import Navbar from "@/components/layout/Navbar";
import { usePathname, useRouter } from "next/navigation";
import { PageId } from "@/components/layout/Sidebar";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const pathname = usePathname();
  const router = useRouter();

  // If not loading and no user, don't show anything (AuthContext will redirect)
  if (!loading && !user) return null;

  // Redirect SALES_REP from dashboard overview to chat oversight
  useEffect(() => {
    if (!loading && user?.role === "SALES_REP" && pathname === "/dashboard") {
      router.push("/dashboard/chat");
    }
  }, [user, loading, pathname, router]);

  // Sync the Sidebar active state with the current URL
  const getCurrentPage = (): PageId => {
    if (pathname === "/dashboard") return "overview";
    if (pathname === "/dashboard/chat") return "chat";
    if (pathname === "/dashboard/drive") return "drive";
    if (pathname === "/dashboard/auditlog") return "auditlog";
    if (pathname === "/dashboard/alerts") return "alerts";
    if (pathname === "/dashboard/automations") return "automations";
    if (pathname === "/dashboard/integrations") return "integrations";
    if (pathname === "/dashboard/storage") return "storage";
    if (pathname === "/dashboard/access") return "access";
    if (pathname === "/dashboard/session") return "session";
    if (pathname === "/dashboard/settings") return "settings";
    return "overview";
  };

  const handleNavigate = (page: PageId | string) => {
    if (page.startsWith("protocol-")) {
      const id = page.replace("protocol-", "");
      router.push(`/dashboard?sf=${id}`);
      return;
    }

    if (page === "overview") router.push("/dashboard");
    else router.push(`/dashboard/${page}`);
  };

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50 font-sans">
      {/* ── New Sidebar ── */}
      <Sidebar currentPage={getCurrentPage()} onNavigate={handleNavigate} />

      <div className="flex-1 flex flex-col overflow-hidden min-w-0">
        {/* ── New TopBar (Navbar) ── */}
        <Navbar />

        {/* ── Main Content Area ── */}
        <main className="flex-1 overflow-hidden relative">
          <div className="absolute inset-0 overflow-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
