import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { Loader2, Eye, EyeOff, CheckCircle, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

export const ResetPassword = () => {
    const navigate = useNavigate();
    const [password, setPassword] = useState('');
    const [confirm, setConfirm] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [done, setDone] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [accessToken, setAccessToken] = useState<string | null>(null);
    const [ready, setReady] = useState(false);

    // Parse the URL hash to extract the recovery tokens
    useEffect(() => {
        const hash = window.location.hash.substring(1);
        const params = new URLSearchParams(hash);
        const type = params.get('type');
        const token = params.get('access_token');
        const refresh = params.get('refresh_token');

        if (type === 'recovery' && token && refresh) {
            setAccessToken(token);
            // Set the session explicitly so supabase client is authenticated
            supabase.auth.setSession({ access_token: token, refresh_token: refresh })
                .then(({ error }) => {
                    if (error) {
                        setError('Lien invalide ou expiré. Demandez un nouveau lien.');
                    } else {
                        setReady(true);
                        // Clean the hash from the URL without reload
                        window.history.replaceState(null, '', window.location.pathname);
                    }
                });
        } else {
            // Fallback: maybe session already set (component re-render after setSession)
            supabase.auth.getSession().then(({ data: { session } }) => {
                if (session) {
                    setAccessToken(session.access_token);
                    setReady(true);
                } else {
                    setError('Lien invalide ou expiré. Demandez un nouveau lien de réinitialisation.');
                }
            });
        }
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        if (password.length < 8) {
            setError('Le mot de passe doit faire au moins 8 caractères.');
            return;
        }
        if (password !== confirm) {
            setError('Les mots de passe ne correspondent pas.');
            return;
        }

        if (!accessToken) {
            setError('Session expirée. Demandez un nouveau lien.');
            return;
        }

        setLoading(true);
        try {
            // Use direct fetch for reliability — avoids Supabase client caching issues
            const response = await fetch(
                `${import.meta.env.VITE_SUPABASE_URL}/auth/v1/user`,
                {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${accessToken}`,
                        'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY,
                    },
                    body: JSON.stringify({ password }),
                    signal: AbortSignal.timeout(15000),
                }
            );

            if (response.ok) {
                setDone(true);
                // Sign out to force fresh login with new password
                await supabase.auth.signOut();
                setTimeout(() => navigate('/login'), 2500);
            } else {
                const data = await response.json().catch(() => ({}));
                setError(data?.message || `Erreur ${response.status}. Demandez un nouveau lien.`);
            }
        } catch (err: unknown) {
            if (err instanceof Error && err.name === 'TimeoutError') {
                setError('La requête a expiré. Vérifiez votre connexion et réessayez.');
            } else {
                setError('Une erreur est survenue. Réessayez.');
            }
        }
        setLoading(false);
    };

    return (
        <div style={{
            minHeight: '100vh', background: '#0e0e10',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            padding: '20px', fontFamily: "'Inter', sans-serif",
        }}>
            <div style={{
                position: 'fixed', top: '20%', left: '50%', transform: 'translateX(-50%)',
                width: '600px', height: '400px', borderRadius: '50%',
                background: 'radial-gradient(ellipse, rgba(99,102,241,0.12) 0%, transparent 70%)',
                pointerEvents: 'none',
            }} />

            <div style={{ width: '100%', maxWidth: '440px' }}>
                <div style={{ textAlign: 'center', marginBottom: '36px' }}>
                    <div style={{
                        width: '52px', height: '52px', borderRadius: '14px',
                        background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: '24px', margin: '0 auto 12px',
                    }}>🧭</div>
                    <h1 style={{ fontSize: '28px', fontWeight: 800, color: '#fff', margin: '0 0 4px' }}>LifeGPS</h1>
                    <p style={{ color: '#6b7280', fontSize: '14px', margin: 0 }}>Nouveau mot de passe</p>
                </div>

                <div style={{
                    background: '#1a1a1e', borderRadius: '20px',
                    border: '1px solid rgba(255,255,255,0.08)', padding: '32px',
                    boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)',
                }}>
                    {done ? (
                        <div style={{ textAlign: 'center' }}>
                            <div style={{
                                width: '56px', height: '56px', borderRadius: '50%',
                                background: 'rgba(16,185,129,0.15)', border: '1px solid rgba(16,185,129,0.3)',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                margin: '0 auto 16px',
                            }}>
                                <CheckCircle size={24} color="#6ee7b7" />
                            </div>
                            <h2 style={{ color: '#e5e7eb', fontSize: '18px', fontWeight: 700, margin: '0 0 8px' }}>
                                Mot de passe mis à jour !
                            </h2>
                            <p style={{ color: '#9ca3af', fontSize: '14px', margin: 0 }}>
                                Redirection vers la connexion...
                            </p>
                        </div>
                    ) : !ready ? (
                        <div style={{ textAlign: 'center' }}>
                            {error ? (
                                <>
                                    <div style={{ padding: '12px', borderRadius: '8px', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', color: '#fca5a5', fontSize: '13px', marginBottom: '20px' }}>
                                        ⚠️ {error}
                                    </div>
                                    <Link to="/forgot-password" style={{
                                        display: 'inline-flex', alignItems: 'center', gap: '6px',
                                        color: '#6366f1', fontSize: '14px', textDecoration: 'none', fontWeight: 600,
                                    }}>
                                        <ArrowLeft size={16} /> Demander un nouveau lien
                                    </Link>
                                </>
                            ) : (
                                <>
                                    <Loader2 size={24} style={{ animation: 'spin 1s linear infinite', margin: '0 auto 12px', display: 'block' }} color="#6366f1" />
                                    <p style={{ color: '#9ca3af', fontSize: '14px', margin: 0 }}>Vérification du lien...</p>
                                </>
                            )}
                        </div>
                    ) : (
                        <>
                            <h2 style={{ color: '#e5e7eb', fontSize: '18px', fontWeight: 700, margin: '0 0 8px' }}>
                                Choisissez un nouveau mot de passe
                            </h2>
                            <p style={{ color: '#9ca3af', fontSize: '14px', margin: '0 0 24px' }}>Minimum 8 caractères.</p>

                            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                                <div>
                                    <label style={labelStyle}>Nouveau mot de passe</label>
                                    <div style={{ position: 'relative' }}>
                                        <input type={showPassword ? 'text' : 'password'} value={password}
                                            onChange={e => setPassword(e.target.value)}
                                            placeholder="Nouveau mot de passe" required autoFocus
                                            style={{ ...inputStyle, paddingRight: '44px' }} />
                                        <button type="button" onClick={() => setShowPassword(v => !v)} style={{
                                            position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)',
                                            background: 'none', border: 'none', color: '#6b7280', cursor: 'pointer',
                                        }}>
                                            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                        </button>
                                    </div>
                                </div>
                                <div>
                                    <label style={labelStyle}>Confirmer le mot de passe</label>
                                    <input type={showPassword ? 'text' : 'password'} value={confirm}
                                        onChange={e => setConfirm(e.target.value)}
                                        placeholder="Confirmer le mot de passe" required style={inputStyle} />
                                </div>

                                {error && (
                                    <div style={{ padding: '12px', borderRadius: '8px', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', color: '#fca5a5', fontSize: '13px' }}>
                                        ⚠️ {error}
                                    </div>
                                )}

                                <button type="submit" disabled={loading} style={{
                                    padding: '13px', borderRadius: '10px', border: 'none',
                                    background: loading ? 'rgba(99,102,241,0.5)' : 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                                    color: '#fff', fontSize: '15px', fontWeight: 700, cursor: loading ? 'default' : 'pointer',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginTop: '4px',
                                }}>
                                    {loading && <Loader2 size={18} style={{ animation: 'spin 1s linear infinite' }} />}
                                    Mettre à jour le mot de passe
                                </button>
                            </form>
                        </>
                    )}
                </div>
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
