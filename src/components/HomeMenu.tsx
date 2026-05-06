'use client';
import React from 'react';
import { LayoutDashboard, Phone, FileUp, Headphones, TrendingUp, Users, ArrowRight } from 'lucide-react';
import type { ViewType } from '@/app/page';

interface HomeMenuProps {
  onSelect: (view: ViewType) => void;
  contacts: any[];
}

const CARDS = [
  {
    id: 'dashboard' as ViewType,
    label: 'Dashboard',
    description: 'Visualiza métricas en tiempo real, gráficos de tendencia y rendimiento del equipo.',
    icon: LayoutDashboard,
    gradient: 'linear-gradient(135deg, #7c3aed 0%, #4f46e5 100%)',
    glow: 'rgba(124,58,237,0.35)',
    accent: '#a78bfa',
    bg: 'rgba(124,58,237,0.08)',
  },
  {
    id: 'llamadas' as ViewType,
    label: 'Llamadas',
    description: 'Gestiona contactos, registra llamadas, filtra por estado y exporta reportes.',
    icon: Phone,
    gradient: 'linear-gradient(135deg, #06b6d4 0%, #0ea5e9 100%)',
    glow: 'rgba(6,182,212,0.35)',
    accent: '#67e8f9',
    bg: 'rgba(6,182,212,0.08)',
  },
  {
    id: 'importar' as ViewType,
    label: 'Importar CSV',
    description: 'Carga masivamente prospectos desde un archivo CSV con drag & drop.',
    icon: FileUp,
    gradient: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
    glow: 'rgba(16,185,129,0.35)',
    accent: '#6ee7b7',
    bg: 'rgba(16,185,129,0.08)',
  },
];

