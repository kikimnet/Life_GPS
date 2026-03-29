import { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Plus, X, RefreshCw } from 'lucide-react';
import { useUnsavedChanges } from '../hooks/useUnsavedChanges';

const FREQ_LABELS: Record<string, string> = { quotidien: 'QUOTIDIEN', hebdomadaire: 'HEBDOMADAIRE', 'jours-spécifiques': 'JOURS SPÉCIFIQUES' };
const FREQ_COLORS: Record<string, string> = { quotidien: '#34d399', hebdomadaire: '#60a5fa', 'jours-spécifiques': '#f59e0b' };

const initialForm = {
    name: '', objectiveId: '', frequency: 'quotidien' as 'quotidien' | 'hebdomadaire' | 'jours-spécifiques',
    normalDuration: 30, minDuration: 10, minDescription: '', isActive: true,
};

export const Systemes = () => {
    const { systems, objectives, addSystem, updateSystem, deleteSystem } = useApp();
    const [showModal, setShowModal] = useState(false);
    const [editId, setEditId] = useState<string | null>(null);
    const [form, setForm] = useState({ ...initialForm });

    const openAdd = () => { setForm({ ...initialForm }); setEditId(null); setShowModal(true); };
    const openEdit = (s: typeof systems[0]) => {
        setForm({ name: s.name, objectiveId: s.objectiveId ?? '', frequency: s.frequency, normalDuration: s.normalDuration, minDuration: s.minDuration, minDescription: s.minDescription, isActive: s.isActive });
        setEditId(s.id); setShowModal(true);
    };
    const save = () => {
        if (!form.name.trim()) return;
        if (editId) updateSystem(editId, form);
        else addSystem(form);
        setShowModal(false);
    };

    const isDirty = showModal && form.name.trim().length > 0;
    useUnsavedChanges(isDirty);

    const getObjName = (id: string) => objectives.find(o => o.id === id)?.title ?? '';
    const getDomain = (id: string) => objectives.find(o => o.id === id)?.domain ?? '';

    return (
        <div style={{ padding: '32px 40px', minHeight: '100vh' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '28px' }}>
                <div>
                    <h1 style={{ fontSize: '36px', fontWeight: 800, color: '#fff', margin: 0 }}>Systèmes</h1>
                    <p style={{ color: '#6b7280', margin: '4px 0 0', fontSize: '14px' }}>Vos actions récurrentes pour atteindre vos objectifs</p>
                </div>
                <button onClick={openAdd} style={{ display: 'flex', alignItems: 'center', gap: '8px', background: '#6366f1', color: '#fff', border: 'none', borderRadius: '10px', padding: '10px 18px', fontSize: '14px', fontWeight: 600, cursor: 'pointer' }}>
                    <Plus size={16} /> Nouveau système
                </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {systems.map(s => {
                    const objName = s.objectiveId ? getObjName(s.objectiveId) : '';
                    const domain = s.objectiveId ? getDomain(s.objectiveId) : '';
                    return (
                        <div key={s.id}
                            onClick={() => openEdit(s)}
                            style={{
                                background: '#1a1a1e', borderRadius: '12px', padding: '18px 20px',
                                border: '1px solid rgba(255,255,255,0.06)', cursor: 'pointer',
                                transition: 'border-color 0.2s',
                            }}
                            onMouseEnter={e => (e.currentTarget.style.borderColor = 'rgba(99,102,241,0.4)')}
                            onMouseLeave={e => (e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)')}
                        >
                            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px' }}>
                                <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'rgba(99,102,241,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                    <RefreshCw size={18} color="#6366f1" />
                                </div>
                                <div style={{ flex: 1 }}>
                                    <div style={{ fontSize: '15px', fontWeight: 600, color: '#fff', marginBottom: '8px' }}>{s.name}</div>
                                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: s.minDescription ? '8px' : 0 }}>
                                        <span style={{ padding: '3px 10px', borderRadius: '6px', fontSize: '11px', fontWeight: 700, background: `${FREQ_COLORS[s.frequency]}20`, color: FREQ_COLORS[s.frequency], letterSpacing: '0.05em' }}>
                                            {FREQ_LABELS[s.frequency]}
                                        </span>
                                        <span style={{ padding: '3px 10px', borderRadius: '6px', fontSize: '11px', fontWeight: 700, background: 'rgba(96,165,250,0.15)', color: '#60a5fa' }}>
                                            {s.normalDuration} MIN
                                        </span>
                                        {objName && (
                                            <span style={{ padding: '3px 10px', borderRadius: '6px', fontSize: '11px', fontWeight: 700, background: 'rgba(52,211,153,0.12)', color: '#34d399', maxWidth: '240px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                                {objName.toUpperCase()}
                                            </span>
                                        )}
                                        {domain && (
                                            <span style={{ padding: '3px 10px', borderRadius: '6px', fontSize: '11px', fontWeight: 700, background: 'rgba(52,211,153,0.08)', color: '#34d399' }}>
                                                {domain.toUpperCase()}
                                            </span>
                                        )}
                                    </div>
                                    {s.minDescription && (
                                        <div style={{ fontSize: '12px', color: '#f59e0b' }}>⚡ Min: {s.minDescription}</div>
                                    )}
                                </div>
                                <div style={{
                                    width: '10px', height: '10px', borderRadius: '50%', flexShrink: 0, marginTop: '4px',
                                    background: s.isActive ? '#10b981' : '#6b7280',
                                }} />
                            </div>
                        </div>
                    );
                })}
            </div>

            {showModal && (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
                    <div style={{ background: '#1a1a1e', borderRadius: '16px', width: '100%', maxWidth: '520px', border: '1px solid rgba(255,255,255,0.1)', maxHeight: '90vh', overflowY: 'auto' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '24px 24px 0' }}>
                            <h2 style={{ fontSize: '18px', fontWeight: 700, color: '#fff', margin: 0 }}>{editId ? 'Modifier le système' : 'Nouveau système'}</h2>
                            <button onClick={() => setShowModal(false)} style={{ background: 'none', border: 'none', color: '#6b7280', cursor: 'pointer' }}><X size={20} /></button>
                        </div>
                        <div style={{ padding: '20px 24px 24px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
                            {/* Name */}
                            <div>
                                <label style={labelStyle}>Nom</label>
                                <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="Ex: Entraînement karaté" style={inputStyle} />
                            </div>
                            {/* Objective */}
                            <div>
                                <label style={labelStyle}>Objectif lié</label>
                                <select value={form.objectiveId} onChange={e => setForm(f => ({ ...f, objectiveId: e.target.value }))} style={inputStyle}>
                                    <option value="">-- Aucun --</option>
                                    {objectives.map(o => <option key={o.id} value={o.id}>{o.title}</option>)}
                                </select>
                            </div>
                            {/* Frequency */}
                            <div>
                                <label style={labelStyle}>Fréquence</label>
                                <div style={{ display: 'flex', gap: '8px' }}>
                                    {(['quotidien', 'hebdomadaire', 'jours-spécifiques'] as const).map(f => (
                                        <button key={f} onClick={() => setForm(s => ({ ...s, frequency: f }))} style={{
                                            padding: '7px 12px', borderRadius: '8px', border: `1px solid ${form.frequency === f ? '#6366f1' : 'rgba(255,255,255,0.1)'}`,
                                            background: form.frequency === f ? 'rgba(99,102,241,0.2)' : 'transparent',
                                            color: form.frequency === f ? '#e5e7eb' : '#6b7280', fontSize: '12px', cursor: 'pointer',
                                        }}>{FREQ_LABELS[f]}</button>
                                    ))}
                                </div>
                            </div>
                            {/* Durations */}
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                                <div>
                                    <label style={labelStyle}>Durée normale (min)</label>
                                    <input type="number" value={form.normalDuration} onChange={e => setForm(f => ({ ...f, normalDuration: parseInt(e.target.value) || 0 }))} style={inputStyle} />
                                </div>
                                <div>
                                    <label style={labelStyle}>Durée minimum (min)</label>
                                    <input type="number" value={form.minDuration} onChange={e => setForm(f => ({ ...f, minDuration: parseInt(e.target.value) || 0 }))} style={inputStyle} />
                                </div>
                            </div>
                            {/* Min description */}
                            <div>
                                <label style={labelStyle}>Minimum viable (description)</label>
                                <input value={form.minDescription} onChange={e => setForm(f => ({ ...f, minDescription: e.target.value }))} placeholder="Que faire au minimum ?" style={inputStyle} />
                            </div>
                            {/* Active toggle */}
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                <label style={{ fontSize: '14px', color: '#e5e7eb', fontWeight: 500 }}>Actif</label>
                                <button onClick={() => setForm(f => ({ ...f, isActive: !f.isActive }))} style={{
                                    width: '44px', height: '24px', borderRadius: '12px',
                                    background: form.isActive ? '#6366f1' : 'rgba(255,255,255,0.15)',
                                    border: 'none', cursor: 'pointer', position: 'relative', transition: 'background 0.2s',
                                }}>
                                    <div style={{ position: 'absolute', top: '4px', left: form.isActive ? '23px' : '4px', width: '16px', height: '16px', borderRadius: '50%', background: '#fff', transition: 'left 0.2s' }} />
                                </button>
                            </div>
                            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', paddingTop: '8px' }}>
                                {editId && <button onClick={() => { deleteSystem(editId); setShowModal(false); }} style={{ padding: '10px 16px', borderRadius: '8px', border: '1px solid rgba(239,68,68,0.3)', background: 'transparent', color: '#ef4444', fontSize: '14px', cursor: 'pointer' }}>Supprimer</button>}
                                <button onClick={() => setShowModal(false)} style={{ padding: '10px 16px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)', background: 'transparent', color: '#9ca3af', fontSize: '14px', cursor: 'pointer' }}>Annuler</button>
                                <button onClick={save} style={{ padding: '10px 20px', borderRadius: '8px', border: 'none', background: '#6366f1', color: '#fff', fontSize: '14px', fontWeight: 600, cursor: 'pointer' }}>Sauvegarder</button>
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
