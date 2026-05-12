"use client"
import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import LeadsTable from "@/components/dashboard/LeadsTable";
import LeadDetailModal from "@/components/dashboard/LeadDetailModal";
import AddLeadModal from "@/components/dashboard/AddLeadModal";
import { Plus, Search, Filter, Download } from "lucide-react";
import { useAuth } from "@/components/auth/AuthContext";
import * as XLSX from "xlsx";

export default function LeadsPage() {
  const [selectedLeadId, setSelectedLeadId] = useState<string | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const [leadIds, setLeadIds] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [stageFilter, setStageFilter] = useState("All Stages");
  const [ownerFilter, setOwnerFilter] = useState("All Owners");
  const [team, setTeam] = useState<any[]>([]);
  const [initialModalTab, setInitialModalTab] = useState<string | null>(null);
  const { user } = useAuth();
  const searchParams = useSearchParams();

  useEffect(() => {
    const leadId = searchParams.get("id");
    if (leadId) setSelectedLeadId(leadId);
  }, [searchParams]);

  useEffect(() => {
    fetch("/api/team")
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) setTeam(data);
      })
      .catch(err => console.error("Failed to fetch team:", err));
  }, []);

  const switchLead = (dir: "next" | "prev") => {
    if (!selectedLeadId || leadIds.length === 0) return;
    const currentIndex = leadIds.indexOf(selectedLeadId);
    let newIndex = dir === "next" ? currentIndex + 1 : currentIndex - 1;
    if (newIndex < 0) newIndex = leadIds.length - 1;
    if (newIndex >= leadIds.length) newIndex = 0;
    setSelectedLeadId(leadIds[newIndex]);
  };

  // Only CEO and Manager can add leads based on previous instructions, 
  // but let's check if the user is authorized.
  const canAddLead = user?.role === "CEO" || user?.role === "MANAGER" || user?.role === "ORG_ADMIN";

  const handleExportCSV = async () => {
    try {
      const res = await fetch("/api/leads");
      const leads = await res.json();
      if (!Array.isArray(leads)) return;

      const worksheetData = leads.map((lead: any) => ({
        "Contact Name": lead.contactName,
        "Company": lead.company,
        "Stage": lead.stage,
        "Phone": lead.phone || "",
        "Email": lead.email || "",
        "Deal Value (INR)": lead.dealValueInr,
        "Priority": lead.priority,
        "Owner": lead.owner?.name || "",
        "Created At": new Date(lead.createdAt).toLocaleDateString("en-IN")
      }));

      const worksheet = XLSX.utils.json_to_sheet(worksheetData);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Leads");
      XLSX.writeFile(workbook, "Leads_Pipeline.csv", { bookType: "csv" });
    } catch (e) {
      console.error("Export failed", e);
    }
  };

  const handleLeadClick = (id: string, allIds?: string[]) => {
    setInitialModalTab(null);
    setSelectedLeadId(id);
    if (allIds) setLeadIds(allIds);
  };

  const handleChatClick = (id: string, allIds?: string[]) => {
    setInitialModalTab("chat");
    setSelectedLeadId(id);
    if (allIds) setLeadIds(allIds);
  };

  return (
    <div className="p-4 sm:p-6 space-y-6 max-w-[1600px] mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">New Leads Pipeline</h1>
          <p className="text-slate-500 text-sm">Review and qualify incoming sales opportunities</p>
        </div>
        
        <div className="flex items-center gap-2">
          <button 
            onClick={handleExportCSV}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors"
          >
            <Download size={16} />
            Export CSV
          </button>
          
          {canAddLead && (
            <button 
              onClick={() => setShowAddModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700 transition-all shadow-md shadow-blue-500/20"
            >
              <Plus size={18} />
              Add Lead
            </button>
          )}
        </div>
      </div>

      {/* Advanced Filters Bar */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
        <div className="relative col-span-1 md:col-span-2">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
          <input 
            type="text" 
            placeholder="Search leads by name, email, or company..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all"
          />
        </div>
        <select 
          value={stageFilter}
          onChange={(e) => setStageFilter(e.target.value)}
          className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
        >
          <option>All Stages</option>
          <option value="NEW">New</option>
          <option value="CONTACTED">Contacted</option>
          <option value="CHATTING">Cold Chatting</option>
          <option value="MEETING_SET">Meeting Set</option>
          <option value="NEGOTIATION">Negotiation</option>
          <option value="WON">Closed Won</option>
          <option value="CUSTOMER">Customer</option>
          <option value="NOT_INTERESTED">Not Interested</option>
        </select>
        <select 
          value={ownerFilter}
          onChange={(e) => setOwnerFilter(e.target.value)}
          className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
        >
          <option>All Owners</option>
          {team.map(member => (
            <option key={member.id} value={member.id}>{member.name}</option>
          ))}
        </select>
      </div>

      <LeadsTable 
        refreshKey={refreshKey} 
        onLeadClick={handleLeadClick} 
        onChatClick={handleChatClick}
        activeNav="Leads"
        externalSearchQuery={searchQuery}
        externalStageFilter={stageFilter === "All Stages" ? null : stageFilter}
        externalOwnerFilter={ownerFilter === "All Owners" ? null : ownerFilter}
      />

      {selectedLeadId && (
        <LeadDetailModal 
          leadId={selectedLeadId} 
          initialTab={initialModalTab}
          onClose={() => {
            setSelectedLeadId(null);
            setInitialModalTab(null);
          }} 
          onUpdate={() => setRefreshKey(prev => prev + 1)}
          onSwitch={switchLead}
        />
      )}

      {showAddModal && (
        <AddLeadModal 
          isOpen={showAddModal} 
          onClose={() => setShowAddModal(false)} 
          onSuccess={() => setRefreshKey(prev => prev + 1)}
        />
      )}
    </div>
  );
}
