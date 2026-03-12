import { createContext, useContext, useState, useCallback } from 'react';

// ─── Types ─────────────────────────────────────────────────────────────────────

export type Priority = 'haute' | 'moyenne' | 'basse';
export type ObjectifStatus = 'actif' | 'terminé' | 'en-pause';
export type MentalLevel = 1 | 2 | 3 | 4 | 5;
export type JournalTag = 'leçon' | 'idée' | 'réflexion';
export type ReviewType = 'hebdo' | 'mensuel';

export const MENTAL_LEVELS: Record<MentalLevel, { label: string; short: string; color: string; bg: string }> = {
    5: { label: 'L5 Visionnaire', short: 'L5', color: '#a78bfa', bg: 'rgba(167,139,250,0.15)' },
    4: { label: 'L4 Stratégique', short: 'L4', color: '#818cf8', bg: 'rgba(129,140,248,0.15)' },
    3: { label: 'L3 Analyse', short: 'L3', color: '#60a5fa', bg: 'rgba(96,165,250,0.15)' },
    2: { label: 'L2 Opérationnel', short: 'L2', color: '#34d399', bg: 'rgba(52,211,153,0.15)' },
    1: { label: 'L1 Administratif', short: 'L1', color: '#9ca3af', bg: 'rgba(156,163,175,0.15)' },
};

export const LIFE_DOMAINS = [
    'Carrière', 'Finance', 'Famille et amis', 'Développement personnel', 'Spiritualité', 'Santé et bien être'
];

export const DOMAIN_COLORS: Record<string, { color: string; bg: string; icon: string }> = {
    'Carrière': { color: '#34d399', bg: '#064e3b', icon: '💼' },
    'Finance': { color: '#60a5fa', bg: '#1e3a5f', icon: '💰' },
    'Famille et amis': { color: '#fbbf24', bg: '#78350f', icon: '⭐' },
    'Développement personnel': { color: '#f472b6', bg: '#831843', icon: '🎯' },
    'Spiritualité': { color: '#a78bfa', bg: '#4c1d95', icon: '✨' },
    'Santé et bien être': { color: '#2dd4bf', bg: '#134e4a', icon: '🌿' },
};

// ─── Entity Types ──────────────────────────────────────────────────────────────

export type Domain = {
    id: string;
    name: string;
    vision: string;
    description: string;
    icon?: string;
};

export type Objective = {
    id: string;
    title: string;
    description: string;
    domain: string;
    priority: Priority;
    targetDate: string;
    successIndicator: string;
    motivation?: string;
    status: ObjectifStatus;
    progress: number;
};

export type ActionPlan = {
    id: string;
    objectiveId: string;
    description: string;
    obstacles: string;
    resources: string;
    status: 'todo' | 'in-progress' | 'done';
    createdAt: string;
};

export type QuarterlyPlan = {
    id: string;
    objectiveId: string;
    quarter: string; // e.g. "Q1"
    year: number;
    keyActions: string;
    successCriteria: string;
    status: 'planifié' | 'en-cours' | 'terminé';
    progress: number;
};

export type SystemHabit = {
    id: string;
    name: string;
    objectiveId?: string;
    frequency: 'quotidien' | 'hebdomadaire' | 'jours-spécifiques';
    normalDuration: number; // minutes
    minDuration: number; // minutes (MVD)
    minDescription: string; // what to do minimum
    isActive: boolean;
};

export type Mission = {
    id: string;
    title: string;
    details: string;
    mentalLevel: MentalLevel;
    objectiveId?: string;
    estimatedMinutes: number;
    date: string;
    completed: boolean;
    pomodoroSessions: number;
};

export type HabitCheck = {
    id: string;
    systemId: string;
    date: string; // YYYY-MM-DD
    status: 'done' | 'minimum' | 'missed';
};

export type WeeklyFocus = {
    id: string;
    weekStart: string; // YYYY-MM-DD
    priority: string;
    details: string;
    weekDays: string[];
};

export type Review = {
    id: string;
    type: ReviewType;
    date: string;
    period: string;
    content: Record<string, string>;
};

export type JournalEntry = {
    id: string;
    date: string;
    title: string;
    tag: JournalTag;
    content: string;
};

export type PomodoroSession = {
    id: string;
    missionId?: string;
    duration: number;
    type: 'focus' | 'short-break' | 'long-break';
    completedAt: string;
};

// ─── Context ───────────────────────────────────────────────────────────────────

