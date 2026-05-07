import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

const statusConfig: Record<string, { bg: string; text: string; ring: string }> = {
  active: {
    bg: "bg-emerald-50",
    text: "text-emerald-700",
    ring: "ring-emerald-200",
  },
  waiting: {
    bg: "bg-amber-50",
    text: "text-amber-700",
    ring: "ring-amber-200",
  },
  closed: {
    bg: "bg-slate-100",
    text: "text-slate-500",
    ring: "ring-slate-200",
  },
};

const WhatsAppIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4 text-emerald-500">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
  </svg>
);

const WebIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-4 h-4 text-sky-500">
    <circle cx="12" cy="12" r="10" />
    <line x1="2" y1="12" x2="22" y2="12" />
    <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
  </svg>
);

const BellIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-5 h-5">
    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
    <path d="M13.73 21a2 2 0 0 1-3.46 0" />
  </svg>
);

const SearchIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-4 h-4 text-slate-400">
    <circle cx="11" cy="11" r="8" />
    <line x1="21" y1="21" x2="16.65" y2="16.65" />
  </svg>
);

const ChevronRightIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} className="w-4 h-4 text-slate-400">
    <polyline points="9 18 15 12 9 6" />
  </svg>
);

const ChevronLeftIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} className="w-4 h-4">
    <polyline points="15 18 9 12 15 6" />
  </svg>
);

const SortIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-4 h-4 text-slate-500">
    <line x1="3" y1="6" x2="21" y2="6" />
    <line x1="3" y1="12" x2="15" y2="12" />
    <line x1="3" y1="18" x2="9" y2="18" />
  </svg>
);

const containerVariants: any = {
  hidden: {},
  show: {
    transition: {
      staggerChildren: 0.07,
    },
  },
};

const rowVariants: any = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.35, ease: "easeOut" } },
};

interface ChatAssignedLeadProps {
  onSelect: (threadId: string) => void;
}

