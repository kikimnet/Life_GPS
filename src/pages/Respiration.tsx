import { useState, useEffect, useRef, useCallback } from 'react';
import { Play, Pause, RotateCcw, Wind } from 'lucide-react';

type BreathPhase = 'inhale' | 'hold-in' | 'exhale' | 'hold-out';
type Technique = '4-7-8' | 'box' | 'coherente';

interface PhaseConfig {
    phase: BreathPhase;
    duration: number;
    label: string;
    color: string;
}

interface TechniqueConfig {
    name: string;
    description: string;
    emoji: string;
    phases: PhaseConfig[];
}

const TECHNIQUES: Record<Technique, TechniqueConfig> = {
    'coherente': {
        name: 'Cohérence Cardiaque',
        description: '5s inspiration, 5s expiration. Synchronise le cœur et le cerveau pour une clarté maximale.',
        emoji: '❤️',
        phases: [
            { phase: 'inhale', duration: 5, label: 'Inspirez', color: '#f472b6' },
            { phase: 'exhale', duration: 5, label: 'Expirez', color: '#34d399' },
        ],
    },
    '4-7-8': {
        name: '4-7-8',
        description: 'Inspirez 4s, retenez 7s, expirez 8s. Idéal pour réduire l\'anxiété rapidement.',
        emoji: '😮‍💨',
        phases: [
            { phase: 'inhale', duration: 4, label: 'Inspirez', color: '#6366f1' },
            { phase: 'hold-in', duration: 7, label: 'Retenez', color: '#a78bfa' },
            { phase: 'exhale', duration: 8, label: 'Expirez', color: '#34d399' },
        ],
    },
    'box': {
        name: 'Respiration Carrée',
        description: '4s chaque phase. Technique utilisée par les forces spéciales pour rester calme sous pression.',
        emoji: '⬜',
        phases: [
            { phase: 'inhale', duration: 4, label: 'Inspirez', color: '#6366f1' },
            { phase: 'hold-in', duration: 4, label: 'Retenez', color: '#a78bfa' },
            { phase: 'exhale', duration: 4, label: 'Expirez', color: '#34d399' },
            { phase: 'hold-out', duration: 4, label: 'Pause', color: '#60a5fa' },
        ],
    },
};

const DURATIONS_MIN = [5, 10, 15];

/* ─── Mutable ref shape (avoids stale-closure bugs in setInterval) ─── */
interface TimerRef {
    phaseIndex: number;
    phaseSecsLeft: number;
    totalSecsLeft: number;
    cycles: number;
}

