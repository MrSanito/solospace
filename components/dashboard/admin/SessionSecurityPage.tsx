import { useState } from "react";
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
} from "lucide-react";

const sessions = [
  { initials: "RM", color: "bg-blue-600", name: "Rahul Mehta", role: "Owner", sessionId: "sess_7f3a2b8d8c4e", device: "Chrome on Windows", os: "Windows 11", ip: "106.201.45.12", location: "Mumbai, India", loginTime: "19 Apr 2024, 11:28 AM", lastActive: "1 min ago", status: "Active", mfa: true },
  { initials: "AS", color: "bg-indigo-600", name: "Amit Sharma", role: "Employee", sessionId: "sess_3ab81d9e2f7c", device: "Chrome on macOS", os: "macOS 14", ip: "182.68.11.23", location: "New Delhi, India", loginTime: "19 Apr 2024, 11:22 AM", lastActive: "2 min ago", status: "Active", mfa: true },
  { initials: "PP", color: "bg-pink-600", name: "Pooja Patel", role: "Employee", sessionId: "sess_8c2f1d3a6b91", device: "Edge on Windows", os: "Windows 11", ip: "117.207.14.66", location: "Ahmedabad, India", loginTime: "19 Apr 2024, 10:58 AM", lastActive: "15 min ago", status: "Active", mfa: true },
  { initials: "KT", color: "bg-teal-600", name: "Karan Trivedi", role: "Employee", sessionId: "sess_9d7e2c5b0a11", device: "Chrome on Android", os: "Android 14", ip: "152.58.23.90", location: "Bengaluru, India", loginTime: "19 Apr 2024, 10:45 AM", lastActive: "27 min ago", status: "Active", mfa: true },
  { initials: "NS", color: "bg-orange-500", name: "Neha Singh", role: "Employee", sessionId: "sess_1d9a8e2f7c30", device: "Safari on iPhone", os: "iOS 17.4", ip: "103.21.45.78", location: "Pune, India", loginTime: "19 Apr 2024, 10:15 AM", lastActive: "45 min ago", status: "Active", mfa: true },
  { initials: "SM", color: "bg-violet-600", name: "Sandeep Mishra", role: "Employee", sessionId: "sess_6b2d4f1e9a55", device: "Firefox on Windows", os: "Windows 10", ip: "103.45.67.89", location: "Jaipur, India", loginTime: "19 Apr 2024, 09:32 AM", lastActive: "1 hr ago", status: "Idle", mfa: true },
  { initials: "JP", color: "bg-cyan-600", name: "Jignesh Parmar", role: "Employee", sessionId: "sess_4f1a7c3d6b22", device: "Chrome on Windows", os: "Windows 11", ip: "49.205.12.33", location: "Surat, India", loginTime: "19 Apr 2024, 09:10 AM", lastActive: "2 hrs ago", status: "Logged Out", mfa: false },
  { initials: "MM", color: "bg-amber-600", name: "Mehul Modi", role: "Employee", sessionId: "sess_2c6a9e1b4d88", device: "Chrome on Android", os: "Android 13", ip: "2405:201:c0d8:1234:1", location: "Vadodara, India", loginTime: "19 Apr 2024, 08:42 AM", lastActive: "3 hrs ago", status: "Logged Out", mfa: false },
  { initials: "RS", color: "bg-rose-500", name: "Riya Shah", role: "Employee", sessionId: "sess_5e6b2a9c8d77", device: "Safari on macOS", os: "macOS 14", ip: "106.193.28.11", location: "Chennai, India", loginTime: "19 Apr 2024, 08:21 AM", lastActive: "4 hrs ago", status: "Logged Out", mfa: false },
  { initials: "NK", color: "bg-slate-600", name: "Nilesh Kothari", role: "Employee", sessionId: "sess_0a7d6e3b9f44", device: "Chrome on Windows", os: "Windows 10", ip: "183.82.19.20", location: "Kolkata, India", loginTime: "19 Apr 2024, 07:55 AM", lastActive: "5 hrs ago", status: "Logged Out", mfa: false },
];

