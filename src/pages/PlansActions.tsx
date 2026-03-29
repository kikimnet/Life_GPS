import { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Plus, X, ChevronDown } from 'lucide-react';
import { useUnsavedChanges } from '../hooks/useUnsavedChanges';

export const PlansActions = () => {
    const { actionPlans, objectives, addActionPlan, updateActionPlan, deleteActionPlan } = useApp();
    const [selectedObjectiveId, setSelectedObjectiveId] = useState(objectives[0]?.id ?? '');
    const [showModal, setShowModal] = useState(false);
    const [editId, setEditId] = useState<string | null>(null);
    const [form, setForm] = useState({ objectiveId: '', description: '', obstacles: '', resources: '' });

    const selectedObjective = objectives.find(o => o.id === selectedObjectiveId);
    const plansForObj = actionPlans.filter(p => p.objectiveId === selectedObjectiveId);

    const openAdd = () => {
        setForm({ objectiveId: selectedObjectiveId, description: '', obstacles: '', resources: '' });
        setEditId(null); setShowModal(true);
    };
    const save = () => {
        if (!form.description.trim()) return;
        if (editId) updateActionPlan(editId, form);
        else addActionPlan(form);
        setShowModal(false);
    };

    const isDirty = showModal && form.description.trim().length > 0;
    useUnsavedChanges(isDirty);

    const STATUS_COLORS: Record<string, string> = { 'todo': '#6b7280', 'in-progress': '#f59e0b', 'done': '#10b981' };
    const STATUS_LABELS: Record<string, string> = { 'todo': 'À faire', 'in-progress': 'En cours', 'done': 'Terminé' };

    return (
        <div style={{ padding: '32px 40px', minHeight: '100vh' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '28px' }}>
                <div>
                    <p style={{ color: '#6b7280', margin: '0 0 2px', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.1em' }}>GPS — Plans</p>
                    <h1 style={{ fontSize: '36px', fontWeight: 800, color: '#fff', margin: 0 }}>Plans d'actions</h1>
                </div>
                <button onClick={openAdd} style={{ display: 'flex', alignItems: 'center', gap: '8px', background: '#6366f1', color: '#fff', border: 'none', borderRadius: '10px', padding: '10px 18px', fontSize: '14px', fontWeight: 600, cursor: 'pointer' }}>
                    <Plus size={16} /> Nouveau plan
                </button>
            </div>

            {/* Objective selector */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '24px' }}>
                {objectives.map(obj => (
                    <div
                        key={obj.id}
                        onClick={() => setSelectedObjectiveId(obj.id)}
                        style={{
                            background: selectedObjectiveId === obj.id ? 'rgba(99,102,241,0.1)' : '#1a1a1e',
                            borderRadius: '12px', padding: '16px 20px',
                            border: `1px solid ${selectedObjectiveId === obj.id ? 'rgba(99,102,241,0.4)' : 'rgba(255,255,255,0.06)'}`,
                            cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                        }}
                    >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: selectedObjectiveId === obj.id ? '#6366f1' : '#6b7280', flexShrink: 0 }} />
                            <span style={{ fontSize: '15px', fontWeight: 500, color: '#e5e7eb' }}>{obj.title}</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <button onClick={e => { e.stopPropagation(); setForm({ objectiveId: obj.id, description: '', obstacles: '', resources: '' }); setSelectedObjectiveId(obj.id); setShowModal(true); }} style={{
                                padding: '4px 12px', borderRadius: '6px', border: '1px solid rgba(99,102,241,0.3)', background: 'rgba(99,102,241,0.1)',
                                color: '#818cf8', fontSize: '12px', cursor: 'pointer',
                            }}>+ Ajouter</button>
                            <ChevronDown size={16} color="#6b7280" style={{ transform: selectedObjectiveId === obj.id ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
                        </div>
                    </div>
                ))}
            </div>

            {/* Plans for selected objective */}
            {selectedObjective && plansForObj.length > 0 && (
                <div>
                    <h2 style={{ fontSize: '16px', fontWeight: 600, color: '#9ca3af', margin: '0 0 12px', paddingLeft: '4px' }}>
                        Plans pour: {selectedObjective.title}
                    </h2>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                        {plansForObj.map(plan => (
                            <div key={plan.id} style={{
                                background: '#1a1a1e', borderRadius: '10px', padding: '16px 20px',
                                border: '1px solid rgba(255,255,255,0.06)',
                                display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '12px',
                            }}>
                                <div style={{ flex: 1 }}>
                                    <div style={{ fontSize: '14px', fontWeight: 500, color: '#e5e7eb', marginBottom: '8px' }}>{plan.description}</div>
                                    {plan.obstacles && <div style={{ fontSize: '12px', color: '#6b7280' }}>🚧 {plan.obstacles}</div>}
                                    {plan.resources && <div style={{ fontSize: '12px', color: '#6b7280', marginTop: '4px' }}>🔧 {plan.resources}</div>}
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
                                    <select value={plan.status} onChange={e => updateActionPlan(plan.id, { status: e.target.value as any })}
                                        style={{ background: '#111113', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '6px', padding: '4px 8px', color: STATUS_COLORS[plan.status], fontSize: '12px', cursor: 'pointer' }}>
                                        {Object.entries(STATUS_LABELS).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
                                    </select>
                                    <button onClick={() => deleteActionPlan(plan.id)} style={{ background: 'none', border: 'none', color: '#6b7280', cursor: 'pointer' }}>
                                        <X size={16} />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Modal */}
            {showModal && (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
                    <div style={{ background: '#1a1a1e', borderRadius: '16px', width: '100%', maxWidth: '480px', border: '1px solid rgba(255,255,255,0.1)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '24px 24px 0' }}>
                            <h2 style={{ fontSize: '18px', fontWeight: 700, color: '#fff', margin: 0 }}>Nouveau plan d'action</h2>
                            <button onClick={() => setShowModal(false)} style={{ background: 'none', border: 'none', color: '#6b7280', cursor: 'pointer' }}><X size={20} /></button>
                        </div>
                        <div style={{ padding: '20px 24px 24px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
                            {[
                                { key: 'description', label: 'Description du plan', placeholder: 'Décrivez votre plan d\'action...' },
                                { key: 'obstacles', label: 'Obstacles possibles', placeholder: 'Quels obstacles pourriez-vous rencontrer ?' },
                                { key: 'resources', label: 'Ressources nécessaires', placeholder: 'De quoi avez-vous besoin ?' },
                            ].map(f => (
                                <div key={f.key}>
                                    <label style={labelStyle}>{f.label}</label>
                                    <textarea value={(form as any)[f.key]} onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))}
                                        placeholder={f.placeholder} rows={3} style={{ ...inputStyle, resize: 'vertical' }} />
                                </div>
                            ))}
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
