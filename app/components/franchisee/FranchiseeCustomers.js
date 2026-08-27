import { jsxs as _jsxs, jsx as _jsx } from "react/jsx-runtime";
import { useEffect, useState } from 'react';
import { supabase } from '/app/lib/supabase.js';
import { Users, Plus, Trash2, Phone, Mail, X, Eye, Search, MapPin, CreditCard, ShoppingBag, Clock, TrendingUp } from 'lucide-react';
export default function FranchiseeCustomers({ franchiseId }) {
    const [customers, setCustomers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [viewing, setViewing] = useState(null);
    const [viewingSales, setViewingSales] = useState([]);
    const [loadingSales, setLoadingSales] = useState(false);
    const [form, setForm] = useState({ name: '', phone: '', email: '', cpf_cnpj: '', address: '', neighborhood: '', city: '', state: '', customer_type: 'pf', ie: '', company_name: '', partner_name: '', partner_cpf: '' });
    const [saving, setSaving] = useState(false);
    const [search, setSearch] = useState('');
    const ensureLegacyCustomersImported = async () => {
        const targetFranchises = new Set([
            '7f1b0157-6f69-4038-a6ee-095db47e9576',
            '9267f611-14b4-436b-99dd-9819e2415bcb',
        ]);
        if (!targetFranchises.has(franchiseId))
            return;
        const storageKey = `legacy-customers-20260826:${franchiseId}`;
        if (localStorage.getItem(storageKey) === 'done')
            return;
        const { data, error } = await supabase.functions.invoke('import-legacy-customers', {
            body: { franchise_id: franchiseId },
        });
        if (!error && data?.success) {
            localStorage.setItem(storageKey, 'done');
        }
        else if (error) {
            console.warn('Importação automática de clientes não executada:', error.message);
        }
    };
    const load = async () => {
        setLoading(true);
        await ensureLegacyCustomersImported();
        const { data } = await supabase.from('customers').select('*').eq('franchise_id', franchiseId).order('created_at', { ascending: false });
        if (data)
            setCustomers(data);
        setLoading(false);
    };
    useEffect(() => { load(); }, [franchiseId]);
    const filtered = customers.filter(c => {
        if (!search)
            return true;
        const q = search.toLowerCase();
        return c.name?.toLowerCase().includes(q) || c.phone?.includes(q) || c.cpf_cnpj?.includes(q);
    });
    const handleSave = async (e) => {
        e.preventDefault();
        setSaving(true);
        await supabase.from('customers').insert({
            franchise_id: franchiseId,
            name: form.name,
            phone: form.phone || null,
            email: form.email || null,
            cpf_cnpj: form.cpf_cnpj || null,
            address: form.address || null,
            neighborhood: form.neighborhood || null,
            city: form.city || null,
            state: form.state || null,
            customer_type: form.customer_type,
            ie: form.ie || null,
            company_name: form.company_name || null,
            partner_name: form.partner_name || null,
            partner_cpf: form.partner_cpf || null,
        });
        setForm({ name: '', phone: '', email: '', cpf_cnpj: '', address: '', neighborhood: '', city: '', state: '', customer_type: 'pf', ie: '', company_name: '', partner_name: '', partner_cpf: '' });
        setShowForm(false);
        setSaving(false);
        load();
    };
    const handleDelete = async (c) => {
        if (!confirm(`Excluir cliente "${c.name}"?`))
            return;
        await supabase.from('customers').delete().eq('id', c.id);
        load();
    };
    const viewCustomer = async (c) => {
        setViewing(c);
        setLoadingSales(true);
        const { data } = await supabase.from('sales').select('*').eq('customer_id', c.id).order('created_at', { ascending: false });
        setViewingSales(data || []);
        setLoadingSales(false);
    };
    const formatTimeAgo = (dateStr) => {
        const diff = Date.now() - new Date(dateStr).getTime();
        const days = Math.floor(diff / 86400000);
        if (days === 0)
            return 'Hoje';
        if (days === 1)
            return 'Ontem';
        if (days < 30)
            return `${days} dias atrás`;
        if (days < 365)
            return `${Math.floor(days / 30)} meses atrás`;
        return `${Math.floor(days / 365)} anos atrás`;
    };
    const totalSpent = viewingSales.reduce((sum, s) => sum + (s.total || 0), 0);
    // Aggregate product purchases
    const productHistory = [];
    for (const sale of viewingSales) {
        for (const item of (sale.items || [])) {
            const existing = productHistory.find(p => p.name === item.name);
            if (existing) {
                existing.qty += item.quantity || 1;
                if (new Date(sale.created_at) > new Date(existing.lastBought))
                    existing.lastBought = sale.created_at;
            }
            else {
                productHistory.push({ name: item.name, qty: item.quantity || 1, lastBought: sale.created_at });
            }
        }
    }
    productHistory.sort((a, b) => new Date(b.lastBought).getTime() - new Date(a.lastBought).getTime());
    return (_jsxs("div", { children: [_jsxs("div", { className: "flex items-center justify-between mb-4", children: [_jsxs("h3", { className: "text-white font-bold text-lg", children: ["Clientes (", customers.length, ")"] }), _jsxs("button", { onClick: () => setShowForm(!showForm), className: "bg-[#FFE500] hover:bg-[#FFD000] text-black text-sm font-bold rounded-lg px-4 py-2 flex items-center gap-1.5 transition-all", children: [_jsx(Plus, { size: 16 }), " Novo Cliente"] })] }), _jsxs("div", { className: "relative mb-4", children: [_jsx(Search, { size: 16, className: "absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" }), _jsx("input", { type: "text", value: search, onChange: e => setSearch(e.target.value), placeholder: "Buscar por nome, telefone ou CPF...", className: "w-full bg-zinc-900 border border-zinc-800 text-white rounded-lg pl-10 pr-3 py-2 text-sm focus:outline-none focus:border-[#FFE500]" })] }), showForm && (_jsxs("form", { onSubmit: handleSave, className: "bg-zinc-900 border border-zinc-800 rounded-xl p-4 mb-4 space-y-3", children: [_jsxs("div", { className: "flex gap-2", children: [_jsx("button", { type: "button", onClick: () => setForm({ ...form, customer_type: 'pf' }), className: `flex-1 text-sm font-bold rounded-lg py-2 ${form.customer_type === 'pf' ? 'bg-[#FFE500] text-black' : 'bg-zinc-800 text-zinc-400'}`, children: "Pessoa F\u00EDsica" }), _jsx("button", { type: "button", onClick: () => setForm({ ...form, customer_type: 'pj' }), className: `flex-1 text-sm font-bold rounded-lg py-2 ${form.customer_type === 'pj' ? 'bg-[#FFE500] text-black' : 'bg-zinc-800 text-zinc-400'}`, children: "Pessoa Jur\u00EDdica" })] }), _jsx("input", { type: "text", value: form.name, onChange: e => setForm({ ...form, name: e.target.value }), required: true, placeholder: form.customer_type === 'pj' ? 'Razão Social' : 'Nome completo', className: "w-full bg-zinc-800 border border-zinc-700 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#FFE500]" }), _jsxs("div", { className: "grid grid-cols-1 sm:grid-cols-2 gap-3", children: [_jsx("input", { type: "text", value: form.phone, onChange: e => setForm({ ...form, phone: e.target.value }), placeholder: "Telefone", className: "bg-zinc-800 border border-zinc-700 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#FFE500]" }), _jsx("input", { type: "text", value: form.cpf_cnpj, onChange: e => setForm({ ...form, cpf_cnpj: e.target.value }), placeholder: form.customer_type === 'pj' ? 'CNPJ' : 'CPF', className: "bg-zinc-800 border border-zinc-700 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#FFE500]" })] }), form.customer_type === 'pj' && (_jsxs("div", { className: "grid grid-cols-1 sm:grid-cols-2 gap-3", children: [_jsx("input", { type: "text", value: form.ie, onChange: e => setForm({ ...form, ie: e.target.value }), placeholder: "Inscri\u00E7\u00E3o Estadual", className: "bg-zinc-800 border border-zinc-700 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#FFE500]" }), _jsx("input", { type: "text", value: form.company_name, onChange: e => setForm({ ...form, company_name: e.target.value }), placeholder: "Nome Fantasia", className: "bg-zinc-800 border border-zinc-700 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#FFE500]" }), _jsx("input", { type: "text", value: form.partner_name, onChange: e => setForm({ ...form, partner_name: e.target.value }), placeholder: "Nome do s\u00F3cio", className: "bg-zinc-800 border border-zinc-700 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#FFE500]" }), _jsx("input", { type: "text", value: form.partner_cpf, onChange: e => setForm({ ...form, partner_cpf: e.target.value }), placeholder: "CPF do s\u00F3cio", className: "bg-zinc-800 border border-zinc-700 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#FFE500]" })] })), _jsx("input", { type: "email", value: form.email, onChange: e => setForm({ ...form, email: e.target.value }), placeholder: "Email", className: "w-full bg-zinc-800 border border-zinc-700 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#FFE500]" }), _jsx("input", { type: "text", value: form.address, onChange: e => setForm({ ...form, address: e.target.value }), placeholder: "Endere\u00E7o", className: "w-full bg-zinc-800 border border-zinc-700 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#FFE500]" }), _jsxs("div", { className: "grid grid-cols-1 sm:grid-cols-3 gap-3", children: [_jsx("input", { type: "text", value: form.neighborhood, onChange: e => setForm({ ...form, neighborhood: e.target.value }), placeholder: "Bairro", className: "bg-zinc-800 border border-zinc-700 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#FFE500]" }), _jsx("input", { type: "text", value: form.city, onChange: e => setForm({ ...form, city: e.target.value }), placeholder: "Cidade", className: "bg-zinc-800 border border-zinc-700 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#FFE500]" }), _jsx("input", { type: "text", value: form.state, onChange: e => setForm({ ...form, state: e.target.value }), placeholder: "UF", className: "bg-zinc-800 border border-zinc-700 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#FFE500]" })] }), _jsx("button", { type: "submit", disabled: saving, className: "bg-[#FFE500] hover:bg-[#FFD000] text-black text-sm font-bold rounded-lg px-4 py-2 disabled:opacity-50", children: "Salvar" })] })), loading ? (_jsx("div", { className: "flex justify-center py-12", children: _jsx("div", { className: "w-6 h-6 border-2 border-zinc-700 border-t-[#FFE500] rounded-full animate-spin" }) })) : filtered.length === 0 ? (_jsxs("div", { className: "text-center py-12", children: [_jsx(Users, { size: 40, className: "mx-auto text-zinc-700 mb-3" }), _jsx("p", { className: "text-zinc-400 text-sm", children: search ? 'Nenhum cliente encontrado.' : 'Nenhum cliente cadastrado.' })] })) : (_jsx("div", { className: "space-y-2 max-h-[60vh] overflow-y-auto", children: filtered.map(c => (_jsxs("div", { className: "bg-zinc-900 border border-zinc-800 rounded-xl p-3 flex items-center justify-between hover:border-zinc-700 transition-colors", children: [_jsxs("div", { className: "flex items-center gap-3 min-w-0", children: [_jsx("div", { className: "w-10 h-10 rounded-full bg-[#FFE500]/10 flex items-center justify-center text-[#FFE500] text-sm font-bold shrink-0", children: c.name.charAt(0).toUpperCase() }), _jsxs("div", { className: "min-w-0", children: [_jsx("p", { className: "text-white text-sm font-bold truncate", children: c.name }), _jsxs("div", { className: "flex items-center gap-2 text-zinc-500 text-xs", children: [c.phone && _jsx("span", { children: c.phone }), c.city && _jsxs("span", { children: ["\u00B7 ", c.city, "/", c.state || ''] })] })] })] }), _jsxs("div", { className: "flex items-center gap-1 shrink-0", children: [_jsx("button", { onClick: () => viewCustomer(c), className: "text-zinc-400 hover:text-[#FFE500] p-1.5", children: _jsx(Eye, { size: 15 }) }), _jsx("button", { onClick: () => handleDelete(c), className: "text-zinc-400 hover:text-red-400 p-1.5", children: _jsx(Trash2, { size: 15 }) })] })] }, c.id))) })), viewing && (_jsx("div", { className: "fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm", onClick: () => { setViewing(null); setViewingSales([]); }, children: _jsxs("div", { className: "bg-zinc-900 border border-zinc-800 rounded-2xl w-full max-w-md max-h-[85vh] overflow-y-auto p-6", onClick: e => e.stopPropagation(), children: [_jsxs("div", { className: "flex items-center justify-between mb-4", children: [_jsx("h3", { className: "text-white font-bold text-lg", children: "Dados do cliente" }), _jsx("button", { onClick: () => { setViewing(null); setViewingSales([]); }, className: "text-zinc-400 hover:text-white", children: _jsx(X, { size: 20 }) })] }), _jsxs("div", { className: "space-y-3", children: [_jsx("div", { className: "w-16 h-16 rounded-full bg-[#FFE500]/10 flex items-center justify-center text-[#FFE500] text-2xl font-bold mx-auto", children: viewing.name.charAt(0).toUpperCase() }), _jsx("p", { className: "text-white font-bold text-center", children: viewing.name }), viewing.phone && _jsxs("p", { className: "text-zinc-400 text-sm flex items-center gap-2 justify-center", children: [_jsx(Phone, { size: 14 }), " ", viewing.phone] }), viewing.email && _jsxs("p", { className: "text-zinc-400 text-sm flex items-center gap-2 justify-center", children: [_jsx(Mail, { size: 14 }), " ", viewing.email] }), viewing.cpf_cnpj && _jsxs("p", { className: "text-zinc-400 text-sm flex items-center gap-2 justify-center", children: [_jsx(CreditCard, { size: 14 }), " ", viewing.cpf_cnpj] }), viewing.address && _jsxs("p", { className: "text-zinc-400 text-sm flex items-center gap-2 justify-center", children: [_jsx(MapPin, { size: 14 }), " ", viewing.address] }), (viewing.city || viewing.neighborhood) && (_jsx("p", { className: "text-zinc-500 text-xs text-center", children: [viewing.neighborhood, viewing.city, viewing.state].filter(Boolean).join(', ') })), _jsxs("p", { className: "text-zinc-500 text-xs text-center", children: ["Cliente desde ", new Date(viewing.created_at).toLocaleDateString('pt-BR')] })] }), _jsxs("div", { className: "mt-5 grid grid-cols-2 gap-3", children: [_jsxs("div", { className: "bg-zinc-800/50 rounded-lg p-3 text-center", children: [_jsx(TrendingUp, { size: 18, className: "mx-auto text-green-400 mb-1" }), _jsxs("p", { className: "text-white font-bold text-lg", children: ["R$ ", totalSpent.toFixed(2)] }), _jsx("p", { className: "text-zinc-500 text-xs", children: "Total comprado" })] }), _jsxs("div", { className: "bg-zinc-800/50 rounded-lg p-3 text-center", children: [_jsx(ShoppingBag, { size: 18, className: "mx-auto text-[#FFE500] mb-1" }), _jsx("p", { className: "text-white font-bold text-lg", children: viewingSales.length }), _jsx("p", { className: "text-zinc-500 text-xs", children: "Compras realizadas" })] })] }), productHistory.length > 0 && (_jsxs("div", { className: "mt-5", children: [_jsxs("h4", { className: "text-zinc-300 text-sm font-bold mb-2 flex items-center gap-2", children: [_jsx(ShoppingBag, { size: 15 }), " Produtos comprados"] }), _jsx("div", { className: "space-y-1.5 max-h-40 overflow-y-auto", children: productHistory.map((p, i) => (_jsxs("div", { className: "flex items-center justify-between bg-zinc-800/30 rounded-lg px-3 py-2", children: [_jsxs("div", { className: "min-w-0", children: [_jsx("p", { className: "text-white text-sm font-medium truncate", children: p.name }), _jsxs("p", { className: "text-zinc-500 text-xs flex items-center gap-1", children: [_jsx(Clock, { size: 10 }), " ", formatTimeAgo(p.lastBought)] })] }), _jsxs("span", { className: "text-[#FFE500] text-sm font-bold shrink-0 ml-2", children: [p.qty, "x"] })] }, i))) })] })), loadingSales ? (_jsx("div", { className: "flex justify-center py-4 mt-4", children: _jsx("div", { className: "w-5 h-5 border-2 border-zinc-700 border-t-[#FFE500] rounded-full animate-spin" }) })) : viewingSales.length > 0 ? (_jsxs("div", { className: "mt-5", children: [_jsx("h4", { className: "text-zinc-300 text-sm font-bold mb-2", children: "Hist\u00F3rico de compras" }), _jsx("div", { className: "space-y-2 max-h-48 overflow-y-auto", children: viewingSales.map(s => (_jsxs("div", { className: "bg-zinc-800/30 rounded-lg p-3", children: [_jsxs("div", { className: "flex items-center justify-between mb-1", children: [_jsx("span", { className: "text-zinc-400 text-xs", children: new Date(s.created_at).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }) }), _jsxs("span", { className: "text-green-400 text-sm font-bold", children: ["R$ ", s.total.toFixed(2)] })] }), _jsx("div", { className: "flex flex-wrap gap-1", children: (s.items || []).map((item, i) => (_jsxs("span", { className: "text-zinc-500 text-xs bg-zinc-800 rounded px-1.5 py-0.5", children: [item.quantity, "x ", item.name] }, i))) })] }, s.id))) })] })) : (_jsx("p", { className: "text-zinc-500 text-xs text-center mt-4", children: "Nenhuma compra registrada ainda." }))] }) }))] }));
}
