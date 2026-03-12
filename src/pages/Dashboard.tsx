import { useApp } from '../context/AppContext';
import { Zap, Plus } from 'lucide-react';

const DAYS_FR = ['LU', 'MA', 'ME', 'JE', 'VE', 'SA', 'DI'];

const StatCard = ({ label, value, sub, color }: { label: string; value: string; sub?: string; color?: string }) => (
    <div style={{ background: '#1a1a1e', borderRadius: '12px', padding: '20px 24px', border: '1px solid rgba(255,255,255,0.06)' }}>
        <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{label}</div>
        <div style={{ fontSize: '32px', fontWeight: 700, color: color ?? '#fff', lineHeight: 1 }}>{value}</div>
        {sub && <div style={{ fontSize: '12px', color: '#10b981', marginTop: '6px' }}>{sub}</div>}
    </div>
);

function RadarChart({ domains }: { domains: Array<{ name: string; value: number }> }) {
    const cx = 150, cy = 150, r = 100;
    const n = domains.length;
    const points = domains.map((d, i) => {
        const angle = (i / n) * 2 * Math.PI - Math.PI / 2;
        const val = d.value / 100;
        return {
            x: cx + r * val * Math.cos(angle),
            y: cy + r * val * Math.sin(angle),
            lx: cx + (r + 24) * Math.cos(angle),
            ly: cy + (r + 24) * Math.sin(angle),
            name: d.name,
        };
    });
    const gridPoints = (scale: number) => domains.map((_, i) => {
        const angle = (i / n) * 2 * Math.PI - Math.PI / 2;
        return `${cx + r * scale * Math.cos(angle)},${cy + r * scale * Math.sin(angle)}`;
    }).join(' ');

    return (
        <svg viewBox="0 0 300 300" style={{ width: '100%', maxWidth: '280px', margin: '0 auto', display: 'block' }}>
            {[0.25, 0.5, 0.75, 1].map(s => (
                <polygon key={s} points={gridPoints(s)} fill="none" stroke="rgba(255,255,255,0.07)" strokeWidth="1" />
            ))}
            {domains.map((_, i) => {
                const angle = (i / n) * 2 * Math.PI - Math.PI / 2;
                return <line key={i} x1={cx} y1={cy} x2={cx + r * Math.cos(angle)} y2={cy + r * Math.sin(angle)} stroke="rgba(255,255,255,0.07)" strokeWidth="1" />;
            })}
            <polygon points={points.map(p => `${p.x},${p.y}`).join(' ')} fill="rgba(99,102,241,0.2)" stroke="#6366f1" strokeWidth="2" />
            {points.map((p, i) => (
                <circle key={i} cx={p.x} cy={p.y} r="4" fill="#6366f1" />
            ))}
            {points.map((p, i) => (
                <text key={i} x={p.lx} y={p.ly} textAnchor="middle" dominantBaseline="middle" fontSize="9" fill="#9ca3af" fontFamily="Inter, sans-serif">
                    {domains[i].name.split(' ')[0].toUpperCase()}
                </text>
            ))}
        </svg>
    );
}

