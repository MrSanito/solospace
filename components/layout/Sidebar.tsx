"use client"
import { motion } from "framer-motion";
import {
  ChevronRight,
} from "lucide-react";
import SidebarItem from "./SidebarItem";
import { navItems } from "./navItems";
import { useAuth } from "@/components/auth/AuthContext";

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
  const { user } = useAuth();
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
          <div className="w-8 h-8 rounded-lg bg-blue-500 flex items-center justify-center">
            <span className="text-white font-black text-sm">S+</span>
          </div>
          <span className="text-white font-bold text-lg tracking-wider uppercase">
            Space
          </span>
        </motion.div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 overflow-y-auto space-y-0.5">
        {navItems
          .filter(item => {
            if (user?.role === "SALES_REP") {
              return item.id === "chat";
            }
            return true;
          })
          .map((item, i) => (
            <SidebarItem
              key={item.id}
              {...item}
              index={i}
              isActive={currentPage === item.id}
              onClick={onNavigate}
            />
          ))}
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
    </motion.aside>
  );
}
