"use client"
import { motion } from "framer-motion";
import {
  ChevronRight,
  LogOut,
} from "lucide-react";
import SidebarItem from "./SidebarItem";
import { navItems } from "./navItems";
import { useAuth } from "@/components/auth/AuthContext";
import Image from "next/image";
import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { Target } from "lucide-react";

export type PageId =
  | "overview"
  | "chat"
  | "drive"
  | "auditlog"
  | "alerts"
  | "automations"
  | "integrations"
  | "storage"
  | "access"
  | "session"
  | "settings";

interface SidebarProps {
  currentPage: PageId;
  onNavigate: (page: PageId) => void;
}

export default function Sidebar({ currentPage, onNavigate }: SidebarProps) {
  const { user, logout } = useAuth();
  const searchParams = useSearchParams();
  const [customProtocols, setCustomProtocols] = useState<any[]>([]);

  useEffect(() => {
    fetch("/api/sidebar-filters")
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) setCustomProtocols(data);
      })
      .catch(console.error);
  }, []);

  return (
    <motion.aside
      initial={{ x: -280 }}
      animate={{ x: 0 }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
      className="w-[200px] flex-shrink-0 flex flex-col h-full"
      style={{ background: "#0B1437" }}
    >
      {/* Logo */}
      <div className="px-5 py-5 border-b border-white/10">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="flex items-center gap-2"
        >
          <Image 
            src="/logo.png" 
            alt="Logo" 
            width={120} 
            height={40} 
            className="object-contain brightness-0 invert"
          />
        </motion.div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 overflow-y-auto space-y-0.5">
        {navItems
          .filter(item => {
            // CEO and Admin see everything
            if (user?.role === "CEO" || user?.role === "ORG_ADMIN") return true;
            
            // If item has no permission requirement, show it (e.g. Overview)
            if (!item.permission) return true;

            // Check if user has the specific permission allowed in their custom role
            const permission = (user as any)?.customRole?.permissions?.find(
              (p: any) => p.permission === item.permission
            );
            
            return permission?.allowed === true;
          })
          .map((item, i) => (
            <SidebarItem
              key={item.id}
              {...item}
              index={i}
              isActive={currentPage === item.id && !searchParams.get("sf")}
              onClick={onNavigate}
            />
          ))}

        {/* Protocols Section */}
        {customProtocols.length > 0 && (
          <div className="mt-6">
            <div className="px-5 mb-2 flex items-center justify-between">
              <span className="text-[10px] font-black text-blue-200/30 uppercase tracking-[0.2em]">Protocols</span>
              <div className="h-[1px] flex-1 bg-white/5 ml-3" />
            </div>
            <div className="space-y-0.5">
              {customProtocols.map((p, i) => (
                <SidebarItem
                  key={p.id}
                  id={p.id as any}
                  label={p.name}
                  icon={Target}
                  index={i + navItems.length}
                  isActive={searchParams.get("sf") === p.id}
                  onClick={(id) => onNavigate(`protocol-${id}` as any)}
                />
              ))}
            </div>
          </div>
        )}
      </nav>

      {/* Storage Usage - Hidden for Sales Rep */}
      {user?.role !== "SALES_REP" && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="px-4 py-4 border-t border-white/10"
        >
          <p className="text-blue-200/60 text-xs mb-2 font-medium">
            Automation Usage
          </p>
          <div className="flex justify-between text-xs mb-1.5">
            <span className="text-blue-200/70">24 / 100 Active</span>
          </div>
          <div className="w-full bg-white/10 rounded-full h-1.5 mb-3">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: "24%" }}
              transition={{ delay: 1, duration: 0.8, ease: "easeOut" }}
              className="bg-blue-400 h-1.5 rounded-full"
            />
          </div>
          <button className="text-blue-400 text-xs hover:text-blue-300 flex items-center gap-1 transition-colors">
            View Usage Details <ChevronRight size={12} />
          </button>
        </motion.div>
      )}

      {/* Logout */}
      <div className="px-4 py-4 border-t border-white/10 mt-auto">
        <button 
          onClick={logout} 
          className="flex items-center gap-3 w-full p-2.5 rounded-lg text-blue-200/60 hover:bg-white/5 hover:text-white transition-all text-sm font-medium group"
        >
          <LogOut size={18} className="group-hover:text-blue-400 transition-colors" />
          Sign Out
        </button>
      </div>
    </motion.aside>
  );
}
