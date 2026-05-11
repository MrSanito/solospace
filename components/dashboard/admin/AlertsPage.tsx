import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Info,
  Settings,
  Download,
  Clock,
  ChevronDown,
  Filter,
  AlertTriangle,
  MoreHorizontal,
  ChevronLeft,
  ChevronRight,
  X,
} from "lucide-react";
import PermissionGuard from "@/components/auth/PermissionGuard";
import { PermissionKey } from "@prisma/client";

const slideInRight = {
  initial: { opacity: 0, x: 40 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: 40 },
};

export default function AlertsPage() {
  const [alerts, setAlerts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedAlert, setSelectedAlert] = useState(0);

  useEffect(() => {
    fetchAlerts();
  }, []);

  const fetchAlerts = async () => {
    try {
      const res = await fetch("/api/alerts");
      if (res.ok) {
        const data = await res.json();
        setAlerts(data);
      }
    } catch (error) {
      console.error("Failed to fetch alerts");
    } finally {
      setLoading(false);
    }
  };

  const severityColor = (s: string) => ({
    High: "text-red-600 bg-red-50 border-red-200",
    Medium: "text-orange-600 bg-orange-50 border-orange-200",
    Low: "text-blue-600 bg-blue-50 border-blue-200",
  }[s] ?? "");

  const statusColor = (s: string) => ({
    New: "bg-red-100 text-red-700",
    Investigating: "bg-yellow-100 text-yellow-700",
    Monitoring: "bg-blue-100 text-blue-700",
    Resolved: "bg-green-100 text-green-700",
  }[s] ?? "");

  const a = alerts[selectedAlert];

  return (
    <PermissionGuard permission={PermissionKey.AUDIT_LOGS}>
      <div className="flex flex-1 min-h-0 bg-gray-50">
      <div className="flex flex-1 min-h-0">
        <div className="flex-1 flex flex-col min-w-0">
          <div className="px-6 pt-6 pb-4 bg-white border-b border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h1 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                  Alerts / EWS <Info size={14} className="text-gray-400" />
                </h1>
                <p className="text-sm text-gray-400">Early Warning System to detect and flag abnormal or risky activities.</p>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 px-2.5 py-1 bg-gray-50 text-gray-400 rounded-full text-[10px] font-bold border border-gray-200/50">
                  <div className="w-1.5 h-1.5 rounded-full bg-gray-300 animate-pulse"></div>
                  AI AGENT PLUGIN — EMPTY
                </div>
                <button className="flex items-center gap-1.5 text-xs text-gray-600 border border-gray-200 rounded-lg px-3 py-2 hover:bg-gray-50 transition-colors">
                  <Settings size={12} /> Configure Rules
                </button>
                <button className="flex items-center gap-1.5 text-xs text-gray-600 border border-gray-200 rounded-lg px-3 py-2 hover:bg-gray-50 transition-colors">
                  <Download size={12} /> Export
                </button>
              </div>
            </div>

            <div className="flex gap-1">
              {[
                { label: "All Alerts", count: alerts.length, active: true },
                { label: "High", count: alerts.filter(x => x.severity === "High").length, color: "text-red-600" },
                { label: "Medium", count: alerts.filter(x => x.severity === "Medium").length, color: "text-orange-600" },
                { label: "Low", count: alerts.filter(x => x.severity === "Low").length, color: "text-blue-600" },
                { label: "Resolved", count: alerts.filter(x => x.status === "RESOLVED").length },
              ].map((t) => (
                <button
                  key={t.label}
                  className={`px-4 py-2 text-xs font-semibold rounded-lg transition-colors ${t.active ? "bg-blue-600 text-white" : "text-gray-500 hover:bg-gray-100"}`}
                >
                  {t.label} {t.count > 0 && <span className={`ml-1 ${t.active ? "text-blue-200" : t.color}`}>{t.count}</span>}
                </button>
              ))}
            </div>
          </div>

          <div className="p-4 flex gap-2 border-b border-gray-100 bg-white">
            {[
              { label: "12 Apr – 19 Apr 2024", icon: Clock },
              { label: "All Types" },
              { label: "All Users" },
              { label: "All Leads / Clients" },
              { label: "All Status" },
            ].map(({ label }, i) => (
              <button key={i} className="flex items-center gap-1.5 text-xs text-gray-600 border border-gray-200 rounded-lg px-3 py-1.5 hover:bg-gray-50 transition-colors">
                {label} <ChevronDown size={12} />
              </button>
            ))}
            <button className="flex items-center gap-1.5 text-xs text-gray-600 border border-gray-200 rounded-lg px-3 py-1.5 hover:bg-gray-50">
              <Filter size={12} /> Filters
            </button>
            <button className="text-xs text-blue-500 hover:underline ml-auto">Reset</button>
          </div>

          <div className="flex-1 overflow-y-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  {["Severity", "Alert", "User", "Lead / Client", "Type", "Time", "Status", "Actions"].map(h => (
                    <th key={h} className="px-4 py-3 text-left text-[11px] font-semibold text-gray-500 uppercase tracking-wide">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={8} className="text-center py-12">
                      <span className="loading loading-spinner loading-md text-blue-600" />
                    </td>
                  </tr>
                ) : alerts.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="text-center py-12 text-gray-500">
                      No security alerts found.
                    </td>
                  </tr>
                ) : (
                  alerts.map((row, i) => (
                    <motion.tr
                      key={row.id || i}
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.05 }}
                      onClick={() => setSelectedAlert(i)}
                      className={`border-b border-gray-100 cursor-pointer transition-colors ${selectedAlert === i ? "bg-blue-50" : "hover:bg-gray-50"}`}
                    >
                      <td className="px-4 py-3">
                        <span className={`flex items-center gap-1.5 text-[11px] font-bold px-2 py-1 rounded-lg border w-fit ${severityColor(row.severity)}`}>
                          <AlertTriangle size={10} /> {row.severity}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <p className="font-semibold text-gray-800">{row.title}</p>
                        <p className="text-gray-400">{row.body}</p>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1.5">
                          <div className="w-5 h-5 rounded-full bg-blue-100 text-blue-700 font-bold text-[9px] flex items-center justify-center uppercase">
                            {row.user?.name?.split(" ").map((n: string) => n[0]).join("") || "U"}
                          </div>
                          <span className="text-gray-700">{row.user?.name || "System"}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-gray-600">{row.lead?.contactName || "—"}</td>
                      <td className="px-4 py-3 text-gray-500">{row.title}</td>
                      <td className="px-4 py-3 text-gray-500 whitespace-nowrap">
                        {new Date(row.createdAt).toLocaleString()}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`text-[10px] font-bold px-2 py-1 rounded-full ${statusColor(row.status)}`}>{row.status}</span>
                      </td>
                      <td className="px-4 py-3">
                        <button className="text-gray-400 hover:text-gray-600"><MoreHorizontal size={16} /></button>
                      </td>
                    </motion.tr>
                  ))
                )}
              </tbody>
            </table>

            <div className="flex items-center justify-between p-4 bg-white border-t border-gray-100">
              <p className="text-xs text-gray-400">Showing 1 to 8 of 37 alerts</p>
              <div className="flex items-center gap-1">
                <button className="w-7 h-7 flex items-center justify-center rounded hover:bg-gray-100"><ChevronLeft size={14} /></button>
                {[1,2,3,4,5].map(n => (
                  <button key={n} className={`w-7 h-7 text-xs rounded transition-colors ${n === 1 ? "bg-blue-600 text-white" : "hover:bg-gray-100 text-gray-600"}`}>{n}</button>
                ))}
                <button className="w-7 h-7 flex items-center justify-center rounded hover:bg-gray-100"><ChevronRight size={14} /></button>
              </div>
              <div className="flex items-center gap-2 text-xs text-gray-500">Rows per page: <span className="font-medium">10</span> <ChevronDown size={12} /></div>
            </div>
          </div>

          {/* Alert summary bar */}
          <div className="bg-[#0d1117] px-6 py-3 flex items-center gap-6 text-xs shrink-0">
            <p className="text-gray-400 font-semibold">Alert Summary</p>
            <span className="font-bold text-red-400">12 High</span>
            <span className="font-bold text-orange-400">18 Medium</span>
            <span className="font-bold text-blue-400">7 Low</span>
            <button className="ml-auto text-blue-400 hover:underline">View all alerts →</button>
          </div>
        </div>

        {/* Alert detail panel */}
        <AnimatePresence mode="wait">
          <motion.div
            key={selectedAlert}
            variants={slideInRight}
            initial="initial"
            animate="animate"
            exit="exit"
            className="w-72 border-l border-gray-200 bg-white overflow-y-auto shrink-0"
          >
            <div className="p-4 border-b border-gray-100 flex items-center justify-between">
              <span className={`text-[11px] font-bold px-3 py-1 rounded-full ${a.severity === "High" ? "bg-red-500 text-white" : a.severity === "Medium" ? "bg-orange-500 text-white" : "bg-blue-500 text-white"}`}>
                {a.severity}
              </span>
              <button className="text-gray-400 hover:text-gray-600" onClick={() => setSelectedAlert(-1 as any)}><X size={14} /></button>
            </div>

            {a && (
              <div className="p-4">
                <p className="text-sm font-bold text-gray-900 mb-0.5">{a.title}</p>
                <p className="text-[11px] text-blue-500 mb-4">Alert ID: {a.id.substring(0, 8).toUpperCase()}</p>

                <div className="bg-gray-50 rounded-lg p-3 mb-4">
                  <p className="text-xs font-semibold text-gray-700 mb-1">Summary</p>
                  <p className="text-[11px] text-gray-500">{a.summary || a.body}</p>
                </div>

                <p className="text-xs font-bold text-gray-700 mb-2">Details</p>
                {[
                  ["User", (a.user?.name || "System") + ` (${a.user?.role || "SYSTEM"})`],
                  ["Lead / Client", a.lead?.contactName || "—"],
                  ["IP Address", a.ipAddress || "—"],
                  ["Device", a.device || "—"],
                  ["Location", a.location || "—"],
                  ["Time", new Date(a.createdAt).toLocaleString()],
                ].map(([k, v]) => (
                  <div key={k} className="flex justify-between py-2 border-b border-gray-50">
                    <span className="text-[11px] text-gray-400">{k}</span>
                    <span className="text-[11px] font-medium text-gray-700 text-right max-w-[60%]">{v}</span>
                  </div>
                ))}

                <div className="mt-4">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-xs font-bold text-gray-700">Files Downloaded (12)</p>
                    <button className="text-[11px] text-blue-500">View all</button>
                  </div>
                  {[
                    { name: "Brochure_Honda_City_ZX.pdf", size: "2.4 MB", type: "PDF" },
                    { name: "Variant_Price_List.docx", size: "320 KB", type: "DOC" },
                  ].map((f) => (
                    <div key={f.name} className="flex items-center gap-2 py-2">
                      <div className={`w-7 h-7 rounded flex items-center justify-center text-[9px] font-bold ${f.type === "PDF" ? "bg-red-100 text-red-600" : "bg-blue-100 text-blue-600"}`}>{f.type}</div>
                      <div className="min-w-0 flex-1">
                        <p className="text-[11px] font-medium text-gray-800 truncate">{f.name}</p>
                        <p className="text-[10px] text-gray-400">{f.size}</p>
                      </div>
                    </div>
                  ))}
                  <p className="text-[11px] text-blue-500 cursor-pointer">+10 more files</p>
                </div>

                <div className="mt-4">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-xs font-bold text-gray-700">Actions</p>
                    <span className="text-[11px] text-orange-600 bg-orange-50 px-2 py-0.5 rounded-full flex items-center gap-1">Investigating <ChevronDown size={10} /></span>
                  </div>
                  <div className="flex gap-2">
                    <button className="flex-1 text-xs border border-gray-200 rounded-lg py-2 hover:bg-gray-50 transition-colors">Add Note</button>
                    <button className="flex-1 text-xs bg-red-600 text-white rounded-lg py-2 hover:bg-red-700 transition-colors">Resolve Alert</button>
                  </div>
                </div>

                <div className="mt-4">
                  <p className="text-xs font-bold text-gray-700 mb-2">Notes</p>
                  <div className="flex gap-2">
                    <div className="w-6 h-6 rounded-full bg-blue-600 text-white text-[9px] font-bold flex items-center justify-center shrink-0">OM</div>
                    <div className="bg-gray-50 rounded-lg p-2 flex-1">
                      <p className="text-[11px] font-semibold text-gray-700">Owner</p>
                      <p className="text-[11px] text-gray-500">Marked as investigating. Will review audit logs.</p>
                      <p className="text-[10px] text-gray-400 mt-1">19 Apr 2024, 11:30 AM</p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
        </div>
      </div>
    </PermissionGuard>
  );
}
