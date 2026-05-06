import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Upload, FolderPlus, List, LayoutGrid, CheckCircle2, Lock, FileText, FileSpreadsheet, FileArchive, File, Image, X, Key, Folder, Filter, FileCode, FileJson, Download, ChevronLeft, ChevronRight, MoreHorizontal, Plus } from "lucide-react";


// Types for drive files
interface DriveFile {
  id: string;
  name: string;
  owner: string;
  initials: string;
  color: string;
  size: string;
  type: string;
  access: string;
  uploadedAt: string;
  url: string;
  source: string;
  leadName: string;
  isFolder: boolean;
  tags?: string[];
  description?: string;
}

function FileIcon({ type, isFolder }: { type: string; isFolder?: boolean }) {
  if (isFolder) return <Folder size={18} className="text-yellow-500" />;
  if (type === "PDF") return <FileText size={18} className="text-red-500" />;
  if (type === "JPG" || type === "PNG") return <Image size={18} className="text-blue-400" />;
  if (type === "XLSX") return <FileSpreadsheet size={18} className="text-green-500" />;
  if (type === "DOCX") return <FileText size={18} className="text-blue-600" />;
  if (type === "ZIP") return <FileArchive size={18} className="text-gray-500" />;
  return <FileText size={18} className="text-gray-400" />;
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.05 } },
};
const itemVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0 },
};