interface AppState {
    // Data
    domains: Domain[];
    objectives: Objective[];
    actionPlans: ActionPlan[];
    quarterlyPlans: QuarterlyPlan[];
    systems: SystemHabit[];
    missions: Mission[];
    habitChecks: HabitCheck[];
    weeklyFocuses: WeeklyFocus[];
    reviews: Review[];
    journal: JournalEntry[];
    pomodoroSessions: PomodoroSession[];
    isMVDMode: boolean;
    wipLimit: number;

    // Domain actions
    addDomain: (d: Omit<Domain, 'id'>) => void;
    updateDomain: (id: string, d: Partial<Domain>) => void;
    deleteDomain: (id: string) => void;

    // WIP
    setWipLimit: (limit: number) => void;
    getWIPStatus: () => { count: number; limit: number; exceeded: boolean; pct: number; color: string; label: string };

    // Objective actions
    addObjective: (o: Omit<Objective, 'id' | 'progress'>) => void;
    updateObjective: (id: string, o: Partial<Objective>) => void;
    deleteObjective: (id: string) => void;
    updateObjectiveProgress: (id: string, progress: number) => void;

    // Action Plan actions
    addActionPlan: (p: Omit<ActionPlan, 'id' | 'status' | 'createdAt'>) => void;
    updateActionPlan: (id: string, p: Partial<ActionPlan>) => void;
    deleteActionPlan: (id: string) => void;

    // Quarterly Plan actions
    addQuarterlyPlan: (q: Omit<QuarterlyPlan, 'id'>) => void;
    updateQuarterlyPlan: (id: string, q: Partial<QuarterlyPlan>) => void;
    deleteQuarterlyPlan: (id: string) => void;

    // Systems actions
    addSystem: (s: Omit<SystemHabit, 'id'>) => void;
    updateSystem: (id: string, s: Partial<SystemHabit>) => void;
    deleteSystem: (id: string) => void;

    // Mission actions
    addMission: (m: Omit<Mission, 'id' | 'date' | 'completed' | 'pomodoroSessions'>) => void;
    toggleMission: (id: string) => void;
    deleteMission: (id: string) => void;

    // Habit check actions
    checkHabit: (systemId: string, date: string, status: 'done' | 'minimum' | 'missed') => void;
    getHabitStatus: (systemId: string, date: string) => 'done' | 'minimum' | 'missed' | null;
    toggleMVDMode: () => void;

    // Weekly Focus actions
    addWeeklyFocus: (f: Omit<WeeklyFocus, 'id'>) => void;
    getCurrentWeekFocus: () => WeeklyFocus | null;

    // Review actions
    addReview: (r: Omit<Review, 'id'>) => void;
    deleteReview: (id: string) => void;

    // Journal actions
    addJournalEntry: (e: Omit<JournalEntry, 'id'>) => void;
    updateJournalEntry: (id: string, e: Partial<JournalEntry>) => void;
    deleteJournalEntry: (id: string) => void;

    // Pomodoro actions
    addPomodoroSession: (s: Omit<PomodoroSession, 'id' | 'completedAt'>) => void;

    // Computed
    getTodaysMissions: () => Mission[];
    getTodaysHabits: () => SystemHabit[];
    getObjectiveProgress: (id: string) => number;
    getDomainProgress: (domain: string) => number;
    getWeeklyStats: () => { consistency: number; executionRate: number; focusScore: number };
}

const AppContext = createContext<AppState | undefined>(undefined);

// ─── Sample Data ───────────────────────────────────────────────────────────────

const today = new Date().toISOString().split('T')[0];
const getWeekStart = () => {
    const d = new Date();
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1);
    d.setDate(diff);
    return d.toISOString().split('T')[0];
};

const sampleDomains: Domain[] = [
    { id: 'd1', name: 'Carrière', vision: 'Devenir expert dans mon domaine et contribuer à des projets impactants', description: '', icon: '💼' },
    { id: 'd2', name: 'Finance', vision: 'Réduire les dettes, investir intelligement et atteindre l\'indépendance financière', description: '', icon: '💰' },
    { id: 'd3', name: 'Famille et amis', vision: 'Cultiver des relations profondes et authentiques avec ma famille et mes amis', description: '', icon: '⭐' },
    { id: 'd4', name: 'Développement personnel', vision: 'Apprendre continuellement et développer ma discipline quotidienne', description: '', icon: '🎯' },
    { id: 'd5', name: 'Spiritualité', vision: 'Trouver la paix intérieure à travers la prière et le sentier d\'Allah', description: '', icon: '✨' },
    { id: 'd6', name: 'Santé et bien être', vision: 'Être en pleine forme physique et mentale, pratiquer le karaté régulièrement', description: '', icon: '🌿' },
];

