"use client"
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
  Eye,
  RefreshCw,
  Search,
} from "lucide-react";
import toast from "react-hot-toast";

const slideInRight = {
  initial: { opacity: 0, x: 40 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: 40 },
};

export default function AlertsView() {
  const [selectedAlertIdx, setSelectedAlertIdx] = useState(0);
  const [alerts, setAlerts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isScanning, setIsScanning] = useState(false);

  const getSeverity = (title: string) => {
    if (title.includes("Spike") || title.includes("Repeated") || title.includes("High") || title.includes("Multiple")) return "High";
    if (title.includes("Restricted") || title.includes("Attempt") || title.includes("External") || title.includes("Security")) return "Medium";
    return "Low";
  };

  const fetchAlerts = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/alerts");
      const data = await res.json();
      if (Array.isArray(data)) {
        const mapped = data.map((a: any) => ({
          id: a.id,
          severity: a.severity || getSeverity(a.title),
          label: a.title,
          sub: a.body || "No additional details",
          summary: a.summary,
          user: a.user?.name || "System",
          userRole: a.user?.role || "Staff",
          userInitials: a.user?.initials || "S",
          client: a.lead?.contactName || "—",
          type: a.title,
          time: new Date(a.createdAt).toLocaleString('en-IN', {
            day: '2-digit', month: 'short', year: 'numeric',
            hour: '2-digit', minute: '2-digit', hour12: true
          }),
          status: a.status ? a.status.charAt(0) + a.status.slice(1).toLowerCase() : "New",
          ipAddress: a.ipAddress || "—",
          device: a.device || "—",
          location: a.location || "—",
          raw: a
        }));
        setAlerts(mapped);
      }
    } catch (err) {
      toast.error("Failed to load alerts");
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (id: string, status: string) => {
    try {
      await fetch("/api/alerts", {
        method: "PATCH",
        body: JSON.stringify({ id, status: status.toUpperCase() })
      });
      toast.success(`Status updated to ${status}`);
      fetchAlerts();
    } catch (err) {
      toast.error("Failed to update status");
    }
  };

  const runScan = async () => {
    setIsScanning(true);
    const t = toast.loading("EWS Scanning logs...");
    try {
      const res = await fetch("/api/audit/scan", { method: "POST" });
      const data = await res.json();
      toast.success(`Scan complete! Found ${data.count} new alerts.`, { id: t });
      fetchAlerts();
    } catch (err) {
      toast.error("Scan failed", { id: t });
    } finally {
      setIsScanning(false);
    }
  };

  useEffect(() => {
    fetchAlerts();
  }, []);

  const severityColor = (s: string) => ({
    High: "text-red-600 bg-red-50 border-red-200",
    Medium: "text-orange-600 bg-orange-50 border-orange-200",
    Low: "text-blue-600 bg-blue-50 border-blue-200",
  }[s] as string ?? "");

  const statusColor = (s: string) => ({
    New: "bg-red-100 text-red-700",
    Investigating: "bg-yellow-100 text-yellow-700",
    Monitoring: "bg-blue-100 text-blue-700",
    Resolved: "bg-green-100 text-green-700",
  }[s] as string ?? "");

  const a = alerts[selectedAlertIdx];

  return (
    <div className="flex flex-1 min-h-0 bg-gray-50 overflow-hidden">
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
              <div className="flex gap-2">
                <button 
                  onClick={runScan}
                  disabled={isScanning}
                  className="flex items-center gap-1.5 text-xs text-blue-600 border border-blue-200 bg-blue-50 rounded-lg px-3 py-2 hover:bg-blue-100 transition-colors disabled:opacity-50"
                >
                  <Search size={12} className={isScanning ? "animate-spin" : ""} /> {isScanning ? "Scanning..." : "Scan for Suspicious Activity"}
                </button>
              </div>
            </div>

            <div className="flex gap-1 overflow-x-auto pb-1">
              {[
                { label: "All Alerts", count: alerts.length, active: true },
                { label: "High", count: alerts.filter(x => x.severity === "High").length, color: "text-red-600" },
                { label: "Medium", count: alerts.filter(x => x.severity === "Medium").length, color: "text-orange-600" },
                { label: "Low", count: alerts.filter(x => x.severity === "Low").length, color: "text-blue-600" },
                { label: "Resolved", count: alerts.filter(x => x.status === "Resolved").length },
              ].map((t) => (
                <button
                  key={t.label}
                  className={`px-4 py-2 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap ${t.active ? "bg-blue-600 text-white" : "text-gray-500 hover:bg-gray-100"}`}
                >
                  {t.label} {t.count > 0 && <span className={`ml-1 ${t.active ? "text-blue-200" : t.color}`}>{t.count}</span>}
                </button>
              ))}
            </div>
          </div>

          <div className="p-4 flex gap-2 border-b border-gray-100 bg-white overflow-x-auto">
            {[
              { label: "Latest", icon: Clock },
              { label: "All Types" },
              { label: "All Users" },
              { label: "All Leads / Clients" },
              { label: "All Status" },
            ].map(({ label }, i) => (
              <button key={i} className="flex items-center gap-1.5 text-xs text-gray-600 border border-gray-200 rounded-lg px-3 py-1.5 hover:bg-gray-50 transition-colors whitespace-nowrap">
                {label} <ChevronDown size={12} />
              </button>
            ))}
            <button className="flex items-center gap-1.5 text-xs text-gray-600 border border-gray-200 rounded-lg px-3 py-1.5 hover:bg-gray-50 whitespace-nowrap">
              <Filter size={12} /> Filters
            </button>
            <button onClick={fetchAlerts} className="text-xs text-blue-500 hover:underline ml-auto flex items-center gap-1">
              <RefreshCw size={12} className={loading ? "animate-spin" : ""} /> Refresh
            </button>
          </div>

          <div className="flex-1 overflow-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  {["Severity", "Alert", "User", "Lead / Client", "Type", "Time", "Status", "Actions"].map(h => (
                    <th key={h} className="px-4 py-3 text-left text-[11px] font-semibold text-gray-500 uppercase tracking-wide">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {alerts.map((row, i) => (
                  <motion.tr
                    key={row.id}
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                    onClick={() => setSelectedAlertIdx(i)}
                    className={`border-b border-gray-100 cursor-pointer transition-colors ${selectedAlertIdx === i ? "bg-blue-50" : "hover:bg-gray-50"}`}
                  >
                    <td className="px-4 py-3">
                      <span className={`flex items-center gap-1.5 text-[11px] font-bold px-2 py-1 rounded-lg border w-fit ${severityColor(row.severity)}`}>
                        <AlertTriangle size={10} /> {row.severity}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <p className="font-semibold text-gray-800">{row.label}</p>
                      <p className="text-gray-400">{row.sub}</p>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5">
                        <div className="w-5 h-5 rounded-full bg-blue-100 text-blue-700 font-bold text-[9px] flex items-center justify-center">
                          {row.userInitials}
                        </div>
                        <span className="text-gray-700">{row.user}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-gray-600">{row.client}</td>
                    <td className="px-4 py-3 text-gray-500">{row.type}</td>
                    <td className="px-4 py-3 text-gray-500 whitespace-nowrap">{row.time}</td>
                    <td className="px-4 py-3">
                      <span className={`text-[10px] font-bold px-2 py-1 rounded-full ${statusColor(row.status)}`}>{row.status}</span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button className="text-gray-400 hover:text-gray-600"><MoreHorizontal size={16} /></button>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex items-center justify-between p-4 bg-white border-t border-gray-100 shrink-0">
            <p className="text-xs text-gray-400">Showing {alerts.length} alerts</p>
            <div className="flex items-center gap-1">
              <button className="w-7 h-7 flex items-center justify-center rounded hover:bg-gray-100"><ChevronLeft size={14} /></button>
              {[1].map(n => (
                <button key={n} className={`w-7 h-7 text-xs rounded transition-colors ${n === 1 ? "bg-blue-600 text-white" : "hover:bg-gray-100 text-gray-600"}`}>{n}</button>
              ))}
              <button className="w-7 h-7 flex items-center justify-center rounded hover:bg-gray-100"><ChevronRight size={14} /></button>
            </div>
          </div>
        </div>

        {/* Alert detail panel */}
        <AnimatePresence mode="wait">
          {a && (
            <motion.div
              key={a.id}
              variants={slideInRight}
              initial="initial"
              animate="animate"
              exit="exit"
              className="w-72 border-l border-gray-200 bg-white overflow-y-auto shrink-0 hidden md:block"
            >
              <div className="p-4 border-b border-gray-100 flex items-center justify-between">
                <span className={`text-[11px] font-bold px-3 py-1 rounded-full ${a.severity === "High" ? "bg-red-500 text-white" : a.severity === "Medium" ? "bg-orange-500 text-white" : "bg-blue-500 text-white"}`}>
                  {a.severity}
                </span>
                <button className="text-gray-400 hover:text-gray-600" onClick={() => setSelectedAlertIdx(-1)}><X size={14} /></button>
              </div>

              <div className="p-4">
                <p className="text-sm font-bold text-gray-900 mb-0.5">{a.label}</p>
                <p className="text-[11px] text-blue-500 mb-4">Alert ID: EWS-{a.id.substring(0, 8).toUpperCase()}</p>

                <div className="bg-gray-50 rounded-lg p-3 mb-4">
                  <p className="text-xs font-semibold text-gray-700 mb-1">Summary</p>
                  <p className="text-[11px] text-gray-500 leading-relaxed">
                    {a.summary || `${a.user} triggered a ${a.type} alert.`}
                  </p>
                </div>

                <p className="text-xs font-bold text-gray-700 mb-2">Details</p>
                {[
                  ["User", a.user + ` (${a.userRole === "ORG_ADMIN" ? "Admin" : a.userRole === "MANAGER" ? "Manager" : "Employee"})`],
                  ["Lead / Client", a.client],
                  ["IP Address", a.ipAddress],
                  ["Device", a.device],
                  ["Location", a.location],
                  ["Time", a.time],
                ].map(([k, v]) => (
                  <div key={k} className="flex justify-between py-2 border-b border-gray-50">
                    <span className="text-[11px] text-gray-400">{k}</span>
                    <span className="text-[11px] font-medium text-gray-700 text-right max-w-[60%] truncate">{v}</span>
                  </div>
                ))}

                <div className="mt-4 pt-4 border-t border-gray-100">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-xs font-bold text-gray-700">Actions</p>
                    <select 
                      value={a.status}
                      onChange={(e) => updateStatus(a.id, e.target.value)}
                      className={`text-[11px] font-bold px-2 py-0.5 rounded-full border-none ring-1 ring-gray-100 cursor-pointer ${statusColor(a.status)}`}
                    >
                      <option value="New">New</option>
                      <option value="Investigating">Investigating</option>
                      <option value="Monitoring">Monitoring</option>
                      <option value="Resolved">Resolved</option>
                    </select>
                  </div>
                  <div className="flex gap-2">
                    <button className="flex-1 text-xs border border-gray-200 rounded-lg py-2 hover:bg-gray-50 transition-colors">Add Note</button>
                    <button 
                      onClick={() => updateStatus(a.id, "Resolved")}
                      className="flex-1 text-xs bg-red-600 text-white rounded-lg py-2 hover:bg-red-700 transition-colors"
                    >
                      Resolve
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
