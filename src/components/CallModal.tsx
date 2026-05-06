'use client';
import React, { useState, useEffect } from 'react';
import { X, Phone, Clock, MessageSquare, CheckCircle } from 'lucide-react';

type CallModalProps = {
  isOpen: boolean;
  contact: any;
  initialDuration?: number;
  onClose: () => void;
  onSave: (data: any) => Promise<void>;
};

const STATUS_OPTIONS = [
  { value: 'CONTESTÓ',    label: 'Contestó (Gestión Efectiva)', color: '#10b981' },
  { value: 'NO CONTESTÓ', label: 'No Contestó (Reintento)',     color: '#ef4444' },
  { value: 'SEGUIMIENTO', label: 'Seguimiento',                  color: '#8b5cf6' },
];

export default function CallModal({ isOpen, contact, initialDuration = 0, onClose, onSave }: CallModalProps) {
  const [status, setStatus]             = useState('CONTESTÓ');
  const [duration, setDuration]         = useState('');
  const [trackingType, setTrackingType] = useState('');
  const [observations, setObservations] = useState('');
  const [loading, setLoading]           = useState(false);

  useEffect(() => {
    if (isOpen) {
      setDuration(initialDuration > 0 ? initialDuration.toString() : '');
      setStatus('CONTESTÓ');
    }
  }, [isOpen, initialDuration]);

  if (!isOpen || !contact) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    await onSave({
      contactId: contact.id,
      agent: contact.agent || 'Agente Desconocido',
      status, duration,
      trackingType: status === 'SEGUIMIENTO' ? trackingType : undefined,
      observations,
    });
    setLoading(false); onClose();
    setStatus('CONTESTÓ'); setDuration(''); setTrackingType(''); setObservations('');
  };

  const selectedStatus = STATUS_OPTIONS.find(s => s.value === status);

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-box" style={{ maxWidth: 460 }} onClick={e => e.stopPropagation()}>

        {/* Header */}
        <div style={{
          padding: '20px 24px 16px',
          background: `linear-gradient(135deg, ${selectedStatus?.color}18, transparent)`,
          borderBottom: '1px solid rgba(255,255,255,0.06)',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          transition: 'background 0.3s',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{
              width: 38, height: 38, borderRadius: 10,
              background: `${selectedStatus?.color}22`,
              border: `1px solid ${selectedStatus?.color}44`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: selectedStatus?.color,
              transition: 'all 0.3s',
            }}>
              <CheckCircle size={17} />
            </div>
            <div>
              <h2 style={{ fontSize: 15, fontWeight: 700, color: '#e2e8f0' }}>Registro de Llamada</h2>
              <p style={{ fontSize: 11, color: '#64748b' }}>Completa los detalles post-llamada</p>
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              width: 30, height: 30, borderRadius: 8, border: 'none',
              background: 'rgba(255,255,255,0.05)', color: '#64748b',
              cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}
            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(239,68,68,0.1)'; e.currentTarget.style.color = '#ef4444'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; e.currentTarget.style.color = '#64748b'; }}
          >
            <X size={14} />
          </button>
        </div>

        {/* Contact info */}
        <div style={{
          margin: '16px 24px 0',
          background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)',
          borderRadius: 10, padding: '12px 16px',
          display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12,
        }}>
          <div>
            <div style={{ fontSize: 10, color: '#4a5568', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.07em' }}>Número</div>
            <div style={{ fontFamily: 'monospace', color: '#a78bfa', fontWeight: 500, marginTop: 3 }}>{contact.phone}</div>
          </div>
          <div>
            <div style={{ fontSize: 10, color: '#4a5568', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.07em' }}>Agente</div>
            <div style={{ color: '#94a3b8', marginTop: 3 }}>{contact.agent || 'No asignado'}</div>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} style={{ padding: '16px 24px 24px', display: 'flex', flexDirection: 'column', gap: 14 }}>

          {/* Status selector — visual pills */}
          <div>
            <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: '#64748b', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Estado de la llamada <span style={{ color: '#ef4444' }}>*</span>
            </label>
            <div style={{ display: 'flex', gap: 8 }}>
              {STATUS_OPTIONS.map(opt => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setStatus(opt.value)}
                  style={{
                    flex: 1, padding: '8px 6px', borderRadius: 10,
                    border: `1px solid ${status === opt.value ? opt.color + '66' : 'rgba(255,255,255,0.07)'}`,
                    background: status === opt.value ? `${opt.color}18` : 'transparent',
                    color: status === opt.value ? opt.color : '#64748b',
                    cursor: 'pointer', fontSize: 11, fontWeight: 600,
                    transition: 'all 0.18s', textAlign: 'center' as const,
                  }}
                >
                  {opt.value}
                </button>
              ))}
            </div>
          </div>

          {/* Tracking type */}
          {status === 'SEGUIMIENTO' && (
            <div style={{ animation: 'fadeInUp 0.2s ease' }}>
              <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: '#64748b', marginBottom: 7, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Tipo de seguimiento <span style={{ color: '#ef4444' }}>*</span>
              </label>
              <select
                className="input-dark"
                value={trackingType}
                onChange={e => setTrackingType(e.target.value)}
                style={{ width: '100%' }}
                required
              >
                <option value="">Selecciona un tipo...</option>
                <option value="Llamada de retorno">Llamada de retorno</option>
                <option value="Envío de información">Envío de información</option>
                <option value="Validación de datos">Validación de datos</option>
                <option value="Cierre de venta">Cierre de venta</option>
                <option value="Otro">Otro</option>
              </select>
            </div>
          )}

          {/* Duration */}
          <div>
            <label style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 11, fontWeight: 600, color: '#64748b', marginBottom: 7, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}><Clock size={11} /> Duración (segundos)</span>
              {initialDuration > 0 && (
                <span style={{ padding: '2px 8px', borderRadius: 20, background: 'rgba(6,182,212,0.1)', color: '#06b6d4', fontSize: 10, fontWeight: 600 }}>
                  Calculado automáticamente
                </span>
              )}
            </label>
            <input
              className="input-dark"
              type="number"
              value={duration}
              onChange={e => setDuration(e.target.value)}
              readOnly={initialDuration > 0}
              placeholder="Ej: 120"
              style={{ width: '100%', opacity: initialDuration > 0 ? 0.6 : 1 }}
            />
          </div>

          {/* Observations */}
          <div>
            <label style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 11, fontWeight: 600, color: '#64748b', marginBottom: 7, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              <MessageSquare size={11} /> Observaciones
            </label>
            <textarea
              className="input-dark"
              value={observations}
              onChange={e => setObservations(e.target.value)}
              rows={3}
              placeholder="Detalles adicionales de la llamada..."
              style={{ width: '100%', resize: 'none' }}
            />
          </div>

          {/* Buttons */}
          <div style={{ display: 'flex', gap: 10, paddingTop: 4 }}>
            <button
              type="button"
              onClick={onClose}
              style={{
                flex: 1, padding: '11px 0', borderRadius: 10,
                border: '1px solid rgba(255,255,255,0.08)',
                background: 'transparent', color: '#94a3b8',
                cursor: 'pointer', fontWeight: 600, fontSize: 13,
              }}
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="btn-gradient"
              style={{ flex: 2, justifyContent: 'center', padding: '11px 0', opacity: loading ? 0.7 : 1 }}
            >
              {loading ? 'Guardando...' : '✓  Guardar Registro'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