export default function ChatAssignedLead({ onSelect }: ChatAssignedLeadProps) {
  const [activeTab, setActiveTab] = useState("All Leads");
  const [searchQuery, setSearchQuery] = useState("");
  const [hoveredRow, setHoveredRow] = useState<string | null>(null);
  const [threads, setThreads] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchThreads();
    const interval = setInterval(() => {
      if (document.visibilityState === "visible") {
        fetchThreads();
      }
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const fetchThreads = async () => {
    try {
      const res = await fetch("/api/chat/oversight");
      if (res.ok) {
        const data = await res.json();
        setThreads(data.threads || data);
      }
    } catch (error) {
      console.error("Failed to fetch threads:", error);
    } finally {
      setLoading(false);
    }
  };

  const filtered = threads.filter((t) => {
    const status = (t.status || "active").toLowerCase();
    const matchesTab =
      activeTab === "All Leads" || status === activeTab.toLowerCase();
    
    const lead = t.lead;
    const matchesSearch =
      !searchQuery ||
      lead.contactName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      lead.phone?.includes(searchQuery) ||
      t.id.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesTab && matchesSearch;
  });

  const getInitials = (name: string) => {
    return name.split(" ").map((n: string) => n[0]).join("").substring(0, 2).toUpperCase();
  };

  const getTimeAgo = (date: string) => {
    const d = new Date(date);
    const diff = Date.now() - d.getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return "Just now";
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    return d.toLocaleDateString();
  };

  const tabs = [
    { label: "All Leads", count: threads.length, dot: null },
    { label: "Active", count: threads.filter(t => (t.status || 'active').toLowerCase() === 'active').length, dot: "bg-emerald-500" },
    { label: "Waiting", count: threads.filter(t => (t.status || '').toLowerCase() === 'waiting').length, dot: "bg-amber-400" },
    { label: "Closed", count: threads.filter(t => (t.status || '').toLowerCase() === 'closed').length, dot: "bg-slate-400" },
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex items-start justify-center p-6 font-[system-ui]">
      <div className="w-full max-w-5xl">
        {/* Card Shell */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="bg-white rounded-2xl shadow-xl shadow-slate-200/60 border border-slate-100 overflow-hidden"
        >
          {/* Header */}
          <div className="px-7 pt-7 pb-5 flex items-start justify-between gap-4 border-b border-slate-100">
            <div>
              <h1 className="text-xl font-bold text-slate-800 tracking-tight">
                My Assigned Leads
              </h1>
              <p className="text-sm text-slate-400 mt-0.5">
                Conversations assigned to you. Select a lead to continue.
              </p>
            </div>

            <div className="flex items-center gap-3 shrink-0">
              {/* Search */}
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2">
                  <SearchIcon />
                </span>
                <input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search by name, phone or lead ID..."
                  className="pl-9 pr-4 py-2 text-sm rounded-xl border border-slate-200 bg-slate-50 text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-400/40 focus:border-blue-400 w-64 transition-all"
                />
              </div>

              {/* Refresh */}
              <motion.button
                whileHover={{ scale: 1.08 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => { setLoading(true); fetchThreads(); }}
                className="w-10 h-10 flex items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 transition-colors shadow-sm"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`}>
                   <path d="M23 4v6h-6M1 20v-6h6M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1.05 14l4.64 4.36A9 9 0 0 0 20.49 15" />
                </svg>
              </motion.button>
            </div>
          </div>

          {/* Tabs + Sort */}
          <div className="px-7 pt-4 pb-3 flex items-center justify-between border-b border-slate-100">
            <div className="flex items-center gap-1">
              {tabs.map((tab) => (
                <motion.button
                  key={tab.label}
                  onClick={() => setActiveTab(tab.label)}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.97 }}
                  className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-sm font-medium transition-all ${
                    activeTab === tab.label
                      ? "text-blue-700 bg-blue-50 border border-blue-100"
                      : "text-slate-500 hover:text-slate-700 hover:bg-slate-50"
                  }`}
                >
                  {tab.dot && (
                    <span className={`w-2 h-2 rounded-full ${tab.dot}`} />
                  )}
                  {tab.label}
                  <span
                    className={`text-xs px-1.5 py-0.5 rounded-md font-semibold ${
                      activeTab === tab.label
                        ? "bg-blue-100 text-blue-600"
                        : "bg-slate-100 text-slate-400"
                    }`}
                  >
                    {tab.count}
                  </span>
                </motion.button>
              ))}
            </div>

            <button className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-700 transition-colors">
              <SortIcon />
              <span>Sort by: <span className="font-medium text-slate-700">Last Activity</span></span>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-3.5 h-3.5">
                <polyline points="6 9 12 15 18 9" />
              </svg>
            </button>
          </div>

          {/* Lead Rows */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="show"
            className="divide-y divide-slate-50"
          >
            <AnimatePresence mode="popLayout">
              {loading ? (
                <div className="py-20 flex flex-col items-center justify-center text-slate-400 gap-3">
                   <div className="w-10 h-10 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin" />
                   <p className="text-sm font-medium">Syncing your conversations...</p>
                </div>
              ) : filtered.length === 0 ? (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="py-16 text-center text-slate-400 text-sm"
                >
                  No leads match your search.
                </motion.div>
              ) : (
                filtered.map((thread, index) => {
                  const lead = thread.lead;
                  const status = (thread.status || 'active').toLowerCase();
                  const sc = statusConfig[status] || statusConfig.active;
                  const lastMessage = thread.messages.length > 0 ? thread.messages[thread.messages.length - 1] : null;
                  
                  const avatarColors = [
                    "bg-violet-500", "bg-sky-500", "bg-rose-400", "bg-teal-500", "bg-indigo-400", "bg-amber-400"
                  ];
                  const avatarColor = avatarColors[index % avatarColors.length];

                  return (
                    <motion.div
                      key={thread.id}
                      variants={rowVariants}
                      layout
                      onHoverStart={() => setHoveredRow(thread.id)}
                      onHoverEnd={() => setHoveredRow(null)}
                      onClick={() => onSelect(thread.id)}
                      className={`flex items-center gap-5 px-7 py-4 cursor-pointer transition-colors ${
                        hoveredRow === thread.id ? "bg-slate-50/80" : "bg-white"
                      }`}
                    >
                      {/* Avatar */}
                      <motion.div
                        animate={{ scale: hoveredRow === thread.id ? 1.05 : 1 }}
                        transition={{ duration: 0.2 }}
                        className={`w-11 h-11 rounded-full ${avatarColor} flex items-center justify-center shrink-0 shadow-md`}
                      >
                        <span className="text-white text-sm font-bold tracking-wide">
                          {getInitials(lead.contactName)}
                        </span>
                      </motion.div>

                      {/* Name & Contact */}
                      <div className="w-44 shrink-0">
                        <p className="text-sm font-semibold text-slate-800 leading-tight">
                          {lead.contactName}
                        </p>
                        <p className="text-xs text-slate-400 mt-0.5">{lead.phone || "No phone"}</p>
                        <div className="flex items-center gap-1.5 mt-1">
                          <span className="text-xs text-slate-400">
                            ID: L-{lead.id.split('-')[0].toUpperCase()}
                          </span>
                          {lead.source?.name?.toLowerCase().includes('whatsapp') ? (
                            <WhatsAppIcon />
                          ) : (
                            <WebIcon />
                          )}
                        </div>
                      </div>

                      {/* Message Preview */}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-slate-600 leading-snug line-clamp-1">
                          {lastMessage ? lastMessage.content : "No messages yet"}
                        </p>
                        <p className="text-xs text-slate-400 mt-1">
                          {lastMessage ? getTimeAgo(lastMessage.createdAt) : "N/A"}
                        </p>
                      </div>

                      {/* Status Badge */}
                      <div className="w-24 flex justify-center shrink-0">
                        <motion.span
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          className={`inline-flex items-center px-3 py-1 rounded-full text-[10px] uppercase tracking-wider font-bold ring-1 ${sc.bg} ${sc.text} ${sc.ring}`}
                        >
                          {status}
                        </motion.span>
                      </div>

                      {/* CTA */}
                      <div className="flex items-center gap-2 shrink-0">
                        <motion.button
                          whileHover={{ scale: 1.04, boxShadow: "0 4px 14px rgba(59,130,246,0.25)" }}
                          whileTap={{ scale: 0.97 }}
                          className="px-4 py-1.5 rounded-lg border border-slate-200 text-sm font-semibold text-slate-700 bg-white hover:border-blue-300 hover:text-blue-700 transition-all"
                        >
                          Open Chat
                        </motion.button>
                        <motion.div
                          animate={{ x: hoveredRow === thread.id ? 2 : 0 }}
                          transition={{ duration: 0.2 }}
                        >
                          <ChevronRightIcon />
                        </motion.div>
                      </div>
                    </motion.div>
                  );
                })
              )}
            </AnimatePresence>
          </motion.div>

          {/* Footer / Pagination */}
          <div className="px-7 py-4 border-t border-slate-100 flex items-center justify-between">
            <p className="text-sm text-slate-400">
              Showing{" "}
              <span className="font-medium text-slate-600">1 to {filtered.length}</span> of{" "}
              <span className="font-medium text-slate-600">{threads.length}</span> leads
            </p>

            <div className="flex items-center gap-1">
              <motion.button
                whileHover={{ scale: 1.08 }}
                whileTap={{ scale: 0.95 }}
                className="w-8 h-8 flex items-center justify-center rounded-lg border border-slate-200 text-slate-400 hover:bg-slate-50 transition-colors"
              >
                <ChevronLeftIcon />
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.08 }}
                whileTap={{ scale: 0.95 }}
                className="w-8 h-8 flex items-center justify-center rounded-lg text-sm font-semibold bg-blue-600 text-white shadow-md shadow-blue-200"
              >
                1
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.08 }}
                whileTap={{ scale: 0.95 }}
                className="w-8 h-8 flex items-center justify-center rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50 transition-colors"
              >
                <ChevronRightIcon />
              </motion.button>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}