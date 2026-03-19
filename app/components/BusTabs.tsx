"use client";

import React, { useState } from "react";
import "./BusTabs.css";
import BusSeatingChart from "./BusSeatingChart";
import { BUSES } from "../lib/busData";

/**
 * BusTabs
 * Renders a tab bar where each tab corresponds to one bus.
 * Active tab is highlighted; switching tabs fades in the new panel.
 */
export default function BusTabs() {
  const [activeId, setActiveId] = useState<string>(BUSES[0].id);

  const activeBus = BUSES.find((b) => b.id === activeId)!;

  return (
    <div className="page-shell">
      {/* ── Header ── */}
      <header className="page-header">
        <p className="page-header-eyebrow">
          <span>🚌</span> Bus Immersion Program
        </p>
        <h1 className="page-header-title">Seat Assignment Chart</h1>
        <p className="page-header-sub">
          Select a bus below to view its seating arrangement
        </p>
      </header>

      {/* ── Tab bar ── */}
      <nav className="tab-bar-card" role="tablist" aria-label="Bus selector">
        {BUSES.map((bus, idx) => {
          const isActive = bus.id === activeId;
          return (
            <button
              key={bus.id}
              id={`tab-${bus.id}`}
              role="tab"
              aria-selected={isActive}
              aria-controls={`panel-${bus.id}`}
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

      {/* ── Active panel ── */}
      <section
        key={activeId}      /* force remount → re-triggers CSS animation */
        id={`panel-${activeId}`}
        role="tabpanel"
        aria-labelledby={`tab-${activeId}`}
        className="tab-panel"
      >
        <BusSeatingChart busName={activeBus.name} rows={activeBus.rows} />
      </section>
    </div>
  );
}
