'use client';
import React, { useMemo, useState } from 'react';
import { Search, Filter, Phone, PhoneCall, Plus, X, FileSpreadsheet, Trash2 } from 'lucide-react';
import * as XLSX from 'xlsx';

interface LlamadasViewProps {
  contacts: any[];
  searchTerm: string;
  setSearchTerm: (s: string) => void;
  filterStatus: string;
  setFilterStatus: (s: string) => void;
  selectedIds: Set<string>;
  toggleSelectAll: (filtered: any[]) => void;
  toggleSelect: (id: string) => void;
  onCallNative: (contact: any) => void;
  onCallVoIP: (contact: any) => void;
  onOpenNewCall: () => void;
  onDeleteSelected: () => void;
  loading: boolean;
}

/* ── Status Badge ── */
function StatusBadge({ status }: { status?: string }) {
  if (!status) return <span className="badge badge-gray">Sin contactar</span>;
  const cls: Record<string, string> = {
    'CONTESTÓ':    'badge badge-green',
    'NO CONTESTÓ': 'badge badge-red',
    'SEGUIMIENTO': 'badge badge-violet',
  };
  const dot: Record<string, string> = {
    'CONTESTÓ': '#10b981', 'NO CONTESTÓ': '#ef4444', 'SEGUIMIENTO': '#8b5cf6',
  };
  return (
    <span className={cls[status] || 'badge badge-gray'}>
      <span style={{ width: 5, height: 5, borderRadius: '50%', background: dot[status] || '#94a3b8', display: 'inline-block' }} />
      {status}
    </span>
  );
}

/* ── Avatar ── */
function Avatar({ name }: { name?: string }) {
  const initials = (name || '?').split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
  const palette = ['#7c3aed', '#06b6d4', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];
  const c = palette[(initials.charCodeAt(0) || 0) % palette.length];
  return (
    <span style={{
      width: 32, height: 32, borderRadius: '50%', flexShrink: 0,
      background: `${c}22`, border: `1px solid ${c}55`,
      display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
      fontSize: 11, fontWeight: 700, color: c,
    }}>{initials}</span>
  );
}

/* ── Quick Filter Button ── */
function QuickBtn({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      style={{
        padding: '6px 14px', borderRadius: 999, border: 'none',
        cursor: 'pointer', fontSize: 12, fontWeight: 600,
        transition: 'all 0.18s',
        background: active
          ? 'linear-gradient(135deg,#7c3aed,#06b6d4)'
          : 'rgba(255,255,255,0.05)',
        color: active ? '#fff' : '#64748b',
        boxShadow: active ? '0 2px 10px rgba(124,58,237,0.3)' : 'none',
      }}
    >
      {label}
    </button>
  );
}

/* ═══════════════════════════════════════
   LLAMADAS VIEW
   ═══════════════════════════════════════ */
