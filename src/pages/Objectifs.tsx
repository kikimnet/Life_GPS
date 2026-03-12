import { useState } from 'react';
import { useApp, type Objective, type Priority, type ObjectifStatus } from '../context/AppContext';
import { Plus, X, ChevronRight, Settings, AlertTriangle, CheckCircle2 } from 'lucide-react';

const PRIORITIES: Priority[] = ['haute', 'moyenne', 'basse'];
const PRIORITY_COLORS: Record<Priority, string> = { haute: '#ef4444', moyenne: '#f59e0b', basse: '#6b7280' };
const PRIORITY_LABELS: Record<Priority, string> = { haute: 'Haute', moyenne: 'Moyenne', basse: 'Basse' };

const initialForm = {
    title: '', description: '', domain: 'Santé et bien être', priority: 'haute' as Priority,
    targetDate: '', successIndicator: '', motivation: '', status: 'actif' as ObjectifStatus,
};

// ─── WIP Gate Modal ────────────────────────────────────────────────────────────
function WIPGateModal({ count, limit, highestProgress, onForce, onClose, onFinishFirst }:
    { count: number; limit: number; highestProgress: Objective | null; onForce: () => void; onClose: () => void; onFinishFirst: () => void }) {
    return (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
            <div style={{ background: '#1a1a1e', borderRadius: '20px', width: '100%', maxWidth: '480px', border: '1px solid rgba(239,68,68,0.3)', overflow: 'hidden' }}>
                {/* Red header */}
                <div style={{ background: 'rgba(239,68,68,0.08)', borderBottom: '1px solid rgba(239,68,68,0.15)', padding: '28px 28px 20px', textAlign: 'center' }}>
                    <div style={{ fontSize: '48px', marginBottom: '12px' }}>🚨</div>
                    <h2 style={{ fontSize: '20px', fontWeight: 800, color: '#ef4444', margin: '0 0 6px' }}>Limite WIP atteinte !</h2>
                    <p style={{ fontSize: '14px', color: '#9ca3af', margin: 0 }}>
                        Tu as déjà <strong style={{ color: '#fff' }}>{count}</strong> objectifs actifs sur <strong style={{ color: '#fff' }}>{limit}</strong> maximum.
                    </p>
                </div>

                <div style={{ padding: '24px 28px 28px' }}>
                    {/* Problem explanation */}
                    <div style={{ background: 'rgba(239,68,68,0.06)', borderRadius: '12px', padding: '16px', marginBottom: '20px', border: '1px solid rgba(239,68,68,0.1)' }}>
                        <div style={{ fontSize: '13px', fontWeight: 600, color: '#ef4444', marginBottom: '8px' }}>⚠️ Le problème</div>
                        <div style={{ fontSize: '13px', color: '#9ca3af', lineHeight: 1.6 }}>
                            Trop d'objectifs ouverts en même temps dilue ton énergie, crée de la confusion et réduit tes chances de compléter quoi que ce soit.
                            Un focus limité = des résultats concrets.
                        </div>
                    </div>

                    {/* Suggestion */}
                    {highestProgress && (
                        <div style={{ background: 'rgba(16,185,129,0.06)', borderRadius: '12px', padding: '16px', marginBottom: '20px', border: '1px solid rgba(16,185,129,0.15)' }}>
                            <div style={{ fontSize: '13px', fontWeight: 600, color: '#10b981', marginBottom: '8px' }}>💡 Suggestion</div>
                            <div style={{ fontSize: '13px', color: '#e5e7eb', marginBottom: '12px' }}>
                                Cet objectif est presque terminé. Concentre-toi d'abord pour le clôturer !
                            </div>
                            <div style={{ background: '#111113', borderRadius: '8px', padding: '12px 14px' }}>
                                <div style={{ fontSize: '14px', fontWeight: 600, color: '#fff', marginBottom: '8px' }}>{highestProgress.title}</div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                    <div style={{ flex: 1, height: '6px', background: 'rgba(255,255,255,0.08)', borderRadius: '3px' }}>
                                        <div style={{ height: '100%', width: `${highestProgress.progress}%`, background: '#10b981', borderRadius: '3px' }} />
                                    </div>
                                    <span style={{ fontSize: '13px', fontWeight: 700, color: '#10b981' }}>{highestProgress.progress}%</span>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Actions */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                        {highestProgress && (
                            <button onClick={onFinishFirst} style={{
                                padding: '14px', borderRadius: '10px', border: 'none',
                                background: 'linear-gradient(135deg, #10b981, #059669)',
                                color: '#fff', fontSize: '14px', fontWeight: 700, cursor: 'pointer',
                                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                            }}>
                                <CheckCircle2 size={18} /> Marquer "{highestProgress.title.slice(0, 30)}..." comme terminé
                            </button>
                        )}
                        <button onClick={onForce} style={{
                            padding: '12px', borderRadius: '10px',
                            border: '1px solid rgba(239,68,68,0.3)',
                            background: 'transparent', color: '#ef4444', fontSize: '13px', cursor: 'pointer',
                            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
                        }}>
                            <AlertTriangle size={15} /> Ignorer et ajouter quand même
                        </button>
                        <button onClick={onClose} style={{
                            padding: '12px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.08)',
                            background: 'transparent', color: '#6b7280', fontSize: '13px', cursor: 'pointer',
                        }}>
                            Annuler
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

// ─── Objective Form Modal ──────────────────────────────────────────────────────
function ObjectiveModal({ title, onClose, onSave, form, setForm, domains, onDelete, isEdit }:
    { title: string; onClose: () => void; onSave: () => void; form: any; setForm: any; domains: any[]; onDelete?: () => void; isEdit?: boolean }) {
    const fields = [
        { key: 'title', label: 'Titre', placeholder: "Nom de l'objectif", type: 'text' },
        { key: 'description', label: 'Description', placeholder: 'Décrivez votre objectif...', type: 'textarea' },
        { key: 'successIndicator', label: 'Indicateur de réussite', placeholder: 'Comment savoir que vous avez réussi ?', type: 'text' },
        { key: 'motivation', label: 'Motivation', placeholder: 'Pourquoi cet objectif est important ?', type: 'textarea' },
        { key: 'targetDate', label: 'Date cible', placeholder: '', type: 'date' },
    ];

    return (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
            <div style={{ background: '#1a1a1e', borderRadius: '16px', width: '100%', maxWidth: '560px', border: '1px solid rgba(255,255,255,0.1)', maxHeight: '90vh', overflowY: 'auto' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '24px 24px 0' }}>
                    <h2 style={{ fontSize: '18px', fontWeight: 700, color: '#fff', margin: 0 }}>{title}</h2>
                    <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#6b7280', cursor: 'pointer' }}><X size={20} /></button>
                </div>
                <div style={{ padding: '20px 24px 24px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
                    {fields.map(f => (
                        <div key={f.key}>
                            <label style={labelStyle}>{f.label}</label>
                            {f.type === 'textarea' ? (
                                <textarea value={form[f.key]} onChange={e => setForm((p: any) => ({ ...p, [f.key]: e.target.value }))}
                                    placeholder={f.placeholder} rows={3}
                                    style={{ width: '100%', background: '#111113', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', padding: '10px 12px', color: '#e5e7eb', fontSize: '14px', resize: 'vertical', fontFamily: 'inherit', boxSizing: 'border-box' }} />
                            ) : (
                                <input type={f.type} value={form[f.key]} onChange={e => setForm((p: any) => ({ ...p, [f.key]: e.target.value }))}
                                    placeholder={f.placeholder}
                                    style={{ width: '100%', background: '#111113', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', padding: '10px 12px', color: '#e5e7eb', fontSize: '14px', fontFamily: 'inherit', boxSizing: 'border-box' }} />
                            )}
                        </div>
                    ))}
                    <div>
                        <label style={labelStyle}>Domaine</label>
                        <select value={form.domain} onChange={e => setForm((p: any) => ({ ...p, domain: e.target.value }))}
                            style={{ width: '100%', background: '#111113', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', padding: '10px 12px', color: '#e5e7eb', fontSize: '14px', boxSizing: 'border-box' }}>
                            {domains.map((d: any) => <option key={d.id} value={d.name}>{d.name}</option>)}
                        </select>
                    </div>
                    <div>
                        <label style={labelStyle}>Priorité</label>
                        <div style={{ display: 'flex', gap: '8px' }}>
                            {PRIORITIES.map(p => (
                                <button key={p} onClick={() => setForm((f: any) => ({ ...f, priority: p }))} style={{
                                    padding: '7px 14px', borderRadius: '8px', border: `1px solid ${form.priority === p ? PRIORITY_COLORS[p] : 'rgba(255,255,255,0.1)'}`,
                                    background: form.priority === p ? `${PRIORITY_COLORS[p]}20` : 'transparent',
                                    color: form.priority === p ? PRIORITY_COLORS[p] : '#6b7280', fontSize: '13px', cursor: 'pointer', fontWeight: 500,
                                }}>{PRIORITY_LABELS[p]}</button>
                            ))}
                        </div>
                    </div>
                    <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', paddingTop: '8px' }}>
                        {isEdit && onDelete && (
                            <button onClick={onDelete} style={{ padding: '10px 16px', borderRadius: '8px', border: '1px solid rgba(239,68,68,0.3)', background: 'transparent', color: '#ef4444', fontSize: '14px', cursor: 'pointer' }}>Supprimer</button>
                        )}
                        <button onClick={onClose} style={{ padding: '10px 16px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)', background: 'transparent', color: '#9ca3af', fontSize: '14px', cursor: 'pointer' }}>Annuler</button>
                        <button onClick={onSave} style={{ padding: '10px 20px', borderRadius: '8px', border: 'none', background: '#6366f1', color: '#fff', fontSize: '14px', fontWeight: 600, cursor: 'pointer' }}>Sauvegarder</button>
                    </div>
                </div>
            </div>
        </div>
    );
}

type StatusFilter = 'tous' | ObjectifStatus;
type PriorityFilter = 'tous' | Priority;

export const Objectifs = () => {
    const { objectives, domains, addObjective, updateObjective, deleteObjective, getWIPStatus, wipLimit, setWipLimit } = useApp();
    const [showModal, setShowModal] = useState(false);
    const [showWIPGate, setShowWIPGate] = useState(false);
    const [showWipSettings, setShowWipSettings] = useState(false);
    const [editId, setEditId] = useState<string | null>(null);
    const [form, setForm] = useState(initialForm);
    const [statusFilter, setStatusFilter] = useState<StatusFilter>('tous');
    const [priorityFilter, setPriorityFilter] = useState<PriorityFilter>('tous');
    const [domainFilter, setDomainFilter] = useState('tous');

    const wip = getWIPStatus();
    const activeObjectives = objectives.filter(o => o.status === 'actif');

    // Objective with highest progress (best candidate to finish)
    const highestProgress = activeObjectives.length > 0
        ? activeObjectives.reduce((best, curr) => curr.progress > best.progress ? curr : best, activeObjectives[0])
        : null;

    const openAdd = () => {
        setForm({ ...initialForm });
        setEditId(null);
        // Check WIP before opening
        if (wip.exceeded || wip.count >= wip.limit) {
            setShowWIPGate(true);
        } else {
            setShowModal(true);
        }
    };

    const forceOpenModal = () => {
        setShowWIPGate(false);
        setShowModal(true);
    };

    const openEdit = (o: Objective) => {
        setForm({ title: o.title, description: o.description, domain: o.domain, priority: o.priority, targetDate: o.targetDate, successIndicator: o.successIndicator, motivation: o.motivation ?? '', status: o.status });
        setEditId(o.id);
        setShowModal(true);
    };

    const save = () => {
        if (!form.title.trim()) return;
        if (editId) updateObjective(editId, form);
        else addObjective(form);
        setShowModal(false);
    };

    const finishHighestAndAdd = () => {
        if (highestProgress) {
            updateObjective(highestProgress.id, { status: 'terminé', progress: 100 });
        }
        setShowWIPGate(false);
        setShowModal(true);
    };

    const filtered = objectives.filter(o => {
        if (statusFilter !== 'tous' && o.status !== statusFilter) return false;
        if (priorityFilter !== 'tous' && o.priority !== priorityFilter) return false;
        if (domainFilter !== 'tous' && o.domain !== domainFilter) return false;
        return true;
    });

    const uniqueDomains = [...new Set(objectives.map(o => o.domain))];

    const FilterBar = ({ label, options, selected, onSelect }: any) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '12px', color: '#6b7280', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', minWidth: '70px' }}>{label}</span>
            {options.map((o: any) => (
                <button key={o.value} onClick={() => onSelect(o.value)} style={{
                    padding: '5px 12px', borderRadius: '20px', fontSize: '13px',
                    border: `1px solid ${selected === o.value ? '#6366f1' : 'rgba(255,255,255,0.1)'}`,
                    background: selected === o.value ? 'rgba(99,102,241,0.2)' : 'transparent',
                    color: selected === o.value ? '#e5e7eb' : '#9ca3af', cursor: 'pointer', fontWeight: 500,
                }}>{o.label}</button>
            ))}
        </div>
    );

    return (
        <div style={{ padding: '32px 40px', minHeight: '100vh' }}>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' }}>
                <div>
                    <p style={{ color: '#6b7280', margin: '0 0 2px', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.1em' }}>GPS — GOALS</p>
                    <h1 style={{ fontSize: '36px', fontWeight: 800, color: '#fff', margin: 0 }}>Objectifs</h1>
                </div>
                <button onClick={openAdd} style={{
                    display: 'flex', alignItems: 'center', gap: '8px', background: '#6366f1', color: '#fff',
                    border: 'none', borderRadius: '10px', padding: '10px 18px', fontSize: '14px', fontWeight: 600, cursor: 'pointer',
                }}>
                    <Plus size={16} /> Nouvel objectif
                </button>
            </div>

            {/* ─── WIP CONTROL BANNER ─────────────────────────────────────────────────── */}
            <div style={{
                background: wip.exceeded ? 'rgba(239,68,68,0.07)' : wip.count === wip.limit ? 'rgba(245,158,11,0.07)' : 'rgba(16,185,129,0.06)',
                border: `1px solid ${wip.exceeded ? 'rgba(239,68,68,0.2)' : wip.count === wip.limit ? 'rgba(245,158,11,0.2)' : 'rgba(16,185,129,0.15)'}`,
                borderRadius: '14px', padding: '18px 24px', marginBottom: '20px',
                display: 'flex', alignItems: 'center', gap: '20px',
            }}>
                {/* Icon */}
                <div style={{
                    width: '44px', height: '44px', borderRadius: '12px', flexShrink: 0,
                    background: wip.exceeded ? 'rgba(239,68,68,0.12)' : wip.count === wip.limit ? 'rgba(245,158,11,0.12)' : 'rgba(16,185,129,0.12)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '22px',
                }}>
                    {wip.exceeded ? '🚨' : wip.count === wip.limit ? '⚠️' : '✅'}
                </div>

                {/* Status text */}
                <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '13px', fontWeight: 700, color: wip.color, marginBottom: '6px' }}>
                        {wip.label}
                    </div>
                    {/* Gauge */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div style={{ flex: 1, height: '6px', background: 'rgba(255,255,255,0.08)', borderRadius: '3px', maxWidth: '200px' }}>
                            <div style={{
                                height: '100%', width: `${wip.pct}%`, borderRadius: '3px',
                                background: wip.color, transition: 'width 0.4s ease',
                            }} />
                        </div>
                        <span style={{ fontSize: '13px', color: '#9ca3af' }}>{wip.count}/{wip.limit} objectifs actifs</span>
                    </div>
                </div>

                {/* WIP Limit config button */}
                <button onClick={() => setShowWipSettings(v => !v)} style={{
                    display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 14px', borderRadius: '8px',
                    border: '1px solid rgba(255,255,255,0.1)', background: 'transparent',
                    color: '#9ca3af', fontSize: '13px', cursor: 'pointer',
                }}>
                    <Settings size={14} /> Limite: {wipLimit}
                </button>
            </div>

            {/* WIP Settings inline panel */}
            {showWipSettings && (
                <div style={{
                    background: '#1a1a1e', borderRadius: '12px', padding: '20px 24px',
                    border: '1px solid rgba(255,255,255,0.08)', marginBottom: '20px',
                }}>
                    <div style={{ fontSize: '14px', fontWeight: 700, color: '#fff', marginBottom: '14px' }}>
                        ⚙️ Limite WIP maximale
                    </div>
                    <div style={{ fontSize: '13px', color: '#9ca3af', marginBottom: '14px', lineHeight: 1.6 }}>
                        Choisis le nombre maximum d'objectifs actifs en même temps. Recommandé : <strong style={{ color: '#fff' }}>3</strong>.
                        Plus la limite est basse, plus ton focus est fort.
                    </div>
                    <div style={{ display: 'flex', gap: '8px' }}>
                        {[1, 2, 3, 4, 5].map(n => (
                            <button key={n} onClick={() => setWipLimit(n)} style={{
                                width: '44px', height: '44px', borderRadius: '10px', fontSize: '16px', fontWeight: 700,
                                border: `2px solid ${wipLimit === n ? '#6366f1' : 'rgba(255,255,255,0.1)'}`,
                                background: wipLimit === n ? 'rgba(99,102,241,0.2)' : 'transparent',
                                color: wipLimit === n ? '#e5e7eb' : '#6b7280', cursor: 'pointer',
                            }}>{n}</button>
                        ))}
                    </div>
                    {wip.exceeded && (
                        <div style={{ marginTop: '14px', padding: '12px', background: 'rgba(239,68,68,0.08)', borderRadius: '8px', border: '1px solid rgba(239,68,68,0.15)', fontSize: '13px', color: '#fca5a5' }}>
                            ⚠️ Tu as actuellement {wip.count} objectifs actifs. Pour respecter ta nouvelle limite, marque {wip.count - wipLimit} objectif(s) comme terminé(s) ou en pause.
                        </div>
                    )}
                </div>
            )}

            {/* Filters */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '24px' }}>
                <FilterBar label="Statut" selected={statusFilter} onSelect={setStatusFilter}
                    options={[{ value: 'tous', label: 'Tous' }, { value: 'actif', label: 'Actifs' }, { value: 'terminé', label: 'Terminés' }, { value: 'en-pause', label: 'En pause' }]} />
                <FilterBar label="Priorité" selected={priorityFilter} onSelect={setPriorityFilter}
                    options={[{ value: 'tous', label: 'Tous' }, { value: 'haute', label: 'Haute' }, { value: 'moyenne', label: 'Moyenne' }, { value: 'basse', label: 'Basse' }]} />
                <FilterBar label="Domaine" selected={domainFilter} onSelect={setDomainFilter}
                    options={[{ value: 'tous', label: 'Tous' }, ...uniqueDomains.map(d => ({ value: d, label: d }))]} />
            </div>

            {/* List */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {filtered.length === 0 && (
                    <div style={{ textAlign: 'center', padding: '60px 20px', color: '#6b7280' }}>
                        Aucun objectif correspondant aux filtres
                    </div>
                )}
                {filtered.map(obj => {
                    const isActive = obj.status === 'actif';
                    return (
                        <div key={obj.id} style={{
                            background: '#1a1a1e', borderRadius: '12px', padding: '20px 24px',
                            border: `1px solid ${isActive && wip.exceeded ? 'rgba(239,68,68,0.15)' : 'rgba(255,255,255,0.06)'}`,
                            cursor: 'pointer', transition: 'border-color 0.2s',
                        }}
                            onClick={() => openEdit(obj)}
                            onMouseEnter={e => (e.currentTarget.style.borderColor = 'rgba(99,102,241,0.4)')}
                            onMouseLeave={e => (e.currentTarget.style.borderColor = isActive && wip.exceeded ? 'rgba(239,68,68,0.15)' : 'rgba(255,255,255,0.06)')}
                        >
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                    <button
                                        onClick={e => { e.stopPropagation(); updateObjective(obj.id, { status: obj.status === 'terminé' ? 'actif' : 'terminé', progress: obj.status === 'actif' ? 100 : obj.progress }); }}
                                        style={{
                                            width: '22px', height: '22px', borderRadius: '50%', flexShrink: 0,
                                            border: `2px solid ${obj.status === 'terminé' ? '#10b981' : 'rgba(255,255,255,0.2)'}`,
                                            background: obj.status === 'terminé' ? '#10b981' : 'transparent', cursor: 'pointer',
                                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        }}
                                    >
                                        {obj.status === 'terminé' && <svg width="10" height="8" viewBox="0 0 10 8"><path d="M1 4l3 3 5-6" stroke="#fff" strokeWidth="1.5" fill="none" strokeLinecap="round" /></svg>}
                                    </button>
                                    <span style={{ fontSize: '16px', fontWeight: 600, color: obj.status === 'terminé' ? '#6b7280' : '#fff', textDecoration: obj.status === 'terminé' ? 'line-through' : 'none' }}>
                                        {obj.title}
                                    </span>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                    <span style={{ fontSize: '13px', color: '#6b7280' }}>→ {obj.targetDate}</span>
                                    <ChevronRight size={16} color="#6b7280" />
                                </div>
                            </div>
                            <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
                                <span style={{ padding: '3px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: 700, background: 'rgba(99,102,241,0.15)', color: '#818cf8' }}>
                                    {obj.domain}
                                </span>
                                <span style={{ padding: '3px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: 700, background: `${PRIORITY_COLORS[obj.priority]}20`, color: PRIORITY_COLORS[obj.priority] }}>
                                    {PRIORITY_LABELS[obj.priority]}
                                </span>
                                <span style={{
                                    padding: '3px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: 700,
                                    background: obj.status === 'actif' ? 'rgba(99,102,241,0.1)' : obj.status === 'terminé' ? 'rgba(16,185,129,0.1)' : 'rgba(107,114,128,0.1)',
                                    color: obj.status === 'actif' ? '#818cf8' : obj.status === 'terminé' ? '#34d399' : '#9ca3af',
                                }}>
                                    {obj.status === 'actif' ? '● Actif' : obj.status === 'terminé' ? '✓ Terminé' : '⏸ Pause'}
                                </span>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                <span style={{ fontSize: '12px', color: '#6b7280' }}>Progression</span>
                                <div style={{ flex: 1, height: '4px', background: 'rgba(255,255,255,0.08)', borderRadius: '2px' }}>
                                    <div style={{ height: '100%', width: `${obj.progress}%`, background: obj.status === 'terminé' ? '#10b981' : '#6366f1', borderRadius: '2px', transition: 'width 0.3s' }} />
                                </div>
                                <span style={{ fontSize: '13px', fontWeight: 600, color: obj.status === 'terminé' ? '#10b981' : '#6366f1', minWidth: '36px', textAlign: 'right' }}>{obj.progress}%</span>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* WIP Gate Modal */}
            {showWIPGate && (
                <WIPGateModal
                    count={wip.count}
                    limit={wip.limit}
                    highestProgress={highestProgress}
                    onForce={forceOpenModal}
                    onClose={() => setShowWIPGate(false)}
                    onFinishFirst={finishHighestAndAdd}
                />
            )}

            {/* Objective Form Modal */}
            {showModal && (
                <ObjectiveModal
                    title={editId ? "Modifier l'objectif" : 'Nouvel objectif'}
                    onClose={() => setShowModal(false)}
                    onSave={save}
                    form={form}
                    setForm={setForm}
                    domains={domains}
                    isEdit={!!editId}
                    onDelete={editId ? () => { deleteObjective(editId); setShowModal(false); } : undefined}
                />
            )}
        </div>
    );
};

const labelStyle: React.CSSProperties = { display: 'block', fontSize: '13px', color: '#9ca3af', marginBottom: '6px', fontWeight: 500 };
