"use client"
import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Search, 
  Bell, 
  ChevronDown, 
  LogOut, 
  LayoutDashboard, 
  MessageSquare, 
  FolderOpen, 
  ClipboardList, 
  ShieldCheck, 
  Settings,
  Menu,
  X,
  User as UserIcon
} from "lucide-react";
import { useAuth } from "@/components/auth/AuthContext";
import { usePathname, useRouter } from "next/navigation";
import Image from "next/image";

interface GlobalNavbarProps {
  isLead?: boolean;
  leadData?: any;
  activeTab?: string;
  onTabChange?: (tab: any) => void;
}

export default function GlobalNavbar({ isLead, leadData, activeTab, onTabChange }: GlobalNavbarProps) {
  const { user, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Determine user info
  const name = isLead ? leadData?.name : user?.name;
  const position = isLead ? "" : (user?.role?.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(' ') || "Employee");
  const initials = name ? name.split(" ").map((n: string) => n[0]).join("").substring(0, 2).toUpperCase() : "U";
  const avatarUrl = isLead ? null : user?.avatarUrl;

  const handleLogout = async () => {
    if (isLead) {
      localStorage.removeItem("lead_info");
      router.push("/login");
    } else {
      await logout();
    }
  };

  const allNavItems = isLead ? [
    { id: "overview", label: "Overview", icon: LayoutDashboard },
    { id: "messages", label: "Chat", icon: MessageSquare },
    { id: "documents", label: "Documents", icon: FolderOpen },
  ] : [
    { id: "overview", label: "Overview", href: "/dashboard" },
    { id: "chat", label: "Chat Oversight", href: "/dashboard/chat", permission: "CHAT_ACCESS" },
    { id: "drive", label: "Drive", href: "/dashboard/drive", permission: "FILE_VIEW" },
    { id: "auditlog", label: "Audit Log", href: "/dashboard/auditlog", permission: "AUDIT_LOGS" },
    { id: "access", label: "Access Control", href: "/dashboard/access", permission: "ACCESS_CONTROL" },
    { id: "settings", label: "Settings", href: "/dashboard/settings", permission: "ACCESS_CONTROL" },
  ];

  const navItems = allNavItems.filter(item => {
    if (isLead) return true;
    if (user?.role === "CEO" || user?.role === "ORG_ADMIN") return true;
    if (!(item as any).permission) return true;
    
    const permission = (user as any)?.customRole?.permissions?.find(
      (p: any) => p.permission === (item as any).permission
    );
    return permission?.allowed === true;
  });

  const handleNavClick = (item: any) => {
    if (isLead) {
      onTabChange?.(item.id);
    } else {
      router.push(item.href);
    }
    setIsMobileMenuOpen(false);
  };

  const isActive = (item: any) => {
    if (isLead) return activeTab === item.id;
    return pathname === item.href;
  };

  return (
    <nav className="sticky top-0 z-[100] w-full bg-white/80 backdrop-blur-md border-b border-gray-200">
      <div className="max-w-[1600px] mx-auto px-4 md:px-8 h-16 flex items-center justify-between gap-4">
        
        {/* Logo & Brand */}
        <div 
          className="flex items-center gap-3 cursor-pointer shrink-0" 
          onClick={() => router.push(isLead ? `/${leadData?.id}/dashboard` : "/dashboard")}
        >
          <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-600/20">
            <span className="text-white font-black text-xl tracking-tighter">S</span>
          </div>
          <div className="hidden sm:block">
            <p className="text-sm font-black tracking-tight text-gray-900 leading-none">SOLO SPACE</p>
            <p className="text-[10px] font-bold text-blue-600 uppercase tracking-widest mt-1 leading-none">
              {isLead ? "" : "Management"}
            </p>
          </div>
        </div>

        {/* Desktop Navigation (Hidden on desktop to avoid redundancy with sidebar) */}
        <div className="hidden items-center gap-1 bg-gray-100/50 p-1 rounded-xl border border-gray-200/50">
          {/* Links removed to favor Sidebar navigation */}
        </div>

        {/* Search Bar (Employee Only) */}
        {!isLead && (
          <div className="hidden xl:flex items-center flex-1 max-w-md relative group">
            <Search size={14} className="absolute left-3 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
            <input 
              type="text" 
              placeholder="Search..."
              className="w-full bg-gray-100 border-none rounded-xl pl-10 pr-4 py-2 text-xs font-medium focus:ring-2 focus:ring-blue-500/10 transition-all"
            />
          </div>
        )}

        {/* User Profile & Actions */}
        <div className="flex items-center gap-2 md:gap-4 shrink-0">
          {/* Notifications */}
          <button className="relative p-2 text-gray-400 hover:text-gray-900 hover:bg-gray-100 rounded-xl transition-all">
            <Bell size={18} />
          </button>

          {/* Vertical Divider */}
          <div className="h-8 w-px bg-gray-200 mx-1 hidden sm:block"></div>

          {/* Profile Dropdown */}
          <div className="flex items-center gap-3 pl-1">
            <div className="hidden md:block text-right">
              <p className="text-xs font-bold text-gray-900 leading-none">{name || "Loading..."}</p>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mt-1 leading-none">{position}</p>
            </div>
            <div className="relative group">
              <div className="w-9 h-9 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 font-bold text-xs shadow-sm cursor-pointer overflow-hidden group-hover:border-blue-300 transition-all">
                {avatarUrl ? <img src={avatarUrl} alt="" className="w-full h-full object-cover" /> : initials}
              </div>
              
              {/* Simple Tooltip Dropdown on hover/click */}
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-2xl shadow-xl border border-gray-100 py-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all transform origin-top-right scale-95 group-hover:scale-100 z-[101]">
                <div className="px-4 py-2 border-b border-gray-50 mb-1 md:hidden">
                  <p className="text-xs font-bold text-gray-900">{name}</p>
                  <p className="text-[9px] text-gray-400 font-bold uppercase">{position}</p>
                </div>
                <button 
                  onClick={() => router.push(isLead ? `/${leadData?.id}/dashboard` : "/dashboard/settings")}
                  className="w-full flex items-center gap-3 px-4 py-2 text-xs font-bold text-gray-600 hover:bg-gray-50 hover:text-blue-600 transition-all"
                >
                  <UserIcon size={14} /> Profile Settings
                </button>
                <button 
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-4 py-2 text-xs font-bold text-red-500 hover:bg-red-50/50 transition-all"
                >
                  <LogOut size={14} /> Sign Out
                </button>
              </div>
            </div>
          </div>

          {/* Mobile Menu Toggle */}
          <button 
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="lg:hidden p-2 text-gray-600 hover:bg-gray-100 rounded-xl transition-all"
          >
            {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile Navigation Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="lg:hidden bg-white border-t border-gray-100 overflow-hidden"
          >
            <div className="p-4 space-y-2">
              {navItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all ${
                    isActive(item)
                      ? "bg-blue-600 text-white shadow-lg shadow-blue-600/20"
                      : "text-gray-500 hover:bg-gray-50 hover:text-gray-900"
                  }`}
                >
                  {item.label}
                </button>
              ))}
              {!isLead && (
                <div className="pt-2">
                  <div className="relative">
                    <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input 
                      type="text" 
                      placeholder="Search..."
                      className="w-full bg-gray-100 border-none rounded-xl pl-10 pr-4 py-2.5 text-xs font-medium"
                    />
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