export const Dashboard = () => {
    const { objectives, systems, missions, getCurrentWeekFocus, getDomainProgress, getWeeklyStats, isMVDMode, toggleMVDMode, checkHabit, getHabitStatus, getWIPStatus } = useApp();
    const focus = getCurrentWeekFocus();
    const stats = getWeeklyStats();
    const todayStr = new Date().toISOString().split('T')[0];
    const todayMissions = missions.filter(m => m.date === todayStr);

    const domainData = [
        { name: 'Carrière', value: getDomainProgress('Carrière') },
        { name: 'Finance', value: getDomainProgress('Finance') },
        { name: 'Famille et amis', value: getDomainProgress('Famille et amis') },
        { name: 'Développement personnel', value: getDomainProgress('Développement personnel') },
        { name: 'Spiritualité', value: getDomainProgress('Spiritualité') },
        { name: 'Santé et bien être', value: getDomainProgress('Santé et bien être') },
    ];

    const todayDate = new Date().toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });

    const wip = getWIPStatus();

    return (
        <div style={{ padding: '32px 40px', minHeight: '100vh' }}>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '28px' }}>
                <div>
                    <h1 style={{ fontSize: '36px', fontWeight: 800, color: '#fff', margin: 0 }}>Dashboard</h1>
                    <p style={{ color: '#6b7280', margin: '4px 0 0', fontSize: '13px', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                        {todayDate.toUpperCase()}
                    </p>
                </div>
                <button style={{
                    display: 'flex', alignItems: 'center', gap: '8px',
                    background: '#6366f1', color: '#fff', border: 'none', borderRadius: '10px',
                    padding: '10px 18px', fontSize: '14px', fontWeight: 600, cursor: 'pointer',
                }}>
                    <Plus size={16} /> Nouvelle entrée
                </button>
            </div>

            {/* Focus Banner */}
            {focus && (
                <div style={{
                    background: 'linear-gradient(135deg, rgba(99,102,241,0.15), rgba(139,92,246,0.1))',
                    border: '1px solid rgba(99,102,241,0.3)',
                    borderRadius: '14px', padding: '20px 24px', marginBottom: '24px',
                    display: 'flex', alignItems: 'center', gap: '16px',
                }}>
                    <div style={{ width: '44px', height: '44px', background: 'rgba(234,179,8,0.2)', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <Zap size={22} color="#fbbf24" />
                    </div>
                    <div style={{ flex: 1 }}>
                        <div style={{ fontSize: '11px', fontWeight: 700, color: '#6366f1', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '4px' }}>Focus de la semaine</div>
                        <div style={{ fontSize: '18px', fontWeight: 700, color: '#fff' }}>{focus.priority}</div>
                    </div>
                    <div style={{ display: 'flex', gap: '6px' }}>
                        {DAYS_FR.map((d, i) => (
                            <div key={d} style={{
                                width: '30px', height: '30px', borderRadius: '6px', fontSize: '11px', fontWeight: 700,
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                background: i === new Date().getDay() - 1 || (i === 6 && new Date().getDay() === 0) ? '#6366f1' : 'rgba(255,255,255,0.08)',
                                color: i === new Date().getDay() - 1 || (i === 6 && new Date().getDay() === 0) ? '#fff' : '#6b7280',
                            }}>{d}</div>
                        ))}
                    </div>
                </div>
            )}

            {/* Stats Row */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '24px' }}>
                <StatCard label="Score global de constance" value={`${stats.consistency}%`} sub={`↗+${stats.consistency}%`} />
                <StatCard label="Taux d'exécution hebdomadaire" value={`${stats.executionRate}%`} sub={`↗+${stats.executionRate}%`} />

                {/* WIP Card */}
                <div style={{
                    background: '#1a1a1e', borderRadius: '12px', padding: '20px 24px',
                    border: `1px solid ${wip.exceeded ? 'rgba(239,68,68,0.3)' : wip.count === wip.limit ? 'rgba(245,158,11,0.2)' : 'rgba(255,255,255,0.06)'}`,
                }}>
                    <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>WIP — Objectifs Actifs</div>
                    <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px', marginBottom: '10px' }}>
                        <div style={{ fontSize: '32px', fontWeight: 700, color: wip.color, lineHeight: 1 }}>{wip.count}</div>
                        <div style={{ fontSize: '18px', color: '#6b7280' }}>/ {wip.limit}</div>
                    </div>
                    <div style={{ height: '5px', background: 'rgba(255,255,255,0.08)', borderRadius: '3px', marginBottom: '6px' }}>
                        <div style={{ height: '100%', width: `${wip.pct}%`, background: wip.color, borderRadius: '3px', transition: 'width 0.4s ease' }} />
                    </div>
                    <div style={{ fontSize: '11px', color: wip.color, fontWeight: 600 }}>{wip.label}</div>
                </div>

                <StatCard label="Score Focus du jour" value={`${stats.focusScore}%`} sub="0 session" color={stats.focusScore > 0 ? '#f59e0b' : '#fff'} />
            </div>

            {/* Main Content */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '20px' }}>
                {/* Left Column */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    {/* Systèmes du Jour */}
                    <div style={{ background: '#1a1a1e', borderRadius: '14px', padding: '24px', border: '1px solid rgba(255,255,255,0.06)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                            <div>
                                <h2 style={{ fontSize: '18px', fontWeight: 700, color: '#fff', margin: 0 }}>Systèmes du jour</h2>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <span style={{ fontSize: '12px', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Mode Minimum Viable Day</span>
                                <button
                                    onClick={toggleMVDMode}
                                    style={{
                                        width: '40px', height: '22px', borderRadius: '11px',
                                        background: isMVDMode ? '#6366f1' : 'rgba(255,255,255,0.15)',
                                        border: 'none', cursor: 'pointer', position: 'relative', transition: 'background 0.2s',
                                    }}
                                >
                                    <div style={{
                                        position: 'absolute', top: '3px',
                                        left: isMVDMode ? '21px' : '3px',
                                        width: '16px', height: '16px', borderRadius: '50%', background: '#fff',
                                        transition: 'left 0.2s',
                                    }} />
                                </button>
                            </div>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                            {systems.filter(s => s.isActive).map(system => {
                                const status = getHabitStatus(system.id, todayStr);
                                const isDone = status === 'done';
                                return (
                                    <div key={system.id} style={{
                                        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                                        padding: '14px 16px', background: 'rgba(255,255,255,0.03)', borderRadius: '10px',
                                        border: `1px solid ${isDone ? 'rgba(16,185,129,0.3)' : 'rgba(255,255,255,0.06)'}`,
                                    }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                            <button
                                                onClick={() => checkHabit(system.id, todayStr, isDone ? 'missed' : 'done')}
                                                style={{
                                                    width: '22px', height: '22px', borderRadius: '50%',
                                                    border: `2px solid ${isDone ? '#10b981' : 'rgba(255,255,255,0.25)'}`,
                                                    background: isDone ? '#10b981' : 'transparent',
                                                    cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                    flexShrink: 0,
                                                }}
                                            >
                                                {isDone && <svg width="10" height="8" viewBox="0 0 10 8"><path d="M1 4l3 3 5-6" stroke="#fff" strokeWidth="1.5" fill="none" strokeLinecap="round" /></svg>}
                                            </button>
                                            <div>
                                                <div style={{ fontSize: '14px', fontWeight: 500, color: isDone ? '#6b7280' : '#e5e7eb', textDecoration: isDone ? 'line-through' : 'none' }}>
                                                    {system.name}
                                                </div>
                                                <div style={{ fontSize: '12px', color: '#6b7280' }}>
                                                    {isMVDMode ? system.minDescription : `${system.normalDuration} min`} • {system.objectiveId ? (systems.find(s => s.id === system.objectiveId) || system).name : 'Santé et bien être'}
                                                </div>
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => checkHabit(system.id, todayStr, status === 'minimum' ? 'missed' : 'minimum')}
                                            style={{
                                                width: '22px', height: '22px', borderRadius: '50%',
                                                border: `2px solid ${status === 'minimum' ? '#6366f1' : 'rgba(255,255,255,0.15)'}`,
                                                background: status === 'minimum' ? 'rgba(99,102,241,0.2)' : 'transparent',
                                                cursor: 'pointer',
                                            }}
                                        />
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Prochains Jalons */}
                    <div style={{ background: '#1a1a1e', borderRadius: '14px', padding: '24px', border: '1px solid rgba(255,255,255,0.06)' }}>
                        <h2 style={{ fontSize: '18px', fontWeight: 700, color: '#fff', margin: '0 0 16px' }}>Prochains Jalons</h2>
                        {objectives.filter(o => o.status === 'actif').map(obj => (
                            <div key={obj.id} style={{ marginBottom: '16px' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                                    <span style={{ fontSize: '14px', fontWeight: 500, color: '#e5e7eb' }}>{obj.title}</span>
                                    <span style={{ fontSize: '12px', color: '#6b7280' }}>→ {obj.targetDate}</span>
                                </div>
                                <div style={{ height: '4px', background: 'rgba(255,255,255,0.08)', borderRadius: '2px' }}>
                                    <div style={{ height: '100%', width: `${obj.progress}%`, background: '#6366f1', borderRadius: '2px', transition: 'width 0.3s' }} />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Right Column */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    {/* Radar */}
                    <div style={{ background: '#1a1a1e', borderRadius: '14px', padding: '24px', border: '1px solid rgba(255,255,255,0.06)' }}>
                        <h2 style={{ fontSize: '16px', fontWeight: 700, color: '#fff', margin: '0 0 16px' }}>Radar des Progrès</h2>
                        <RadarChart domains={domainData} />
                    </div>

                    {/* Today's Missions */}
                    {todayMissions.length > 0 && (
                        <div style={{ background: '#1a1a1e', borderRadius: '14px', padding: '24px', border: '1px solid rgba(255,255,255,0.06)' }}>
                            <h2 style={{ fontSize: '16px', fontWeight: 700, color: '#fff', margin: '0 0 16px' }}>Missions Deep Work</h2>
                            {todayMissions.map(m => (
                                <div key={m.id} style={{
                                    padding: '12px', borderRadius: '8px', marginBottom: '8px',
                                    background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)',
                                    display: 'flex', alignItems: 'center', gap: '10px',
                                }}>
                                    <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: m.completed ? '#10b981' : '#6366f1', flexShrink: 0 }} />
                                    <span style={{ fontSize: '13px', color: m.completed ? '#6b7280' : '#e5e7eb', textDecoration: m.completed ? 'line-through' : 'none' }}>{m.title}</span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
