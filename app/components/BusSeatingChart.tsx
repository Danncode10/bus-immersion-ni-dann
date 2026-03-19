"use client";

import React from "react";
import "./BusSeatingChart.css";

// ─── Types ───────────────────────────────────────────────────────────────────

export interface Seat {
  seatNumber: number | string;
  passenger?: string; // if blank/undefined → "Vacant"
}

export interface BusRow {
  leftWindow?: Seat | null; // leftmost column
  leftAisle?: Seat | null; // second column from left
  rightAisle?: Seat | null; // first column right of aisle
  rightWindow?: Seat | null; // rightmost column
}

export interface BusSeatingChartProps {
  busName?: string;
  rows: BusRow[];
}

// ─── Sub-components ──────────────────────────────────────────────────────────

function SeatCell({ seat }: { seat: Seat | null | undefined }) {
  if (!seat) {
    return <td className="seat-cell seat-empty" />;
  }

  const isVacant = !seat.passenger || seat.passenger.trim() === "";

  return (
    <td className={`seat-cell ${isVacant ? "seat-vacant" : "seat-occupied"}`}>
      <span className="seat-number">#{seat.seatNumber}</span>
      <span className={`seat-name ${isVacant ? "vacant-label" : ""}`}>
        {isVacant ? "Vacant" : seat.passenger}
      </span>
    </td>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function BusSeatingChart({
  busName = "Bus",
  rows,
}: BusSeatingChartProps) {
  return (
    <div className="bus-wrapper">
      <div className="bus-container">
        {/* Bus title */}
        <div className="bus-title">
          <span className="bus-label">Bus:</span> {busName}
        </div>

        <table className="bus-table">
          <colgroup>
            <col className="col-left-window" />
            <col className="col-left-aisle" />
            <col className="col-aisle" />
            <col className="col-right-aisle" />
            <col className="col-right-window" />
          </colgroup>

          <tbody>
            {/* ── Front section: Driver + Entrance ── */}
            <tr className="front-row">
              {/* Driver's seat spans 2 left cols */}
              <td colSpan={2} className="special-cell driver-seat">
                <span className="special-label">Driver&apos;s Seat</span>
              </td>

              {/* Aisle gap */}
              <td rowSpan={2} className="aisle-cell">
                {/* empty aisle */}
              </td>

              {/* Entrance / Exit spans right 2 cols */}
              <td colSpan={2} className="special-cell entrance-cell">
                <span className="special-label">Entrance / Exit</span>
              </td>
            </tr>

            {/* ── Tour Guide row ── */}
            <tr className="front-row">
              <td colSpan={2} className="special-cell empty-front" />
              {/* aisle already rowSpanned */}
              <td colSpan={2} className="special-cell tour-guide-cell">
                <span className="special-label">Tour Guide Seat</span>
              </td>
            </tr>

            {/* ── Passenger rows ── */}
            {rows.map((row, idx) => (
              <tr key={idx} className="passenger-row">
                <SeatCell seat={row.leftWindow} />
                <SeatCell seat={row.leftAisle} />

                {/* Aisle column – only label on the middle row */}
                {idx === Math.floor(rows.length / 2) ? (
                  <td className="aisle-cell aisle-label-cell">
                    <div className="aisle-text">
                      {"AISLE".split("").map((ch, i) => (
                        <span key={i}>{ch}</span>
                      ))}
                    </div>
                  </td>
                ) : (
                  <td className="aisle-cell" />
                )}

                <SeatCell seat={row.rightAisle} />
                <SeatCell seat={row.rightWindow} />
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
