import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Download,
  RefreshCw,
  Search,
  SlidersHorizontal,
  ChevronLeft,
  ChevronRight,
  Eye,
  MessageSquare,
  Upload,
  Key,
  Lock,
  Settings,
  ArrowDownToLine,
  PlusCircle,
  Edit,
  LogIn,
  CheckCircle,
  FileText,
  FilterX,
  Shield
} from "lucide-react";

const actionConfig: Record<string, { label: string; bg: string; text: string; icon: any }> = {
  VIEW: { label: "Viewed", bg: "bg-blue-50", text: "text-blue-700", icon: Eye },
  CHAT: { label: "Chat", bg: "bg-green-50", text: "text-green-700", icon: MessageSquare },
  UPLOAD: { label: "Upload", bg: "bg-yellow-50", text: "text-yellow-700", icon: Upload },
  DECRYPT: { label: "Decrypt", bg: "bg-purple-50", text: "text-purple-700", icon: Key },
  RESTRICT: { label: "Restrict", bg: "bg-red-50", text: "text-red-700", icon: Lock },
  SETTINGS: { label: "Settings", bg: "bg-orange-50", text: "text-orange-700", icon: Settings },
  DOWNLOAD: { label: "Download", bg: "bg-cyan-50", text: "text-cyan-700", icon: ArrowDownToLine },
  CREATE: { label: "Created", bg: "bg-emerald-50", text: "text-emerald-700", icon: PlusCircle },
  UPDATE: { label: "Updated", bg: "bg-sky-50", text: "text-sky-700", icon: Edit },
  LOGIN: { label: "Login", bg: "bg-indigo-50", text: "text-indigo-700", icon: LogIn },
  COMPLETE: { label: "Completed", bg: "bg-green-50", text: "text-green-700", icon: CheckCircle },
  VIEW_KEY: { label: "Reveal Key", bg: "bg-blue-100", text: "text-blue-800", icon: Key },
  VIEW_AUDIT: { label: "Audit View", bg: "bg-slate-100", text: "text-slate-800", icon: Shield },
  JOIN_CHAT: { label: "Joined Chat", bg: "bg-teal-100", text: "text-teal-800", icon: MessageSquare },
  LOGOUT: { label: "Logout", bg: "bg-red-50", text: "text-red-700", icon: LogIn },
  default: { label: "Event", bg: "bg-gray-50", text: "text-gray-700", icon: FileText },
};

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.05 } },
};
const rowVariants = {
  hidden: { opacity: 0, x: -12 },
  visible: { opacity: 1, x: 0 },
};