const sampleObjectives: Objective[] = [
    { id: 'o1', title: 'Pratiquer le karaté régulièrement', description: '', domain: 'Santé et bien être', priority: 'haute', targetDate: '2026-09-01', successIndicator: 'Ceinture noire', motivation: '', status: 'actif', progress: 25 },
    { id: 'o2', title: 'Améliorer ma nutrition', description: '', domain: 'Santé et bien être', priority: 'moyenne', targetDate: '2026-06-01', successIndicator: 'Manger sainement 90% du temps', motivation: '', status: 'actif', progress: 10 },
    { id: 'o3', title: 'Lire 24 livres cette année', description: '', domain: 'Développement personnel', priority: 'moyenne', targetDate: '2026-12-31', successIndicator: '24 livres lus', motivation: '', status: 'actif', progress: 15 },
];

const sampleSystems: SystemHabit[] = [
    { id: 's1', name: 'Entraînement karaté', objectiveId: 'o1', frequency: 'jours-spécifiques', normalDuration: 60, minDuration: 30, minDescription: '30 min de katas à la maison', isActive: true },
    { id: 's2', name: 'Préparer un repas sain', objectiveId: 'o2', frequency: 'quotidien', normalDuration: 30, minDuration: 10, minDescription: 'Manger un fruit et boire de l\'eau', isActive: true },
    { id: 's3', name: 'Respiration 5 minutes', objectiveId: 'o1', frequency: 'quotidien', normalDuration: 5, minDuration: 2, minDescription: '3 respirations profondes', isActive: true },
    { id: 's4', name: 'Lire 30 minutes', objectiveId: 'o3', frequency: 'quotidien', normalDuration: 30, minDuration: 10, minDescription: 'Lire 5 pages', isActive: true },
    { id: 's5', name: 'Marche 20 minutes', objectiveId: 'o1', frequency: 'quotidien', normalDuration: 30, minDuration: 10, minDescription: '20 minutes de marche', isActive: true },
];

const sampleMissions: Mission[] = [];

const sampleWeeklyFocus: WeeklyFocus[] = [
    { id: 'wf1', weekStart: getWeekStart(), priority: 'Revenir à 3 entraînements de karaté cette semaine', details: 'Planifier les séances lundi, mercredi et vendredi', weekDays: ['LU', 'MA', 'ME', 'JE', 'VE', 'SA', 'DI'] },
];

const sampleJournal: JournalEntry[] = [];

const sampleReviews: Review[] = [];

const sampleHabitChecks: HabitCheck[] = [];

const sampleActionPlans: ActionPlan[] = [];

const sampleQuarterlyPlans: QuarterlyPlan[] = [];

// ─── Provider ──────────────────────────────────────────────────────────────────

