"use client";

import React from "react";
import { User, X, CheckCircle, ShieldAlert } from "lucide-react";
import "./SeatModal.css"; // We can reuse the main SeatModal CSS

interface ApprovedSeatModalProps {
  seatNumber: string | number;
  passengerName: string;
  onClose: () => void;
}

export default function ApprovedSeatModal({ seatNumber, passengerName, onClose }: ApprovedSeatModalProps) {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="close-btn" onClick={onClose}><X size={20} /></button>
        
        <div className="modal-header">
          {/* We reuse the request icon styling with a green check */}
          <div className="modal-icon" style={{ background: "#dcfce7", color: "#16a34a" }}>
            <CheckCircle size={24} />
          </div>
          <div>
            <h2 className="modal-title">Seat Approved</h2>
            <p className="modal-sub">Seat #{seatNumber} is already taken.</p>
          </div>
        </div>

        <div className="modal-body">
          <label className="section-label">Assigned Passenger</label>
          <div className="request-list-view" style={{ maxHeight: "none", marginBottom: "1rem" }}>
            <div className="requester-item" style={{ background: "#f8fafc", borderColor: "#e2e8f0" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", fontWeight: 700, color: "#0f172a" }}>
                <User size={18} style={{ color: "#16a34a" }} />
                <span>{passengerName}</span>
              </div>
            </div>
          </div>
          
          <div style={{ display: "flex", gap: "0.5rem", alignItems: "flex-start", background: "#fef2f2", color: "#991b1b", padding: "1rem", borderRadius: "12px", fontSize: "0.85rem", lineHeight: "1.4" }}>
            <ShieldAlert size={18} style={{ flexShrink: 0, marginTop: "2px" }} />
            <p style={{ margin: 0 }}>This seat has been finalized. Only an administrator can change or remove this assignment.</p>
          </div>

          <div className="modal-footer" style={{ marginTop: "1.5rem" }}>
            <button type="button" className="btn-cancel" style={{ width: "100%", justifyContent: "center" }} onClick={onClose}>Close</button>
          </div>
        </div>
      </div>
    </div>
  );
}
