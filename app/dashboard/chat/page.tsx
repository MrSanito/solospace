"use client"
import { useState } from "react";
import ChatOversightPage from "@/components/dashboard/admin/ChatOversightPage";
import ChatAssignedLead from "@/components/dashboard/admin/ChatAssignedLead";

export default function Page() {
  const [selectedThreadId, setSelectedThreadId] = useState<string | null>(null);

  if (selectedThreadId) {
    return <ChatOversightPage 
      initialThreadId={selectedThreadId} 
      onBack={() => setSelectedThreadId(null)} 
    />;
  }

  return <ChatAssignedLead onSelect={(id) => setSelectedThreadId(id)} />;
}
