import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from 'react';
import { supabase } from '/app/lib/supabase.js';
import { X, Download, Users, Mail, Phone } from 'lucide-react';
export default function ExportContactsTool({ onClose }) {
    const [customers, setCustomers] = useState([]);
    const [franchises, setFranchises] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filterFran, setFilterFran] = useState('all');
    useEffect(() => {
        (async () => {
            const [{ data: custData }, { data: franData }] = await Promise.all([
                supabase.from('customers').select('*').order('created_at', { ascending: false }),
                supabase.from('franchises').select('*').order('name'),
            ]);
            if (custData)
                setCustomers(custData);
            if (franData)
                setFranchises(franData);
            setLoading(false);
        })();
    }, []);
    const franName = (id) => franchises.find(f => f.id === id)?.name ?? '—';
    const filtered = filterFran === 'all' ? customers : customers.filter(c => c.franchise_id === filterFran);
    const exportCSV = () => {
        const headers = ['Nome', 'Telefone', 'Email', 'Franquia', 'Cadastro'];
        const rows = filtered.map(c => [
            c.name,
            c.phone ?? '',
            c.email ?? '',
            franName(c.franchise_id),
            new Date(c.created_at).toLocaleDateString('pt-BR'),
        ]);
        const csv = [headers, ...rows].map(r => r.map(field => `"${field.replace(/"/g, '""')}"`).join(',')).join('\n');
        const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `contatos-clientes-${new Date().toISOString().slice(0, 10)}.csv`;
        a.click();
        URL.revokeObjectURL(url);
    };
    return (_jsx("div", { className: "fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm", onClick: onClose, children: _jsxs("div", { className: "bg-zinc-900 border border-zinc-800 rounded-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto", onClick: e => e.stopPropagation(), children: [_jsxs("div", { className: "flex items-center justify-between p-6 border-b border-zinc-800 sticky top-0 bg-zinc-900 z-10", children: [_jsxs("div", { className: "flex items-center gap-3", children: [_jsx("div", { className: "w-10 h-10 rounded-lg bg-[#FFE500]/10 flex items-center justify-center", children: _jsx(Users, { size: 20, className: "text-[#FFE500]" }) }), _jsxs("div", { children: [_jsx("h2", { className: "font-bold text-white text-lg", children: "Exportar Contatos" }), _jsx("p", { className: "text-zinc-500 text-xs", children: "Baixe a lista de clientes para marketing" })] })] }), _jsx("button", { onClick: onClose, className: "text-zinc-400 hover:text-white transition-colors", children: _jsx(X, { size: 22 }) })] }), _jsxs("div", { className: "p-6", children: [_jsxs("div", { className: "flex items-center justify-between mb-4 flex-wrap gap-2", children: [_jsxs("select", { value: filterFran, onChange: e => setFilterFran(e.target.value), className: "bg-zinc-800 border border-zinc-700 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#FFE500]", children: [_jsx("option", { value: "all", children: "Todas as franquias" }), franchises.map(f => _jsx("option", { value: f.id, children: f.name }, f.id))] }), _jsxs("button", { onClick: exportCSV, disabled: filtered.length === 0, className: "bg-[#FFE500] hover:bg-[#FFD000] text-black text-sm font-bold rounded-lg px-4 py-2 flex items-center gap-1.5 transition-all disabled:opacity-50", children: [_jsx(Download, { size: 16 }), " Exportar CSV (", filtered.length, ")"] })] }), loading ? (_jsx("div", { className: "flex justify-center py-8", children: _jsx("div", { className: "w-6 h-6 border-2 border-zinc-700 border-t-[#FFE500] rounded-full animate-spin" }) })) : filtered.length === 0 ? (_jsxs("div", { className: "text-center py-12", children: [_jsx(Users, { size: 40, className: "mx-auto text-zinc-700 mb-3" }), _jsx("p", { className: "text-zinc-400 text-sm", children: "Nenhum cliente cadastrado." })] })) : (_jsx("div", { className: "space-y-2", children: filtered.map(c => (_jsxs("div", { className: "bg-zinc-800/50 border border-zinc-700 rounded-lg p-3 flex items-center justify-between", children: [_jsxs("div", { className: "flex items-center gap-3", children: [_jsx("div", { className: "w-9 h-9 rounded-full bg-[#FFE500]/10 flex items-center justify-center text-[#FFE500] text-sm font-bold", children: c.name.charAt(0).toUpperCase() }), _jsxs("div", { children: [_jsx("p", { className: "text-white text-sm font-medium", children: c.name }), _jsx("p", { className: "text-zinc-500 text-xs", children: franName(c.franchise_id) })] })] }), _jsxs("div", { className: "flex items-center gap-3 text-zinc-400 text-xs", children: [c.phone && _jsxs("span", { className: "flex items-center gap-1", children: [_jsx(Phone, { size: 11 }), " ", c.phone] }), c.email && _jsxs("span", { className: "flex items-center gap-1", children: [_jsx(Mail, { size: 11 }), " ", c.email] })] })] }, c.id))) }))] })] }) }));
}