const stats = [
  { label: "Active Sessions", value: "18", change: "+3 vs yesterday", positive: true },
  { label: "Unique Logins (24h)", value: "64", change: "+12% vs yesterday", positive: true },
  { label: "Failed Login Attempts (24h)", value: "7", change: "-13% vs yesterday", positive: true },
  { label: "Suspicious Events (24h)", value: "3", change: "View details →", positive: false },
  { label: "MFA Adoption", value: "92%", change: "+6% vs last 7 days", positive: true },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.06 } },
};
const itemVariants = {
  hidden: { opacity: 0, y: 14 },
  visible: { opacity: 1, y: 0 },
};

export default function SessionSecurityPage() {
  const [selected, setSelected] = useState(sessions[0]);
  const [activeTab, setActiveTab] = useState("Active Sessions");
  const tabs = ["Active Sessions", "Login History", "Security Events", "Devices", "Location History"];

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
          <button className="btn btn-sm btn-ghost btn-square border border-gray-200 bg-white">
            <RefreshCw size={14} />
          </button>
        </div>

        <div className="flex items-center justify-between mb-3">
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              placeholder="Search sessions..."
              className="pl-8 pr-3 py-2 text-sm border border-gray-200 rounded-lg w-64 focus:outline-none focus:ring-2 focus:ring-blue-500/20 bg-white"
            />
          </div>
          <span className="text-sm text-gray-500">Showing 1 to 10 of 18 sessions</span>
        </div>

        {/* Table */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-x-auto">
          <table className="table table-sm w-full">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                {["User", "Session ID", "Device / Browser", "IP Address", "Location", "Login Time", "Last Active", "Status", "MFA", "Actions"].map((h) => (
                  <th key={h} className="text-xs font-semibold text-gray-500 py-3 text-left px-4">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {sessions.map((s, i) => (
                <motion.tr
                  key={s.sessionId}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.04 }}
                  onClick={() => setSelected(s)}
                  className={`border-b border-gray-100 cursor-pointer transition-colors hover:bg-blue-50/30 ${
                    selected?.sessionId === s.sessionId ? "bg-blue-50/60" : ""
                  }`}
                >
                  <td className="py-2.5 px-4">
                    <div className="flex items-center gap-2">
                      <div className={`w-7 h-7 rounded-full ${s.color} text-white text-xs font-bold flex items-center justify-center`}>
                        {s.initials}
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-gray-800">{s.name}</p>
                        <p className="text-xs text-gray-400">{s.role}</p>
                      </div>
                    </div>
                  </td>
                  <td className="text-xs font-mono text-gray-600 px-4">{s.sessionId}</td>
                  <td className="px-4">
                    <p className="text-xs text-gray-700">{s.device}</p>
                    <p className="text-xs text-gray-400">{s.os}</p>
                  </td>
                  <td className="text-xs font-mono text-gray-600 px-4">{s.ip}</td>
                  <td className="text-xs text-gray-700 px-4">🇮🇳 {s.location}</td>
                  <td className="px-4">
                    <p className="text-xs text-gray-700">{s.loginTime}</p>
                  </td>
                  <td className="text-xs text-gray-500 px-4">{s.lastActive}</td>
                  <td className="px-4">
                    <span className={`badge badge-sm font-medium ${
                      s.status === "Active" ? "badge-success text-green-700 bg-green-50 border-green-200" :
                      s.status === "Idle" ? "badge-warning text-yellow-700 bg-yellow-50 border-yellow-200" :
                      "badge-ghost text-gray-500 bg-gray-50"
                    }`}>
                      {s.status}
                    </span>
                  </td>
                  <td className="px-4">
                    {s.mfa ? (
                      <CheckCircle2 size={16} className="text-green-500" />
                    ) : (
                      <Minus size={16} className="text-gray-300" />
                    )}
                  </td>
                  <td className="px-4" onClick={(e) => e.stopPropagation()}>
                    <button className="p-1 hover:bg-gray-100 rounded">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-gray-400">
                        <circle cx="12" cy="12" r="1"/><circle cx="12" cy="5" r="1"/><circle cx="12" cy="19" r="1"/>
                      </svg>
                    </button>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between mt-4 text-sm text-gray-500">
          <span>Showing 1 to 10 of 18 sessions</span>
          <div className="flex items-center gap-2">
            <button className="btn btn-xs btn-ghost"><ChevronLeft size={14} /></button>
            <button className="btn btn-xs btn-primary">1</button>
            <button className="btn btn-xs btn-ghost">2</button>
            <button className="btn btn-xs btn-ghost"><ChevronRight size={14} /></button>
          </div>
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
            className="w-72 flex-shrink-0 bg-white border-l border-gray-200 overflow-y-auto"
          >
            <div className="p-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-gray-800">Session Details</h3>
                <button onClick={() => setSelected(null as any)} className="btn btn-ghost btn-xs btn-square">
                  <X size={14} />
                </button>
              </div>

              {/* User */}
              <div className="flex items-center gap-3 mb-4 pb-4 border-b border-gray-100">
                <div className={`w-10 h-10 rounded-full ${selected.color} text-white font-bold text-sm flex items-center justify-center`}>
                  {selected.initials}
                </div>
                <div>
                  <p className="font-semibold text-gray-800">{selected.name}</p>
                  <p className="text-xs text-gray-500">{selected.role}</p>
                </div>
                <span className="ml-auto badge badge-success badge-sm text-green-700 bg-green-50 border-green-200">
                  Active
                </span>
              </div>

              {/* Details */}
              <div className="space-y-2 mb-4 pb-4 border-b border-gray-100">
                {[
                  { label: "Session ID", value: selected.sessionId },
                  { label: "Device / Browser", value: selected.device },
                  { label: "OS", value: selected.os },
                  { label: "IP Address", value: selected.ip },
                  { label: "Location", value: `🇮🇳 ${selected.location}` },
                  { label: "Login Time", value: selected.loginTime },
                  { label: "Last Active", value: selected.lastActive },
                  { label: "MFA", value: selected.mfa ? "Enabled" : "Disabled" },
                  { label: "Session Duration", value: "32 min" },
                ].map(({ label, value }) => (
                  <div key={label} className="flex justify-between">
                    <span className="text-xs text-gray-500">{label}</span>
                    <span className="text-xs font-medium text-gray-800 text-right max-w-[140px] truncate">{value}</span>
                  </div>
                ))}
              </div>

              {/* Security */}
              <div className="mb-4 pb-4 border-b border-gray-100">
                <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Security</h4>
                {[
                  { label: "Risk Level", value: "Low", color: "text-green-600" },
                  { label: "Device Trust", value: "Trusted", color: "text-green-600" },
                  { label: "IP Reputation", value: "Clean", color: "text-green-600" },
                ].map(({ label, value, color }) => (
                  <div key={label} className="flex justify-between py-1">
                    <span className="text-xs text-gray-500">{label}</span>
                    <span className={`text-xs font-semibold ${color} flex items-center gap-1`}>
                      <CheckCircle2 size={11} /> {value}
                    </span>
                  </div>
                ))}
              </div>

              {/* Recent Activity */}
              <div className="mb-4">
                <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Recent Activity</h4>
                <div className="space-y-2">
                  {[
                    { time: "11:28 AM", action: "Login successful", sub: "MFA authentication successful" },
                    { time: "11:28 AM", action: "Accessed Dashboard", sub: "" },
                    { time: "11:30 AM", action: "Viewed Lead Details", sub: "" },
                    { time: "11:35 AM", action: "Uploaded File", sub: "Brochure_Honda_City_ZX.pdf" },
                  ].map((ev, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, x: -8 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.07 }}
                      className="flex gap-2"
                    >
                      <span className="text-xs text-gray-400 w-16 flex-shrink-0">{ev.time}</span>
                      <div>
                        <p className="text-xs font-medium text-gray-700 flex items-center gap-1">
                          <CheckCircle2 size={10} className="text-green-500" /> {ev.action}
                        </p>
                        {ev.sub && <p className="text-xs text-gray-400">{ev.sub}</p>}
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="btn btn-error btn-outline btn-sm w-full"
              >
                Terminate Session
              </motion.button>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>
    </div>
  );
}
