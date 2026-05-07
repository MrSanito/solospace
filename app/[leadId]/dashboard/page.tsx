"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { MessageSquare, FileText, LayoutDashboard, LogOut, Paperclip, Download, Menu, X, RefreshCw, Search, Phone, MoreVertical, Shield, Smile, Send } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast, Toaster } from "react-hot-toast";

export default function LeadDashboard() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [leadData, setLeadData] = useState<any>(null);
  const [thread, setThread] = useState<any>(null);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<"overview" | "messages" | "documents">("overview");
  const router = useRouter();

  useEffect(() => {
    const storedLead = localStorage.getItem("lead_info");
    if (storedLead) {
      setLeadData(JSON.parse(storedLead));
    } else {
      router.push("/login");
    }
    fetchChat();
  }, []);

  const fetchChat = async () => {
    try {
      const res = await fetch("/api/chat/lead");
      if (res.ok) {
        const data = await res.json();
        setThread(data);
      } else if (res.status === 401) {
        localStorage.removeItem("lead_info");
        router.push("/login");
      }
    } catch (e) {
      console.error("Failed to fetch chat");
    }
  };

  const [uploading, setUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const handleFileUpload = async (file: File) => {
    const uploadToast = toast.loading("Uploading file...");
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
        toast.success("File uploaded!", { id: uploadToast });
        // Immediately send as a message if it's just a file
        await handleSendMessage(undefined, [{
            fileName: data.fileName,
            fileUrl: data.url,
            fileType: data.fileType,
            fileSize: data.fileSize
        }]);
        setSelectedFile(null);
      } else {
        const err = await res.json();
        toast.error(`Upload failed: ${err.error}`, { id: uploadToast });
      }
    } catch (e) {
      console.error("Upload failed");
      toast.error("Upload failed", { id: uploadToast });
    } finally {
      setUploading(false);
    }
  };

  const handleSendMessage = async (e?: React.FormEvent, attachments?: any[]) => {
    if (e) e.preventDefault();
    if (!newMessage.trim() && (!attachments || attachments.length === 0)) return;
    if (loading) return;

    setLoading(true);
    try {
      const res = await fetch("/api/chat/lead", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
            content: newMessage,
            attachments: attachments || []
        }),
      });

      if (res.ok) {
        setNewMessage("");
        fetchChat();
        if (attachments && attachments.length > 0) {
            toast.success("Attachment sent");
        }
      } else {
        toast.error("Failed to send message");
      }
    } catch (e) {
      console.error("Failed to send message");
      toast.error("Error sending message");
    } finally {
      setLoading(false);
    }
  };

  // WhatsApp SVG icon from oversight
  const WhatsAppIcon = () => (
    <svg viewBox="0 0 24 24" width="16" height="16" fill="#25D366">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
    </svg>
  );

  const getFileColor = (name: string) => {
    const ext = name.split('.').pop()?.toLowerCase();
    if (['jpg', 'jpeg', 'png', 'gif'].includes(ext || '')) return "bg-rose-500";
    if (['pdf'].includes(ext || '')) return "bg-orange-500";
    if (['doc', 'docx'].includes(ext || '')) return "bg-blue-500";
    if (['xls', 'xlsx'].includes(ext || '')) return "bg-emerald-500";
    return "bg-slate-500";
  };

  const getFileLabel = (name: string) => {
    const ext = name.split('.').pop()?.toLowerCase();
    if (['jpg', 'jpeg', 'png', 'gif'].includes(ext || '')) return "Image";
    if (['pdf'].includes(ext || '')) return "PDF Document";
    if (['doc', 'docx'].includes(ext || '')) return "Word Doc";
    if (['xls', 'xlsx'].includes(ext || '')) return "Excel Sheet";
    return "File";
  };

  const formatFileSize = (bytes: number) => {
    if (!bytes) return "0 KB";
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1048576) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / 1048576).toFixed(1) + " MB";
  };

  const formatRole = (role: string) => {
    if (!role) return "Support";
    return role.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()).join(' ');
  };

  // Auto-refresh every 5 seconds for lead chat
  useEffect(() => {
    const interval = setInterval(() => {
      if (document.visibilityState === "visible" && activeTab === "messages") {
        fetchChat();
      }
    }, 5000);
    return () => clearInterval(interval);
  }, [activeTab]);

  useEffect(() => {
    const el = document.getElementById("messages-end");
    el?.scrollIntoView({ behavior: "smooth" });
  }, [thread?.messages]);

  const filteredMessages = thread?.messages?.filter((m: any) => 
    m.content.toLowerCase().includes(searchQuery.toLowerCase())
  ) || [];

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/lead/logout", { method: "POST" });
    } catch (e) {
      console.error("Logout API failed");
    }
    localStorage.removeItem("lead_info");
    router.push("/login");
  };

  const assignedOwner = thread?.lead?.owner || leadData?.owner;

  return (
    <div className="h-screen bg-gray-50 flex flex-col md:flex-row overflow-hidden">
      <Toaster position="top-right" />
      
      {/* Mobile Header */}
      <header className="md:hidden bg-slate-900 text-white p-4 flex justify-between items-center sticky top-0 z-50">
        <div className="flex items-center gap-2">
          <span className="text-xl font-black tracking-widest text-blue-400">SPACE</span>
          <span className="text-[8px] font-bold uppercase tracking-widest text-blue-200 mt-1">Portal</span>
        </div>
        <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="p-2">
          {isSidebarOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </header>

      {/* Sidebar */}
      <aside className={`
        fixed inset-0 z-40 bg-slate-900 text-white flex flex-col p-6 transition-transform duration-300 transform
        md:relative md:translate-x-0 md:w-64 md:h-screen md:sticky md:top-0
        ${isSidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}
      `}>
        <div className="hidden md:flex items-center gap-2 mb-10">
          <span className="text-2xl font-black tracking-widest text-blue-400">SPACE</span>
          <span className="text-[10px] font-bold uppercase tracking-widest text-blue-200 mt-1">Portal</span>
        </div>

        <nav className="flex-1 space-y-2 mt-12 md:mt-0">
          <button 
            onClick={() => { setActiveTab("overview"); setIsSidebarOpen(false); }}
            className={`flex items-center gap-3 w-full p-3 rounded-xl font-semibold transition-all ${activeTab === "overview" ? "bg-blue-600 text-white shadow-lg shadow-blue-500/20" : "text-slate-400 hover:bg-slate-800 hover:text-white"}`}
          >
            <LayoutDashboard size={20} />
            Overview
          </button>
          <button 
            onClick={() => { setActiveTab("messages"); setIsSidebarOpen(false); }}
            className={`flex items-center gap-3 w-full p-3 rounded-xl font-semibold transition-all ${activeTab === "messages" ? "bg-blue-600 text-white shadow-lg shadow-blue-500/20" : "text-slate-400 hover:bg-slate-800 hover:text-white"}`}
          >
            <MessageSquare size={20} />
            Messages
          </button>
          <button 
            onClick={() => { setActiveTab("documents"); setIsSidebarOpen(false); }}
            className={`flex items-center gap-3 w-full p-3 rounded-xl font-semibold transition-all ${activeTab === "documents" ? "bg-blue-600 text-white shadow-lg shadow-blue-500/20" : "text-slate-400 hover:bg-slate-800 hover:text-white"}`}
          >
            <FileText size={20} />
            Documents
          </button>
        </nav>

        <button 
          onClick={handleLogout}
          className="flex items-center gap-3 w-full p-3 rounded-xl text-red-400 hover:bg-red-500/10 transition-all mt-auto"
        >
          <LogOut size={20} />
          Sign Out
        </button>
      </aside>

      {/* Main Content */}
      <main className={`flex-1 overflow-hidden flex flex-col ${activeTab === "messages" ? "p-0" : "p-4 md:p-8"}`}>
        {activeTab !== "messages" && (
          <header className="flex justify-between items-center mb-8 shrink-0">
            <div>
              <h1 className="text-2xl font-bold text-gray-800">Welcome, {leadData?.name || "Lead"}!</h1>
              <p className="text-gray-500 text-sm">Tracking your project with {leadData?.organization || "us"}</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-sm font-bold text-gray-800">{leadData?.name}</p>
                <p className="text-xs text-gray-500">ID: L-{leadData?.id?.slice(0, 5).toUpperCase()}</p>
              </div>
              <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold border-2 border-white shadow-sm">
                {leadData?.name?.charAt(0) || "L"}
              </div>
            </div>
          </header>
        )}

        {activeTab === "overview" && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-8 flex-1 overflow-y-auto p-4 md:p-0">
            {/* Dashboard Cards */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
              <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm transition-transform hover:scale-[1.02]">
                <p className="text-gray-400 text-xs font-black uppercase tracking-widest mb-1">Project Status</p>
                <p className="text-2xl font-bold text-gray-800">{thread?.lead?.stage || "NEW"}</p>
                <div className="w-full bg-gray-100 h-2 rounded-full mt-4 overflow-hidden">
                  <div className="bg-blue-500 h-full w-1/4" />
                </div>
              </div>
              <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm transition-transform hover:scale-[1.02]">
                <p className="text-gray-400 text-xs font-black uppercase tracking-widest mb-1">{formatRole(assignedOwner?.role)}</p>
                <div className="flex items-center gap-3 mt-1">
                  <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-[10px] text-white font-bold">
                    {assignedOwner?.name?.charAt(0) || "M"}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-gray-800">{assignedOwner?.name || "Assigning..."}</p>
                    <p className="text-[10px] text-gray-500 uppercase font-bold">{formatRole(assignedOwner?.role)}</p>
                  </div>
                </div>
              </div>
              <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm transition-transform hover:scale-[1.02]">
                <p className="text-gray-400 text-xs font-black uppercase tracking-widest mb-1">Messages</p>
                <p className="text-2xl font-bold text-gray-800">{thread?.messages?.length || 0}</p>
                <p className="text-gray-400 text-[10px] font-bold uppercase mt-2">Active thread in {thread?.channel || "Portal"}</p>
              </div>
            </div>

            {/* Quick Preview Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm">
                <h3 className="font-bold text-gray-800 mb-6 flex items-center gap-2">
                    <FileText className="text-blue-500" size={18} />
                    Recent Project Updates
                </h3>
                <div className="space-y-6 relative before:absolute before:left-3 before:top-2 before:bottom-2 before:w-[2px] before:bg-gray-50">
                    {thread?.lead?.auditLogs?.length > 0 ? (
                        thread.lead.auditLogs.map((log: any) => (
                            <div key={log.id} className="flex gap-6 relative z-10">
                                <div className="w-6 h-6 rounded-full bg-blue-500 border-4 border-white shadow-sm shrink-0" />
                                <div>
                                    <p className="font-bold text-sm text-gray-800">
                                        {log.action === "STAGE_CHANGED" ? "Status Updated" : log.action === "CHAT" ? "Message Sent" : "Account Update"}
                                    </p>
                                    <p className="text-xs text-gray-500 mt-1">{log.note || "System update processed."}</p>
                                    <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-2 block">
                                        {new Date(log.createdAt).toLocaleDateString()} · {new Date(log.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </span>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="flex gap-6 relative z-10 opacity-50">
                            <div className="w-6 h-6 rounded-full bg-gray-300 border-4 border-white shadow-sm shrink-0" />
                            <div>
                                <p className="font-bold text-sm text-gray-800">Onboarding Started</p>
                                <p className="text-xs text-gray-500 mt-1">Welcome to our portal! Your dedicated manager has been assigned.</p>
                                <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-2 block">Initial System Entry</span>
                            </div>
                        </div>
                    )}
                </div>
              </div>

              <div className="bg-slate-900 p-8 rounded-3xl text-white relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 blur-3xl rounded-full" />
                <h3 className="font-bold text-lg mb-2">Need immediate help?</h3>
                <p className="text-slate-400 text-sm mb-6">Our team is available to discuss your project requirements in detail.</p>
                <button 
                    onClick={() => setActiveTab("messages")}
                    className="bg-white text-slate-900 font-black uppercase tracking-widest text-[10px] px-6 py-3 rounded-xl hover:bg-blue-400 hover:text-white transition-all"
                >
                    Chat with Expert
                </button>
              </div>
            </div>
          </motion.div>
        )}

        {activeTab === "messages" && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex-1 flex flex-col h-full overflow-hidden">
            <div className="flex flex-1 h-full min-h-0 bg-gray-100 overflow-hidden font-sans">
                {/* Sidebar: Support Channels */}
                <div className="hidden lg:flex w-[260px] border-r border-gray-200 bg-white flex-col shrink-0">
                    <div className="p-4 border-b border-gray-100 bg-gray-50/50">
                        <h2 className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">Support Channels</h2>
                    </div>
                    <div className="flex-1 overflow-y-auto">
                        <div className="p-3 space-y-2">
                            {/* Dynamic Participants */}
                            {thread?.participants?.length > 0 ? (
                                thread.participants.map((p: any) => (
                                    <div key={p.id} className="bg-blue-50 border border-blue-100 rounded-2xl p-4 cursor-pointer transition-all shadow-sm">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold text-sm shadow-md">
                                                {p.name?.charAt(0) || "M"}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-bold text-gray-800 truncate">{p.name}</p>
                                                <p className="text-[10px] text-blue-600 font-black uppercase tracking-widest mt-1">{formatRole(p.role)}</p>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="bg-blue-50 border border-blue-100 rounded-2xl p-4 cursor-pointer transition-all shadow-sm">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold text-sm shadow-md">
                                            {assignedOwner?.name?.charAt(0) || "M"}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-bold text-gray-800 truncate">{assignedOwner?.name || "Support Team"}</p>
                                            <p className="text-[10px] text-blue-600 font-black uppercase tracking-widest mt-1">{formatRole(assignedOwner?.role)}</p>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Main Content: Chat View */}
                <div className="flex-1 flex flex-col min-w-0 bg-white">
                    {/* Header */}
                    <div className="h-14 border-b border-gray-200 bg-white flex items-center gap-3 px-4 shrink-0">
                        <div className="lg:hidden w-9 h-9 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold text-sm">
                            {assignedOwner?.name?.charAt(0) || "M"}
                        </div>
                        <div className="flex-1 min-w-0">
                            <h3 className="text-sm font-bold text-gray-800 leading-tight">{assignedOwner?.name || "Support Team"}</h3>
                            <p className="text-[11px] text-gray-400 leading-tight font-medium">
                                Active Now &nbsp;•&nbsp; {formatRole(assignedOwner?.role)}
                            </p>
                        </div>
                        <div className="flex items-center gap-3 text-gray-400">
                            <div className="relative hidden md:block">
                                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                <input 
                                    type="text" 
                                    placeholder="Search..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="bg-gray-100 border-none rounded-full pl-9 pr-4 py-1.5 text-[11px] focus:outline-none focus:ring-2 focus:ring-blue-500/20 font-medium w-32"
                                />
                            </div>
                            <Phone size={16} className="cursor-pointer hover:text-gray-600" />
                            <span className="cursor-pointer hover:opacity-80"><WhatsAppIcon /></span>
                            <MoreVertical size={16} className="cursor-pointer hover:text-gray-600" />
                        </div>
                    </div>

                    {/* Monitoring Banner */}
                    <div className="bg-amber-50 border-b border-amber-100 px-4 py-2 flex items-center gap-2 shrink-0">
                        <Shield size={13} className="text-amber-500 shrink-0" />
                        <p className="text-[11px] text-amber-700 font-medium">This conversation is encrypted and monitored for quality assurance.</p>
                    </div>

                    {/* Messages Area */}
                    <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3 bg-gray-50/40">
                        {!filteredMessages.length ? (
                            <div className="h-full flex flex-col items-center justify-center opacity-40">
                                <MessageSquare size={48} className="text-gray-300 mb-4" />
                                <p className="text-sm font-bold text-gray-400 uppercase tracking-widest">No Messages Found</p>
                            </div>
                        ) : (
                            <>
                                {/* Date divider */}
                                <div className="flex items-center gap-3 my-2">
                                    <div className="flex-1 h-px bg-gray-200" />
                                    <span className="text-[11px] text-gray-400 bg-white border border-gray-200 rounded-full px-3 py-0.5">Today</span>
                                    <div className="flex-1 h-px bg-gray-200" />
                                </div>

                                {filteredMessages.map((msg: any, i: number) => {
                                    const isLead = msg.senderType === "LEAD";
                                    const timeStr = new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                                    const msgInitials = leadData?.name?.split(" ").map((n: string) => n[0]).join("").substring(0, 2).toUpperCase() || "L";
                                    
                                    // Find participant for USER messages
                                    const participant = !isLead ? thread.participants?.find((p: any) => p.id === msg.senderId) || assignedOwner : null;
                                    const userInitials = participant?.name?.charAt(0) || "M";

                                    return (
                                        <motion.div 
                                            key={msg.id} 
                                            initial={{ opacity: 0, y: 8 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: i * 0.015 }}
                                            className={`flex ${isLead ? "justify-end" : "justify-start"} items-end gap-2`}
                                        >
                                            {!isLead && (
                                                <div className="w-7 h-7 rounded-full bg-blue-600 text-white font-bold text-[10px] flex items-center justify-center shrink-0 mb-0.5" title={participant?.name}>
                                                    {userInitials}
                                                </div>
                                            )}

                                            <div className={`max-w-[68%] flex flex-col ${isLead ? "items-end" : "items-start"}`}>
                                                {!isLead ? (
                                                    <span className="text-[10px] font-bold text-blue-600 mb-1 px-1">
                                                        {participant?.name || "Support Team"}
                                                    </span>
                                                ) : (
                                                    <span className="text-[10px] font-bold text-gray-500 mb-1 px-1">
                                                        {leadData?.name || "You"}
                                                    </span>
                                                )}
                                                <div className={`px-3.5 py-2.5 rounded-2xl text-xs leading-relaxed shadow-sm border ${
                                                    isLead 
                                                        ? "bg-blue-600 text-white border-blue-500 rounded-br-sm" 
                                                        : "bg-white text-gray-700 border-gray-100 rounded-bl-sm"
                                                }`}>
                                                    <p className="whitespace-pre-wrap font-medium">{msg.content}</p>
                                                    
                                                    {msg.attachments?.map((file: any) => (
                                                        <div key={file.id} className={`mt-2 flex items-center gap-2 p-2 rounded-xl border ${isLead ? "bg-blue-500 border-blue-400" : "bg-gray-50 border-gray-100"}`}>
                                                            <div className={`flex items-center justify-center w-8 h-8 rounded-lg ${getFileColor(file.fileName)} shrink-0`}>
                                                                <FileText size={14} className="text-white" />
                                                            </div>
                                                            <div className="flex-1 min-w-0">
                                                                <p className={`text-[10px] font-semibold truncate ${isLead ? "text-white" : "text-gray-700"}`}>{file.fileName}</p>
                                                                <p className={`text-[9px] mt-0.5 ${isLead ? "text-blue-200" : "text-gray-400"}`}>
                                                                    {getFileLabel(file.fileName)} • {formatFileSize(file.fileSize)}
                                                                </p>
                                                                <div className="flex items-center gap-2 mt-1">
                                                                    <a href={file.fileUrl} target="_blank" rel="noopener noreferrer" className={`text-[9px] hover:underline font-bold flex items-center gap-1 ${isLead ? "text-white" : "text-blue-600"}`}>
                                                                        <Download size={9} /> Download
                                                                    </a>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                                
                                                <div className={`flex items-center gap-1.5 mt-1 ${isLead ? "justify-end" : ""}`}>
                                                    <span className="text-[10px] text-gray-400">{timeStr}</span>
                                                    {isLead && (
                                                        <svg width="14" height="10" viewBox="0 0 14 10" className="text-blue-400">
                                                            <path d="M1 5l3 3 5-7" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round" />
                                                            <path d="M5 5l3 3 5-7" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round" />
                                                        </svg>
                                                    )}
                                                </div>
                                            </div>

                                            {isLead && (
                                                <div className="w-7 h-7 rounded-full bg-blue-100 text-blue-700 font-bold text-[10px] flex items-center justify-center shrink-0 mb-0.5">
                                                    {msgInitials}
                                                </div>
                                            )}
                                        </motion.div>
                                    );
                                })}
                            </>
                        )}
                        <div id="messages-end" />
                    </div>

                    {/* WhatsApp import notice */}
                    <div className="flex items-center justify-center gap-2 py-1.5 bg-gray-50 border-t border-gray-100 shrink-0">
                        <WhatsAppIcon />
                        <span className="text-[11px] text-gray-400 font-medium uppercase tracking-widest text-[9px]">Portal Synchronized</span>
                    </div>

                    {/* Input Bar */}
                    <div className="border-t border-gray-200 bg-white shrink-0 pb-[env(safe-area-inset-bottom)]">
                        <form onSubmit={handleSendMessage} className="flex items-center gap-2 px-3 py-2.5">
                            <button 
                                type="button"
                                disabled={uploading}
                                onClick={() => document.getElementById("file-upload")?.click()}
                                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-xl transition-all disabled:opacity-50"
                                title="Attach File"
                            >
                                {uploading ? <span className="loading loading-spinner loading-xs" /> : <Paperclip size={18} />}
                            </button>

                            <div className="flex-1 flex items-center bg-gray-100 rounded-2xl px-4 py-2.5 gap-2 focus-within:ring-2 focus-within:ring-blue-500/10 transition-all">
                                <input 
                                    type="text" 
                                    value={newMessage}
                                    onChange={(e) => setNewMessage(e.target.value)}
                                    placeholder="Type your message..." 
                                    className="flex-1 bg-transparent text-xs text-gray-700 placeholder:text-gray-400 outline-none font-medium"
                                />
                                <button type="button" className="text-gray-400 hover:text-gray-600 shrink-0">
                                    <Smile size={17} />
                                </button>
                            </div>

                            <button 
                                type="submit"
                                disabled={loading || (!newMessage.trim() && !uploading)}
                                className="w-10 h-10 rounded-full bg-blue-600 hover:bg-blue-700 flex items-center justify-center text-white transition-colors disabled:opacity-50 shadow-lg shadow-blue-500/20 shrink-0"
                            >
                                {loading ? <span className="loading loading-spinner loading-xs" /> : <Send size={16} />}
                            </button>
                        </form>
                    </div>
                </div>

                {/* Right Sidebar: Shared Files */}
                <div className="hidden xl:flex w-[280px] border-l border-gray-200 bg-white flex-col shrink-0 overflow-y-auto">
                    <div className="p-6 border-b border-gray-100">
                        <div className="w-16 h-16 rounded-3xl bg-blue-50 flex items-center justify-center text-blue-600 font-bold text-xl mx-auto mb-4 border-2 border-white shadow-sm">
                            {leadData?.name?.charAt(0) || "L"}
                        </div>
                        <h4 className="text-center font-bold text-gray-800 text-sm">{leadData?.name}</h4>
                        <p className="text-center text-[10px] text-gray-400 font-bold uppercase tracking-[0.1em] mt-1">{thread?.lead?.stage || "Active Lead"}</p>
                    </div>

                    <div className="flex-1 p-6 space-y-8">
                        <div>
                            <div className="flex items-center justify-between mb-4">
                                <h5 className="text-[10px] font-black uppercase tracking-[0.15em] text-gray-400">Shared Files</h5>
                                <span className="bg-blue-50 text-blue-600 text-[9px] font-black px-2 py-0.5 rounded-full">{thread?.sharedFiles?.length || 0}</span>
                            </div>
                            
                            <div className="space-y-3">
                                {thread?.sharedFiles?.length > 0 ? (
                                    thread.sharedFiles.map((file: any) => (
                                        <div key={file.id} className="p-3 rounded-2xl border border-gray-100 bg-white hover:border-blue-200 transition-all group">
                                            <div className="flex items-start gap-3">
                                                <div className={`w-8 h-8 rounded-xl flex items-center justify-center text-white shrink-0 ${getFileColor(file.fileName)}`}>
                                                    <FileText size={16} />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-[11px] font-bold text-gray-800 truncate">{file.fileName}</p>
                                                    <div className="flex items-center gap-2 mt-0.5">
                                                        <span className={`text-[8px] font-black px-1.5 py-0.5 rounded uppercase ${file.source === 'NOTE' ? 'bg-amber-50 text-amber-600' : 'bg-blue-50 text-blue-600'}`}>
                                                            {file.source || 'CHAT'}
                                                        </span>
                                                        <span className="text-[8px] text-gray-400 font-bold">{(file.fileSize / 1024).toFixed(0)} KB</span>
                                                    </div>
                                                </div>
                                            </div>
                                            <a 
                                                href={file.fileUrl} 
                                                target="_blank" 
                                                rel="noopener noreferrer"
                                                className="mt-3 w-full bg-gray-50 hover:bg-blue-600 hover:text-white text-gray-600 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all text-center flex items-center justify-center gap-2"
                                            >
                                                <Download size={10} /> Download
                                            </a>
                                        </div>
                                    ))
                                ) : (
                                    <div className="py-8 text-center bg-gray-50 rounded-3xl border border-dashed border-gray-200">
                                        <FileText size={24} className="mx-auto text-gray-300 mb-2" />
                                        <p className="text-[10px] text-gray-400 font-bold uppercase">No files shared</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div>
                            <h5 className="text-[10px] font-black uppercase tracking-[0.15em] text-gray-400 mb-4">{formatRole(assignedOwner?.role)}</h5>
                            <div className="bg-gray-50 rounded-2xl p-4 border border-gray-100">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white text-[10px] font-bold">
                                        {assignedOwner?.name?.charAt(0) || "M"}
                                    </div>
                                    <div>
                                        <p className="text-xs font-bold text-gray-800">{assignedOwner?.name || "Assigning..."}</p>
                                        <p className="text-[9px] text-gray-500 font-medium">{formatRole(assignedOwner?.role)}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
          </motion.div>
        )}

        {activeTab === "documents" && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6 flex-1 overflow-y-auto p-4 md:p-0">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-gray-800">Project Documents</h2>
                <button 
                    onClick={() => document.getElementById("file-upload")?.click()}
                    className="bg-blue-600 text-white font-black uppercase tracking-widest text-[10px] px-4 py-2 rounded-xl"
                >
                    Upload New
                </button>
            </div>
            
            {(thread?.sharedFiles || []).length === 0 ? (
                <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-12 text-center">
                    <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                        <FileText className="text-gray-200" size={40} />
                    </div>
                    <h3 className="font-bold text-gray-800 mb-2">No documents shared yet</h3>
                    <p className="text-gray-500 text-sm max-w-xs mx-auto">Any files shared in the chat or uploaded by your manager will appear here.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {thread.sharedFiles.map((file: any) => (
                        <div key={file.id} className="bg-white p-5 rounded-3xl border border-gray-100 shadow-sm flex items-start gap-4 hover:border-blue-200 transition-all group">
                            <div className="w-12 h-12 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-500 group-hover:bg-blue-500 group-hover:text-white transition-all">
                                <FileText size={24} />
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="font-bold text-sm text-gray-800 truncate">{file.fileName || "Unnamed File"}</p>
                                <p className="text-[10px] text-gray-400 font-bold uppercase mt-1">{(file.fileSize / 1024).toFixed(1)} KB · {new Date(file.createdAt).toLocaleDateString()}</p>
                                <a 
                                    href={file.fileUrl} 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    className="text-blue-500 text-[10px] font-black uppercase tracking-widest mt-3 block hover:underline"
                                >
                                    Download File
                                </a>
                            </div>
                        </div>
                    ))}
                </div>
            )}
          </motion.div>
        )}
      </main>

      {/* Global Hidden File Input */}
      <input 
          type="file" 
          id="file-upload" 
          className="hidden" 
          onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) handleFileUpload(file);
          }}
      />
    </div>
  );
}

