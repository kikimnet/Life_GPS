import posthog from 'posthog-js';

const key = import.meta.env.VITE_POSTHOG_KEY as string;
const host = import.meta.env.VITE_POSTHOG_HOST as string;

let initialized = false;

export const initAnalytics = (userId?: string) => {
    if (!key || key === 'phc_YOUR_KEY_HERE') return; // Skip if not configured
    if (!initialized) {
        posthog.init(key, { api_host: host || 'https://app.posthog.com', autocapture: false });
        initialized = true;
    }
    if (userId) posthog.identify(userId);
};

export const track = (event: string, properties?: Record<string, unknown>) => {
    if (!initialized) return;
    posthog.capture(event, properties);
};

export const resetAnalytics = () => {
    if (!initialized) return;
    posthog.reset();
};

// ─── Event names (typed) ──────────────────────────────────────────────────────
export const Events = {
    // Auth
    USER_SIGNED_UP: 'user_signed_up',
    USER_SIGNED_IN: 'user_signed_in',
    USER_SIGNED_OUT: 'user_signed_out',
    // Objectives
    OBJECTIVE_CREATED: 'objective_created',
    OBJECTIVE_COMPLETED: 'objective_completed',
    // Deep Work
    MISSION_CREATED: 'mission_created',
    MISSION_COMPLETED: 'mission_completed',
    DEEP_WORK_STARTED: 'deep_work_started',
    // Pomodoro
    POMODORO_COMPLETED: 'pomodoro_completed',
    // Plans
    PLAN_UPGRADE_CLICKED: 'plan_upgrade_clicked',
    CHECKOUT_STARTED: 'checkout_started',
    PLAN_UPGRADED: 'plan_upgraded',
    // Breathing
    BREATHING_SESSION_COMPLETED: 'breathing_session_completed',
} as const;
