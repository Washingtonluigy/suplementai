import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from 'react';
import { supabase } from '/app/lib/supabase.js';
import { Store, Lock, Unlock, Clock, X } from 'lucide-react';
export default function FranchiseeCashRegister({ franchiseId }) {
    const [sessions, setSessions] = useState([]);
    const [currentSession, setCurrentSession] = useState(null);
    const [loading, setLoading] = useState(true);
    const [showOpen, setShowOpen] = useState(false);
    const [showClose, setShowClose] = useState(false);
    const [openingAmount, setOpeningAmount] = useState('');
    const [closingAmount, setClosingAmount] = useState('');
    const [notes, setNotes] = useState('');
    const [saving, setSaving] = useState(false);
    const load = async () => {
        const { data } = await supabase.from('cash_sessions').select('*').eq('franchise_id', franchiseId).order('created_at', { ascending: false });
        if (data) {
            setSessions(data);
            const open = data.find(s => s.status === 'open') ?? null;
            setCurrentSession(open);
        }
        setLoading(false);
    };
    useEffect(() => { load(); }, [franchiseId]);
    const openCash = async (e) => {
        e.preventDefault();
        setSaving(true);
        const { data } = await supabase.from('cash_sessions').insert({
            franchise_id: franchiseId,
            opening_amount: parseFloat(openingAmount) || 0,
            status: 'open',
        }).select().single();
        if (data) {
            setCurrentSession(data);
            setOpeningAmount('');
            setShowOpen(false);
        }
        setSaving(false);
        load();
    };
    const closeCash = async (e) => {
        e.preventDefault();
        if (!currentSession)
            return;
        setSaving(true);
        await supabase.from('cash_sessions').update({
            status: 'closed',
            closed_at: new Date().toISOString(),
            closing_amount: parseFloat(closingAmount) || 0,
            notes: notes || null,
        }).eq('id', currentSession.id);
        setCurrentSession(null);
        setClosingAmount('');
        setNotes('');
        setShowClose(false);
        setSaving(false);
        load();
    };
    if (loading) {
        return _jsx("div", { className: "flex justify-center py-12", children: _jsx("div", { className: "w-6 h-6 border-2 border-zinc-700 border-t-[#FFE500] rounded-full animate-spin" }) });
    }
    return (_jsxs("div", { children: [_jsx("h3", { className: "text-white font-bold text-lg mb-4", children: "Caixa" }), _jsxs("div", { className: `rounded-xl p-6 mb-6 border ${currentSession ? 'bg-green-500/5 border-green-500/30' : 'bg-zinc-900 border-zinc-800'}`, children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { className: "flex items-center gap-3", children: [_jsx("div", { className: `w-12 h-12 rounded-lg flex items-center justify-center ${currentSession ? 'bg-green-500/10' : 'bg-zinc-800'}`, children: currentSession ? _jsx(Unlock, { size: 24, className: "text-green-400" }) : _jsx(Lock, { size: 24, className: "text-zinc-500" }) }), _jsxs("div", { children: [_jsx("p", { className: "text-white font-bold", children: currentSession ? 'Caixa Aberto' : 'Caixa Fechado' }), currentSession ? (_jsxs("p", { className: "text-zinc-400 text-xs flex items-center gap-1", children: [_jsx(Clock, { size: 11 }), " Aberto em ", new Date(currentSession.opened_at).toLocaleString('pt-BR')] })) : (_jsx("p", { className: "text-zinc-400 text-xs", children: "Abra o caixa para iniciar o dia" }))] })] }), currentSession ? (_jsxs("div", { className: "text-right", children: [_jsx("p", { className: "text-zinc-400 text-xs", children: "Abertura" }), _jsxs("p", { className: "text-[#FFE500] font-bold text-lg", children: ["R$ ", currentSession.opening_amount.toFixed(2)] })] })) : null] }), currentSession && (_jsx("button", { onClick: () => setShowClose(true), className: "w-full mt-4 bg-red-500/10 hover:bg-red-500/20 text-red-400 font-bold rounded-lg py-2.5 transition-colors", children: "Fechar Caixa" }))] }), !currentSession && (_jsxs("button", { onClick: () => setShowOpen(true), className: "w-full bg-[#FFE500] hover:bg-[#FFD000] text-black font-bold rounded-lg py-3 flex items-center justify-center gap-2 transition-all", children: [_jsx(Store, { size: 20 }), " Abrir Caixa"] })), sessions.filter(s => s.status === 'closed').length > 0 && (_jsxs("div", { className: "mt-8", children: [_jsx("h4", { className: "text-white font-bold text-sm mb-3", children: "Hist\u00F3rico de Caixas" }), _jsx("div", { className: "space-y-2", children: sessions.filter(s => s.status === 'closed').slice(0, 10).map(s => (_jsxs("div", { className: "bg-zinc-900 border border-zinc-800 rounded-xl p-3 flex items-center justify-between", children: [_jsxs("div", { children: [_jsx("p", { className: "text-white text-sm font-bold", children: new Date(s.opened_at).toLocaleDateString('pt-BR') }), _jsxs("p", { className: "text-zinc-500 text-xs", children: [new Date(s.opened_at).toLocaleTimeString('pt-BR'), " \u2014 ", s.closed_at && new Date(s.closed_at).toLocaleTimeString('pt-BR')] })] }), _jsxs("div", { className: "text-right", children: [_jsxs("p", { className: "text-zinc-400 text-xs", children: ["Abertura: R$ ", s.opening_amount.toFixed(2)] }), _jsxs("p", { className: "text-[#FFE500] text-sm font-bold", children: ["Fechamento: R$ ", s.closing_amount?.toFixed(2) ?? '—'] })] })] }, s.id))) })] })), showOpen && (_jsx("div", { className: "fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm", onClick: () => setShowOpen(false), children: _jsxs("div", { className: "bg-zinc-900 border border-zinc-800 rounded-2xl w-full max-w-sm p-6", onClick: e => e.stopPropagation(), children: [_jsxs("div", { className: "flex items-center justify-between mb-4", children: [_jsx("h3", { className: "text-white font-bold text-lg", children: "Abrir Caixa" }), _jsx("button", { onClick: () => setShowOpen(false), className: "text-zinc-400 hover:text-white", children: _jsx(X, { size: 20 }) })] }), _jsxs("form", { onSubmit: openCash, className: "space-y-3", children: [_jsxs("div", { children: [_jsx("label", { className: "block text-zinc-300 text-xs font-medium mb-1", children: "Valor de abertura (R$)" }), _jsx("input", { type: "number", step: "0.01", value: openingAmount, onChange: e => setOpeningAmount(e.target.value), required: true, className: "w-full bg-zinc-800 border border-zinc-700 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#FFE500]" })] }), _jsx("button", { type: "submit", disabled: saving, className: "w-full bg-[#FFE500] hover:bg-[#FFD000] text-black font-bold rounded-lg py-3 disabled:opacity-50", children: saving ? 'Abrindo...' : 'Abrir Caixa' })] })] }) })), showClose && currentSession && (_jsx("div", { className: "fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm", onClick: () => setShowClose(false), children: _jsxs("div", { className: "bg-zinc-900 border border-zinc-800 rounded-2xl w-full max-w-sm p-6", onClick: e => e.stopPropagation(), children: [_jsxs("div", { className: "flex items-center justify-between mb-4", children: [_jsx("h3", { className: "text-white font-bold text-lg", children: "Fechar Caixa" }), _jsx("button", { onClick: () => setShowClose(false), className: "text-zinc-400 hover:text-white", children: _jsx(X, { size: 20 }) })] }), _jsxs("form", { onSubmit: closeCash, className: "space-y-3", children: [_jsxs("div", { className: "bg-zinc-800/50 rounded-lg p-3 text-sm text-zinc-400", children: ["Aberto em: ", new Date(currentSession.opened_at).toLocaleString('pt-BR'), _jsx("br", {}), "Abertura: R$ ", currentSession.opening_amount.toFixed(2)] }), _jsxs("div", { children: [_jsx("label", { className: "block text-zinc-300 text-xs font-medium mb-1", children: "Valor de fechamento (R$)" }), _jsx("input", { type: "number", step: "0.01", value: closingAmount, onChange: e => setClosingAmount(e.target.value), required: true, className: "w-full bg-zinc-800 border border-zinc-700 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#FFE500]" })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-zinc-300 text-xs font-medium mb-1", children: "Observa\u00E7\u00F5es" }), _jsx("textarea", { value: notes, onChange: e => setNotes(e.target.value), rows: 2, className: "w-full bg-zinc-800 border border-zinc-700 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#FFE500] resize-none" })] }), _jsx("button", { type: "submit", disabled: saving, className: "w-full bg-red-500 hover:bg-red-600 text-white font-bold rounded-lg py-3 disabled:opacity-50", children: saving ? 'Fechando...' : 'Fechar Caixa' })] })] }) }))] }));
}
