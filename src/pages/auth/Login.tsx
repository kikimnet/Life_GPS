import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { track, Events } from '../../lib/analytics';
import { Eye, EyeOff, Loader2 } from 'lucide-react';

export const Login = () => {
    const { signIn, user, isDemo } = useAuth();
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Dès que l'utilisateur est authentifié, naviguer vers le dashboard
    useEffect(() => {
        if (user || isDemo) {
            navigate('/', { replace: true });
        }
    }, [user, isDemo, navigate]);
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setLoading(true);

        const timeout = new Promise<{ error: string }>((resolve) =>
            setTimeout(() => resolve({ error: 'Délai d\'attente dépassé. Vérifiez votre connexion ou réessayez.' }), 12000)
        );

        try {
            const result = await Promise.race([
                signIn(email, password),
                timeout,
            ]) as { error: string | null };

            if (result.error) {
                setError(result.error);
            } else {
                track(Events.USER_SIGNED_IN);
            }
        } catch (err: any) {
            setError(err.message || 'Une erreur inattendue est survenue.');
        } finally {
            setLoading(false);
        }
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

                {/* Beta badge */}
                <div style={{
                    textAlign: 'center', marginBottom: '20px',
                }}>
                    <span style={{
                        display: 'inline-flex', alignItems: 'center', gap: '6px',
                        padding: '6px 14px', borderRadius: '20px',
                        background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.25)',
                        fontSize: '12px', fontWeight: 700, color: '#f59e0b',
                        letterSpacing: '0.05em', textTransform: 'uppercase',
                    }}>
                        🔒 Bêta privée — Accès sur invitation
                    </span>
                </div>

                {/* Card — login only */}
                <div style={{
                    background: '#1a1a1e', borderRadius: '20px',
                    border: '1px solid rgba(255,255,255,0.08)', padding: '32px',
                    boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)',
                }}>
                    <div style={{
                        textAlign: 'center', marginBottom: '24px',
                        fontSize: '16px', fontWeight: 700, color: '#e5e7eb',
                    }}>
                        Connexion
                    </div>

                    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        <div>
                            <label style={labelStyle}>Adresse email</label>
                            <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                                placeholder="vous@exemple.com" required style={inputStyle} />
                        </div>
                        <div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '6px' }}>
                                <label style={{ ...labelStyle, marginBottom: 0 }}>Mot de passe</label>
                                <Link to="/forgot-password" style={{ fontSize: '12px', color: '#6366f1', textDecoration: 'none' }}>
                                    Mot de passe oublié ?
                                </Link>
                            </div>
                            <div style={{ position: 'relative' }}>
                                <input type={showPassword ? 'text' : 'password'} value={password}
                                    onChange={e => setPassword(e.target.value)}
                                    placeholder="Votre mot de passe"
                                    required
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

                        <button type="submit" disabled={loading} style={{
                            padding: '13px', borderRadius: '10px', border: 'none',
                            background: loading ? 'rgba(99,102,241,0.5)' : 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                            color: '#fff', fontSize: '15px', fontWeight: 700,
                            cursor: loading ? 'default' : 'pointer',
                            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                            marginTop: '4px', transition: 'opacity 0.15s',
                        }}>
                            {loading && <Loader2 size={18} style={{ animation: 'spin 1s linear infinite' }} />}
                            Se connecter
                        </button>
                    </form>
                </div>

                {/* Footer */}
                <p style={{ textAlign: 'center', marginTop: '24px', fontSize: '12px', color: '#4b5563' }}>
                    L'inscription n'est pas encore disponible.<br />
                    Contactez l'administrateur pour obtenir un accès.
                </p>
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