export const AppProvider = ({ children }: { children: React.ReactNode }) => {
    const [domains, setDomains] = useState<Domain[]>(sampleDomains);
    const [objectives, setObjectives] = useState<Objective[]>(sampleObjectives);
    const [actionPlans, setActionPlans] = useState<ActionPlan[]>(sampleActionPlans);
    const [quarterlyPlans, setQuarterlyPlans] = useState<QuarterlyPlan[]>(sampleQuarterlyPlans);
    const [systems, setSystems] = useState<SystemHabit[]>(sampleSystems);
    const [missions, setMissions] = useState<Mission[]>(sampleMissions);
    const [habitChecks, setHabitChecks] = useState<HabitCheck[]>(sampleHabitChecks);
    const [weeklyFocuses, setWeeklyFocuses] = useState<WeeklyFocus[]>(sampleWeeklyFocus);
    const [reviews, setReviews] = useState<Review[]>(sampleReviews);
    const [journal, setJournal] = useState<JournalEntry[]>(sampleJournal);
    const [pomodoroSessions, setPomodoroSessions] = useState<PomodoroSession[]>([]);
    const [wipLimit, setWipLimit] = useState<number>(3);
    const [isMVDMode, setIsMVDMode] = useState(false);

    // ─── Domain ────────────────────────────────────────────────────────────────
    const addDomain = (d: Omit<Domain, 'id'>) =>
        setDomains(prev => [...prev, { ...d, id: `d${Date.now()}` }]);
    const updateDomain = (id: string, d: Partial<Domain>) =>
        setDomains(prev => prev.map(x => x.id === id ? { ...x, ...d } : x));
    const deleteDomain = (id: string) =>
        setDomains(prev => prev.filter(x => x.id !== id));

    // ─── Objectives ────────────────────────────────────────────────────────────
    const addObjective = (o: Omit<Objective, 'id' | 'progress'>) =>
        setObjectives(prev => [...prev, { ...o, id: `o${Date.now()}`, progress: 0 }]);
    const updateObjective = (id: string, o: Partial<Objective>) =>
        setObjectives(prev => prev.map(x => x.id === id ? { ...x, ...o } : x));
    const deleteObjective = (id: string) =>
        setObjectives(prev => prev.filter(x => x.id !== id));
    const updateObjectiveProgress = (id: string, progress: number) =>
        setObjectives(prev => prev.map(x => x.id === id ? { ...x, progress } : x));

    // ─── Action Plans ──────────────────────────────────────────────────────────
    const addActionPlan = (p: Omit<ActionPlan, 'id' | 'status' | 'createdAt'>) =>
        setActionPlans(prev => [...prev, { ...p, id: `ap${Date.now()}`, status: 'todo', createdAt: today }]);
    const updateActionPlan = (id: string, p: Partial<ActionPlan>) =>
        setActionPlans(prev => prev.map(x => x.id === id ? { ...x, ...p } : x));
    const deleteActionPlan = (id: string) =>
        setActionPlans(prev => prev.filter(x => x.id !== id));

    // ─── Quarterly Plans ───────────────────────────────────────────────────────
    const addQuarterlyPlan = (q: Omit<QuarterlyPlan, 'id'>) =>
        setQuarterlyPlans(prev => [...prev, { ...q, id: `qp${Date.now()}` }]);
    const updateQuarterlyPlan = (id: string, q: Partial<QuarterlyPlan>) =>
        setQuarterlyPlans(prev => prev.map(x => x.id === id ? { ...x, ...q } : x));
    const deleteQuarterlyPlan = (id: string) =>
        setQuarterlyPlans(prev => prev.filter(x => x.id !== id));

    // ─── Systems ───────────────────────────────────────────────────────────────
    const addSystem = (s: Omit<SystemHabit, 'id'>) =>
        setSystems(prev => [...prev, { ...s, id: `s${Date.now()}` }]);
    const updateSystem = (id: string, s: Partial<SystemHabit>) =>
        setSystems(prev => prev.map(x => x.id === id ? { ...x, ...s } : x));
    const deleteSystem = (id: string) =>
        setSystems(prev => prev.filter(x => x.id !== id));

    // ─── Missions ──────────────────────────────────────────────────────────────
    const addMission = (m: Omit<Mission, 'id' | 'date' | 'completed' | 'pomodoroSessions'>) =>
        setMissions(prev => [...prev, { ...m, id: `m${Date.now()}`, date: today, completed: false, pomodoroSessions: 0 }]);
    const toggleMission = (id: string) =>
        setMissions(prev => prev.map(x => x.id === id ? { ...x, completed: !x.completed } : x));
    const deleteMission = (id: string) =>
        setMissions(prev => prev.filter(x => x.id !== id));

    // ─── Habit Checks ──────────────────────────────────────────────────────────
    const checkHabit = (systemId: string, date: string, status: 'done' | 'minimum' | 'missed') => {
        setHabitChecks(prev => {
            const existing = prev.find(h => h.systemId === systemId && h.date === date);
            if (existing) return prev.map(h => h.systemId === systemId && h.date === date ? { ...h, status } : h);
            return [...prev, { id: `hc${Date.now()}`, systemId, date, status }];
        });
    };
    const getHabitStatus = useCallback((systemId: string, date: string): 'done' | 'minimum' | 'missed' | null => {
        const check = habitChecks.find(h => h.systemId === systemId && h.date === date);
        return check?.status ?? null;
    }, [habitChecks]);

    const toggleMVDMode = () => setIsMVDMode(prev => !prev);

    // ─── Weekly Focus ──────────────────────────────────────────────────────────
    const addWeeklyFocus = (f: Omit<WeeklyFocus, 'id'>) =>
        setWeeklyFocuses(prev => [...prev, { ...f, id: `wf${Date.now()}` }]);
    const getCurrentWeekFocus = useCallback((): WeeklyFocus | null => {
        const ws = getWeekStart();
        return weeklyFocuses.find(f => f.weekStart === ws) ?? weeklyFocuses[0] ?? null;
    }, [weeklyFocuses]);

    // ─── Reviews ───────────────────────────────────────────────────────────────
    const addReview = (r: Omit<Review, 'id'>) =>
        setReviews(prev => [{ ...r, id: `r${Date.now()}` }, ...prev]);
    const deleteReview = (id: string) =>
        setReviews(prev => prev.filter(x => x.id !== id));

    // ─── Journal ───────────────────────────────────────────────────────────────
    const addJournalEntry = (e: Omit<JournalEntry, 'id'>) =>
        setJournal(prev => [{ ...e, id: `j${Date.now()}` }, ...prev]);
    const updateJournalEntry = (id: string, e: Partial<JournalEntry>) =>
        setJournal(prev => prev.map(x => x.id === id ? { ...x, ...e } : x));
    const deleteJournalEntry = (id: string) =>
        setJournal(prev => prev.filter(x => x.id !== id));

    // ─── Pomodoro ──────────────────────────────────────────────────────────────
    const addPomodoroSession = (s: Omit<PomodoroSession, 'id' | 'completedAt'>) =>
        setPomodoroSessions(prev => [...prev, { ...s, id: `ps${Date.now()}`, completedAt: new Date().toISOString() }]);

    // ─── Computed ──────────────────────────────────────────────────────────────
    const getTodaysMissions = useCallback((): Mission[] => {
        return missions.filter(m => m.date === today);
    }, [missions]);

    const getTodaysHabits = useCallback((): SystemHabit[] => {
        return systems.filter(s => s.isActive);
    }, [systems]);

    const getObjectiveProgress = useCallback((id: string): number => {
        const obj = objectives.find(o => o.id === id);
        return obj?.progress ?? 0;
    }, [objectives]);

    const getDomainProgress = useCallback((domain: string): number => {
        const domObjectives = objectives.filter(o => o.domain === domain && o.status === 'actif');
        if (domObjectives.length === 0) return 0;
        return Math.round(domObjectives.reduce((sum, o) => sum + o.progress, 0) / domObjectives.length);
    }, [objectives]);

    const getWeeklyStats = useCallback(() => {
        const last7days = Array.from({ length: 7 }, (_, i) => {
            const d = new Date(); d.setDate(d.getDate() - i);
            return d.toISOString().split('T')[0];
        });
        const totalChecks = systems.length * 7;
        const doneChecks = habitChecks.filter(h => last7days.includes(h.date) && h.status === 'done').length;
        const consistency = totalChecks > 0 ? Math.round((doneChecks / totalChecks) * 100) : 0;
        const todayMissions = getTodaysMissions();
        const executionRate = todayMissions.length > 0
            ? Math.round((todayMissions.filter(m => m.completed).length / todayMissions.length) * 100)
            : 0;
        const todayPomodoros = pomodoroSessions.filter(p => p.completedAt.startsWith(today) && p.type === 'focus').length;
        const focusScore = Math.min(todayPomodoros * 20, 100);
        return { consistency, executionRate, focusScore };
    }, [systems, habitChecks, getTodaysMissions, pomodoroSessions]);

    const getWIPStatus = useCallback(() => {
        const count = objectives.filter(o => o.status === 'actif').length;
        const exceeded = count > wipLimit;
        const pct = Math.min((count / wipLimit) * 100, 100);
        const color = exceeded ? '#ef4444' : count === wipLimit ? '#f59e0b' : '#10b981';
        const label = exceeded
            ? `⚠️ WIP dépassé (${count}/${wipLimit})`
            : count === wipLimit
                ? `🟡 Limite atteinte (${count}/${wipLimit})`
                : `🟢 WIP OK (${count}/${wipLimit})`;
        return { count, limit: wipLimit, exceeded, pct, color, label };
    }, [objectives, wipLimit]);


    return (
        <AppContext.Provider value={{
            domains, objectives, actionPlans, quarterlyPlans, systems,
            missions, habitChecks, weeklyFocuses, reviews, journal, pomodoroSessions, isMVDMode,
            wipLimit, setWipLimit, getWIPStatus,
            addDomain, updateDomain, deleteDomain,
            addObjective, updateObjective, deleteObjective, updateObjectiveProgress,
            addActionPlan, updateActionPlan, deleteActionPlan,
            addQuarterlyPlan, updateQuarterlyPlan, deleteQuarterlyPlan,
            addSystem, updateSystem, deleteSystem,
            addMission, toggleMission, deleteMission,
            checkHabit, getHabitStatus, toggleMVDMode,
            addWeeklyFocus, getCurrentWeekFocus,
            addReview, deleteReview,
            addJournalEntry, updateJournalEntry, deleteJournalEntry,
            addPomodoroSession,
            getTodaysMissions, getTodaysHabits, getObjectiveProgress,
            getDomainProgress, getWeeklyStats,
        }}>
            {children}
        </AppContext.Provider>
    );
};

export const useApp = () => {
    const ctx = useContext(AppContext);
    if (!ctx) throw new Error('useApp must be inside AppProvider');
    return ctx;
};
