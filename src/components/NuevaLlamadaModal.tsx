'use client';
import React, { useState } from 'react';
import { Phone, PhoneCall, Loader2, X, User } from 'lucide-react';

interface NuevaLlamadaModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCallNative: (contact: any) => void;
  onCallVoIP: (contact: any) => void;
  loading: boolean;
}

export default function NuevaLlamadaModal({ isOpen, onClose, onCallNative, onCallVoIP, loading }: NuevaLlamadaModalProps) {
  const [phone, setPhone] = useState('');
  const [name, setName] = useState('');

  if (!isOpen) return null;

  const handleAction = async (type: 'native' | 'voip') => {
    if (!phone) return alert('El número es obligatorio');
    try {
      const res = await fetch('/api/contacts/manual', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, name }),
      });
      const newContact = await res.json();
      if (!res.ok) throw new Error(newContact.error || 'Error creando contacto');
      if (type === 'native') onCallNative(newContact);
      else onCallVoIP(newContact);
      setPhone(''); setName(''); onClose();
    } catch (err: any) {
      alert('Error: ' + err.message);
    }
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-box" onClick={e => e.stopPropagation()}>

        {/* Header */}
        <div style={{
          padding: '20px 24px 16px',
          borderBottom: '1px solid rgba(255,255,255,0.06)',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{
              width: 38, height: 38, borderRadius: 10,
              background: 'linear-gradient(135deg,#7c3aed,#06b6d4)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 4px 16px rgba(124,58,237,0.3)',
            }}>
              <PhoneCall size={17} color="#fff" />
            </div>
            <div>
              <h2 style={{ fontSize: 15, fontWeight: 700, color: '#e2e8f0' }}>Nueva Llamada</h2>
              <p style={{ fontSize: 11, color: '#64748b' }}>Ingresa los datos para marcar</p>
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              width: 30, height: 30, borderRadius: 8, border: 'none',
              background: 'rgba(255,255,255,0.05)', color: '#64748b',
              cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
              transition: 'all 0.18s',
            }}
            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(239,68,68,0.1)'; e.currentTarget.style.color = '#ef4444'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; e.currentTarget.style.color = '#64748b'; }}
          >
            <X size={14} />
          </button>
        </div>

        {/* Body */}
        <div style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 16 }}>

          {/* Phone */}
          <div>
            <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: '#64748b', marginBottom: 7, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Número de teléfono <span style={{ color: '#ef4444' }}>*</span>
            </label>
            <div style={{ position: 'relative' }}>
              <Phone size={14} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#4a5568' }} />
              <input
                className="input-dark"
                type="tel"
                value={phone}
                onChange={e => setPhone(e.target.value)}
                placeholder="+573001234567"
                style={{ paddingLeft: 36, width: '100%' }}
                required
              />
            </div>
          </div>

          {/* Name */}
          <div>
            <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: '#64748b', marginBottom: 7, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Nombre del cliente <span style={{ color: '#4a5568' }}>(Opcional)</span>
            </label>
            <div style={{ position: 'relative' }}>
              <User size={14} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#4a5568' }} />
              <input
                className="input-dark"
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="Ej: Juan Pérez"
                style={{ paddingLeft: 36, width: '100%' }}
              />
            </div>
          </div>

          {/* Actions */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, paddingTop: 8, borderTop: '1px solid rgba(255,255,255,0.05)' }}>
            <button
              onClick={() => handleAction('native')}
              disabled={loading || !phone}
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7,
                padding: '11px 0', borderRadius: 10,
                border: '1px solid rgba(255,255,255,0.08)',
                background: 'rgba(255,255,255,0.04)', color: '#94a3b8',
                cursor: 'pointer', fontWeight: 600, fontSize: 13,
                opacity: !phone ? 0.5 : 1, transition: 'all 0.18s',
              }}
              onMouseEnter={e => !loading && phone && (e.currentTarget.style.background = 'rgba(255,255,255,0.08)')}
              onMouseLeave={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.04)')}
            >
              <Phone size={14} /> Nativa (tel:)
            </button>
            <button
              onClick={() => handleAction('voip')}
              disabled={loading || !phone}
              className="btn-gradient"
              style={{ justifyContent: 'center', padding: '11px 0', opacity: !phone ? 0.5 : 1 }}
            >
              {loading ? <Loader2 size={14} className="animate-spin" /> : <PhoneCall size={14} />}
              VoIP Web
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
