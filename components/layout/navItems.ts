import {
  LayoutDashboard,
  MessageSquare,
  FolderOpen,
  ClipboardList,
  Bell,
  Zap,
  Plug,
  HardDrive,
  ShieldCheck,
  Lock,
  Settings,
} from "lucide-react";
import { PageId } from "./Sidebar";
import { PermissionKey } from "@prisma/client";

export interface NavItem {
  id: PageId;
  label: string;
  icon: any;
  badge?: number;
  permission?: PermissionKey;
}

export const navItems: NavItem[] = [
  { id: "overview", label: "Overview", icon: LayoutDashboard },
  { id: "chat", label: "Chat Oversight", icon: MessageSquare, permission: "CHAT_ACCESS" },
  { id: "drive", label: "Drive", icon: FolderOpen, permission: "FILE_VIEW" },
  { id: "auditlog", label: "Audit Log", icon: ClipboardList, permission: "AUDIT_LOGS" },
  { id: "alerts", label: "Alerts", icon: Bell, permission: "AUDIT_LOGS" },
  { id: "automations", label: "Automations", icon: Zap, permission: "ACCESS_CONTROL" },
  { id: "integrations", label: "Integrations", icon: Plug, permission: "ACCESS_CONTROL" },
  { id: "storage", label: "Storage", icon: HardDrive, permission: "ACCESS_CONTROL" },
  { id: "access", label: "Access Control", icon: Lock, permission: "ACCESS_CONTROL" },
  { id: "session", label: "Session & Security", icon: ShieldCheck, permission: "ACCESS_CONTROL" },
  { id: "settings", label: "Settings", icon: Settings, permission: "ACCESS_CONTROL" },
];
