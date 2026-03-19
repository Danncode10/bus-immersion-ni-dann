"use client";

import React, { useState, useEffect } from "react";
import { X, UserPlus, Trash2, CheckCircle, Edit3, User } from "lucide-react";
import "./AdminSeatModal.css";

interface AdminSeatModalProps {
  seat: {
    id: string;
    seatNumber: string | number;
    status: "vacant" | "occupied" | "requested";
    passenger_name?: string;
    requester_name?: string;
  };
  onClose: () => void;
  onUpdate: (data: any) => void;
}

export default function AdminSeatModal({ seat, onClose, onUpdate }: AdminSeatModalProps) {
  const [passengerName, setPassengerName] = useState(seat.passenger_name || "");
  const [isBusy, setIsBusy] = useState(false);

  useEffect(() => {
    setPassengerName(seat.passenger_name || "");
  }, [seat]);

  const handleApprove = () => {
    onUpdate({ 
      status: "occupied", 
      passenger_name: seat.requester_name, 
      requester_name: null 
    });
    onClose();
  };

  const handleVacate = () => {
    if (window.confirm("Are you sure you want to make this seat vacant?")) {
      onUpdate({ status: "vacant", passenger_name: null, requester_name: null });
      onClose();
    }
  };

  const handleManualAssign = (e: React.FormEvent) => {
    e.preventDefault();
    if (passengerName.trim()) {
      onUpdate({ status: "occupied", passenger_name: passengerName.trim(), requester_name: null });
      onClose();
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="admin-modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="close-btn" onClick={onClose}><X size={20} /></button>
        
        <div className="modal-header admin-header">
          <div className="modal-icon icon-admin">
            <Edit3 size={24} />
          </div>
          <div>
            <h2 className="modal-title">Manage Seat #{seat.seatNumber}</h2>
            <p className="modal-sub">Current Status: <span className={`status-pill status-${seat.status}`}>{seat.status}</span></p>
          </div>
        </div>

        <div className="modal-body">
          {/* Section 1: Request Pending */}
          {seat.status === "requested" && (
            <div className="admin-section">
               <label className="section-label">Pending Request</label>
               <div className="request-info-box">
                  <User size={18} />
                  <span>Requested by: <strong>{seat.requester_name}</strong></span>
               </div>
               <button className="btn-action approve-full" onClick={handleApprove}>
                  <CheckCircle size={18} /> Approve This Request
               </button>
            </div>
          )}

          {/* Section 2: Edit / Manual Assign */}
          <div className="admin-section">
            <label className="section-label">{seat.status === "occupied" ? "Edit Passenger" : "Manual Assignment"}</label>
            <form onSubmit={handleManualAssign} className="manual-form">
              <div className="input-wrapper">
                <UserPlus size={18} className="input-icon" />
                <input 
                  type="text" 
                  placeholder="Type passenger name..." 
                  value={passengerName}
                  onChange={(e) => setPassengerName(e.target.value)}
                  className="modal-input"
                />
              </div>
              <button type="submit" className="btn-save" disabled={!passengerName.trim()}>
                {seat.status === "occupied" ? "Update Name" : "Assign Now"}
              </button>
            </form>
          </div>

          {/* Section 3: Dangerous Actions */}
          {seat.status !== "vacant" && (
            <div className="admin-section mt-auto">
              <button className="btn-danger-outline" onClick={handleVacate}>
                <Trash2 size={16} /> Make Seat Vacant
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
