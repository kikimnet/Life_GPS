import type { ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth, hasAccess, type UserProfile } from '../context/AuthContext';
import type { Plan } from '../lib/database.types';
import { track, Events } from '../lib/analytics';
import { Lock } from 'lucide-react';

const PLAN_LABELS: Record<Plan, string> = {
    free: 'Gratuit',
    pro: 'Pro',
    premium: 'Premium',
    admin: 'Admin',
};

const PLAN_COLOR: Record<Plan, string> = {
    free: '#6b7280',
    pro: '#f59e0b',
    premium: '#a78bfa',
    admin: '#ef4444',
};

const PLAN_EMOJI: Record<Plan, string> = {
    free: '🆓',
    pro: '⭐',
    premium: '💎',
    admin: '🔑',
};

interface PlanGateProps {
    requiredPlan: Plan;
    children: ReactNode;
    /** Custom fallback instead of default upgrade card */
    fallback?: ReactNode;
    /** Show as inline small lock badge instead of full card */
    inline?: boolean;
}

/**
 * PlanGate — wraps any feature that requires a minimum plan.
 * If the user's plan is insufficient, shows an upgrade CTA.
 *
 * Usage:
 *   <PlanGate requiredPlan="pro">
 *     <Pomodoro />
 *   </PlanGate>
 */
export const PlanGate = ({ requiredPlan, children, fallback, inline }: PlanGateProps) => {
    const { plan } = useAuth();
    const navigate = useNavigate();

    if (hasAccess(plan, requiredPlan)) return <>{children}</>;

    if (fallback) return <>{fallback}</>;

    if (inline) {
        return (
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', opacity: 0.5, cursor: 'not-allowed' }}>
                <Lock size={14} color={PLAN_COLOR[requiredPlan]} />
                <span style={{ fontSize: '12px', color: PLAN_COLOR[requiredPlan], fontWeight: 600 }}>
                    {PLAN_EMOJI[requiredPlan]} {PLAN_LABELS[requiredPlan]}
                </span>
            </div>
        );
    }

    return (
        <div style={{
            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
            minHeight: '400px', padding: '40px', textAlign: 'center',
        }}>
            <div style={{
                background: '#1a1a1e', borderRadius: '20px', padding: '40px 48px',
                border: `1px solid ${PLAN_COLOR[requiredPlan]}30`, maxWidth: '420px',
            }}>
                <div style={{ fontSize: '48px', marginBottom: '16px' }}>{PLAN_EMOJI[requiredPlan]}</div>
                <h2 style={{ fontSize: '22px', fontWeight: 800, color: '#fff', margin: '0 0 10px' }}>
                    Fonctionnalité {PLAN_LABELS[requiredPlan]}
                </h2>
                <p style={{ fontSize: '14px', color: '#9ca3af', lineHeight: 1.6, margin: '0 0 28px' }}>
                    Cette fonctionnalité est disponible avec le plan{' '}
                    <strong style={{ color: PLAN_COLOR[requiredPlan] }}>{PLAN_LABELS[requiredPlan]}</strong>.
                    Passez au niveau supérieur pour y accéder.
                </p>

                {/* Feature bullets */}
                <div style={{ textAlign: 'left', marginBottom: '28px' }}>
                    {getFeatures(requiredPlan).map((f, i) => (
                        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '6px 0', fontSize: '14px', color: '#e5e7eb' }}>
                            <span style={{ color: PLAN_COLOR[requiredPlan] }}>✓</span> {f}
                        </div>
                    ))}
                </div>

                <button
                    onClick={() => {
                        track(Events.PLAN_UPGRADE_CLICKED, { from: plan, to: requiredPlan });
                        navigate('/pricing');
                    }}
                    style={{
                        width: '100%', padding: '13px', borderRadius: '10px', border: 'none',
                        background: `linear-gradient(135deg, ${PLAN_COLOR[requiredPlan]}, ${PLAN_COLOR[requiredPlan]}cc)`,
                        color: '#fff', fontSize: '15px', fontWeight: 700, cursor: 'pointer',
                    }}
                >
                    Passer au plan {PLAN_LABELS[requiredPlan]} →
                </button>
                <div style={{ fontSize: '12px', color: '#6b7280', marginTop: '12px' }}>
                    Annulable à tout moment
                </div>
            </div>
        </div>
    );
};

function getFeatures(plan: Plan): string[] {
    if (plan === 'pro') return [
        'Statistiques avancées et graphiques',
        'Planification intelligente',
        'Recommandations automatiques',
        'Timer Pomodoro complet',
        'Revues hebdo et mensuelles',
        'Journal personnel',
    ];
    if (plan === 'premium') return [
        'Toutes les fonctionnalités Pro',
        'Accès prioritaire aux nouvelles features',
        'Support prioritaire',
        'Export de données',
        'Intégrations avancées',
    ];
    return [];
}

// ─── Plan Badge (for Sidebar) ─────────────────────────────────────────────────
export const PlanBadge = ({ profile }: { profile: UserProfile | null }) => {
    const plan = profile?.plan ?? 'free';
    return (
        <div style={{
            display: 'inline-flex', alignItems: 'center', gap: '4px',
            padding: '2px 8px', borderRadius: '20px', fontSize: '10px', fontWeight: 700,
            background: `${PLAN_COLOR[plan]}20`, color: PLAN_COLOR[plan],
            border: `1px solid ${PLAN_COLOR[plan]}40`,
            textTransform: 'uppercase', letterSpacing: '0.05em',
        }}>
            {PLAN_EMOJI[plan]} {PLAN_LABELS[plan]}
        </div>
    );
};
