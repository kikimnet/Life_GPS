import { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Plus, X, ChevronDown, ChevronUp } from 'lucide-react';

const QUARTER_STATUS_COLORS: Record<string, string> = { planifié: '#6b7280', 'en-cours': '#f59e0b', terminé: '#10b981' };
const QUARTER_STATUS_LABELS: Record<string, string> = { planifié: 'Planifié', 'en-cours': 'En cours', terminé: 'Terminé' };
const CURRENT_YEAR = new Date().getFullYear();

const initialForm = { objectiveId: '', quarter: 'Q1', year: CURRENT_YEAR, keyActions: '', successCriteria: '', status: 'planifié' as 'planifié' | 'en-cours' | 'terminé', progress: 0 };

export const PlansTrimestriels = () => {
    const { quarterlyPlans, objectives, addQuarterlyPlan, updateQuarterlyPlan, deleteQuarterlyPlan } = useApp();
    const [showModal, setShowModal] = useState(false);
    const [editId, setEditId] = useState<string | null>(null);
    const [form, setForm] = useState({ ...initialForm });
    const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());
    const [yearFilter, setYearFilter] = useState(CURRENT_YEAR);

    const openAdd = (objectiveId = '') => {
        setForm({ ...initialForm, objectiveId: objectiveId || objectives[0]?.id || '' });
        setEditId(null); setShowModal(true);
    };

    const save = () => {
        if (!form.objectiveId) return;
        if (editId) updateQuarterlyPlan(editId, form);
        else addQuarterlyPlan(form);
        setShowModal(false);
    };

    // Get current quarter
    const currentMonth = new Date().getMonth();
    const currentQuarter = `Q${Math.floor(currentMonth / 3) + 1}`;
    const quarterMonths: Record<string, string> = { Q1: 'Jan – Mar', Q2: 'Avr – Jun', Q3: 'Jul – Sep', Q4: 'Oct – Déc' };

    const toggle = (id: string) => setExpandedIds(prev => { const s = new Set(prev); s.has(id) ? s.delete(id) : s.add(id); return s; });

    return (
        <div style={{ padding: '32px 40px', minHeight: '100vh' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '28px' }}>
                <div>
                    <p style={{ color: '#6b7280', margin: '0 0 2px', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.1em' }}>GPS — Trimestriel</p>
                    <h1 style={{ fontSize: '36px', fontWeight: 800, color: '#fff', margin: 0 }}>Plans Trimestriels</h1>
                </div>
                <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                    <div style={{ padding: '8px 16px', background: '#6366f1', borderRadius: '8px', fontSize: '14px', fontWeight: 700, color: '#fff' }}>
                        {yearFilter}
                    </div>
                    <button onClick={() => openAdd()} style={{ display: 'flex', alignItems: 'center', gap: '8px', background: '#6366f1', color: '#fff', border: 'none', borderRadius: '10px', padding: '10px 18px', fontSize: '14px', fontWeight: 600, cursor: 'pointer' }}>
                        <Plus size={16} /> Ajouter un trimestre
                    </button>
                </div>
            </div>

            {/* Current Quarter Banner */}
            <div style={{
                background: 'rgba(99,102,241,0.08)', border: '1px solid rgba(99,102,241,0.2)',
                borderRadius: '12px', padding: '14px 20px', marginBottom: '20px',
                display: 'flex', alignItems: 'center', gap: '12px',
            }}>
                <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#6366f1', flexShrink: 0 }} />
                <span style={{ fontSize: '11px', fontWeight: 700, color: '#6366f1', textTransform: 'uppercase', letterSpacing: '0.1em' }}>EN COURS</span>
                <span style={{ fontSize: '14px', fontWeight: 600, color: '#e5e7eb' }}>{currentQuarter} {yearFilter} — {quarterMonths[currentQuarter]}</span>
            </div>

            {/* Objectives with their quarterly plans */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {objectives.map(obj => {
                    const objPlans = quarterlyPlans.filter(p => p.objectiveId === obj.id && p.year === yearFilter);
                    const isExpanded = expandedIds.has(obj.id);
                    return (
                        <div key={obj.id}>
                            <div style={{
                                background: '#1a1a1e', borderRadius: '12px', padding: '16px 20px',
                                border: `1px solid ${isExpanded ? 'rgba(99,102,241,0.3)' : 'rgba(255,255,255,0.06)'}`,
                                display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer',
                            }}
                                onClick={() => toggle(obj.id)}
                            >
                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                    <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: isExpanded ? '#6366f1' : '#6b7280', flexShrink: 0 }} />
                                    <span style={{ fontSize: '15px', fontWeight: 500, color: '#e5e7eb' }}>{obj.title}</span>
                                </div>
                                <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                                    <button onClick={e => { e.stopPropagation(); openAdd(obj.id); }} style={{
                                        padding: '5px 12px', borderRadius: '6px', border: '1px solid rgba(99,102,241,0.3)', background: 'rgba(99,102,241,0.1)',
                                        color: '#818cf8', fontSize: '12px', cursor: 'pointer',
                                    }}>+ Ajouter un trimestre</button>
                                    {isExpanded ? <ChevronUp size={16} color="#6b7280" /> : <ChevronDown size={16} color="#6b7280" />}
                                </div>
                            </div>

                            {isExpanded && objPlans.length > 0 && (
                                <div style={{ marginLeft: '20px', marginTop: '4px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                                    {objPlans.map(plan => (
                                        <div key={plan.id} style={{
                                            background: '#141417', borderRadius: '10px', padding: '14px 18px',
                                            border: '1px solid rgba(255,255,255,0.05)',
                                            display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '12px',
                                        }}>
                                            <div style={{ flex: 1 }}>
                                                <div style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
                                                    <span style={{ fontSize: '12px', fontWeight: 700, color: '#6366f1' }}>{plan.quarter} {plan.year}</span>
                                                    <span style={{ padding: '2px 8px', borderRadius: '20px', fontSize: '11px', fontWeight: 700, background: `${QUARTER_STATUS_COLORS[plan.status]}20`, color: QUARTER_STATUS_COLORS[plan.status] }}>
                                                        {QUARTER_STATUS_LABELS[plan.status]}
                                                    </span>
                                                </div>
                                                {plan.keyActions && <div style={{ fontSize: '13px', color: '#9ca3af', marginBottom: '4px' }}>🎯 {plan.keyActions}</div>}
                                                {plan.successCriteria && <div style={{ fontSize: '13px', color: '#9ca3af' }}>✅ {plan.successCriteria}</div>}
                                                <div style={{ margin: '10px 0 0', height: '3px', background: 'rgba(255,255,255,0.08)', borderRadius: '2px' }}>
                                                    <div style={{ height: '100%', width: `${plan.progress}%`, background: '#6366f1', borderRadius: '2px' }} />
                                                </div>
                                            </div>
                                            <button onClick={() => deleteQuarterlyPlan(plan.id)} style={{ background: 'none', border: 'none', color: '#6b7280', cursor: 'pointer', flexShrink: 0 }}>
                                                <X size={16} />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>

            {/* Modal */}
            {showModal && (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
                    <div style={{ background: '#1a1a1e', borderRadius: '16px', width: '100%', maxWidth: '500px', border: '1px solid rgba(255,255,255,0.1)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '24px 24px 0' }}>
                            <h2 style={{ fontSize: '18px', fontWeight: 700, color: '#fff', margin: 0 }}>Nouveau plan trimestriel</h2>
                            <button onClick={() => setShowModal(false)} style={{ background: 'none', border: 'none', color: '#6b7280', cursor: 'pointer' }}><X size={20} /></button>
                        </div>
                        <div style={{ padding: '20px 24px 24px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
                            <div>
                                <label style={labelStyle}>Objectif</label>
                                <select value={form.objectiveId} onChange={e => setForm(f => ({ ...f, objectiveId: e.target.value }))} style={inputStyle}>
                                    {objectives.map(o => <option key={o.id} value={o.id}>{o.title}</option>)}
                                </select>
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                                <div>
                                    <label style={labelStyle}>Trimestre</label>
                                    <select value={form.quarter} onChange={e => setForm(f => ({ ...f, quarter: e.target.value }))} style={inputStyle}>
                                        {['Q1', 'Q2', 'Q3', 'Q4'].map(q => <option key={q} value={q}>{q} ({quarterMonths[q]})</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label style={labelStyle}>Année</label>
                                    <input type="number" value={form.year} onChange={e => setForm(f => ({ ...f, year: parseInt(e.target.value) }))} style={inputStyle} />
                                </div>
                            </div>
                            <div>
                                <label style={labelStyle}>Actions clés</label>
                                <textarea value={form.keyActions} onChange={e => setForm(f => ({ ...f, keyActions: e.target.value }))} placeholder="Quelles actions entreprendrez-vous ?" rows={3} style={{ ...inputStyle, resize: 'vertical' }} />
                            </div>
                            <div>
                                <label style={labelStyle}>Critère de succès</label>
                                <textarea value={form.successCriteria} onChange={e => setForm(f => ({ ...f, successCriteria: e.target.value }))} placeholder="Comment mesurer le succès ?" rows={2} style={{ ...inputStyle, resize: 'vertical' }} />
                            </div>
                            <div>
                                <label style={labelStyle}>Statut</label>
                                <div style={{ display: 'flex', gap: '8px' }}>
                                    {Object.entries(QUARTER_STATUS_LABELS).map(([v, l]) => (
                                        <button key={v} onClick={() => setForm(f => ({ ...f, status: v as any }))} style={{
                                            flex: 1, padding: '7px', borderRadius: '8px', fontSize: '12px',
                                            border: `1px solid ${form.status === v ? QUARTER_STATUS_COLORS[v] : 'rgba(255,255,255,0.1)'}`,
                                            background: form.status === v ? `${QUARTER_STATUS_COLORS[v]}20` : 'transparent',
                                            color: form.status === v ? QUARTER_STATUS_COLORS[v] : '#6b7280', cursor: 'pointer',
                                        }}>{l}</button>
                                    ))}
                                </div>
                            </div>
                            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', paddingTop: '8px' }}>
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
