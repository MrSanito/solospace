import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  Filter,
  RefreshCw,
  Plus,
  Edit2,
  MoreHorizontal,
  X,
  ChevronLeft,
  ChevronRight,
  Shield,
  Target,
  Zap,
  AlertTriangle,
} from "lucide-react";

const automations = [
  {
    id: "AUT-2024-0001",
    name: "New Lead → Create Client",
    desc: "Create client in CRM when new lead is added",
    trigger: "New Lead Added",
    triggerSrc: "Space Lead",
    action: "Create Client",
    actionTarget: "CRM",
    condition: "Lead Source is not WhatsApp",
    status: "Active",
    lastRun: "19 Apr 2024, 11:10 AM",
    ago: "2 min ago",
    executions: 142,
    icon: <Shield size={14} />,
    iconBg: "bg-orange-100 text-orange-600",
  },
  {
    id: "AUT-2024-0002",
    name: "WhatsApp → Space Import",
    desc: "Import WhatsApp chats to Space",
    trigger: "New WhatsApp Chat",
    triggerSrc: "WhatsApp",
    action: "Create Conversation",
    actionTarget: "Space",
    condition: "Chat not imported",
    status: "Active",
    lastRun: "19 Apr 2024, 11:08 AM",
    ago: "4 min ago",
    executions: 318,
    icon: <Zap size={14} />,
    iconBg: "bg-green-100 text-green-600",
  },
  {
    id: "AUT-2024-0003",
    name: "Restricted File Access Alert",
    desc: "Alert owner on restricted file access",
    trigger: "Restricted File Access",
    triggerSrc: "Space",
    action: "Send Alert",
    actionTarget: "Email + In-App",
    condition: "File is Restricted",
    status: "Active",
    lastRun: "19 Apr 2024, 10:58 AM",
    ago: "14 min ago",
    executions: 57,
    icon: <AlertTriangle size={14} />,
    iconBg: "bg-red-100 text-red-600",
  },
  {
    id: "AUT-2024-0004",
    name: "New File Upload → Drive Backup",
    desc: "Backup important files to secondary storage",
    trigger: "File Uploaded",
    triggerSrc: "Space Drive",
    action: "Backup to GDrive",
    actionTarget: "Google Drive",
    condition: "File Size > 5MB",
    status: "Active",
    lastRun: "19 Apr 2024, 10:52 AM",
    ago: "20 min ago",
    executions: 207,
    icon: <Target size={14} />,
    iconBg: "bg-blue-100 text-blue-600",
  },
  {
    id: "AUT-2024-0005",
    name: "High Risk Activity Alert",
    desc: "Notify on abnormal user activity",
    trigger: "EWS Alert",
    triggerSrc: "System",
    action: "Send Alert",
    actionTarget: "Email + SMS",
    condition: "Risk Level = High",
    status: "Active",
    lastRun: "19 Apr 2024, 10:45 AM",
    ago: "27 min ago",
    executions: 33,
    icon: <AlertTriangle size={14} />,
    iconBg: "bg-red-100 text-red-600",
  },
  {
    id: "AUT-2024-0006",
    name: "Lead Follow-up Reminder",
    desc: "Remind employee for follow-up",
    trigger: "No Activity",
    triggerSrc: "24 Hours",
    action: "Send Reminder",
    actionTarget: "In-App",
    condition: "Lead Status = Open",
    status: "Paused",
    lastRun: "18 Apr 2024, 09:30 PM",
    ago: "12 hrs ago",
    executions: 96,
    icon: <Zap size={14} />,
    iconBg: "bg-yellow-100 text-yellow-600",
  },
  {
    id: "AUT-2024-0007",
    name: "Neal Won → Move to Closed",
    desc: "Move lead to closed won in CRM",
    trigger: "Deal Won",
    triggerSrc: "CRM",
    action: "Update Lead Status",
    actionTarget: "CRM",
    condition: "—",
    status: "Active",
    lastRun: "18 Apr 2024, 06:22 PM",
    ago: "15 hrs ago",
    executions: 44,
    icon: <Shield size={14} />,
    iconBg: "bg-purple-100 text-purple-600",
  },
  {
    id: "AUT-2024-0008",
    name: "Bulk Message Prevention",
    desc: "Block & alert on bulk messages",
    trigger: "Bulk Message Detected",
    triggerSrc: "Space",
    action: "Block & Alert",
    actionTarget: "In-App",
    condition: "Messages > 20 in 1 min",
    status: "Active",
    lastRun: "18 Apr 2024, 05:10 PM",
    ago: "16 hrs ago",
    executions: 29,
    icon: <AlertTriangle size={14} />,
    iconBg: "bg-red-100 text-red-600",
  },
];

