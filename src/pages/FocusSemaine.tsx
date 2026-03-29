import { useState } from 'react';
import { useApp } from '../context/AppContext';
import { useUnsavedChanges } from '../hooks/useUnsavedChanges';
import { Plus, X } from 'lucide-react';

const DAYS_FR = ['LU', 'MA', 'ME', 'JE', 'VE', 'SA', 'DI'];

export const FocusSemaine = () => {
    const { weeklyFocuses, objectives, addWeeklyFocus, getCurrentWeekFocus } = useApp();
    const [showModal, setShowModal] = useState(false);
    const [form, setForm] = useState({ priority: '', details: '', weekDays: DAYS_FR });
    const currentFocus = getCurrentWeekFocus();

    useUnsavedChanges(showModal && form.priority.trim().length > 0);

    const getWeekStart = () => {
        const d = new Date();
        const day = d.getDay();
        const diff = d.getDate() - day + (day === 0 ? -6 : 1);
        d.setDate(diff);
        return d.toISOString().split('T')[0];
    };

    const save = () => {
        if (!form.priority.trim()) return;
        addWeeklyFocus({ weekStart: getWeekStart(), ...form });
        setShowModal(false);
    };

    const nowDay = new Date().getDay(); // 0=Sun, 1=Mon...

    return (
        <div style={{ padding: '32px 40px', minHeight: '100vh' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '28px' }}>
                <div>
                    <h1 style={{ fontSize: '36px', fontWeight: 800, color: '#fff', margin: 0 }}>Focus semaine</h1>
                    <p style={{ color: '#6b7280', margin: '4px 0 0', fontSize: '14px' }}>Définissez votre priorité principale pour cette semaine</p>
                </div>
                <button onClick={() => { setForm({ priority: '', details: '', weekDays: DAYS_FR }); setShowModal(true); }} style={{
                    display: 'flex', alignItems: 'center', gap: '8px', background: '#6366f1', color: '#fff',
                    border: 'none', borderRadius: '10px', padding: '10px 18px', fontSize: '14px', fontWeight: 600, cursor: 'pointer',
                }}>
                    <Plus size={16} /> Définir le focus
                </button>
            </div>

            {/* Current Week Focus */}
            {currentFocus ? (
                <div style={{ background: 'linear-gradient(135deg, rgba(99,102,241,0.15), rgba(139,92,246,0.1))', border: '1px solid rgba(99,102,241,0.3)', borderRadius: '16px', padding: '28px', marginBottom: '24px' }}>
                    <div style={{ fontSize: '11px', fontWeight: 700, color: '#6366f1', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '8px' }}>Focus de la semaine</div>
                    <div style={{ fontSize: '22px', fontWeight: 700, color: '#fff', marginBottom: '16px' }}>{currentFocus.priority}</div>
                    {currentFocus.details && (
                        <div style={{ fontSize: '14px', color: '#9ca3af', marginBottom: '20px' }}>{currentFocus.details}</div>
                    )}
                    <div style={{ display: 'flex', gap: '8px' }}>
                        {DAYS_FR.map((d, i) => {
                            const isToday = (i === (nowDay === 0 ? 6 : nowDay - 1));
                            return (
                                <div key={d} style={{
                                    width: '36px', height: '36px', borderRadius: '8px',
                                    background: isToday ? '#6366f1' : 'rgba(255,255,255,0.06)',
                                    color: isToday ? '#fff' : '#6b7280',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    fontSize: '12px', fontWeight: 700,
                                }}>{d}</div>
                            );
                        })}
                    </div>
                </div>
            ) : (
                <div style={{ background: '#1a1a1e', borderRadius: '16px', padding: '60px 24px', border: '1px solid rgba(255,255,255,0.06)', textAlign: 'center', marginBottom: '24px' }}>
                    <div style={{ fontSize: '40px', marginBottom: '16px' }}>🎯</div>
                    <div style={{ fontSize: '16px', fontWeight: 600, color: '#fff', marginBottom: '8px' }}>Aucun focus défini pour cette semaine</div>
                    <div style={{ fontSize: '14px', color: '#6b7280', marginBottom: '20px' }}>Définissez votre priorité principale pour guider votre semaine.</div>
                    <button onClick={() => setShowModal(true)} style={{ background: '#6366f1', color: '#fff', border: 'none', borderRadius: '10px', padding: '12px 24px', fontSize: '14px', fontWeight: 600, cursor: 'pointer' }}>
                        Définir le focus
                    </button>
                </div>
            )}

            {/* Objectives suggestion */}
            {objectives.filter(o => o.status === 'actif').length > 0 && (
                <div>
                    <h2 style={{ fontSize: '16px', fontWeight: 700, color: '#fff', margin: '0 0 14px' }}>Objectifs actifs</h2>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        {objectives.filter(o => o.status === 'actif').map(obj => (
                            <div key={obj.id} style={{
                                background: '#1a1a1e', borderRadius: '10px', padding: '14px 18px',
                                border: '1px solid rgba(255,255,255,0.06)',
                                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                            }}>
                                <span style={{ fontSize: '14px', color: '#e5e7eb' }}>{obj.title}</span>
                                <button onClick={() => { setForm({ priority: obj.title, details: '', weekDays: DAYS_FR }); setShowModal(true); }} style={{
                                    fontSize: '12px', color: '#6366f1', background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.2)',
                                    borderRadius: '6px', padding: '4px 10px', cursor: 'pointer',
                                }}>Définir comme focus</button>
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
                            <h2 style={{ fontSize: '18px', fontWeight: 700, color: '#fff', margin: 0 }}>Focus de la semaine</h2>
                            <button onClick={() => setShowModal(false)} style={{ background: 'none', border: 'none', color: '#6b7280', cursor: 'pointer' }}><X size={20} /></button>
                        </div>
                        <div style={{ padding: '20px 24px 24px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
                            <div>
                                <label style={labelStyle}>Priorité principale</label>
                                <input value={form.priority} onChange={e => setForm(f => ({ ...f, priority: e.target.value }))}
                                    placeholder="Ex: Terminer le module 3 du cours..." style={inputStyle} />
                            </div>
                            <div>
                                <label style={labelStyle}>Détails</label>
                                <textarea value={form.details} onChange={e => setForm(f => ({ ...f, details: e.target.value }))}
                                    placeholder="Décrivez votre focus et comment vous comptez l'atteindre..." rows={4}
                                    style={{ ...inputStyle, resize: 'vertical' }} />
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
