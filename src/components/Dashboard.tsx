'use client';
import React, { useMemo } from 'react';
import { PhoneCall, PhoneForwarded, PhoneMissed, Clock, TrendingUp } from 'lucide-react';
import {
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer,
  AreaChart, Area, XAxis, YAxis, CartesianGrid
} from 'recharts';

interface DashboardProps { contacts: any[]; }

/* ── Circular Progress Ring ─────────────────────────── */
function Ring({ pct, color, size = 80 }: { pct: number; color: string; size?: number }) {
  const r = (size - 10) / 2;
  const circ = 2 * Math.PI * r;
  const offset = circ - (pct / 100) * circ;
  return (
    <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth={6} />
      <circle
        cx={size / 2} cy={size / 2} r={r} fill="none"
        stroke={color} strokeWidth={6}
        strokeLinecap="round"
        strokeDasharray={circ}
        strokeDashoffset={offset}
        style={{ transition: 'stroke-dashoffset 1.2s cubic-bezier(0.4,0,0.2,1)' }}
      />
    </svg>
  );
}

/* ── Avatar initials ─────────────────────────────────── */
function Avatar({ name }: { name?: string }) {
  const initials = (name || '?').split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
  const colors = ['#7c3aed','#06b6d4','#10b981','#f59e0b','#ef4444','#8b5cf6'];
  const color = colors[(initials.charCodeAt(0) || 0) % colors.length];
  return (
    <span style={{
      width: 32, height: 32, borderRadius: '50%', flexShrink: 0,
      background: `linear-gradient(135deg, ${color}55, ${color}22)`,
      border: `1px solid ${color}55`,
      display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
      fontSize: 11, fontWeight: 700, color,
    }}>{initials}</span>
  );
}

/* ── Status Badge ────────────────────────────────────── */
function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { cls: string; dot: string }> = {
    'CONTESTÓ':    { cls: 'badge badge-green',  dot: '#10b981' },
    'NO CONTESTÓ': { cls: 'badge badge-red',    dot: '#ef4444' },
    'SEGUIMIENTO': { cls: 'badge badge-violet', dot: '#8b5cf6' },
  };
  const s = map[status] || { cls: 'badge badge-gray', dot: '#94a3b8' };
  return (
    <span className={s.cls}>
      <span style={{ width: 5, height: 5, borderRadius: '50%', background: s.dot, display: 'inline-block' }} />
      {status}
    </span>
  );
}

/* ── Custom Tooltip ──────────────────────────────────── */
function ChartTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div style={{
      background: '#1c2333', border: '1px solid rgba(255,255,255,0.07)',
      borderRadius: 10, padding: '10px 14px',
    }}>
      {label && <p style={{ color: '#94a3b8', fontSize: 11, marginBottom: 4 }}>{label}</p>}
      {payload.map((p: any, i: number) => (
        <p key={i} style={{ color: p.color || '#e2e8f0', fontWeight: 700, fontSize: 16 }}>
          {p.value}
        </p>
      ))}
    </div>
  );
}

/* ═══════════════════════════════════════════
   MAIN DASHBOARD
   ═══════════════════════════════════════════ */
