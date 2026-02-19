
// Toggle this to false when you have real Supabase keys
const FORCE_DEMO = false;

const isDemo = FORCE_DEMO || !import.meta.env.VITE_SUPABASE_URL || import.meta.env.VITE_SUPABASE_URL.includes('placeholder');

class MockSupabase {
    constructor() {
        const safeParse = (key, fallback = null) => {
            try {
                const item = localStorage.getItem(key);
                if (!item || item === 'undefined') return fallback;
                return JSON.parse(item);
            } catch {
                return fallback;
            }
        };

        this.auth = {
            signUp: async ({ email, password, options }) => {
                const user = { id: 'demo-user-id', email, user_metadata: options?.data || {} };
                localStorage.setItem('pft_session', JSON.stringify({ user }));
                localStorage.setItem('pft_profile', JSON.stringify({
                    id: user.id,
                    full_name: options?.data?.full_name,
                    role: 'user',
                    base_currency: 'LKR'
                }));
                this._ensureSaaS(user.id);
                return { data: { user, session: { user } }, error: null };
            },
            signInWithPassword: async ({ email, password }) => {
                const role = email.includes('admin') ? 'superadmin' : 'user';
                const user = { id: role === 'superadmin' ? 'admin-id' : 'demo-user-id', email };
                localStorage.setItem('pft_session', JSON.stringify({ user }));

                let profile = safeParse('pft_profile');
                if (!profile || profile.id !== user.id) {
                    profile = {
                        id: user.id,
                        full_name: role === 'superadmin' ? 'System Admin' : 'Demo User',
                        role,
                        base_currency: 'LKR'
                    };
                    localStorage.setItem('pft_profile', JSON.stringify(profile));
                }

                this._ensureSaaS(user.id);
                return { data: { user, session: { user } }, error: null };
            },
            getSession: async () => {
                const session = safeParse('pft_session');
                return { data: { session }, error: null };
            },
            getUser: async () => {
                const session = safeParse('pft_session');
                return { data: { user: session?.user }, error: null };
            },
            signOut: async () => {
                localStorage.removeItem('pft_session');
                window.location.href = '/login';
                return { error: null };
            },
            onAuthStateChange: (callback) => {
                return { data: { subscription: { unsubscribe: () => { } } } };
            }
        };
    }

