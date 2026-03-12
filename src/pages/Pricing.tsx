import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { track, Events } from '../lib/analytics';
import { Check, Zap } from 'lucide-react';

const stripeProPriceId = import.meta.env.VITE_STRIPE_PRO_PRICE_ID as string;
const stripePremiumPriceId = import.meta.env.VITE_STRIPE_PREMIUM_PRICE_ID as string;

interface PlanConfig {
    id: string;
    name: string;
    emoji: string;
    price: string;
    period: string;
    description: string;
    color: string;
    features: string[];
    cta: string;
    priceId?: string;
    popular?: boolean;
}

const PLANS: PlanConfig[] = [
    {
        id: 'free',
        name: 'Gratuit',
        emoji: '🆓',
        price: '0$',
        period: '/mois',
        description: 'Pour découvrir LifeGPS et démarrer.',
        color: '#6b7280',
        features: [
            'Gestion des tâches et objectifs',
            'Missions quotidiennes (jusqu\'à 5)',
            'Sessions Deep Work simples',
            'Tableau de bord de base',
            'Vision des domaines de vie',
        ],
        cta: 'Commencer gratuitement',
    },
    {
        id: 'pro',
        name: 'Pro',
        emoji: '⭐',
        price: '9$',
        period: '/mois',
        description: 'Pour les professionnels qui veulent performer.',
        color: '#f59e0b',
        popular: true,
        priceId: stripeProPriceId,
        features: [
            'Tout le plan Gratuit',
            'Statistiques avancées et graphiques',
            'Planification intelligente',
            'Recommandations automatiques',
            'Timer Pomodoro complet',
            'Suivi des habitudes (heatmap)',
            'Revues hebdomadaires et mensuelles',
            'Journal personnel',
            'Focus semaine',
            'Exercices de respiration',
        ],
        cta: 'Commencer l\'essai Pro',
    },
    {
        id: 'premium',
        name: 'Premium',
        emoji: '💎',
        price: '19$',
        period: '/mois',
        description: 'Accès complet à toutes les fonctionnalités.',
        color: '#a78bfa',
        priceId: stripePremiumPriceId,
        features: [
            'Tout le plan Pro',
            'Toutes les fonctionnalités actuelles et futures',
            'Support prioritaire',
            'Export de données',
            'Intégrations avancées',
            'Accès bêta aux nouvelles fonctionnalités',
        ],
        cta: 'Passer au Premium',
    },
];

