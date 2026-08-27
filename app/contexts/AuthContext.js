import { jsx as _jsx } from "react/jsx-runtime";
import { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '/app/lib/supabase.js';
const AuthContext = createContext(null);
export function AuthProvider({ children }) {
    const [session, setSession] = useState(null);
    const [franchiseId, setFranchiseId] = useState(null);
    const [loading, setLoading] = useState(true);
    const resolveSession = async (s) => {
        setSession(s);
        if (s) {
            const role = s.user.user_metadata?.role;
            if (role !== 'master') {
                const { data } = await supabase
                    .from('franchise_users')
                    .select('franchise_id')
                    .eq('auth_user_id', s.user.id)
                    .maybeSingle();
                setFranchiseId(data?.franchise_id ?? null);
            }
            else {
                setFranchiseId(null);
            }
        }
        else {
            setFranchiseId(null);
        }
    };
    useEffect(() => {
        supabase.auth.getSession().then(({ data: { session: s } }) => {
            (async () => {
                await resolveSession(s);
                setLoading(false);
            })();
        });
        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, s) => {
            (async () => {
                await resolveSession(s);
                setLoading(false);
            })();
        });
        return () => subscription.unsubscribe();
    }, []);
    const signIn = async (email, password) => {
        const { error } = await supabase.auth.signInWithPassword({ email: email.trim().toLowerCase(), password });
        if (error)
            return { error: error.message };
        return { error: null };
    };
    const signOut = async () => {
        await supabase.auth.signOut();
    };
    const isMaster = session?.user.user_metadata?.role === 'master';
    return (_jsx(AuthContext.Provider, { value: { session, user: session?.user ?? null, isMaster, franchiseId, loading, signIn, signOut }, children: children }));
}
export function useAuth() {
    const ctx = useContext(AuthContext);
    if (!ctx)
        throw new Error('useAuth must be used within AuthProvider');
    return ctx;
}
