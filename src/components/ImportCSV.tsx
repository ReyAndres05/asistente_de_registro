'use client';
import React, { useRef, useState } from 'react';
import Papa from 'papaparse';
import { Upload, FileType, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';

type ImportCSVProps = { onImportSuccess: () => void };

export default function ImportCSV({ onImportSuccess }: ImportCSVProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const process = (file: File) => {
    setLoading(true); setError(null); setSuccess(null);
    Papa.parse(file, {
      header: true, skipEmptyLines: true,
      complete: async (results) => {
        try {
          const res = await fetch('/api/contacts', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ contacts: results.data }),
          });
          if (!res.ok) throw new Error('Error al importar en el servidor');
          setSuccess(`✓ Importación exitosa: ${results.data.length} registros cargados.`);
          onImportSuccess();
        } catch (err: any) {
          setError(err.message || 'Error importando el archivo.');
        } finally {
          setLoading(false);
          if (fileInputRef.current) fileInputRef.current.value = '';
        }
      },
      error: (err) => { setError('Error CSV: ' + err.message); setLoading(false); },
    });
  };

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]; if (f) process(f);
  };
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault(); setDragOver(false);
    const f = e.dataTransfer.files?.[0]; if (f) process(f);
  };

  return (
    <div className="glass-card" style={{ padding: 28 }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14, marginBottom: 24 }}>
        <div style={{
          width: 42, height: 42, borderRadius: 10, flexShrink: 0,
          background: 'rgba(6,182,212,0.12)', border: '1px solid rgba(6,182,212,0.2)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#06b6d4',
        }}>
          <FileType size={19} />
        </div>
        <div>
          <h2 style={{ fontSize: 16, fontWeight: 700, color: '#e2e8f0' }}>Importar Registros CSV</h2>
          <p style={{ fontSize: 12, color: '#64748b', marginTop: 4, lineHeight: 1.6 }}>
            Columnas recomendadas: <code style={{ background: 'rgba(255,255,255,0.06)', padding: '1px 6px', borderRadius: 5, color: '#a78bfa' }}>phone</code>,{' '}
            <code style={{ background: 'rgba(255,255,255,0.06)', padding: '1px 6px', borderRadius: 5, color: '#a78bfa' }}>name</code>,{' '}
            <code style={{ background: 'rgba(255,255,255,0.06)', padding: '1px 6px', borderRadius: 5, color: '#a78bfa' }}>agent</code>
          </p>
        </div>
      </div>

      {/* Drop Zone */}
      <div
        onDragOver={e => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        style={{
          border: `2px dashed ${dragOver ? '#7c3aed' : 'rgba(255,255,255,0.1)'}`,
          borderRadius: 14,
          padding: '40px 20px',
          textAlign: 'center',
          cursor: 'pointer',
          background: dragOver ? 'rgba(124,58,237,0.06)' : 'rgba(255,255,255,0.02)',
          transition: 'all 0.2s',
        }}
      >
        <input type="file" accept=".csv" className="hidden" ref={fileInputRef} onChange={handleFile} />
        <div style={{
          width: 52, height: 52, borderRadius: 14, margin: '0 auto 14px',
          background: dragOver ? 'rgba(124,58,237,0.2)' : 'rgba(255,255,255,0.05)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          transition: 'all 0.2s',
        }}>
          {loading
            ? <Loader2 size={22} style={{ color: '#7c3aed', animation: 'spin 1s linear infinite' }} />
            : <Upload size={22} style={{ color: dragOver ? '#7c3aed' : '#64748b' }} />
          }
        </div>
        <p style={{ fontSize: 14, fontWeight: 600, color: dragOver ? '#a78bfa' : '#94a3b8' }}>
          {loading ? 'Procesando archivo...' : 'Arrastra tu CSV aquí o haz clic para seleccionar'}
        </p>
        <p style={{ fontSize: 12, color: '#4a5568', marginTop: 6 }}>
          Soporta archivos .csv hasta 10MB
        </p>
      </div>

      {/* Status Messages */}
      {error && (
        <div style={{
          marginTop: 14, padding: '12px 16px', borderRadius: 10,
          background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)',
          display: 'flex', alignItems: 'center', gap: 10, fontSize: 13, color: '#ef4444',
        }}>
          <AlertCircle size={15} style={{ flexShrink: 0 }} /> {error}
        </div>
      )}
      {success && (
        <div style={{
          marginTop: 14, padding: '12px 16px', borderRadius: 10,
          background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.2)',
          display: 'flex', alignItems: 'center', gap: 10, fontSize: 13, color: '#10b981',
        }}>
          <CheckCircle2 size={15} style={{ flexShrink: 0 }} /> {success}
        </div>
      )}
    </div>
  );
}