export default function Dashboard({ contacts }: DashboardProps) {
  const stats = useMemo(() => {
    let total = 0, contestaron = 0, noContestaron = 0, seguimiento = 0;
    const agentStats: Record<string, number> = {};
    const dayMap: Record<string, { c: number; nc: number; s: number }> = {};

    contacts.forEach(contact => {
      (contact.calls || []).forEach((call: any) => {
        total++;
        if (call.status === 'CONTESTÓ')    { contestaron++; }
        else if (call.status === 'NO CONTESTÓ') { noContestaron++; }
        else if (call.status === 'SEGUIMIENTO') { seguimiento++; }

        const agent = call.agent || 'Sin asignar';
        agentStats[agent] = (agentStats[agent] || 0) + 1;

        const day = new Date(call.createdAt).toLocaleDateString('es', { weekday: 'short' });
        if (!dayMap[day]) dayMap[day] = { c: 0, nc: 0, s: 0 };
        if (call.status === 'CONTESTÓ')    dayMap[day].c++;
        else if (call.status === 'NO CONTESTÓ') dayMap[day].nc++;
        else if (call.status === 'SEGUIMIENTO') dayMap[day].s++;
      });
    });

    const areaData = Object.entries(dayMap).map(([day, v]) => ({
      day, Contestaron: v.c, 'No Contestaron': v.nc, Seguimiento: v.s,
    }));

    const recentCalls = contacts
      .filter(c => c.calls?.length > 0)
      .sort((a, b) => new Date(b.calls[0].createdAt).getTime() - new Date(a.calls[0].createdAt).getTime())
      .slice(0, 6);

    return { total, contestaron, noContestaron, seguimiento, agentStats, areaData, recentCalls };
  }, [contacts]);

  const pct = (v: number) => stats.total ? Math.round((v / stats.total) * 100) : 0;

  const kpis = [
    {
      label: 'Total Llamadas', value: stats.total,
      icon: <PhoneCall size={18} />, color: '#7c3aed',
      ring: 100, suffix: '',
      gradient: 'linear-gradient(135deg, rgba(124,58,237,0.15), rgba(124,58,237,0.03))',
    },
    {
      label: 'Contestaron', value: stats.contestaron,
      icon: <PhoneForwarded size={18} />, color: '#10b981',
      ring: pct(stats.contestaron), suffix: `${pct(stats.contestaron)}%`,
      gradient: 'linear-gradient(135deg, rgba(16,185,129,0.12), rgba(16,185,129,0.03))',
    },
    {
      label: 'No Contestaron', value: stats.noContestaron,
      icon: <PhoneMissed size={18} />, color: '#ef4444',
      ring: pct(stats.noContestaron), suffix: `${pct(stats.noContestaron)}%`,
      gradient: 'linear-gradient(135deg, rgba(239,68,68,0.12), rgba(239,68,68,0.03))',
    },
    {
      label: 'Seguimiento', value: stats.seguimiento,
      icon: <Clock size={18} />, color: '#8b5cf6',
      ring: pct(stats.seguimiento), suffix: `${pct(stats.seguimiento)}%`,
      gradient: 'linear-gradient(135deg, rgba(139,92,246,0.12), rgba(139,92,246,0.03))',
    },
  ];

  const donutData = [
    { name: 'Contestaron',    value: stats.contestaron,   color: '#10b981' },
    { name: 'No Contestaron', value: stats.noContestaron, color: '#ef4444' },
    { name: 'Seguimiento',    value: stats.seguimiento,   color: '#8b5cf6' },
  ].filter(d => d.value > 0);

  /* ── Render ── */
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
        <div>
          <h2 style={{ fontSize: 24, fontWeight: 800, color: '#e2e8f0', letterSpacing: '-0.5px' }}>
            Dashboard
          </h2>
          <p style={{ color: '#64748b', fontSize: 13, marginTop: 3 }}>
            Resumen de actividad del call center
          </p>
        </div>
        <div style={{
          display: 'flex', alignItems: 'center', gap: 6,
          padding: '7px 14px', borderRadius: 999,
          background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.2)',
          fontSize: 12, fontWeight: 600, color: '#10b981',
        }}>
          <TrendingUp size={13} /> En tiempo real
        </div>
      </div>

      {/* KPI Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 14 }}>
        {kpis.map((kpi, i) => (
          <div
            key={i}
            className="glass-card anim-card"
            style={{ padding: 22, background: kpi.gradient }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <div style={{
                  width: 38, height: 38, borderRadius: 10, marginBottom: 14,
                  background: `${kpi.color}22`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: kpi.color,
                }}>
                  {kpi.icon}
                </div>
                <p style={{ fontSize: 32, fontWeight: 900, color: '#f1f5f9', lineHeight: 1, fontVariantNumeric: 'tabular-nums' }}>
                  {kpi.value}
                </p>
                <p style={{ color: '#64748b', fontSize: 12, marginTop: 6, fontWeight: 500 }}>
                  {kpi.label}
                </p>
              </div>
              <div style={{ position: 'relative', display: 'inline-flex' }}>
                <Ring pct={kpi.ring} color={kpi.color} size={72} />
                {kpi.suffix && (
                  <span style={{
                    position: 'absolute', inset: 0,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 11, fontWeight: 700, color: kpi.color,
                  }}>
                    {kpi.suffix}
                  </span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Charts row */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 14 }}>

        {/* Area Chart */}
        <div className="glass-card" style={{ padding: 24 }}>
          <h3 style={{ fontSize: 15, fontWeight: 700, color: '#e2e8f0', marginBottom: 20 }}>
            Tendencia por día
          </h3>
          {stats.areaData.length > 0 ? (
            <div style={{ height: 220 }}>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={stats.areaData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="gC" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#10b981" stopOpacity={0.3} />
                      <stop offset="100%" stopColor="#10b981" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="gR" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#ef4444" stopOpacity={0.3} />
                      <stop offset="100%" stopColor="#ef4444" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="gV" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#8b5cf6" stopOpacity={0.3} />
                      <stop offset="100%" stopColor="#8b5cf6" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
                  <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 11 }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 11 }} />
                  <Tooltip content={<ChartTooltip />} />
                  <Area type="monotone" dataKey="Contestaron"    stroke="#10b981" fill="url(#gC)" strokeWidth={2} dot={false} />
                  <Area type="monotone" dataKey="No Contestaron" stroke="#ef4444" fill="url(#gR)" strokeWidth={2} dot={false} />
                  <Area type="monotone" dataKey="Seguimiento"    stroke="#8b5cf6" fill="url(#gV)" strokeWidth={2} dot={false} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div style={{ height: 220, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#4a5568', fontSize: 13 }}>
              Sin datos para mostrar
            </div>
          )}
          {/* Legend */}
          <div style={{ display: 'flex', gap: 20, marginTop: 14 }}>
            {[{ l: 'Contestaron', c: '#10b981' }, { l: 'No Contestaron', c: '#ef4444' }, { l: 'Seguimiento', c: '#8b5cf6' }].map(x => (
              <div key={x.l} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, color: '#64748b' }}>
                <span style={{ width: 10, height: 3, borderRadius: 2, background: x.c, display: 'inline-block' }} /> {x.l}
              </div>
            ))}
          </div>
        </div>

        {/* Donut Chart */}
        <div className="glass-card" style={{ padding: 24, display: 'flex', flexDirection: 'column' }}>
          <h3 style={{ fontSize: 15, fontWeight: 700, color: '#e2e8f0', marginBottom: 16 }}>
            Distribución
          </h3>
          {donutData.length > 0 ? (
            <>
              <div style={{ height: 190 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={donutData} cx="50%" cy="50%"
                      innerRadius={60} outerRadius={85}
                      paddingAngle={3} dataKey="value"
                      stroke="none"
                    >
                      {donutData.map((entry, i) => (
                        <Cell key={i} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip content={<ChartTooltip />} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 'auto' }}>
                {donutData.map(d => (
                  <div key={d.name} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{ width: 10, height: 10, borderRadius: 3, background: d.color, display: 'inline-block' }} />
                      <span style={{ fontSize: 12, color: '#94a3b8' }}>{d.name}</span>
                    </div>
                    <span style={{ fontSize: 12, fontWeight: 700, color: '#e2e8f0' }}>{d.value}</span>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#4a5568', fontSize: 13 }}>
              Sin datos para mostrar
            </div>
          )}
        </div>
      </div>

      {/* Recent Calls Table */}
      <div className="glass-card" style={{ overflow: 'hidden' }}>
        <div style={{ padding: '18px 22px', borderBottom: '1px solid rgba(255,255,255,0.06)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3 style={{ fontSize: 15, fontWeight: 700, color: '#e2e8f0' }}>Llamadas Recientes</h3>
          <span className="badge badge-gray">{stats.recentCalls.length} registros</span>
        </div>
        <div style={{ overflowX: 'auto' }}>
          <table className="dark-table">
            <thead>
              <tr>
                <th>Cliente</th>
                <th>Número</th>
                <th>Agente</th>
                <th>Fecha</th>
                <th style={{ textAlign: 'center' }}>Duración</th>
                <th>Estado</th>
              </tr>
            </thead>
            <tbody>
              {stats.recentCalls.map((contact, i) => {
                const call = contact.calls[0];
                return (
                  <tr key={i}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <Avatar name={contact.name} />
                        <span style={{ color: '#e2e8f0', fontWeight: 500 }}>{contact.name || 'Desconocido'}</span>
                      </div>
                    </td>
                    <td style={{ fontFamily: 'monospace', color: '#a78bfa', fontSize: 12 }}>{contact.phone}</td>
                    <td>{call.agent || '—'}</td>
                    <td style={{ fontSize: 12 }}>{new Date(call.createdAt).toLocaleString('es')}</td>
                    <td style={{ textAlign: 'center', fontFamily: 'monospace', fontSize: 12 }}>
                      {call.duration
                        ? `${Math.floor(call.duration / 60)}:${(call.duration % 60).toString().padStart(2, '0')}`
                        : '—'}
                    </td>
                    <td><StatusBadge status={call.status} /></td>
                  </tr>
                );
              })}
              {stats.recentCalls.length === 0 && (
                <tr>
                  <td colSpan={6} style={{ textAlign: 'center', padding: '48px 0', color: '#4a5568' }}>
                    No hay llamadas recientes
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
