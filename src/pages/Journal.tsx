import { useState } from 'react';
import { useApp, type JournalTag } from '../context/AppContext';
import { Plus, X, Trash2, Edit2 } from 'lucide-react';

const TAG_COLORS: Record<JournalTag, { color: string; bg: string }> = {
    leçon: { color: '#f59e0b', bg: 'rgba(245,158,11,0.15)' },
    idée: { color: '#60a5fa', bg: 'rgba(96,165,250,0.15)' },
    réflexion: { color: '#a78bfa', bg: 'rgba(167,139,250,0.15)' },
};
const TAGS: JournalTag[] = ['leçon', 'idée', 'réflexion'];

const initialForm = { title: '', tag: 'réflexion' as JournalTag, content: '', date: new Date().toISOString().split('T')[0] };

export const Journal = () => {
    const { journal, addJournalEntry, updateJournalEntry, deleteJournalEntry } = useApp();
    const [showModal, setShowModal] = useState(false);
    const [editId, setEditId] = useState<string | null>(null);
    const [form, setForm] = useState({ ...initialForm });

    const openAdd = () => { setForm({ ...initialForm }); setEditId(null); setShowModal(true); };
    const openEdit = (e: typeof journal[0]) => {
        setForm({ title: e.title, tag: e.tag, content: e.content, date: e.date });
        setEditId(e.id); setShowModal(true);
    };
    const save = () => {
        if (!form.title.trim()) return;
        if (editId) updateJournalEntry(editId, form);
        else addJournalEntry(form);
        setShowModal(false);
    };

    return (
        <div style={{ padding: '32px 40px', minHeight: '100vh' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '28px' }}>
                <div>
                    <h1 style={{ fontSize: '36px', fontWeight: 800, color: '#fff', margin: 0 }}>Journal</h1>
                    <p style={{ color: '#6b7280', margin: '4px 0 0', fontSize: '14px' }}>Vos pensées, leçons et idées</p>
                </div>
                <button onClick={openAdd} style={{
                    display: 'flex', alignItems: 'center', gap: '8px', background: '#6366f1', color: '#fff',
                    border: 'none', borderRadius: '10px', padding: '10px 18px', fontSize: '14px', fontWeight: 600, cursor: 'pointer',
                }}>
                    <Plus size={16} /> Nouvelle entrée
                </button>
            </div>

            {/* Tag filters */}
            <div style={{ display: 'flex', gap: '8px', marginBottom: '24px' }}>
                {TAGS.map(tag => (
                    <span key={tag} style={{
                        padding: '5px 14px', borderRadius: '20px', fontSize: '13px', fontWeight: 600,
                        background: TAG_COLORS[tag].bg, color: TAG_COLORS[tag].color, cursor: 'default',
                        textTransform: 'capitalize',
                    }}>{tag}</span>
                ))}
            </div>

            {journal.length === 0 ? (
                <div style={{ background: '#1a1a1e', borderRadius: '16px', padding: '60px 24px', border: '1px solid rgba(255,255,255,0.06)', textAlign: 'center' }}>
                    <div style={{ fontSize: '40px', marginBottom: '16px' }}>📖</div>
                    <div style={{ fontSize: '16px', fontWeight: 600, color: '#fff', marginBottom: '8px' }}>Aucune entrée de journal</div>
                    <div style={{ fontSize: '14px', color: '#6b7280', marginBottom: '20px' }}>Commencez à capturer vos pensées et apprentissages.</div>
                    <button onClick={openAdd} style={{ background: '#6366f1', color: '#fff', border: 'none', borderRadius: '10px', padding: '12px 24px', fontSize: '14px', fontWeight: 600, cursor: 'pointer' }}>
                        Nouvelle entrée
                    </button>
                </div>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {journal.map(entry => {
                        const tc = TAG_COLORS[entry.tag];
                        return (
                            <div key={entry.id} style={{
                                background: '#1a1a1e', borderRadius: '14px', padding: '20px 24px',
                                border: '1px solid rgba(255,255,255,0.06)', cursor: 'pointer',
                                transition: 'border-color 0.2s',
                            }}
                                onMouseEnter={e => (e.currentTarget.style.borderColor = 'rgba(99,102,241,0.4)')}
                                onMouseLeave={e => (e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)')}
                            >
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
                                    <div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
                                            <span style={{ padding: '3px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: 700, background: tc.bg, color: tc.color, textTransform: 'capitalize' }}>
                                                {entry.tag}
                                            </span>
                                            <span style={{ fontSize: '12px', color: '#6b7280' }}>{entry.date}</span>
                                        </div>
                                        <h3 style={{ fontSize: '15px', fontWeight: 600, color: '#fff', margin: 0 }}>{entry.title}</h3>
                                    </div>
                                    <div style={{ display: 'flex', gap: '8px' }}>
                                        <button onClick={() => openEdit(entry)} style={{ background: 'none', border: 'none', color: '#6b7280', cursor: 'pointer' }}><Edit2 size={15} /></button>
                                        <button onClick={() => deleteJournalEntry(entry.id)} style={{ background: 'none', border: 'none', color: '#6b7280', cursor: 'pointer' }}><Trash2 size={15} /></button>
                                    </div>
                                </div>
                                {entry.content && (
                                    <p style={{ fontSize: '14px', color: '#9ca3af', margin: 0, lineHeight: 1.6, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical' as any }}>
                                        {entry.content}
                                    </p>
                                )}
                            </div>
                        );
                    })}
                </div>
            )}

            {showModal && (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
                    <div style={{ background: '#1a1a1e', borderRadius: '16px', width: '100%', maxWidth: '500px', border: '1px solid rgba(255,255,255,0.1)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '24px 24px 0' }}>
                            <h2 style={{ fontSize: '18px', fontWeight: 700, color: '#fff', margin: 0 }}>{editId ? 'Modifier l\'entrée' : 'Nouvelle entrée'}</h2>
                            <button onClick={() => setShowModal(false)} style={{ background: 'none', border: 'none', color: '#6b7280', cursor: 'pointer' }}><X size={20} /></button>
                        </div>
                        <div style={{ padding: '20px 24px 24px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
                            <div>
                                <label style={labelStyle}>Tag</label>
                                <div style={{ display: 'flex', gap: '8px' }}>
                                    {TAGS.map(t => (
                                        <button key={t} onClick={() => setForm(f => ({ ...f, tag: t }))} style={{
                                            padding: '7px 14px', borderRadius: '8px', border: `1px solid ${form.tag === t ? TAG_COLORS[t].color : 'rgba(255,255,255,0.1)'}`,
                                            background: form.tag === t ? TAG_COLORS[t].bg : 'transparent',
                                            color: form.tag === t ? TAG_COLORS[t].color : '#6b7280', fontSize: '13px', cursor: 'pointer',
                                            textTransform: 'capitalize', fontWeight: 500,
                                        }}>{t}</button>
                                    ))}
                                </div>
                            </div>
                            <div>
                                <label style={labelStyle}>Titre</label>
                                <input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} placeholder="Titre de l'entrée" style={inputStyle} />
                            </div>
                            <div>
                                <label style={labelStyle}>Contenu</label>
                                <textarea value={form.content} onChange={e => setForm(f => ({ ...f, content: e.target.value }))}
                                    placeholder="Vos pensées, observations..." rows={5}
                                    style={{ ...inputStyle, resize: 'vertical' }} />
                            </div>
                            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', paddingTop: '8px' }}>
                                {editId && <button onClick={() => { deleteJournalEntry(editId); setShowModal(false); }} style={{ padding: '10px 16px', borderRadius: '8px', border: '1px solid rgba(239,68,68,0.3)', background: 'transparent', color: '#ef4444', fontSize: '14px', cursor: 'pointer' }}>Supprimer</button>}
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
