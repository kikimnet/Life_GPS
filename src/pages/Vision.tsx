import { useState } from 'react';
import { useApp, DOMAIN_COLORS } from '../context/AppContext';
import { Plus, X } from 'lucide-react';

const ICON_OPTIONS = ['💼', '💰', '⭐', '🎯', '✨', '🌿', '❤️', '🏋️', '📚', '🎨', '🏠', '🌎'];

export const Vision = () => {
    const { domains, addDomain, updateDomain, deleteDomain } = useApp();
    const [showModal, setShowModal] = useState(false);
    const [editId, setEditId] = useState<string | null>(null);
    const [form, setForm] = useState({ name: '', vision: '', description: '', icon: '💼' });

    const openAdd = () => { setForm({ name: '', vision: '', description: '', icon: '💼' }); setEditId(null); setShowModal(true); };
    const openEdit = (d: typeof domains[0]) => { setForm({ name: d.name, vision: d.vision, description: d.description, icon: d.icon ?? '💼' }); setEditId(d.id); setShowModal(true); };
    const save = () => {
        if (!form.name.trim()) return;
        if (editId) updateDomain(editId, form);
        else addDomain(form);
        setShowModal(false);
    };

    return (
        <div style={{ padding: '32px 40px', minHeight: '100vh' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '28px' }}>
                <div>
                    <h1 style={{ fontSize: '36px', fontWeight: 800, color: '#fff', margin: 0 }}>Vision</h1>
                    <p style={{ color: '#6b7280', margin: '4px 0 0', fontSize: '14px' }}>Définissez votre vision pour chaque domaine de vie</p>
                </div>
                <button onClick={openAdd} style={{
                    display: 'flex', alignItems: 'center', gap: '8px',
                    background: '#6366f1', color: '#fff', border: 'none', borderRadius: '10px',
                    padding: '10px 18px', fontSize: '14px', fontWeight: 600, cursor: 'pointer',
                }}>
                    <Plus size={16} /> Ajouter un domaine
                </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px' }}>
                {domains.map(domain => {
                    const colors = DOMAIN_COLORS[domain.name] ?? { color: '#9ca3af', bg: '#1f2937', icon: '🎯' };
                    return (
                        <div
                            key={domain.id}
                            onClick={() => openEdit(domain)}
                            style={{
                                background: '#1a1a1e', borderRadius: '14px', padding: '28px',
                                border: '1px solid rgba(255,255,255,0.06)', cursor: 'pointer',
                                transition: 'border-color 0.2s',
                            }}
                            onMouseEnter={e => (e.currentTarget.style.borderColor = 'rgba(99,102,241,0.4)')}
                            onMouseLeave={e => (e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)')}
                        >
                            <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '16px' }}>
                                <div style={{
                                    width: '44px', height: '44px', borderRadius: '12px',
                                    background: colors.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '22px',
                                }}>
                                    {domain.icon ?? colors.icon}
                                </div>
                                <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#fff', margin: 0 }}>{domain.name}</h3>
                            </div>
                            <p style={{ fontSize: '14px', color: '#9ca3af', lineHeight: 1.6, margin: 0 }}>
                                {domain.vision || 'Aucune vision définie...'}
                            </p>
                        </div>
                    );
                })}
            </div>

            {showModal && (
                <div style={{
                    position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', zIndex: 100,
                    display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px',
                }}>
                    <div style={{ background: '#1a1a1e', borderRadius: '16px', width: '100%', maxWidth: '520px', border: '1px solid rgba(255,255,255,0.1)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '24px 24px 0' }}>
                            <h2 style={{ fontSize: '18px', fontWeight: 700, color: '#fff', margin: 0 }}>
                                {editId ? 'Modifier le domaine' : 'Nouveau domaine'}
                            </h2>
                            <button onClick={() => setShowModal(false)} style={{ background: 'none', border: 'none', color: '#6b7280', cursor: 'pointer' }}>
                                <X size={20} />
                            </button>
                        </div>
                        <div style={{ padding: '20px 24px 24px' }}>
                            {/* Icon picker */}
                            <div style={{ marginBottom: '16px' }}>
                                <label style={{ display: 'block', fontSize: '13px', color: '#9ca3af', marginBottom: '8px', fontWeight: 500 }}>Icône</label>
                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                                    {ICON_OPTIONS.map(icon => (
                                        <button key={icon} onClick={() => setForm(f => ({ ...f, icon }))} style={{
                                            width: '36px', height: '36px', fontSize: '20px', borderRadius: '8px',
                                            border: form.icon === icon ? '2px solid #6366f1' : '2px solid transparent',
                                            background: form.icon === icon ? 'rgba(99,102,241,0.2)' : 'rgba(255,255,255,0.05)',
                                            cursor: 'pointer',
                                        }}>{icon}</button>
                                    ))}
                                </div>
                            </div>
                            {[
                                { key: 'name', label: 'Nom du domaine', placeholder: 'Ex: Carrière' },
                                { key: 'vision', label: 'Vision', placeholder: 'Votre vision à long terme...' },
                                { key: 'description', label: 'Description (optionnel)', placeholder: 'Détails supplémentaires...' },
                            ].map(f => (
                                <div key={f.key} style={{ marginBottom: '16px' }}>
                                    <label style={{ display: 'block', fontSize: '13px', color: '#9ca3af', marginBottom: '8px', fontWeight: 500 }}>{f.label}</label>
                                    <textarea
                                        value={(form as any)[f.key]}
                                        onChange={e => setForm(prev => ({ ...prev, [f.key]: e.target.value }))}
                                        placeholder={f.placeholder}
                                        rows={f.key === 'name' ? 1 : 3}
                                        style={{
                                            width: '100%', background: '#111113', border: '1px solid rgba(255,255,255,0.1)',
                                            borderRadius: '8px', padding: '10px 12px', color: '#e5e7eb', fontSize: '14px',
                                            resize: 'vertical', fontFamily: 'inherit', boxSizing: 'border-box',
                                        }}
                                    />
                                </div>
                            ))}
                            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', paddingTop: '8px' }}>
                                {editId && (
                                    <button onClick={() => { deleteDomain(editId); setShowModal(false); }} style={{
                                        padding: '10px 16px', borderRadius: '8px', border: '1px solid rgba(239,68,68,0.3)',
                                        background: 'transparent', color: '#ef4444', fontSize: '14px', cursor: 'pointer',
                                    }}>Supprimer</button>
                                )}
                                <button onClick={() => setShowModal(false)} style={{
                                    padding: '10px 16px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)',
                                    background: 'transparent', color: '#9ca3af', fontSize: '14px', cursor: 'pointer',
                                }}>Annuler</button>
                                <button onClick={save} style={{
                                    padding: '10px 20px', borderRadius: '8px', border: 'none',
                                    background: '#6366f1', color: '#fff', fontSize: '14px', fontWeight: 600, cursor: 'pointer',
                                }}>Sauvegarder</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
