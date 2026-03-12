import { NavLink, useNavigate } from 'react-router-dom';
import {
    LayoutDashboard, Eye, Target, BookMarked, Calendar, RefreshCw,
    Zap, Activity, Timer, Focus, Wind, ClipboardList, CalendarDays,
    BookOpen, Settings, LogOut, Lock, CreditCard
} from 'lucide-react';
import { useAuth, hasAccess } from '../context/AuthContext';
import { PlanBadge } from './PlanGate';
import { track, Events, resetAnalytics } from '../lib/analytics';

const SectionLabel = ({ children }: { children: string }) => (
    <div style={{ padding: '16px 20px 6px', fontSize: '10px', fontWeight: 600, letterSpacing: '0.1em', color: '#6b7280', textTransform: 'uppercase' }}>
        {children}
    </div>
);

interface NavItemProps {
    to: string;
    icon: React.ReactNode;
    label: string;
    locked?: boolean;
}

const NavItem = ({ to, icon, label, locked }: NavItemProps) => (
    <NavLink
        to={to}
        style={({ isActive }) => ({
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            padding: '9px 16px',
            margin: '1px 8px',
            borderRadius: '8px',
            fontSize: '14px',
            fontWeight: 500,
            color: locked ? '#4b5563' : isActive ? '#fff' : '#9ca3af',
            background: isActive && !locked ? 'rgba(107,107,210,0.25)' : 'transparent',
            textDecoration: 'none',
            transition: 'all 0.15s ease',
            cursor: locked ? 'default' : 'pointer',
        })}
        onMouseEnter={e => {
            if (locked) return;
            const el = e.currentTarget;
            const isActive = el.getAttribute('aria-current') === 'page';
            if (!isActive) { el.style.color = '#fff'; el.style.background = 'rgba(255,255,255,0.05)'; }
        }}
        onMouseLeave={e => {
            if (locked) return;
            const el = e.currentTarget;
            const isActive = el.getAttribute('aria-current') === 'page';
            if (!isActive) { el.style.color = '#9ca3af'; el.style.background = 'transparent'; }
        }}
    >
        <span style={{ width: '18px', height: '18px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            {locked ? <Lock size={14} color="#4b5563" /> : icon}
        </span>
        <span style={{ flex: 1 }}>{label}</span>
        {locked && <span style={{ fontSize: '9px', background: 'rgba(245,158,11,0.15)', color: '#f59e0b', borderRadius: '4px', padding: '1px 5px', fontWeight: 700 }}>PRO</span>}
    </NavLink>
);

export const Sidebar = () => {
    const navigate = useNavigate();
    const { profile, plan, signOut } = useAuth();

    const isPro = hasAccess(plan, 'pro');

    const handleSignOut = async () => {
        track(Events.USER_SIGNED_OUT);
        resetAnalytics();
        await signOut();
        navigate('/login');
    };

    return (
        <aside style={{
            width: '220px',
            minHeight: '100vh',
            background: '#111113',
            borderRight: '1px solid rgba(255,255,255,0.06)',
            display: 'flex',
            flexDirection: 'column',
            flexShrink: 0,
            position: 'sticky',
            top: 0,
            maxHeight: '100vh',
            overflowY: 'auto',
        }}>
            {/* Logo */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '20px 20px 16px' }}>
                <div style={{
                    width: '32px', height: '32px', borderRadius: '8px',
                    background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px',
                }}>🧭</div>
                <span style={{ fontSize: '16px', fontWeight: 700, color: '#fff' }}>LifeGPS</span>
            </div>

            {/* Nav */}
            <nav style={{ flex: 1 }}>
                <SectionLabel>Vue d'ensemble</SectionLabel>
                <NavItem to="/" icon={<LayoutDashboard size={16} />} label="Dashboard" />
                <NavItem to="/vision" icon={<Eye size={16} />} label="Vision" />

                <SectionLabel>GPS</SectionLabel>
                <NavItem to="/objectifs" icon={<Target size={16} />} label="Objectifs" />
                <NavItem to="/plans" icon={<BookMarked size={16} />} label="Plans d'actions" />
                <NavItem to="/trimestriels" icon={<Calendar size={16} />} label="Plans Trimestriels" />
                <NavItem to="/systemes" icon={<RefreshCw size={16} />} label="Systèmes" />

                <SectionLabel>Quotidien</SectionLabel>
                <NavItem to="/deepwork" icon={<Zap size={16} />} label="Deep Work" />
                <NavItem to="/suivi" icon={<Activity size={16} />} label="Suivi" />
                <NavItem to="/respiration" icon={<Wind size={16} />} label="Respiration" />
                <NavItem to="/pomodoro" icon={<Timer size={16} />} label="Pomodoro" locked={!isPro} />
                <NavItem to="/focus-semaine" icon={<Focus size={16} />} label="Focus semaine" locked={!isPro} />

                <SectionLabel>Revues</SectionLabel>
                <NavItem to="/revue-hebdo" icon={<ClipboardList size={16} />} label="Revue Hebdo" locked={!isPro} />
                <NavItem to="/revue-mensuelle" icon={<CalendarDays size={16} />} label="Revue Mensuelle" locked={!isPro} />
                <NavItem to="/journal" icon={<BookOpen size={16} />} label="Journal" locked={!isPro} />
            </nav>

            {/* Bottom */}
            <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '12px', paddingBottom: '16px' }}>
                <NavItem to="/pricing" icon={<CreditCard size={16} />} label="Plans & Tarifs" />
                <NavItem to="/parametres" icon={<Settings size={16} />} label="Paramètres" />
                <button
                    onClick={handleSignOut}
                    style={{
                        display: 'flex', alignItems: 'center', gap: '10px',
                        padding: '9px 16px', margin: '1px 8px', borderRadius: '8px',
                        fontSize: '14px', fontWeight: 500, color: '#9ca3af',
                        background: 'transparent', border: 'none', cursor: 'pointer', width: 'calc(100% - 16px)',
                    }}
                >
                    <LogOut size={16} />
                    Se déconnecter
                </button>

                {/* User card */}
                <div style={{
                    margin: '8px 12px 0', padding: '10px 12px',
                    background: 'rgba(255,255,255,0.04)', borderRadius: '10px',
                    display: 'flex', alignItems: 'center', gap: '10px',
                }}>
                    <div style={{
                        width: '32px', height: '32px', borderRadius: '50%',
                        background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: '14px', fontWeight: 700, color: '#fff', flexShrink: 0,
                    }}>
                        {(profile?.name ?? 'U').charAt(0).toUpperCase()}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: '13px', fontWeight: 600, color: '#e5e7eb', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {profile?.name ?? 'Utilisateur'}
                        </div>
                        <PlanBadge profile={profile} />
                    </div>
                </div>
            </div>
        </aside>
    );
};
