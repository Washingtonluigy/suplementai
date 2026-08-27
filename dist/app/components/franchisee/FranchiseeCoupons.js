import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from 'react';
import { supabase } from '/app/lib/supabase.js';
import { Ticket, Plus, Trash2, Edit, Percent, DollarSign } from 'lucide-react';
export default function FranchiseeCoupons({ franchiseId }) {
    const [coupons, setCoupons] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [editing, setEditing] = useState(null);
    const [saving, setSaving] = useState(false);
    const [form, setForm] = useState({ code: '', description: '', discount_type: 'percent', discount_value: '', min_purchase: '', active: true });
    const load = async () => {
        const { data } = await supabase.from('coupons').select('*').eq('franchise_id', franchiseId).order('created_at', { ascending: false });
        setCoupons(data || []);
        setLoading(false);
    };
    useEffect(() => { load(); }, [franchiseId]);
    const save = async (e) => {
        e.preventDefault();
        setSaving(true);
        const payload = {
            franchise_id: franchiseId,
            code: form.code.toUpperCase().trim(),
            description: form.description || null,
            discount_type: form.discount_type,
            discount_value: parseFloat(form.discount_value) || 0,
            min_purchase: parseFloat(form.min_purchase) || 0,
            active: form.active,
        };
        if (editing) {
            await supabase.from('coupons').update(payload).eq('id', editing.id);
        }
        else {
            await supabase.from('coupons').insert(payload);
        }
        setForm({ code: '', description: '', discount_type: 'percent', discount_value: '', min_purchase: '', active: true });
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
    return (_jsxs("div", { className: "space-y-4", children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { children: [_jsx("h2", { className: "text-white font-bold text-lg", children: "Cupons" }), _jsx("p", { className: "text-zinc-500 text-xs mt-0.5", children: "Cupons de desconto para o seu cat\u00E1logo online" })] }), _jsxs("button", { onClick: () => { setEditing(null); setShowForm(!showForm); }, className: "flex items-center gap-2 bg-[#FFE500] hover:bg-[#FFD000] text-black text-sm font-bold rounded-lg px-4 py-2", children: [_jsx(Plus, { size: 16 }), " Novo Cupom"] })] }), showForm && (_jsxs("form", { onSubmit: save, className: "bg-zinc-900 border border-zinc-800 rounded-xl p-4 space-y-3", children: [_jsx("input", { type: "text", value: form.code, onChange: e => setForm({ ...form, code: e.target.value }), required: true, placeholder: "C\u00F3digo (ex: BEMVINDO10)", className: "w-full bg-zinc-800 border border-zinc-700 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#FFE500]" }), _jsx("input", { type: "text", value: form.description, onChange: e => setForm({ ...form, description: e.target.value }), placeholder: "Descri\u00E7\u00E3o (opcional)", className: "w-full bg-zinc-800 border border-zinc-700 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#FFE500]" }), _jsxs("div", { className: "grid grid-cols-3 gap-3", children: [_jsxs("div", { children: [_jsx("label", { className: "block text-zinc-300 text-xs mb-1", children: "Tipo" }), _jsxs("div", { className: "flex bg-zinc-800 rounded-lg overflow-hidden border border-zinc-700", children: [_jsx("button", { type: "button", onClick: () => setForm({ ...form, discount_type: 'percent' }), className: `flex-1 text-xs py-2 ${form.discount_type === 'percent' ? 'bg-[#FFE500] text-black' : 'text-zinc-400'}`, children: _jsx(Percent, { size: 12, className: "inline" }) }), _jsx("button", { type: "button", onClick: () => setForm({ ...form, discount_type: 'fixed' }), className: `flex-1 text-xs py-2 ${form.discount_type === 'fixed' ? 'bg-[#FFE500] text-black' : 'text-zinc-400'}`, children: _jsx(DollarSign, { size: 12, className: "inline" }) })] })] }), _jsx("input", { type: "number", step: "0.01", value: form.discount_value, onChange: e => setForm({ ...form, discount_value: e.target.value }), required: true, placeholder: form.discount_type === 'percent' ? 'Valor (%)' : 'Valor (R$)', className: "bg-zinc-800 border border-zinc-700 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#FFE500]" }), _jsx("input", { type: "number", step: "0.01", value: form.min_purchase, onChange: e => setForm({ ...form, min_purchase: e.target.value }), placeholder: "Compra m\u00EDn. R$", className: "bg-zinc-800 border border-zinc-700 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#FFE500]" })] }), _jsxs("label", { className: "flex items-center gap-2 cursor-pointer", children: [_jsx("input", { type: "checkbox", checked: form.active, onChange: e => setForm({ ...form, active: e.target.checked }), className: "w-4 h-4 rounded border-zinc-600 bg-zinc-800 text-[#FFE500]" }), _jsx("span", { className: "text-zinc-300 text-sm", children: "Ativo" })] }), _jsx("button", { type: "submit", disabled: saving, className: "bg-[#FFE500] hover:bg-[#FFD000] text-black text-sm font-bold rounded-lg px-4 py-2 disabled:opacity-50", children: saving ? 'Salvando...' : editing ? 'Salvar' : 'Criar' })] })), loading ? _jsx("div", { className: "flex justify-center py-8", children: _jsx("div", { className: "w-6 h-6 border-2 border-zinc-700 border-t-[#FFE500] rounded-full animate-spin" }) }) :
                coupons.length === 0 ? _jsxs("div", { className: "text-center py-12", children: [_jsx(Ticket, { size: 32, className: "mx-auto text-zinc-700 mb-3" }), _jsx("p", { className: "text-zinc-400 text-sm", children: "Nenhum cupom criado." })] }) :
                    _jsx("div", { className: "space-y-2", children: coupons.map(c => (_jsxs("div", { className: "bg-zinc-900 border border-zinc-800 rounded-xl p-3 flex items-center justify-between", children: [_jsxs("div", { className: "flex items-center gap-3", children: [_jsx("div", { className: "w-10 h-10 rounded-lg bg-[#FFE500]/10 flex items-center justify-center", children: _jsx(Ticket, { size: 18, className: "text-[#FFE500]" }) }), _jsxs("div", { children: [_jsxs("p", { className: "text-white text-sm font-bold", children: [c.code, " ", !c.active && _jsx("span", { className: "text-zinc-500 text-xs", children: "(inativo)" })] }), _jsxs("p", { className: "text-zinc-500 text-xs", children: [c.discount_type === 'percent' ? `${c.discount_value}% de desconto` : `R$ ${c.discount_value} de desconto`, c.min_purchase > 0 ? ` • Compra mín: R$ ${c.min_purchase}` : ''] })] })] }), _jsxs("div", { className: "flex gap-1", children: [_jsx("button", { onClick: () => { setEditing(c); setForm({ code: c.code, description: c.description ?? '', discount_type: c.discount_type, discount_value: String(c.discount_value), min_purchase: String(c.min_purchase), active: c.active }); setShowForm(true); }, className: "text-zinc-400 hover:text-[#FFE500] p-1.5", children: _jsx(Edit, { size: 14 }) }), _jsx("button", { onClick: () => remove(c), className: "text-zinc-400 hover:text-red-400 p-1.5", children: _jsx(Trash2, { size: 14 }) })] })] }, c.id))) })] }));
}
