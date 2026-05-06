import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus,
  Edit2,
  X,
  CheckCircle2,
  Minus as MinusIcon,
  Crown,
  Shield,
  Briefcase,
  User,
  Eye,
  ExternalLink,
} from "lucide-react";

const roles = [
  { id: "owner", name: "Owner", icon: Crown, color: "text-yellow-500", users: 1, description: "Full access to all features and data.", lastUpdated: "12 Apr 2024, 09:30 AM" },
  { id: "admin", name: "Admin", icon: Shield, color: "text-blue-500", users: 3, description: "Manage users, settings, storage and all data.", lastUpdated: "11 Apr 2024, 04:21 PM" },
  { id: "manager", name: "Manager", icon: Briefcase, color: "text-green-500", users: 8, description: "Manage leads, employees and relevant data.", lastUpdated: "11 Apr 2024, 11:05 AM" },
  { id: "employee", name: "Employee", icon: User, color: "text-orange-500", users: 42, description: "Access assigned leads and allowed data.", lastUpdated: "10 Apr 2024, 02:18 PM" },
  { id: "viewer", name: "Viewer", icon: Eye, color: "text-cyan-500", users: 6, description: "Read-only access to permitted data.", lastUpdated: "09 Apr 2024, 10:10 AM" },
  { id: "external", name: "External Partner", icon: ExternalLink, color: "text-purple-500", users: 4, description: "Limited access to specific shared data.", lastUpdated: "08 Apr 2024, 05:48 PM" },
];

const permissions = [
  "View Leads / Clients",
  "Chat Access",
  "File View",
  "File Upload",
  "File Download",
  "Edit / Delete Files",
  "User Management",
  "Access Settings",
  "Audit Logs",
];

const permissionMatrix: Record<string, boolean[]> = {
  "View Leads / Clients": [true, true, true, true, true, true],
  "Chat Access": [true, true, true, true, true, false],
  "File View": [true, true, true, true, true, true],
  "File Upload": [true, true, true, true, false, false],
  "File Download": [true, true, true, false, false, false],
  "Edit / Delete Files": [true, true, false, false, false, false],
  "User Management": [true, true, false, false, false, false],
  "Access Settings": [true, true, false, false, false, false],
  "Audit Logs": [true, true, false, false, false, false],
};

const assignedUsers = [
  { initials: "RM", color: "bg-blue-600", name: "Rahul Mehta", email: "rahul.mehta@spacemotors.com" },
  { initials: "AS", color: "bg-indigo-600", name: "Amit Sharma", email: "amit.sharma@spacemotors.com" },
  { initials: "PP", color: "bg-pink-600", name: "Pooja Patel", email: "pooja.patel@spacemotors.com" },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.06 } },
};
const itemVariants = {
  hidden: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0 },
};

