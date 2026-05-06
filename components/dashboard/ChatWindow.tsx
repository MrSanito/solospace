"use client"
import { useState, useEffect, useRef } from "react";
import { Send, User, MessageCircle, Clock } from "lucide-react";

interface Message {
  id: string;
  senderType: "LEAD" | "USER";
  content: string;
  createdAt: string;
}

interface ChatWindowProps {
  leadId: string;
  userId?: string;
  senderType: "LEAD" | "USER";
}

export default function ChatWindow({ leadId, userId, senderType }: ChatWindowProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!leadId) return;
    fetch(`/api/chat?leadId=${leadId}`)
      .then(res => res.json())
      .then(data => {
        if (data?.messages) setMessages(data.messages);
        setLoading(false);
      })
      .catch(() => setLoading(false));
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
            <h3 className="text-sm font-black text-slate-900 uppercase tracking-tighter">Support Protocol</h3>
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
            <p className="text-[10px] font-black uppercase tracking-[0.2em]">Initialise Protocol</p>
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
    </div>
  );
}