export default function LlamadasView({
  contacts, searchTerm, setSearchTerm, filterStatus, setFilterStatus,
  selectedIds, toggleSelectAll, toggleSelect,
  onCallNative, onCallVoIP, onOpenNewCall, onDeleteSelected, loading,
}: LlamadasViewProps) {

  const [dateFilter, setDateFilter] = useState<'hoy' | 'ayer' | 'semana' | ''>('');

  /* ── Export selected contacts to Excel (.xlsx) ── */
  const exportExcel = () => {
    const selected = contacts.filter(c => selectedIds.has(c.id));
    if (selected.length === 0) return;

    const rows = selected.map(contact => {
      const call = contact.calls?.[0];
      return {
        'Nombre':          contact.name  || '',
        'Teléfono':        contact.phone || '',
        'Agente':          contact.agent || call?.agent || '',
        'Estado':          call?.status       || 'Sin contactar',
        'Duración (seg)': call?.duration != null ? Number(call.duration) : '',
        'Observaciones':   call?.observations || '',
        'Fecha':           call?.createdAt
                             ? new Date(call.createdAt).toLocaleString('es')
                             : '',
      };
    });

    const ws = XLSX.utils.json_to_sheet(rows);

    // Column widths
    ws['!cols'] = [
      { wch: 22 }, { wch: 18 }, { wch: 20 },
      { wch: 16 }, { wch: 16 }, { wch: 30 }, { wch: 22 },
    ];

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Llamadas');
    XLSX.writeFile(wb, `llamadas_${new Date().toISOString().slice(0, 10)}.xlsx`);
  };

  const filtered = useMemo(() => {
    const now = new Date();
    return contacts.filter(contact => {
      const lastCall = contact.calls?.[0];
      const statusOk = filterStatus ? lastCall?.status === filterStatus : true;
      const searchOk = (contact.phone || '').includes(searchTerm) ||
        (contact.name || '').toLowerCase().includes(searchTerm.toLowerCase());

      let dateOk = true;
      if (dateFilter && lastCall?.createdAt) {
        const d = new Date(lastCall.createdAt);
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const yesterday = new Date(today); yesterday.setDate(today.getDate() - 1);
        const weekAgo = new Date(today); weekAgo.setDate(today.getDate() - 7);
        if (dateFilter === 'hoy')    dateOk = d >= today;
        if (dateFilter === 'ayer')   dateOk = d >= yesterday && d < today;
        if (dateFilter === 'semana') dateOk = d >= weekAgo;
      }
      return statusOk && searchOk && dateOk;
    });
  }, [contacts, filterStatus, searchTerm, dateFilter]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
        <div>
          <h2 style={{ fontSize: 24, fontWeight: 800, color: '#e2e8f0', letterSpacing: '-0.5px' }}>Llamadas</h2>
          <p style={{ color: '#64748b', fontSize: 13, marginTop: 3 }}>
            {filtered.length} {filtered.length === 1 ? 'registro' : 'registros'} encontrados
          </p>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          {selectedIds.size > 0 && (
            <>
              {/* Delete button */}
              <button
                id="btn-delete-selected"
                onClick={onDeleteSelected}
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: 7,
                  padding: '10px 18px', borderRadius: 12,
                  cursor: 'pointer', fontSize: 13, fontWeight: 600,
                  background: 'rgba(239,68,68,0.1)',
                  color: '#ef4444',
                  border: '1px solid rgba(239,68,68,0.25)',
                  transition: 'all 0.18s',
                  animation: 'fadeInUp 0.2s ease',
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.background = 'rgba(239,68,68,0.2)';
                  e.currentTarget.style.boxShadow  = '0 4px 16px rgba(239,68,68,0.2)';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.background = 'rgba(239,68,68,0.1)';
                  e.currentTarget.style.boxShadow  = 'none';
                }}
              >
                <Trash2 size={14} />
                Eliminar
                <span style={{
                  marginLeft: 2,
                  background: '#ef4444', color: '#fff',
                  fontSize: 10, fontWeight: 800,
                  padding: '1px 7px', borderRadius: 999,
                }}>
                  {selectedIds.size}
                </span>
              </button>

              {/* Export Excel button */}
              <button
                id="btn-export-excel"
                onClick={exportExcel}
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: 7,
                  padding: '10px 18px', borderRadius: 12,
                  cursor: 'pointer', fontSize: 13, fontWeight: 600,
                  background: 'rgba(16,185,129,0.12)',
                  color: '#10b981',
                  border: '1px solid rgba(16,185,129,0.25)',
                  transition: 'all 0.18s',
                  animation: 'fadeInUp 0.2s ease',
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.background = 'rgba(16,185,129,0.22)';
                  e.currentTarget.style.boxShadow  = '0 4px 16px rgba(16,185,129,0.2)';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.background = 'rgba(16,185,129,0.12)';
                  e.currentTarget.style.boxShadow  = 'none';
                }}
              >
                <FileSpreadsheet size={15} />
                Exportar Excel
                <span style={{
                  marginLeft: 2,
                  background: '#10b981', color: '#fff',
                  fontSize: 10, fontWeight: 800,
                  padding: '1px 7px', borderRadius: 999,
                }}>
                  {selectedIds.size}
                </span>
              </button>
            </>
          )}
          <button className="btn-gradient" onClick={onOpenNewCall} id="btn-nueva-llamada">
            <Plus size={15} /> Nueva Llamada
          </button>
        </div>
      </div>

      {/* Toolbar */}
      <div className="glass-card" style={{ padding: '14px 18px', display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>

        {/* Search */}
        <div style={{ position: 'relative', flex: 1, minWidth: 200 }}>
          <Search size={14} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#4a5568' }} />
          <input
            className="input-dark"
            type="text"
            placeholder="Buscar número, nombre o agente..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            style={{ paddingLeft: 36, width: '100%' }}
          />
        </div>

        {/* Status filter */}
        <select
          className="input-dark"
          value={filterStatus}
          onChange={e => setFilterStatus(e.target.value)}
          style={{ minWidth: 160 }}
        >
          <option value="">Todos los estados</option>
          <option value="CONTESTÓ">Contestó</option>
          <option value="NO CONTESTÓ">No Contestó</option>
          <option value="SEGUIMIENTO">Seguimiento</option>
        </select>

        <div style={{ width: 1, height: 28, background: 'rgba(255,255,255,0.07)' }} />

        {/* Quick date filters */}
        <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
          <Filter size={13} style={{ color: '#4a5568' }} />
          <QuickBtn label="Hoy"        active={dateFilter === 'hoy'}    onClick={() => setDateFilter(p => p === 'hoy'    ? '' : 'hoy')} />
          <QuickBtn label="Ayer"       active={dateFilter === 'ayer'}   onClick={() => setDateFilter(p => p === 'ayer'   ? '' : 'ayer')} />
          <QuickBtn label="Esta semana" active={dateFilter === 'semana'} onClick={() => setDateFilter(p => p === 'semana' ? '' : 'semana')} />
        </div>

        {/* Clear filters */}
        {(searchTerm || filterStatus || dateFilter) && (
          <button
            onClick={() => { setSearchTerm(''); setFilterStatus(''); setDateFilter(''); }}
            style={{
              display: 'flex', alignItems: 'center', gap: 5,
              padding: '6px 12px', borderRadius: 8, border: '1px solid rgba(239,68,68,0.3)',
              background: 'rgba(239,68,68,0.08)', color: '#ef4444',
              cursor: 'pointer', fontSize: 12, fontWeight: 600,
            }}
          >
            <X size={12} /> Limpiar
          </button>
        )}
      </div>

      {/* Table / Empty */}
      {filtered.length === 0 && !loading ? (
        <div className="glass-card" style={{
          padding: '80px 20px', display: 'flex', flexDirection: 'column',
          alignItems: 'center', textAlign: 'center',
        }}>
          <div style={{
            width: 64, height: 64, borderRadius: '50%', marginBottom: 20,
            background: 'rgba(124,58,237,0.1)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <Phone size={26} color="#7c3aed" />
          </div>
          <h3 style={{ fontSize: 18, fontWeight: 700, color: '#e2e8f0' }}>Sin registros</h3>
          <p style={{ color: '#64748b', marginTop: 8, maxWidth: 360, lineHeight: 1.7, fontSize: 13 }}>
            No hay llamadas con los filtros actuales. Prueba cambiar el filtro o haz clic en <b>Nueva Llamada</b>.
          </p>
          <button className="btn-gradient" style={{ marginTop: 24 }} onClick={onOpenNewCall}>
            <PhoneCall size={15} /> Nueva Llamada
          </button>
        </div>
      ) : (
        <div className="glass-card" style={{ overflow: 'hidden' }}>
          <div style={{ overflowX: 'auto' }}>
            <table className="dark-table">
              <thead>
                <tr>
                  <th style={{ width: 44 }}>
                    <input
                      type="checkbox"
                      style={{ accentColor: '#7c3aed', width: 14, height: 14, cursor: 'pointer' }}
                      checked={filtered.length > 0 && selectedIds.size === filtered.length}
                      onChange={() => toggleSelectAll(filtered)}
                    />
                  </th>
                  <th>Cliente</th>
                  <th>Número</th>
                  <th>Agente</th>
                  <th>Último Estado</th>
                  <th style={{ textAlign: 'center' }}>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  [1, 2, 3, 4, 5].map(i => (
                    <tr key={i}>
                      {[1, 2, 3, 4, 5, 6].map(j => (
                        <td key={j} style={{ padding: '14px 18px' }}>
                          <div className="skeleton" style={{ height: 16, width: '80%' }} />
                        </td>
                      ))}
                    </tr>
                  ))
                ) : filtered.map(contact => {
                  const lastCall = contact.calls?.[0];
                  const selected = selectedIds.has(contact.id);
                  return (
                    <tr key={contact.id} style={{ background: selected ? 'rgba(124,58,237,0.06)' : undefined }}>
                      <td>
                        <input
                          type="checkbox"
                          style={{ accentColor: '#7c3aed', width: 14, height: 14, cursor: 'pointer' }}
                          checked={selected}
                          onChange={() => toggleSelect(contact.id)}
                        />
                      </td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <Avatar name={contact.name} />
                          <span style={{ color: '#e2e8f0', fontWeight: 500, fontSize: 13 }}>
                            {contact.name || 'Desconocido'}
                          </span>
                        </div>
                      </td>
                      <td style={{ fontFamily: 'monospace', color: '#a78bfa', fontSize: 12 }}>{contact.phone}</td>
                      <td>{contact.agent || '—'}</td>
                      <td><StatusBadge status={lastCall?.status} /></td>
                      <td style={{ textAlign: 'center' }}>
                        <div style={{ display: 'flex', gap: 8, justifyContent: 'center' }}>
                          <button
                            id={`btn-voip-${contact.id}`}
                            onClick={() => onCallVoIP(contact)}
                            style={{
                              display: 'inline-flex', alignItems: 'center', gap: 5,
                              padding: '5px 12px', borderRadius: 8, border: 'none',
                              background: 'rgba(124,58,237,0.15)', color: '#a78bfa',
                              cursor: 'pointer', fontSize: 12, fontWeight: 600,
                              transition: 'all 0.18s',
                            }}
                            onMouseEnter={e => {
                              e.currentTarget.style.background = '#7c3aed';
                              e.currentTarget.style.color = '#fff';
                            }}
                            onMouseLeave={e => {
                              e.currentTarget.style.background = 'rgba(124,58,237,0.15)';
                              e.currentTarget.style.color = '#a78bfa';
                            }}
                          >
                            <PhoneCall size={12} /> VoIP
                          </button>
                          <button
                            id={`btn-native-${contact.id}`}
                            onClick={() => onCallNative(contact)}
                            style={{
                              display: 'inline-flex', alignItems: 'center', gap: 5,
                              padding: '5px 12px', borderRadius: 8,
                              border: '1px solid rgba(255,255,255,0.08)',
                              background: 'transparent', color: '#64748b',
                              cursor: 'pointer', fontSize: 12, fontWeight: 600,
                              transition: 'all 0.18s',
                            }}
                            onMouseEnter={e => {
                              e.currentTarget.style.background = 'rgba(255,255,255,0.06)';
                              e.currentTarget.style.color = '#e2e8f0';
                            }}
                            onMouseLeave={e => {
                              e.currentTarget.style.background = 'transparent';
                              e.currentTarget.style.color = '#64748b';
                            }}
                          >
                            <Phone size={12} /> Nativa
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
