import { useState } from 'react';
import { useApp, MENTAL_LEVELS, type MentalLevel } from '../context/AppContext';
import { Plus, X, Clock, Target as TargetIcon, Zap, Info } from 'lucide-react';

const LEVEL_TOOLTIPS: Record<MentalLevel, { description: string; examples: string[] }> = {
    5: {
        description: 'Réflexion à long terme, vision systémique, création de sens et de direction.',
        examples: ['Définir sa mission de vie', 'Imaginer un business dans 10 ans', 'Écrire sa vision d\'avenir', 'Repenser son modèle de valeurs'],
    },
    4: {
        description: 'Planification, prise de décision complexe, arbitrages stratégiques.',
        examples: ['Construire une roadmap trimestrielle', 'Choisir entre deux offres de carrière', 'Définir les priorités annuelles', 'Concevoir une stratégie go-to-market'],
    },
    3: {
        description: 'Traitement d\'information, résolution de problèmes, apprentissage actif.',
        examples: ['Analyser un rapport financier', 'Lire et synthétiser un livre', 'Déboguer un problème complexe', 'Rédiger une étude comparative'],
    },
    2: {
        description: 'Exécution directe, implémentation, travail de production concentré.',
        examples: ['Coder une fonctionnalité', 'Écrire un rapport', 'Préparer une présentation', 'Répondre aux emails importants'],
    },
    1: {
        description: 'Tâches routinières à faible charge cognitive, gestion administrative.',
        examples: ['Classer des documents', 'Mettre à jour un tableau', 'Répondre à des emails simples', 'Planifier son agenda'],
    },
};

const initialForm = { title: '', details: '', mentalLevel: 3 as MentalLevel, objectiveId: '', estimatedMinutes: 90 };

const ENERGY_BLOCKS = [
    { time: '9h–12h', type: 'Deep Work (Vision / Stratégie)', label: 'MATIN' },
    { time: '12h–14h', type: 'Analyse & Réflexion', label: 'MIDI' },
    { time: '14h–17h', type: 'Réunions & Opérations', label: 'APRES-MIDI' },
    { time: '17h–19h', type: 'Emails & Administratif', label: 'SOIR', isCurrent: true },
];

