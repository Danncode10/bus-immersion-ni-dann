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
    requester_names?: string[];
  };
  onClose: () => void;
  onUpdate: (data: any) => void;
}

export default function AdminSeatModal({ seat, onClose, onUpdate }: AdminSeatModalProps) {
  const [passengerName, setPassengerName] = useState(seat.passenger_name || "");
  const [isBusy, setIsBusy] = useState(false);
  const [showRequests, setShowRequests] = useState(false);
  const [showConfirmVacate, setShowConfirmVacate] = useState(false);

  useEffect(() => {
    setPassengerName(seat.passenger_name || "");
  }, [seat]);

  const handleApprove = (name: string) => {
    onUpdate({ 
      status: "occupied", 
      passenger_name: name, 
      requester_names: []
    });
    onClose();
  };

  const handleRemoveRequest = (nameToRemove: string) => {
    const updatedNames = (seat.requester_names || []).filter(n => n !== nameToRemove);
    if (updatedNames.length === 0) {
      onUpdate({ status: "vacant", requester_names: [] });
      onClose();
    } else {
      onUpdate({ 
        requester_names: updatedNames
      });
    }
  };

  const handleVacateConfirm = () => {
    onUpdate({ status: "vacant", passenger_name: null, requester_names: [] });
    onClose();
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
               <label className="section-label">Pending Requests</label>
               
               {!showRequests ? (
                  <button className="btn-view-requests" onClick={() => setShowRequests(true)}>
                    <span>View Name Requests</span>
                    <span className="count-tag">{seat.requester_names?.length || 0}</span>
                  </button>
               ) : (
                  <div className="admin-request-list">
                    {seat.requester_names?.map((name, idx) => (
                      <div key={idx} className="admin-request-item">
                        <div className="admin-request-info">
                          <User size={16} />
                          <span>{name}</span>
                        </div>
                        <div className="admin-request-actions">
                          <button 
                            className="btn-mini-action approve" 
                            title="Approve"
                            onClick={() => handleApprove(name)}
                          >
                            <CheckCircle size={16} />
                          </button>
                          <button 
                            className="btn-mini-action remove" 
                            title="Remove"
                            onClick={() => handleRemoveRequest(name)}
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>
                    ))}
                    <button className="btn-save mt-2" onClick={() => setShowRequests(false)}>Hide List</button>
                  </div>
               )}
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
                {seat.status === "occupied" ? "Update Name" : "Assign Directly"}
              </button>
            </form>
          </div>

          {/* Section 3: Dangerous Actions */}
          {seat.status !== "vacant" && !showConfirmVacate && (
            <div className="admin-section mt-auto">
              <button className="btn-danger-outline" onClick={() => setShowConfirmVacate(true)}>
                <Trash2 size={16} /> Make Seat Vacant
              </button>
            </div>
          )}

          {/* Confirm Vacate Overlay logic (inline inside the same modal body) */}
          {showConfirmVacate && (
             <div className="confirm-delete-overlay">
                <div className="confirm-icon-box">
                   <Trash2 size={32} color="#ef4444" />
                </div>
                <h3>Are you sure?</h3>
                <p>This will remove <strong>{seat.passenger_name || "the passenger"}</strong> and clear all requests. This action cannot be undone.</p>
                <div className="confirm-btn-group">
                   <button className="btn-confirm-yes" onClick={handleVacateConfirm}>Yes, Make Vacant</button>
                   <button className="btn-confirm-no" onClick={() => setShowConfirmVacate(false)}>No, Go Back</button>
                </div>
             </div>
          )}
        </div>
      </div>
    </div>
  );
}
