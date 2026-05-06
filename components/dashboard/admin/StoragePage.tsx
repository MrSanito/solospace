import { useState } from "react";
import { motion } from "framer-motion";
import {
  RefreshCw,
  Plus,
  Settings,
  MoreVertical,
  Shield,
  Lock,
  Key,
  AlertTriangle,
  Info,
  CheckCircle,
  Globe,
} from "lucide-react";

const slideInRight = {
  initial: { opacity: 0, x: 40 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: 40 },
};

export default function StoragePage() {
  const [activeTab, setActiveTab] = useState("Cloud Storage");

  const providers = [
    { icon: "🟡", name: "Google Drive", email: "space.motors@space.com", bucket: "Space Motors Drive", used: "620 GB", total: "2 TB", status: "Connected", sync: "19 Apr 2024, 11:05 AM" },
    { icon: "🔵", name: "OneDrive", email: "space.motors@outlook.com", bucket: "Space Motors OneDrive", used: "180 GB", total: "1 TB", status: "Connected", sync: "19 Apr 2024, 10:58 AM" },
    { icon: "🟠", name: "AWS S3", email: "s3://space-motors-bucket", bucket: "space-motors-bucket", used: "410 GB", total: "2 TB", status: "Connected", sync: "19 Apr 2024, 10:45 AM" },
  ];

  return (
    <div className="flex-1 flex flex-col min-h-0 bg-gray-50">
      <div className="flex flex-1 min-h-0 overflow-hidden">
        <div className="flex-1 overflow-y-auto p-6">
          <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}>
            <h1 className="text-xl font-bold text-gray-900">Storage Control</h1>
            <p className="text-sm text-gray-400 mb-5">Manage cloud storage, encryption and data retention settings.</p>

            {/* Tabs */}
            <div className="flex border-b border-gray-200 mb-6">
              {["Cloud Storage", "Encryption Settings", "Data Retention", "Backup & Recovery", "Usage Analytics"].map(t => (
                <button
                  key={t}
                  onClick={() => setActiveTab(t)}
                  className={`px-4 py-2.5 text-xs font-semibold border-b-2 transition-colors ${activeTab === t ? "border-blue-600 text-blue-600" : "border-transparent text-gray-500 hover:text-gray-700"}`}
                >
                  {t}
                </button>
              ))}
            </div>

            {/* Connected accounts */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 mb-5">
              <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
                <p className="text-sm font-bold text-gray-800">Connected Cloud Accounts</p>
                <button className="flex items-center gap-1.5 text-xs text-gray-500 border border-gray-200 rounded-lg px-3 py-1.5 hover:bg-gray-50">
                  <RefreshCw size={12} /> Refresh
                </button>
              </div>

              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-gray-100">
                    {["Provider", "Account / Bucket", "Used", "Total", "Status", "Last Sync", "Actions"].map(h => (
                      <th key={h} className="px-5 py-3 text-left text-[11px] font-semibold text-gray-400 uppercase tracking-wide">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {providers.map((p, i) => (
                    <motion.tr
                      key={i}
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.08 }}
                      className="border-b border-gray-50 hover:bg-gray-50 transition-colors"
                    >
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-2">
                          <span className="text-base">{p.icon}</span>
                          <div>
                            <p className="font-semibold text-gray-800">{p.name}</p>
                            <p className="text-gray-400">{p.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-3 text-gray-600">{p.bucket}</td>
                      <td className="px-5 py-3 text-gray-700 font-medium">{p.used}</td>
                      <td className="px-5 py-3 text-gray-600">{p.total}</td>
                      <td className="px-5 py-3">
                        <span className="text-[10px] font-bold bg-green-100 text-green-700 px-2 py-0.5 rounded-full">{p.status}</span>
                      </td>
                      <td className="px-5 py-3">
                        <p className="text-gray-600">{p.sync}</p>
                        <p className="text-green-500 flex items-center gap-1"><span className="w-1.5 h-1.5 bg-green-500 rounded-full inline-block" /> Synced</p>
                      </td>
                      <td className="px-5 py-3">
                        <div className="flex gap-2">
                          <Settings size={14} className="text-gray-400 cursor-pointer hover:text-gray-600" />
                          <MoreVertical size={14} className="text-gray-400 cursor-pointer hover:text-gray-600" />
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>

              <div className="px-5 py-3">
                <button className="flex items-center gap-1.5 text-xs text-blue-600 border border-blue-200 rounded-lg px-3 py-2 hover:bg-blue-50 transition-colors">
                  <Plus size={12} /> Connect New Cloud
                </button>
              </div>
            </div>

            {/* Bottom row */}
            <div className="grid grid-cols-2 gap-5">
              {/* Encryption config */}
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
                <p className="text-sm font-bold text-gray-800 mb-4">Encryption Configuration</p>

                <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-4 flex items-center gap-3">
                  <Shield size={20} className="text-green-600 shrink-0" />
                  <div>
                    <p className="text-xs font-bold text-green-700">Encryption Status</p>
                    <p className="text-xs font-semibold text-green-600">All files are encrypted</p>
                    <p className="text-[11px] text-green-500">AES-256 encryption is enabled for all storage.</p>
                  </div>
                </div>

                <p className="text-[11px] text-gray-400 font-semibold mb-1">Default Encryption</p>
                <div className="flex items-center gap-2 mb-3">
                  <Lock size={14} className="text-gray-500" />
                  <span className="text-sm font-bold text-blue-600">AES-256</span>
                  <span className="text-[10px] text-gray-400 bg-gray-100 px-1.5 rounded">ℹ</span>
                </div>
                <p className="text-[11px] text-gray-400 mb-3">Encryption applied to all files and backups.</p>

                <p className="text-[11px] text-gray-400 font-semibold mb-1">Encryption Key Management</p>
                <div className="flex items-center gap-2 mb-1">
                  <Key size={14} className="text-gray-500" />
                  <span className="text-sm font-bold text-blue-600">Owner Controlled</span>
                </div>
                <p className="text-[11px] text-gray-400 mb-4">Only owner can manage encryption keys.</p>

                <button className="flex items-center gap-1.5 text-xs text-blue-600 border border-blue-200 rounded-lg px-3 py-2 hover:bg-blue-50 transition-colors">
                  <Key size={12} /> Manage Encryption Keys
                </button>
              </motion.div>

              {/* Access & Encryption Rules */}
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
                <p className="text-sm font-bold text-gray-800 mb-4">Access & Encryption Rules</p>

                <div className="space-y-3">
                  {[
                    { label: "Encrypt files at rest", sub: "All files stored in cloud are encrypted.", on: true },
                    { label: "Encrypt files in transit", sub: "All file transfers are encrypted (TLS 1.2+).", on: true },
                    { label: "Owner key required for decryption", sub: "Files can only be decrypted with owner key.", on: true },
                    { label: "Prevent external downloads", sub: "Restrict download of encrypted files to authorized users only.", on: true },
                    { label: "Watermark on file access", sub: "Apply dynamic watermark on document preview.", on: false },
                  ].map((rule) => (
                    <div key={rule.label} className="flex items-center gap-3">
                      <Lock size={14} className="text-gray-400 shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold text-gray-800">{rule.label}</p>
                        <p className="text-[11px] text-gray-400">{rule.sub}</p>
                      </div>
                      <div className={`w-10 h-5 rounded-full transition-colors cursor-pointer shrink-0 relative ${rule.on ? "bg-blue-600" : "bg-gray-200"}`}>
                        <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-all ${rule.on ? "left-5" : "left-0.5"}`} />
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-4 pt-4 border-t border-gray-100">
                  <button className="flex items-center gap-1.5 text-xs text-blue-600 border border-blue-200 rounded-lg px-3 py-2 hover:bg-blue-50 transition-colors">
                    <Settings size={12} /> Edit Encryption Rules
                  </button>
                </div>
              </motion.div>
            </div>
          </motion.div>
        </div>

        {/* Right panel */}
        <motion.div variants={slideInRight} initial="initial" animate="animate" className="w-72 border-l border-gray-200 bg-white overflow-y-auto shrink-0 p-5 space-y-6">
          {/* Storage summary */}
          <div>
            <p className="text-sm font-bold text-gray-800 mb-4">Storage Summary</p>
            <div className="flex items-center gap-4 mb-4">
              <div className="relative w-20 h-20">
                <svg viewBox="0 0 36 36" className="w-full h-full -rotate-90">
                  <circle cx="18" cy="18" r="15.9" fill="none" stroke="#e5e7eb" strokeWidth="3" />
                  <motion.circle
                    cx="18" cy="18" r="15.9" fill="none" stroke="#2563EB" strokeWidth="3"
                    strokeDasharray="100"
                    initial={{ strokeDashoffset: 100 }}
                    animate={{ strokeDashoffset: 76 }}
                    transition={{ duration: 1.2, ease: "easeOut" }}
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-sm font-bold text-gray-800">24%</span>
                </div>
              </div>
              <div className="space-y-2">
                {[
                  { label: "Total Storage", val: "5 TB" },
                  { label: "Used Storage", val: "1.2 TB" },
                  { label: "Available", val: "3.8 TB" },
                ].map(({ label, val }) => (
                  <div key={label}>
                    <p className="text-[11px] text-gray-400">{label}</p>
                    <p className="text-xs font-bold text-gray-800">{val}</p>
                  </div>
                ))}
              </div>
            </div>
            <button className="text-xs text-blue-500 hover:underline">View Usage Analytics →</button>
          </div>

          {/* Recent alerts */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm font-bold text-gray-800">Recent Storage Alerts</p>
              <button className="text-xs text-blue-500 hover:underline">View all</button>
            </div>
            <div className="space-y-3">
              {[
                { icon: AlertTriangle, color: "text-orange-500", label: "High storage usage on Google Drive", sub: "620 GB of 2 TB used (90%)", time: "2h ago" },
                { icon: Info, color: "text-blue-500", label: "Backup completed successfully", sub: "AWS S3 backup completed", time: "5h ago" },
                { icon: CheckCircle, color: "text-green-500", label: "Encryption verified", sub: "All files are successfully encrypted", time: "1d ago" },
              ].map((a, i) => (
                <div key={i} className="flex gap-2">
                  <a.icon size={14} className={`${a.color} shrink-0 mt-0.5`} />
                  <div>
                    <p className="text-[11px] font-semibold text-gray-800">{a.label}</p>
                    <p className="text-[10px] text-gray-400">{a.sub}</p>
                    <p className="text-[10px] text-gray-300 mt-0.5">{a.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Data location */}
          <div>
            <p className="text-sm font-bold text-gray-800 mb-3">Data Location</p>
            {[
              { label: "Primary Region", val: "Mumbai, India" },
              { label: "Backup Region", val: "Singapore" },
            ].map(({ label, val }) => (
              <div key={label} className="flex items-center justify-between py-2 border-b border-gray-50">
                <div className="flex items-center gap-1.5">
                  <Globe size={12} className="text-gray-400" />
                  <div>
                    <p className="text-[11px] font-semibold text-gray-700">{label}</p>
                    <p className="text-[10px] text-gray-400">{val}</p>
                  </div>
                </div>
                <button className="text-[11px] text-blue-500 hover:underline">Change</button>
              </div>
            ))}
            <p className="text-[10px] text-gray-400 mt-2">All data is stored in compliance with local regulations.</p>
          </div>

          {/* Compliance */}
          <div>
            <p className="text-sm font-bold text-gray-800 mb-2">Data Compliance</p>
            <div className="flex items-center gap-1.5 mb-1">
              <CheckCircle size={14} className="text-green-500" />
              <span className="text-xs font-bold text-green-600">Compliant</span>
            </div>
            <p className="text-[11px] text-gray-400">Your data storage is compliant with company policy.</p>
            <button className="text-xs text-blue-500 hover:underline mt-1">View Compliance Report →</button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