export default function AuditLogPage() {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [actionFilter, setActionFilter] = useState("All");

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/reports/audit");
      if (res.ok) {
        const data = await res.json();
        setLogs(data);
      }
    } catch (error) {
      console.error("Failed to fetch logs:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
    // Log that audit trail is being viewed
    const logView = async () => {
      try {
        await fetch("/api/audit/log", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            action: "VIEW_AUDIT",
            note: "Admin viewed the audit trail",
            source: "UI"
          })
        });
      } catch (e) {
        console.error("Failed to log audit view");
      }
    };
    logView();
  }, []);

  const getInitials = (name?: string | null) => {
    if (!name) return "??";
    return name.split(" ").map(n => n[0]).join("").substring(0, 2).toUpperCase();
  };

  const getUserColor = (name?: string | null) => {
    const colors = ["bg-blue-600", "bg-indigo-600", "bg-teal-600", "bg-pink-600", "bg-violet-600", "bg-orange-500"];
    if (!name) return colors[0];
    const hash = name.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return colors[hash % colors.length];
  };

  const filtered = logs.filter(
    (e) => {
      const matchesSearch = !search || 
        (e.actorName || "").toLowerCase().includes(search.toLowerCase()) ||
        (e.action || "").toLowerCase().includes(search.toLowerCase()) ||
        (e.note || "").toLowerCase().includes(search.toLowerCase()) ||
        (e.lead?.contactName || "").toLowerCase().includes(search.toLowerCase());
      
      const matchesAction = actionFilter === "All" || e.action === actionFilter;
      
      return matchesSearch && matchesAction;
    }
  );

  const formatValue = (val: any) => {
    if (val === null || val === undefined) return "—";
    if (typeof val === 'object') return JSON.stringify(val);
    return String(val);
  };

  return (
    <div className="p-6 overflow-auto h-full">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-start justify-between mb-5"
      >
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Audit Log</h1>
          <p className="text-sm text-gray-500 mt-0.5">Track and review all activities across the system.</p>
        </div>
        <motion.button whileHover={{ scale: 1.03 }} className="btn btn-sm btn-outline gap-2 bg-white">
          <Download size={14} /> Export
        </motion.button>
      </motion.div>

      {/* Filters */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 mb-4"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="text-xs font-medium text-gray-500 mb-1 block">Quick Search</label>
            <div className="relative">
              <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="User, Lead or Action..."
                className="w-full pl-8 pr-3 py-1.5 text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 bg-white"
              />
            </div>
          </div>
          <div>
            <label className="text-xs font-medium text-gray-500 mb-1 block">Action Type</label>
            <select 
              value={actionFilter}
              onChange={(e) => setActionFilter(e.target.value)}
              className="select select-bordered select-sm w-full text-xs bg-white h-[34px] min-h-[34px]"
            >
              <option value="All">All Actions</option>
              {Object.keys(actionConfig).map(a => (
                <option key={a} value={a}>{actionConfig[a].label}</option>
              ))}
            </select>
          </div>
          <div className="lg:col-span-2 flex items-end justify-end">
             <button
              onClick={() => {
                setSearch("");
                setActionFilter("All");
              }}
              className="btn btn-sm btn-ghost text-blue-600 gap-1.5 text-xs h-[34px] min-h-[34px]"
            >
              <FilterX size={14} /> Clear All Filters
            </button>
          </div>
        </div>
      </motion.div>

      {/* Results bar */}
      <div className="flex items-center gap-3 mb-4 px-1">
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-600 font-semibold">{filtered.length}</span>
          <span className="text-sm text-gray-400 font-medium">Activities found</span>
        </div>
        <div className="ml-auto flex items-center gap-2">
          <button 
            onClick={fetchLogs}
            className={`btn btn-sm btn-ghost btn-square border border-gray-200 bg-white ${loading ? "loading" : ""}`}
            disabled={loading}
          >
            <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
          </button>
          <button className="btn btn-sm btn-ghost gap-1.5 border border-gray-200 bg-white">
            <SlidersHorizontal size={14} /> Columns
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden flex flex-col">
        <div className="overflow-x-auto">
          <table className="table table-sm w-full border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="text-[11px] uppercase tracking-wider font-bold text-gray-500 py-3 text-left px-4">Time</th>
                <th className="text-[11px] uppercase tracking-wider font-bold text-gray-500 py-3 text-left px-4">User / Actor</th>
                <th className="text-[11px] uppercase tracking-wider font-bold text-gray-500 py-3 text-left px-4">Action</th>
                <th className="text-[11px] uppercase tracking-wider font-bold text-gray-500 py-3 text-left px-4">Lead / Context</th>
                <th className="text-[11px] uppercase tracking-wider font-bold text-gray-500 py-3 text-left px-4">Field</th>
                <th className="text-[11px] uppercase tracking-wider font-bold text-gray-500 py-3 text-left px-4">Details</th>
                <th className="text-[11px] uppercase tracking-wider font-bold text-gray-500 py-3 text-center px-4">IP</th>
              </tr>
            </thead>
            <motion.tbody variants={containerVariants} initial="hidden" animate="visible" key={search + actionFilter + logs.length}>
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-20 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <span className="loading loading-spinner loading-md text-blue-600"></span>
                      <p className="text-sm text-gray-500 font-medium">Fetching audit trail...</p>
                    </div>
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-20 text-center">
                    <div className="flex flex-col items-center gap-3 text-gray-400">
                      <div className="p-4 bg-gray-50 rounded-full">
                        <Search size={32} />
                      </div>
                      <p className="text-sm font-medium">No activity found for current filters</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filtered.map((entry) => {
                  const cfg = actionConfig[entry.action] || actionConfig.default;
                  const ActionIcon = cfg.icon;
                  return (
                    <motion.tr
                      key={entry.id}
                      variants={rowVariants}
                      whileHover={{ backgroundColor: "rgba(59,130,246,0.02)" }}
                      className="border-b border-gray-100 transition-colors"
                    >
                      <td className="py-3 text-xs text-gray-500 whitespace-nowrap px-4">
                        {new Intl.DateTimeFormat('en-IN', {
                          day: '2-digit',
                          month: 'short',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                          hour12: true
                        }).format(new Date(entry.createdAt))}
                      </td>
                      <td className="px-4">
                        <div className="flex items-center gap-2">
                          <div className={`w-7 h-7 rounded-full ${getUserColor(entry.actorName)} text-white text-[10px] font-bold flex items-center justify-center shrink-0`}>
                            {getInitials(entry.actorName)}
                          </div>
                          <div className="min-w-0">
                            <p className="text-xs font-semibold text-gray-800 truncate">{entry.actorName}</p>
                            <p className="text-[10px] text-gray-400 uppercase tracking-tight">{entry.actorType}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide ${cfg.bg} ${cfg.text}`}>
                          <ActionIcon size={12} />
                          {cfg.label}
                        </span>
                      </td>
                      <td className="px-4">
                        {entry.lead ? (
                          <div className="min-w-0">
                            <p className="text-xs font-medium text-blue-600 hover:underline cursor-pointer truncate">
                              {entry.lead.contactName}
                            </p>
                            <p className="text-[10px] text-gray-400 font-mono">ID: {entry.leadId?.substring(0, 8)}</p>
                          </div>
                        ) : (
                          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">SYSTEM</span>
                        )}
                      </td>
                      <td className="px-4">
                        {entry.field ? (
                          <span className="text-xs font-semibold text-gray-600 bg-gray-100 px-1.5 py-0.5 rounded capitalize">
                            {entry.field.replace(/_/g, ' ')}
                          </span>
                        ) : (
                          <span className="text-gray-300">—</span>
                        )}
                      </td>
                      <td className="px-4">
                        <div className="max-w-xs">
                          {entry.note ? (
                            <p className="text-xs text-gray-600 italic line-clamp-1">"{entry.note}"</p>
                          ) : entry.beforeValue || entry.afterValue ? (
                            <div className="flex items-center gap-1.5 text-[10px]">
                              <span className="text-gray-400 truncate max-w-[80px]">{formatValue(entry.beforeValue)}</span>
                              <span className="text-gray-300">→</span>
                              <span className="text-blue-600 font-medium truncate max-w-[80px]">{formatValue(entry.afterValue)}</span>
                            </div>
                          ) : (
                            <span className="text-gray-300 text-[10px]">No extra details</span>
                          )}
                        </div>
                      </td>
                      <td className="text-[10px] font-mono text-gray-400 px-4 text-center">
                        {entry.ipAddress || "—"}
                      </td>
                    </motion.tr>
                  );
                })
              )}
            </motion.tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between mt-5 px-1">
        <p className="text-xs font-medium text-gray-500">
          Showing <span className="text-gray-900">{filtered.length}</span> of <span className="text-gray-900">{logs.length}</span> recorded logs
        </p>
        <div className="flex items-center gap-1.5">
          <button className="btn btn-xs btn-ghost border border-gray-200 bg-white h-8 w-8 p-0"><ChevronLeft size={14} /></button>
          <button className="btn btn-xs btn-primary h-8 min-w-[32px] font-bold">1</button>
          <button className="btn btn-xs btn-ghost border border-gray-200 bg-white h-8 w-8 p-0"><ChevronRight size={14} /></button>
        </div>
      </div>
    </div>
  );
}
