"use client";

import React, { useState, useEffect, useCallback } from "react";
import "./BusTabs.css";
import BusSeatingChart, { BusRow, Seat } from "./BusSeatingChart";
import { supabase } from "../lib/supabase";

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

  // 1. Fetch Buses on mount
  useEffect(() => {
    async function fetchBuses() {
      const { data, error } = await supabase
        .from("buses")
        .select("*")
        .order("name");
      
      if (!error && data) {
        setBuses(data);
        if (data.length > 0) setActiveId(data[0].id);
      }
      setLoading(false);
    }
    fetchBuses();
  }, []);

  // 2. Fetch Seats for active bus & group into rows
  const fetchSeats = useCallback(async (busId: string) => {
    const { data, error } = await supabase
      .from("seats")
      .select("*")
      .eq("bus_id", busId)
      .order("seat_number");

    if (error || !data) return;

    // Convert flat seats list to our 12-row structure
    const groupedRows: BusRow[] = [];
    const TOTAL_ROWS = 12;

    for (let i = 0; i < TOTAL_ROWS; i++) {
      const baseIdx = i * 4;
      const isLastRow = i === TOTAL_ROWS - 1;

      // Regular seats (map seat_number to position)
      // Note: we assume seat_number is stored as string/int 1..49
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
        leftAisle:  findSeat(baseIdx + 2),
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

      // 3. Realtime Subscription
      const channel = supabase
        .channel(`bus-${activeId}`)
        .on(
          "postgres_changes",
          { event: "*", schema: "public", table: "seats", filter: `bus_id=eq.${activeId}` },
          () => fetchSeats(activeId)
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [activeId, fetchSeats]);

  // 4. Handle Request
  const handleSeatClick = async (seat: Seat) => {
    if (seat.status !== "vacant") return;

    const name = window.prompt("Enter your name to request this seat:");
    if (!name || name.trim() === "") return;

    setIsUpdating(true);
    const { error } = await supabase
      .from("seats")
      .update({
        status: "requested",
        requester_name: name.trim()
      })
      .eq("id", seat.id)
      .eq("status", "vacant"); // Safety check

    if (error) {
      alert("Error requesting seat. It might have been taken already.");
    }
    setIsUpdating(false);
  };

  if (loading) {
    return (
      <div className="page-shell">
        <div className="spinner"></div>
        <p style={{ marginTop: '1rem', color: '#94a3b8' }}>Loading buses...</p>
      </div>
    );
  }

  const activeBus = buses.find(b => b.id === activeId);

  return (
    <div className="page-shell">
      <header className="page-header">
        <p className="page-header-eyebrow">
          <span>🚌</span> Live Bus Immersion
        </p>
        <h1 className="page-header-title">Seat Assignment</h1>
        <p className="page-header-sub">
          Click any <strong>Vacant</strong> seat to submit a request. Admins will finalize assignments.
        </p>
      </header>

      <nav className="tab-bar-card" role="tablist">
        {buses.map((bus, idx) => {
          const isActive = bus.id === activeId;
          return (
            <button
              key={bus.id}
              className={`tab-btn ${isActive ? "tab-btn--active" : ""}`}
              onClick={() => setActiveId(bus.id)}
            >
              <span className="tab-btn-inner">
                <span className="tab-eyebrow">Bus {idx + 1}</span>
                <span className="tab-name">{bus.name}</span>
              </span>
            </button>
          );
        })}
      </nav>

      <section key={activeId} className="tab-panel">
        <BusSeatingChart 
          busName={activeBus?.name} 
          rows={rows} 
          onSeatClick={handleSeatClick}
          isUpdating={isUpdating}
        />
      </section>
    </div>
  );
}
