import { motion } from "framer-motion";
import {
  Users,
  Shield,
  MessageSquare,
  AlertCircle,
  TrendingUp,
  Clock,
  ArrowUpRight,
  ArrowDownRight,
  ChevronRight,
  FileText,
  AlertTriangle,
  Lock,
  Search,
} from "lucide-react";

const fadeUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
};

export default function OverviewPage() {
  const stats = [
    { label: "Active Employees", val: "128", trend: "+12", icon: Users, color: "text-blue-600", bg: "bg-blue-50" },
    { label: "Storage Used", val: "1.2 TB", trend: "+4%", icon: Shield, color: "text-indigo-600", bg: "bg-indigo-50" },
    { label: "Active Chats", val: "45", trend: "+15%", icon: MessageSquare, color: "text-purple-600", bg: "bg-purple-50" },
    { label: "Active Alerts", val: "12", trend: "-2", icon: AlertCircle, color: "text-red-600", bg: "bg-red-50" },
  ];

  return (
    <div className="flex-1 overflow-y-auto bg-gray-50 p-6">
      <motion.div initial="initial" animate="animate" variants={{ animate: { transition: { staggerChildren: 0.05 } } }}>
        <motion.div variants={fadeUp} className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Dashboard Overview</h1>
          <p className="text-gray-500 text-sm">Welcome back. Here's what's happening across your system today.</p>
        </motion.div>

        {/* Stats Grid */}
        <div className="grid grid-cols-4 gap-6 mb-8">
          {stats.map((s, i) => (
            <motion.div
              key={i}
              variants={fadeUp}
              className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow cursor-pointer"
            >
              <div className="flex justify-between items-start mb-4">
                <div className={`p-2.5 rounded-xl ${s.bg} ${s.color}`}>
                  <s.icon size={20} />
                </div>
                <div className={`flex items-center text-xs font-bold ${s.trend.startsWith("+") ? "text-green-600" : "text-red-600"}`}>
                  {s.trend} {s.trend.startsWith("+") ? <TrendingUp size={12} className="ml-1" /> : <TrendingUp size={12} className="ml-1 rotate-180" />}
                </div>
              </div>
              <p className="text-gray-400 text-xs font-medium uppercase tracking-wider mb-1">{s.label}</p>
              <p className="text-2xl font-bold text-gray-900 tracking-tight">{s.val}</p>
            </motion.div>
          ))}
        </div>

        <div className="grid grid-cols-12 gap-6 mb-8">
          {/* Main Chart Area */}
          <motion.div variants={fadeUp} className="col-span-8 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
            <div className="flex justify-between items-center mb-6">
              <div>
                <p className="text-sm font-bold text-gray-800">System Activity</p>
                <p className="text-[11px] text-gray-400">Activity across all modules in the last 24h</p>
              </div>
              <div className="flex gap-2">
                {["Day", "Week", "Month"].map((t, i) => (
                  <button key={t} className={`px-3 py-1 text-xs font-semibold rounded-lg transition-colors ${i === 1 ? "bg-blue-600 text-white" : "text-gray-500 hover:bg-gray-100"}`}>{t}</button>
                ))}
              </div>
            </div>

            <div className="h-[280px] w-full flex items-end justify-between gap-3 px-2">
              {[65, 45, 75, 55, 85, 40, 60, 95, 70, 50, 80, 65].map((h, i) => (
                <div key={i} className="flex-1 flex flex-col items-center gap-2 group">
                  <motion.div
                    initial={{ height: 0 }}
                    animate={{ height: `${h}%` }}
                    transition={{ duration: 1, delay: i * 0.05, ease: "easeOut" }}
                    className="w-full bg-blue-600 rounded-t-lg group-hover:bg-blue-700 transition-colors relative"
                  >
                    <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-gray-800 text-white text-[10px] font-bold px-1.5 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                      {h}%
                    </div>
                  </motion.div>
                  <span className="text-[10px] text-gray-400 font-medium">{["J", "F", "M", "A", "M", "J", "J", "A", "S", "O", "N", "D"][i]}</span>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Activity Timeline */}
          <motion.div variants={fadeUp} className="col-span-4 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col">
            <div className="flex justify-between items-center mb-6">
              <p className="text-sm font-bold text-gray-800">Recent Protocols</p>
              <button className="text-xs text-blue-600 font-bold hover:underline">View All</button>
            </div>
            <div className="space-y-6 flex-1">
              {[
                { type: "access", user: "Rahul Mehta", target: "Honda City ZX", time: "2 min ago", icon: Lock, color: "text-blue-600", bg: "bg-blue-50" },
                { type: "alert", user: "EWS System", target: "File Spike", time: "15 min ago", icon: AlertTriangle, color: "text-red-600", bg: "bg-red-50" },
                { type: "audit", user: "Sneha M.", target: "Permissions", time: "1h ago", icon: FileText, color: "text-indigo-600", bg: "bg-indigo-50" },
                { type: "chat", user: "Vikram Tiwari", target: "Amit Sharma", time: "2h ago", icon: MessageSquare, color: "text-purple-600", bg: "bg-purple-50" },
              ].map((act, i) => (
                <div key={i} className="flex gap-4">
                  <div className={`w-9 h-9 rounded-xl ${act.bg} ${act.color} flex items-center justify-center shrink-0`}>
                    <act.icon size={16} />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-gray-800 truncate">{act.user}</p>
                    <p className="text-[11px] text-gray-400 truncate">{act.type === "alert" ? "Flagged " : "Accessed "}{act.target}</p>
                    <p className="text-[10px] text-gray-300 mt-1 flex items-center gap-1"><Clock size={10} /> {act.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>

        <div className="grid grid-cols-2 gap-6">
          {/* Security Summary */}
          <motion.div variants={fadeUp} className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
            <div className="flex justify-between items-center mb-6">
              <p className="text-sm font-bold text-gray-800">Security Posture</p>
              <span className="text-[10px] font-bold bg-green-100 text-green-700 px-2.5 py-1 rounded-full uppercase tracking-wider">Secure</span>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 rounded-xl bg-gray-50 border border-gray-100">
                <p className="text-xs text-gray-400 font-medium mb-1">Risk Score</p>
                <div className="flex items-end gap-2">
                  <p className="text-2xl font-bold text-gray-900 tracking-tight">12/100</p>
                  <span className="text-[10px] font-bold text-green-600 mb-1">Very Low</span>
                </div>
              </div>
              <div className="p-4 rounded-xl bg-gray-50 border border-gray-100">
                <p className="text-xs text-gray-400 font-medium mb-1">Threats Blocked</p>
                <div className="flex items-end gap-2">
                  <p className="text-2xl font-bold text-gray-900 tracking-tight">247</p>
                  <span className="text-[10px] font-bold text-blue-600 mb-1">+12 today</span>
                </div>
              </div>
            </div>
            <div className="mt-6 space-y-4">
              {[
                { label: "Data Encryption", status: "Active", icon: Lock, color: "text-green-600" },
                { label: "External Storage", status: "Connected", icon: Shield, color: "text-blue-600" },
                { label: "Escape Prevention", status: "Active", icon: AlertCircle, color: "text-indigo-600" },
              ].map((item, i) => (
                <div key={i} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                  <div className="flex items-center gap-2">
                    <item.icon size={14} className="text-gray-400" />
                    <span className="text-xs font-semibold text-gray-700">{item.label}</span>
                  </div>
                  <span className={`text-[10px] font-bold ${item.color}`}>{item.status}</span>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Quick Actions */}
          <motion.div variants={fadeUp} className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
            <p className="text-sm font-bold text-gray-800 mb-6">Critical Actions Needed</p>
            <div className="space-y-4">
              {[
                { label: "Review 12 New Alerts", desc: "Flagged by EWS System", type: "high", icon: AlertTriangle },
                { label: "Approve 4 Access Requests", desc: "Pending permission updates", type: "medium", icon: Lock },
                { label: "Audit Drive Access", desc: "Monthly storage review due", type: "low", icon: FileText },
              ].map((action, i) => (
                <div key={i} className="group flex items-center justify-between p-4 rounded-xl bg-gray-50 border border-gray-100 hover:border-blue-200 transition-all cursor-pointer">
                  <div className="flex gap-4">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${action.type === "high" ? "bg-red-100 text-red-600" : action.type === "medium" ? "bg-orange-100 text-orange-600" : "bg-blue-100 text-blue-600"}`}>
                      <action.icon size={18} />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-gray-800">{action.label}</p>
                      <p className="text-[11px] text-gray-400">{action.desc}</p>
                    </div>
                  </div>
                  <div className="w-8 h-8 rounded-full bg-white border border-gray-200 flex items-center justify-center text-gray-400 group-hover:bg-blue-600 group-hover:text-white transition-all">
                    <ChevronRight size={14} />
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}
