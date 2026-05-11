"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  SlidersHorizontal,
  ChevronLeft,
  ChevronRight,
  FileText,
  MoreVertical,
  Lock,
  Download,
  Eye,
  RefreshCw,
  MessageSquare,
  Paperclip,
  Key,
  Phone,
  ChevronUp,
  Smile,
  Send,
  Shield,
  Tag,
} from "lucide-react";

// WhatsApp SVG icon
const WhatsAppIcon = () => (
  <svg viewBox="0 0 24 24" width="16" height="16" fill="#25D366">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
  </svg>
);

const slideInRight = {
  initial: { opacity: 0, x: 40 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: 40 },
};

const statusColors: Record<string, string> = {
  active: "bg-green-500",
  waiting: "bg-yellow-400",
  closed: "bg-gray-400",
};

interface ChatOversightPageProps {
  initialThreadId?: string | null;
  onBack?: () => void;
}

export default function ChatOversightPage({ initialThreadId, onBack }: ChatOversightPageProps) {
  const [selected, setSelected] = useState<number | null>(null);
  const [threads, setThreads] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [newMessage, setNewMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [activeTab, setActiveTab] = useState("all");
  const [detailsOpen, setDetailsOpen] = useState(true);
  const [sharedTab, setSharedTab] = useState<"accessible" | "restricted">("accessible");
  const [isJoining, setIsJoining] = useState(false);
  const [isInternal, setIsInternal] = useState(false);


  const isPrivileged = currentUser?.role === "ORG_ADMIN" || currentUser?.role === "MANAGER";
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Security States
  const [unlockKey, setUnlockKey] = useState("");
  const [unlocking, setUnlocking] = useState(false);
  const [unlockedUrls, setUnlockedUrls] = useState<Record<string, string>>({});
  const [showUnlockModal, setShowUnlockModal] = useState<string | null>(null);
  const [showKeyForAtt, setShowKeyForAtt] = useState<string | null>(null);

  const handleUnlock = async (fileId: string) => {
    if (!unlockKey) return;
    setUnlocking(true);
    try {
      const res = await fetch("/api/drive/unlock", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fileId, accessKey: unlockKey }),
      });
      if (res.ok) {
        const data = await res.json();
        setUnlockedUrls(prev => ({ ...prev, [fileId]: data.url }));
        setUnlockKey("");
        setShowUnlockModal(null);
      } else {
        alert("Invalid access key");
      }
    } catch (error) {
      console.error("Unlock error:", error);
    } finally {
      setUnlocking(false);
    }
  };

  const fetchThreads = async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const res = await fetch("/api/chat/oversight");
      if (res.ok) {
        const data = await res.json();
        setThreads(data.threads || data);
      }
    } catch (error) {
      console.error("Failed to fetch chat threads:", error);
    } finally {
      if (!silent) setLoading(false);
    }
  };

  const fetchCurrentUser = async () => {
    try {
      const res = await fetch("/api/auth/me");
      if (res.ok) {
        const data = await res.json();
        setCurrentUser(data.user);
      }
    } catch (e) {
      console.error("Failed to fetch user");
    }
  };

  useEffect(() => {
    fetchThreads();
    fetchCurrentUser();
  }, []);

  // Auto-refresh every 5 seconds if tab is active and a chat is selected
  useEffect(() => {
    const interval = setInterval(() => {
      if (document.visibilityState === "visible" && selected !== null) {
        fetchThreads(true);
      }
    }, 5000);
    return () => clearInterval(interval);
  }, [selected]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [selected, threads]);

  const handleFileUpload = async (file: File) => {
    const activeThread = selected !== null ? filteredThreads[selected] : null;
    if (!activeThread) return;
    setUploading(true);
    const formData = new FormData();
    formData.append("file", file);
    try {
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });
      if (res.ok) {
        const data = await res.json();
        await handleSendMessage(undefined, [{
          fileName: data.fileName,
          fileUrl: data.url,
          fileType: data.fileType,
          fileSize: data.fileSize,
        }]);
      }
    } catch (e) {
      console.error("Upload failed");
    } finally {
      setUploading(false);
    }
  };

  const handleSendMessage = async (e?: React.FormEvent, attachments?: any[]) => {
    if (e) e.preventDefault();
    const activeThread = selected !== null ? filteredThreads[selected] : null;
    if (!activeThread) return;
    if (!newMessage.trim() && (!attachments || attachments.length === 0)) return;
    if (sending) return;
    setSending(true);
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          leadId: activeThread.leadId,
          content: newMessage,
          senderType: "USER",
          senderId: currentUser?.id,
          receiverId: isInternal ? "INTERNAL" : activeThread.leadId,
          attachments: attachments || [],
        }),
      });
      if (res.ok) {
        setNewMessage("");
        setIsInternal(false);
        fetchThreads();
      }
    } catch (error) {
      console.error("Failed to send message");
    } finally {
      setSending(false);
    }
  };

  const filteredThreads = threads.filter(t =>
    t.lead.contactName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.lead.owner?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.messages.some((m: any) => m.content.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  useEffect(() => {
    if (initialThreadId && filteredThreads.length > 0 && selected === null) {
      const idx = filteredThreads.findIndex(t => t.id === initialThreadId);
      if (idx !== -1) setSelected(idx);
    }
  }, [initialThreadId, filteredThreads, selected]);

  const activeThread = selected !== null ? filteredThreads[selected] : null;
  const activeLead = activeThread?.lead;
  const activeOwner = activeLead?.owner;

  const hasChatted = activeThread?.messages?.some((m: any) => m.senderId === currentUser?.id);
  const canChat = hasChatted || isJoining;

  useEffect(() => {
    setIsJoining(false);
  }, [activeThread?.id]);

  const initials = activeLead?.contactName
    ? activeLead.contactName.split(" ").map((n: string) => n[0]).join("").substring(0, 2).toUpperCase()
    : "NA";

  // Helper to get file extension color
  const getFileColor = (fileName: string) => {
    const ext = fileName?.split('.').pop()?.toLowerCase();
    if (ext === 'pdf') return 'bg-red-500';
    if (ext === 'xlsx' || ext === 'xls') return 'bg-green-600';
    if (ext === 'docx' || ext === 'doc') return 'bg-blue-600';
    return 'bg-gray-500';
  };

  const getFileLabel = (fileName: string) => {
    return fileName?.split('.').pop()?.toUpperCase() || 'FILE';
  };

  const formatFileSize = (bytes: number) => {
    if (!bytes) return '';
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(0) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  // Tabs counts
  const allCount = filteredThreads.length;
  const activeCount = filteredThreads.filter(t => (t.status || 'active').toLowerCase() === 'active').length;
  const waitingCount = filteredThreads.filter(t => (t.status || '').toLowerCase() === 'waiting').length;
  const closedCount = filteredThreads.filter(t => (t.status || '').toLowerCase() === 'closed').length;

  const tabs = [
    { key: "all", label: `All ${allCount}` },
    { key: "active", label: `Active ${activeCount}` },
    { key: "waiting", label: `Waiting ${waitingCount}` },
    { key: "closed", label: `Closed ${closedCount}` },
  ];

  // Accessible vs restricted shared files
  const accessibleFiles = (activeThread?.sharedFiles || []).filter((f: any) => !f.isRestricted);
  const restrictedFiles = (activeThread?.sharedFiles || []).filter((f: any) => f.isRestricted);

  return (
    <div className="flex flex-1 h-full min-h-0 bg-gray-100 overflow-hidden font-sans">
      <div className="flex flex-1 h-full min-h-0">

        {/* ── LEFT: My Assigned Leads ── */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3 }}
          className={`w-full md:w-[220px] border-r border-gray-200 bg-white flex flex-col shrink-0 ${selected !== null ? "hidden md:flex" : "flex"}`}
        >
          {/* Header */}
          <div className="px-4 pt-4 pb-3 border-b border-gray-100">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-bold text-gray-800">My Assigned Leads</span>
              <div className="flex items-center gap-1">
                <span className="text-xs font-bold text-gray-800 bg-gray-100 rounded-full px-2 py-0.5">{allCount}</span>
                <SlidersHorizontal size={14} className="text-gray-400 cursor-pointer hover:text-gray-600 ml-1" />
              </div>
            </div>
            {/* Search */}
            <div className="flex items-center gap-2 bg-gray-100 rounded-lg px-3 py-2">
              <Search size={12} className="text-gray-400 shrink-0" />
              <input
                className="bg-transparent text-xs text-gray-600 placeholder:text-gray-400 outline-none flex-1 w-0"
                placeholder="Search leads..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
              />
            </div>
            {/* Tabs */}
            <div className="flex gap-1 mt-3 text-[11px] font-semibold border-b border-gray-100 pb-0">
              {tabs.map(tab => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`px-0 pb-2 mr-3 transition-colors border-b-2 ${
                    activeTab === tab.key
                      ? "border-blue-600 text-blue-600"
                      : "border-transparent text-gray-400 hover:text-gray-600"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Lead list */}
          <div className="flex-1 overflow-y-auto">
            {loading ? (
              <div className="p-4 text-center text-xs text-gray-400">Loading...</div>
            ) : filteredThreads.length === 0 ? (
              <div className="p-4 text-center text-xs text-gray-400">No leads found.</div>
            ) : (
              filteredThreads.map((thread, i) => {
                const name = thread.lead.contactName || "";
                const leadInitials = name.split(" ").map((n: string) => n[0]).join("").substring(0, 2).toUpperCase();
                const lastMessage = thread.messages.length > 0 ? thread.messages[thread.messages.length - 1] : null;
                const timeStr = lastMessage
                  ? (() => {
                      const d = new Date(lastMessage.createdAt);
                      const diff = Date.now() - d.getTime();
                      const mins = Math.floor(diff / 60000);
                      if (mins < 60) return `${mins}m`;
                      const hrs = Math.floor(mins / 60);
                      if (hrs < 24) return `${hrs}h`;
                      return `${Math.floor(hrs / 24)}d`;
                    })()
                  : "";
                const statusKey = (thread.status || 'active').toLowerCase();
                const dotColor = statusColors[statusKey] || "bg-gray-300";

                // Avatar bg colors cycle
                const avatarColors = [
                  "bg-blue-100 text-blue-700",
                  "bg-purple-100 text-purple-700",
                  "bg-red-100 text-red-700",
                  "bg-teal-100 text-teal-700",
                  "bg-orange-100 text-orange-700",
                  "bg-indigo-100 text-indigo-700",
                ];
                const avatarColor = avatarColors[i % avatarColors.length];

                return (
                  <motion.div
                    key={thread.id}
                    whileHover={{ backgroundColor: "#f8fafc" }}
                    onClick={() => setSelected(i)}
                    className={`flex items-start gap-3 px-3 py-3 border-b border-gray-50 cursor-pointer transition-colors ${
                      selected === i ? "bg-blue-50 border-l-[3px] border-l-blue-500" : "border-l-[3px] border-l-transparent"
                    }`}
                  >
                    <div className={`w-9 h-9 rounded-full font-bold text-xs flex items-center justify-center shrink-0 ${avatarColor}`}>
                      {leadInitials}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-center">
                        <p className="text-xs font-semibold text-gray-800 truncate">{name}</p>
                        <span className="text-[10px] text-gray-400 shrink-0 ml-1">{timeStr}</span>
                      </div>
                      <p className="text-[11px] text-gray-500 truncate mt-0.5">
                        {lastMessage ? lastMessage.content : "No messages"}
                      </p>
                      <div className={`w-2 h-2 rounded-full mt-1.5 ${dotColor}`} />
                    </div>
                  </motion.div>
                );
              })
            )}
          </div>

          {/* Pagination */}
          <div className="p-3 border-t border-gray-100 flex items-center gap-1 text-xs text-gray-400">
            <ChevronLeft size={14} className="cursor-pointer hover:text-gray-600" />
            <button className="w-6 h-6 rounded bg-blue-600 text-white text-[11px] font-bold">1</button>
            <ChevronRight size={14} className="cursor-pointer hover:text-gray-600 ml-auto" />
          </div>
        </motion.div>

        {/* ── MIDDLE: Chat View ── */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
          className={`flex-1 flex flex-col min-w-0 bg-white ${selected === null ? "hidden md:flex" : "flex"}`}
        >
          {activeThread ? (
            <>
              {/* Chat Header */}
              <div className="h-14 border-b border-gray-200 bg-white flex items-center gap-3 px-4 shrink-0">
                {onBack && (
                  <button 
                    onClick={onBack} 
                    className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 hover:border-gray-300 transition-all mr-2"
                  >
                    <ChevronLeft size={16} />
                    <span className="text-xs font-bold">Back</span>
                  </button>
                )}
                <button onClick={() => setSelected(null)} className="md:hidden p-1 -ml-2 text-gray-500">
                  <ChevronLeft size={20} />
                </button>
                <div className="w-9 h-9 rounded-full bg-blue-100 text-blue-700 font-bold text-sm flex items-center justify-center shrink-0">
                  {initials}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-gray-800 leading-tight">{activeLead?.contactName}</p>
                  <p className="text-[11px] text-gray-400 leading-tight">
                    Lead ID: {activeLead?.id ? `L-${activeLead.id.split('-')[0].toUpperCase()}` : "NA"} &nbsp;•&nbsp; Project: {activeLead?.project || "None"}
                  </p>
                </div>
                <div className="flex items-center gap-3 text-gray-400">
                  <Phone size={16} className="cursor-pointer hover:text-gray-600" />
                  <span className="cursor-pointer hover:opacity-80"><WhatsAppIcon /></span>
                  <MoreVertical size={16} className="cursor-pointer hover:text-gray-600" />
                </div>
              </div>

              {/* Monitoring Banner */}
              <div className="bg-amber-50 border-b border-amber-100 px-4 py-2 flex items-center gap-2 shrink-0">
                <Shield size={13} className="text-amber-500 shrink-0" />
                <p className="text-[11px] text-amber-700 font-medium">This conversation is monitored and recorded.</p>
              </div>

              {/* Messages Area */}
              <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3 bg-gray-50/40">
                {activeThread.messages.length === 0 ? (
                  <div className="text-center text-xs text-gray-400 py-8">No messages in this conversation.</div>
                ) : (
                  <>
                    {/* Date divider */}
                    <div className="flex items-center gap-3 my-2">
                      <div className="flex-1 h-px bg-gray-200" />
                      <span className="text-[11px] text-gray-400 bg-white border border-gray-200 rounded-full px-3 py-0.5">Today</span>
                      <div className="flex-1 h-px bg-gray-200" />
                    </div>

                    {activeThread.messages.map((m: any, i: number) => {
                      const timeStr = new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                      const isLead = m.senderType === "LEAD";
                      const msgInitials = activeLead?.contactName
                        ? activeLead.contactName.split(" ").map((n: string) => n[0]).join("").substring(0, 2).toUpperCase()
                        : "?";

                      return (
                        <motion.div
                          key={m.id || i}
                          initial={{ opacity: 0, y: 8 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: i * 0.015 }}
                          className={`flex ${isLead ? "justify-start" : "justify-end"} items-end gap-2`}
                        >
                          {!isLead && (
                            <div className="flex flex-col items-center gap-1 order-last shrink-0">
                              <div className="w-7 h-7 rounded-full bg-blue-600 text-white font-bold text-[10px] flex items-center justify-center shadow-sm" title={`${m.senderName} (${m.senderRole})`}>
                                {m.senderAvatar ? (
                                  <img src={m.senderAvatar} alt="" className="w-full h-full rounded-full object-cover" />
                                ) : (
                                  (m.senderName || "S").charAt(0)
                                )}
                              </div>
                            </div>
                          )}

                          {isLead && (
                            <div className="w-7 h-7 rounded-full bg-blue-100 text-blue-700 font-bold text-[10px] flex items-center justify-center shrink-0 mb-0.5">
                              {msgInitials}
                            </div>
                          )}

                          <div className={`max-w-[68%] flex flex-col ${isLead ? "items-start" : "items-end"}`}>
                            {isLead && (
                              <span className="text-[10px] font-black uppercase tracking-wider text-gray-500 mb-1 px-1">
                                {activeLead?.contactName}
                              </span>
                            )}
                            {!isLead && m.senderName && (
                              <span className="text-[10px] font-black uppercase tracking-wider text-blue-700 mb-1 flex items-center gap-2 px-1">
                                {m.senderName} 
                                <span className="bg-blue-100 text-blue-600 px-1.5 py-0.5 rounded text-[8px] font-bold">{m.senderRole}</span>
                                {m.receiverId !== activeThread.leadId && (
                                  <span className="bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded text-[8px] font-bold flex items-center gap-1 border border-amber-200">
                                    <Lock size={8} /> INTERNAL
                                  </span>
                                )}
                              </span>
                            )}
                            <div
                              className={`px-3.5 py-2.5 rounded-2xl text-xs leading-relaxed ${
                                isLead
                                  ? "bg-white border border-gray-200 text-gray-700 rounded-bl-sm shadow-sm"
                                  : "bg-blue-600 text-white rounded-br-sm"
                              }`}
                            >
                              {m.content && m.content.split('\n').map((line: string, j: number) => (
                                <p key={j}>{line}</p>
                              ))}

                              {/* Attachments */}
                              {m.attachments?.map((file: any) => (
                                <div
                                  key={file.id}
                                  className={`mt-2 flex items-center gap-2 p-2 rounded-xl border ${
                                    !isLead ? "bg-blue-500 border-blue-400" : "bg-gray-50 border-gray-100"
                                  }`}
                                >
                                  <div className={`flex items-center justify-center w-8 h-8 rounded-lg ${getFileColor(file.fileName)} shrink-0`}>
                                    <FileText size={14} className="text-white" />
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <p className={`text-[10px] font-semibold truncate ${!isLead ? "text-white" : "text-gray-700"}`}>{file.fileName}</p>
                                    <p className={`text-[9px] mt-0.5 ${!isLead ? "text-blue-200" : "text-gray-400"}`}>
                                      {getFileLabel(file.fileName)} • {formatFileSize(file.fileSize)}
                                    </p>
                                    <div className="flex items-center gap-2 mt-1">
                                      {file.isRestricted && isPrivileged && (
                                        <div className="relative">
                                          {showKeyForAtt === file.id && (
                                            <span className="absolute left-full ml-2 top-1/2 -translate-y-1/2 font-mono text-[9px] font-black bg-white text-blue-600 px-1.5 py-0.5 rounded shadow-xl whitespace-nowrap z-10 border border-blue-100">
                                              KEY: {file.accessKey}
                                            </span>
                                          )}
                                          <button
                                            type="button"
                                            onClick={async () => {
                                              const newState = showKeyForAtt === file.id ? null : file.id;
                                              setShowKeyForAtt(newState);
                                              if (newState) {
                                                try {
                                                  await fetch("/api/audit/log", {
                                                    method: "POST",
                                                    headers: { "Content-Type": "application/json" },
                                                    body: JSON.stringify({
                                                      action: "VIEW_KEY",
                                                      note: `Admin viewed access key for file: ${file.fileName} in chat`,
                                                      leadId: activeLead?.id,
                                                      source: "UI"
                                                    })
                                                  });
                                                } catch (e) {
                                                  console.error("Failed to log key view");
                                                }
                                              }
                                            }}
                                            className={`flex items-center gap-1 text-[9px] font-bold ${!isLead ? "text-blue-200 hover:text-white" : "text-gray-500 hover:text-gray-800"}`}
                                          >
                                            <Key size={9} /> Get Code
                                          </button>
                                        </div>
                                      )}
                                      {(!file.isRestricted || unlockedUrls[file.id]) ? (
                                        <a
                                          href={file.fileUrl || unlockedUrls[file.id] || "#"}
                                          target="_blank"
                                          rel="noopener noreferrer"
                                          className={`text-[9px] hover:underline font-bold flex items-center gap-1 ${!isLead ? "text-white" : "text-blue-600"}`}
                                        >
                                          <Download size={9} /> Open
                                        </a>
                                      ) : (
                                        <button
                                          type="button"
                                          onClick={() => setShowUnlockModal(file.id)}
                                          className={`text-[9px] font-bold flex items-center gap-1 ${!isLead ? "text-red-200 hover:text-red-100" : "text-red-500 hover:text-red-600"}`}
                                        >
                                          <Lock size={9} /> Unlock
                                        </button>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>

                            {/* Time + ticks */}
                            <div className={`flex items-center gap-1 mt-1 ${isLead ? "justify-start" : "justify-end"}`}>
                              <span className="text-[10px] text-gray-400">{timeStr}</span>
                              {!isLead && (
                                <svg width="14" height="10" viewBox="0 0 14 10" className="text-blue-400">
                                  <path d="M1 5l3 3 5-7" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round" />
                                  <path d="M5 5l3 3 5-7" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round" />
                                </svg>
                              )}
                            </div>
                          </div>
                        </motion.div>
                      );
                    })}
                    <div ref={messagesEndRef} />
                  </>
                )}
              </div>

              {/* WhatsApp import notice */}
              <div className="flex items-center justify-center gap-2 py-1.5 bg-gray-50 border-t border-gray-100 shrink-0">
                <WhatsAppIcon />
                <span className="text-[11px] text-gray-400">Imported from WhatsApp</span>
              </div>

              {/* Input Bar */}
              <div className="border-t border-gray-200 bg-white shrink-0 pb-[env(safe-area-inset-bottom)]">
                {canChat ? (
                  <form
                    onSubmit={e => handleSendMessage(e)}
                    className="flex items-center gap-2 px-3 py-2.5"
                  >
                    <input
                      type="file"
                      id="admin-file-upload"
                      className="hidden"
                      onChange={e => {
                        const file = e.target.files?.[0];
                        if (file) handleFileUpload(file);
                      }}
                    />
                    <button
                      type="button"
                      disabled={uploading}
                      onClick={() => document.getElementById("admin-file-upload")?.click()}
                      className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-xl transition-all disabled:opacity-50"
                      title="Attach File"
                    >
                      {uploading ? <span className="loading loading-spinner loading-xs" /> : <Paperclip size={18} />}
                    </button>

                    <div className="flex flex-col gap-2 flex-1">
                      {isPrivileged && (
                        <div className="flex items-center gap-2 mb-1 px-1">
                          <button
                            type="button"
                            onClick={() => setIsInternal(!isInternal)}
                            className={`text-[10px] font-bold px-2 py-0.5 rounded transition-all flex items-center gap-1 ${
                              isInternal 
                                ? "bg-amber-100 text-amber-700 border border-amber-200 shadow-sm" 
                                : "bg-gray-100 text-gray-500 border border-gray-200"
                            }`}
                          >
                            <Lock size={10} /> {isInternal ? "INTERNAL NOTE" : "PUBLIC REPLY"}
                          </button>
                        </div>
                      )}
                      <div className={`flex items-center rounded-2xl px-4 py-2.5 gap-2 transition-all border ${
                        isInternal ? "bg-amber-50/50 border-amber-100" : "bg-gray-100 border-transparent"
                      }`}>
                        <input
                          type="text"
                          value={newMessage}
                          onChange={e => setNewMessage(e.target.value)}
                          placeholder={isInternal ? "Type an internal note..." : "Type your message to the lead..."}
                          className="flex-1 bg-transparent text-xs text-gray-700 placeholder:text-gray-400 outline-none"
                        />
                        <button type="button" className="text-gray-400 hover:text-gray-600 shrink-0">
                          <Smile size={17} />
                        </button>
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={sending || (!newMessage.trim() && !uploading)}
                      className="w-10 h-10 rounded-full bg-blue-600 hover:bg-blue-700 flex items-center justify-center text-white transition-colors disabled:opacity-50 shrink-0"
                    >
                      {sending ? <span className="loading loading-spinner loading-xs" /> : <Send size={16} />}
                    </button>
                  </form>
                ) : (
                  <div className="p-4 flex flex-col items-center justify-center bg-gray-50/50 gap-3 border-t border-gray-100">
                    <div className="flex items-center gap-2 text-gray-400">
                      <Shield size={14} className="text-gray-300" />
                      <p className="text-[11px] font-medium uppercase tracking-widest">Read Only Mode</p>
                    </div>
                    <button 
                      onClick={async () => {
                        setIsJoining(true);
                        try {
                          await fetch("/api/audit/log", {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({
                              action: "JOIN_CHAT",
                              note: `Admin joined chat for lead: ${activeLead?.contactName}`,
                              leadId: activeLead?.id,
                              source: "UI"
                            })
                          });
                        } catch (e) {
                          console.error("Failed to log join chat");
                        }
                      }}
                      className="group flex items-center gap-2 bg-blue-600 text-white px-8 py-2.5 rounded-2xl text-xs font-bold shadow-lg shadow-blue-500/20 hover:bg-blue-700 transition-all active:scale-95"
                    >
                      <MessageSquare size={14} className="group-hover:scale-110 transition-transform" />
                      Start Conversation
                    </button>
                    <p className="text-[10px] text-gray-400 font-medium">You are not a participant in this conversation yet.</p>
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-gray-400 gap-4">
              <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center">
                <MessageSquare size={32} className="text-gray-300" />
              </div>
              <p className="text-sm font-medium text-gray-500">Select a conversation to start chatting</p>
            </div>
          )}
        </motion.div>

        {/* ── RIGHT: Lead Information ── */}
        <AnimatePresence>
          {activeThread && (
            <motion.div
              key="details-panel"
              variants={slideInRight}
              initial="initial"
              animate="animate"
              exit="exit"
              className="w-[220px] border-l border-gray-200 bg-white overflow-y-auto shrink-0"
            >
              {/* Lead Information Header */}
              <div
                className="flex items-center justify-between px-4 py-3 border-b border-gray-100 cursor-pointer"
                onClick={() => setDetailsOpen(v => !v)}
              >
                <span className="text-xs font-bold text-gray-800">Lead Information</span>
                <motion.div animate={{ rotate: detailsOpen ? 0 : 180 }} transition={{ duration: 0.2 }}>
                  <ChevronUp size={14} className="text-gray-400" />
                </motion.div>
              </div>

              {detailsOpen && (
                <div className="px-4 py-3 space-y-1 border-b border-gray-100">
                  {/* Name */}
                  <div className="flex items-center gap-2 py-1.5">
                    <div className="w-5 h-5 rounded-full bg-gray-100 flex items-center justify-center shrink-0">
                      <span className="text-[10px] text-gray-500">👤</span>
                    </div>
                    <span className="text-xs font-semibold text-gray-800">{activeLead?.contactName || "-"}</span>
                  </div>
                  {/* Phone */}
                  <div className="flex items-center gap-2 py-1.5">
                    <Phone size={13} className="text-gray-400 shrink-0" />
                    <span className="text-xs text-gray-700 flex-1">{activeLead?.phone || "-"}</span>
                    {activeLead?.phone && (
                      <span className="shrink-0"><WhatsAppIcon /></span>
                    )}
                  </div>
                  {/* Email */}
                  {activeLead?.email && (
                    <div className="flex items-center gap-2 py-1.5">
                      <span className="text-gray-400 text-[13px] shrink-0">✉</span>
                      <span className="text-[11px] text-gray-700 truncate">{activeLead.email}</span>
                    </div>
                  )}
                  {/* Interested In */}
                  {activeLead?.project && (
                    <div className="flex items-center gap-2 py-1.5">
                      <Tag size={13} className="text-gray-400 shrink-0" />
                      <span className="text-[11px] text-gray-500">Interested in: </span>
                      <span className="text-[11px] text-gray-700">{activeLead.project}</span>
                    </div>
                  )}
                  {/* Source */}
                  <div className="flex items-center gap-2 py-1.5">
                    <span className="text-gray-400 text-[13px] shrink-0">💬</span>
                    <span className="text-[11px] text-gray-700">Source: {activeLead?.source?.name || "WhatsApp"}</span>
                  </div>
                  {/* Project */}
                  <div className="flex items-center gap-2 py-1.5">
                    <span className="text-gray-400 text-[13px] shrink-0">🏢</span>
                    <span className="text-[11px] text-gray-700">Project: {activeLead?.project || "None"}</span>
                  </div>
                </div>
              )}

              {/* Lead Tags */}
              <div className="px-4 py-3 border-b border-gray-100">
                <p className="text-[11px] font-bold text-gray-700 mb-2">Lead Tags</p>
                <div className="flex flex-wrap gap-1.5">
                  {(activeLead?.tags || []).map((tag: string, i: number) => {
                    const tagColors = [
                      "bg-blue-100 text-blue-700 border-blue-200",
                      "bg-orange-100 text-orange-700 border-orange-200",
                      "bg-green-100 text-green-700 border-green-200",
                      "bg-purple-100 text-purple-700 border-purple-200",
                    ];
                    return (
                      <span
                        key={i}
                        className={`text-[10px] font-semibold px-2.5 py-1 rounded-full border ${tagColors[i % tagColors.length]}`}
                      >
                        {tag}
                      </span>
                    );
                  })}
                  {(!activeLead?.tags || activeLead.tags.length === 0) && (
                    <span className="text-[11px] text-gray-400">No tags</span>
                  )}
                </div>
              </div>

              {/* Shared Files */}
              <div className="px-4 py-3 border-b border-gray-100">
                <p className="text-[11px] font-bold text-gray-700 mb-2">Shared Files (Lead Level)</p>
                {/* Tabs */}
                <div className="flex border-b border-gray-100 mb-2">
                  <button
                    onClick={() => setSharedTab("accessible")}
                    className={`text-[10px] font-semibold pb-1.5 mr-3 border-b-2 transition-colors ${
                      sharedTab === "accessible" ? "border-blue-600 text-blue-600" : "border-transparent text-gray-400"
                    }`}
                  >
                    Accessible ({accessibleFiles.length})
                  </button>
                  <button
                    onClick={() => setSharedTab("restricted")}
                    className={`text-[10px] font-semibold pb-1.5 border-b-2 transition-colors ${
                      sharedTab === "restricted" ? "border-blue-600 text-blue-600" : "border-transparent text-gray-400"
                    }`}
                  >
                    Restricted ({restrictedFiles.length})
                  </button>
                </div>

                {/* File list */}
                <div className="space-y-3">
                  {(sharedTab === "accessible" ? accessibleFiles : restrictedFiles).map((file: any) => {
                    const isUnlocked = unlockedUrls[file.id];
                    const url = file.fileUrl || isUnlocked;

                    return (
                      <div key={file.id} className="flex flex-col gap-1 pb-2 border-b border-gray-50 last:border-0">
                        <div className="flex items-center gap-2">
                          <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${getFileColor(file.fileName)}`}>
                            <FileText size={12} className="text-white" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-[10px] font-semibold text-gray-700 truncate">{file.fileName}</p>
                            <p className="text-[9px] text-gray-400">
                              {getFileLabel(file.fileName)} • {formatFileSize(file.fileSize)}
                            </p>
                          </div>
                          <div className="flex items-center gap-1.5 shrink-0">
                            {url ? (
                              <a
                                href={url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="w-6 h-6 rounded-md bg-blue-50 text-blue-600 flex items-center justify-center hover:bg-blue-100 transition-colors"
                              >
                                <Download size={12} />
                              </a>
                            ) : (
                              <button
                                onClick={() => setShowUnlockModal(file.id)}
                                className="w-6 h-6 rounded-md bg-red-50 text-red-500 flex items-center justify-center hover:bg-red-100 transition-colors"
                              >
                                <Lock size={12} />
                              </button>
                            )}
                          </div>
                        </div>

                        {/* File Meta & Actions */}
                        <div className="flex items-center justify-between px-1">
                           <span className="text-[8px] text-gray-400">
                            {file.source === "NOTE" ? "From Notes" : "From Chat"} • {file.createdAt ? new Date(file.createdAt).toLocaleDateString() : ""}
                          </span>

                          {file.isRestricted && isPrivileged && (
                            <div className="relative">
                              {showKeyForAtt === file.id && (
                                <span className="absolute right-0 bottom-full mb-1 font-mono text-[9px] font-black bg-white text-blue-600 px-1.5 py-0.5 rounded shadow-xl border border-blue-100 whitespace-nowrap z-10">
                                  CODE: {file.accessKey}
                                </span>
                              )}
                              <button
                                onClick={async () => {
                                  const newState = showKeyForAtt === file.id ? null : file.id;
                                  setShowKeyForAtt(newState);
                                  if (newState) {
                                    try {
                                      await fetch("/api/audit/log", {
                                        method: "POST",
                                        headers: { "Content-Type": "application/json" },
                                        body: JSON.stringify({
                                          action: "VIEW_KEY",
                                          note: `Admin viewed access key for file: ${file.fileName} from sidebar`,
                                          leadId: activeLead?.id,
                                          source: "UI"
                                        })
                                      });
                                    } catch (e) {
                                      console.error("Failed to log key view");
                                    }
                                  }
                                }}
                                className="text-[9px] font-bold text-blue-600 hover:underline flex items-center gap-0.5"
                              >
                                <Key size={8} /> Get Code
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}

                  {(sharedTab === "accessible" ? accessibleFiles : restrictedFiles).length === 0 && (
                    <div className="py-4 text-center">
                      <p className="text-[10px] text-gray-400 italic">No {sharedTab} files found.</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Security Hint */}
              <div className="px-4 py-3">
                <div className="bg-blue-50/50 rounded-xl p-3 border border-blue-100/50">
                  <div className="flex items-center gap-2 mb-1">
                    <Shield size={12} className="text-blue-500" />
                    <span className="text-[10px] font-bold text-blue-700 uppercase tracking-tight">Security Protocol</span>
                  </div>
                  <p className="text-[10px] text-blue-600/80 leading-relaxed">
                    All shared files are scanned for threats. Restricted files require a decryption key for access.
                  </p>
                </div>
              </div>

              {/* Conversation Info */}
              <div className="px-4 py-3 border-b border-gray-100">
                <p className="text-[11px] font-bold text-gray-700 mb-2">Conversation Info</p>
                {[
                  { label: "Channel", val: activeThread.channel || "WhatsApp" },
                  { label: "Started", val: new Date(activeThread.createdAt).toLocaleDateString() },
                  {
                    label: "Last Message",
                    val: activeThread.messages.length > 0
                      ? new Date(activeThread.messages[activeThread.messages.length - 1].createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                      : "-",
                  },
                  { label: "Total Messages", val: activeThread.messages.length.toString() },
                ].map(({ label, val }) => (
                  <div key={label} className="flex items-center justify-between py-1.5 border-b border-gray-50 last:border-0">
                    <span className="text-[10px] text-gray-400">{label}</span>
                    <span className="text-[10px] font-medium text-gray-700">{val}</span>
                  </div>
                ))}
                <div className="flex items-center justify-between py-1.5">
                  <span className="text-[10px] text-gray-400">Status</span>
                  <span className="text-[10px] font-bold bg-green-100 text-green-700 px-2 py-0.5 rounded-full">
                    {activeThread.status || "Active"}
                  </span>
                </div>
              </div>

              {/* Employee Info */}
              <div className="px-4 py-3">
                <p className="text-[11px] font-bold text-gray-700 mb-2">Employee Info</p>
                {[
                  { label: "Employee", val: activeOwner?.name || "-" },
                  { label: "Department", val: activeOwner?.department || "-" },
                  { label: "Role", val: activeOwner?.jobTitle || activeOwner?.role || "-" },
                ].map(({ label, val }) => (
                  <div key={label} className="flex items-center justify-between py-1.5 border-b border-gray-50 last:border-0">
                    <span className="text-[10px] text-gray-400">{label}</span>
                    <span className="text-[10px] font-medium text-gray-700">{val}</span>
                  </div>
                ))}
                <button className="w-full mt-2 text-[11px] text-blue-600 border border-blue-200 rounded-lg py-1.5 hover:bg-blue-50 transition-colors">
                  View Employee Profile
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ── Unlock Modal ── */}
      <AnimatePresence>
        {showUnlockModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-3xl shadow-2xl w-full max-w-sm overflow-hidden"
            >
              <div className="p-8 text-center">
                <div className="w-16 h-16 rounded-full bg-red-50 flex items-center justify-center mx-auto mb-6 border-2 border-red-100">
                  <Lock size={30} className="text-red-500" />
                </div>
                <h3 className="text-xl font-black text-gray-800 uppercase tracking-tighter mb-2">Restricted File</h3>
                <p className="text-sm text-gray-500 mb-8 px-4">
                  This file is encrypted. Please enter the unique access code to download.
                </p>
                <div className="space-y-4">
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                      <Key size={18} />
                    </span>
                    <input
                      type="text"
                      placeholder="ENTER ACCESS CODE"
                      value={unlockKey}
                      onChange={e => setUnlockKey(e.target.value)}
                      maxLength={12}
                      className="input input-bordered w-full pl-12 h-14 bg-gray-50 font-mono text-center tracking-[0.3em] font-bold text-lg rounded-2xl border-gray-100 focus:border-blue-400 transition-all"
                    />
                  </div>
                  <div className="flex gap-3">
                    <button
                      onClick={() => { setShowUnlockModal(null); setUnlockKey(""); }}
                      className="btn btn-ghost flex-1 h-14 rounded-2xl font-bold uppercase tracking-widest text-xs"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => handleUnlock(showUnlockModal)}
                      disabled={unlocking || !unlockKey}
                      className="btn btn-primary flex-1 h-14 rounded-2xl font-black uppercase tracking-widest text-xs shadow-lg shadow-blue-200"
                    >
                      {unlocking ? <span className="loading loading-spinner loading-xs" /> : "Unlock File"}
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}