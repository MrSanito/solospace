"use client"
import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, User, MessageCircle, Clock, Lock, Key, Download, FileText, X } from "lucide-react";
import { useAuth } from "@/components/auth/AuthContext";

interface MessageAttachment {
  id: string;
  fileName: string;
  fileUrl: string | null;
  fileType: string;
  isRestricted: boolean;
  accessKey?: string | null;
}

interface Message {
  id: string;
  senderType: "LEAD" | "USER";
  content: string;
  createdAt: string;
  attachments?: MessageAttachment[];
}

interface ChatWindowProps {
  leadId: string;
  userId?: string;
  senderType: "LEAD" | "USER";
}

export default function ChatWindow({ leadId, userId, senderType }: ChatWindowProps) {
  const { user } = useAuth();
  const isPrivileged = user?.role === "ORG_ADMIN" || user?.role === "MANAGER";

  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(true);
  const [unlockKey, setUnlockKey] = useState("");
  const [unlocking, setUnlocking] = useState(false);
  const [unlockedUrls, setUnlockedUrls] = useState<Record<string, string>>({});
  const [showUnlockModal, setShowUnlockModal] = useState<string | null>(null);
  const [showKeyForAtt, setShowKeyForAtt] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

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

  useEffect(() => {
    if (!leadId) return;

    const loadMessages = () => {
      fetch(`/api/chat?leadId=${leadId}`)
        .then(res => res.json())
        .then(data => {
          if (data?.messages) setMessages(data.messages);
          setLoading(false);
        })
        .catch(() => setLoading(false));
    };

    loadMessages();
    const interval = setInterval(loadMessages, 3000);
    return () => clearInterval(interval);
  }, [leadId]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim()) return;
    
    // Optimistic UI
    const tempId = Math.random().toString();
    const optimisticMsg: Message = {
      id: tempId,
      senderType,
      content: input,
      createdAt: new Date().toISOString()
    };
    setMessages(prev => [...prev, optimisticMsg]);
    setInput("");

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          leadId,
          content: input,
          senderType,
          senderId: userId
        })
      });
      if (res.ok) {
        const msg = await res.json();
        setMessages(prev => prev.map(m => m.id === tempId ? msg : m));
      } else {
        // Rollback on error
        setMessages(prev => prev.filter(m => m.id !== tempId));
      }
    } catch {
      setMessages(prev => prev.filter(m => m.id !== tempId));
    }
  };

  return (
    <div className="flex flex-col h-full min-h-[500px] bg-white/80 backdrop-blur-md border border-slate-200 rounded-3xl overflow-hidden shadow-2xl shadow-slate-200/50">
      <header className="p-5 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-blue-200">
            <MessageCircle size={20} />
          </div>
          <div>
            <h3 className="text-sm font-black text-slate-900 uppercase tracking-tighter">Support Team</h3>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span> Active Connection
            </p>
          </div>
        </div>
      </header>

      <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-4">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-slate-400 space-y-2 opacity-50">
            <MessageCircle size={48} strokeWidth={1} />
            <p className="text-[10px] font-black uppercase tracking-[0.2em]">Start Conversation</p>
          </div>
        ) : (
          messages.map((msg) => (
            <div key={msg.id} className={`flex ${msg.senderType === senderType ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[80%] rounded-2xl p-4 shadow-sm ${
                msg.senderType === senderType 
                  ? 'bg-slate-900 text-white rounded-tr-none shadow-slate-200' 
                  : 'bg-white border border-slate-100 text-slate-700 rounded-tl-none'
              }`}>
                <p className="text-sm font-medium leading-relaxed">{msg.content}</p>
                
                {/* Attachments */}
                {msg.attachments && msg.attachments.length > 0 && (
                  <div className="mt-3 space-y-2 border-t border-slate-100/20 pt-3">
                    {msg.attachments.map((att) => (
                      <div key={att.id} className="flex items-center justify-between bg-white/5 rounded-xl p-2 border border-white/10 group/att">
                        <div className="flex items-center gap-2 overflow-hidden">
                          <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center flex-shrink-0">
                            <FileText size={14} />
                          </div>
                          <div className="overflow-hidden">
                            <p className="text-[11px] font-bold truncate max-w-[120px]">{att.fileName}</p>
                            <p className="text-[9px] opacity-60 uppercase font-black">{att.fileType}</p>
                          </div>
                        </div>

                        <div className="flex items-center gap-1">
                          {isPrivileged && att.isRestricted && (
                            <div className="relative mr-1">
                              {showKeyForAtt === att.id ? (
                                <span className="absolute right-0 bottom-full mb-1 font-mono text-[9px] font-black bg-blue-600 text-white px-1.5 py-0.5 rounded shadow-xl whitespace-nowrap z-10">
                                  KEY: {att.accessKey}
                                </span>
                              ) : null}
                              <button 
                                onClick={async () => {
                                  const alreadyShowing = showKeyForAtt === att.id;
                                  setShowKeyForAtt(alreadyShowing ? null : att.id);
                                  if (!alreadyShowing && isPrivileged) {
                                    try {
                                      await fetch("/api/audit/log", {
                                        method: "POST",
                                        headers: { "Content-Type": "application/json" },
                                        body: JSON.stringify({
                                          action: "VIEW_KEY",
                                          note: `Admin viewed chat attachment key for: ${att.fileName}`,
                                          source: "UI"
                                        })
                                      });
                                    } catch (e) {
                                      console.error("Failed to log key view");
                                    }
                                  }
                                }}
                                className="p-1.5 hover:bg-white/10 rounded-lg text-blue-400 transition-colors"
                                title="Get Access Key"
                              >
                                <Key size={14} />
                              </button>
                            </div>
                          )}

                          {(!att.isRestricted || unlockedUrls[att.id]) ? (
                            <a 
                              href={att.fileUrl || unlockedUrls[att.id] || "#"} 
                              target="_blank" 
                              rel="noopener noreferrer" 
                              className="p-1.5 bg-green-500/20 hover:bg-green-500/30 rounded-lg text-green-400 transition-all active:scale-95 flex items-center gap-1.5"
                              title="Download File"
                            >
                              <Download size={15} />
                              <span className="text-[10px] font-black uppercase">Open</span>
                            </a>
                          ) : (
                            <button 
                              onClick={() => setShowUnlockModal(att.id)}
                              className="p-1.5 bg-red-500/20 hover:bg-red-500/30 rounded-lg text-red-400 transition-all active:scale-95 flex items-center gap-1.5"
                              title="Enter Access Code to Download"
                            >
                              <Lock size={14} />
                              <span className="text-[10px] font-black uppercase">Download</span>
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                <div className={`flex items-center gap-1 mt-2 text-[9px] font-bold uppercase tracking-widest ${
                  msg.senderType === senderType ? 'text-slate-400' : 'text-slate-400'
                }`}>
                  <Clock size={10} /> {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      <footer className="p-4 bg-slate-50 border-t border-slate-100">
        <div className="relative group">
          <input 
            type="text" 
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && sendMessage()}
            placeholder="Type your message..."
            className="w-full pl-5 pr-14 py-4 bg-white border border-slate-200 rounded-2xl text-sm font-bold text-slate-700 focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all shadow-sm"
          />
          <button 
            onClick={sendMessage}
            className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 rounded-xl bg-slate-900 text-white flex items-center justify-center hover:bg-slate-800 transition-all active:scale-90 shadow-xl shadow-slate-200 disabled:opacity-50"
            disabled={!input.trim()}
          >
            <Send size={18} />
          </button>
        </div>
      </footer>

      {/* Unlock Modal */}
      <AnimatePresence>
        {showUnlockModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-sm overflow-hidden animate-in zoom-in duration-300">
              <div className="p-8 text-center">
                <div className="w-16 h-16 rounded-full bg-red-50 flex items-center justify-center mx-auto mb-6 border-2 border-red-100">
                  <Lock size={30} className="text-red-500" />
                </div>
                <h3 className="text-xl font-black text-slate-800 uppercase tracking-tighter mb-2">Secure Attachment</h3>
                <p className="text-sm text-slate-500 mb-8 px-4 font-medium">
                  This file is protected. Please enter the unique access code to download.
                </p>

                <div className="space-y-4">
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                      <Key size={18} />
                    </span>
                    <input 
                      type="text"
                      placeholder="ENTER ACCESS CODE"
                      value={unlockKey}
                      onChange={(e) => setUnlockKey(e.target.value.toUpperCase())}
                      className="input input-bordered w-full pl-12 h-14 bg-slate-50 font-mono text-center tracking-[0.3em] font-bold text-lg rounded-2xl border-slate-100 focus:border-blue-400 transition-all uppercase"
                    />
                  </div>

                  <div className="flex gap-3">
                    <button 
                      onClick={() => {
                        setShowUnlockModal(null);
                        setUnlockKey("");
                      }}
                      className="btn btn-ghost flex-1 h-14 rounded-2xl font-bold uppercase tracking-widest text-[10px]"
                    >
                      Cancel
                    </button>
                    <button 
                      onClick={() => handleUnlock(showUnlockModal)}
                      disabled={unlocking || !unlockKey}
                      className="btn btn-primary flex-1 h-14 rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-lg shadow-blue-200"
                    >
                      {unlocking ? <span className="loading loading-spinner loading-xs" /> : "Verify & Unlock"}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
