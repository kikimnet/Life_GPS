import { useState, useEffect, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { RotateCcw, SkipForward, Play, Pause } from 'lucide-react';

type TimerMode = 'focus' | 'short-break' | 'long-break';

const DURATIONS: Record<TimerMode, number> = {
    'focus': 25 * 60,
    'short-break': 5 * 60,
    'long-break': 15 * 60,
};

const MODE_LABELS: Record<TimerMode, string> = {
    'focus': 'Focus',
    'short-break': 'Pause courte',
    'long-break': 'Pause longue',
};

const TAB_STYLES = (isActive: boolean) => ({
    padding: '8px 20px', borderRadius: '8px', border: 'none',
    background: isActive ? '#6366f1' : 'transparent',
    color: isActive ? '#fff' : '#9ca3af', fontSize: '14px', fontWeight: 500,
    cursor: 'pointer', transition: 'all 0.15s',
});

export const Pomodoro = () => {
    const { missions, pomodoroSessions, addPomodoroSession } = useApp();
    const [mode, setMode] = useState<TimerMode>('focus');
    const [secondsLeft, setSecondsLeft] = useState(DURATIONS['focus']);
    const [isRunning, setIsRunning] = useState(false);
    const [selectedMissionId, setSelectedMissionId] = useState('');
    const [completedCount, setCompletedCount] = useState(0);
    const interval = useRef<ReturnType<typeof setInterval> | null>(null);

    const todayMissions = missions.filter(m => m.date === new Date().toISOString().split('T')[0] && !m.completed);

    useEffect(() => {
        if (isRunning) {
            interval.current = setInterval(() => {
                setSecondsLeft(s => {
                    if (s <= 1) {
                        setIsRunning(false);
                        if (mode === 'focus') {
                            setCompletedCount(c => c + 1);
                            addPomodoroSession({ missionId: selectedMissionId || undefined, duration: DURATIONS['focus'] / 60, type: 'focus' });
                        } else {
                            addPomodoroSession({ duration: DURATIONS[mode] / 60, type: mode });
                        }
                        return 0;
                    }
                    return s - 1;
                });
            }, 1000);
        } else {
            if (interval.current) clearInterval(interval.current);
        }
        return () => { if (interval.current) clearInterval(interval.current); };
    }, [isRunning, mode]);

    const switchMode = (newMode: TimerMode) => {
        setMode(newMode);
        setSecondsLeft(DURATIONS[newMode]);
        setIsRunning(false);
    };

    const reset = () => { setSecondsLeft(DURATIONS[mode]); setIsRunning(false); };
    const skip = () => { switchMode(mode === 'focus' ? 'short-break' : 'focus'); };
    const toggle = () => setIsRunning(r => !r);

    const minutes = Math.floor(secondsLeft / 60);
    const seconds = secondsLeft % 60;
    const timeStr = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

    const progress = 1 - secondsLeft / DURATIONS[mode];
    const circumference = 2 * Math.PI * 140;
    const strokeDashoffset = circumference * (1 - progress);

    const todayFocusSessions = pomodoroSessions.filter(p => p.completedAt.startsWith(new Date().toISOString().split('T')[0]) && p.type === 'focus').length;

    return (
        <div style={{ padding: '32px 40px', minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <div style={{ marginBottom: '32px', textAlign: 'center' }}>
                <p style={{ color: '#6b7280', margin: '0 0 2px', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Quotidien</p>
                <h1 style={{ fontSize: '36px', fontWeight: 800, color: '#fff', margin: '0 0 6px' }}>Pomodoro</h1>
                <p style={{ color: '#6b7280', fontSize: '14px', margin: 0 }}>Sessions de focus au service de vos missions</p>
            </div>

            {/* Mission selector */}
            <div style={{ width: '100%', maxWidth: '480px', marginBottom: '24px' }}>
                <div style={{
                    background: '#1a1a1e', borderRadius: '12px', padding: '14px 18px',
                    border: '1px solid rgba(255,255,255,0.08)', display: 'flex', alignItems: 'center', gap: '10px',
                }}>
                    <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: selectedMissionId ? '#10b981' : 'rgba(255,255,255,0.2)', flexShrink: 0 }} />
                    <select
                        value={selectedMissionId}
                        onChange={e => setSelectedMissionId(e.target.value)}
                        style={{ flex: 1, background: 'transparent', border: 'none', color: selectedMissionId ? '#e5e7eb' : '#6b7280', fontSize: '14px', cursor: 'pointer', fontFamily: 'inherit' }}
                    >
                        <option value="">Aucune mission Deep Work active</option>
                        {todayMissions.map(m => <option key={m.id} value={m.id}>{m.title}</option>)}
                    </select>
                </div>
            </div>

            {/* Mode tabs */}
            <div style={{ display: 'flex', gap: '4px', background: 'rgba(255,255,255,0.04)', borderRadius: '12px', padding: '4px', marginBottom: '40px' }}>
                {(['focus', 'short-break', 'long-break'] as TimerMode[]).map(m => (
                    <button key={m} onClick={() => switchMode(m)} style={TAB_STYLES(mode === m)}>{MODE_LABELS[m]}</button>
                ))}
            </div>

            {/* Timer circle */}
            <div style={{ position: 'relative', width: '300px', height: '300px', marginBottom: '40px' }}>
                <svg viewBox="0 0 300 300" style={{ width: '100%', height: '100%', transform: 'rotate(-90deg)' }}>
                    <circle cx="150" cy="150" r="140" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="8" />
                    <circle cx="150" cy="150" r="140" fill="none" stroke="#6366f1" strokeWidth="8"
                        strokeDasharray={circumference} strokeDashoffset={strokeDashoffset}
                        strokeLinecap="round" style={{ transition: 'stroke-dashoffset 1s linear' }} />
                </svg>
                <div style={{
                    position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column',
                    alignItems: 'center', justifyContent: 'center',
                }}>
                    <div style={{ fontSize: '64px', fontWeight: 800, color: '#fff', fontVariantNumeric: 'tabular-nums' }}>{timeStr}</div>
                    <div style={{ fontSize: '14px', color: '#6b7280', marginTop: '4px' }}>{MODE_LABELS[mode]}</div>
                </div>
            </div>

            {/* Controls */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '32px' }}>
                <button onClick={reset} style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'rgba(255,255,255,0.08)', border: 'none', color: '#9ca3af', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <RotateCcw size={20} />
                </button>
                <button onClick={toggle} style={{
                    width: '64px', height: '64px', borderRadius: '50%', background: '#6366f1', border: 'none',
                    color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    boxShadow: '0 0 20px rgba(99,102,241,0.4)',
                }}>
                    {isRunning ? <Pause size={24} /> : <Play size={24} style={{ marginLeft: '2px' }} />}
                </button>
                <button onClick={skip} style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'rgba(255,255,255,0.08)', border: 'none', color: '#9ca3af', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <SkipForward size={20} />
                </button>
            </div>

            {/* Session dots */}
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '8px' }}>
                {[0, 1, 2, 3].map(i => (
                    <div key={i} style={{
                        width: '10px', height: '10px', borderRadius: '50%',
                        background: i < completedCount % 4 ? '#6366f1' : 'rgba(255,255,255,0.15)',
                    }} />
                ))}
            </div>
            <div style={{ fontSize: '13px', color: '#6b7280' }}>{todayFocusSessions} sessions complétées</div>
        </div>
    );
};
