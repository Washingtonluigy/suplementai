import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from 'react';
import { supabase } from '/app/lib/supabase.js';
import { X, Trophy, TrendingUp } from 'lucide-react';
export default function RankingTool({ onClose }) {
    const [ranking, setRanking] = useState([]);
    const [loading, setLoading] = useState(true);
    const [period, setPeriod] = useState('month');
    const load = async () => {
        const { data: sales } = await supabase.from('sales').select('franchise_id, total, created_at');
        const { data: franchises } = await supabase.from('franchises').select('*');
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
            map.set(f.id, { franchise_id: f.id, name: f.name, total: 0, count: 0 });
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
    };
    useEffect(() => { load(); }, [period]);
    const medal = (i) => {
        if (i === 0)
            return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
        if (i === 1)
            return 'bg-zinc-400/20 text-zinc-300 border-zinc-400/30';
        if (i === 2)
            return 'bg-orange-600/20 text-orange-400 border-orange-600/30';
        return 'bg-zinc-800 text-zinc-500 border-zinc-700';
    };
    return (_jsx("div", { className: "fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm", onClick: onClose, children: _jsxs("div", { className: "bg-zinc-900 border border-zinc-800 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto", onClick: e => e.stopPropagation(), children: [_jsxs("div", { className: "flex items-center justify-between p-6 border-b border-zinc-800 sticky top-0 bg-zinc-900 z-10", children: [_jsxs("div", { className: "flex items-center gap-3", children: [_jsx("div", { className: "w-10 h-10 rounded-lg bg-[#FFE500]/10 flex items-center justify-center", children: _jsx(Trophy, { size: 20, className: "text-[#FFE500]" }) }), _jsxs("div", { children: [_jsx("h2", { className: "font-bold text-white text-lg", children: "Ranking de Faturamento" }), _jsx("p", { className: "text-zinc-500 text-xs", children: "Competi\u00E7\u00E3o entre as unidades" })] })] }), _jsx("button", { onClick: onClose, className: "text-zinc-400 hover:text-white transition-colors", children: _jsx(X, { size: 22 }) })] }), _jsxs("div", { className: "p-6", children: [_jsx("div", { className: "flex gap-2 mb-4", children: [
                                { key: 'week', label: 'Semana' },
                                { key: 'month', label: 'Mês' },
                                { key: 'all', label: 'Geral' },
                            ].map(p => (_jsx("button", { onClick: () => { setLoading(true); setPeriod(p.key); }, className: `text-xs px-3 py-1.5 rounded-lg font-medium transition-colors ${period === p.key ? 'bg-[#FFE500] text-black' : 'bg-zinc-800 text-zinc-400 hover:text-white'}`, children: p.label }, p.key))) }), loading ? (_jsx("div", { className: "flex justify-center py-8", children: _jsx("div", { className: "w-6 h-6 border-2 border-zinc-700 border-t-[#FFE500] rounded-full animate-spin" }) })) : ranking.length === 0 || ranking.every(r => r.total === 0) ? (_jsxs("div", { className: "text-center py-12", children: [_jsx(TrendingUp, { size: 40, className: "mx-auto text-zinc-700 mb-3" }), _jsx("p", { className: "text-zinc-400 text-sm", children: "Sem dados de vendas ainda." })] })) : (_jsx("div", { className: "space-y-2", children: ranking.map((entry, i) => (_jsxs("div", { className: `flex items-center gap-3 border rounded-lg p-3 ${medal(i)}`, children: [_jsx("div", { className: `w-10 h-10 rounded-lg flex items-center justify-center font-bold text-lg ${i < 3 ? '' : 'bg-zinc-700/50'}`, children: i + 1 }), _jsxs("div", { className: "flex-1", children: [_jsx("p", { className: "text-white font-bold text-sm", children: entry.name }), _jsxs("p", { className: "text-zinc-500 text-xs", children: [entry.count, " vendas"] })] }), _jsxs("p", { className: "text-[#FFE500] font-bold text-lg", children: ["R$ ", entry.total.toFixed(2)] })] }, entry.franchise_id))) }))] })] }) }));
}
