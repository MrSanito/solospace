"use client"
import { motion } from "framer-motion";
import React from "react";
import { PageId } from "./Sidebar";

interface SidebarItemProps {
  id: PageId;
  label: string;
  icon: React.ElementType;
  isActive: boolean;
  badge?: number;
  index: number;
  onClick: (id: PageId) => void;
}

export default function SidebarItem({
  id,
  label,
  icon: Icon,
  isActive,
  badge,
  index,
  onClick,
}: SidebarItemProps) {
  return (
    <motion.button
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.05 * index + 0.3 }}
      whileHover={{ x: 3 }}
      whileTap={{ scale: 0.97 }}
      onClick={() => onClick(id)}
      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-colors duration-150 group relative ${
        isActive
          ? "bg-blue-600 text-white shadow-lg"
          : "text-blue-200/70 hover:text-white hover:bg-white/10"
      }`}
    >
      <Icon size={16} className="flex-shrink-0" />
      <span className="text-sm font-medium">{label}</span>
      {badge && (
        <motion.span
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="ml-auto bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold"
        >
          {badge}
        </motion.span>
      )}
    </motion.button>
  );
}
