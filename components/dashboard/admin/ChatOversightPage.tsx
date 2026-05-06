"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  Filter,
  ChevronLeft,
  ChevronRight,
  FileText,
  MoreHorizontal,
  Lock,
  Download,
  Eye,
  RefreshCw,
  MessageSquare,
  Paperclip,
  Key,
} from "lucide-react";

const slideInRight = {
  initial: { opacity: 0, x: 40 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: 40 },
};

export default function ChatOversightPage() {
  const [selected, setSelected] = useState<number | null>(0);
  const [threads, setThreads] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [newMessage, setNewMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);

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

  const fetchThreads = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/chat/oversight");
      if (res.ok) {
        const data = await res.json();
        setThreads(data);
      }
    } catch (error) {
      console.error("Failed to fetch chat threads:", error);
    } finally {
      setLoading(false);
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
        // Immediately send as a message if it's just a file
        await handleSendMessage(undefined, [{
            fileName: data.fileName,
            fileUrl: data.url,
            fileType: data.fileType,
            fileSize: data.fileSize
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
          attachments: attachments || []
        }),
      });

      if (res.ok) {
        setNewMessage("");
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

  const activeThread = selected !== null ? filteredThreads[selected] : null;
  const activeLead = activeThread?.lead;
  const activeOwner = activeLead?.owner;

  const initials = activeLead?.contactName
    ? activeLead.contactName.split(" ").map((n: string) => n[0]).join("").substring(0, 2).toUpperCase()
    : "NA";

  return (
    <div className="flex flex-1 h-full min-h-0 bg-gray-50 overflow-hidden">
      <div className="flex flex-1 h-full min-h-0">
        {/* Conversations list */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.35 }}
          className={`w-full md:w-72 border-r border-gray-200 bg-white flex flex-col shrink-0 ${selected !== null ? "hidden md:flex" : "flex"}`}
        >
          <div className="p-4 border-b border-gray-100">
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm font-bold text-gray-800">Conversations</p>
              <div className="flex gap-2">
                <RefreshCw size={14} className="text-gray-400 cursor-pointer hover:text-gray-600" onClick={fetchThreads} />
                <Filter size={14} className="text-gray-400 cursor-pointer hover:text-gray-600" />
              </div>
            </div>
            <div className="flex gap-2 text-xs">
              {[`All (${filteredThreads.length})`, "Employees", "Leads"].map((t, i) => (
                <button key={t} className={`px-2.5 py-1 rounded-full font-medium transition-colors ${i === 0 ? "bg-blue-600 text-white" : "text-gray-500 hover:bg-gray-100"}`}>{t}</button>
              ))}
            </div>
            <div className="mt-3 flex items-center gap-2 bg-gray-100 rounded-lg px-3 py-2">
              <Search size={12} className="text-gray-400" />
              <input 
                className="bg-transparent text-xs text-gray-500 placeholder:text-gray-400 outline-none flex-1" 
                placeholder="Search conversations..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto">
            {loading ? (
              <div className="p-4 text-center text-xs text-gray-500">Loading conversations...</div>
            ) : filteredThreads.length === 0 ? (
              <div className="p-4 text-center text-xs text-gray-500">No conversations found.</div>
            ) : (
              filteredThreads.map((thread, i) => {
                const leadInitials = thread.lead.contactName.split(" ").map((n: string) => n[0]).join("").substring(0, 2).toUpperCase();
                const lastMessage = thread.messages.length > 0 ? thread.messages[thread.messages.length - 1] : null;
                const timeStr = lastMessage ? new Date(lastMessage.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "";
                
                return (
                  <motion.div
                    key={thread.id}
                    whileHover={{ backgroundColor: "#f8fafc" }}
                    onClick={() => setSelected(i)}
                    className={`flex items-start gap-3 px-4 py-3 border-b border-gray-50 cursor-pointer transition-colors ${selected === i ? "bg-blue-50 border-l-2 border-l-blue-500" : ""}`}
                  >
                    <div className="w-9 h-9 rounded-full bg-blue-100 text-blue-700 font-bold text-xs flex items-center justify-center shrink-0">{leadInitials}</div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-center mb-0.5">
                        <p className="text-xs font-semibold text-gray-800 truncate">{thread.lead.contactName}</p>
                        <span className="text-[10px] text-gray-400 shrink-0">{timeStr}</span>
                      </div>
                      <p className="text-[11px] text-gray-500 truncate">{thread.lead.owner?.name || "Unassigned"}</p>
                      <div className="flex items-center justify-between mt-0.5">
                        <p className="text-[11px] text-gray-400 truncate flex-1">{lastMessage ? lastMessage.content : "No messages"}</p>
                      </div>
                    </div>
                  </motion.div>
                );
              })
            )}
          </div>

          <div className="p-3 border-t border-gray-100 flex items-center gap-2 text-xs text-gray-400">
            <ChevronLeft size={14} className="cursor-pointer hover:text-gray-600" />
            {[1].map(n => <button key={n} className={`w-6 h-6 rounded ${n === 1 ? "bg-blue-600 text-white" : "hover:bg-gray-100"}`}>{n}</button>)}
            <ChevronRight size={14} className="cursor-pointer hover:text-gray-600 ml-auto" />
          </div>
        </motion.div>

        {/* Chat view */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.15 }}
          className={`flex-1 flex flex-col min-w-0 ${selected === null ? "hidden md:flex" : "flex"}`}
        >
          {activeThread ? (
            <>
              <div className="h-14 border-b border-gray-200 bg-white flex items-center gap-3 px-4 shrink-0">
                <button 
                    onClick={() => setSelected(null)} 
                    className="md:hidden p-2 -ml-2 text-gray-500"
                >
                    <ChevronLeft size={20} />
                </button>
                <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 font-bold text-xs flex items-center justify-center">{initials}</div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-bold text-gray-800">{activeLead?.contactName}</p>
                    <div className="w-2 h-2 rounded-full bg-green-500" />
                  </div>
                  <p className="text-[11px] text-gray-400">Lead ID: {activeLead?.id.split('-')[0].toUpperCase() || "NA"} · Project: {activeLead?.project || "None"}</p>
                </div>
                <button className="flex items-center gap-1.5 text-xs text-blue-600 border border-blue-200 rounded-lg px-3 py-1.5 hover:bg-blue-50 transition-colors">
                  <FileText size={12} /> View Lead Details
                </button>
                <MoreHorizontal size={16} className="text-gray-400 cursor-pointer" />
              </div>

              <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50/50">
                {activeThread.messages.length === 0 ? (
                  <div className="text-center text-[11px] text-gray-400 py-8">No messages in this conversation.</div>
                ) : (
                  <>
                    <div className="text-center text-[11px] text-gray-400 bg-white border border-gray-100 rounded-full px-3 py-1 w-fit mx-auto">Conversation History</div>
                    {activeThread.messages.map((m: any, i: number) => {
                      const timeStr = new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                      const isLead = m.senderType === "LEAD";

                      return (
                        <motion.div
                          key={m.id || i}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: i * 0.02 }}
                          className={`flex ${isLead ? "justify-start" : "justify-end"}`}
                        >
                          {isLead && <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 font-bold text-[10px] flex items-center justify-center mr-2 shrink-0 self-end">{initials}</div>}
                          <div className={`max-w-xs px-3 py-2.5 rounded-2xl text-xs leading-relaxed shadow-sm border ${isLead ? "bg-white border-gray-200 text-gray-700 rounded-bl-sm" : "bg-blue-600 border-blue-500 text-white rounded-br-sm"}`}>
                            {m.content && m.content.split('\n').map((line: string, j: number) => <p key={j}>{line}</p>)}
                            
                            {m.attachments?.map((file: any) => (
                              <div key={file.id} className={`mt-2 p-2 rounded-lg border flex items-center gap-2 ${!isLead ? "bg-blue-700 border-blue-500" : "bg-gray-50 border-gray-100"}`}>
                                  <FileText size={12} className={!isLead ? "text-blue-100" : "text-gray-400"} />
                                  <div className="flex-1 min-w-0">
                                      <p className={`text-[10px] font-medium truncate ${!isLead ? "text-white" : "text-gray-700"}`}>{file.fileName}</p>
                                      
                                      <div className="flex items-center gap-2 mt-1">
                                        {file.isRestricted && (
                                          <div className="relative">
                                            {showKeyForAtt === file.id ? (
                                              <span className="absolute left-full ml-2 top-1/2 -translate-y-1/2 font-mono text-[9px] font-black bg-white text-blue-600 px-1.5 py-0.5 rounded shadow-xl whitespace-nowrap z-10 border border-blue-100">
                                                KEY: {file.accessKey}
                                              </span>
                                            ) : null}
                                            <button 
                                              type="button"
                                              onClick={() => setShowKeyForAtt(showKeyForAtt === file.id ? null : file.id)}
                                              className={`flex items-center gap-1 text-[9px] font-bold ${!isLead ? "text-blue-200 hover:text-white" : "text-gray-500 hover:text-gray-800"}`}
                                              title="Get Access Key"
                                            >
                                              <Key size={10} /> Get Code
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
                                            <Download size={10} /> Open
                                          </a>
                                        ) : (
                                          <button 
                                            type="button"
                                            onClick={() => setShowUnlockModal(file.id)}
                                            className={`text-[9px] font-bold flex items-center gap-1 ${!isLead ? "text-red-200 hover:text-red-100" : "text-red-500 hover:text-red-600"}`}
                                          >
                                            <Lock size={10} /> Unlock
                                          </button>
                                        )}
                                      </div>
                                  </div>
                              </div>
                            ))}
                            
                            <p className={`text-[10px] mt-1 ${isLead ? "text-gray-400" : "text-blue-200"}`}>{timeStr}</p>
                          </div>
                        </motion.div>
                      );
                    })}
                  </>
                )}
              </div>

              <form onSubmit={(e) => handleSendMessage(e)} className="p-4 border-t border-gray-200 bg-white flex gap-2 items-center shrink-0 pb-[calc(1rem+env(safe-area-inset-bottom))]">
                <input 
                    type="file" 
                    id="admin-file-upload" 
                    className="hidden" 
                    onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleFileUpload(file);
                    }}
                />
                <button 
                  type="button"
                  disabled={uploading}
                  onClick={() => document.getElementById("admin-file-upload")?.click()}
                  className="p-2.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-xl transition-all disabled:opacity-50"
                >
                  {uploading ? <span className="loading loading-spinner loading-xs" /> : <Paperclip size={18} />}
                </button>
                <input 
                  type="text" 
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Type a response..." 
                  className="flex-1 bg-gray-50 border-gray-100 rounded-xl px-4 py-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
                <button 
                  type="submit"
                  disabled={sending || (!newMessage.trim() && !uploading)}
                  className="btn btn-primary btn-sm h-[38px] rounded-xl px-4 text-white font-bold text-[10px] uppercase tracking-widest"
                >
                  {sending ? <span className="loading loading-spinner loading-xs" /> : "Reply"}
                </button>
              </form>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-gray-400 gap-4">
              <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center">
                <MessageSquare size={32} className="text-gray-300" />
              </div>
              <p className="text-sm font-medium">Select a conversation to start chatting</p>
            </div>
          )}
        </motion.div>

        {/* Details Panel */}
        <AnimatePresence>
          {activeThread && (
            <motion.div
              key="details-panel"
              variants={slideInRight}
              initial="initial"
              animate="animate"
              exit="exit"
              className="w-64 border-l border-gray-200 bg-white overflow-y-auto shrink-0 p-4 space-y-6"
            >
              <div>
                <p className="text-sm font-bold text-gray-800 mb-3">Lead Details</p>
                {[
                  { label: "Lead ID", val: activeLead?.id.split('-')[0].toUpperCase() || "-" },
                  { label: "Phone", val: activeLead?.phone || "-" },
                  { label: "Project", val: activeLead?.project || "-" },
                  { label: "Source", val: activeLead?.source?.name || "WhatsApp" },
                  { label: "Assigned To", val: activeOwner?.name || "-" },
                ].map(({ label, val }) => (
                  <div key={label} className="flex items-center justify-between py-2 border-b border-gray-50">
                    <span className="text-[11px] text-gray-400">{label}</span>
                    <span className="text-[11px] font-medium text-gray-700">{val}</span>
                  </div>
                ))}
                <button className="w-full mt-3 text-xs text-blue-600 border border-blue-200 rounded-lg py-2 hover:bg-blue-50 transition-colors">View Full Lead Profile</button>
              </div>

              <div>
                <p className="text-sm font-bold text-gray-800 mb-3">Conversation Info</p>
                {[
                  { label: "Channel", val: activeThread.channel || "WhatsApp" },
                  { label: "Started", val: new Date(activeThread.createdAt).toLocaleDateString() },
                  { label: "Last Message", val: activeThread.messages.length > 0 ? new Date(activeThread.messages[activeThread.messages.length - 1].createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "-" },
                  { label: "Total Messages", val: activeThread.messages.length.toString() },
                  { label: "Status", val: activeThread.status || "Active", badge: true },
                ].map(({ label, val, badge }) => (
                  <div key={label} className="flex items-center justify-between py-2 border-b border-gray-50">
                    <span className="text-[11px] text-gray-400">{label}</span>
                    {badge ? <span className="text-[10px] font-bold bg-green-100 text-green-700 px-2 py-0.5 rounded-full">{val}</span> : <span className="text-[11px] font-medium text-gray-700">{val}</span>}
                  </div>
                ))}
              </div>

              <div>
                <p className="text-sm font-bold text-gray-800 mb-3">Employee Info</p>
                {[
                  { label: "Employee", val: activeOwner?.name || "-" },
                  { label: "Department", val: activeOwner?.department || "-" },
                  { label: "Role", val: activeOwner?.jobTitle || activeOwner?.role || "-" },
                ].map(({ label, val }) => (
                  <div key={label} className="flex items-center justify-between py-2 border-b border-gray-50">
                    <span className="text-[11px] text-gray-400">{label}</span>
                    <span className="text-[11px] font-medium text-gray-700">{val}</span>
                  </div>
                ))}
                <button className="w-full mt-3 text-xs text-blue-600 border border-blue-200 rounded-lg py-2 hover:bg-blue-50 transition-colors">View Employee Profile</button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Unlock Modal */}
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
                      onChange={(e) => setUnlockKey(e.target.value.toUpperCase())}
                      className="input input-bordered w-full pl-12 h-14 bg-gray-50 font-mono text-center tracking-[0.3em] font-bold text-lg rounded-2xl border-gray-100 focus:border-blue-400 transition-all uppercase"
                    />
                  </div>

                  <div className="flex gap-3">
                    <button 
                      onClick={() => {
                        setShowUnlockModal(null);
                        setUnlockKey("");
                      }}
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