export default function HomeMenu({ onSelect, contacts }: HomeMenuProps) {
  // Quick stats for the hero
  const totalCalls = contacts.reduce((acc, c) => acc + (c.calls?.length || 0), 0);
  const totalContacts = contacts.length;
  const answered = contacts.reduce((acc, c) => acc + (c.calls?.filter((cl: any) => cl.status === 'CONTESTÓ').length || 0), 0);
  const rate = totalCalls > 0 ? Math.round((answered / totalCalls) * 100) : 0;

  return (
    <div style={{
      minHeight: '100vh',
      background: '#0f1117',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '40px 24px',
      position: 'relative',
      overflow: 'hidden',
    }}>

      {/* Background ambient orbs */}
      <div style={{
        position: 'absolute', top: '10%', left: '15%',
        width: 500, height: 500, borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(124,58,237,0.12) 0%, transparent 70%)',
        pointerEvents: 'none',
      }} />
      <div style={{
        position: 'absolute', bottom: '10%', right: '10%',
        width: 400, height: 400, borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(6,182,212,0.10) 0%, transparent 70%)',
        pointerEvents: 'none',
      }} />

      {/* ── Logo & Title ── */}
      <div style={{ textAlign: 'center', marginBottom: 56, animation: 'fadeInUp 0.5s ease' }}>
        <div style={{
          width: 72, height: 72, borderRadius: 20, margin: '0 auto 20px',
          background: 'linear-gradient(135deg,#7c3aed,#06b6d4)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: '0 8px 32px rgba(124,58,237,0.4)',
        }}>
          <Headphones size={34} color="#fff" />
        </div>

        <h1 style={{
          fontSize: 40, fontWeight: 900, letterSpacing: '-1px',
          background: 'linear-gradient(135deg, #e2e8f0 30%, #a78bfa 70%, #67e8f9)',
          WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
          lineHeight: 1.15, marginBottom: 14,
        }}>
          Asistente de Registro
        </h1>
        <p style={{ color: '#64748b', fontSize: 16, maxWidth: 420, lineHeight: 1.7, margin: '0 auto' }}>
          Sistema de gestión de llamadas para call center. Selecciona un módulo para comenzar.
        </p>
      </div>

      {/* ── Quick Stats ── */}
      <div style={{
        display: 'flex', gap: 20, marginBottom: 52,
        animation: 'fadeInUp 0.5s 0.1s ease both',
        flexWrap: 'wrap', justifyContent: 'center',
      }}>
        {[
          { icon: Users, label: 'Contactos', value: totalContacts, color: '#a78bfa' },
          { icon: Phone, label: 'Llamadas totales', value: totalCalls, color: '#67e8f9' },
          { icon: TrendingUp, label: 'Tasa de respuesta', value: `${rate}%`, color: '#6ee7b7' },
        ].map((stat, i) => (
          <div key={i} style={{
            display: 'flex', alignItems: 'center', gap: 12,
            padding: '12px 22px', borderRadius: 14,
            background: 'rgba(255,255,255,0.03)',
            border: '1px solid rgba(255,255,255,0.07)',
          }}>
            <div style={{ color: stat.color }}>
              <stat.icon size={18} />
            </div>
            <div>
              <div style={{ fontSize: 20, fontWeight: 800, color: stat.color, lineHeight: 1 }}>{stat.value}</div>
              <div style={{ fontSize: 11, color: '#4a5568', marginTop: 3 }}>{stat.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* ── Menu Cards ── */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 320px)',
        gap: 20,
        maxWidth: 1020,
        width: '100%',
        animation: 'fadeInUp 0.5s 0.18s ease both',
      }}>
        {CARDS.map((card) => {
          const Icon = card.icon;
          return (
            <button
              key={card.id}
              id={`menu-card-${card.id}`}
              onClick={() => onSelect(card.id)}
              style={{
                background: 'rgba(28,35,51,0.7)',
                backdropFilter: 'blur(16px)',
                border: '1px solid rgba(255,255,255,0.07)',
                borderRadius: 20,
                padding: 28,
                textAlign: 'left',
                cursor: 'pointer',
                transition: 'all 0.25s cubic-bezier(0.4,0,0.2,1)',
                display: 'flex',
                flexDirection: 'column',
                gap: 16,
                position: 'relative',
                overflow: 'hidden',
              }}
              onMouseEnter={e => {
                const el = e.currentTarget;
                el.style.transform = 'translateY(-6px)';
                el.style.border = `1px solid ${card.accent}44`;
                el.style.boxShadow = `0 20px 48px ${card.glow}, 0 0 0 1px ${card.accent}22`;
              }}
              onMouseLeave={e => {
                const el = e.currentTarget;
                el.style.transform = 'translateY(0)';
                el.style.border = '1px solid rgba(255,255,255,0.07)';
                el.style.boxShadow = 'none';
              }}
            >
              {/* Ambient top glow */}
              <div style={{
                position: 'absolute', top: 0, left: 0, right: 0, height: 3,
                background: card.gradient, borderRadius: '20px 20px 0 0',
                opacity: 0.8,
              }} />

              {/* Icon */}
              <div style={{
                width: 52, height: 52, borderRadius: 14,
                background: card.bg,
                border: `1px solid ${card.accent}33`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: card.accent,
              }}>
                <Icon size={24} />
              </div>

              {/* Text */}
              <div>
                <h3 style={{
                  fontSize: 18, fontWeight: 700, color: '#e2e8f0',
                  marginBottom: 8, letterSpacing: '-0.3px',
                }}>
                  {card.label}
                </h3>
                <p style={{ fontSize: 13, color: '#64748b', lineHeight: 1.65 }}>
                  {card.description}
                </p>
              </div>

              {/* CTA */}
              <div style={{
                display: 'flex', alignItems: 'center', gap: 6,
                marginTop: 4, fontSize: 12, fontWeight: 600,
                color: card.accent,
              }}>
                Abrir módulo <ArrowRight size={13} />
              </div>
            </button>
          );
        })}
      </div>

      {/* Footer */}
      <p style={{ marginTop: 52, fontSize: 12, color: '#334155', animation: 'fadeInUp 0.5s 0.3s ease both' }}>
        Asistente de Registro · v1.0.0
      </p>
    </div>
  );
}
