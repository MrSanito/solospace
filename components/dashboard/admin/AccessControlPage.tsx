import { useState, useEffect } from "react";
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
import { useAuth } from "@/components/auth/AuthContext";
import PermissionGuard from "@/components/auth/PermissionGuard";

const iconMap: Record<string, any> = {
  Crown,
  Shield,
  Briefcase,
  User,
  Eye,
  ExternalLink,
};

const permissionMapping: Record<string, string> = {
  "VIEW_LEADS": "View Leads / Clients",
  "CHAT_ACCESS": "Chat Access",
  "FILE_VIEW": "File View",
  "FILE_UPLOAD": "File Upload",
  "FILE_DOWNLOAD": "File Download",
  "FILE_DELETE": "Edit / Delete Files",
  "USER_MANAGEMENT": "User Management",
  "ACCESS_CONTROL": "Access Settings",
  "AUDIT_LOGS": "Audit Logs",
};

const permissions = Object.values(permissionMapping);
const permissionKeys = Object.keys(permissionMapping);

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.06 } },
};
const itemVariants = {
  hidden: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0 },
};

export default function AccessControlPage() {
  const [roles, setRoles] = useState<any[]>([]);
  const [assignedUsers, setAssignedUsers] = useState<any[]>([]);
  const [usersLoading, setUsersLoading] = useState(false);
  const [restrictedCount, setRestrictedCount] = useState(0);

  const [loading, setLoading] = useState(true);
  const [selectedRole, setSelectedRole] = useState<any>(null);
  const [activeTab, setActiveTab] = useState("Roles & Permissions");
  const tabs = ["Roles & Permissions", "Users", "Data Access Restrictions", "Shared Links", "Access Requests"];

  useEffect(() => {
    fetchMatrix();
  }, []);

  useEffect(() => {
    if (selectedRole?.id) {
      fetchUsers(selectedRole.id);
    }
  }, [selectedRole?.id]);

  const fetchUsers = async (roleId: string) => {
    setUsersLoading(true);
    try {
      const res = await fetch(`/api/access-control/roles/${roleId}/users`);
      const data = await res.json();
      if (Array.isArray(data)) {
        setAssignedUsers(data);
      } else if (data.users) {
        setAssignedUsers(data.users);
      }
    } catch (error) {
      console.error("Failed to fetch users");
    } finally {
      setUsersLoading(false);
    }
  };

  const fetchMatrix = async () => {
    try {
      const res = await fetch("/api/access-control/matrix");
      const data = await res.json();
      if (data.roles) {
        setRoles(data.roles);
        if (!selectedRole && data.roles.length > 0) {
          setSelectedRole(data.roles[0]);
        } else if (selectedRole) {
          // Keep selectedRole in sync with fresh data
          const updated = data.roles.find((r: any) => r.id === selectedRole.id);
          if (updated) setSelectedRole(updated);
        }
      }
      if (typeof data.restrictedCount === 'number') {
        setRestrictedCount(data.restrictedCount);
      }
    } catch (error) {
      console.error("Failed to fetch matrix");
    } finally {
      setLoading(false);
    }
  };

  const getPermissionStatus = (role: any, permissionLabel: string) => {
    const key = Object.keys(permissionMapping).find(k => permissionMapping[k] === permissionLabel);
    if (!key) return false;
    const perm = role.permissions.find((p: any) => p.permission === key);
    return perm?.allowed || false;
  };

  const togglePermission = async (roleId: string, permissionKey: string, currentAllowed: boolean) => {
    try {
      const res = await fetch(`/api/access-control/roles/${roleId}/permissions`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ permissions: [{ permission: permissionKey, allowed: !currentAllowed }] }),
      });
      
      if (res.ok) {
        fetchMatrix();
      }
    } catch (error) {
      console.error("Failed to update permission");
    }
  };

  const handleUpdateScope = async () => {
    if (!selectedRole) return;
    
    const scopes: ("OWN" | "TEAM" | "ALL")[] = ["OWN", "TEAM", "ALL"];
    const currentScope = selectedRole.dataScope?.scopeType || "OWN";
    const nextScope = scopes[(scopes.indexOf(currentScope as any) + 1) % scopes.length];

    try {
      const res = await fetch(`/api/access-control/roles/${selectedRole.id}/scope`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ scopeType: nextScope }),
      });
      
      if (res.ok) {
        fetchMatrix();
        // Update selected role local state too
        setSelectedRole({
          ...selectedRole,
          dataScope: { ...selectedRole.dataScope, scopeType: nextScope }
        });
      }
    } catch (error) {
      console.error("Failed to update scope");
    }
  };

  const handleCreateRole = async () => {
    const name = prompt("Enter role name:");
    if (!name) return;
    
    try {
      const res = await fetch("/api/access-control/roles", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          name, 
          description: "New custom role", 
          icon: "Shield", 
          color: "text-blue-500" 
        }),
      });
      if (res.ok) {
        fetchMatrix();
      }
    } catch (error) {
      console.error("Failed to create role");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <span className="loading loading-spinner loading-lg text-blue-600"></span>
      </div>
    );
  }

  return (
    <PermissionGuard permission="ACCESS_CONTROL">
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
              onClick={handleCreateRole}
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
                      const Icon = iconMap[role.icon] || User;
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
                          <td className="text-sm text-gray-700">{role._count?.users || 0}</td>
                          <td className="text-xs text-gray-600 truncate max-w-[200px]">{role.description}</td>
                          <td className="text-xs text-gray-500">{new Date(role.updatedAt).toLocaleDateString()}</td>
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
                      const Icon = iconMap[role.icon] || User;
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
                      {roles.map((role, ri) => {
                        const allowed = getPermissionStatus(role, perm);
                        const key = Object.keys(permissionMapping).find(k => permissionMapping[k] === perm);
                        return (
                          <td key={role.id} className="text-center">
                            <button 
                              onClick={() => key && togglePermission(role.id, key, allowed)}
                              className="focus:outline-none"
                            >
                              {allowed ? (
                                <CheckCircle2 size={15} className="text-green-500 mx-auto" />
                              ) : (
                                <span className="text-gray-300 text-sm">—</span>
                              )}
                            </button>
                          </td>
                        );
                      })}
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
            <div className="text-center"><p className="text-xs text-gray-500">Users</p><p className="text-lg font-bold text-gray-800">{roles.reduce((acc, r) => acc + (r._count?.users || 0), 0)}</p></div>
            <div className="text-center"><p className="text-xs text-gray-500">Roles</p><p className="text-lg font-bold text-gray-800">{roles.length}</p></div>
            <div className="text-center"><p className="text-xs text-gray-500">Restricted Files</p><p className="text-lg font-bold text-gray-800">{restrictedCount}</p></div>
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
                  <select 
                    className="select select-bordered select-sm w-full bg-white text-sm"
                    value={selectedRole.id}
                    onChange={(e) => {
                      const role = roles.find(r => r.id === e.target.value);
                      if (role) setSelectedRole(role);
                    }}
                  >
                    {roles.map((r) => (
                      <option key={r.id} value={r.id}>{r.name}</option>
                    ))}
                  </select>
                </div>

                <div className="mb-4 pb-4 border-b border-gray-100">
                  <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Description</h4>
                  <p className="text-xs text-gray-700">{selectedRole.description}</p>
                </div>

                {/* Role Permissions */}
                <div className="mb-4 pb-4 border-b border-gray-100">
                  <div className="space-y-1.5">
                    {permissionKeys.map((key, i) => {
                      const perm = selectedRole.permissions.find((p: any) => p.permission === key);
                      const allowed = perm?.allowed || false;
                      return (
                        <motion.div
                          key={key}
                          initial={{ opacity: 0, x: -8 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: i * 0.05 }}
                          className="flex items-center justify-between cursor-pointer group"
                          onClick={() => togglePermission(selectedRole.id, key, allowed)}
                        >
                          <span className="text-xs text-gray-700 group-hover:text-blue-600 transition-colors">{permissionMapping[key]}</span>
                          <div className={`w-8 h-4 rounded-full relative transition-colors ${allowed ? 'bg-green-500' : 'bg-gray-200'}`}>
                             <div className={`absolute top-0.5 w-3 h-3 rounded-full bg-white transition-all ${allowed ? 'left-4.5' : 'left-0.5'}`} />
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                </div>

                {/* Data Access Scope */}
                <div className="mb-4 pb-4 border-b border-gray-100">
                  <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Data Access Scope</h4>
                  <p className="text-sm font-semibold text-gray-800">{selectedRole.dataScope?.scopeType || 'OWN'}</p>
                  <p className="text-xs text-gray-500 mb-2">
                    {selectedRole.dataScope?.scopeType === 'ALL' ? 'This role has access to all data.' : 
                     selectedRole.dataScope?.scopeType === 'TEAM' ? 'This role has access to team data.' : 
                     'This role has access to owned data only.'}
                  </p>
                  <button 
                    onClick={handleUpdateScope}
                    className="btn btn-outline btn-sm btn-primary w-full"
                  >
                    Edit Scope
                  </button>
                </div>

                {/* Assigned Users */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Assigned Users ({selectedRole._count?.users || 0})</h4>
                    <button className="text-xs text-blue-600 hover:underline">View all</button>
                  </div>
                  <div className="space-y-2">
                    {usersLoading ? (
                      <div className="flex justify-center py-4">
                        <span className="loading loading-spinner loading-xs text-blue-600"></span>
                      </div>
                    ) : assignedUsers.length > 0 ? (
                      assignedUsers.map((user) => (
                        <div key={user.id} className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-gray-50 transition-colors">
                          <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center text-[10px] font-bold text-blue-600 overflow-hidden">
                            {user.avatarUrl ? (
                              <img src={user.avatarUrl} alt={user.name} className="w-full h-full object-cover" />
                            ) : (
                              user.initials || user.name.charAt(0)
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-[11px] font-medium text-gray-800 truncate">{user.name}</p>
                            <p className="text-[9px] text-gray-500 truncate">{user.email}</p>
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="text-[10px] text-gray-400 text-center py-4 italic">No users assigned to this role</p>
                    )}
                  </div>
                </div>
              </div>
            </motion.aside>
          )}
        </AnimatePresence>
      </div>
    </PermissionGuard>
  );
}