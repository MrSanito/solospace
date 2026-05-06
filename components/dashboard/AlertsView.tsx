"use client"
import { useState } from "react";
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
} from "lucide-react";

const slideInRight = {
  initial: { opacity: 0, x: 40 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: 40 },
};

export default function AlertsView() {
  const [selectedAlert, setSelectedAlert] = useState(0);

  const alerts = [
    { severity: "High", label: "Abnormal download activity", sub: "12 files downloaded in short time", user: "Rahul Mehta", client: "Amit Sharma", type: "Download Spike", time: "19 Apr 2024, 11:28 AM", status: "New" },
    { severity: "High", label: "Access to restricted file", sub: "Viewed restricted file", user: "Amit Sharma", client: "Pooja Patel", type: "Restricted Access", time: "19 Apr 2024, 11:18 AM", status: "New" },
    { severity: "Medium", label: "WhatsApp escape attempt blocked", sub: "Multiple attempts detected", user: "Karan Trivedi", client: "Neha Singh", type: "Escape Attempt", time: "19 Apr 2024, 10:45 AM", status: "Investigating" },
    { severity: "Medium", label: "Repeated file access", sub: "Same file accessed multiple times", user: "Pooja Patel", client: "Amit Sharma", type: "Repeated Access", time: "19 Apr 2024, 10:30 AM", status: "New" },
    { severity: "High", label: "Login from new device", sub: "Unrecognized device detected", user: "Rahul Mehta", client: "—", type: "Security", time: "19 Apr 2024, 09:52 AM", status: "New" },
    { severity: "Low", label: "Bulk message to leads", sub: "High volume messages sent", user: "Amit Sharma", client: "Multiple Leads", type: "Message Spike", time: "19 Apr 2024, 09:10 AM", status: "Monitoring" },
    { severity: "Medium", label: "File upload to external source", sub: "File shared outside platform", user: "Neha Singh", client: "Vikram Tiwari", type: "External Share", time: "18 Apr 2024, 06:22 PM", status: "Investigating" },
    { severity: "Low", label: "Unusual login time", sub: "Login outside working hours", user: "Sandeep Mishra", client: "—", type: "Security", time: "18 Apr 2024, 11:47 PM", status: "Monitoring" },
  ];

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

  const a = alerts[selectedAlert];

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
                <button className="flex items-center gap-1.5 text-xs text-gray-600 border border-gray-200 rounded-lg px-3 py-2 hover:bg-gray-50 transition-colors">
                  <Settings size={12} /> Configure Rules
                </button>
                <button className="flex items-center gap-1.5 text-xs text-gray-600 border border-gray-200 rounded-lg px-3 py-2 hover:bg-gray-50 transition-colors">
                  <Download size={12} /> Export
                </button>
              </div>
            </div>

            <div className="flex gap-1 overflow-x-auto pb-1">
              {[
                { label: "All Alerts", count: 37, active: true },
                { label: "High", count: 12, color: "text-red-600" },
                { label: "Medium", count: 18, color: "text-orange-600" },
                { label: "Low", count: 7, color: "text-blue-600" },
                { label: "Resolved", count: 0 },
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
              { label: "12 Apr – 19 Apr 2024", icon: Clock },
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
            <button className="text-xs text-blue-500 hover:underline ml-auto">Reset</button>
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
                    key={i}
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
                      <p className="font-semibold text-gray-800">{row.label}</p>
                      <p className="text-gray-400">{row.sub}</p>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5">
                        <div className="w-5 h-5 rounded-full bg-blue-100 text-blue-700 font-bold text-[9px] flex items-center justify-center">
                          {row.user.split(" ").map(n => n[0]).join("")}
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
            <p className="text-xs text-gray-400">Showing 1 to 8 of 37 alerts</p>
            <div className="flex items-center gap-1">
              <button className="w-7 h-7 flex items-center justify-center rounded hover:bg-gray-100"><ChevronLeft size={14} /></button>
              {[1,2,3,4,5].map(n => (
                <button key={n} className={`w-7 h-7 text-xs rounded transition-colors ${n === 1 ? "bg-blue-600 text-white" : "hover:bg-gray-100 text-gray-600"}`}>{n}</button>
              ))}
              <button className="w-7 h-7 flex items-center justify-center rounded hover:bg-gray-100"><ChevronRight size={14} /></button>
            </div>
          </div>
        </div>

        {/* Alert detail panel */}
        <AnimatePresence mode="wait">
          {selectedAlert !== -1 && (
            <motion.div
              key={selectedAlert}
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
                <button className="text-gray-400 hover:text-gray-600" onClick={() => setSelectedAlert(-1)}><X size={14} /></button>
              </div>

              <div className="p-4">
                <p className="text-sm font-bold text-gray-900 mb-0.5">{a.label}</p>
                <p className="text-[11px] text-blue-500 mb-4">Alert ID: EWS-2024-0419-0001</p>

                <div className="bg-gray-50 rounded-lg p-3 mb-4">
                  <p className="text-xs font-semibold text-gray-700 mb-1">Summary</p>
                  <p className="text-[11px] text-gray-500">{a.user} {a.severity === "High" && a.type === "Download Spike" ? "downloaded 12 files in a short period of 2 minutes." : `triggered a ${a.type} alert.`}</p>
                </div>

                <p className="text-xs font-bold text-gray-700 mb-2">Details</p>
                {[
                  ["User", a.user + " (Employee)"],
                  ["Lead / Client", a.client],
                  ["IP Address", "106.201.45.12"],
                  ["Device", "Chrome on Windows"],
                  ["Location", "Mumbai, India"],
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
                    <span className="text-[11px] text-orange-600 bg-orange-50 px-2 py-0.5 rounded-full flex items-center gap-1">Investigating <ChevronDown size={10} /></span>
                  </div>
                  <div className="flex gap-2">
                    <button className="flex-1 text-xs border border-gray-200 rounded-lg py-2 hover:bg-gray-50 transition-colors">Add Note</button>
                    <button className="flex-1 text-xs bg-red-600 text-white rounded-lg py-2 hover:bg-red-700 transition-colors">Resolve</button>
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