const stats = [
  { label: "Active Automations", value: "24", change: "+3 this week", positive: true, icon: <Shield size={20} /> },
  { label: "Total Executions", value: "1,248", change: "+18% this week", positive: true, icon: <Zap size={20} /> },
  { label: "Success Rate", value: "98.6%", change: "+2.1% this week", positive: true, icon: <Target size={20} /> },
  { label: "Failed Executions", value: "18", change: "-4 this week", positive: false, icon: <AlertTriangle size={20} /> },
  { label: "Avg. Execution Time", value: "1.42s", change: "-0.28s this week", positive: true, icon: <RefreshCw size={20} /> },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.07 } },
};
const itemVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0 },
};

export default function AutomationsPage() {
  const [selectedRow, setSelectedRow] = useState(automations[1]);
  const [activeTab, setActiveTab] = useState("Automation Rules");
  const tabs = ["Automation Rules", "Integrations", "Webhooks", "Schedules", "Logs"];

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
            <h1 className="text-2xl font-bold text-gray-900">Automations & Integrations</h1>
            <p className="text-sm text-gray-500 mt-0.5">Create rules, set triggers and connect external services.</p>
          </div>
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            className="btn btn-primary btn-sm gap-2 shadow-lg shadow-blue-200"
          >
            <Plus size={16} /> Create Automation
          </motion.button>
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
                  layoutId="automationTabLine"
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
          className="grid grid-cols-5 gap-3 mb-5"
        >
          {stats.map((stat) => (
            <motion.div
              key={stat.label}
              variants={itemVariants}
              whileHover={{ y: -2, shadow: "lg" }}
              className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm"
            >
              <div className="flex items-center gap-2 mb-2">
                <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                  {stat.icon}
                </div>
              </div>
              <p className="text-xs text-gray-500 mb-0.5">{stat.label}</p>
              <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
              <p className={`text-xs mt-0.5 font-medium ${stat.positive ? "text-green-600" : "text-red-500"}`}>
                {stat.positive ? "↑" : "↓"} {stat.change}
              </p>
            </motion.div>
          ))}
        </motion.div>

        {/* Filters */}
        <div className="flex items-center gap-2 mb-4">
          <div className="relative flex-1 max-w-xs">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search automations..."
              className="w-full pl-8 pr-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 bg-white"
            />
          </div>
          {["All Status", "All Triggers", "All Actions", "All Owners"].map((f) => (
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

        {/* Table */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <table className="table table-sm w-full">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                {["Name", "Trigger", "Action(s)", "Conditions", "Status", "Last Run", "Executions", "Actions"].map((h) => (
                  <th key={h} className="text-xs font-semibold text-gray-500 py-3">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {automations.map((a, i) => (
                <motion.tr
                  key={a.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.04 }}
                  whileHover={{ backgroundColor: "rgba(59,130,246,0.03)" }}
                  onClick={() => setSelectedRow(a)}
                  className={`border-b border-gray-100 cursor-pointer transition-colors ${
                    selectedRow?.id === a.id ? "bg-blue-50/60" : ""
                  }`}
                >
                  <td className="py-3">
                    <div className="flex items-center gap-2.5">
                      <div className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 ${a.iconBg}`}>
                        {a.icon}
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-gray-800">{a.name}</p>
                        <p className="text-xs text-gray-400">{a.desc}</p>
                      </div>
                    </div>
                  </td>
                  <td>
                    <div>
                      <p className="text-xs font-medium text-gray-700">{a.trigger}</p>
                      <p className="text-xs text-gray-400">{a.triggerSrc}</p>
                    </div>
                  </td>
                  <td>
                    <div>
                      <p className="text-xs font-medium text-gray-700">{a.action}</p>
                      <p className="text-xs text-gray-400">{a.actionTarget}</p>
                    </div>
                  </td>
                  <td className="text-xs text-gray-600">{a.condition}</td>
                  <td>
                    <span className={`badge badge-sm font-medium ${
                      a.status === "Active"
                        ? "badge-success text-green-700 bg-green-50 border-green-200"
                        : "badge-warning text-yellow-700 bg-yellow-50 border-yellow-200"
                    }`}>
                      {a.status}
                    </span>
                  </td>
                  <td>
                    <p className="text-xs text-gray-700">{a.lastRun}</p>
                    <p className="text-xs text-gray-400">{a.ago}</p>
                  </td>
                  <td className="text-sm font-semibold text-gray-700">{a.executions}</td>
                  <td>
                    <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
                      <button className="p-1 hover:bg-gray-100 rounded transition-colors">
                        <Edit2 size={13} className="text-gray-500" />
                      </button>
                      <input
                        type="checkbox"
                        className="toggle toggle-primary toggle-xs"
                        defaultChecked={a.status === "Active"}
                      />
                      <button className="p-1 hover:bg-gray-100 rounded transition-colors">
                        <MoreHorizontal size={13} className="text-gray-500" />
                      </button>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between mt-4 text-sm text-gray-500">
          <span>Showing 1 to 8 of 24 automations</span>
          <div className="flex items-center gap-2">
            <button className="btn btn-xs btn-ghost"><ChevronLeft size={14} /></button>
            {[1, 2, 3].map((p) => (
              <button key={p} className={`btn btn-xs ${p === 1 ? "btn-primary" : "btn-ghost"}`}>{p}</button>
            ))}
            <button className="btn btn-xs btn-ghost"><ChevronRight size={14} /></button>
          </div>
          <div className="flex items-center gap-2">
            Rows per page:
            <select className="select select-xs select-bordered">
              <option>10</option>
              <option>25</option>
            </select>
          </div>
        </div>
      </div>

      {/* Right Panel */}
      <AnimatePresence>
        {selectedRow && (
          <motion.aside
            key="rule-panel"
            initial={{ x: 320, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 320, opacity: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 28 }}
            className="w-72 flex-shrink-0 bg-white border-l border-gray-200 overflow-y-auto"
          >
            <div className="p-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-gray-800">Rule Details</h3>
                <button onClick={() => setSelectedRow(null as any)} className="btn btn-ghost btn-xs btn-square">
                  <X size={14} />
                </button>
              </div>

              {/* Rule header */}
              <div className="flex items-start justify-between mb-4 pb-4 border-b border-gray-100">
                <div>
                  <p className="text-sm font-semibold text-gray-800">{selectedRow.name}</p>
                  <p className="text-xs text-gray-500 mt-0.5">ID: {selectedRow.id}</p>
                  <p className="text-xs text-gray-500 mt-1">{selectedRow.desc}</p>
                </div>
                <span className="badge badge-success badge-sm text-green-700 bg-green-50 border-green-200">
                  {selectedRow.status}
                </span>
              </div>

              {[
                { title: "Trigger", items: [{ label: selectedRow.trigger, sub: selectedRow.triggerSrc }] },
                { title: "Action(s)", items: [{ label: selectedRow.action, sub: selectedRow.actionTarget }] },
                { title: "Conditions", items: [{ label: selectedRow.condition }] },
              ].map((section) => (
                <motion.div
                  key={section.title}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mb-4 pb-4 border-b border-gray-100"
                >
                  <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">{section.title}</h4>
                  {section.items.map((item, i) => (
                    <div key={i} className="flex items-center gap-2 bg-gray-50 rounded-lg p-2.5">
                      <div className="w-6 h-6 rounded-md bg-blue-100 text-blue-600 flex items-center justify-center">
                        <Zap size={12} />
                      </div>
                      <div>
                        <p className="text-xs font-medium text-gray-800">{item.label}</p>
                        {item.sub && <p className="text-xs text-gray-500">{item.sub}</p>}
                      </div>
                    </div>
                  ))}
                </motion.div>
              ))}

              <div className="mb-4 pb-4 border-b border-gray-100">
                <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Run Settings</h4>
                {[
                  { label: "Runs", value: "Every time" },
                  { label: "Owner", value: "Rahul Mehta" },
                  { label: "Created At", value: "12 Apr 2024, 10:30 AM" },
                  { label: "Last Updated", value: "18 Apr 2024, 04:15 PM" },
                ].map(({ label, value }) => (
                  <div key={label} className="flex justify-between py-1.5">
                    <span className="text-xs text-gray-500">{label}</span>
                    <span className="text-xs font-medium text-gray-800 text-right">{value}</span>
                  </div>
                ))}
              </div>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="btn btn-error btn-outline btn-sm w-full"
              >
                Delete Automation
              </motion.button>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>
    </div>
  );
}
