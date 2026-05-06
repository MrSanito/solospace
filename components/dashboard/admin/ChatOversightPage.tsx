import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  Bell,
  Filter,
  ChevronLeft,
  ChevronRight,
  FileText,
  MoreHorizontal,
  Lock,
  Download,
  Eye,
} from "lucide-react";

const slideInRight = {
  initial: { opacity: 0, x: 40 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: 40 },
};

export default function ChatOversightPage() {
  const [selected, setSelected] = useState(0);

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
    <div className="flex flex-1 min-h-0 bg-gray-50">
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
              {["All (128)", "Employees", "Leads"].map((t, i) => (
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
                <div className="min-w-0 flex-1">
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
