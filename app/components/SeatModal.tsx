"use client";

import React, { useState } from "react";
import { User, X, CheckCircle, Info } from "lucide-react";
import "./SeatModal.css";

interface SeatModalProps {
  type: "request" | "view";
  seatNumber: string | number;
  requesterNames?: string[];
  onClose: () => void;
  onSubmit?: (name: string) => void;
}

export default function SeatModal({ type: initialType, seatNumber, requesterNames, onClose, onSubmit }: SeatModalProps) {
  const [type, setType] = useState<"request" | "view">(initialType);
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
            <label className="section-label">Requester List ({requesterNames?.length || 0})</label>
            <div className="request-list-view">
              {requesterNames && requesterNames.length > 0 ? (
                requesterNames.map((n, idx) => (
                  <div key={idx} className="requester-item">
                    <User size={16} />
                    <span>{n}</span>
                  </div>
                ))
              ) : (
                <p className="no-requesters">No requests yet.</p>
              )}
            </div>
            <p className="info-note">Admistration will review these requests and assign the final passenger. You can still add your name to the request list below.</p>
            <div className="modal-footer">
              <button type="button" className="btn-cancel" onClick={onClose}>Close</button>
              <button type="button" className="btn-submit" onClick={() => setType("request")}>I want this seat too</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
