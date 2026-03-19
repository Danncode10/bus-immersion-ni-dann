"use client";

import React, { useState } from "react";
import { X, UserPlus, Check } from "lucide-react";
import "./AdminSeatModal.css"; // Reuse styling for consistency

import { Seat } from "./BusSeatingChart";

interface AdminVacantModalProps {
  seat: Seat;
  onClose: () => void;
  onUpdate: (data: any) => void;
}

export default function AdminVacantModal({ seat, onClose, onUpdate }: AdminVacantModalProps) {
  const [passengerName, setPassengerName] = useState("");

  const handleManualAssign = (e: React.FormEvent) => {
    e.preventDefault();
    if (passengerName.trim()) {
      onUpdate({ 
        status: "occupied", 
        passenger_name: passengerName.trim(), 
        requester_names: [] 
      });
      onClose();
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="admin-modal-content vacant-special" onClick={(e) => e.stopPropagation()}>
        <button className="close-btn" onClick={onClose}><X size={20} /></button>
        
        <div className="modal-header admin-header vacant-header">
          <div className="modal-icon icon-vacant-admin">
            <UserPlus size={24} />
          </div>
          <div>
            <h2 className="modal-title">Manual Assignment</h2>
            <p className="modal-sub">Seat #{seat.seatNumber} is currently vacant.</p>
          </div>
        </div>

        <div className="modal-body">
          <div className="admin-section">
            <label className="section-label">Assign Passenger</label>
            <form onSubmit={handleManualAssign} className="manual-form-vertical">
              <div className="input-wrapper">
                <UserPlus size={18} className="input-icon" />
                <input 
                  autoFocus
                  type="text" 
                  placeholder="Enter passenger's full name..." 
                  value={passengerName}
                  onChange={(e) => setPassengerName(e.target.value)}
                  className="modal-input"
                />
              </div>
              <p className="helper-text">This will immediately mark the seat as occupied.</p>
              <button type="submit" className="btn-action approve-full mt-4" disabled={!passengerName.trim()}>
                <Check size={18} /> Confirm Assignment
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