export default function DrivePage() {
  const [files, setFiles] = useState<DriveFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [selected, setSelected] = useState<DriveFile | null>(null);
  const [activeTab, setActiveTab] = useState("All Files");
  const [viewMode, setViewMode] = useState<"list" | "grid">("list");
  const tabs = ["All Files", "Drive", "Chat", "Note", "Trash"];

  const fetchFiles = async () => {
    try {
      const res = await fetch("/api/drive");
      if (res.ok) {
        const data = await res.json();
        setFiles(data);
      }
    } catch (error) {
      console.error("Failed to fetch drive files");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFiles();
  }, []);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      // 1. Upload to Cloudinary
      const formData = new FormData();
      formData.append("file", file);
      
      const uploadRes = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (!uploadRes.ok) throw new Error("Upload failed");
      const uploadData = await uploadRes.json();

      // 2. Save to Drive Database
      const saveRes = await fetch("/api/drive", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: file.name,
          fileName: file.name,
          fileUrl: uploadData.url,
          fileType: file.name.split('.').pop() || 'file',
          fileSize: file.size,
        }),
      });

      if (saveRes.ok) {
        fetchFiles();
      }
    } catch (error) {
      console.error("Upload error:", error);
      alert("Failed to upload file");
    } finally {
      setUploading(false);
    }
  };

  const filteredFiles = files.filter(f => {
    if (activeTab === "All Files") return true;
    return f.source === activeTab;
  });

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
            <h1 className="text-2xl font-bold text-gray-900">Drive</h1>
            <p className="text-sm text-gray-500 mt-0.5">All files and folders. Includes restricted and encrypted data.</p>
          </div>
          <div className="flex gap-2">
            <input 
              type="file" 
              id="drive-upload" 
              className="hidden" 
              onChange={handleUpload}
            />
            <motion.button 
              whileHover={{ scale: 1.03 }} 
              onClick={() => document.getElementById("drive-upload")?.click()}
              disabled={uploading}
              className="btn btn-sm btn-outline gap-2 bg-white"
            >
              {uploading ? <span className="loading loading-spinner loading-xs" /> : <Upload size={14} />}
              Upload
            </motion.button>
            <motion.button whileHover={{ scale: 1.03 }} className="btn btn-sm btn-outline gap-2 bg-white">
              <FolderPlus size={14} /> New Folder
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
                  layoutId="driveTabLine"
                  className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 rounded-t"
                />
              )}
            </button>
          ))}
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-2 mb-4">
          <button className="btn btn-sm btn-outline gap-1.5 bg-white">
            <Filter size={13} /> Filters
          </button>
          {["All Types", "All Owners", "All Tags"].map((f) => (
            <select key={f} className="select select-bordered select-sm text-sm bg-white">
              <option>{f}</option>
            </select>
          ))}
          <div className="ml-auto flex items-center gap-2">
            <select className="select select-bordered select-sm text-sm bg-white">
              <option>Sort by: Newest First</option>
              <option>Sort by: Oldest First</option>
              <option>Sort by: Name A-Z</option>
            </select>
            <div className="flex border border-gray-200 rounded-lg overflow-hidden bg-white">
              {(["list", "grid"] as const).map((mode) => (
                <button
                  key={mode}
                  onClick={() => setViewMode(mode)}
                  className={`p-2 transition-colors ${viewMode === mode ? "bg-blue-50 text-blue-600" : "bg-white text-gray-400 hover:bg-gray-50"}`}
                >
                  {mode === "list" ? <List size={15} /> : <LayoutGrid size={15} />}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-x-auto">
          <table className="table table-sm w-full">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                {["Name", "Owner", "Size", "Type", "Access", "Uploaded At", ""].map((h, i) => (
                  <th key={i} className="text-xs font-semibold text-gray-500 py-3 text-left px-4">{h}</th>
                ))}
              </tr>
            </thead>
            <motion.tbody variants={containerVariants} initial="hidden" animate="visible">
              {loading ? (
                <tr>
                    <td colSpan={7} className="text-center py-12">
                        <span className="loading loading-spinner loading-md text-blue-600" />
                    </td>
                </tr>
              ) : filteredFiles.length === 0 ? (
                <tr>
                    <td colSpan={7} className="text-center py-12 text-gray-500">
                        No files found in this section.
                    </td>
                </tr>
              ) : filteredFiles.map((file) => (
                <motion.tr
                  key={file.id}
                  variants={itemVariants}
                  onClick={() => setSelected(file)}
                  whileHover={{ backgroundColor: "rgba(59,130,246,0.03)" }}
                  className={`border-b border-gray-100 cursor-pointer transition-colors ${
                    selected?.id === file.id ? "bg-blue-50/60" : ""
                  }`}
                >
                  <td className="py-2.5 px-4">
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-lg bg-gray-50 border border-gray-100 flex items-center justify-center flex-shrink-0">
                        <FileIcon type={file.type} isFolder={file.isFolder} />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-800">{file.name}</p>
                        {file.isFolder && <p className="text-xs text-gray-400">Folder</p>}
                      </div>
                    </div>
                  </td>
                  <td className="px-4">
                    <div className="flex items-center gap-2">
                      <div className={`w-6 h-6 rounded-full ${file.color || 'bg-gray-400'} text-white text-xs font-bold flex items-center justify-center`}>
                        {file.initials}
                      </div>
                      <span className="text-xs text-gray-700">{file.owner}</span>
                    </div>
                  </td>
                  <td className="text-xs text-gray-600 px-4">{file.size}</td>
                  <td className="text-xs text-gray-600 px-4">{file.type}</td>
                  <td className="px-4">
                    <span className={`badge badge-sm font-medium gap-1 ${
                      file.source === "Drive"
                        ? "text-teal-700 bg-teal-50 border-teal-200"
                        : file.source === "Chat"
                        ? "text-blue-700 bg-blue-50 border-blue-200"
                        : "text-indigo-700 bg-indigo-50 border-indigo-200"
                    }`}>
                      {file.source}
                    </span>
                  </td>
                  <td className="text-xs text-gray-500 px-4">
                    {new Date(file.uploadedAt).toLocaleDateString()}
                  </td>
                  <td className="px-4" onClick={(e) => e.stopPropagation()}>
                    <a href={file.url} target="_blank" rel="noopener noreferrer" className="p-1 hover:bg-gray-100 rounded text-blue-500">
                        <Upload size={14} className="rotate-180" />
                    </a>
                  </td>
                </motion.tr>
              ))}
            </motion.tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex flex-wrap items-center justify-between mt-4 text-sm text-gray-500 gap-4">
          <span>Showing 1 to 10 of 248 files</span>
          <div className="flex items-center gap-1">
            <button className="btn btn-xs btn-ghost"><ChevronLeft size={14} /></button>
            {[1, 2, 3].map((p) => (
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

      {/* File Detail Panel */}
      <AnimatePresence>
        {selected && (
          <motion.aside
            key="file-panel"
            initial={{ x: 320, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 320, opacity: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 28 }}
            className="w-64 flex-shrink-0 bg-white border-l border-gray-200 overflow-y-auto"
          >
            <div className="p-4">
              {selected.access === "Restricted" && (
                <motion.div
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-center"
                >
                  <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-2">
                    <Lock size={16} className="text-red-600" />
                  </div>
                  <p className="text-xs font-semibold text-red-700">Restricted File</p>
                  <p className="text-xs text-red-500 mt-0.5">This file is encrypted and access is restricted.</p>
                  <button className="btn btn-xs btn-outline btn-error mt-2 w-full gap-1">
                    <Key size={10} /> View Key / Decrypt
                  </button>
                </motion.div>
              )}

              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-gray-800">File Details</h3>
                <button onClick={() => setSelected(null as any)} className="btn btn-ghost btn-xs btn-square">
                  <X size={14} />
                </button>
              </div>

              <div className="space-y-3">
                {[
                  { label: "File Name", value: selected.name },
                  { label: "Owner", value: selected.owner },
                  { label: "Size", value: selected.size },
                  { label: "Type", value: selected.type },
                  { label: "Uploaded At", value: selected.uploadedAt },
                ].map(({ label, value }) => (
                  <div key={label}>
                    <p className="text-xs text-gray-500 mb-0.5">{label}</p>
                    <p className="text-xs font-medium text-gray-800 break-all">{value}</p>
                  </div>
                ))}

                <div>
                  <p className="text-xs text-gray-500 mb-0.5">Access</p>
                  <span className={`badge badge-sm font-medium gap-1 ${
                    selected.access === "Restricted"
                      ? "text-red-600 bg-red-50 border-red-200"
                      : "text-green-700 bg-green-50 border-green-200"
                  }`}>
                    {selected.access === "Restricted" ? <Lock size={9} /> : <CheckCircle2 size={9} />}
                    {selected.access}
                  </span>
                </div>

                {selected.tags && selected.tags.length > 0 && (
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Tags</p>
                    <div className="flex flex-wrap gap-1">
                      {selected.tags.map((tag) => (
                        <span key={tag} className="badge badge-sm badge-ghost text-xs">{tag}</span>
                      ))}
                      <button className="badge badge-sm badge-ghost text-xs gap-0.5">
                        <Plus size={10} />
                      </button>
                    </div>
                  </div>
                )}

                {selected.description && (
                  <div>
                    <p className="text-xs text-gray-500 mb-0.5">Description</p>
                    <p className="text-xs text-gray-700">{selected.description}</p>
                  </div>
                )}
              </div>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>
    </div>
  );
}
