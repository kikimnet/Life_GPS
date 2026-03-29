import { useState } from 'react';
import { useApp } from '../context/AppContext';
import { useUnsavedChanges } from '../hooks/useUnsavedChanges';
import { ChevronLeft, ChevronRight, Zap } from 'lucide-react';

const DAYS_LABELS = ['LUN', 'MAR', 'MER', 'JEU', 'VEN', 'SAM', 'DIM'];

function getDateRange(weekOffset: number) {
    const now = new Date();
    const dayOfWeek = now.getDay();
    const monday = new Date(now);
    monday.setDate(now.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1) + weekOffset * 7);
    return Array.from({ length: 7 }, (_, i) => {
        const d = new Date(monday);
        d.setDate(monday.getDate() + i);
        return d.toISOString().split('T')[0];
    });
}

function getActivityGrid(weekOffset: number) {
    const weeks = 10;
    const today = new Date();
    const startDate = new Date(today);
    startDate.setDate(today.getDate() - weeks * 7);
    const dates: string[] = [];
    for (let i = 0; i < weeks * 7; i++) {
        const d = new Date(startDate);
        d.setDate(startDate.getDate() + i);
        dates.push(d.toISOString().split('T')[0]);
    }
    return dates;
}

export const Suivi = () => {
    const { systems, getHabitStatus, checkHabit, isMVDMode, toggleMVDMode } = useApp();
    const [weekOffset, setWeekOffset] = useState(0);
    const dates = getDateRange(weekOffset);
    const todayStr = new Date().toISOString().split('T')[0];

    useUnsavedChanges(false); // auto-save toggles, no pending changes

    const totalToday = systems.filter(s => s.isActive).length;
    const doneToday = systems.filter(s => s.isActive && getHabitStatus(s.id, todayStr) === 'done').length;

    const activityDates = getActivityGrid(weekOffset);

    const getDotColor = (systemId: string, date: string) => {
        const s = getHabitStatus(systemId, date);
        if (s === 'done') return '#10b981';
        if (s === 'minimum') return '#6366f1';
        if (s === 'missed') return '#ef4444';
        return 'rgba(255,255,255,0.06)';
    };

    const getActivityCell = (date: string) => {
        const done = systems.filter(s => s.isActive && getHabitStatus(s.id, date) === 'done').length;
        const min = systems.filter(s => s.isActive && getHabitStatus(s.id, date) === 'minimum').length;
        const total = systems.filter(s => s.isActive).length;
        if (total === 0) return '#1a1a1e';
        if (date > todayStr) return 'rgba(255,255,255,0.03)';
        if (done + min === total) return '#10b981';
        if (done + min > 0) return '#6366f1';
        return 'rgba(255,255,255,0.08)';
    };

    const isToday = (date: string) => date === todayStr;

    return (
        <div style={{ padding: '32px 40px', minHeight: '100vh' }}>
            <div style={{ marginBottom: '28px' }}>
                <p style={{ color: '#6b7280', margin: '0 0 2px', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Quotidien</p>
                <h1 style={{ fontSize: '36px', fontWeight: 800, color: '#fff', margin: 0 }}>Suivi des habitudes</h1>
            </div>

            {/* Week nav */}
            <div style={{ background: '#1a1a1e', borderRadius: '14px', padding: '20px 24px', border: '1px solid rgba(255,255,255,0.06)', marginBottom: '20px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                    <button onClick={() => setWeekOffset(w => w - 1)} style={{ background: 'none', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#9ca3af', cursor: 'pointer', padding: '6px 8px' }}>
                        <ChevronLeft size={18} />
                    </button>
                    <div style={{ textAlign: 'center' }}>
                        <div style={{ fontSize: '16px', fontWeight: 700, color: '#fff' }}>
                            {weekOffset === 0 ? "Aujourd'hui" : weekOffset < 0 ? `Il y a ${Math.abs(weekOffset)} semaine(s)` : `Dans ${weekOffset} semaine(s)`}
                        </div>
                        <div style={{ fontSize: '13px', color: '#6b7280' }}>{doneToday}/{totalToday} complétées</div>
                    </div>
                    <button onClick={() => setWeekOffset(w => w + 1)} style={{ background: 'none', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#9ca3af', cursor: 'pointer', padding: '6px 8px' }}>
                        <ChevronRight size={18} />
                    </button>
                </div>
            </div>

            {/* MVD toggle */}
            <div style={{
                background: '#1a1a1e', borderRadius: '12px', padding: '16px 20px',
                border: '1px solid rgba(255,255,255,0.06)', marginBottom: '16px',
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <Zap size={18} color="#f59e0b" />
                    <div>
                        <div style={{ fontSize: '14px', fontWeight: 600, color: '#fff' }}>Mode Minimum Viable Day</div>
                        <div style={{ fontSize: '12px', color: '#6b7280' }}>Journée difficile ? Faites le minimum.</div>
                    </div>
                </div>
                <button onClick={toggleMVDMode} style={{
                    width: '44px', height: '24px', borderRadius: '12px',
                    background: isMVDMode ? '#6366f1' : 'rgba(255,255,255,0.15)',
                    border: 'none', cursor: 'pointer', position: 'relative', transition: 'background 0.2s',
                }}>
                    <div style={{ position: 'absolute', top: '4px', left: isMVDMode ? '23px' : '4px', width: '16px', height: '16px', borderRadius: '50%', background: '#fff', transition: 'left 0.2s' }} />
                </button>
            </div>

            {/* Habits list */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '28px' }}>
                {systems.filter(s => s.isActive).map((s) => {
                    const status = getHabitStatus(s.id, todayStr);
                    const isDone = status === 'done';
                    return (
                        <div key={s.id} style={{
                            background: '#1a1a1e', borderRadius: '12px', padding: '16px 20px',
                            border: `1px solid ${isDone ? 'rgba(16,185,129,0.2)' : 'rgba(255,255,255,0.06)'}`,
                            display: 'flex', alignItems: 'center', gap: '14px',
                            cursor: 'pointer',
                        }}
                            onClick={() => checkHabit(s.id, todayStr, isDone ? 'missed' : 'done')}
                        >
                            <button style={{
                                width: '24px', height: '24px', borderRadius: '50%',
                                border: `2px solid ${isDone ? '#10b981' : 'rgba(255,255,255,0.2)'}`,
                                background: isDone ? '#10b981' : 'transparent', cursor: 'pointer',
                                display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                            }}>
                                {isDone && <svg width="11" height="8" viewBox="0 0 11 8"><path d="M1 4l3 3 6-6" stroke="#fff" strokeWidth="1.5" fill="none" strokeLinecap="round" /></svg>}
                            </button>
                            <div style={{ flex: 1 }}>
                                <div style={{ fontSize: '15px', fontWeight: 500, color: isDone ? '#6b7280' : '#e5e7eb', textDecoration: isDone ? 'line-through' : 'none' }}>
                                    {s.name}
                                </div>
                                <div style={{ fontSize: '12px', color: '#6b7280' }}>
                                    {isMVDMode ? s.minDescription : `${s.normalDuration} min`}
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Activity grid */}
            <div style={{ background: '#1a1a1e', borderRadius: '14px', padding: '24px', border: '1px solid rgba(255,255,255,0.06)' }}>
                <div style={{ fontSize: '11px', fontWeight: 700, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '16px' }}>
                    Activité — 10 Dernières Semaines
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: `repeat(${Math.ceil(activityDates.length / 7)}, 1fr)`, gap: '3px' }}>
                    {activityDates.map(date => (
                        <div key={date} title={date} style={{
                            width: '12px', height: '12px', borderRadius: '3px',
                            background: getActivityCell(date),
                            outline: isToday(date) ? '2px solid #6366f1' : 'none',
                        }} />
                    ))}
                </div>
                <div style={{ display: 'flex', gap: '16px', marginTop: '12px', fontSize: '12px', color: '#6b7280' }}>
                    <span>🟢 Complété</span>
                    <span>🟣 Min. Viable Day</span>
                    <span>⬜ Manqué</span>
                </div>
            </div>
        </div>
    );
};
