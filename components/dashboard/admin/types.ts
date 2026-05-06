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

export interface Automation {
  id: string;
  name: string;
  description: string;
  trigger: string;
  triggerSource: string;
  action: string;
  actionTarget: string;
  condition: string;
  status: "Active" | "Paused" | "Inactive";
  lastRun: string;
  executions: number;
}

export interface DriveFile {
  id: string;
  name: string;
  owner: string;
  ownerInitials: string;
  ownerColor: string;
  size: string;
  type: string;
  access: "Restricted" | "Allowed";
  uploadedAt: string;
  isFolder?: boolean;
  tags?: string[];
  description?: string;
}

export interface AuditEntry {
  id: string;
  time: string;
  userInitials: string;
  userColor: string;
  user: string;
  userRole: string;
  employee: string;
  clientLead: string;
  leadId: string;
  action: string;
  actionType: "view" | "send" | "upload" | "decrypt" | "restrict" | "settings" | "download";
  resource: string;
  resourceType: string;
  ipAddress: string;
}

export interface Role {
  id: string;
  name: string;
  icon: string;
  users: number;
  description: string;
  lastUpdated: string;
  color: string;
}

export interface Session {
  id: string;
  userInitials: string;
  userColor: string;
  user: string;
  role: string;
  sessionId: string;
  device: string;
  os: string;
  ipAddress: string;
  location: string;
  loginTime: string;
  lastActive: string;
  status: "Active" | "Idle" | "Logged Out";
  mfa: boolean;
}
