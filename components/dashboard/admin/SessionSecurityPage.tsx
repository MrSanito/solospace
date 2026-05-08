import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Download,
  Settings,
  Filter,
  RefreshCw,
  Search,
  ChevronLeft,
  ChevronRight,
  X,
  CheckCircle2,
  Minus,
  Shield,
  AlertTriangle,
  History,
  Monitor,
  MapPin,
} from "lucide-react";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.05 }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0 }
};

export default function SessionSecurityPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<any>(null);
  const [activeTab, setActiveTab] = useState("Active Sessions");
  const [searchQuery, setSearchQuery] = useState("");

  const tabs = ["Active Sessions", "Login History", "Security Events", "Devices", "Location History"];

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/dashboard/sessions");
      const json = await res.json();
      setData(json);
    } catch (error) {
      console.error("Failed to fetch sessions:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const getMetadata = (note: string | null) => {
    if (!note) return { device: "Unknown", os: "Unknown", browser: "Unknown", ip: "Unknown", fullDevice: "Unknown" };
    try {
      const parsed = JSON.parse(note);
      const ua = parsed.device || "";
      
      let os = "Unknown";
      let device = "Desktop";
      let browser = "Unknown";

      if (ua.includes("Windows")) os = "Windows";
      else if (ua.includes("Macintosh")) os = "macOS";
      else if (ua.includes("Android")) { os = "Android"; device = "Mobile"; }
      else if (ua.includes("iPhone")) { os = "iOS"; device = "iPhone"; }

      if (ua.includes("Chrome")) browser = "Chrome";
      else if (ua.includes("Firefox")) browser = "Firefox";
      else if (ua.includes("Safari")) browser = "Safari";
      else if (ua.includes("Edge")) browser = "Edge";

      return {
        device,
        os,
        browser,
        ip: parsed.ip || "Unknown",
        fullDevice: browser !== "Unknown" ? `${browser} on ${os}` : os,
        message: parsed.message
      };
    } catch {
      return { device: "Unknown", os: "Unknown", browser: "Unknown", ip: "Unknown", fullDevice: "Unknown" };
    }
  };

  const getDisplayData = () => {
    if (!data) return [];
    let items = [];
    
    if (activeTab === "Active Sessions") {
      items = data.sessions || [];
    } else if (activeTab === "Login History") {
      items = data.loginHistory || [];
    } else if (activeTab === "Security Events") {
      items = data.securityEvents || [];
    } else {
      items = data.sessions || [];
    }

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      items = items.filter((item: any) => 
        item.user?.name?.toLowerCase().includes(q) || 
        item.id?.toLowerCase().includes(q) ||
        item.title?.toLowerCase().includes(q) ||
        item.actorName?.toLowerCase().includes(q)
      );
    }

    return items;
  };

  const stats = [
    { label: "Active Sessions", value: data?.stats?.activeSessions || "0", change: "Current live", positive: true },
    { label: "Unique Logins (24h)", value: data?.stats?.uniqueLogins || "0", change: "Last 24 hours", positive: true },
    { label: "Failed Attempts (24h)", value: data?.stats?.failedAttempts || "0", change: "Last 24 hours", positive: data?.stats?.failedAttempts === 0 },
    { label: "Suspicious Events", value: data?.stats?.suspiciousEvents || "0", change: "EWS Alerts", positive: data?.stats?.suspiciousEvents === 0 },
    { label: "MFA Adoption", value: data?.stats?.mfaAdoption || "100%", change: "Policy coverage", positive: true },
  ];

  return (
    <div className="flex h-full">
      <div className="flex-1 overflow-auto p-6 min-w-0">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-start justify-between mb-5"
        >
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Session & Security</h1>
            <p className="text-sm text-gray-500 mt-0.5">Monitor user logins, active sessions and security events.</p>
          </div>
          <div className="flex gap-2">
            <motion.button whileHover={{ scale: 1.03 }} className="btn btn-sm btn-outline gap-2 bg-white">
              <Download size={14} /> Export Logs
            </motion.button>
            <motion.button whileHover={{ scale: 1.03 }} className="btn btn-sm btn-outline gap-2 bg-white">
              <Settings size={14} /> Security Settings
            </motion.button>
          </div>
        </motion.div>

        {/* Tabs */}
        <div className="flex gap-1 border-b border-gray-200 mb-5">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2.5 text-sm font-medium relative transition-colors ${
                activeTab === tab ? "text-blue-600" : "text-gray-500 hover:text-gray-700"
              }`}
            >
              {tab}
              {activeTab === tab && (
                <motion.div
                  layoutId="sessionTabLine"
                  className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 rounded-t"
                />
              )}
            </button>
          ))}
        </div>

        {/* Stats */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3 mb-5"
        >
          {stats.map((stat) => (
            <motion.div
              key={stat.label}
              variants={itemVariants}
              whileHover={{ y: -2 }}
              className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm"
            >
              <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center mb-2">
                <Shield size={16} />
              </div>
              <p className="text-xs text-gray-500 mb-0.5">{stat.label}</p>
              <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
              <p className={`text-xs mt-0.5 font-medium ${stat.positive ? "text-green-600" : "text-orange-500"}`}>
                {stat.change}
              </p>
            </motion.div>
          ))}
        </motion.div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-2 mb-4">
          <button className="btn btn-sm btn-outline gap-1.5 bg-white">
            📅 12 Apr 2024 – 19 Apr 2024
          </button>
          {["All Users", "All Roles", "All Devices", "All Locations", "All Status"].map((f) => (
            <select key={f} className="select select-bordered select-sm text-sm bg-white">
              <option>{f}</option>
            </select>
          ))}
          <button className="btn btn-sm btn-ghost gap-1.5 border border-gray-200 bg-white">
            <Filter size={14} /> Filters
          </button>
          <button onClick={fetchData} className="btn btn-sm btn-ghost btn-square border border-gray-200 bg-white" disabled={loading}>
            <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
          </button>
        </div>

        <div className="flex items-center justify-between mb-3">
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8 pr-3 py-2 text-sm border border-gray-200 rounded-lg w-64 focus:outline-none focus:ring-2 focus:ring-blue-500/20 bg-white"
            />
          </div>
          <span className="text-sm text-gray-500">
            Showing {getDisplayData().length} results
          </span>
        </div>

        {/* Table */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-x-auto">
          <table className="table table-sm w-full">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                {["User", "ID", "Device / Browser", "IP Address", "Event Time", "Status / Severity", "MFA", "Actions"].map((h) => (
                  <th key={h} className="text-xs font-semibold text-gray-500 py-3 text-left px-4">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {getDisplayData().map((s: any, i: number) => {
                const meta = getMetadata(s.note);
                const isSecurity = activeTab === "Security Events";
                const user = s.user || { name: s.actorName || "System", role: "N/A", initials: "S" };
                const initials = user.initials || user.name?.substring(0, 1) || "U";

                return (
                  <motion.tr
                    key={s.id}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.01 }}
                    onClick={() => setSelected(s)}
                    className={`border-b border-gray-100 cursor-pointer transition-colors hover:bg-blue-50/30 ${
                      selected?.id === s.id ? "bg-blue-50/60" : ""
                    }`}
                  >
                    <td className="py-2.5 px-4">
                      <div className="flex items-center gap-2">
                        <div className={`w-7 h-7 rounded-full bg-indigo-600 text-white text-xs font-bold flex items-center justify-center`}>
                          {initials}
                        </div>
                        <div>
                          <p className="text-xs font-semibold text-gray-800">{user.name}</p>
                          <p className="text-xs text-gray-400">{user.role}</p>
                        </div>
                      </div>
                    </td>
                    <td className="text-xs font-mono text-gray-600 px-4">{s.id.substring(0, 8)}</td>
                    <td className="px-4">
                      <p className="text-xs text-gray-700">{isSecurity ? s.title : meta.fullDevice}</p>
                      <p className="text-xs text-gray-400">{isSecurity ? s.severity : meta.os}</p>
                    </td>
                    <td className="text-xs font-mono text-gray-600 px-4">{isSecurity ? s.ipAddress || "N/A" : meta.ip}</td>
                    <td className="px-4">
                      <p className="text-xs text-gray-700">{new Date(s.createdAt).toLocaleString()}</p>
                    </td>
                    <td className="px-4">
                      <span className={`badge badge-sm font-medium ${
                        isSecurity ? (s.severity === "High" ? "badge-error text-red-700 bg-red-50 border-red-200" : "badge-warning text-yellow-700 bg-yellow-50 border-yellow-200") :
                        s.action === "LOGIN" ? "badge-success text-green-700 bg-green-50 border-green-200" :
                        s.action === "LOGOUT" ? "badge-ghost text-gray-500 bg-gray-50" :
                        "badge-error text-red-700 bg-red-50 border-red-200"
                      }`}>
                        {isSecurity ? s.status : (s.action === "FAILED_LOGIN" ? "FAILED" : s.action)}
                      </span>
                    </td>
                    <td className="px-4">
                      <CheckCircle2 size={16} className="text-green-500" />
                    </td>
                    <td className="px-4" onClick={(e) => e.stopPropagation()}>
                      <button className="p-1 hover:bg-gray-100 rounded">
                        <X size={14} className="text-gray-400" />
                      </button>
                    </td>
                  </motion.tr>
                );
              })}
            </tbody>
          </table>
          {getDisplayData().length === 0 && (
            <div className="p-12 text-center">
              <History size={40} className="mx-auto text-gray-200 mb-3" />
              <p className="text-gray-500">No events found for this criteria.</p>
            </div>
          )}
        </div>
      </div>

      {/* Session Detail Panel */}
      <AnimatePresence>
        {selected && (
          <motion.aside
            key="session-panel"
            initial={{ x: 320, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 320, opacity: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 28 }}
            className="w-80 flex-shrink-0 bg-white border-l border-gray-200 overflow-y-auto"
          >
            <div className="p-5">
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-semibold text-gray-800">Event Details</h3>
                <button onClick={() => setSelected(null)} className="btn btn-ghost btn-xs btn-square">
                  <X size={14} />
                </button>
              </div>

              {/* User */}
              <div className="flex items-center gap-3 mb-6 pb-6 border-b border-gray-100">
                <div className={`w-12 h-12 rounded-full bg-indigo-600 text-white font-bold text-lg flex items-center justify-center`}>
                  {(selected.user?.initials || selected.user?.name?.substring(0, 1) || selected.actorName?.substring(0, 1) || "U")}
                </div>
                <div>
                  <p className="font-semibold text-gray-800 text-base">{selected.user?.name || selected.actorName || "System"}</p>
                  <p className="text-sm text-gray-500">{selected.user?.role || "System Process"}</p>
                </div>
              </div>

              {/* Details */}
              <div className="space-y-3 mb-6 pb-6 border-b border-gray-100">
                <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Properties</h4>
                {[
                  { label: "Event ID", value: selected.id },
                  { label: "Action/Type", value: selected.action || selected.title },
                  { label: "IP Address", value: selected.ipAddress || getMetadata(selected.note).ip },
                  { label: "Timestamp", value: new Date(selected.createdAt).toLocaleString() },
                  { label: "Severity", value: selected.severity || "Info" },
                ].map(({ label, value }) => (
                  <div key={label} className="flex justify-between items-start gap-4">
                    <span className="text-xs text-gray-500 whitespace-nowrap">{label}</span>
                    <span className="text-xs font-medium text-gray-800 text-right break-all">{value}</span>
                  </div>
                ))}
              </div>

              {/* Note / Body */}
              <div className="mb-6 pb-6 border-b border-gray-100">
                <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Message</h4>
                <div className="p-3 bg-gray-50 rounded-lg border border-gray-100">
                  <p className="text-xs text-gray-600 leading-relaxed">
                    {selected.body || getMetadata(selected.note).message || "No additional information."}
                  </p>
                </div>
              </div>

              {/* Context */}
              {selected.summary && (
                <div className="mb-6">
                  <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Security Analysis</h4>
                  <div className="p-3 bg-red-50 rounded-lg border border-red-100">
                    <p className="text-xs text-red-700 leading-relaxed">
                      {selected.summary}
                    </p>
                  </div>
                </div>
              )}

              <div className="space-y-2 mt-auto pt-4">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="btn btn-sm w-full bg-white border-gray-200 text-gray-700 hover:bg-gray-50"
                  onClick={() => {
                    const email = selected.user?.email;
                    if (email) window.open(`mailto:${email}`);
                  }}
                >
                  Contact User
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="btn btn-error btn-outline btn-sm w-full"
                  onClick={() => {
                    if (confirm("Are you sure you want to flag this event for investigation?")) {
                      alert("Event flagged for admin review.");
                    }
                  }}
                >
                  Investigate
                </motion.button>
              </div>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>
    </div>
  );
}

