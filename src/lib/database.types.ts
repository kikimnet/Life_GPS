// ─── Supabase Database Types (auto-generated via: npx supabase gen types) ────
// Run: npx supabase gen types typescript --project-id YOUR_PROJECT_ID > src/lib/database.types.ts

export type Plan = 'free' | 'pro' | 'premium' | 'admin';
export type SubscriptionStatus = 'active' | 'inactive' | 'past_due' | 'canceled';

export interface Database {
    public: {
        Tables: {
            profiles: {
                Row: {
                    id: string;
                    name: string | null;
                    plan: Plan;
                    stripe_customer_id: string | null;
                    stripe_subscription_id: string | null;
                    subscription_status: SubscriptionStatus;
                    created_at: string;
                };
                Insert: Partial<Database['public']['Tables']['profiles']['Row']> & { id: string };
                Update: Partial<Database['public']['Tables']['profiles']['Row']>;
            };
            objectives: {
                Row: {
                    id: string;
                    user_id: string;
                    title: string;
                    description: string | null;
                    domain: string;
                    priority: 'haute' | 'moyenne' | 'basse';
                    target_date: string | null;
                    success_indicator: string | null;
                    motivation: string | null;
                    status: 'actif' | 'terminé' | 'en-pause';
                    progress: number;
                    created_at: string;
                };
                Insert: Omit<Database['public']['Tables']['objectives']['Row'], 'id' | 'created_at'> & { id?: string };
                Update: Partial<Database['public']['Tables']['objectives']['Row']>;
            };
            domains: {
                Row: {
                    id: string;
                    user_id: string;
                    name: string;
                    vision: string | null;
                    description: string | null;
                    icon: string;
                    created_at: string;
                };
                Insert: Omit<Database['public']['Tables']['domains']['Row'], 'id' | 'created_at'> & { id?: string };
                Update: Partial<Database['public']['Tables']['domains']['Row']>;
            };
            action_plans: {
                Row: {
                    id: string;
                    user_id: string;
                    objective_id: string;
                    title: string;
                    description: string | null;
                    status: 'à faire' | 'en cours' | 'terminé';
                    created_at: string;
                };
                Insert: Omit<Database['public']['Tables']['action_plans']['Row'], 'id' | 'created_at'> & { id?: string };
                Update: Partial<Database['public']['Tables']['action_plans']['Row']>;
            };
            quarterly_plans: {
                Row: {
                    id: string;
                    user_id: string;
                    objective_id: string;
                    title: string;
                    quarter: 'Q1' | 'Q2' | 'Q3' | 'Q4';
                    year: number;
                    status: 'planifié' | 'en cours' | 'terminé';
                    created_at: string;
                };
                Insert: Omit<Database['public']['Tables']['quarterly_plans']['Row'], 'id' | 'created_at'> & { id?: string };
                Update: Partial<Database['public']['Tables']['quarterly_plans']['Row']>;
            };
            systems: {
                Row: {
                    id: string;
                    user_id: string;
                    name: string;
                    objective_id: string | null;
                    frequency: string;
                    normal_duration: number;
                    min_duration: number;
                    min_description: string | null;
                    is_active: boolean;
                    created_at: string;
                };
                Insert: Omit<Database['public']['Tables']['systems']['Row'], 'id' | 'created_at'> & { id?: string };
                Update: Partial<Database['public']['Tables']['systems']['Row']>;
            };
            missions: {
                Row: {
                    id: string;
                    user_id: string;
                    title: string;
                    mental_level: number;
                    objective_id: string | null;
                    date: string;
                    completed: boolean;
                    pomodoro_sessions: number;
                    created_at: string;
                };
                Insert: Omit<Database['public']['Tables']['missions']['Row'], 'id' | 'created_at'> & { id?: string };
                Update: Partial<Database['public']['Tables']['missions']['Row']>;
            };
            habit_checks: {
                Row: {
                    id: string;
                    user_id: string;
                    system_id: string;
                    date: string;
                    status: 'done' | 'minimum' | 'missed';
                };
                Insert: Omit<Database['public']['Tables']['habit_checks']['Row'], 'id'> & { id?: string };
                Update: Partial<Database['public']['Tables']['habit_checks']['Row']>;
            };
            weekly_focuses: {
                Row: {
                    id: string;
                    user_id: string;
                    week_start: string;
                    priority: string;
                    details: string | null;
                    week_days: string[];
                    created_at: string;
                };
                Insert: Omit<Database['public']['Tables']['weekly_focuses']['Row'], 'id' | 'created_at'> & { id?: string };
                Update: Partial<Database['public']['Tables']['weekly_focuses']['Row']>;
            };
            reviews: {
                Row: {
                    id: string;
                    user_id: string;
                    type: 'hebdo' | 'mensuel';
                    date: string;
                    period: string;
                    content: Record<string, string>;
                    created_at: string;
                };
                Insert: Omit<Database['public']['Tables']['reviews']['Row'], 'id' | 'created_at'> & { id?: string };
                Update: Partial<Database['public']['Tables']['reviews']['Row']>;
            };
            journal_entries: {
                Row: {
                    id: string;
                    user_id: string;
                    date: string;
                    title: string;
                    tag: 'leçon' | 'idée' | 'réflexion';
                    content: string;
                    created_at: string;
                };
                Insert: Omit<Database['public']['Tables']['journal_entries']['Row'], 'id' | 'created_at'> & { id?: string };
                Update: Partial<Database['public']['Tables']['journal_entries']['Row']>;
            };
            pomodoro_sessions: {
                Row: {
                    id: string;
                    user_id: string;
                    mission_id: string | null;
                    duration: number;
                    type: 'focus' | 'short-break' | 'long-break';
                    completed_at: string;
                };
                Insert: Omit<Database['public']['Tables']['pomodoro_sessions']['Row'], 'id'> & { id?: string };
                Update: Partial<Database['public']['Tables']['pomodoro_sessions']['Row']>;
            };
        };
        Views: {};
        Functions: {};
        Enums: {};
    };
}
