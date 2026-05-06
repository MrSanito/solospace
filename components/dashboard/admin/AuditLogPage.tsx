import { useState } from "react";
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
} from "lucide-react";

const auditEntries = [
  { id: "1", time: "19 Apr 2024, 11:28 AM", initials: "RM", color: "bg-blue-600", user: "Rahul Mehta", userRole: "Owner", employee: "Amit Sharma", clientLead: "Amit Sharma", leadId: "L-10023", action: "Viewed File", actionType: "view", resource: "Brochure_Honda_City_ZX.pdf", resourceType: "File", ip: "106.201.45.12" },
  { id: "2", time: "19 Apr 2024, 11:22 AM", initials: "AS", color: "bg-indigo-600", user: "Amit Sharma", userRole: "Employee", employee: "Amit Sharma", clientLead: "Amit Sharma", leadId: "L-10023", action: "Sent Message", actionType: "send", resource: "WhatsApp Chat", resourceType: "Message", ip: "182.68.11.23" },
  { id: "3", time: "19 Apr 2024, 11:18 AM", initials: "AS", color: "bg-indigo-600", user: "Amit Sharma", userRole: "Employee", employee: "Amit Sharma", clientLead: "Pooja Patel", leadId: "L-10045", action: "Uploaded File", actionType: "upload", resource: "Variant_Price_List.docx", resourceType: "File", ip: "182.68.11.23" },
  { id: "4", time: "19 Apr 2024, 11:10 AM", initials: "RM", color: "bg-blue-600", user: "Rahul Mehta", userRole: "Owner", employee: "—", clientLead: "—", leadId: "", action: "Decrypted File", actionType: "decrypt", resource: "EMI_Options.pdf", resourceType: "File", ip: "106.201.45.12" },
  { id: "5", time: "19 Apr 2024, 11:05 AM", initials: "KT", color: "bg-teal-600", user: "Karan Trivedi", userRole: "Employee", employee: "Karan Trivedi", clientLead: "Neha Singh", leadId: "L-10058", action: "Viewed File", actionType: "view", resource: "On_Road_Price_Delhi.pdf", resourceType: "File", ip: "152.58.23.90" },
  { id: "6", time: "19 Apr 2024, 10:58 AM", initials: "PP", color: "bg-pink-600", user: "Pooja Patel", userRole: "Employee", employee: "Pooja Patel", clientLead: "Amit Sharma", leadId: "L-10023", action: "Sent Message", actionType: "send", resource: "WhatsApp Chat", resourceType: "Message", ip: "117.207.14.66" },
  { id: "7", time: "19 Apr 2024, 10:45 AM", initials: "AS", color: "bg-indigo-600", user: "Amit Sharma", userRole: "Employee", employee: "Amit Sharma", clientLead: "Pooja Patel", leadId: "L-10045", action: "Restricted File Access", actionType: "restrict", resource: "City_ZX_Interior.jpg", resourceType: "File", ip: "182.68.11.23" },
  { id: "8", time: "19 Apr 2024, 10:30 AM", initials: "RM", color: "bg-blue-600", user: "Rahul Mehta", userRole: "Owner", employee: "—", clientLead: "—", leadId: "", action: "Changed Settings", actionType: "settings", resource: "Storage Configuration", resourceType: "System", ip: "106.201.45.12" },
  { id: "9", time: "19 Apr 2024, 10:15 AM", initials: "SM", color: "bg-violet-600", user: "Sandeep Mishra", userRole: "Employee", employee: "Sandeep Mishra", clientLead: "Deepak Solanki", leadId: "L-10061", action: "Downloaded File", actionType: "download", resource: "Walkaround_Video.zip", resourceType: "File", ip: "103.21.45.78" },
  { id: "10", time: "19 Apr 2024, 10:02 AM", initials: "NS", color: "bg-orange-500", user: "Neha Singh", userRole: "Employee", employee: "Neha Singh", clientLead: "Vikram Tiwari", leadId: "L-10037", action: "Sent Message", actionType: "send", resource: "WhatsApp Chat", resourceType: "Message", ip: "152.58.23.90" },
];

