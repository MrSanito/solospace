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

export interface NavItem {
  id: PageId;
  label: string;
  icon: any;
  badge?: number;
}

export const navItems: NavItem[] = [
  { id: "overview", label: "Overview", icon: LayoutDashboard },
  { id: "chat", label: "Chat Oversight", icon: MessageSquare },
  { id: "drive", label: "Drive", icon: FolderOpen },
  { id: "auditlog", label: "Audit Log", icon: ClipboardList },
  { id: "alerts", label: "Alerts", icon: Bell, badge: 8 },
  { id: "automations", label: "Automations", icon: Zap },
  { id: "integrations", label: "Integrations", icon: Plug },
  { id: "storage", label: "Storage", icon: HardDrive },
  { id: "access", label: "Access Control", icon: Lock },
  { id: "session", label: "Session & Security", icon: ShieldCheck },
  { id: "settings", label: "Settings", icon: Settings },
];
