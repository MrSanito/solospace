"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { MessageSquare, FileText, LayoutDashboard, LogOut, Paperclip, Download, Menu, X, RefreshCw, Search } from "lucide-react";
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
    }
    fetchChat();
  }, []);

  const fetchChat = async () => {
    try {
      const res = await fetch("/api/chat/lead");
      if (res.ok) {
        const data = await res.json();
        setThread(data);
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

  const filteredMessages = thread?.messages?.filter((m: any) => 
    m.content.toLowerCase().includes(searchQuery.toLowerCase())
  ) || [];

  const attachments = thread?.messages?.reduce((acc: any[], m: any) => {
    if (m.attachments) return [...acc, ...m.attachments];
    return acc;
  }, []) || [];

  const handleLogout = () => {
    localStorage.removeItem("lead_info");
    router.push("/leadlogin");
  };

  const assignedOwner = thread?.lead?.owner || leadData?.owner;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col md:flex-row">
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
                <p className="text-gray-400 text-xs font-black uppercase tracking-widest mb-1">Relationship Manager</p>
                <div className="flex items-center gap-3 mt-1">
                  <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-[10px] text-white font-bold">
                    {assignedOwner?.name?.charAt(0) || "M"}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-gray-800">{assignedOwner?.name || "Assigning..."}</p>
                    <p className="text-[10px] text-gray-500 uppercase font-bold">{assignedOwner?.jobTitle || "Relationship Manager"}</p>
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
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex-1 flex flex-col h-full bg-white md:bg-transparent overflow-hidden">
            <div className="bg-white md:rounded-3xl border-0 md:border border-gray-100 shadow-none md:shadow-sm overflow-hidden flex flex-col flex-1 h-full relative">
              <div className="p-4 border-b border-gray-100 flex flex-col gap-3 bg-gray-50/50">
                <div className="flex justify-between items-center">
                    <div className="flex items-center gap-3">
                        <div className="relative">
                            <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold text-sm shadow-md">
                                {assignedOwner?.name?.charAt(0) || "M"}
                            </div>
                            <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 border-2 border-white rounded-full" />
                        </div>
                        <div>
                            <h3 className="font-bold text-gray-800 text-sm">{assignedOwner?.name || "Sales Manager"}</h3>
                            <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">{assignedOwner?.jobTitle || "Relationship Manager"}</p>
                        </div>
                    </div>
                    <button 
                    onClick={fetchChat}
                    className="text-blue-500 text-[10px] font-black uppercase tracking-widest hover:underline flex items-center gap-1 bg-white px-3 py-1.5 rounded-lg border border-gray-100 shadow-sm transition-all hover:shadow-md"
                    >
                    <RefreshCw size={10} /> Refresh
                    </button>
                </div>
                <div className="relative">
                    <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input 
                        type="text" 
                        placeholder="Search messages..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full bg-white border border-gray-100 rounded-xl pl-9 pr-4 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/20 font-medium"
                    />
                </div>
              </div>
              
              <div className="flex-1 p-6 bg-gray-50/20 space-y-4 overflow-y-auto flex flex-col">
                {!filteredMessages.length && (
                  <div className="flex flex-col items-center justify-center h-full text-center p-8">
                    <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mb-6 relative">
                      <MessageSquare className="text-blue-200" size={40} />
                      <div className="absolute -top-1 -right-1 w-6 h-6 bg-blue-600 rounded-full border-2 border-white flex items-center justify-center text-white text-[10px] font-bold">!</div>
                    </div>
                    <h4 className="font-bold text-gray-800 mb-2">
                        {searchQuery ? "No matches found" : `Start chatting with ${assignedOwner?.name || "our team"}`}
                    </h4>
                    <p className="text-gray-400 text-xs max-w-xs mx-auto leading-relaxed">
                        {searchQuery 
                            ? "Try searching for a different keyword or check your spelling." 
                            : `Send your first message to ${assignedOwner?.name || "us"} to discuss your project requirements or ask any questions.`}
                    </p>
                  </div>
                )}

                {filteredMessages.map((msg: any) => (
                  <div 
                    key={msg.id} 
                    className={`flex ${msg.senderType === "LEAD" ? "justify-end" : "justify-start"}`}
                  >
                    <div 
                      className={`p-3 md:p-4 rounded-2xl shadow-sm border max-w-[90%] md:max-w-md ${
                        msg.senderType === "LEAD" 
                          ? "bg-blue-600 text-white border-blue-500 rounded-tr-none" 
                          : "bg-white text-gray-800 border-gray-100 rounded-tl-none"
                      }`}
                    >
                      <p className="text-sm font-medium">{msg.content}</p>
                      
                      {msg.attachments?.map((file: any) => (
                        <div key={file.id} className={`mt-3 p-3 rounded-xl border flex items-center gap-3 ${msg.senderType === "LEAD" ? "bg-white/10 border-white/20" : "bg-gray-50 border-gray-100"}`}>
                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${msg.senderType === "LEAD" ? "bg-white/20 text-white" : "bg-blue-100 text-blue-600"}`}>
                                <FileText size={16} />
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className={`text-[10px] font-bold truncate ${msg.senderType === "LEAD" ? "text-white" : "text-gray-800"}`}>{file.fileName}</p>
                                <a href={file.fileUrl} target="_blank" rel="noopener noreferrer" className={`text-[9px] font-black uppercase tracking-widest hover:underline ${msg.senderType === "LEAD" ? "text-blue-200" : "text-blue-500"}`}>Download</a>
                            </div>
                        </div>
                      ))}

                      <span className={`text-[10px] mt-2 block ${msg.senderType === "LEAD" ? "text-blue-100" : "text-gray-400"}`}>
                        {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              <form onSubmit={handleSendMessage} className="p-4 md:p-6 border-t border-gray-100 bg-white space-y-3 shrink-0 pb-[calc(1rem+env(safe-area-inset-bottom))]">
                <div className="flex gap-2">
                    <button 
                        type="button"
                        disabled={uploading}
                        onClick={() => document.getElementById("file-upload")?.click()}
                        className="p-3 rounded-2xl bg-gray-50 text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-all border border-gray-100 disabled:opacity-50"
                        title="Attach File"
                    >
                        {uploading ? (
                            <span className="loading loading-spinner loading-xs" />
                        ) : (
                            <Paperclip size={20} />
                        )}
                    </button>
                    <input 
                    type="text" 
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Type your message..." 
                    className="flex-1 bg-gray-50 border-gray-100 rounded-2xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all font-medium"
                    />
                    <button 
                    type="submit"
                    disabled={loading || !newMessage.trim()}
                    className="p-3 rounded-2xl bg-blue-600 text-white hover:bg-blue-700 transition-all disabled:opacity-50 shadow-md shadow-blue-500/20"
                    >
                    {loading ? (
                        <span className="loading loading-spinner loading-xs" />
                    ) : (
                        <svg className="w-5 h-5 rotate-90" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                        </svg>
                    )}
                    </button>
                </div>
              </form>
            </div>
          </motion.div>
        )}

        {activeTab === "documents" && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-gray-800">Project Documents</h2>
                <button 
                    onClick={() => document.getElementById("file-upload")?.click()}
                    className="bg-blue-600 text-white font-black uppercase tracking-widest text-[10px] px-4 py-2 rounded-xl"
                >
                    Upload New
                </button>
            </div>
            
            {attachments.length === 0 ? (
                <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-12 text-center">
                    <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                        <FileText className="text-gray-200" size={40} />
                    </div>
                    <h3 className="font-bold text-gray-800 mb-2">No documents shared yet</h3>
                    <p className="text-gray-500 text-sm max-w-xs mx-auto">Any files shared in the chat or uploaded by your manager will appear here.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {attachments.map((file: any) => (
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

