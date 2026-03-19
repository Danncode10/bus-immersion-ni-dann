"use client";

import React, { useState } from "react";
import { User, X, CheckCircle, Info } from "lucide-react";
import "./SeatModal.css";

interface SeatModalProps {
  type: "request" | "view";
  seatNumber: string | number;
  requesterName?: string;
  onClose: () => void;
  onSubmit?: (name: string) => void;
}

export default function SeatModal({ type, seatNumber, requesterName, onClose, onSubmit }: SeatModalProps) {
  const [name, setName] = useState("");
  const isRequest = type === "request";

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) {
      onSubmit?.(name.trim());
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="close-btn" onClick={onClose}><X size={20} /></button>
        
        <div className="modal-header">
          <div className={`modal-icon ${isRequest ? "icon-request" : "icon-view"}`}>
            {isRequest ? <CheckCircle size={24} /> : <Info size={24} />}
          </div>
          <div>
            <h2 className="modal-title">{isRequest ? "Request This Seat" : "Seat Details"}</h2>
            <p className="modal-sub">Seat #{seatNumber}</p>
          </div>
        </div>

        {isRequest ? (
          <form onSubmit={handleSubmit} className="modal-body">
            <div className="input-group">
              <label htmlFor="requesterName">Full Name</label>
              <div className="input-wrapper">
                <User size={18} className="input-icon" />
                <input 
                  autoFocus
                  id="requesterName"
                  type="text" 
                  placeholder="Enter your name" 
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="modal-input"
                  required
                />
              </div>
            </div>
            <div className="modal-footer">
              <button type="button" className="btn-cancel" onClick={onClose}>Cancel</button>
              <button type="submit" className="btn-submit" disabled={!name.trim()}>Send Request</button>
            </div>
          </form>
        ) : (
          <div className="modal-body">
            <div className="info-card">
              <span className="info-label">Current Requester:</span>
              <span className="info-value">{requesterName || "Loading..."}</span>
            </div>
            <p className="info-note">Admistration will review this request and assign the passenger soon. You can still request other vacant seats.</p>
            <div className="modal-footer">
              <button type="button" className="btn-submit" onClick={onClose}>Close</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
