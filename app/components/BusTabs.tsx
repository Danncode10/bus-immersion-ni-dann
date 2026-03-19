"use client";

import React, { useState, useEffect, useCallback } from "react";
import "./BusTabs.css";
import BusSeatingChart, { BusRow, Seat } from "./BusSeatingChart";
import { supabase } from "../lib/supabase";
import { Session } from "@supabase/supabase-js";

interface Bus {
  id: string;
  name: string;
}

export default function BusTabs() {
  const [buses, setBuses] = useState<Bus[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [rows, setRows] = useState<BusRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [session, setSession] = useState<Session | null>(null);

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
  const fetchSeats = useCallback(async (busId: string) => {
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
          requester_name: s.requester_name
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
    setRows(groupedRows);
  }, []);

  useEffect(() => {
    if (activeId) {
      fetchSeats(activeId);
      const channel = supabase.channel(`bus-${activeId}`)
        .on("postgres_changes", { event: "*", schema: "public", table: "seats", filter: `bus_id=eq.${activeId}` }, () => fetchSeats(activeId))
        .subscribe();
      return () => { supabase.removeChannel(channel); };
    }
  }, [activeId, fetchSeats]);

  // 3. User Actions
  const handleSeatClick = async (seat: Seat) => {
    if (seat.status !== "vacant" || session) return; // session check: admins don't "request" via prompt
    const name = window.prompt("Enter your name to request this seat:");
    if (!name?.trim()) return;
    setIsUpdating(true);
    await supabase.from("seats").update({ status: "requested", requester_name: name.trim() }).eq("id", seat.id).eq("status", "vacant");
    setIsUpdating(false);
  };

  // 4. Admin Actions
  const handleAdminAction = async (seat: Seat, action: "approve" | "reject" | "remove") => {
    setIsUpdating(true);
    let updateData = {};
    if (action === "approve") updateData = { status: "occupied", passenger_name: seat.requester_name, requester_name: null };
    else if (action === "reject") updateData = { status: "vacant", requester_name: null };
    else if (action === "remove") updateData = { status: "vacant", passenger_name: null };
    
    await supabase.from("seats").update(updateData).eq("id", seat.id);
    setIsUpdating(false);
  };

  const handleLogin = async () => {
    const email = window.prompt("Admin Email:");
    const password = window.prompt("Admin Password:");
    if (email && password) {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) alert("Login failed: " + error.message);
    }
  };

  const handleLogout = () => supabase.auth.signOut();

  if (loading) return <div className="page-shell"><div className="spinner"></div><p>Wait a moment...</p></div>;

  const activeBus = buses.find(b => b.id === activeId);

  return (
    <div className="page-shell">
      <div className="admin-status-bar">
        {session ? (
          <div className="admin-chip">
            <span className="dot active"></span> Admin Mode: {session.user.email}
            <button onClick={handleLogout} className="logout-link">Logout</button>
          </div>
        ) : (
          <button onClick={handleLogin} className="login-trigger">Admin Login</button>
        )}
      </div>

      <header className="page-header">
        <p className="page-header-eyebrow"><span>🚌</span> Immersion Bus Lines</p>
        <h1 className="page-header-title">Seat Reservation</h1>
        <p className="page-header-sub">
          {session ? "You are in management mode. Approve or reject seat requests live." : "Select your seat for the immersion trip."}
        </p>
      </header>

      <nav className="tab-bar-card">
        {buses.map((bus, idx) => (
          <button key={bus.id} className={`tab-btn ${bus.id === activeId ? "tab-btn--active" : ""}`} onClick={() => setActiveId(bus.id)}>
            <span className="tab-btn-inner">
              <span className="tab-eyebrow">Bus {idx + 1}</span>
              <span className="tab-name">{bus.name}</span>
            </span>
          </button>
        ))}
      </nav>

      <section key={activeId} className="tab-panel">
        <BusSeatingChart 
          busName={activeBus?.name} 
          rows={rows} 
          onSeatClick={handleSeatClick}
          onAdminAction={handleAdminAction}
          isAdmin={!!session}
          isUpdating={isUpdating}
        />
      </section>
    </div>
  );
}