    _ensureSaaS(userId) {
        const safeParse = (key, fallback = []) => {
            try {
                const item = localStorage.getItem(key);
                if (!item || item === 'undefined') return fallback;
                return JSON.parse(item);
            } catch {
                return fallback;
            }
        };

        if (!localStorage.getItem('pft_user_status')) {
            localStorage.setItem('pft_user_status', JSON.stringify([{ user_id: userId, is_active: true }]));
        }
        if (!localStorage.getItem('pft_plans')) {
            localStorage.setItem('pft_plans', JSON.stringify([
                { id: 'plan-free', name: 'Free', price: 0, currency: 'LKR', features: { max_accounts: 2, max_investments: 3 } },
                { id: 'plan-std', name: 'Standard', price: 1500, currency: 'LKR', features: { max_accounts: 5, max_investments: 10 } },
                { id: 'plan-pro', name: 'Pro', price: 3500, currency: 'LKR', features: { max_accounts: 15, max_investments: 50, ai_insights: true } },
                { id: 'plan-ent', name: 'Enterprise', price: 10000, currency: 'LKR', features: { max_accounts: 999, max_investments: 999, ai_insights: true, priority_support: true } },
                { id: 'plan-ult', name: 'Ultimate', price: 25000, currency: 'LKR', features: { max_accounts: 9999, max_investments: 9999, ai_insights: true, priority_support: true, family_sharing: true } }
            ]));
        }
        const subs = safeParse('pft_subscriptions', []);
        if (!subs.find(s => s.user_id === userId)) {
            subs.push({
                id: 'sub-' + Math.random().toString(36).substr(2, 5),
                user_id: userId,
                plan_id: 'plan-free',
                status: 'active',
                start_date: new Date().toISOString()
            });
            localStorage.setItem('pft_subscriptions', JSON.stringify(subs));
        }
        if (!localStorage.getItem('pft_exchange_rates')) {
            localStorage.setItem('pft_exchange_rates', JSON.stringify([
                { id: '1', user_id: null, from_currency: 'USD', to_currency: 'LKR', rate: 295.0, rate_date: '2024-01-01' },
                { id: '2', user_id: null, from_currency: 'USD', to_currency: 'EUR', rate: 0.92, rate_date: '2024-01-01' },
                { id: '3', user_id: null, from_currency: 'USD', to_currency: 'GBP', rate: 0.79, rate_date: '2024-01-01' },
                { id: '4', user_id: null, from_currency: 'USD', to_currency: 'INR', rate: 83.0, rate_date: '2024-01-01' },
                { id: '5', user_id: null, from_currency: 'LKR', to_currency: 'USD', rate: 0.0034, rate_date: '2024-01-01' }
            ]));
        }
        if (!localStorage.getItem('pft_pdcs')) {
            localStorage.setItem('pft_pdcs', JSON.stringify([
                { id: 'c1', user_id: userId, cheque_number: 'CHQ-8822', bank_name: 'Sampath Bank', payee_payer: 'Modern Tech Solutions', amount: 45000, maturity_date: '2024-06-15', type: 'issued', status: 'pending' },
                { id: 'c2', user_id: userId, cheque_number: 'CHQ-1102', bank_name: 'Commercial Bank', payee_payer: 'JK Holdings', amount: 125000, maturity_date: '2024-07-02', type: 'received', status: 'pending' }
            ]));
        }
        if (!localStorage.getItem('pft_families')) {
            localStorage.setItem('pft_families', JSON.stringify([]));
        }
        if (!localStorage.getItem('pft_family_members')) {
            localStorage.setItem('pft_family_members', JSON.stringify([]));
        }
        if (!localStorage.getItem('pft_subscription_requests')) {
            localStorage.setItem('pft_subscription_requests', JSON.stringify([]));
        }
        if (!localStorage.getItem('pft_user_dashboard_settings')) {
            localStorage.setItem('pft_user_dashboard_settings', JSON.stringify([{
                user_id: userId,
                active_workspace_id: 'w1',
                workspaces: [
                    {
                        id: 'w1',
                        name: 'Core Terminal',
                        layout: [
                            { i: 'overview', x: 0, y: 0, w: 12, h: 4 },
                            { i: 'income_expense', x: 0, y: 4, w: 8, h: 10 },
                            { i: 'recent_tx', x: 8, y: 4, w: 4, h: 10 },
                            { i: 'accounts', x: 0, y: 14, w: 6, h: 8 },
                            { i: 'pdcs', x: 6, y: 14, w: 6, h: 8 }
                        ],
                        enabled_widgets: ['overview', 'income_expense', 'recent_tx', 'accounts', 'pdcs'],
                        widget_configs: {}
                    }
                ],
                theme: 'light',
                currency: 'LKR'
            }]));
        }
    }

