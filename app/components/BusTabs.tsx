"use client";

import React, { useState, useEffect, useCallback } from "react";
import "./BusTabs.css";
import BusSeatingChart, { BusRow, Seat } from "./BusSeatingChart";
import SeatModal from "./SeatModal";
import AdminSeatModal from "./AdminSeatModal";
import AdminVacantModal from "./AdminVacantModal";
import AdminRenameModal from "./AdminRenameModal";
import { supabase } from "../lib/supabase";
import { Session } from "@supabase/supabase-js";
import { ShieldCheck, RefreshCw, Github, Pencil } from "lucide-react";
import Link from "next/link";

interface Bus {
  id: string;
  name: string;
}

export default function BusTabs() {
  const [buses, setBuses] = useState<Bus[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [rows, setRows] = useState<BusRow[]>([]);
  const [cachedRows, setCachedRows] = useState<Record<string, BusRow[]>>({});
  const [loading, setLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [session, setSession] = useState<Session | null>(null);

  // User Modal State
  const [modalSeat, setModalSeat] = useState<Seat | null>(null);
  const [modalType, setModalType] = useState<"request" | "view" | null>(null);

  // Admin Modal State
  const [adminModalSeat, setAdminModalSeat] = useState<Seat | null>(null);
  const [showRenameModal, setShowRenameModal] = useState(false);

  // 1. Auth & Buses Fetch
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    async function fetchBuses() {
      const { data, error } = await supabase.from("buses").select("*").order("name");
      if (!error && data) {
        setBuses(data);
        if (data.length > 0) setActiveId(data[0].id);
      }
      setLoading(false);
    }

    fetchBuses();
    return () => subscription.unsubscribe();
  }, []);

  // 2. Fetch Seats
  const fetchSeats = useCallback(async (busId: string, skipCache = false) => {
    // 1. Check Cache first for instant feedback
    if (!skipCache && cachedRows[busId]) {
      setRows(cachedRows[busId]);
    }

    const { data, error } = await supabase
      .from("seats")
      .select("*")
      .eq("bus_id", busId)
      .order("seat_number");

    if (error || !data) return;

    const groupedRows: BusRow[] = [];
    const TOTAL_ROWS = 12;

    for (let i = 0; i < TOTAL_ROWS; i++) {
      const baseIdx = i * 4;
      const isLastRow = i === TOTAL_ROWS - 1;
      const findSeat = (num: number) => {
        const s = data.find(item => Number(item.seat_number) === num);
        if (!s) return null;
        return {
          id: s.id,
          seatNumber: s.seat_number,
          status: s.status,
          passenger_name: s.passenger_name,
          requester_names: s.requester_names || []
        } as Seat;
      };
      groupedRows.push({
        leftWindow: findSeat(baseIdx + 1),
        leftAisle: findSeat(baseIdx + 2),
        middleSeat: isLastRow ? findSeat(baseIdx + 3) : null,
        rightAisle: isLastRow ? findSeat(baseIdx + 4) : findSeat(baseIdx + 3),
        rightWindow: isLastRow ? findSeat(baseIdx + 5) : findSeat(baseIdx + 4),
      });
    }

    // 2. Update both state and cache
    setRows(groupedRows);
    setCachedRows(prev => ({ ...prev, [busId]: groupedRows }));
  }, [cachedRows]);

  useEffect(() => {
    if (activeId) {
      // Background revalidate
      fetchSeats(activeId);
      const channel = supabase.channel(`bus-${activeId}`)
        .on("postgres_changes", { event: "*", schema: "public", table: "seats", filter: `bus_id=eq.${activeId}` }, () => fetchSeats(activeId, true))
        .subscribe();
      return () => { supabase.removeChannel(channel); };
    }
  }, [activeId, fetchSeats]);

  // 3. User Actions
  const handleSeatClick = (seat: Seat) => {
    if (session) return; 
    setModalSeat(seat);
    // If vacant, direct request. If requested, view list first but can also request.
    setModalType(seat.status === "vacant" ? "request" : "view");
  };

  const handleModalSubmit = async (name: string) => {
    if (!modalSeat) return;
    setIsUpdating(true);
    
    // 1. Re-check the actual latest count from the current state (rows) to prevent race conditions
    let latestSeat: Seat | null = null;
    for (const row of rows) {
      if (row.leftWindow?.id === modalSeat.id) latestSeat = row.leftWindow || null;
      else if (row.leftAisle?.id === modalSeat.id) latestSeat = row.leftAisle || null;
      else if (row.middleSeat?.id === modalSeat.id) latestSeat = row.middleSeat || null;
      else if (row.rightAisle?.id === modalSeat.id) latestSeat = row.rightAisle || null;
      else if (row.rightWindow?.id === modalSeat.id) latestSeat = row.rightWindow || null;
      if (latestSeat) break;
    }

    const currentNames = latestSeat?.requester_names || [];
    
    // 2. Limit Check: Strictly 10 maximum
    if (currentNames.length >= 10) {
      alert("O ano? di ka na maka spam no?");
      setIsUpdating(false);
      return;
    }

    // 3. Duplicate Check
    if (currentNames.includes(name)) {
      alert("You have already requested this seat.");
      setIsUpdating(false);
      return;
    }
    
    // 4. Name length check
    const cleanName = name.trim().slice(0, 30);
    const updatedNames = [...currentNames, cleanName];

    const { error } = await supabase.from("seats")
      .update({ 
        status: "requested", 
        requester_names: updatedNames
      })
      .eq("id", modalSeat.id);

    if (error) {
      alert("Request failed: " + error.message);
    } else {
      // Immediate auto-refresh
      if (activeId) fetchSeats(activeId, true);
    }

    setModalSeat(null);
    setModalType(null);
    setIsUpdating(false);
  };

  // 4. Admin Actions
  const handleAdminEdit = (seat: Seat) => {
    setAdminModalSeat(seat);
  };

  const handleAdminUpdate = async (updateData: any) => {
    if (!adminModalSeat) return;
    setIsUpdating(true);
    
    const { error } = await supabase.from("seats")
      .update(updateData)
      .eq("id", adminModalSeat.id);
    
    if (error) {
      alert("Failed to update seat: " + error.message);
    } else {
      if (activeId) fetchSeats(activeId, true);
      // Sync the modal state with updated data to prevent stale-state overwrites
      setAdminModalSeat(prev => prev ? { ...prev, ...updateData } : null);
    }
    
    setIsUpdating(false);
  };

  const handleRenameBus = () => {
    setShowRenameModal(true);
  };

  const executeRenameBus = async (newName: string) => {
    if (!activeId) return;
    setIsUpdating(true);
    const { error } = await supabase.from("buses").update({ name: newName }).eq("id", activeId);
    
    if (error) {
      alert("Failed to rename bus: " + error.message);
    } else {
      setBuses(buses.map(b => b.id === activeId ? { ...b, name: newName } : b));
    }
    setIsUpdating(false);
    setShowRenameModal(false);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.reload(); 
  };

  if (loading) return <div className="page-shell"><div className="spinner"></div><p>Wait a moment...</p></div>;

  const activeBus = buses.find(b => b.id === activeId);

  return (
    <div className="page-shell">
      <div className="admin-status-bar">
        {session ? (
          <div className="admin-chip">
            <span className="dot active"></span>
            Management Mode: {session.user.email}
            <button onClick={handleLogout} className="logout-link">Sign Out</button>
          </div>
        ) : (
          <Link href="/login" className="login-pill">
            <ShieldCheck className="w-3.5 h-3.5" />
            Admin Portal
          </Link>
        )}
      </div>

      <header className="page-header">
        <p className="page-header-eyebrow"><span>🚌</span> Immersion Bus Lines</p>
        <h1 className="page-header-title">Seat Reservation</h1>
        <p className="page-header-sub">
          {session ? "You are in management mode. Click any seat to edit details." : "Select your seat for the immersion trip."}
        </p>
      </header>

      <nav className="tab-bar-card">
        {buses
          .sort((a, b) => {
            const order = ["BSIT 3C", "BSIT 3B and BSCS", "BSIT 3D and BSIS"];
            const idxA = order.indexOf(a.name);
            const idxB = order.indexOf(b.name);
            
            // If the database names haven't been updated yet, sort by default name
            if (idxA === -1 || idxB === -1) return a.name.localeCompare(b.name);
            return idxA - idxB;
          })
          .map((bus, idx) => (
          <button key={bus.id} className={`tab-btn ${bus.id === activeId ? "tab-btn--active" : ""}`} onClick={() => setActiveId(bus.id)}>
            <span className="tab-btn-inner">
              <span className="tab-eyebrow">Bus {idx + 1}</span>
              <span className="tab-name">{bus.name}</span>
            </span>
          </button>
        ))}
      </nav>

      <div style={{ display: "flex", gap: "0.5rem", justifyContent: "center", marginBottom: "1.5rem" }}>
        <button 
          className="refresh-btn" 
          onClick={() => activeId && fetchSeats(activeId)}
          title="Manual Refresh"
          disabled={!activeId || isUpdating}
        >
          <RefreshCw size={14} className={isUpdating ? "animate-spin" : ""} />
          <span>Sync {activeBus?.name} Latest Data</span>
        </button>

        {session && (
          <button 
            className="refresh-btn" 
            onClick={handleRenameBus}
            disabled={!activeId || isUpdating}
          >
            <Pencil size={14} />
            <span>Rename {activeBus?.name}</span>
          </button>
        )}
      </div>

      <section key={activeId} className="tab-panel">
        <BusSeatingChart 
          busName={activeBus?.name} 
          rows={rows} 
          onSeatClick={handleSeatClick}
          onAdminEdit={handleAdminEdit}
          isAdmin={!!session}
          isUpdating={isUpdating}
        />
      </section>

      {/* Modern Modal System (User) */}
      {modalSeat && modalType && (
        <SeatModal 
          type={modalType}
          seatNumber={modalSeat.seatNumber}
          requesterNames={modalSeat.requester_names}
          onClose={() => { setModalSeat(null); setModalType(null); }}
          onSubmit={handleModalSubmit}
        />
      )}

      {/* Unified Management System (Admin) */}
      {adminModalSeat && (
        adminModalSeat.status === "vacant" ? (
          <AdminVacantModal 
            seat={adminModalSeat}
            onClose={() => setAdminModalSeat(null)}
            onUpdate={handleAdminUpdate}
          />
        ) : (
          <AdminSeatModal 
            seat={adminModalSeat}
            onClose={() => setAdminModalSeat(null)}
            onUpdate={handleAdminUpdate}
          />
        )
      )}

      {/* Admin Rename Modal */}
      {showRenameModal && activeBus && (
        <AdminRenameModal 
          currentName={activeBus.name}
          onClose={() => setShowRenameModal(false)}
          onUpdate={executeRenameBus}
        />
      )}

      <footer className="page-footer">
        <span className="footer-text">build by</span>
        <a 
          href="https://github.com/Danncode10" 
          target="_blank" 
          rel="noopener noreferrer"
          className="footer-link"
        >
          <Github size={14} />
          <span>@dann.builds</span>
        </a>
      </footer>
    </div>
  );
}
