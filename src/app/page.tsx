'use client';
import { useEffect, useState, useRef } from 'react';
import Dashboard from '@/components/Dashboard';
import LlamadasView from '@/components/LlamadasView';
import ImportCSV from '@/components/ImportCSV';
import CallModal from '@/components/CallModal';
import NuevaLlamadaModal from '@/components/NuevaLlamadaModal';
import HomeMenu from '@/components/HomeMenu';
import { Device, Call } from '@twilio/voice-sdk';
import { PhoneCall, PhoneOff, Loader2, ChevronLeft } from 'lucide-react';

export type ViewType = 'dashboard' | 'llamadas' | 'importar';

export default function Home() {
  const [currentView, setCurrentView] = useState<ViewType | null>(null); // null = home menu
  const [contacts, setContacts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Modals
  const [isCallModalOpen, setIsCallModalOpen] = useState(false);
  const [isNewCallModalOpen, setIsNewCallModalOpen] = useState(false);
  const [selectedContact, setSelectedContact] = useState<any>(null);

  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  // VoIP
  const [twilioDevice, setTwilioDevice] = useState<Device | null>(null);
  const [activeCall, setActiveCall] = useState<Call | null>(null);
  const [callStatus, setCallStatus] = useState<'IDLE' | 'CONNECTING' | 'IN_PROGRESS' | 'DISCONNECTED'>('IDLE');
  const [callDuration, setCallDuration] = useState<number>(0);
  const durationTimer = useRef<NodeJS.Timeout | null>(null);

  const fetchContacts = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/contacts');
      const data = await res.json();
      setContacts(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchContacts();
    initTwilio();
    return () => {
      if (twilioDevice) twilioDevice.destroy();
      if (durationTimer.current) clearInterval(durationTimer.current);
    };
  }, []);

  const initTwilio = async () => {
    try {
      const res = await fetch('/api/twilio/token');
      const data = await res.json();
      if (data.token) {
        const device = new Device(data.token);
        device.on('ready', () => console.log('Twilio Device ready'));
        device.on('error', (err) => console.error('Twilio error:', err));
        setTwilioDevice(device);
      }
    } catch (e) {
      console.error('Failed to init Twilio:', e);
    }
  };

  const startVoipCall = async (contact: any) => {
    if (!twilioDevice) {
      alert('Servicio VoIP no inicializado.');
      return;
    }
    try {
      setCallStatus('CONNECTING');
      setSelectedContact(contact);
      const call = await twilioDevice.connect({ params: { To: contact.phone } });
      call.on('accept', () => {
        setCallStatus('IN_PROGRESS');
        setActiveCall(call);
        setCallDuration(0);
        durationTimer.current = setInterval(() => setCallDuration(p => p + 1), 1000);
      });
      call.on('disconnect', () => handleCallDisconnect());
      call.on('error', () => handleCallDisconnect());
      setActiveCall(call);
    } catch (e) {
      console.error(e);
      setCallStatus('IDLE');
    }
  };

  const hangUpCall = () => {
    if (activeCall) activeCall.disconnect();
    else handleCallDisconnect();
  };

  const handleCallDisconnect = () => {
    setCallStatus('DISCONNECTED');
    setActiveCall(null);
    if (durationTimer.current) clearInterval(durationTimer.current);
    setTimeout(() => { setCallStatus('IDLE'); setIsCallModalOpen(true); }, 1000);
  };

  const handleNativeCall = (contact: any) => {
    window.location.href = `tel:${contact.phone}`;
    setSelectedContact(contact);
    setCallDuration(0);
    setIsCallModalOpen(true);
  };

  const handleSaveCallLog = async (data: any) => {
    try {
      await fetch('/api/calls', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      fetchContacts();
    } catch (e) {
      console.error(e);
    }
  };

  const handleDeleteSelected = async () => {
    if (selectedIds.size === 0) return;
    const ids = Array.from(selectedIds);
    const confirm = window.confirm(
      `¿Eliminar ${ids.length} registro${ids.length > 1 ? 's' : ''}? Esta acción no se puede deshacer.`
    );
    if (!confirm) return;
    try {
      const res = await fetch('/api/contacts', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids }),
      });
      if (!res.ok) throw new Error('Error al eliminar');
      setSelectedIds(new Set());
      fetchContacts();
    } catch (e) {
      console.error(e);
      alert('Error al eliminar los registros. Intenta de nuevo.');
    }
  };

  const toggleSelect = (id: string) => {
    const s = new Set(selectedIds);
    s.has(id) ? s.delete(id) : s.add(id);
    setSelectedIds(s);
  };

  const toggleSelectAll = (filtered: any[]) => {
    setSelectedIds(selectedIds.size > 0 ? new Set() : new Set(filtered.map(c => c.id)));
  };

  /* ── Navigate to a section (and clear selection) ── */
  const goTo = (v: ViewType) => {
    setSelectedIds(new Set());
    setCurrentView(v);
  };

  /* ── Back to home menu ── */
  const goHome = () => setCurrentView(null);

  /* ──────────────────────────────────────────
     HOME MENU
   ────────────────────────────────────────── */
  if (currentView === null) {
    return <HomeMenu onSelect={goTo} contacts={contacts} />;
  }

  /* ──────────────────────────────────────────
     SECTION VIEW
   ────────────────────────────────────────── */
  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-base, #0f1117)' }}>

      {/* Top navbar */}
      <nav style={{
        position: 'sticky', top: 0, zIndex: 30,
        display: 'flex', alignItems: 'center', gap: 16,
        padding: '0 32px', height: 60,
        background: 'rgba(15,17,23,0.85)',
        backdropFilter: 'blur(12px)',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
      }}>
        {/* Back button */}
        <button
          onClick={goHome}
          style={{
            display: 'flex', alignItems: 'center', gap: 6,
            padding: '7px 14px', borderRadius: 10,
            border: '1px solid rgba(255,255,255,0.08)',
            background: 'rgba(255,255,255,0.04)',
            color: '#94a3b8', cursor: 'pointer',
            fontSize: 13, fontWeight: 600,
            transition: 'all 0.18s',
          }}
          onMouseEnter={e => { e.currentTarget.style.background = 'rgba(124,58,237,0.12)'; e.currentTarget.style.color = '#a78bfa'; }}
          onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; e.currentTarget.style.color = '#94a3b8'; }}
        >
          <ChevronLeft size={15} /> Inicio
        </button>

        {/* Section tabs */}
        <div style={{ display: 'flex', gap: 4 }}>
          {(['dashboard', 'llamadas', 'importar'] as ViewType[]).map(v => {
            const labels: Record<ViewType, string> = { dashboard: 'Dashboard', llamadas: 'Llamadas', importar: 'Importar CSV' };
            const active = currentView === v;
            return (
              <button
                key={v}
                onClick={() => goTo(v)}
                style={{
                  padding: '6px 16px', borderRadius: 8, border: 'none',
                  cursor: 'pointer', fontSize: 13, fontWeight: active ? 600 : 400,
                  background: active ? 'rgba(124,58,237,0.18)' : 'transparent',
                  color: active ? '#a78bfa' : '#64748b',
                  borderBottom: active ? '2px solid #7c3aed' : '2px solid transparent',
                  transition: 'all 0.18s',
                }}
              >
                {labels[v]}
              </button>
            );
          })}
        </div>

        {/* Right: branding */}
        <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 28, height: 28, borderRadius: 8,
            background: 'linear-gradient(135deg,#7c3aed,#06b6d4)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <PhoneCall size={13} color="#fff" />
          </div>
          <span style={{ fontSize: 13, fontWeight: 700, color: '#e2e8f0' }}>Asistente de Registro</span>
        </div>
      </nav>

      {/* Content */}
      <main style={{ padding: '32px', maxWidth: 1400, margin: '0 auto' }}>
        {currentView === 'dashboard' && <Dashboard contacts={contacts} />}

        {currentView === 'llamadas' && (
          <LlamadasView
            contacts={contacts}
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            filterStatus={filterStatus}
            setFilterStatus={setFilterStatus}
            selectedIds={selectedIds}
            toggleSelectAll={toggleSelectAll}
            toggleSelect={toggleSelect}
            onCallNative={handleNativeCall}
            onCallVoIP={startVoipCall}
            onOpenNewCall={() => setIsNewCallModalOpen(true)}
            onDeleteSelected={handleDeleteSelected}
            loading={loading}
          />
        )}

        {currentView === 'importar' && (
          <div style={{ maxWidth: 800, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 24 }}>
            <div>
              <h2 style={{ fontSize: 24, fontWeight: 800, color: '#e2e8f0', letterSpacing: '-0.5px' }}>Importar CSV</h2>
              <p style={{ color: '#64748b', marginTop: 4, fontSize: 13 }}>
                Sube un archivo CSV para cargar registros de llamadas masivamente
              </p>
            </div>
            <ImportCSV onImportSuccess={() => { fetchContacts(); goTo('llamadas'); }} />
          </div>
        )}
      </main>

      {/* VoIP Banner */}
      {callStatus !== 'IDLE' && selectedContact && (
        <div style={{
          position: 'fixed', bottom: 28, right: 28, zIndex: 50,
          background: 'linear-gradient(135deg,#1c2333,#252d3d)',
          border: '1px solid rgba(124,58,237,0.35)',
          borderRadius: 20, padding: 22, width: 360,
          display: 'flex', flexDirection: 'column', gap: 14,
          boxShadow: '0 20px 60px rgba(0,0,0,0.5)',
          color: '#e2e8f0',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{
                padding: 11, borderRadius: '50%',
                background: callStatus === 'IN_PROGRESS' ? 'rgba(16,185,129,0.15)' : 'rgba(124,58,237,0.15)',
                color: callStatus === 'IN_PROGRESS' ? '#10b981' : '#a78bfa',
              }}>
                <PhoneCall size={20} />
              </div>
              <div>
                <p style={{ fontWeight: 600, fontSize: 15 }}>{selectedContact.name || 'Desconocido'}</p>
                <p style={{ color: '#64748b', fontSize: 12, fontFamily: 'monospace' }}>{selectedContact.phone}</p>
              </div>
            </div>
            <div style={{ textAlign: 'right' }}>
              {callStatus === 'CONNECTING' && (
                <p style={{ color: '#06b6d4', fontSize: 12, display: 'flex', alignItems: 'center', gap: 5 }}>
                  <Loader2 size={13} style={{ animation: 'spin 1s linear infinite' }} /> Conectando
                </p>
              )}
              {callStatus === 'IN_PROGRESS' && (
                <p style={{ color: '#10b981', fontFamily: 'monospace', fontSize: 20, fontWeight: 700 }}>
                  {Math.floor(callDuration / 60).toString().padStart(2, '0')}:{(callDuration % 60).toString().padStart(2, '0')}
                </p>
              )}
              {callStatus === 'DISCONNECTED' && <p style={{ color: '#ef4444', fontSize: 12 }}>Desconectado</p>}
            </div>
          </div>
          {(callStatus === 'IN_PROGRESS' || callStatus === 'CONNECTING') && (
            <button
              onClick={hangUpCall}
              style={{
                width: '100%', padding: 11,
                background: 'linear-gradient(135deg,#ef4444,#dc2626)',
                border: 'none', borderRadius: 12, color: '#fff',
                fontWeight: 600, fontSize: 13, cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                boxShadow: '0 4px 16px rgba(239,68,68,0.3)',
              }}
            >
              <PhoneOff size={16} /> Colgar
            </button>
          )}
        </div>
      )}

      {/* Modals */}
      <CallModal
        isOpen={isCallModalOpen}
        contact={selectedContact}
        initialDuration={callDuration}
        onClose={() => setIsCallModalOpen(false)}
        onSave={handleSaveCallLog}
      />
      <NuevaLlamadaModal
        isOpen={isNewCallModalOpen}
        onClose={() => setIsNewCallModalOpen(false)}
        onCallNative={handleNativeCall}
        onCallVoIP={startVoipCall}
        loading={callStatus === 'CONNECTING'}
      />
    </div>
  );
}