export const DeepWork = () => {
    const { missions, objectives, addMission, toggleMission, deleteMission, pomodoroSessions } = useApp();
    const [showModal, setShowModal] = useState(false);
    const [form, setForm] = useState({ ...initialForm });
    const [tooltipLevel, setTooltipLevel] = useState<MentalLevel | null>(null);

    const todayStr = new Date().toISOString().split('T')[0];
    const todayMissions = missions.filter(m => m.date === todayStr);

    const deepWorkMinutes = pomodoroSessions
        .filter(p => p.completedAt.startsWith(todayStr) && p.type === 'focus')
        .reduce((sum, p) => sum + p.duration, 0);
    const completedMissions = todayMissions.filter(m => m.completed).length;
    const focusScore = todayMissions.length > 0 ? Math.round((completedMissions / todayMissions.length) * 100) : 0;

    const save = () => {
        if (!form.title.trim()) return;
        addMission(form);
        setShowModal(false);
    };

    return (
        <div style={{ padding: '32px 40px', minHeight: '100vh' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '28px' }}>
                <div>
                    <p style={{ color: '#6b7280', margin: '0 0 2px', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Focus Profond</p>
                    <h1 style={{ fontSize: '36px', fontWeight: 800, color: '#fff', margin: 0 }}>Deep Work</h1>
                </div>
                <button onClick={() => { setForm({ ...initialForm }); setShowModal(true); }} style={{
                    display: 'flex', alignItems: 'center', gap: '8px', background: '#6366f1', color: '#fff',
                    border: 'none', borderRadius: '10px', padding: '10px 18px', fontSize: '14px', fontWeight: 600, cursor: 'pointer',
                }}>
                    <Plus size={16} /> Ajouter une mission
                </button>
            </div>

            {/* Stats */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginBottom: '28px' }}>
                {[
                    { icon: <Clock size={18} />, label: 'Deep Work aujourd\'hui', value: `${deepWorkMinutes}m`, color: '#6366f1' },
                    { icon: <TargetIcon size={18} />, label: 'Missions', value: `${completedMissions} / ${Math.max(todayMissions.length, 3)}`, color: '#6366f1' },
                    { icon: <Zap size={18} />, label: 'Score Focus', value: `${focusScore}%`, color: '#ef4444' },
                ].map((s, i) => (
                    <div key={i} style={{ background: '#1a1a1e', borderRadius: '12px', padding: '20px 24px', border: '1px solid rgba(255,255,255,0.06)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#6b7280', marginBottom: '8px', fontSize: '13px' }}>
                            {s.icon} {s.label}
                        </div>
                        <div style={{ fontSize: '32px', fontWeight: 700, color: s.color }}>{s.value}</div>
                    </div>
                ))}
            </div>

            {/* Missions */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 280px', gap: '20px' }}>
                <div>
                    <h2 style={{ fontSize: '18px', fontWeight: 700, color: '#fff', margin: '0 0 16px' }}>Missions du jour</h2>

                    {todayMissions.length === 0 ? (
                        <div style={{
                            background: '#1a1a1e', borderRadius: '14px', padding: '60px 24px',
                            border: '1px solid rgba(255,255,255,0.06)', textAlign: 'center',
                        }}>
                            <div style={{ fontSize: '40px', marginBottom: '16px' }}>🎯</div>
                            <div style={{ fontSize: '16px', fontWeight: 600, color: '#fff', marginBottom: '8px' }}>Aucune mission définie.</div>
                            <div style={{ fontSize: '14px', color: '#6b7280', marginBottom: '20px' }}>Définissez 3 missions clés pour guider votre journée.</div>
                            <button onClick={() => { setForm({ ...initialForm }); setShowModal(true); }} style={{
                                background: '#6366f1', color: '#fff', border: 'none', borderRadius: '10px',
                                padding: '12px 24px', fontSize: '14px', fontWeight: 600, cursor: 'pointer',
                            }}>+ Ajouter une mission</button>
                        </div>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                            {todayMissions.map(m => {
                                const ml = MENTAL_LEVELS[m.mentalLevel];
                                return (
                                    <div key={m.id} style={{
                                        background: '#1a1a1e', borderRadius: '12px', padding: '18px 20px',
                                        border: `1px solid ${m.completed ? 'rgba(16,185,129,0.2)' : 'rgba(255,255,255,0.06)'}`,
                                        display: 'flex', alignItems: 'center', gap: '14px',
                                    }}>
                                        <button onClick={() => toggleMission(m.id)} style={{
                                            width: '24px', height: '24px', borderRadius: '50%',
                                            border: `2px solid ${m.completed ? '#10b981' : 'rgba(255,255,255,0.25)'}`,
                                            background: m.completed ? '#10b981' : 'transparent',
                                            cursor: 'pointer', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        }}>
                                            {m.completed && <svg width="11" height="8" viewBox="0 0 11 8"><path d="M1 4l3 3 6-6" stroke="#fff" strokeWidth="1.5" fill="none" strokeLinecap="round" /></svg>}
                                        </button>
                                        <div style={{ flex: 1 }}>
                                            <div style={{ fontSize: '15px', fontWeight: 600, color: m.completed ? '#6b7280' : '#fff', textDecoration: m.completed ? 'line-through' : 'none', marginBottom: '4px' }}>
                                                {m.title}
                                            </div>
                                            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                                                <span style={{ padding: '2px 8px', borderRadius: '6px', fontSize: '11px', fontWeight: 700, background: ml.bg, color: ml.color }}>
                                                    {ml.short} • {ml.label.slice(3)}
                                                </span>
                                                <span style={{ fontSize: '12px', color: '#6b7280' }}>{m.estimatedMinutes} min</span>
                                            </div>
                                        </div>
                                        <button onClick={() => deleteMission(m.id)} style={{ background: 'none', border: 'none', color: '#6b7280', cursor: 'pointer', flexShrink: 0 }}>
                                            <X size={16} />
                                        </button>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>

                {/* Energy Planning */}
                <div>
                    <h2 style={{ fontSize: '18px', fontWeight: 700, color: '#fff', margin: '0 0 16px' }}>Planning énergétique</h2>
                    <div style={{ background: '#1a1a1e', borderRadius: '14px', border: '1px solid rgba(255,255,255,0.06)', overflow: 'hidden' }}>
                        {ENERGY_BLOCKS.map((block, i) => (
                            <div key={i} style={{
                                padding: '16px 20px', borderBottom: i < ENERGY_BLOCKS.length - 1 ? '1px solid rgba(255,255,255,0.06)' : 'none',
                                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                                background: block.isCurrent ? 'rgba(99,102,241,0.08)' : 'transparent',
                            }}>
                                <div>
                                    <div style={{ fontSize: '12px', fontWeight: 700, color: block.isCurrent ? '#6366f1' : '#6b7280', marginBottom: '2px' }}>{block.time}</div>
                                    <div style={{ fontSize: '14px', color: block.isCurrent ? '#e5e7eb' : '#9ca3af' }}>{block.type}</div>
                                </div>
                                {block.isCurrent && (
                                    <span style={{ fontSize: '11px', fontWeight: 700, color: '#6366f1', border: '1px solid #6366f1', borderRadius: '20px', padding: '2px 8px' }}>
                                        ► MAINTENANT
                                    </span>
                                )}
                            </div>
                        ))}
                    </div>

                    {/* Mental Levels Legend */}
                    <div style={{ marginTop: '20px', background: '#1a1a1e', borderRadius: '14px', padding: '20px', border: '1px solid rgba(255,255,255,0.06)' }}>
                        <h3 style={{ fontSize: '14px', fontWeight: 700, color: '#fff', margin: '0 0 14px' }}>Niveaux Mentaux</h3>
                        {([5, 4, 3, 2, 1] as MentalLevel[]).map(l => {
                            const ml = MENTAL_LEVELS[l];
                            const tip = LEVEL_TOOLTIPS[l];
                            const isOpen = tooltipLevel === l;
                            return (
                                <div key={l} style={{ marginBottom: '8px' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                        <span style={{ padding: '2px 8px', borderRadius: '6px', fontSize: '11px', fontWeight: 700, background: ml.bg, color: ml.color, minWidth: '28px', textAlign: 'center' }}>{ml.short}</span>
                                        <span style={{ fontSize: '13px', color: '#9ca3af', flex: 1 }}>{ml.label.slice(3)}</span>
                                        <button
                                            onClick={() => setTooltipLevel(isOpen ? null : l)}
                                            style={{ background: 'none', border: 'none', cursor: 'pointer', color: isOpen ? ml.color : '#4b5563', padding: '2px', display: 'flex', alignItems: 'center', transition: 'color 0.2s' }}
                                            title="En savoir plus"
                                        >
                                            <Info size={14} />
                                        </button>
                                    </div>
                                    {isOpen && (
                                        <div style={{
                                            marginTop: '8px', marginLeft: '38px',
                                            background: 'rgba(255,255,255,0.04)',
                                            border: `1px solid ${ml.color}33`,
                                            borderLeft: `3px solid ${ml.color}`,
                                            borderRadius: '8px',
                                            padding: '10px 12px',
                                            animation: 'fadeIn 0.15s ease',
                                        }}>
                                            <p style={{ fontSize: '12px', color: '#d1d5db', margin: '0 0 8px', lineHeight: 1.5 }}>{tip.description}</p>
                                            <div style={{ fontSize: '11px', color: '#6b7280', fontWeight: 600, marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Exemples</div>
                                            <ul style={{ margin: 0, paddingLeft: '14px' }}>
                                                {tip.examples.map((ex, i) => (
                                                    <li key={i} style={{ fontSize: '12px', color: ml.color, opacity: 0.85, marginBottom: '2px' }}>{ex}</li>
                                                ))}
                                            </ul>
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* Modal */}
            {showModal && (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
                    <div style={{ background: '#1a1a1e', borderRadius: '16px', width: '100%', maxWidth: '500px', border: '1px solid rgba(255,255,255,0.1)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '24px 24px 0' }}>
                            <h2 style={{ fontSize: '18px', fontWeight: 700, color: '#fff', margin: 0 }}>Nouvelle Mission</h2>
                            <button onClick={() => setShowModal(false)} style={{ background: 'none', border: 'none', color: '#6b7280', cursor: 'pointer' }}><X size={20} /></button>
                        </div>
                        <div style={{ padding: '20px 24px 24px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
                            <div>
                                <label style={labelStyle}>Mission</label>
                                <input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} placeholder="Titre de la mission" style={inputStyle} />
                            </div>
                            <div>
                                <label style={labelStyle}>Détails</label>
                                <textarea value={form.details} onChange={e => setForm(f => ({ ...f, details: e.target.value }))} placeholder="Détails de la mission..." rows={3}
                                    style={{ ...inputStyle, resize: 'vertical' }} />
                            </div>
                            <div>
                                <label style={labelStyle}>Niveau mental</label>
                                <div style={{ display: 'flex', gap: '6px' }}>
                                    {([5, 4, 3, 2, 1] as MentalLevel[]).map(l => {
                                        const ml = MENTAL_LEVELS[l];
                                        return (
                                            <button key={l} onClick={() => setForm(f => ({ ...f, mentalLevel: l }))} style={{
                                                flex: 1, padding: '8px 4px', borderRadius: '8px', fontSize: '11px', fontWeight: 700,
                                                border: `1px solid ${form.mentalLevel === l ? ml.color : 'rgba(255,255,255,0.1)'}`,
                                                background: form.mentalLevel === l ? ml.bg : 'transparent',
                                                color: form.mentalLevel === l ? ml.color : '#6b7280', cursor: 'pointer',
                                            }}>{ml.short}</button>
                                        );
                                    })}
                                </div>
                            </div>
                            <div>
                                <label style={labelStyle}>Objectif lié</label>
                                <select value={form.objectiveId} onChange={e => setForm(f => ({ ...f, objectiveId: e.target.value }))} style={inputStyle}>
                                    <option value="">-- Aucun --</option>
                                    {objectives.map(o => <option key={o.id} value={o.id}>{o.title}</option>)}
                                </select>
                            </div>
                            <div>
                                <label style={labelStyle}>Durée estimée (minutes)</label>
                                <input type="number" value={form.estimatedMinutes} onChange={e => setForm(f => ({ ...f, estimatedMinutes: parseInt(e.target.value) || 0 }))} style={inputStyle} />
                            </div>
                            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', paddingTop: '8px' }}>
                                <button onClick={() => setShowModal(false)} style={{ padding: '10px 16px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)', background: 'transparent', color: '#9ca3af', fontSize: '14px', cursor: 'pointer' }}>Annuler</button>
                                <button onClick={save} style={{ padding: '10px 20px', borderRadius: '8px', border: 'none', background: '#6366f1', color: '#fff', fontSize: '14px', fontWeight: 600, cursor: 'pointer' }}>Ajouter</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

const labelStyle: React.CSSProperties = { display: 'block', fontSize: '13px', color: '#9ca3af', marginBottom: '6px', fontWeight: 500 };
const inputStyle: React.CSSProperties = { width: '100%', background: '#111113', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', padding: '10px 12px', color: '#e5e7eb', fontSize: '14px', fontFamily: 'inherit', boxSizing: 'border-box' };
