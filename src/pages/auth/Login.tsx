import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { supabaseConfigured } from '../../lib/supabase';
import { track, Events } from '../../lib/analytics';
import { Eye, EyeOff, Loader2, Zap } from 'lucide-react';

type Tab = 'login' | 'register';

export const Login = () => {
    const { signIn, signUp, signInDemo } = useAuth();
    const navigate = useNavigate();
    const [tab, setTab] = useState<Tab>('login');
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);

    // Demo mode
    const [showDemoName, setShowDemoName] = useState(false);
    const [demoName, setDemoName] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setSuccess(null);
        setLoading(true);

        if (tab === 'login') {
            const { error } = await signIn(email, password);
            if (error) {
                setError(error);
            } else {
                track(Events.USER_SIGNED_IN);
                navigate('/');
            }
        } else {
            if (!name.trim()) { setError('Le nom est requis.'); setLoading(false); return; }
            if (password.length < 8) { setError('Le mot de passe doit faire au moins 8 caractères.'); setLoading(false); return; }
            const { error } = await signUp(email, password, name);
            if (error) {
                setError(error);
            } else {
                track(Events.USER_SIGNED_UP);
                setSuccess('Compte créé ! Vérifiez votre email pour confirmer votre inscription.');
            }
        }
        setLoading(false);
    };

    const handleDemo = () => {
        const finalName = demoName.trim() || 'Karim';
        track(Events.USER_SIGNED_IN, { mode: 'demo' });
        signInDemo(finalName);
        navigate('/');
    };

    return (
        <div style={{
            minHeight: '100vh', background: '#0e0e10',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            padding: '20px', fontFamily: "'Inter', sans-serif",
        }}>
            {/* Background glow */}
            <div style={{
                position: 'fixed', top: '20%', left: '50%', transform: 'translateX(-50%)',
                width: '600px', height: '400px', borderRadius: '50%',
                background: 'radial-gradient(ellipse, rgba(99,102,241,0.12) 0%, transparent 70%)',
                pointerEvents: 'none',
            }} />

            <div style={{ width: '100%', maxWidth: '440px' }}>
                {/* Logo */}
                <div style={{ textAlign: 'center', marginBottom: '36px' }}>
                    <div style={{
                        width: '52px', height: '52px', borderRadius: '14px',
                        background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: '24px', margin: '0 auto 12px',
                    }}>🧭</div>
                    <h1 style={{ fontSize: '28px', fontWeight: 800, color: '#fff', margin: '0 0 4px' }}>LifeGPS</h1>
                    <p style={{ color: '#6b7280', fontSize: '14px', margin: 0 }}>Le GPS de votre productivité</p>
                </div>

                {/* ── Demo Mode Banner (when Supabase not configured) ── */}
                {!supabaseConfigured && (
                    <div style={{
                        background: 'rgba(99,102,241,0.08)', border: '1px solid rgba(99,102,241,0.3)',
                        borderRadius: '14px', padding: '20px', marginBottom: '16px',
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
                            <Zap size={18} color="#6366f1" />
                            <span style={{ fontSize: '14px', fontWeight: 700, color: '#e5e7eb' }}>Accès rapide — Mode démo</span>
                        </div>
                        <p style={{ fontSize: '13px', color: '#9ca3af', margin: '0 0 14px', lineHeight: 1.5 }}>
                            Supabase n'est pas encore configuré. Accédez à l'application en mode démo avec accès <strong style={{ color: '#a78bfa' }}>Premium complet</strong>.
                        </p>

                        {showDemoName ? (
                            <div style={{ display: 'flex', gap: '8px' }}>
                                <input
                                    value={demoName}
                                    onChange={e => setDemoName(e.target.value)}
                                    onKeyDown={e => e.key === 'Enter' && handleDemo()}
                                    placeholder="Votre prénom (ex: Karim)"
                                    autoFocus
                                    style={{
                                        flex: 1, background: '#111113', border: '1px solid rgba(255,255,255,0.1)',
                                        borderRadius: '8px', padding: '10px 14px', color: '#e5e7eb',
                                        fontSize: '14px', fontFamily: 'inherit', outline: 'none',
                                    }}
                                />
                                <button onClick={handleDemo} style={{
                                    padding: '10px 18px', borderRadius: '8px', border: 'none',
                                    background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                                    color: '#fff', fontSize: '14px', fontWeight: 700, cursor: 'pointer',
                                }}>
                                    Entrer →
                                </button>
                            </div>
                        ) : (
                            <button onClick={() => setShowDemoName(true)} style={{
                                width: '100%', padding: '12px', borderRadius: '10px', border: 'none',
                                background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                                color: '#fff', fontSize: '14px', fontWeight: 700, cursor: 'pointer',
                                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                            }}>
                                <Zap size={16} /> Continuer en mode démo (Premium)
                            </button>
                        )}
                    </div>
                )}

                {/* Card */}
                <div style={{
                    background: '#1a1a1e', borderRadius: '20px',
                    border: '1px solid rgba(255,255,255,0.08)', padding: '32px',
                    boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)',
                    opacity: !supabaseConfigured ? 0.5 : 1,
                }}>
                    {!supabaseConfigured && (
                        <div style={{ textAlign: 'center', marginBottom: '16px', fontSize: '12px', color: '#6b7280' }}>
                            ⚠️ Connexion désactivée — Supabase non configuré
                        </div>
                    )}

                    {/* Tabs */}
                    <div style={{ display: 'flex', background: '#111113', borderRadius: '10px', padding: '3px', marginBottom: '28px' }}>
                        {(['login', 'register'] as Tab[]).map(t => (
                            <button key={t} onClick={() => { setTab(t); setError(null); setSuccess(null); }} style={{
                                flex: 1, padding: '9px', borderRadius: '8px', border: 'none', fontSize: '14px', fontWeight: 600,
                                cursor: 'pointer', transition: 'all 0.15s',
                                background: tab === t ? '#6366f1' : 'transparent',
                                color: tab === t ? '#fff' : '#6b7280',
                            }}>
                                {t === 'login' ? 'Connexion' : 'Inscription'}
                            </button>
                        ))}
                    </div>

                    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        {tab === 'register' && (
                            <div>
                                <label style={labelStyle}>Nom complet</label>
                                <input value={name} onChange={e => setName(e.target.value)} placeholder="Prénom Nom"
                                    disabled={!supabaseConfigured} required style={inputStyle} />
                            </div>
                        )}
                        <div>
                            <label style={labelStyle}>Adresse email</label>
                            <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                                placeholder="vous@exemple.com" disabled={!supabaseConfigured} required style={inputStyle} />
                        </div>
                        <div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '6px' }}>
                                <label style={{ ...labelStyle, marginBottom: 0 }}>Mot de passe {tab === 'register' && <span style={{ color: '#6b7280', fontWeight: 400 }}>(min. 8 caractères)</span>}</label>
                                {tab === 'login' && (
                                    <Link to="/forgot-password" style={{ fontSize: '12px', color: '#6366f1', textDecoration: 'none' }}>
                                        Mot de passe oublié ?
                                    </Link>
                                )}
                            </div>
                            <div style={{ position: 'relative' }}>
                                <input type={showPassword ? 'text' : 'password'} value={password}
                                    onChange={e => setPassword(e.target.value)}
                                    placeholder={tab === 'register' ? 'Créer un mot de passe' : 'Votre mot de passe'}
                                    disabled={!supabaseConfigured} required
                                    style={{ ...inputStyle, paddingRight: '44px' }} />
                                <button type="button" onClick={() => setShowPassword(v => !v)} style={{
                                    position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)',
                                    background: 'none', border: 'none', color: '#6b7280', cursor: 'pointer',
                                }}>
                                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>
                        </div>

                        {error && (
                            <div style={{ padding: '12px', borderRadius: '8px', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', color: '#fca5a5', fontSize: '13px' }}>
                                ⚠️ {error}
                            </div>
                        )}
                        {success && (
                            <div style={{ padding: '12px', borderRadius: '8px', background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.2)', color: '#6ee7b7', fontSize: '13px' }}>
                                ✅ {success}
                            </div>
                        )}

                        <button type="submit" disabled={loading || !supabaseConfigured} style={{
                            padding: '13px', borderRadius: '10px', border: 'none',
                            background: loading ? 'rgba(99,102,241,0.5)' : 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                            color: '#fff', fontSize: '15px', fontWeight: 700, cursor: (loading || !supabaseConfigured) ? 'default' : 'pointer',
                            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                            marginTop: '4px', transition: 'opacity 0.15s', opacity: !supabaseConfigured ? 0.4 : 1,
                        }}>
                            {loading && <Loader2 size={18} style={{ animation: 'spin 1s linear infinite' }} />}
                            {tab === 'login' ? 'Se connecter' : 'Créer mon compte'}
                        </button>
                    </form>

                    {tab === 'login' && (
                        <div style={{ textAlign: 'center', marginTop: '20px' }}>
                            <Link to="/pricing" style={{ fontSize: '13px', color: '#6366f1', textDecoration: 'none' }}>
                                Pas encore de compte ? Voir les plans →
                            </Link>
                        </div>
                    )}
                </div>

                {/* Plans teaser */}
                {tab === 'register' && (
                    <div style={{ marginTop: '20px', display: 'flex', gap: '8px', justifyContent: 'center', flexWrap: 'wrap' }}>
                        {[{ label: '🆓 Gratuit', desc: 'Pour commencer' }, { label: '⭐ Pro 9$/mois', desc: 'Statistiques & IA' }, { label: '💎 Premium 19$/mois', desc: 'Tout inclus' }].map(p => (
                            <div key={p.label} style={{ padding: '6px 12px', borderRadius: '8px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)', fontSize: '12px', color: '#9ca3af', textAlign: 'center' }}>
                                <div style={{ fontWeight: 600, color: '#e5e7eb' }}>{p.label}</div>
                                <div>{p.desc}</div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <style>{`@keyframes spin { from { transform: rotate(0deg) } to { transform: rotate(360deg) } }`}</style>
        </div>
    );
};

const labelStyle: React.CSSProperties = { display: 'block', fontSize: '13px', color: '#9ca3af', marginBottom: '6px', fontWeight: 500 };
const inputStyle: React.CSSProperties = {
    width: '100%', background: '#111113', border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: '8px', padding: '11px 14px', color: '#e5e7eb', fontSize: '14px',
    fontFamily: 'inherit', boxSizing: 'border-box', outline: 'none',
};
