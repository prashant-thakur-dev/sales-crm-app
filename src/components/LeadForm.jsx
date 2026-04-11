import React, { useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { STATUSES } from '../utils/dummyData';

const emptyLead = {
  name: '',
  phone: '',
  chat: '',
  followUpDate: '',
  followUpTime: '',
  youtubeLink: '',
  remark: '',
  status: 'Follow Up',
};

export default function LeadForm({ lead, onSave, onClose }) {
  const isEdit = !!lead;
  const [form, setForm] = useState(emptyLead);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (lead) {
      setForm({ ...emptyLead, ...lead });
    } else {
      setForm({ ...emptyLead, followUpDate: new Date().toISOString().split('T')[0] });
    }
  }, [lead]);

  const handleChange = (field, value) => {
    setForm(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: null }));
    }
  };

  const validate = () => {
    const errs = {};
    if (!form.name.trim()) errs.name = 'Name is required';
    if (!form.phone.trim()) errs.phone = 'Phone is required';
    else if (!/^\d{7,15}$/.test(form.phone.replace(/[\s\-\+]/g, ''))) {
      errs.phone = 'Enter a valid phone number';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;

    const savedLead = {
      ...form,
      id: isEdit ? form.id : uuidv4(),
      completed: isEdit ? form.completed : false,
    };
    onSave(savedLead, isEdit);
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }} id="lead-form-overlay">
      <div className="modal-drawer" id="lead-form-drawer">
        <div className="modal-drawer-handle" />
        <div className="modal-header">
          <h2 className="modal-title">{isEdit ? 'Edit Lead' : 'Add New Lead'}</h2>
          <button className="modal-close" onClick={onClose} id="lead-form-close">✕</button>
        </div>

        <form onSubmit={handleSubmit} className="modal-body" id="lead-form">
          <div className="form-group">
            <label className="form-label" htmlFor="lead-name">Name *</label>
            <input
              id="lead-name"
              className={`form-input ${errors.name ? 'error' : ''}`}
              type="text"
              value={form.name}
              onChange={(e) => handleChange('name', e.target.value)}
              placeholder="Lead name"
              autoFocus
            />
            {errors.name && <div className="form-error">{errors.name}</div>}
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="lead-phone">Phone Number *</label>
            <input
              id="lead-phone"
              className={`form-input ${errors.phone ? 'error' : ''}`}
              type="tel"
              value={form.phone}
              onChange={(e) => handleChange('phone', e.target.value)}
              placeholder="9876543210"
            />
            {errors.phone && <div className="form-error">{errors.phone}</div>}
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="lead-chat">Chat (link or note)</label>
            <input
              id="lead-chat"
              className="form-input"
              type="text"
              value={form.chat}
              onChange={(e) => handleChange('chat', e.target.value)}
              placeholder="WhatsApp link or chat note"
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label" htmlFor="lead-date">Follow-up Date</label>
              <input
                id="lead-date"
                className="form-input"
                type="date"
                value={form.followUpDate}
                onChange={(e) => handleChange('followUpDate', e.target.value)}
              />
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="lead-time">Follow-up Time</label>
              <input
                id="lead-time"
                className="form-input"
                type="time"
                value={form.followUpTime}
                onChange={(e) => handleChange('followUpTime', e.target.value)}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="lead-youtube">YouTube Link</label>
            <input
              id="lead-youtube"
              className="form-input"
              type="url"
              value={form.youtubeLink}
              onChange={(e) => handleChange('youtubeLink', e.target.value)}
              placeholder="https://youtube.com/..."
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="lead-remark">Old App Remark</label>
            <textarea
              id="lead-remark"
              className="form-input"
              value={form.remark}
              onChange={(e) => handleChange('remark', e.target.value)}
              placeholder="Add a remark or note..."
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="lead-status">Lead Status</label>
            <select
              id="lead-status"
              className="form-input"
              value={form.status}
              onChange={(e) => handleChange('status', e.target.value)}
            >
              {STATUSES.map(s => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>
        </form>

        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={onClose} type="button">Cancel</button>
          <button className="btn btn-primary" onClick={handleSubmit} type="submit" id="lead-form-save">
            {isEdit ? 'Update Lead' : 'Add Lead'}
          </button>
        </div>
      </div>
    </div>
  );
}
