import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from 'react';
import { supabase } from '/app/lib/supabase.js';
import { Plus, Trash2, Edit, Upload, Ticket, ToggleLeft, ToggleRight, ChevronUp, ChevronDown } from 'lucide-react';
export default function FranchiseePromotions({ franchiseId }) {
    const [promotions, setPromotions] = useState([]);
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [showForm, setShowForm] = useState(false);
    const [editing, setEditing] = useState(null);
    const [form, setForm] = useState({ title: '', description: '', badge_text: 'PROMO', product_id: '', image: null });
    const [imageUrl, setImageUrl] = useState(null);
    const load = async () => {
        setLoading(true);
        const [{ data: promos }, { data: prods }] = await Promise.all([
            supabase.from('franchise_promotions').select('*').eq('franchise_id', franchiseId).order('sort_order'),
            supabase.from('franchise_products').select('*').eq('franchise_id', franchiseId).eq('active', true).order('name'),
        ]);
        setPromotions((promos ?? []).filter(p => p.title !== '__SUPLEMENTAAI_NATIONAL_SITE_CONFIG__'));
        setProducts((prods ?? []));
        setLoading(false);
    };
    useEffect(() => { load(); }, [franchiseId]);
    const handleSave = async (e) => {
        e.preventDefault();
        setSaving(true);
        let img = imageUrl;
        if (form.image) {
            const ext = form.image.name.split('.').pop();
            const path = `${franchiseId}/promo-${Date.now()}.${ext}`;
            const { error } = await supabase.storage.from('franchise-products').upload(path, form.image);
            if (!error)
                img = supabase.storage.from('franchise-products').getPublicUrl(path).data.publicUrl;
        }
        const payload = {
            franchise_id: franchiseId,
            title: form.title,
            description: form.description || null,
            badge_text: form.badge_text || 'PROMO',
            product_id: form.product_id || null,
            image_url: img,
            sort_order: editing?.sort_order ?? promotions.length,
            active: true,
        };
        if (editing) {
            await supabase.from('franchise_promotions').update(payload).eq('id', editing.id);
        }
        else {
            await supabase.from('franchise_promotions').insert(payload);
        }
        setForm({ title: '', description: '', badge_text: 'PROMO', product_id: '', image: null });
        setImageUrl(null);
        setEditing(null);
        setShowForm(false);
        setSaving(false);
        load();
    };
    const toggleActive = async (promo) => {
        await supabase.from('franchise_promotions').update({ active: !promo.active }).eq('id', promo.id);
        load();
    };
    const move = async (promo, dir) => {
        const sorted = [...promotions].sort((a, b) => a.sort_order - b.sort_order);
        const idx = sorted.findIndex(p => p.id === promo.id);
        const swapIdx = idx + dir;
        if (swapIdx < 0 || swapIdx >= sorted.length)
            return;
        const swap = sorted[swapIdx];
        await Promise.all([
            supabase.from('franchise_promotions').update({ sort_order: swap.sort_order }).eq('id', promo.id),
            supabase.from('franchise_promotions').update({ sort_order: promo.sort_order }).eq('id', swap.id),
        ]);
        load();
    };
    const remove = async (id) => {
        await supabase.from('franchise_promotions').delete().eq('id', id);
        load();
    };
    if (loading)
        return _jsx("div", { className: "text-zinc-400 text-sm", children: "Carregando promo\u00E7\u00F5es..." });
    return (_jsxs("div", { className: "space-y-4", children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { children: [_jsx("h2", { className: "text-white font-bold text-lg", children: "Promo\u00E7\u00F5es" }), _jsx("p", { className: "text-zinc-500 text-xs mt-0.5", children: "Crie promo\u00E7\u00F5es que aparecem no carrossel do seu cat\u00E1logo online" })] }), _jsxs("button", { onClick: () => { if (editing) {
                            setEditing(null);
                            setForm({ title: '', description: '', badge_text: 'PROMO', product_id: '', image: null });
                            setImageUrl(null);
                        } setShowForm(!showForm); }, className: "flex items-center gap-2 bg-[#FFE500] hover:bg-[#FFD000] text-black text-sm font-bold rounded-lg px-4 py-2 transition-colors", children: [_jsx(Plus, { size: 16 }), " ", showForm ? 'Cancelar' : 'Nova promoção'] })] }), showForm && (_jsxs("form", { onSubmit: handleSave, className: "bg-zinc-900 border border-zinc-800 rounded-xl p-4 space-y-3", children: [_jsx("input", { required: true, placeholder: "T\u00EDtulo da promo\u00E7\u00E3o", value: form.title, onChange: e => setForm({ ...form, title: e.target.value }), className: "w-full bg-zinc-800 border border-zinc-700 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#FFE500]" }), _jsx("textarea", { placeholder: "Descri\u00E7\u00E3o da promo\u00E7\u00E3o", value: form.description, onChange: e => setForm({ ...form, description: e.target.value }), rows: 2, className: "w-full bg-zinc-800 border border-zinc-700 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#FFE500] resize-none" }), _jsxs("div", { className: "grid grid-cols-1 sm:grid-cols-2 gap-3", children: [_jsx("input", { placeholder: "Texto do selo (ex: OFERTA, PROMO)", value: form.badge_text, onChange: e => setForm({ ...form, badge_text: e.target.value }), className: "bg-zinc-800 border border-zinc-700 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#FFE500]" }), _jsxs("select", { value: form.product_id, onChange: e => setForm({ ...form, product_id: e.target.value }), className: "bg-zinc-800 border border-zinc-700 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#FFE500]", children: [_jsx("option", { value: "", children: "Sem produto vinculado" }), products.map(p => _jsx("option", { value: p.id, children: p.name }, p.id))] })] }), _jsxs("label", { className: "flex items-center gap-2 bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 cursor-pointer hover:border-[#FFE500]/50 transition-colors", children: [_jsx(Upload, { size: 16, className: "text-zinc-400" }), _jsx("span", { className: "text-zinc-400 text-sm", children: form.image ? form.image.name : 'Imagem do banner (opcional)' }), _jsx("input", { type: "file", accept: "image/*", className: "hidden", onChange: e => setForm({ ...form, image: e.target.files?.[0] ?? null }) })] }), imageUrl && !form.image && _jsx("img", { src: imageUrl, alt: "", className: "w-full h-32 object-cover rounded-lg" }), _jsx("button", { type: "submit", disabled: saving, className: "bg-[#FFE500] hover:bg-[#FFD000] text-black text-sm font-bold rounded-lg px-4 py-2 disabled:opacity-50", children: saving ? 'Salvando...' : editing ? 'Salvar' : 'Criar promoção' })] })), promotions.length === 0 ? (_jsxs("div", { className: "text-center py-12", children: [_jsx(Ticket, { size: 32, className: "mx-auto text-zinc-700 mb-3" }), _jsx("p", { className: "text-zinc-400 text-sm", children: "Nenhuma promo\u00E7\u00E3o criada ainda." })] })) : (_jsx("div", { className: "space-y-2", children: promotions.sort((a, b) => a.sort_order - b.sort_order).map((promo, idx, arr) => (_jsxs("div", { className: `bg-zinc-900 border rounded-xl p-3 flex items-center gap-3 ${promo.active ? 'border-zinc-800' : 'border-zinc-800 opacity-50'}`, children: [_jsx("div", { className: "w-16 h-16 rounded-lg overflow-hidden bg-zinc-800 flex-shrink-0", children: promo.image_url ? _jsx("img", { src: promo.image_url, alt: "", className: "w-full h-full object-cover" }) : _jsx("div", { className: "w-full h-full flex items-center justify-center", children: _jsx(Ticket, { size: 18, className: "text-zinc-600" }) }) }), _jsxs("div", { className: "flex-1 min-w-0", children: [_jsxs("div", { className: "flex items-center gap-2", children: [promo.badge_text && _jsx("span", { className: "bg-[#FFE500] text-black text-[10px] font-black px-2 py-0.5 rounded-full", children: promo.badge_text }), _jsx("h3", { className: "text-white text-sm font-bold truncate", children: promo.title })] }), promo.description && _jsx("p", { className: "text-zinc-400 text-xs mt-0.5 truncate", children: promo.description })] }), _jsxs("div", { className: "flex items-center gap-1", children: [_jsx("button", { onClick: () => move(promo, -1), disabled: idx === 0, className: "text-zinc-500 hover:text-white p-1 disabled:opacity-30", children: _jsx(ChevronUp, { size: 16 }) }), _jsx("button", { onClick: () => move(promo, idx + 1 < arr.length ? 1 : 0), disabled: idx === arr.length - 1, className: "text-zinc-500 hover:text-white p-1 disabled:opacity-30", children: _jsx(ChevronDown, { size: 16 }) }), _jsx("button", { onClick: () => toggleActive(promo), className: "text-zinc-500 hover:text-[#FFE500] p-1", children: promo.active ? _jsx(ToggleRight, { size: 18 }) : _jsx(ToggleLeft, { size: 18 }) }), _jsx("button", { onClick: () => { setEditing(promo); setForm({ title: promo.title, description: promo.description ?? '', badge_text: promo.badge_text ?? 'PROMO', product_id: promo.product_id ?? '', image: null }); setImageUrl(promo.image_url); setShowForm(true); }, className: "text-zinc-500 hover:text-[#FFE500] p-1", children: _jsx(Edit, { size: 14 }) }), _jsx("button", { onClick: () => remove(promo.id), className: "text-zinc-500 hover:text-red-400 p-1", children: _jsx(Trash2, { size: 14 }) })] })] }, promo.id))) }))] }));
}
