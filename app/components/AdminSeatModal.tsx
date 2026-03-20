"use client";

import React, { useState, useEffect } from "react";
import { X, UserPlus, Trash2, CheckCircle, Edit3, User, ArrowUp, ArrowDown } from "lucide-react";
import "./AdminSeatModal.css";

import { Seat } from "./BusSeatingChart";

interface AdminSeatModalProps {
  seat: Seat;
  onClose: () => void;
  onUpdate: (data: any) => void;
}

export default function AdminSeatModal({ seat, onClose, onUpdate }: AdminSeatModalProps) {
  const [passengerName, setPassengerName] = useState(seat.passenger_name || "");
  const [isBusy, setIsBusy] = useState(false);
  const [showRequests, setShowRequests] = useState(false);
  const [showConfirmVacate, setShowConfirmVacate] = useState(false);
  const [newRequestName, setNewRequestName] = useState("");

  // Local state for drag-and-drop
  const [requesterList, setRequesterList] = useState<string[]>(seat.requester_names || []);

  useEffect(() => {
    setPassengerName(seat.passenger_name || "");
    setRequesterList(seat.requester_names || []);
  }, [seat]);

  const handleMoveUp = (idx: number) => {
    if (idx === 0) return;
    const newList = [...requesterList];
    [newList[idx - 1], newList[idx]] = [newList[idx], newList[idx - 1]];
    setRequesterList(newList);
    onUpdate({ requester_names: newList });
  };

  const handleMoveDown = (idx: number) => {
    if (idx === requesterList.length - 1) return;
    const newList = [...requesterList];
    [newList[idx + 1], newList[idx]] = [newList[idx], newList[idx + 1]];
    setRequesterList(newList);
    onUpdate({ requester_names: newList });
  };

  const handleAddRequest = (e: React.FormEvent) => {
    e.preventDefault();
    const name = newRequestName.trim();
    if (name && !requesterList.includes(name) && requesterList.length < 10) {
      const newList = [...requesterList, name];
      setRequesterList(newList);
      setNewRequestName("");
      // Add to list and ensure status becomes requested if it was previously vacant
      onUpdate({ 
        status: seat.status === "vacant" ? "requested" : seat.status, 
        requester_names: newList 
      });
    }
  };

  const handleApprove = (name: string) => {
    onUpdate({ 
      status: "occupied", 
      passenger_name: name, 
      requester_names: []
    });
    onClose();
  };

  const handleRemoveRequest = (nameToRemove: string) => {
    const updatedNames = requesterList.filter(n => n !== nameToRemove);
    if (updatedNames.length === 0) {
      onUpdate({ status: "vacant", requester_names: [] });
      onClose();
    } else {
      // Local list gets updated automatically by the useEffect listening to the seat prop, 
      // but we update the DB here
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
      onUpdate({ status: "occupied", passenger_name: passengerName.trim(), requester_names: [] });
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
          {/* Section 1: Request Pending / Waitlist */}
          <div className="admin-section">
             <label className="section-label">Request List</label>
             
             {!showRequests ? (
                <button className="btn-view-requests" onClick={() => setShowRequests(true)}>
                  <span>View & Edit Name Requests</span>
                  <span className="count-tag">{requesterList.length}</span>
                </button>
             ) : (
                <div className="admin-request-list">
                  <p className="helper-text mb-2" style={{ fontSize: "0.75rem", opacity: 0.8 }}>Use the up/down arrows to reorder. The top person is prioritized.</p>
                  
                  {requesterList.length === 0 && <p className="helper-text mt-2 mb-2">No requests currently.</p>}
                  
                  {requesterList.map((name, idx) => (
                    <div 
                      key={`${name}-${idx}`} 
                      className="admin-request-item"
                    >
                      <div className="admin-request-info">
                        <User size={16} />
                        <span>{name}</span>
                      </div>
                      <div className="admin-request-actions">
                        <button 
                          className="btn-mini-action move-btn" 
                          title="Move Up"
                          onClick={() => handleMoveUp(idx)}
                          disabled={idx === 0}
                        >
                          <ArrowUp size={16} />
                        </button>
                        <button 
                          className="btn-mini-action move-btn" 
                          title="Move Down"
                          onClick={() => handleMoveDown(idx)}
                          disabled={idx === requesterList.length - 1}
                        >
                          <ArrowDown size={16} />
                        </button>
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

                  <div style={{ marginTop: "1rem", borderTop: "1px solid #e2e8f0", paddingTop: "0.75rem" }}>
                    <label className="section-label mb-2" style={{ display: "block", color: "#64748b" }}>Add Name to List</label>
                    <form onSubmit={handleAddRequest} className="manual-form">
                      <div className="input-wrapper">
                        <UserPlus size={18} className="input-icon" style={{ color: "#94a3b8" }}/>
                        <input 
                          type="text" 
                          placeholder="Type new requester name..." 
                          value={newRequestName}
                          onChange={(e) => setNewRequestName(e.target.value)}
                          className="modal-input"
                          maxLength={30}
                        />
                      </div>
                      <button type="submit" className="btn-save" disabled={!newRequestName.trim() || requesterList.length >= 10}>
                        Add
                      </button>
                    </form>
                  </div>

                  <button className="btn-save mt-3" style={{ width: "100%", justifyContent: "center", display: "flex", height: "3rem", alignItems: "center", background: "#f1f5f9", color: "#475569" }} onClick={() => setShowRequests(false)}>Close List</button>
                </div>
             )}
          </div>

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
                  maxLength={30}
                />
              </div>
              <p className="input-helper">{passengerName.length}/30</p>
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
