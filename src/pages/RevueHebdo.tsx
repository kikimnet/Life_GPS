import { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Plus, X, Trash2 } from 'lucide-react';

const REVIEW_FIELDS = {
    hebdo: [
        { key: 'wins', label: '🏆 Victoires de la semaine', placeholder: 'Qu\'est-ce qui a bien fonctionné ?' },
        { key: 'failures', label: '❌ Échecs et apprentissages', placeholder: 'Qu\'est-ce qui n\'a pas bien fonctionné ?' },
        { key: 'obstacles', label: '🚧 Obstacles rencontrés', placeholder: 'Quels obstacles avez-vous rencontrés ?' },
        { key: 'adjustments', label: '🔄 Ajustements pour la semaine prochaine', placeholder: 'Quels changements allez-vous faire ?' },
    ]
};

export const RevueHebdo = () => {
    const { reviews, addReview, deleteReview } = useApp();
    const [showModal, setShowModal] = useState(false);
    const [form, setForm] = useState<Record<string, string>>({ wins: '', failures: '', obstacles: '', adjustments: '' });
    const weeklyReviews = reviews.filter(r => r.type === 'hebdo');

    const save = () => {
        const period = new Date().toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });
        addReview({ type: 'hebdo', date: new Date().toISOString().split('T')[0], period, content: form });
        setShowModal(false);
    };

    return (
        <div style={{ padding: '32px 40px', minHeight: '100vh' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '28px' }}>
                <div>
                    <h1 style={{ fontSize: '36px', fontWeight: 800, color: '#fff', margin: 0 }}>Revue Hebdo</h1>
                    <p style={{ color: '#6b7280', margin: '4px 0 0', fontSize: '14px' }}>Réflexion et ajustement chaque semaine</p>
                </div>
                <button onClick={() => { setForm({ wins: '', failures: '', obstacles: '', adjustments: '' }); setShowModal(true); }} style={{
                    display: 'flex', alignItems: 'center', gap: '8px', background: '#6366f1', color: '#fff',
                    border: 'none', borderRadius: '10px', padding: '10px 18px', fontSize: '14px', fontWeight: 600, cursor: 'pointer',
                }}>
                    <Plus size={16} /> Nouvelle revue
                </button>
            </div>

            {weeklyReviews.length === 0 ? (
                <div style={{ background: '#1a1a1e', borderRadius: '16px', padding: '60px 24px', border: '1px solid rgba(255,255,255,0.06)', textAlign: 'center' }}>
                    <div style={{ fontSize: '40px', marginBottom: '16px' }}>📋</div>
                    <div style={{ fontSize: '16px', fontWeight: 600, color: '#fff', marginBottom: '8px' }}>Aucune revue hebdomadaire</div>
                    <div style={{ fontSize: '14px', color: '#6b7280', marginBottom: '20px' }}>Créez votre première revue pour analyser votre semaine.</div>
                    <button onClick={() => setShowModal(true)} style={{ background: '#6366f1', color: '#fff', border: 'none', borderRadius: '10px', padding: '12px 24px', fontSize: '14px', fontWeight: 600, cursor: 'pointer' }}>
                        Créer une revue
                    </button>
                </div>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                    {weeklyReviews.map(r => (
                        <div key={r.id} style={{ background: '#1a1a1e', borderRadius: '14px', padding: '24px', border: '1px solid rgba(255,255,255,0.06)' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                                <span style={{ fontSize: '15px', fontWeight: 600, color: '#fff' }}>{r.period}</span>
                                <button onClick={() => deleteReview(r.id)} style={{ background: 'none', border: 'none', color: '#6b7280', cursor: 'pointer' }}>
                                    <Trash2 size={16} />
                                </button>
                            </div>
                            {REVIEW_FIELDS.hebdo.map(f => r.content[f.key] && (
                                <div key={f.key} style={{ marginBottom: '12px' }}>
                                    <div style={{ fontSize: '12px', fontWeight: 700, color: '#6b7280', marginBottom: '4px' }}>{f.label}</div>
                                    <div style={{ fontSize: '14px', color: '#9ca3af', lineHeight: 1.6 }}>{r.content[f.key]}</div>
                                </div>
                            ))}
                        </div>
                    ))}
                </div>
            )}

            {showModal && (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
                    <div style={{ background: '#1a1a1e', borderRadius: '16px', width: '100%', maxWidth: '540px', border: '1px solid rgba(255,255,255,0.1)', maxHeight: '90vh', overflowY: 'auto' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '24px 24px 0' }}>
                            <h2 style={{ fontSize: '18px', fontWeight: 700, color: '#fff', margin: 0 }}>Nouvelle revue hebdomadaire</h2>
                            <button onClick={() => setShowModal(false)} style={{ background: 'none', border: 'none', color: '#6b7280', cursor: 'pointer' }}><X size={20} /></button>
                        </div>
                        <div style={{ padding: '20px 24px 24px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
                            {REVIEW_FIELDS.hebdo.map(f => (
                                <div key={f.key}>
                                    <label style={labelStyle}>{f.label}</label>
                                    <textarea value={form[f.key]} onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))}
                                        placeholder={f.placeholder} rows={3}
                                        style={{ ...inputStyle, resize: 'vertical' }} />
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
