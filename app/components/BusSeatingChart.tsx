"use client";

import React from "react";
import "./BusSeatingChart.css";

// ─── Types ───────────────────────────────────────────────────────────────────

export interface Seat {
  id?: string;            // Supabase UUID
  seatNumber: number | string;
  status: "vacant" | "occupied" | "requested";
  passenger_name?: string;  // final assigned name
  requester_name?: string;  // name of person who clicked "Request"
}

export interface BusRow {
  leftWindow?: Seat | null;  // leftmost column
  leftAisle?: Seat | null;   // second column from left
  middleSeat?: Seat | null;  // back-center seat (aisle col) – last row only
  rightAisle?: Seat | null;  // first column right of aisle
  rightWindow?: Seat | null; // rightmost column
}

export interface BusSeatingChartProps {
  busName?: string;
  rows: BusRow[];
  onSeatClick?: (seat: Seat) => void;
  onAdminAction?: (seat: Seat, action: "approve" | "reject" | "remove") => void;
  isAdmin?: boolean;
  isUpdating?: boolean;
}

// ─── Sub-components ──────────────────────────────────────────────────────────

function SeatCell({ 
  seat, 
  onSeatClick,
  onAdminAction,
  isAdmin
}: { 
  seat: Seat | null | undefined;
  onSeatClick?: (seat: Seat) => void;
  onAdminAction?: (seat: Seat, action: "approve" | "reject" | "remove") => void;
  isAdmin?: boolean;
}) {
  if (!seat) {
    return <td className="seat-cell seat-empty" />;
  }

  const isVacant = seat.status === "vacant";
  const isOccupied = seat.status === "occupied";
  const isRequested = seat.status === "requested";

  const displayName = isOccupied 
    ? seat.passenger_name 
    : isRequested 
    ? seat.requester_name 
    : "Vacant";

  const statusClass = `seat-${seat.status}`;

  return (
    <td 
      className={`seat-cell ${statusClass} ${isAdmin ? "admin-cell" : ""}`}
      onClick={() => !isAdmin && isVacant && onSeatClick && onSeatClick(seat)}
    >
      <div className="seat-cell-inner">
        <span className="seat-number">#{seat.seatNumber}</span>
        
        {/* Admin Controls */}
        {isAdmin && (
          <div className="admin-actions">
            {isRequested && (
              <>
                <button 
                  className="admin-btn approve" 
                  onClick={(e) => { e.stopPropagation(); onAdminAction?.(seat, "approve"); }}
                  title="Approve Assignment"
                >✓</button>
                <button 
                  className="admin-btn reject" 
                  onClick={(e) => { e.stopPropagation(); onAdminAction?.(seat, "reject"); }}
                  title="Reject Request"
                >×</button>
              </>
            )}
            {isOccupied && (
              <button 
                className="admin-btn remove" 
                onClick={(e) => { e.stopPropagation(); onAdminAction?.(seat, "remove"); }}
                title="Remove Passenger"
              >🗑</button>
            )}
          </div>
        )}

        <span className={`seat-name ${isVacant ? "vacant-label" : ""} ${isRequested ? "requested-label" : ""}`}>
          {isOccupied && seat.passenger_name}
          {isRequested && (
            <span className="request-stack">
               <span className="request-label-text">Requested by:</span>
               <span className="request-name">{seat.requester_name}</span>
            </span>
          )}
          {isVacant && "Vacant"}
        </span>
        {!isAdmin && isVacant && <div className="click-to-request">Click to Request</div>}
      </div>
    </td>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function BusSeatingChart({
  busName = "Bus",
  rows,
  onSeatClick,
  onAdminAction,
  isAdmin = false,
  isUpdating = false,
}: BusSeatingChartProps) {
  return (
    <div className={`bus-wrapper ${isUpdating ? "is-updating-opacity" : ""}`}>
      {isUpdating && (
        <div className="update-overlay">
          <div className="spinner"></div>
          <span>Syncing with Supabase...</span>
        </div>
      )}
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
                <SeatCell seat={row.leftWindow} onSeatClick={onSeatClick} onAdminAction={onAdminAction} isAdmin={isAdmin} />
                <SeatCell seat={row.leftAisle} onSeatClick={onSeatClick} onAdminAction={onAdminAction} isAdmin={isAdmin} />

                {/* Aisle column:
                    – back row: render the centre seat
                    – middle row: show vertical AISLE label
                    – all others: empty aisle gap               */}
                {row.middleSeat ? (
                  <SeatCell seat={row.middleSeat} onSeatClick={onSeatClick} onAdminAction={onAdminAction} isAdmin={isAdmin} />
                ) : idx === Math.floor(rows.length / 2) ? (
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

                <SeatCell seat={row.rightAisle} onSeatClick={onSeatClick} onAdminAction={onAdminAction} isAdmin={isAdmin} />
                <SeatCell seat={row.rightWindow} onSeatClick={onSeatClick} onAdminAction={onAdminAction} isAdmin={isAdmin} />
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
