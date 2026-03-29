import { useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase, supabaseConfigured } from '../../lib/supabase';
import { Loader2, ArrowLeft, Mail } from 'lucide-react';

export const ForgotPassword = () => {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [sent, setSent] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!supabaseConfigured) return;
        setLoading(true);
        setError(null);

        const { error } = await supabase.auth.resetPasswordForEmail(email, {
            redirectTo: `${window.location.origin}/reset-password`,
        });

        if (error) {
            setError(error.message);
        } else {
            setSent(true);
        }
        setLoading(false);
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
                    <p style={{ color: '#6b7280', fontSize: '14px', margin: 0 }}>Réinitialisation du mot de passe</p>
                </div>

                <div style={{
                    background: '#1a1a1e', borderRadius: '20px',
                    border: '1px solid rgba(255,255,255,0.08)', padding: '32px',
                    boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)',
                }}>
                    {sent ? (
                        /* ── Success state ── */
                        <div style={{ textAlign: 'center' }}>
                            <div style={{
                                width: '56px', height: '56px', borderRadius: '50%',
                                background: 'rgba(16,185,129,0.15)', border: '1px solid rgba(16,185,129,0.3)',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                margin: '0 auto 16px',
                            }}>
                                <Mail size={24} color="#6ee7b7" />
                            </div>
                            <h2 style={{ color: '#e5e7eb', fontSize: '18px', fontWeight: 700, margin: '0 0 8px' }}>
                                Email envoyé !
                            </h2>
                            <p style={{ color: '#9ca3af', fontSize: '14px', margin: '0 0 24px', lineHeight: 1.6 }}>
                                Un lien de réinitialisation a été envoyé à <strong style={{ color: '#e5e7eb' }}>{email}</strong>.
                                Vérifiez votre boîte mail (et vos spams).
                            </p>
                            <Link to="/login" style={{
                                display: 'inline-flex', alignItems: 'center', gap: '6px',
                                color: '#6366f1', fontSize: '14px', textDecoration: 'none', fontWeight: 600,
                            }}>
                                <ArrowLeft size={16} /> Retour à la connexion
                            </Link>
                        </div>
                    ) : (
                        /* ── Form state ── */
                        <>
                            <h2 style={{ color: '#e5e7eb', fontSize: '18px', fontWeight: 700, margin: '0 0 8px' }}>
                                Mot de passe oublié ?
                            </h2>
                            <p style={{ color: '#9ca3af', fontSize: '14px', margin: '0 0 24px', lineHeight: 1.5 }}>
                                Entrez votre email et nous vous enverrons un lien pour réinitialiser votre mot de passe.
                            </p>

                            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                                <div>
                                    <label style={labelStyle}>Adresse email</label>
                                    <input
                                        type="email"
                                        value={email}
                                        onChange={e => setEmail(e.target.value)}
                                        placeholder="vous@exemple.com"
                                        required
                                        autoFocus
                                        style={inputStyle}
                                    />
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
                                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                                    marginTop: '4px',
                                }}>
                                    {loading && <Loader2 size={18} style={{ animation: 'spin 1s linear infinite' }} />}
                                    Envoyer le lien de réinitialisation
                                </button>
                            </form>

                            <div style={{ textAlign: 'center', marginTop: '20px' }}>
                                <Link to="/login" style={{
                                    display: 'inline-flex', alignItems: 'center', gap: '6px',
                                    color: '#6b7280', fontSize: '13px', textDecoration: 'none',
                                }}>
                                    <ArrowLeft size={14} /> Retour à la connexion
                                </Link>
                            </div>
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
