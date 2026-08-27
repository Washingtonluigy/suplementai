import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from 'react';
import { supabase } from '/app/lib/supabase.js';
import { Trophy, TrendingUp } from 'lucide-react';
export default function FranchiseeRanking({ franchiseId }) {
    const [ranking, setRanking] = useState([]);
    const [loading, setLoading] = useState(true);
    const [period, setPeriod] = useState('month');
    useEffect(() => {
        (async () => {
            const [{ data: sales }, { data: franchises }] = await Promise.all([
                supabase.from('sales').select('franchise_id, total, created_at'),
                supabase.from('franchises').select('*'),
            ]);
            if (!sales || !franchises) {
                setLoading(false);
                return;
            }
            const now = new Date();
            const filterDate = new Date();
            if (period === 'week')
                filterDate.setDate(now.getDate() - 7);
            if (period === 'month')
                filterDate.setMonth(now.getMonth() - 1);
            if (period === 'all')
                filterDate.setFullYear(2000);
            const map = new Map();
            for (const f of franchises) {
                map.set(f.id, { franchise_id: f.id, name: f.name, total: 0, count: 0, isMe: f.id === franchiseId });
            }
            for (const s of sales) {
                const d = new Date(s.created_at);
                if (d < filterDate)
                    continue;
                const entry = map.get(s.franchise_id);
                if (entry) {
                    entry.total += s.total;
                    entry.count += 1;
                }
            }
            setRanking(Array.from(map.values()).sort((a, b) => b.total - a.total));
            setLoading(false);
        })();
    }, [period, franchiseId]);
    const myPosition = ranking.findIndex(r => r.isMe) + 1;
    if (loading) {
        return _jsx("div", { className: "flex justify-center py-12", children: _jsx("div", { className: "w-6 h-6 border-2 border-zinc-700 border-t-[#FFE500] rounded-full animate-spin" }) });
    }
    return (_jsxs("div", { children: [_jsxs("div", { className: "flex items-center justify-between mb-6 flex-wrap gap-3", children: [_jsxs("div", { className: "bg-zinc-900 border border-[#FFE500]/30 rounded-xl p-4 flex items-center gap-3", children: [_jsx(Trophy, { size: 24, className: "text-[#FFE500]" }), _jsxs("div", { children: [_jsx("p", { className: "text-zinc-500 text-xs", children: "Sua posi\u00E7\u00E3o" }), _jsx("p", { className: "text-white font-bold text-lg", children: myPosition > 0 ? `${myPosition}º lugar` : '—' })] })] }), _jsx("div", { className: "flex gap-2", children: [
                            { key: 'week', label: 'Semana' },
                            { key: 'month', label: 'Mês' },
                            { key: 'all', label: 'Geral' },
                        ].map(p => (_jsx("button", { onClick: () => { setLoading(true); setPeriod(p.key); }, className: `text-xs px-3 py-1.5 rounded-lg font-medium transition-colors ${period === p.key ? 'bg-[#FFE500] text-black' : 'bg-zinc-800 text-zinc-400 hover:text-white'}`, children: p.label }, p.key))) })] }), ranking.length === 0 || ranking.every(r => r.total === 0) ? (_jsxs("div", { className: "text-center py-12", children: [_jsx(TrendingUp, { size: 40, className: "mx-auto text-zinc-700 mb-3" }), _jsx("p", { className: "text-zinc-400 text-sm", children: "Sem dados de vendas ainda." })] })) : (_jsx("div", { className: "space-y-2", children: ranking.map((entry, i) => (_jsxs("div", { className: `flex items-center gap-3 border rounded-lg p-4 transition-colors ${entry.isMe ? 'border-[#FFE500] bg-[#FFE500]/5' : 'border-zinc-800 bg-zinc-900'}`, children: [_jsx("div", { className: `w-10 h-10 rounded-lg flex items-center justify-center font-bold text-lg ${i < 3 ? 'bg-[#FFE500]/20 text-[#FFE500]' : 'bg-zinc-800 text-zinc-500'}`, children: i + 1 }), _jsxs("div", { className: "flex-1", children: [_jsxs("p", { className: `font-bold text-sm ${entry.isMe ? 'text-[#FFE500]' : 'text-white'}`, children: [entry.name, " ", entry.isMe && '(Você)'] }), _jsxs("p", { className: "text-zinc-500 text-xs", children: [entry.count, " vendas"] })] }), _jsxs("p", { className: "text-[#FFE500] font-bold text-lg", children: ["R$ ", entry.total.toFixed(2)] })] }, entry.franchise_id))) }))] }));
}
