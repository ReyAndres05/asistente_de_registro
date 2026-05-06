'use client';
import React, { useState } from 'react';
import {
  LayoutDashboard, Phone, FileUp, Headphones,
  ChevronLeft, ChevronRight, BarChart2, Settings
} from 'lucide-react';
import { ViewType } from '@/types';


interface SidebarProps {
  currentView: ViewType;
  onChangeView: (view: ViewType) => void;
}

const NAV_ITEMS = [
  { id: 'dashboard', label: 'Dashboard',    icon: LayoutDashboard },
  { id: 'llamadas',  label: 'Llamadas',     icon: Phone },
  { id: 'importar',  label: 'Importar CSV', icon: FileUp },
];

export default function Sidebar({ currentView, onChangeView }: SidebarProps) {
  const [collapsed, setCollapsed] = useState(false);
  const w = collapsed ? 68 : 240;

  return (
    <aside
      style={{
        width: w,
        minWidth: w,
        maxWidth: w,
        background: 'linear-gradient(180deg, #12172b 0%, #0f1117 100%)',
        borderRight: '1px solid rgba(255,255,255,0.06)',
        display: 'flex',
        flexDirection: 'column',
        height: '100vh',
        position: 'fixed',
        top: 0,
        left: 0,
        zIndex: 40,
        transition: 'width 0.28s cubic-bezier(0.4,0,0.2,1), min-width 0.28s, max-width 0.28s',
        overflow: 'hidden',
      }}
    >
      {/* ---- Logo ---- */}
      <div style={{
        padding: collapsed ? '22px 0' : '22px 20px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: collapsed ? 'center' : 'flex-start',
        gap: 12,
        borderBottom: '1px solid rgba(255,255,255,0.05)',
        flexShrink: 0,
      }}>
        <div style={{
          width: 36, height: 36, borderRadius: 10, flexShrink: 0,
          background: 'linear-gradient(135deg,#7c3aed,#06b6d4)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: '0 4px 16px rgba(124,58,237,0.4)',
        }}>
          <Headphones size={18} color="#fff" />
        </div>
        {!collapsed && (
          <div style={{ overflow: 'hidden', whiteSpace: 'nowrap' }}>
            <div style={{ fontSize: 13, fontWeight: 800, color: '#e2e8f0', letterSpacing: '-0.3px' }}>
              Asistente de
            </div>
            <div style={{
              fontSize: 13, fontWeight: 800,
              background: 'linear-gradient(90deg,#a78bfa,#06b6d4)',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
            }}>
              Registro
            </div>
          </div>
        )}
      </div>

      {/* ---- Nav ---- */}
      <nav style={{ flex: 1, padding: '12px 8px', display: 'flex', flexDirection: 'column', gap: 4, overflowY: 'auto' }}>
        {NAV_ITEMS.map(({ id, label, icon: Icon }) => {
          const active = currentView === id;
          return (
            <button
              key={id}
              onClick={() => onChangeView(id as ViewType)}
              title={collapsed ? label : undefined}
              className={`nav-item ${active ? 'active' : ''}`}
              style={{ justifyContent: collapsed ? 'center' : 'flex-start', paddingLeft: collapsed ? 0 : undefined }}
            >
              <Icon size={18} style={{ flexShrink: 0 }} />
              {!collapsed && label}
            </button>
          );
        })}
      </nav>

      {/* ---- Bottom ---- */}
      <div style={{ padding: '12px 8px', borderTop: '1px solid rgba(255,255,255,0.05)', flexShrink: 0 }}>
        <button
          className="nav-item"
          style={{ justifyContent: collapsed ? 'center' : 'flex-start' }}
          title={collapsed ? 'Configuración' : undefined}
        >
          <Settings size={17} style={{ flexShrink: 0 }} />
          {!collapsed && 'Configuración'}
        </button>

        {/* Pulse status */}
        {!collapsed && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 14px', marginTop: 4 }}>
            <span style={{
              width: 7, height: 7, borderRadius: '50%',
              background: '#10b981',
              boxShadow: '0 0 6px #10b981',
            }} />
            <span style={{ fontSize: 11, color: '#4a5568' }}>Sistema activo · v1.0</span>
          </div>
        )}

        {/* Collapse toggle */}
        <button
          onClick={() => setCollapsed(p => !p)}
          style={{
            width: '100%', display: 'flex', alignItems: 'center',
            justifyContent: 'center', padding: '8px 0',
            background: 'rgba(255,255,255,0.04)', borderRadius: 10,
            border: 'none', cursor: 'pointer', color: '#94a3b8',
            marginTop: 6, transition: 'background 0.2s',
          }}
          onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.08)')}
          onMouseLeave={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.04)')}
        >
          {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
        </button>
      </div>
    </aside>
  );
}
