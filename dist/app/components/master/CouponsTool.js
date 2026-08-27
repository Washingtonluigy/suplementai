import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from 'react';
import { supabase } from '/app/lib/supabase.js';
import { X, Ticket, Plus, Trash2, Edit, Percent, DollarSign } from 'lucide-react';
export default function CouponsTool({ onClose }) {
    const [coupons, setCoupons] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [editing, setEditing] = useState(null);
    const [saving, setSaving] = useState(false);
    const [form, setForm] = useState({
        code: '', description: '', discount_type: 'percent',
        discount_value: '', min_purchase: '', active: true, franchise_id: '',
    });
    const load = async () => {
        const { data } = await supabase.from('coupons').select('*').order('created_at', { ascending: false });
        setCoupons(data || []);
        setLoading(false);
    };
    useEffect(() => { load(); }, []);
    const save = async (e) => {
        e.preventDefault();
        setSaving(true);
        const payload = {
            code: form.code.toUpperCase().trim(),
            description: form.description || null,
            discount_type: form.discount_type,
            discount_value: parseFloat(form.discount_value) || 0,
            min_purchase: parseFloat(form.min_purchase) || 0,
            active: form.active,
            franchise_id: form.franchise_id || null,
        };
        if (editing) {
            await supabase.from('coupons').update(payload).eq('id', editing.id);
        }
        else {
            await supabase.from('coupons').insert(payload);
        }
        setForm({ code: '', description: '', discount_type: 'percent', discount_value: '', min_purchase: '', active: true, franchise_id: '' });
        setEditing(null);
        setShowForm(false);
        setSaving(false);
        load();
    };
    const remove = async (c) => {
        if (!confirm(`Excluir cupom ${c.code}?`))
            return;
        await supabase.from('coupons').delete().eq('id', c.id);
        load();
    };
    return (_jsx("div", { className: "fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm", onClick: onClose, children: _jsxs("div", { className: "bg-zinc-900 border border-zinc-800 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto", onClick: e => e.stopPropagation(), children: [_jsxs("div", { className: "flex items-center justify-between p-6 border-b border-zinc-800 sticky top-0 bg-zinc-900 z-10", children: [_jsxs("div", { className: "flex items-center gap-3", children: [_jsx("div", { className: "w-10 h-10 rounded-lg bg-[#FFE500]/10 flex items-center justify-center", children: _jsx(Ticket, { size: 20, className: "text-[#FFE500]" }) }), _jsxs("div", { children: [_jsx("h2", { className: "font-bold text-white text-lg", children: "Cupons" }), _jsx("p", { className: "text-zinc-500 text-xs", children: "Cupons de desconto para o cat\u00E1logo digital" })] })] }), _jsx("button", { onClick: onClose, className: "text-zinc-400 hover:text-white", children: _jsx(X, { size: 22 }) })] }), _jsxs("div", { className: "p-6", children: [_jsxs("div", { className: "flex items-center justify-between mb-4", children: [_jsx("p", { className: "text-zinc-400 text-sm", children: "Cupons sem franquia (master) valem para todas as unidades. Cupons com franquia valem apenas na loja dela." }), _jsxs("button", { onClick: () => { setEditing(null); setShowForm(!showForm); }, className: "bg-[#FFE500] hover:bg-[#FFD000] text-black text-sm font-bold rounded-lg px-4 py-2 flex items-center gap-1.5", children: [_jsx(Plus, { size: 16 }), " Novo Cupom"] })] }), showForm && (_jsxs("form", { onSubmit: save, className: "bg-zinc-800/50 border border-zinc-700 rounded-lg p-4 mb-4 space-y-3", children: [_jsxs("div", { className: "grid grid-cols-2 gap-3", children: [_jsx("input", { type: "text", value: form.code, onChange: e => setForm({ ...form, code: e.target.value }), required: true, placeholder: "C\u00F3digo (ex: BEMVINDO10)", className: "bg-zinc-900 border border-zinc-700 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#FFE500]" }), _jsx("input", { type: "text", value: form.description, onChange: e => setForm({ ...form, description: e.target.value }), placeholder: "Descri\u00E7\u00E3o (opcional)", className: "bg-zinc-900 border border-zinc-700 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#FFE500]" })] }), _jsxs("div", { className: "grid grid-cols-3 gap-3", children: [_jsxs("div", { children: [_jsx("label", { className: "block text-zinc-300 text-xs mb-1", children: "Tipo" }), _jsxs("div", { className: "flex bg-zinc-800 rounded-lg overflow-hidden border border-zinc-700", children: [_jsx("button", { type: "button", onClick: () => setForm({ ...form, discount_type: 'percent' }), className: `flex-1 text-xs py-2 ${form.discount_type === 'percent' ? 'bg-[#FFE500] text-black' : 'text-zinc-400'}`, children: _jsx(Percent, { size: 12, className: "inline" }) }), _jsx("button", { type: "button", onClick: () => setForm({ ...form, discount_type: 'fixed' }), className: `flex-1 text-xs py-2 ${form.discount_type === 'fixed' ? 'bg-[#FFE500] text-black' : 'text-zinc-400'}`, children: _jsx(DollarSign, { size: 12, className: "inline" }) })] })] }), _jsxs("div", { children: [_jsxs("label", { className: "block text-zinc-300 text-xs mb-1", children: ["Valor ", form.discount_type === 'percent' ? '(%)' : '(R$)'] }), _jsx("input", { type: "number", step: "0.01", value: form.discount_value, onChange: e => setForm({ ...form, discount_value: e.target.value }), required: true, placeholder: "0", className: "w-full bg-zinc-900 border border-zinc-700 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#FFE500]" })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-zinc-300 text-xs mb-1", children: "Compra m\u00EDn. (R$)" }), _jsx("input", { type: "number", step: "0.01", value: form.min_purchase, onChange: e => setForm({ ...form, min_purchase: e.target.value }), placeholder: "0", className: "w-full bg-zinc-900 border border-zinc-700 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#FFE500]" })] })] }), _jsxs("label", { className: "flex items-center gap-2 cursor-pointer", children: [_jsx("input", { type: "checkbox", checked: form.active, onChange: e => setForm({ ...form, active: e.target.checked }), className: "w-4 h-4 rounded border-zinc-600 bg-zinc-800 text-[#FFE500]" }), _jsx("span", { className: "text-zinc-300 text-sm", children: "Cupom ativo" })] }), _jsx("button", { type: "submit", disabled: saving, className: "bg-[#FFE500] hover:bg-[#FFD000] text-black text-sm font-bold rounded-lg px-4 py-2 disabled:opacity-50", children: saving ? 'Salvando...' : editing ? 'Salvar' : 'Criar cupom' })] })), loading ? _jsx("div", { className: "flex justify-center py-8", children: _jsx("div", { className: "w-6 h-6 border-2 border-zinc-700 border-t-[#FFE500] rounded-full animate-spin" }) }) :
                            coupons.length === 0 ? _jsx("p", { className: "text-zinc-400 text-sm text-center py-8", children: "Nenhum cupom criado." }) :
                                _jsx("div", { className: "space-y-2", children: coupons.map(c => (_jsxs("div", { className: "bg-zinc-800/50 border border-zinc-700 rounded-lg p-3 flex items-center justify-between", children: [_jsxs("div", { className: "flex items-center gap-3", children: [_jsx("div", { className: "w-10 h-10 rounded-lg bg-[#FFE500]/10 flex items-center justify-center", children: _jsx(Ticket, { size: 18, className: "text-[#FFE500]" }) }), _jsxs("div", { children: [_jsx("p", { className: "text-white text-sm font-bold", children: c.code }), _jsxs("p", { className: "text-zinc-500 text-xs", children: [c.discount_type === 'percent' ? `${c.discount_value}% de desconto` : `R$ ${c.discount_value} de desconto`, c.min_purchase > 0 ? ` • Compra mín: R$ ${c.min_purchase}` : '', " \u2022 ", c.franchise_id ? 'Franquia específica' : 'Todas as franquias', " \u2022 ", c.active ? 'Ativo' : 'Inativo'] })] })] }), _jsxs("div", { className: "flex gap-1", children: [_jsx("button", { onClick: () => { setEditing(c); setForm({ code: c.code, description: c.description ?? '', discount_type: c.discount_type, discount_value: String(c.discount_value), min_purchase: String(c.min_purchase), active: c.active, franchise_id: c.franchise_id ?? '' }); setShowForm(true); }, className: "text-zinc-400 hover:text-[#FFE500] p-1.5", children: _jsx(Edit, { size: 14 }) }), _jsx("button", { onClick: () => remove(c), className: "text-zinc-400 hover:text-red-400 p-1.5", children: _jsx(Trash2, { size: 14 }) })] })] }, c.id))) })] })] }) }));
}
