"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard, MessageSquare, HardDrive, FileText,
  Bell, Zap, Link2, Cloud, Shield, Lock, Settings,
  Search, RefreshCw, ChevronRight, Download, Filter,
  X, Eye, EyeOff, MoreHorizontal, AlertTriangle,
  CheckCircle, Info, Globe, Key, User, LogIn,
  MoreVertical, ChevronLeft, ChevronDown, Plus,
  Wifi, Upload, Database, Clock, Activity,
} from "lucide-react";

// ─── Shared Types ────────────────────────────────────────────────────────────
type Page = "login" | "overview" | "chat" | "alerts" | "storage";

// ─── Animation Variants ──────────────────────────────────────────────────────
const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -10 },
};

const staggerContainer = {
  animate: { transition: { staggerChildren: 0.07 } },
};

const slideInRight = {
  initial: { opacity: 0, x: 40 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: 40 },
};

// ─── Sidebar ─────────────────────────────────────────────────────────────────
function Sidebar({ page, setPage }: { page: Page; setPage: (p: Page) => void }) {
  const navItems = [
    { id: "overview" as Page, icon: LayoutDashboard, label: "Overview" },
    { id: "chat" as Page, icon: MessageSquare, label: "Chat Oversight" },
    { id: null, icon: HardDrive, label: "Drive" },
    { id: null, icon: FileText, label: "Audit Log" },
    { id: "alerts" as Page, icon: Bell, label: "Alerts" },
    { id: null, icon: Zap, label: "Automations" },
    { id: null, icon: Link2, label: "Integrations" },
    { id: "storage" as Page, icon: Cloud, label: "Storage" },
    { id: null, icon: Shield, label: "Access Control" },
    { id: null, icon: Lock, label: "Session & Security" },
    { id: null, icon: Settings, label: "Settings" },
  ];

  return (
    <motion.aside
      initial={{ x: -80, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="w-44 min-h-screen flex flex-col bg-[#0d1117] text-white shrink-0"
    >
      {/* Logo */}
      <div className="px-4 py-5 border-b border-white/10">
        <motion.div
          whileHover={{ scale: 1.03 }}
          className="flex items-center gap-2 cursor-pointer"
          onClick={() => setPage("overview")}
        >
          <div className="text-xl font-extrabold tracking-widest text-white font-mono">
            SPACE<span className="text-blue-400">✦</span>
          </div>
        </motion.div>
      </div>

      {/* Nav */}
      <nav className="flex-1 py-3 px-2 space-y-0.5 overflow-y-auto">
        {navItems.map((item, i) => {
          const isActive = page === item.id;
          return (
            <motion.div
              key={i}
              whileHover={{ x: 3 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => item.id && setPage(item.id)}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer transition-colors text-sm font-medium relative
                ${isActive ? "bg-blue-600 text-white" : "text-gray-400 hover:text-white hover:bg-white/10"}`}
            >
              <item.icon size={16} className="shrink-0" />
              <span>{item.label}</span>
            </motion.div>
          );
        })}
      </nav>

      {/* Storage bar */}
      <div className="px-4 py-4 border-t border-white/10">
        <p className="text-[11px] text-gray-400 font-semibold mb-1">Storage Overview</p>
        <p className="text-[11px] text-gray-400">1.2 TB / 5 TB used</p>
        <div className="mt-2 h-1.5 bg-white/10 rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: "24%" }}
            transition={{ duration: 1, delay: 0.5 }}
            className="h-full bg-blue-500 rounded-full"
          />
        </div>
        <p className="text-[11px] text-gray-400 mt-1">24%</p>
        <button
          className="text-[11px] text-blue-400 hover:underline mt-1"
          onClick={() => setPage("storage")}
        >
          View Details →
        </button>
      </div>
    </motion.aside>
  );
}

// ─── Top Bar ─────────────────────────────────────────────────────────────────
function TopBar({
  placeholder = "Search clients, files, employees, leads...",
  alertCount = 8,
}: {
  placeholder?: string;
  alertCount?: number;
}) {
  return (
    <div className="h-14 border-b border-gray-200 flex items-center gap-4 px-6 bg-white shrink-0">
      <div className="flex-1 flex items-center gap-2 bg-gray-100 rounded-lg px-3 py-2">
        <Search size={14} className="text-gray-400" />
        <input
          className="bg-transparent text-sm text-gray-600 placeholder:text-gray-400 outline-none flex-1"
          placeholder={placeholder}
        />
        <kbd className="text-[10px] text-gray-400 bg-gray-200 px-1.5 py-0.5 rounded font-mono">⌘K</kbd>
      </div>
      <div className="relative cursor-pointer">
        <Bell size={18} className="text-gray-500" />
      </div>
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs font-bold">OM</div>
        <div className="hidden sm:block">
          <p className="text-xs font-semibold text-gray-800">Owner</p>
          <p className="text-[10px] text-gray-400">Space Motors</p>
        </div>
      </div>
    </div>
  );
}

// ─── LOGIN PAGE ──────────────────────────────────────────────────────────────
function LoginPage({ setPage }: { setPage: (p: Page) => void }) {
  const [showPass, setShowPass] = useState(false);

  const features = [
    { icon: MessageSquare, title: "Oversee Chats", desc: "View and manage all employee conversations in real-time." },
    { icon: HardDrive, title: "Secure Drive", desc: "Access all files including restricted data with full control." },
    { icon: Shield, title: "Audit & Alerts", desc: "Monitor activity, review audits and stay ahead with real-time alerts." },
  ];

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#050a14] relative overflow-hidden">
      {/* Stars bg */}
      {[...Array(60)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-0.5 h-0.5 bg-white rounded-full"
          style={{ left: `${Math.random() * 100}%`, top: `${Math.random() * 100}%` }}
          animate={{ opacity: [0.2, 1, 0.2] }}
          transition={{ duration: 2 + Math.random() * 3, repeat: Infinity, delay: Math.random() * 3 }}
        />
      ))}

      {/* Glow */}
      <div className="absolute bottom-0 left-1/3 w-96 h-32 bg-blue-600/30 blur-3xl rounded-full" />

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="flex w-[860px] max-w-[95vw] rounded-2xl overflow-hidden shadow-2xl z-10"
      >
        {/* Left panel */}
        <div className="w-2/5 bg-[#0d1420]/90 border border-white/10 p-10 flex flex-col justify-between backdrop-blur-xl">
          <div>
            <div className="text-2xl font-extrabold tracking-widest text-white font-mono mb-1">
              SPACE<span className="text-blue-400">✦</span>
            </div>
            <p className="text-gray-400 text-sm">Secure. Controlled. Encrypted.</p>

            <div className="mt-4 mb-8">
              <span className="inline-flex items-center gap-1.5 bg-white/10 px-3 py-1.5 rounded-full text-xs text-white border border-white/10">
                <Shield size={12} className="text-blue-400" /> Owner Access
              </span>
            </div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-3xl font-bold text-white leading-tight"
            >
              Take Control.<br />Monitor Everything.
            </motion.h1>
            <div className="w-12 h-0.5 bg-blue-500 mt-4 mb-8" />

            <motion.div variants={staggerContainer} initial="initial" animate="animate" className="space-y-5">
              {features.map((f, i) => (
                <motion.div key={i} variants={fadeInUp} className="flex gap-3">
                  <div className="w-9 h-9 rounded-lg bg-white/10 flex items-center justify-center shrink-0">
                    <f.icon size={16} className="text-white" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-white">{f.title}</p>
                    <p className="text-xs text-gray-400 mt-0.5">{f.desc}</p>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </div>

          <p className="text-xs text-gray-500 flex items-center gap-1.5">
            <Lock size={10} /> Your data is encrypted and protected at every layer.
          </p>
        </div>

        {/* Right panel */}
        <motion.div
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.15, duration: 0.4 }}
          className="flex-1 bg-white p-10 flex flex-col justify-center"
        >
          <h2 className="text-2xl font-bold text-gray-900 mb-1">Welcome Back</h2>
          <p className="text-sm text-gray-500 mb-8">Sign in to your SPACE owner account</p>

          <div className="space-y-4">
            <div>
              <label className="text-xs font-semibold text-gray-700 mb-1.5 block">Email</label>
              <div className="flex items-center gap-2 border border-gray-300 rounded-lg px-3 py-2.5 focus-within:border-blue-500 transition-colors">
                <User size={14} className="text-blue-400 shrink-0" />
                <input className="flex-1 text-sm outline-none text-gray-700" placeholder="Enter your email" type="email" />
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-gray-700 mb-1.5 block">Password</label>
              <div className="flex items-center gap-2 border border-gray-300 rounded-lg px-3 py-2.5 focus-within:border-blue-500 transition-colors">
                <Lock size={14} className="text-blue-400 shrink-0" />
                <input
                  className="flex-1 text-sm outline-none text-gray-700"
                  placeholder="Enter your password"
                  type={showPass ? "text" : "password"}
                />
                <button onClick={() => setShowPass(!showPass)}>
                  {showPass ? <EyeOff size={14} className="text-gray-400" /> : <Eye size={14} className="text-gray-400" />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" className="checkbox checkbox-primary checkbox-xs" defaultChecked />
                <span className="text-xs text-gray-600">Remember me</span>
              </label>
              <button className="text-xs text-blue-600 hover:underline">Forgot password?</button>
            </div>

            <motion.button
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setPage("overview")}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg transition-colors text-sm"
            >
              Sign In
            </motion.button>

            <div className="relative flex items-center gap-3">
              <div className="flex-1 h-px bg-gray-200" />
              <span className="text-xs text-gray-400">or</span>
              <div className="flex-1 h-px bg-gray-200" />
            </div>

            <motion.button
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.98 }}
              className="w-full border border-gray-300 text-gray-700 font-semibold py-3 rounded-lg hover:bg-gray-50 transition-colors text-sm flex items-center justify-center gap-2"
            >
              <Key size={14} /> Sign in with SSO
            </motion.button>
          </div>

          <p className="text-center text-xs text-gray-400 mt-6 flex items-center justify-center gap-1.5">
            <Shield size={11} /> Secure login powered by SPACE
          </p>
        </motion.div>
      </motion.div>
    </div>
  );
}

// ─── OVERVIEW PAGE ────────────────────────────────────────────────────────────
function OverviewPage({ setPage }: { setPage: (p: Page) => void }) {
  const [showSearch, setShowSearch] = useState(false);
  const [statsData, setStatsData] = useState<any>(null);

  useEffect(() => {
    fetch("/api/dashboard/stats")
      .then(res => res.json())
      .then(data => setStatsData(data))
      .catch(err => console.error("Failed to fetch stats", err));
  }, []);

  const kpis = statsData?.kpis || {};

  const recentActivity = [
    { name: "Rahul Mehta", action: "Sent a file", dot: "bg-gray-400" },
    { name: "Pooja Patel", action: "New message", dot: "bg-blue-500" },
    { name: "Arjun Reddy", action: "WhatsApp escape attempt", dot: "bg-orange-400" },
    { name: "Neha Singh", action: "New lead assigned", dot: "bg-green-500" },
    { name: "Vikram Tiwari", action: "File downloaded", dot: "bg-blue-500" },
  ];

  const alerts = [
    { label: "Abnormal download activity", sub: "Rahul Mehta", time: "2m ago", color: "text-red-500" },
    { label: "Repeated access to restricted file", sub: "Vikram Tiwari", time: "15m ago", color: "text-orange-500" },
    { label: "WhatsApp escape attempt blocked", sub: "Arjun Reddy", time: "45m ago", color: "text-orange-500" },
  ];

  return (
    <div className="flex-1 flex flex-col min-h-0 bg-gray-50">
      <TopBar alertCount={8} />

      <AnimatePresence>
        {showSearch && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 z-50 flex items-start justify-center pt-20"
            onClick={() => setShowSearch(false)}
          >
            <motion.div
              initial={{ opacity: 0, y: -20, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10 }}
              onClick={e => e.stopPropagation()}
              className="bg-white rounded-2xl shadow-2xl w-[680px] overflow-hidden"
            >
              <div className="flex items-center gap-3 px-5 py-4 border-b border-gray-100">
                <Search size={16} className="text-blue-500" />
                <input autoFocus className="flex-1 text-base outline-none text-gray-700" placeholder="amit sharma" defaultValue="amit sharma" />
                <button onClick={() => setShowSearch(false)}><X size={16} className="text-gray-400" /></button>
                <kbd className="text-[10px] text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded font-mono">⌘K</kbd>
              </div>

              {/* Tabs */}
              <div className="flex gap-1 px-4 py-2 border-b border-gray-100">
                {["All", "Clients", "Leads", "Employees", "Files", "Messages"].map((t, i) => (
                  <button key={t} className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${i === 0 ? "bg-blue-50 text-blue-600" : "text-gray-500 hover:bg-gray-100"}`}>{t}</button>
                ))}
              </div>

              <div className="p-4 space-y-5 max-h-[420px] overflow-y-auto">
                {[
                  { section: "Clients", items: [{ name: "Amit Sharma", sub: "+91 98765 43210 · Honda City ZX", badge: "Client", badgeColor: "bg-blue-100 text-blue-700" }] },
                  { section: "Employees", items: [{ name: "Amit Sharma", sub: "amit.sharma@spacemotors.com · Sales Executive", badge: "Employee", badgeColor: "bg-green-100 text-green-700" }] },
                  { section: "Leads", items: [{ name: "Amit Sharma", sub: "Lead ID: L-10023 · Honda City ZX · New Inquiry", badge: "Lead", badgeColor: "bg-orange-100 text-orange-700" }] },
                ].map((group) => (
                  <div key={group.section}>
                    <p className="text-xs font-semibold text-gray-500 mb-2">{group.section}</p>
                    {group.items.map((item) => (
                      <div key={item.name} className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded-lg cursor-pointer">
                        <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-xs font-bold">AS</div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-800">{item.name}</p>
                          <p className="text-xs text-gray-400 truncate">{item.sub}</p>
                        </div>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${item.badgeColor}`}>{item.badge}</span>
                      </div>
                    ))}
                  </div>
                ))}
              </div>

              <div className="px-4 py-3 border-t border-gray-100">
                <button className="text-sm text-blue-600 hover:underline flex items-center gap-1">
                  View all results for "amit sharma" <ChevronRight size={14} />
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex-1 overflow-y-auto p-6">
        <motion.div variants={staggerContainer} initial="initial" animate="animate" className="space-y-6">
          <motion.div variants={fadeInUp}>
            <h1 className="text-xl font-bold text-gray-900">Overview</h1>
            <p className="text-sm text-gray-500">Monitor chats, activity, and system health.</p>
          </motion.div>

          {/* Stats */}
          <motion.div variants={fadeInUp} className="grid grid-cols-3 gap-4">
            {[
              { label: "Active Chats", value: kpis.activeChats?.toString() || "0", sub: "Live conversations", color: "text-blue-600", bg: "bg-blue-50" },
              { label: "Alerts (EWS)", value: kpis.activeAlertsCount?.toString() || "0", sub: "Require attention", color: "text-red-600", bg: "bg-red-50" },
              { label: "Drive Status", value: kpis.storageFormatted || "0 MB", sub: "1.2 TB of 5 TB used", color: "text-emerald-600", bg: "bg-emerald-50" },
            ].map((s) => (
              <motion.div whileHover={{ y: -2 }} key={s.label} className={`${s.bg} rounded-xl p-4 border border-white shadow-sm`}>
                <p className="text-xs font-semibold text-gray-500 mb-1">{s.label}</p>
                <p className={`text-3xl font-bold ${s.color}`}>{s.value}</p>
                <p className="text-xs text-gray-400 mt-0.5">{s.sub}</p>
              </motion.div>
            ))}
          </motion.div>

          <div className="grid grid-cols-3 gap-4">
            {/* Recent Activity */}
            <motion.div variants={fadeInUp} className="col-span-1 bg-white rounded-xl shadow-sm border border-gray-100 p-4">
              <div className="flex items-center justify-between mb-4">
                <p className="text-sm font-bold text-gray-800">Recent Activity</p>
                <button className="text-xs text-blue-500 hover:underline">View all</button>
              </div>
              <div className="space-y-3">
                {recentActivity.map((a, i) => (
                  <motion.div key={i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.08 }} className="flex items-center gap-3">
                    <div className={`w-2 h-2 rounded-full ${a.dot} shrink-0`} />
                    <div className="min-w-0">
                      <p className="text-xs font-semibold text-gray-800 truncate">{a.name}</p>
                      <p className="text-[11px] text-gray-400 truncate">{a.action}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {/* Alerts */}
            <motion.div variants={fadeInUp} className="col-span-2 bg-white rounded-xl shadow-sm border border-gray-100 p-4">
              <div className="flex items-center justify-between mb-4">
                <p className="text-sm font-bold text-gray-800">Alerts (EWS)</p>
                <button className="text-xs text-blue-500 hover:underline" onClick={() => setPage("alerts")}>View all</button>
              </div>
              <div className="space-y-3">
                {alerts.map((a, i) => (
                  <motion.div key={i} initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.1 }} className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded-lg transition-colors">
                    <AlertTriangle size={16} className={a.color} />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-gray-800">{a.label}</p>
                      <p className="text-[11px] text-gray-400">{a.sub}</p>
                    </div>
                    <span className="text-[11px] text-gray-400 shrink-0">{a.time}</span>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>

          {/* Bottom row */}
          <div className="grid grid-cols-3 gap-4">
            <motion.div variants={fadeInUp} className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
              <p className="text-sm font-bold text-gray-800 mb-3">Storage</p>
              <p className="text-xs text-gray-500 mb-1">Drive Status</p>
              <div className="h-2 bg-gray-100 rounded-full mb-1">
                <motion.div initial={{ width: 0 }} animate={{ width: "24%" }} transition={{ duration: 1 }} className="h-full bg-blue-500 rounded-full" />
              </div>
              <p className="text-xs text-gray-400">1.2 TB of 5 TB used · 24%</p>
              <button className="text-xs text-blue-500 hover:underline mt-2" onClick={() => setPage("storage")}>Manage Storage</button>
            </motion.div>

            <motion.div variants={fadeInUp} className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
              <p className="text-sm font-bold text-gray-800 mb-3">Integrations</p>
              {[{ label: "Solo Space Sync", status: "Active" }, { label: "Chatbot", status: "Active" }].map(({ label, status }) => (
                <div key={label} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                  <div className="flex items-center gap-2"><Activity size={12} className="text-gray-400" /><span className="text-xs text-gray-700">{label}</span></div>
                  <span className="text-[10px] font-bold bg-green-100 text-green-700 px-2 py-0.5 rounded-full">{status}</span>
                </div>
              ))}
              <button className="text-xs text-blue-500 hover:underline mt-2">Manage Integrations</button>
            </motion.div>

            <motion.div variants={fadeInUp} className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
              <p className="text-sm font-bold text-gray-800 mb-3">System Health</p>
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle size={14} className="text-green-500" />
                <span className="text-xs font-semibold text-green-600">All Systems Operational</span>
              </div>
              <p className="text-[11px] text-gray-400">Last checked: 2m ago</p>
              <button className="text-xs text-blue-500 hover:underline mt-2">View system status</button>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

// ─── CHAT OVERSIGHT PAGE ──────────────────────────────────────────────────────
function ChatOversightPage() {
  const [selected, setSelected] = useState(0);
  const kpis: any = {}; // Placeholder to fix build error

  const conversations = [
    { initials: "AS", name: "Amit Sharma", agent: "Rahul Mehta", preview: "Thanks, please share the brochure.", time: "11:03 AM", unread: 2, wa: true },
    { initials: "PP", name: "Pooja Patel", agent: "Vikram Tiwari", preview: "Is there a discount on 2BHK?", time: "10:58 AM", unread: 1, wa: true },
    { initials: "RK", name: "Rohit Kumar", agent: "Sneha M.", preview: "When can I schedule a site visit?", time: "10:45 AM", unread: 0, wa: true },
    { initials: "NS", name: "Neha Singh", agent: "Arjun Reddy", preview: "Okay, I will visit the showroom.", time: "10:32 AM", unread: 3, wa: true },
    { initials: "SM", name: "Sandeep Mishra", agent: "Rahul Mehta", preview: "Price list for 3BHK please.", time: "10:15 AM", unread: 0, wa: true },
    { initials: "KT", name: "Karan Trivedi", agent: "Vikram Tiwari", preview: "Need loan eligibility details.", time: "09:48 AM", unread: 0, wa: true },
    { initials: "DS", name: "Deepak Solanki", agent: "Sneha M.", preview: "Brochure and floor plan?", time: "09:30 AM", unread: 0, wa: true },
  ];

  const messages = [
    { from: "lead", text: "Hi, I want to know the price of Honda City ZX.", time: "11:02 AM" },
    { from: "agent", text: "Hello Amit! The Honda City ZX price starts at ₹12.29 Lakh (Ex-showroom). Would you like details on variants?", time: "11:03 AM" },
    { from: "lead", text: "Yes, please share the top variant features.", time: "11:04 AM" },
    { from: "agent", text: "Sure! The top variant includes:\n• 7\" Touchscreen Infotainment\n• Honda Sensing\n• Sunroof\n• Leather Seats\nWould you like the brochure?", time: "11:05 AM" },
    { from: "lead", text: "Yes, please.", time: "11:06 AM" },
  ];

  return (
    <div className="flex-1 flex flex-col min-h-0 bg-gray-50">
      <div className="h-14 border-b border-gray-200 flex items-center gap-4 px-6 bg-white shrink-0">
        <div>
          <h1 className="text-base font-bold text-gray-900">Chat Oversight</h1>
          <p className="text-xs text-gray-400">View all employee chats in real-time. Read-only mode.</p>
        </div>
        <div className="flex-1 flex items-center gap-2 bg-gray-100 rounded-lg px-3 py-2 ml-4">
          <Search size={13} className="text-gray-400" />
          <input className="bg-transparent text-sm text-gray-600 placeholder:text-gray-400 outline-none flex-1" placeholder="Search client, lead, employee or message..." />
          <kbd className="text-[10px] text-gray-400 bg-gray-200 px-1.5 py-0.5 rounded font-mono">⌘K</kbd>
        </div>
        <div className="relative">
          <Bell size={18} className="text-gray-500" />
        </div>
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs font-bold">OM</div>
          <div><p className="text-xs font-semibold text-gray-800">Owner</p><p className="text-[10px] text-gray-400">Space Motors</p></div>
        </div>
      </div>

      <div className="flex flex-1 min-h-0">
        {/* Conversations list */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.35 }}
          className="w-72 border-r border-gray-200 bg-white flex flex-col shrink-0"
        >
          <div className="p-4 border-b border-gray-100">
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm font-bold text-gray-800">Conversations</p>
              <Filter size={14} className="text-gray-400 cursor-pointer" />
            </div>
            <div className="flex gap-2 text-xs">
              {[`All (${kpis.totalLeads || 0})`, "Employees", "Leads"].map((t, i) => (
                <button key={t} className={`px-2.5 py-1 rounded-full font-medium transition-colors ${i === 0 ? "bg-blue-600 text-white" : "text-gray-500 hover:bg-gray-100"}`}>{t}</button>
              ))}
            </div>
            <div className="mt-3 flex items-center gap-2 bg-gray-100 rounded-lg px-3 py-2">
              <Search size={12} className="text-gray-400" />
              <input className="bg-transparent text-xs text-gray-500 placeholder:text-gray-400 outline-none flex-1" placeholder="Search conversations..." />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto">
            {conversations.map((c, i) => (
              <motion.div
                key={i}
                whileHover={{ backgroundColor: "#f8fafc" }}
                onClick={() => setSelected(i)}
                className={`flex items-start gap-3 px-4 py-3 border-b border-gray-50 cursor-pointer transition-colors ${selected === i ? "bg-blue-50 border-l-2 border-l-blue-500" : ""}`}
              >
                <div className="w-9 h-9 rounded-full bg-blue-100 text-blue-700 font-bold text-xs flex items-center justify-center shrink-0">{c.initials}</div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-center mb-0.5">
                    <p className="text-xs font-semibold text-gray-800 truncate">{c.name}</p>
                    <span className="text-[10px] text-gray-400 shrink-0">{c.time}</span>
                  </div>
                  <p className="text-[11px] text-gray-500 truncate">{c.agent}</p>
                  <div className="flex items-center justify-between mt-0.5">
                    <p className="text-[11px] text-gray-400 truncate flex-1">{c.preview}</p>
                    {c.unread > 0 && <span className="ml-2 bg-blue-500 text-white text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center shrink-0">{c.unread}</span>}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          <div className="p-3 border-t border-gray-100 flex items-center gap-2 text-xs text-gray-400">
            <ChevronLeft size={14} className="cursor-pointer hover:text-gray-600" />
            {[1, 2, 3].map(n => <button key={n} className={`w-6 h-6 rounded ${n === 1 ? "bg-blue-600 text-white" : "hover:bg-gray-100"}`}>{n}</button>)}
            <span>...</span><span>16</span>
            <ChevronRight size={14} className="cursor-pointer hover:text-gray-600 ml-auto" />
          </div>
        </motion.div>

        {/* Chat view */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.15 }}
          className="flex-1 flex flex-col min-w-0"
        >
          <div className="h-14 border-b border-gray-200 bg-white flex items-center gap-3 px-4 shrink-0">
            <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 font-bold text-xs flex items-center justify-center">AS</div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <p className="text-sm font-bold text-gray-800">Amit Sharma</p>
                <div className="w-2 h-2 rounded-full bg-green-500" />
              </div>
              <p className="text-[11px] text-gray-400">Lead ID: L-10023 · Project: Honda City ZX</p>
            </div>
            <button className="flex items-center gap-1.5 text-xs text-blue-600 border border-blue-200 rounded-lg px-3 py-1.5 hover:bg-blue-50 transition-colors">
              <FileText size={12} /> View Lead Details
            </button>
            <MoreHorizontal size={16} className="text-gray-400 cursor-pointer" />
          </div>

          <div className="bg-amber-50 border-b border-amber-200 px-4 py-2 flex items-center gap-2 text-xs text-amber-700 shrink-0">
            <Eye size={12} /> You are viewing this chat in read-only mode.
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            <div className="text-center text-[11px] text-gray-400 bg-white border border-gray-100 rounded-full px-3 py-1 w-fit mx-auto">Today</div>

            {messages.map((m, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className={`flex ${m.from === "lead" ? "justify-start" : "justify-end"}`}
              >
                {m.from === "lead" && <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 font-bold text-xs flex items-center justify-center mr-2 shrink-0 self-end">AS</div>}
                <div className={`max-w-xs px-3 py-2.5 rounded-2xl text-xs leading-relaxed ${m.from === "lead" ? "bg-white border border-gray-200 text-gray-700 rounded-bl-sm" : "bg-blue-600 text-white rounded-br-sm"}`}>
                  {m.text.split('\n').map((line, j) => <p key={j}>{line}</p>)}
                  <p className={`text-[10px] mt-1 ${m.from === "lead" ? "text-gray-400" : "text-blue-200"}`}>{m.time}</p>
                </div>
              </motion.div>
            ))}

            {/* PDF attachment */}
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} className="flex justify-end">
              <div className="max-w-xs bg-white border border-gray-200 rounded-xl p-3 flex items-center gap-3">
                <div className="w-9 h-9 bg-red-100 rounded-lg flex items-center justify-center"><span className="text-[10px] font-bold text-red-600">PDF</span></div>
                <div className="min-w-0">
                  <p className="text-xs font-semibold text-gray-800 truncate">Brochure_Honda_City_ZX.pdf</p>
                  <p className="text-[11px] text-gray-400">2.4 MB · PDF</p>
                </div>
                <Download size={14} className="text-gray-400 shrink-0 cursor-pointer" />
              </div>
            </motion.div>
          </div>

          <div className="border-t border-gray-200 bg-white px-4 py-2 flex items-center gap-2 text-xs text-gray-400 shrink-0">
            <Lock size={11} /> Read-only mode — You cannot send messages.
          </div>
        </motion.div>

        {/* Lead details */}
        <motion.div
          variants={slideInRight}
          initial="initial"
          animate="animate"
          className="w-64 border-l border-gray-200 bg-white overflow-y-auto shrink-0 p-4 space-y-6"
        >
          <div>
            <p className="text-sm font-bold text-gray-800 mb-3">Lead Details</p>
            {[
              { label: "Lead ID", val: "L-10023" },
              { label: "Phone", val: "+91 98765 43210" },
              { label: "Project", val: "Honda City ZX" },
              { label: "Source", val: "WhatsApp" },
              { label: "Assigned To", val: "Rahul Mehta" },
            ].map(({ label, val }) => (
              <div key={label} className="flex items-center justify-between py-2 border-b border-gray-50">
                <span className="text-[11px] text-gray-400">{label}</span>
                <span className="text-[11px] font-medium text-gray-700">{val}</span>
              </div>
            ))}
            <button className="w-full mt-3 text-xs text-blue-600 border border-blue-200 rounded-lg py-2 hover:bg-blue-50 transition-colors">View Full Lead Profile</button>
          </div>

          <div>
            <p className="text-sm font-bold text-gray-800 mb-3">Conversation Info</p>
            {[
              { label: "Channel", val: "WhatsApp" },
              { label: "Started", val: "12 Apr 2024, 11:02 AM" },
              { label: "Last Message", val: "12 Apr 2024, 11:06 AM" },
              { label: "Total Messages", val: "6" },
              { label: "Status", val: "Active", badge: true },
            ].map(({ label, val, badge }) => (
              <div key={label} className="flex items-center justify-between py-2 border-b border-gray-50">
                <span className="text-[11px] text-gray-400">{label}</span>
                {badge ? <span className="text-[10px] font-bold bg-green-100 text-green-700 px-2 py-0.5 rounded-full">{val}</span> : <span className="text-[11px] font-medium text-gray-700">{val}</span>}
              </div>
            ))}
          </div>

          <div>
            <p className="text-sm font-bold text-gray-800 mb-3">Employee Info</p>
            {[
              { label: "Employee", val: "Rahul Mehta" },
              { label: "Department", val: "Sales" },
              { label: "Role", val: "BD Executive" },
            ].map(({ label, val }) => (
              <div key={label} className="flex items-center justify-between py-2 border-b border-gray-50">
                <span className="text-[11px] text-gray-400">{label}</span>
                <span className="text-[11px] font-medium text-gray-700">{val}</span>
              </div>
            ))}
            <button className="w-full mt-3 text-xs text-blue-600 border border-blue-200 rounded-lg py-2 hover:bg-blue-50 transition-colors">View Employee Profile</button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

// ─── ALERTS / EWS PAGE ───────────────────────────────────────────────────────
function AlertsPage() {
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
  }[s] ?? "");

  const statusColor = (s: string) => ({
    New: "bg-red-100 text-red-700",
    Investigating: "bg-yellow-100 text-yellow-700",
    Monitoring: "bg-blue-100 text-blue-700",
    Resolved: "bg-green-100 text-green-700",
  }[s] ?? "");

  const a = alerts[selectedAlert];

  return (
    <div className="flex-1 flex flex-col min-h-0 bg-gray-50">
      <TopBar />

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
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 px-2.5 py-1 bg-gray-50 text-gray-400 rounded-full text-[10px] font-bold border border-gray-200/50">
                  <div className="w-1.5 h-1.5 rounded-full bg-gray-300 animate-pulse"></div>
                  AI AGENT PLUGIN — EMPTY
                </div>
                <button className="flex items-center gap-1.5 text-xs text-gray-600 border border-gray-200 rounded-lg px-3 py-2 hover:bg-gray-50 transition-colors">
                  <Settings size={12} /> Configure Rules
                </button>
                <button className="flex items-center gap-1.5 text-xs text-gray-600 border border-gray-200 rounded-lg px-3 py-2 hover:bg-gray-50 transition-colors">
                  <Download size={12} /> Export
                </button>
              </div>
            </div>

            <div className="flex gap-1">
              {[
                { label: "All Alerts", count: alerts.length, active: true },
                { label: "High", count: alerts.filter(x => x.severity === "High").length, color: "text-red-600" },
                { label: "Medium", count: alerts.filter(x => x.severity === "Medium").length, color: "text-orange-600" },
                { label: "Low", count: alerts.filter(x => x.severity === "Low").length, color: "text-blue-600" },
                { label: "Resolved", count: alerts.filter(x => x.status === "Resolved").length },
              ].map((t) => (
                <button
                  key={t.label}
                  className={`px-4 py-2 text-xs font-semibold rounded-lg transition-colors ${t.active ? "bg-blue-600 text-white" : "text-gray-500 hover:bg-gray-100"}`}
                >
                  {t.label} {t.count > 0 && <span className={`ml-1 ${t.active ? "text-blue-200" : t.color}`}>{t.count}</span>}
                </button>
              ))}
            </div>
          </div>

          <div className="p-4 flex gap-2 border-b border-gray-100 bg-white">
            {[
              { label: "12 Apr – 19 Apr 2024", icon: Clock },
              { label: "All Types" },
              { label: "All Users" },
              { label: "All Leads / Clients" },
              { label: "All Status" },
            ].map(({ label }, i) => (
              <button key={i} className="flex items-center gap-1.5 text-xs text-gray-600 border border-gray-200 rounded-lg px-3 py-1.5 hover:bg-gray-50 transition-colors">
                {label} <ChevronDown size={12} />
              </button>
            ))}
            <button className="flex items-center gap-1.5 text-xs text-gray-600 border border-gray-200 rounded-lg px-3 py-1.5 hover:bg-gray-50">
              <Filter size={12} /> Filters
            </button>
            <button className="text-xs text-blue-500 hover:underline ml-auto">Reset</button>
          </div>

          <div className="flex-1 overflow-y-auto">
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
                    <td className="px-4 py-3">
                      <button className="text-gray-400 hover:text-gray-600"><MoreHorizontal size={16} /></button>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>

            <div className="flex items-center justify-between p-4 bg-white border-t border-gray-100">
              <p className="text-xs text-gray-400">Showing 1 to 8 of 37 alerts</p>
              <div className="flex items-center gap-1">
                <button className="w-7 h-7 flex items-center justify-center rounded hover:bg-gray-100"><ChevronLeft size={14} /></button>
                {[1,2,3,4,5].map(n => (
                  <button key={n} className={`w-7 h-7 text-xs rounded transition-colors ${n === 1 ? "bg-blue-600 text-white" : "hover:bg-gray-100 text-gray-600"}`}>{n}</button>
                ))}
                <button className="w-7 h-7 flex items-center justify-center rounded hover:bg-gray-100"><ChevronRight size={14} /></button>
              </div>
              <div className="flex items-center gap-2 text-xs text-gray-500">Rows per page: <span className="font-medium">10</span> <ChevronDown size={12} /></div>
            </div>
          </div>

          {/* Alert summary bar */}
          <div className="bg-[#0d1117] px-6 py-3 flex items-center gap-6 text-xs shrink-0">
            <p className="text-gray-400 font-semibold">Alert Summary</p>
            <span className="font-bold text-red-400">12 High</span>
            <span className="font-bold text-orange-400">18 Medium</span>
            <span className="font-bold text-blue-400">7 Low</span>
            <button className="ml-auto text-blue-400 hover:underline">View all alerts →</button>
          </div>
        </div>

        {/* Alert detail panel */}
        <AnimatePresence mode="wait">
          <motion.div
            key={selectedAlert}
            variants={slideInRight}
            initial="initial"
            animate="animate"
            exit="exit"
            className="w-72 border-l border-gray-200 bg-white overflow-y-auto shrink-0"
          >
            <div className="p-4 border-b border-gray-100 flex items-center justify-between">
              <span className={`text-[11px] font-bold px-3 py-1 rounded-full ${a.severity === "High" ? "bg-red-500 text-white" : a.severity === "Medium" ? "bg-orange-500 text-white" : "bg-blue-500 text-white"}`}>
                {a.severity}
              </span>
              <button className="text-gray-400 hover:text-gray-600"><X size={14} /></button>
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
                  <span className="text-[11px] font-medium text-gray-700 text-right max-w-[60%]">{v}</span>
                </div>
              ))}

              <div className="mt-4">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-xs font-bold text-gray-700">Files Downloaded (12)</p>
                  <button className="text-[11px] text-blue-500">View all</button>
                </div>
                {[
                  { name: "Brochure_Honda_City_ZX.pdf", size: "2.4 MB", type: "PDF" },
                  { name: "Variant_Price_List.docx", size: "320 KB", type: "DOC" },
                ].map((f) => (
                  <div key={f.name} className="flex items-center gap-2 py-2">
                    <div className={`w-7 h-7 rounded flex items-center justify-center text-[9px] font-bold ${f.type === "PDF" ? "bg-red-100 text-red-600" : "bg-blue-100 text-blue-600"}`}>{f.type}</div>
                    <div className="min-w-0 flex-1">
                      <p className="text-[11px] font-medium text-gray-800 truncate">{f.name}</p>
                      <p className="text-[10px] text-gray-400">{f.size}</p>
                    </div>
                  </div>
                ))}
                <p className="text-[11px] text-blue-500 cursor-pointer">+10 more files</p>
              </div>

              <div className="mt-4">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-xs font-bold text-gray-700">Actions</p>
                  <span className="text-[11px] text-orange-600 bg-orange-50 px-2 py-0.5 rounded-full flex items-center gap-1">Investigating <ChevronDown size={10} /></span>
                </div>
                <div className="flex gap-2">
                  <button className="flex-1 text-xs border border-gray-200 rounded-lg py-2 hover:bg-gray-50 transition-colors">Add Note</button>
                  <button className="flex-1 text-xs bg-red-600 text-white rounded-lg py-2 hover:bg-red-700 transition-colors">Resolve Alert</button>
                </div>
              </div>

              <div className="mt-4">
                <p className="text-xs font-bold text-gray-700 mb-2">Notes</p>
                <div className="flex gap-2">
                  <div className="w-6 h-6 rounded-full bg-blue-600 text-white text-[9px] font-bold flex items-center justify-center shrink-0">OM</div>
                  <div className="bg-gray-50 rounded-lg p-2 flex-1">
                    <p className="text-[11px] font-semibold text-gray-700">Owner</p>
                    <p className="text-[11px] text-gray-500">Marked as investigating. Will review audit logs.</p>
                    <p className="text-[10px] text-gray-400 mt-1">19 Apr 2024, 11:30 AM</p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}

// ─── STORAGE PAGE ─────────────────────────────────────────────────────────────
function StoragePage() {
  const [activeTab, setActiveTab] = useState("Cloud Storage");

  const providers = [
    { icon: "🟡", name: "Google Drive", email: "space.motors@space.com", bucket: "Space Motors Drive", used: "620 GB", total: "2 TB", status: "Connected", sync: "19 Apr 2024, 11:05 AM" },
    { icon: "🔵", name: "OneDrive", email: "space.motors@outlook.com", bucket: "Space Motors OneDrive", used: "180 GB", total: "1 TB", status: "Connected", sync: "19 Apr 2024, 10:58 AM" },
    { icon: "🟠", name: "AWS S3", email: "s3://space-motors-bucket", bucket: "space-motors-bucket", used: "410 GB", total: "2 TB", status: "Connected", sync: "19 Apr 2024, 10:45 AM" },
  ];

  return (
    <div className="flex-1 flex flex-col min-h-0 bg-gray-50">
      <TopBar alertCount={8} />

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

// ─── ROOT APP ────────────────────────────────────────────────────────────────
export default function App() {
  const [page, setPage] = useState<Page>("login");

  if (page === "login") return <LoginPage setPage={setPage} />;

  return (
    <div className="flex min-h-screen bg-gray-50 font-sans">
      <Sidebar page={page} setPage={setPage} />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <AnimatePresence mode="wait">
          <motion.div
            key={page}
            initial={{ opacity: 0, x: 15 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -10 }}
            transition={{ duration: 0.25 }}
            className="flex-1 flex flex-col min-h-0"
          >
            {page === "overview" && <OverviewPage setPage={setPage} />}
            {page === "chat" && <ChatOversightPage />}
            {page === "alerts" && <AlertsPage />}
            {page === "storage" && <StoragePage />}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