export const Pricing = () => {
    const { user, plan } = useAuth();
    const navigate = useNavigate();
    const [loadingPlan, setLoadingPlan] = useState<string | null>(null);

    const handleSelectPlan = async (p: PlanConfig) => {
        if (p.id === 'free') {
            if (!user) navigate('/login');
            else navigate('/');
            return;
        }

        if (!user) {
            navigate('/login');
            return;
        }

        if (!p.priceId || p.priceId.startsWith('price_YOUR')) {
            alert('Stripe non configuré. Ajoutez vos VITE_STRIPE_*_PRICE_ID dans .env.local');
            return;
        }

        setLoadingPlan(p.id);
        track(Events.CHECKOUT_STARTED, { plan: p.id });

        // In production: call your Supabase Edge Function to create a Stripe Checkout session
        // const { data } = await supabase.functions.invoke('create-checkout', { body: { priceId: p.priceId } });
        // window.location.href = data.url;

        // For now, show instructions
        alert(`Stripe Checkout non encore configuré.\n\nPour activer:\n1. Créez un produit dans Stripe Dashboard\n2. Ajoutez le Price ID dans .env.local\n3. Déployez la Supabase Edge Function "create-checkout"`);
        setLoadingPlan(null);
    };

    return (
        <div style={{
            minHeight: '100vh', background: '#0e0e10', padding: '60px 20px',
            fontFamily: "'Inter', sans-serif", color: '#e5e7eb',
        }}>
            {/* BG glow */}
            <div style={{
                position: 'fixed', top: 0, left: '50%', transform: 'translateX(-50%)',
                width: '800px', height: '500px',
                background: 'radial-gradient(ellipse, rgba(99,102,241,0.08) 0%, transparent 70%)',
                pointerEvents: 'none',
            }} />

            {/* Header */}
            <div style={{ textAlign: 'center', maxWidth: '600px', margin: '0 auto 56px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', marginBottom: '20px' }}>
                    <div style={{
                        width: '40px', height: '40px', borderRadius: '10px',
                        background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px',
                    }}>🧭</div>
                    <span style={{ fontSize: '20px', fontWeight: 700, color: '#fff' }}>LifeGPS</span>
                </div>
                <h1 style={{ fontSize: '42px', fontWeight: 900, color: '#fff', margin: '0 0 16px', lineHeight: 1.2 }}>
                    Choisissez votre plan
                </h1>
                <p style={{ fontSize: '16px', color: '#9ca3af', margin: 0, lineHeight: 1.6 }}>
                    Le GPS de votre productivité. Simple à démarrer, puissant pour performer.
                </p>
            </div>

            {/* Plan cards */}
            <div style={{
                display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px',
                maxWidth: '1000px', margin: '0 auto 60px',
            }}>
                {PLANS.map(p => {
                    const isCurrent = p.id === plan;
                    const isLoading = loadingPlan === p.id;
                    return (
                        <div key={p.id} style={{
                            background: p.popular ? 'rgba(245,158,11,0.06)' : '#1a1a1e',
                            borderRadius: '20px', padding: '32px',
                            border: `2px solid ${p.popular ? p.color : isCurrent ? p.color + '60' : 'rgba(255,255,255,0.06)'}`,
                            position: 'relative', display: 'flex', flexDirection: 'column',
                        }}>
                            {p.popular && (
                                <div style={{
                                    position: 'absolute', top: '-14px', left: '50%', transform: 'translateX(-50%)',
                                    background: p.color, color: '#000', fontSize: '11px', fontWeight: 800,
                                    padding: '4px 14px', borderRadius: '20px', letterSpacing: '0.05em',
                                    display: 'flex', alignItems: 'center', gap: '4px', whiteSpace: 'nowrap',
                                }}>
                                    <Zap size={12} /> POPULAIRE
                                </div>
                            )}
                            {isCurrent && (
                                <div style={{
                                    position: 'absolute', top: '-14px', right: '16px',
                                    background: p.color, color: '#000', fontSize: '11px', fontWeight: 800,
                                    padding: '4px 12px', borderRadius: '20px',
                                }}>Plan actuel</div>
                            )}

                            <div style={{ fontSize: '28px', marginBottom: '8px' }}>{p.emoji}</div>
                            <div style={{ fontSize: '16px', fontWeight: 700, color: p.color, marginBottom: '4px' }}>{p.name}</div>
                            <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px', marginBottom: '8px' }}>
                                <span style={{ fontSize: '36px', fontWeight: 900, color: '#fff' }}>{p.price}</span>
                                <span style={{ fontSize: '14px', color: '#6b7280' }}>{p.period}</span>
                            </div>
                            <p style={{ fontSize: '13px', color: '#9ca3af', lineHeight: 1.5, margin: '0 0 24px' }}>{p.description}</p>

                            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '28px' }}>
                                {p.features.map((f, i) => (
                                    <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', fontSize: '14px', color: '#e5e7eb' }}>
                                        <Check size={16} style={{ color: p.color, flexShrink: 0, marginTop: '1px' }} />
                                        {f}
                                    </div>
                                ))}
                            </div>

                            <button onClick={() => handleSelectPlan(p)} disabled={isCurrent || isLoading} style={{
                                padding: '13px', borderRadius: '10px', border: 'none', fontSize: '14px', fontWeight: 700,
                                cursor: isCurrent ? 'default' : 'pointer',
                                background: isCurrent ? 'rgba(255,255,255,0.06)'
                                    : p.popular ? `linear-gradient(135deg, ${p.color}, ${p.color}cc)`
                                        : p.id === 'free' ? 'rgba(255,255,255,0.08)'
                                            : `${p.color}20`,
                                color: isCurrent ? '#6b7280' : p.id === 'free' ? '#e5e7eb' : p.popular ? '#000' : p.color,
                                border: `1px solid ${p.popular ? 'transparent' : p.color + '40'}`,
                                opacity: isLoading ? 0.7 : 1,
                            }}>
                                {isCurrent ? '✓ Plan actuel' : isLoading ? 'Redirection...' : p.cta}
                            </button>
                        </div>
                    );
                })}
            </div>

            {/* FAQ */}
            <div style={{ maxWidth: '600px', margin: '0 auto', textAlign: 'center' }}>
                <h2 style={{ fontSize: '20px', fontWeight: 700, color: '#fff', marginBottom: '16px' }}>Questions fréquentes</h2>
                {[
                    { q: 'Puis-je annuler à tout moment ?', a: 'Oui, vous pouvez annuler votre abonnement à tout moment depuis votre espace de facturation.' },
                    { q: 'Mes données sont-elles sécurisées ?', a: 'Vos données sont stockées dans une base Supabase sécurisée avec isolation totale par utilisateur (Row Level Security).' },
                    { q: 'Puis-je changer de plan ?', a: "Oui, vous pouvez passer d'un plan à un autre à tout moment. La différence de prix est calculée au prorata." },
                ].map((faq, i) => (
                    <div key={i} style={{ marginBottom: '16px', padding: '16px 20px', background: '#1a1a1e', borderRadius: '12px', textAlign: 'left', border: '1px solid rgba(255,255,255,0.06)' }}>
                        <div style={{ fontWeight: 600, color: '#e5e7eb', marginBottom: '6px' }}>{faq.q}</div>
                        <div style={{ fontSize: '14px', color: '#9ca3af', lineHeight: 1.6 }}>{faq.a}</div>
                    </div>
                ))}
            </div>
        </div>
    );
};
