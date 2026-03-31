import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import type { User, Session } from '@supabase/supabase-js';
import { supabase, supabaseConfigured } from '../lib/supabase';
import type { Plan } from '../lib/database.types';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface UserProfile {
    id: string;
    name: string | null;
    plan: Plan;
    stripe_customer_id: string | null;
    stripe_subscription_id: string | null;
    subscription_status: string;
    created_at: string;
}

interface AuthState {
    user: User | null;
    session: Session | null;
    profile: UserProfile | null;
    loading: boolean;
    plan: Plan;
    isDemo: boolean;
    signUp: (email: string, password: string, name: string) => Promise<{ error: string | null }>;
    signIn: (email: string, password: string) => Promise<{ error: string | null }>;
    signInDemo: (name?: string) => void;
    signOut: () => Promise<void>;
    refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthState | undefined>(undefined);

// ─── Plan helpers ─────────────────────────────────────────────────────────────

export const PLAN_LEVELS: Record<Plan, number> = {
    free: 0,
    pro: 1,
    premium: 2,
    admin: 99,
};

export const hasAccess = (userPlan: Plan, requiredPlan: Plan): boolean =>
    PLAN_LEVELS[userPlan] >= PLAN_LEVELS[requiredPlan];

// ─── Demo profile ──────────────────────────────────────────────────────────────
const DEMO_PROFILE: UserProfile = {
    id: 'demo-user',
    name: null, // will be set from localStorage or signInDemo param
    plan: 'premium', // demo gets full access
    stripe_customer_id: null,
    stripe_subscription_id: null,
    subscription_status: 'active',
    created_at: new Date().toISOString(),
};

const DEMO_KEY = 'lifegps_demo_name';

// ─── Admin emails (full access) ────────────────────────────────────────────────
const ADMIN_EMAILS = ['karim.laifaoui@gmail.com'];

// ─── Provider ─────────────────────────────────────────────────────────────────

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [user, setUser] = useState<User | null>(null);
    const [session, setSession] = useState<Session | null>(null);
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [loading, setLoading] = useState(true);
    const [isDemo, setIsDemo] = useState(false);

    const fetchProfile = async (userId: string, email?: string) => {
        const { data } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', userId)
            .single();

        const isAdmin = email ? ADMIN_EMAILS.includes(email.toLowerCase()) : false;

        if (data) {
            const profileData = data as UserProfile;
            // Override plan to admin if email is in admin list
            if (isAdmin && profileData.plan !== 'admin') {
                profileData.plan = 'admin';
                // Persist admin status to Supabase
                supabase.from('profiles').update({ plan: 'admin' } as any).eq('id', userId).then(() => {});
            }
            setProfile(profileData);
        } else if (isAdmin) {
            // No profile yet — create one as admin
            const adminProfile: UserProfile = {
                id: userId, name: email?.split('@')[0] ?? 'Admin', plan: 'admin',
                stripe_customer_id: null, stripe_subscription_id: null,
                subscription_status: 'active', created_at: new Date().toISOString(),
            };
            supabase.from('profiles').upsert({
                id: userId, name: adminProfile.name, plan: 'admin', subscription_status: 'active',
            } as any).then(() => {});
            setProfile(adminProfile);
        }
    };

    const refreshProfile = async () => {
        if (isDemo) return;
        if (user) await fetchProfile(user.id);
    };

    // ── Demo sign-in (local, no Supabase) ────────────────────────────────────
    const signInDemo = (name?: string) => {
        const savedName = name || localStorage.getItem(DEMO_KEY) || 'Utilisateur';
        if (name) localStorage.setItem(DEMO_KEY, name);
        const demoProfile = { ...DEMO_PROFILE, name: savedName };
        setProfile(demoProfile);
        setIsDemo(true);
        setLoading(false);
    };

    useEffect(() => {
        // Check if already in demo mode (persisted via localStorage flag)
        const demoActive = localStorage.getItem('lifegps_demo_active') === 'true';
        if (demoActive) {
            signInDemo();
            return;
        }

        if (!supabaseConfigured) {
            // Supabase not configured → stay on login page (not demo auto-login)
            setLoading(false);
            return;
        }

        // Safety timeout: force loading=false after 5s if Supabase doesn't respond
        const timeout = setTimeout(() => setLoading(false), 5000);

        // Real Supabase auth flow
        supabase.auth.getSession().then(({ data: { session } }) => {
            clearTimeout(timeout);
            setSession(session);
            setUser(session?.user ?? null);
            if (session?.user) fetchProfile(session.user.id, session.user.email ?? undefined);
            setLoading(false);
        });

        const { data: { subscription } } = supabase.auth.onAuthStateChange(
            async (_event, session) => {
                setSession(session);
                setUser(session?.user ?? null);
                if (session?.user) {
                    await fetchProfile(session.user.id, session.user.email ?? undefined);
                } else {
                    setProfile(null);
                }
                setLoading(false);
            }
        );

        return () => { subscription.unsubscribe(); clearTimeout(timeout); };
    }, []);

    // Persist demo flag so refresh keeps the demo session
    useEffect(() => {
        if (isDemo) {
            localStorage.setItem('lifegps_demo_active', 'true');
        }
    }, [isDemo]);

    const signUp = async (email: string, password: string, name: string) => {
        if (!supabaseConfigured) return { error: 'Supabase non configuré. Utilisez le mode démo.' };
        const { data, error } = await supabase.auth.signUp({
            email, password,
            options: { data: { name } },
        });
        if (error) return { error: error.message };
        if (data.user) {
            await supabase.from('profiles').upsert({
                id: data.user.id, name, plan: 'free', subscription_status: 'inactive',
            });
        }
        return { error: null };
    };

    const signIn = async (email: string, password: string) => {
        if (!supabaseConfigured) return { error: 'Supabase non configuré. Utilisez le mode démo ci-dessous.' };
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        return { error: error?.message ?? null };
    };

    const signOut = async () => {
        if (isDemo) {
            localStorage.removeItem('lifegps_demo_active');
            localStorage.removeItem(DEMO_KEY);
            (window as any).__lifegps_unsaved_changes = false;
            setIsDemo(false);
            setProfile(null);
            return;
        }
        // Timeout de 5s pour éviter que signOut reste bloqué indéfiniment
        try {
            await Promise.race([
                supabase.auth.signOut(),
                new Promise((_, reject) => setTimeout(() => reject(new Error('signOut timeout')), 5000)),
            ]);
        } catch (err) {
            console.warn('Supabase signOut timeout or error (ignored):', err);
        }
        (window as any).__lifegps_unsaved_changes = false;
        setUser(null);
        setSession(null);
        setProfile(null);
    };

    return (
        <AuthContext.Provider value={{
            user, session, profile, loading,
            plan: profile?.plan ?? 'free',
            isDemo,
            signUp, signIn, signInDemo, signOut, refreshProfile,
        }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error('useAuth must be inside AuthProvider');
    return ctx;
};
