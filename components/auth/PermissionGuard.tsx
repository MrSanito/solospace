"use client"
import { motion } from "framer-motion";
import { ShieldAlert } from "lucide-react";
import { useAuth } from "@/components/auth/AuthContext";
import { PermissionKey } from "@prisma/client";

interface PermissionGuardProps {
  permission: PermissionKey;
  children: React.ReactNode;
}

export default function PermissionGuard({ permission, children }: PermissionGuardProps) {
  const { user } = useAuth();

  const hasAccess = user?.role === "CEO" || 
                   user?.role === "ORG_ADMIN" || 
                   (user as any)?.customRole?.permissions?.find((p: any) => p.permission === permission)?.allowed === true;

  if (!hasAccess) {
    return (
      <div className="flex flex-col items-center justify-center h-[calc(100vh-100px)] bg-gray-50/50 p-6">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white p-8 rounded-3xl shadow-xl border border-gray-100 flex flex-col items-center max-w-md text-center"
        >
          <div className="w-16 h-16 bg-red-50 text-red-500 rounded-2xl flex items-center justify-center mb-6">
            <ShieldAlert size={32} />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h2>
          <p className="text-gray-500 mb-6 leading-relaxed">
            You don't have the required permissions to access this page. 
            Please contact your administrator if you believe this is an error.
          </p>
          <div className="w-full h-px bg-gray-100 mb-6" />
          <p className="text-xs text-gray-400 font-medium uppercase tracking-wider">
            Permission Required: {permission}
          </p>
        </motion.div>
      </div>
    );
  }

  return <>{children}</>;
}