const actionConfig: Record<string, { label: string; bg: string; text: string; icon: React.ElementType }> = {
  view: { label: "Viewed File", bg: "bg-blue-50", text: "text-blue-700", icon: Eye },
  send: { label: "Sent Message", bg: "bg-green-50", text: "text-green-700", icon: MessageSquare },
  upload: { label: "Uploaded File", bg: "bg-yellow-50", text: "text-yellow-700", icon: Upload },
  decrypt: { label: "Decrypted File", bg: "bg-purple-50", text: "text-purple-700", icon: Key },
  restrict: { label: "Restricted File Access", bg: "bg-red-50", text: "text-red-700", icon: Lock },
  settings: { label: "Changed Settings", bg: "bg-orange-50", text: "text-orange-700", icon: Settings },
  download: { label: "Downloaded File", bg: "bg-cyan-50", text: "text-cyan-700", icon: ArrowDownToLine },
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
  const [search, setSearch] = useState("");

  const filtered = auditEntries.filter(
    (e) =>
      !search ||
      e.user.toLowerCase().includes(search.toLowerCase()) ||
      e.resource.toLowerCase().includes(search.toLowerCase()) ||
      e.action.toLowerCase().includes(search.toLowerCase())
  );

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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-3">
          <div className="col-span-1 lg:col-span-2">
            <label className="text-xs font-medium text-gray-500 mb-1 block">Date Range</label>
            <button className="btn btn-sm btn-outline w-full justify-start gap-2 text-xs bg-white">
              📅 12 Apr 2024 – 19 Apr 2024
            </button>
          </div>
          {[
            { label: "Users", options: ["All Users"] },
            { label: "Employee", options: ["All Employees"] },
            { label: "Client / Lead", options: ["All Clients / Leads"] },
            { label: "Action", options: ["All Actions"] },
            { label: "Resource Type", options: ["All Types"] },
          ].map(({ label, options }) => (
            <div key={label}>
              <label className="text-xs font-medium text-gray-500 mb-1 block">{label}</label>
              <select className="select select-bordered select-sm w-full text-xs bg-white">
                {options.map((o) => <option key={o}>{o}</option>)}
              </select>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Search & Results bar */}
      <div className="flex flex-wrap items-center gap-3 mb-4">
        <button
          onClick={() => setSearch("")}
          className="btn btn-sm btn-ghost text-blue-600 gap-1"
        >
          Clear Filters
        </button>
        <div className="relative flex-1 max-w-sm">
          <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search in results..."
            className="w-full pl-8 pr-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 bg-white"
          />
        </div>
        <div className="ml-auto flex items-center gap-2">
          <span className="text-sm text-gray-500 font-medium">{filtered.length} Results</span>
          <button className="btn btn-sm btn-ghost btn-square border border-gray-200 bg-white">
            <RefreshCw size={14} />
          </button>
          <button className="btn btn-sm btn-ghost gap-1.5 border border-gray-200 bg-white">
            <SlidersHorizontal size={14} /> Columns
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-x-auto">
        <table className="table table-sm w-full">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200">
              {["Time ↓", "User", "Employee", "Client / Lead", "Action", "Resource", "Resource Type", "IP Address", "Details"].map((h) => (
                <th key={h} className="text-xs font-semibold text-gray-500 py-3 text-left px-4">{h}</th>
              ))}
            </tr>
          </thead>
          <motion.tbody variants={containerVariants} initial="hidden" animate="visible" key={search}>
            {filtered.map((entry) => {
              const cfg = actionConfig[entry.actionType];
              const ActionIcon = cfg.icon;
              return (
                <motion.tr
                  key={entry.id}
                  variants={rowVariants}
                  whileHover={{ backgroundColor: "rgba(59,130,246,0.03)" }}
                  className="border-b border-gray-100 transition-colors"
                >
                  <td className="py-2.5 text-xs text-gray-600 whitespace-nowrap px-4">{entry.time}</td>
                  <td className="px-4">
                    <div className="flex items-center gap-1.5">
                      <div className={`w-6 h-6 rounded-full ${entry.color} text-white text-[10px] font-bold flex items-center justify-center`}>
                        {entry.initials}
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-gray-800">{entry.user}</p>
                        <p className="text-xs text-gray-400">({entry.userRole})</p>
                      </div>
                    </div>
                  </td>
                  <td className="text-xs text-gray-700 px-4">{entry.employee}</td>
                  <td className="px-4">
                    {entry.clientLead !== "—" ? (
                      <div>
                        <p className="text-xs font-medium text-gray-800">{entry.clientLead}</p>
                        {entry.leadId && <p className="text-xs text-gray-400">Lead ID: {entry.leadId}</p>}
                      </div>
                    ) : (
                      <span className="text-xs text-gray-400">—</span>
                    )}
                  </td>
                  <td className="px-4">
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${cfg.bg} ${cfg.text}`}>
                      <ActionIcon size={10} />
                      {entry.action}
                    </span>
                  </td>
                  <td className="text-xs font-medium text-gray-700 px-4">{entry.resource}</td>
                  <td className="text-xs text-gray-600 px-4">{entry.resourceType}</td>
                  <td className="text-xs font-mono text-gray-600 px-4">{entry.ip}</td>
                  <td className="px-4">
                    <button className="p-1 hover:bg-gray-100 rounded">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-gray-400">
                        <circle cx="12" cy="12" r="1"/><circle cx="12" cy="5" r="1"/><circle cx="12" cy="19" r="1"/>
                      </svg>
                    </button>
                  </td>
                </motion.tr>
              );
            })}
          </motion.tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex flex-wrap items-center justify-between mt-4 text-sm text-gray-500 gap-4">
        <span>Showing 1 to {filtered.length} of 248 results</span>
        <div className="flex items-center gap-1">
          <button className="btn btn-xs btn-ghost"><ChevronLeft size={14} /></button>
          {[1, 2, 3, 4].map((p) => (
            <button key={p} className={`btn btn-xs ${p === 1 ? "btn-primary" : "btn-ghost"}`}>{p}</button>
          ))}
          <span className="btn btn-xs btn-ghost pointer-events-none">...</span>
          <button className="btn btn-xs btn-ghost">25</button>
          <button className="btn btn-xs btn-ghost"><ChevronRight size={14} /></button>
        </div>
        <div className="flex items-center gap-2">
          Rows per page:
          <select className="select select-xs select-bordered bg-white"><option>10</option></select>
        </div>
      </div>
    </div>
  );
}
