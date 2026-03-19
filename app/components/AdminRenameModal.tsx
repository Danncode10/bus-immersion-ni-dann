"use client";

import React, { useState } from "react";
import { X, Pencil, Check } from "lucide-react";
import "./AdminSeatModal.css";

interface AdminRenameModalProps {
  currentName: string;
  onClose: () => void;
  onUpdate: (newName: string) => void;
}

export default function AdminRenameModal({ currentName, onClose, onUpdate }: AdminRenameModalProps) {
  const [busName, setBusName] = useState(currentName);

  const handleRename = (e: React.FormEvent) => {
    e.preventDefault();
    if (busName.trim() && busName.trim() !== currentName) {
      onUpdate(busName.trim());
    } else {
      onClose(); // No changes made
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="admin-modal-content vacant-special" onClick={(e) => e.stopPropagation()}>
        <button className="close-btn" onClick={onClose}><X size={20} /></button>
        
        <div className="modal-header admin-header vacant-header">
          <div className="modal-icon icon-vacant-admin">
            <Pencil size={24} />
          </div>
          <div>
            <h2 className="modal-title">Rename Bus</h2>
            <p className="modal-sub">Update the display name for this bus.</p>
          </div>
        </div>

        <div className="modal-body">
          <div className="admin-section">
            <label className="section-label">Bus Name</label>
            <form onSubmit={handleRename} className="manual-form-vertical">
              <div className="input-wrapper">
                 {/* Reusing input icon style for the pencil */}
                <Pencil size={18} className="input-icon" />
                <input 
                  autoFocus
                  type="text" 
                  placeholder="Enter custom bus name..." 
                  value={busName}
                  onChange={(e) => setBusName(e.target.value)}
                  className="modal-input"
                  maxLength={40}
                />
              </div>
              <p className="input-helper">{busName.length}/40 characters</p>
              <button 
                type="submit" 
                className="btn-action approve-full mt-4" 
                disabled={!busName.trim() || busName.trim() === currentName}
              >
                <Check size={18} /> Confirm Rename
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