export default function AccessControlPage() {
  const [selectedRole, setSelectedRole] = useState(roles[1]);
  const [activeTab, setActiveTab] = useState("Roles & Permissions");
  const tabs = ["Roles & Permissions", "Users", "Data Access Restrictions", "Shared Links", "Access Requests"];

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
            <h1 className="text-2xl font-bold text-gray-900">Access Control</h1>
            <p className="text-sm text-gray-500 mt-0.5">Manage user roles, permissions and data access restrictions.</p>
          </div>
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            className="btn btn-primary btn-sm gap-2 shadow-lg shadow-blue-200"
          >
            <Plus size={16} /> Create Role
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
                  layoutId="accessTabLine"
                  className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 rounded-t"
                />
              )}
            </button>
          ))}
        </div>

        {/* Roles Table */}
        <div className="mb-6">
          <div className="mb-2">
            <h2 className="text-base font-semibold text-gray-800">Roles</h2>
            <p className="text-xs text-gray-500">Define roles and their permissions.</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <table className="table table-sm w-full">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  {["Role Name", "Users", "Description", "Last Updated", "Actions"].map((h) => (
                    <th key={h} className="text-xs font-semibold text-gray-500 py-3 text-left">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                <motion.div
                  variants={containerVariants}
                  initial="hidden"
                  animate="visible"
                  style={{ display: "contents" }}
                >
                  {roles.map((role) => {
                    const Icon = role.icon;
                    return (
                      <motion.tr
                        key={role.id}
                        variants={itemVariants}
                        onClick={() => setSelectedRole(role)}
                        whileHover={{ backgroundColor: "rgba(59,130,246,0.03)" }}
                        className={`border-b border-gray-100 cursor-pointer transition-colors ${
                          selectedRole?.id === role.id ? "bg-blue-50/60" : ""
                        }`}
                      >
                        <td className="py-3">
                          <div className="flex items-center gap-2.5">
                            <div className={`w-7 h-7 rounded-lg bg-gray-100 flex items-center justify-center ${role.color}`}>
                              <Icon size={14} />
                            </div>
                            <span className="text-sm font-semibold text-gray-800">{role.name}</span>
                          </div>
                        </td>
                        <td className="text-sm text-gray-700">{role.users}</td>
                        <td className="text-xs text-gray-600">{role.description}</td>
                        <td className="text-xs text-gray-500">{role.lastUpdated}</td>
                        <td onClick={(e) => e.stopPropagation()}>
                          <div className="flex items-center gap-1">
                            <button className="p-1 hover:bg-gray-100 rounded"><Edit2 size={12} className="text-gray-500" /></button>
                            <button className="p-1 hover:bg-gray-100 rounded">
                              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-gray-500">
                                <circle cx="12" cy="12" r="1"/><circle cx="12" cy="5" r="1"/><circle cx="12" cy="19" r="1"/>
                              </svg>
                            </button>
                          </div>
                        </td>
                      </motion.tr>
                    );
                  })}
                </motion.div>
              </tbody>
            </table>
          </div>
        </div>

        {/* Permissions Matrix */}
        <div>
          <div className="mb-2">
            <h2 className="text-base font-semibold text-gray-800">Permissions Matrix</h2>
            <p className="text-xs text-gray-500">View permissions for each role.</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-x-auto">
            <table className="table table-sm w-full">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="text-xs font-semibold text-gray-500 py-3 w-44 text-left">Permission</th>
                  {roles.map((role) => {
                    const Icon = role.icon;
                    return (
                      <th key={role.id} className="text-center">
                        <div className="flex flex-col items-center gap-0.5">
                          <Icon size={13} className={role.color} />
                          <span className="text-xs font-semibold text-gray-600">{role.name}</span>
                        </div>
                      </th>
                    );
                  })}
                </tr>
              </thead>
              <tbody>
                {permissions.map((perm, pi) => (
                  <motion.tr
                    key={perm}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: pi * 0.04 }}
                    className="border-b border-gray-100"
                  >
                    <td className="text-xs text-gray-700 py-2.5 font-medium">{perm}</td>
                    {permissionMatrix[perm].map((allowed, ri) => (
                      <td key={ri} className="text-center">
                        {allowed ? (
                          <CheckCircle2 size={15} className="text-green-500 mx-auto" />
                        ) : (
                          <span className="text-gray-300 text-sm">—</span>
                        )}
                      </td>
                    ))}
                  </motion.tr>
                ))}
                <tr className="border-t border-gray-200">
                  <td colSpan={7} className="py-3 px-4">
                    <div className="flex items-center gap-4 text-xs text-gray-500">
                      <span className="flex items-center gap-1"><CheckCircle2 size={12} className="text-green-500" /> Allowed</span>
                      <span className="flex items-center gap-1"><MinusIcon size={12} className="text-gray-300" /> Not Allowed</span>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Bottom summary */}
        <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-100 flex gap-6">
          <div className="text-center"><p className="text-xs text-gray-500">Users</p><p className="text-lg font-bold text-gray-800">64</p></div>
          <div className="text-center"><p className="text-xs text-gray-500">Roles</p><p className="text-lg font-bold text-gray-800">6</p></div>
          <div className="text-center"><p className="text-xs text-gray-500">Restricted Files</p><p className="text-lg font-bold text-gray-800">128</p></div>
          <button className="ml-auto text-blue-600 text-xs font-medium hover:underline">View Access Report →</button>
        </div>
      </div>

      {/* Role Detail Panel */}
      <AnimatePresence>
        {selectedRole && (
          <motion.aside
            key="role-panel"
            initial={{ x: 320, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 320, opacity: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 28 }}
            className="w-72 flex-shrink-0 bg-white border-l border-gray-200 overflow-y-auto"
          >
            <div className="p-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-gray-800">Role Details</h3>
                <button onClick={() => setSelectedRole(null as any)} className="btn btn-ghost btn-xs btn-square">
                  <X size={14} />
                </button>
              </div>

              {/* Role selector */}
              <div className="mb-4">
                <select className="select select-bordered select-sm w-full bg-white text-sm">
                  {roles.map((r) => (
                    <option key={r.id} value={r.id} selected={r.id === selectedRole.id}>{r.name}</option>
                  ))}
                </select>
              </div>

              <div className="mb-4 pb-4 border-b border-gray-100">
                <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Description</h4>
                <p className="text-xs text-gray-700">{selectedRole.description}</p>
              </div>

              {/* Role Permissions */}
              <div className="mb-4 pb-4 border-b border-gray-100">
                <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Role Permissions</h4>
                <div className="space-y-1.5">
                  {permissions.map((perm, i) => {
                    const idx = roles.findIndex((r) => r.id === selectedRole.id);
                    const allowed = permissionMatrix[perm]?.[idx] ?? false;
                    return (
                      <motion.div
                        key={perm}
                        initial={{ opacity: 0, x: -8 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.05 }}
                        className="flex items-center justify-between"
                      >
                        <span className="text-xs text-gray-700">{perm}</span>
                        <span className={`badge badge-xs font-medium ${
                          allowed
                            ? "badge-success text-green-700 bg-green-50 border-green-200"
                            : "text-gray-400 bg-gray-50 border-gray-200"
                        }`}>
                          {allowed ? "Allowed" : "—"}
                        </span>
                      </motion.div>
                    );
                  })}
                </div>
              </div>

              {/* Data Access Scope */}
              <div className="mb-4 pb-4 border-b border-gray-100">
                <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Data Access Scope</h4>
                <p className="text-sm font-semibold text-gray-800">All Data</p>
                <p className="text-xs text-gray-500 mb-2">This role has access to all data and resources.</p>
                <button className="btn btn-outline btn-sm btn-primary w-full">Edit Scope</button>
              </div>

              {/* Assigned Users */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Assigned Users ({selectedRole.users})</h4>
                  <button className="text-xs text-blue-600 hover:underline">View all</button>
                </div>
                <div className="space-y-2">
                  {assignedUsers.map((u, i) => (
                    <motion.div
                      key={u.email}
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.07 }}
                      className="flex items-center gap-2"
                    >
                      <div className={`w-7 h-7 rounded-full ${u.color} text-white text-xs font-bold flex items-center justify-center`}>
                        {u.initials}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium text-gray-800">{u.name}</p>
                        <p className="text-xs text-gray-400 truncate">{u.email}</p>
                      </div>
                      <button className="p-1 hover:bg-gray-100 rounded">
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-gray-400">
                          <circle cx="12" cy="12" r="1"/><circle cx="12" cy="5" r="1"/><circle cx="12" cy="19" r="1"/>
                        </svg>
                      </button>
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>
    </div>
  );
}