    from(table) {
        const tableKey = `pft_${table}`;
        const safeParse = (key, fallback = []) => {
            try {
                const item = localStorage.getItem(key);
                if (!item || item === 'undefined') return fallback;
                return JSON.parse(item);
            } catch {
                return fallback;
            }
        };

        let data = safeParse(tableKey, []);

        if (table === 'profiles' && data.length === 0) {
            const profile = safeParse('pft_profile', null);
            data = profile ? [profile] : [];
        }

        const builder = (currentData) => {
            const runner = {
                data: currentData,
                select: (q) => {
                    if (table === 'subscriptions' && q?.includes('plans')) {
                        const plans = safeParse('pft_plans', []) || [];
                        currentData = currentData.map(s => ({ ...s, plans: plans.find(p => p.id === s.plan_id) }));
                    }
                    if (table === 'subscription_requests' && q?.includes('profiles')) {
                        const profiles = safeParse('pft_profiles', []) || [];
                        const plans = safeParse('pft_plans', []) || [];
                        currentData = currentData.map(r => ({
                            ...r,
                            profiles: profiles.find(p => p.id === r.user_id),
                            plans: plans.find(p => p.id === r.plan_id)
                        }));
                    }
                    return runner;
                },
                eq: (col, val) => {
                    const filtered = currentData.filter(i => i[col] === val || i.user_id === val || i.id === val);
                    // Exchange rates special global logic
                    if (table === 'exchange_rates' && col === 'user_id') {
                        const globals = safeParse('pft_exchange_rates', []).filter(r => r.user_id === null);
                        return builder([...new Set([...globals, ...filtered])]);
                    }
                    return builder(filtered);
                },
                single: async () => ({ data: currentData[0] || null, error: null }),
                order: (col, { ascending } = {}) => {
                    const sorted = [...currentData].sort((a, b) => ascending ? (a[col] > b[col] ? 1 : -1) : (a[col] < b[col] ? 1 : -1));
                    return builder(sorted);
                },
                limit: (n) => ({ then: (cb) => cb({ data: currentData.slice(0, n), error: null }) }),
                then: (callback) => {
                    const res = { data: currentData, error: null };
                    return Promise.resolve(callback ? callback(res) : res);
                }
            };
            return runner;
        };

        return {
            select: (q) => builder(data).select(q),
            insert: (newVal) => {
                return {
                    select: () => ({
                        single: async () => {
                            const existing = JSON.parse(localStorage.getItem(tableKey)) || [];
                            const item = { id: Math.random().toString(36).substr(2, 9), ...newVal, created_at: new Date().toISOString() };
                            localStorage.setItem(tableKey, JSON.stringify([...existing, item]));
                            return { data: item, error: null };
                        }
                    }),
                    then: (cb) => {
                        const existing = JSON.parse(localStorage.getItem(tableKey)) || [];
                        const item = { id: Math.random().toString(36).substr(2, 9), ...newVal, created_at: new Date().toISOString() };
                        localStorage.setItem(tableKey, JSON.stringify([...existing, item]));
                        return Promise.resolve(cb ? cb({ data: [item], error: null }) : { data: [item], error: null });
                    }
                }
            },
            update: (updateVal) => ({
                eq: (col, val) => ({
                    then: (cb) => {
                        const existing = JSON.parse(localStorage.getItem(tableKey)) || [];
                        const updated = existing.map(i => (i[col] === val || i.id === val) ? { ...i, ...updateVal } : i);
                        localStorage.setItem(tableKey, JSON.stringify(updated));
                        if (table === 'profiles' && updated[0]) {
                            localStorage.setItem('pft_profile', JSON.stringify(updated[0]));
                        }
                        return Promise.resolve(cb ? cb({ data: updated, error: null }) : { data: updated, error: null });
                    }
                })
            }),
            delete: () => ({
                eq: (col, val) => ({
                    then: (cb) => {
                        const existing = JSON.parse(localStorage.getItem(tableKey)) || [];
                        const filtered = existing.filter(i => i[col] !== val && i.id !== val);
                        localStorage.setItem(tableKey, JSON.stringify(filtered));
                        return Promise.resolve(cb ? cb({ error: null }) : { error: null });
                    }
                })
            })
        };
    }
}

import { createClient } from '@supabase/supabase-js'

// Read Supabase connection values from environment variables
const realUrl = import.meta.env.VITE_SUPABASE_URL;
const realKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

let client;
if (isDemo) {
    // Keep mock for local/demo but prefer real when env vars provided
    client = new MockSupabase();
} else {
    // Create a real Supabase client. Realtime is available via the `channel` API.
    client = createClient(realUrl, realKey, {
        // keep default realtime behavior; you can pass additional options here if needed
    });
}

export const supabase = client;

// Realtime helper for components: subscribe to Postgres changes for a table
// Usage: const sub = subscribeToTable('transactions', ['INSERT','UPDATE','DELETE'], payload => { ... });
// Call `sub.unsubscribe()` to stop listening.
export function subscribeToTable(table, events = ['INSERT', 'UPDATE', 'DELETE'], callback) {
    if (!client || typeof client.channel !== 'function') {
        console.warn('Realtime not available in demo mode or client not initialized.');
        return { unsubscribe: () => { } };
    }

    const eventFilter = events.map(e => e.toLowerCase()).join(',');
    const channel = client
        .channel(`public:${table}`)
        .on('postgres_changes', { event: eventFilter, schema: 'public', table }, (payload) => {
            try { callback(payload); } catch (e) { console.error(e); }
        })
        .subscribe();

    return {
        channel,
        unsubscribe: () => {
            try { channel.unsubscribe(); } catch (e) { /* ignore */ }
        }
    };
}