export const Respiration = () => {
    const [technique, setTechnique] = useState<Technique>('coherente');
    const [durationMin, setDurationMin] = useState(5);
    const [isRunning, setIsRunning] = useState(false);
    const [isFinished, setIsFinished] = useState(false);

    // ── Displayed React state (updated from the ref every tick) ──
    const [totalSecondsLeft, setTotalSecondsLeft] = useState(5 * 60);
    const [phaseIndex, setPhaseIndex] = useState(0);
    const [phaseSecondsLeft, setPhaseSecondsLeft] = useState(TECHNIQUES['coherente'].phases[0].duration);
    const [cycleCount, setCycleCount] = useState(0);

    const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

    // ── Single mutable ref that the interval reads/writes synchronously ──
    const timerRef = useRef<TimerRef>({
        phaseIndex: 0,
        phaseSecsLeft: TECHNIQUES['coherente'].phases[0].duration,
        totalSecsLeft: 5 * 60,
        cycles: 0,
    });

    // ── Get current technique config ──
    const config = TECHNIQUES[technique];
    const currentPhase = config.phases[phaseIndex];

    // ── Reset helper ──
    const resetTimer = useCallback((tech: Technique, mins: number) => {
        const phases = TECHNIQUES[tech].phases;
        timerRef.current = {
            phaseIndex: 0,
            phaseSecsLeft: phases[0].duration,
            totalSecsLeft: mins * 60,
            cycles: 0,
        };
        setPhaseIndex(0);
        setPhaseSecondsLeft(phases[0].duration);
        setTotalSecondsLeft(mins * 60);
        setCycleCount(0);
        setIsFinished(false);
        setIsRunning(false);
    }, []);

    // ── Reset when technique or duration changes (only when not running) ──
    useEffect(() => {
        if (!isRunning) {
            resetTimer(technique, durationMin);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [technique, durationMin]);

    // ── Core interval ──
    useEffect(() => {
        if (!isRunning) {
            if (intervalRef.current) clearInterval(intervalRef.current);
            return;
        }

        intervalRef.current = setInterval(() => {
            const t = timerRef.current;
            const phases = TECHNIQUES[technique].phases;

            // Decrement total
            t.totalSecsLeft -= 1;

            // Decrement phase
            t.phaseSecsLeft -= 1;

            // Advance to next phase when current phase ends
            if (t.phaseSecsLeft <= 0) {
                const nextIndex = (t.phaseIndex + 1) % phases.length;
                if (nextIndex === 0) {
                    t.cycles += 1;
                    setCycleCount(t.cycles);
                }
                t.phaseIndex = nextIndex;
                t.phaseSecsLeft = phases[nextIndex].duration;
                setPhaseIndex(nextIndex);
            }

            // Sync React display state
            setPhaseSecondsLeft(t.phaseSecsLeft);
            setTotalSecondsLeft(t.totalSecsLeft);

            // Finished?
            if (t.totalSecsLeft <= 0) {
                clearInterval(intervalRef.current!);
                setIsRunning(false);
                setIsFinished(true);
            }
        }, 1000);

        return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
    }, [isRunning, technique]);

    const toggle = () => {
        if (isFinished) {
            resetTimer(technique, durationMin);
            return;
        }
        setIsRunning(r => !r);
    };

    const reset = () => resetTimer(technique, durationMin);

    const pickTechnique = (t: Technique) => {
        if (!isRunning) setTechnique(t);
    };

    const pickDuration = (mins: number) => {
        if (!isRunning) setDurationMin(mins);
    };

    // ── Derived visual values ──
    const totalMin = Math.floor(totalSecondsLeft / 60);
    const totalSec = totalSecondsLeft % 60;
    const totalProgress = 1 - totalSecondsLeft / (durationMin * 60);
    const phaseProgress = 1 - phaseSecondsLeft / currentPhase.duration;

    const outerR = 120;
    const innerR = 80;
    const outerC = 2 * Math.PI * outerR;
    const innerC = 2 * Math.PI * innerR;

    // Bubble size cue
    const bubbleSize = (() => {
        if (!isRunning) return 50;
        switch (currentPhase.phase) {
            case 'inhale': return 80;
            case 'hold-in': return 80;
            case 'exhale': return 30;
            case 'hold-out': return 30;
        }
    })();

    return (
        <div style={{ padding: '32px 40px', minHeight: '100vh' }}>
            {/* Header */}
            <div style={{ marginBottom: '28px' }}>
                <p style={{ color: '#6b7280', margin: '0 0 2px', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Quotidien</p>
                <h1 style={{ fontSize: '36px', fontWeight: 800, color: '#fff', margin: '0 0 4px' }}>Respiration</h1>
                <p style={{ color: '#6b7280', fontSize: '14px', margin: 0 }}>Exercices de respiration profonde pour réduire le stress et retrouver la clarté</p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: '32px', alignItems: 'start' }}>
                {/* ── LEFT — Timer ── */}
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '24px' }}>

                    {/* Duration tabs */}
                    <div style={{ display: 'flex', gap: '10px' }}>
                        {DURATIONS_MIN.map(d => (
                            <button key={d} onClick={() => pickDuration(d)} style={{
                                padding: '10px 24px', borderRadius: '12px', fontSize: '15px', fontWeight: 600,
                                cursor: isRunning ? 'not-allowed' : 'pointer',
                                border: `2px solid ${durationMin === d ? '#6366f1' : 'rgba(255,255,255,0.1)'}`,
                                background: durationMin === d ? 'rgba(99,102,241,0.15)' : 'transparent',
                                color: durationMin === d ? '#e5e7eb' : '#9ca3af',
                                opacity: isRunning && durationMin !== d ? 0.35 : 1,
                                transition: 'all 0.15s',
                            }}>{d} min</button>
                        ))}
                    </div>

                    {/* Outer SVG circle — total countdown */}
                    <div style={{ position: 'relative', width: '300px', height: '300px' }}>
                        <svg viewBox="0 0 300 300" style={{ width: '100%', height: '100%', transform: 'rotate(-90deg)' }}>
                            <circle cx="150" cy="150" r={outerR} fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="8" />
                            <circle cx="150" cy="150" r={outerR} fill="none"
                                stroke={isFinished ? '#10b981' : currentPhase.color}
                                strokeWidth="8"
                                strokeDasharray={outerC}
                                strokeDashoffset={outerC * (1 - totalProgress)}
                                strokeLinecap="round"
                                style={{ transition: 'stroke 0.6s ease, stroke-dashoffset 1s linear' }} />
                        </svg>

                        {/* Inner SVG circle — phase countdown */}
                        <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <div style={{ position: 'relative', width: '200px', height: '200px' }}>
                                <svg viewBox="0 0 200 200" style={{ width: '100%', height: '100%', transform: 'rotate(-90deg)' }}>
                                    <circle cx="100" cy="100" r={innerR} fill="none" stroke="rgba(255,255,255,0.04)" strokeWidth="5" />
                                    <circle cx="100" cy="100" r={innerR} fill="none"
                                        stroke={currentPhase.color}
                                        strokeWidth="5"
                                        strokeDasharray={innerC}
                                        strokeDashoffset={innerC * (1 - phaseProgress)}
                                        strokeLinecap="round"
                                        style={{ transition: 'stroke-dashoffset 1s linear, stroke 0.5s ease' }}
                                        opacity={isRunning ? 0.5 : 0.1} />
                                </svg>

                                {/* Center text */}
                                <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '4px' }}>
                                    {isFinished ? (
                                        <>
                                            <div style={{ fontSize: '36px' }}>✅</div>
                                            <div style={{ fontSize: '15px', fontWeight: 700, color: '#10b981' }}>Terminé !</div>
                                        </>
                                    ) : (
                                        <>
                                            <div style={{
                                                fontSize: '42px', fontWeight: 800,
                                                color: isRunning ? currentPhase.color : '#fff',
                                                fontVariantNumeric: 'tabular-nums', lineHeight: 1,
                                                transition: 'color 0.5s ease',
                                            }}>
                                                {String(totalMin).padStart(2, '0')}:{String(totalSec).padStart(2, '0')}
                                            </div>
                                            {isRunning ? (
                                                <>
                                                    <div style={{ fontSize: '15px', fontWeight: 700, color: currentPhase.color, transition: 'color 0.5s ease' }}>
                                                        {currentPhase.label}
                                                    </div>
                                                    <div style={{ fontSize: '26px', fontWeight: 800, color: currentPhase.color, opacity: 0.8 }}>
                                                        {phaseSecondsLeft}s
                                                    </div>
                                                </>
                                            ) : (
                                                <div style={{ fontSize: '13px', color: '#6b7280', marginTop: '4px' }}>
                                                    {totalSecondsLeft === durationMin * 60 ? 'Prêt' : 'En pause'}
                                                </div>
                                            )}
                                        </>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Breathing bubble animation */}
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px', minHeight: '100px', justifyContent: 'center' }}>
                        <div style={{
                            width: `${bubbleSize}px`,
                            height: `${bubbleSize}px`,
                            borderRadius: '50%',
                            background: `radial-gradient(circle, ${currentPhase.color}50, ${currentPhase.color}10)`,
                            border: `2px solid ${currentPhase.color}60`,
                            boxShadow: `0 0 ${bubbleSize / 2}px ${currentPhase.color}30`,
                            transition: 'width 1s ease, height 1s ease, box-shadow 1s ease',
                        }} />
                        {isRunning && (
                            <div style={{ fontSize: '13px', color: currentPhase.color, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', transition: 'color 0.5s ease' }}>
                                {currentPhase.label}
                            </div>
                        )}
                    </div>

                    {/* Controls */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '18px' }}>
                        <button onClick={reset} title="Réinitialiser" style={{
                            width: '50px', height: '50px', borderRadius: '50%', background: 'rgba(255,255,255,0.08)',
                            border: 'none', color: '#9ca3af', cursor: 'pointer',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                        }}>
                            <RotateCcw size={20} />
                        </button>
                        <button onClick={toggle} style={{
                            width: '70px', height: '70px', borderRadius: '50%',
                            background: isFinished ? '#10b981' : 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                            border: 'none', color: '#fff', cursor: 'pointer',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            boxShadow: `0 0 30px ${isFinished ? 'rgba(16,185,129,0.4)' : 'rgba(99,102,241,0.45)'}`,
                            transition: 'background 0.3s',
                        }}>
                            {isFinished ? <Wind size={28} /> : isRunning ? <Pause size={28} /> : <Play size={28} style={{ marginLeft: '3px' }} />}
                        </button>
                    </div>

                    {cycleCount > 0 && (
                        <div style={{ fontSize: '13px', color: '#6b7280' }}>
                            🔄 {cycleCount} cycle{cycleCount > 1 ? 's' : ''} complété{cycleCount > 1 ? 's' : ''}
                        </div>
                    )}
                </div>

                {/* ── RIGHT — Technique selector ── */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    <h2 style={{ fontSize: '13px', fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.1em', margin: '0 0 4px' }}>
                        Technique
                    </h2>

                    {(Object.keys(TECHNIQUES) as Technique[]).map(key => {
                        const t = TECHNIQUES[key];
                        const isSelected = technique === key;
                        return (
                            <button key={key} onClick={() => pickTechnique(key)} style={{
                                background: isSelected ? 'rgba(99,102,241,0.1)' : '#1a1a1e',
                                border: `1px solid ${isSelected ? 'rgba(99,102,241,0.4)' : 'rgba(255,255,255,0.06)'}`,
                                borderRadius: '14px', padding: '18px 20px',
                                cursor: isRunning ? 'not-allowed' : 'pointer', textAlign: 'left',
                                opacity: isRunning && !isSelected ? 0.45 : 1, transition: 'all 0.15s',
                            }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                                    <span style={{ fontSize: '20px' }}>{t.emoji}</span>
                                    <span style={{ fontSize: '14px', fontWeight: 700, color: isSelected ? '#e5e7eb' : '#9ca3af' }}>{t.name}</span>
                                    {isSelected && (
                                        <span style={{ marginLeft: 'auto', fontSize: '11px', background: '#6366f1', color: '#fff', borderRadius: '20px', padding: '2px 10px', fontWeight: 700 }}>
                                            Actif
                                        </span>
                                    )}
                                </div>
                                <p style={{ fontSize: '13px', color: '#6b7280', margin: '0 0 12px', lineHeight: 1.5 }}>{t.description}</p>
                                {/* Phase breakdown pills */}
                                <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                                    {t.phases.map((ph, i) => (
                                        <div key={i} style={{
                                            padding: '4px 10px', borderRadius: '20px', fontSize: '12px', fontWeight: 600,
                                            background: `${ph.color}15`, color: ph.color, border: `1px solid ${ph.color}30`,
                                        }}>
                                            {ph.label} {ph.duration}s
                                        </div>
                                    ))}
                                </div>
                            </button>
                        );
                    })}

                    {/* Tips */}
                    <div style={{ background: '#1a1a1e', borderRadius: '14px', padding: '18px 20px', border: '1px solid rgba(255,255,255,0.06)', marginTop: '4px' }}>
                        <div style={{ fontSize: '13px', fontWeight: 700, color: '#fff', marginBottom: '10px' }}>💡 Conseils</div>
                        <ul style={{ fontSize: '13px', color: '#9ca3af', lineHeight: 1.7, margin: 0, paddingLeft: '16px' }}>
                            <li>Asseyez-vous confortablement, dos droit</li>
                            <li>Respirez par le nez si possible</li>
                            <li>Laissez votre ventre se gonfler en premier</li>
                            <li>Fermez les yeux et concentrez-vous sur le compteur</li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
};
