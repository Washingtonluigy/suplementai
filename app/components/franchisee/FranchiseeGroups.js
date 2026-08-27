import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from 'react';
import { supabase } from '/app/lib/supabase.js';
import { Layers, Plus, Trash2, ChevronRight, Gift, DollarSign, Edit, X } from 'lucide-react';
export default function FranchiseeGroups({ franchiseId }) {
    const [groups, setGroups] = useState([]);
    const [addons, setAddons] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedGroup, setSelectedGroup] = useState(null);
    const [showGroupForm, setShowGroupForm] = useState(false);
    const [showAddonForm, setShowAddonForm] = useState(false);
    const [editingAddon, setEditingAddon] = useState(null);
    const [groupName, setGroupName] = useState('');
    const [addonForm, setAddonForm] = useState({ name: '', price: '', is_free: false });
    const [saving, setSaving] = useState(false);
    const load = async () => {
        const [{ data: grpData }, { data: adnData }] = await Promise.all([
            supabase.from('franchise_groups').select('*').eq('franchise_id', franchiseId).order('name'),
            supabase.from('franchise_addons').select('*').order('name'),
        ]);
        if (grpData)
            setGroups(grpData);
        if (adnData)
            setAddons(adnData);
        setLoading(false);
    };
    useEffect(() => { load(); }, [franchiseId]);
    const saveGroup = async (e) => {
        e.preventDefault();
        setSaving(true);
        await supabase.from('franchise_groups').insert({ franchise_id: franchiseId, name: groupName });
        setGroupName('');
        setShowGroupForm(false);
        setSaving(false);
        load();
    };
    const deleteGroup = async (g) => {
        if (!confirm(`Excluir grupo "${g.name}" e seus adicionais?`))
            return;
        await supabase.from('franchise_groups').delete().eq('id', g.id);
        if (selectedGroup === g.id)
            setSelectedGroup(null);
        load();
    };
    const saveAddon = async (e) => {
        e.preventDefault();
        setSaving(true);
        const payload = { group_id: selectedGroup, name: addonForm.name, price: parseFloat(addonForm.price) || 0, is_free: addonForm.is_free };
        if (editingAddon) {
            await supabase.from('franchise_addons').update(payload).eq('id', editingAddon.id);
        }
        else {
            await supabase.from('franchise_addons').insert(payload);
        }
        setAddonForm({ name: '', price: '', is_free: false });
        setEditingAddon(null);
        setShowAddonForm(false);
        setSaving(false);
        load();
    };
    const deleteAddon = async (a) => {
        if (!confirm(`Excluir adicional "${a.name}"?`))
            return;
        await supabase.from('franchise_addons').delete().eq('id', a.id);
        load();
    };
    const addonsInGroup = (gid) => addons.filter(a => a.group_id === gid);
    if (loading) {
        return _jsx("div", { className: "flex justify-center py-12", children: _jsx("div", { className: "w-6 h-6 border-2 border-zinc-700 border-t-[#FFE500] rounded-full animate-spin" }) });
    }
    if (selectedGroup) {
        const grp = groups.find(g => g.id === selectedGroup);
        return (_jsxs("div", { children: [_jsx("button", { onClick: () => setSelectedGroup(null), className: "text-zinc-400 hover:text-white text-sm mb-4 transition-colors", children: "\u2190 Voltar" }), _jsxs("div", { className: "flex items-center justify-between mb-4", children: [_jsx("h3", { className: "text-white font-bold text-lg", children: grp?.name }), _jsxs("button", { onClick: () => { if (editingAddon) {
                                setEditingAddon(null);
                                setAddonForm({ name: '', price: '', is_free: false });
                            } setShowAddonForm(!showAddonForm); }, className: "bg-[#FFE500] hover:bg-[#FFD000] text-black text-sm font-bold rounded-lg px-4 py-2 flex items-center gap-1.5 transition-all", children: [_jsx(Plus, { size: 16 }), " Novo Adicional"] })] }), showAddonForm && (_jsxs("form", { onSubmit: saveAddon, className: "bg-zinc-900 border border-zinc-800 rounded-xl p-4 mb-4 space-y-3", children: [_jsxs("div", { className: "grid grid-cols-1 sm:grid-cols-2 gap-3", children: [_jsx("input", { type: "text", value: addonForm.name, onChange: e => setAddonForm({ ...addonForm, name: e.target.value }), required: true, placeholder: "Nome do adicional", className: "bg-zinc-800 border border-zinc-700 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#FFE500]" }), _jsx("input", { type: "number", step: "0.01", value: addonForm.price, onChange: e => setAddonForm({ ...addonForm, price: e.target.value }), disabled: addonForm.is_free, placeholder: "Pre\u00E7o", className: "bg-zinc-800 border border-zinc-700 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#FFE500] disabled:opacity-50" })] }), _jsxs("label", { className: "flex items-center gap-2 cursor-pointer", children: [_jsx("input", { type: "checkbox", checked: addonForm.is_free, onChange: e => setAddonForm({ ...addonForm, is_free: e.target.checked }), className: "w-4 h-4 accent-[#FFE500]" }), _jsx("span", { className: "text-zinc-300 text-sm", children: "Adicional gr\u00E1tis" })] }), _jsxs("div", { className: "flex gap-2", children: [_jsx("button", { type: "submit", disabled: saving, className: "bg-[#FFE500] hover:bg-[#FFD000] text-black text-sm font-bold rounded-lg px-4 py-2 disabled:opacity-50", children: saving ? '...' : editingAddon ? 'Salvar' : 'Criar' }), _jsx("button", { type: "button", onClick: () => { setShowAddonForm(false); setEditingAddon(null); }, className: "bg-zinc-700 text-white rounded-lg px-3 py-2", children: _jsx(X, { size: 16 }) })] })] })), addonsInGroup(selectedGroup).length === 0 ? (_jsxs("div", { className: "text-center py-12", children: [_jsx(Plus, { size: 40, className: "mx-auto text-zinc-700 mb-3" }), _jsx("p", { className: "text-zinc-400 text-sm", children: "Nenhum adicional neste grupo." })] })) : (_jsx("div", { className: "space-y-2", children: addonsInGroup(selectedGroup).map(a => (_jsxs("div", { className: "bg-zinc-900 border border-zinc-800 rounded-xl p-3 flex items-center justify-between", children: [_jsxs("div", { className: "flex items-center gap-3", children: [_jsx("div", { className: `w-9 h-9 rounded-lg flex items-center justify-center ${a.is_free ? 'bg-green-500/10' : 'bg-[#FFE500]/10'}`, children: a.is_free ? _jsx(Gift, { size: 16, className: "text-green-400" }) : _jsx(DollarSign, { size: 16, className: "text-[#FFE500]" }) }), _jsxs("div", { children: [_jsx("p", { className: "text-white text-sm font-bold", children: a.name }), _jsx("p", { className: "text-zinc-500 text-xs", children: a.is_free ? 'Grátis' : `R$ ${a.price.toFixed(2)}` })] })] }), _jsxs("div", { className: "flex gap-1", children: [_jsx("button", { onClick: () => { setEditingAddon(a); setAddonForm({ name: a.name, price: String(a.price), is_free: a.is_free }); setShowAddonForm(true); }, className: "text-zinc-500 hover:text-[#FFE500] p-1", children: _jsx(Edit, { size: 14 }) }), _jsx("button", { onClick: () => deleteAddon(a), className: "text-zinc-500 hover:text-red-400 p-1", children: _jsx(Trash2, { size: 14 }) })] })] }, a.id))) }))] }));
    }
    return (_jsxs("div", { children: [_jsxs("div", { className: "flex items-center justify-between mb-4", children: [_jsx("h3", { className: "text-white font-bold text-lg", children: "Grupos e Adicionais" }), _jsxs("button", { onClick: () => setShowGroupForm(!showGroupForm), className: "bg-[#FFE500] hover:bg-[#FFD000] text-black text-sm font-bold rounded-lg px-4 py-2 flex items-center gap-1.5 transition-all", children: [_jsx(Plus, { size: 16 }), " Novo Grupo"] })] }), showGroupForm && (_jsxs("form", { onSubmit: saveGroup, className: "bg-zinc-900 border border-zinc-800 rounded-xl p-4 mb-4 flex gap-2", children: [_jsx("input", { type: "text", value: groupName, onChange: e => setGroupName(e.target.value), required: true, placeholder: "Nome do grupo", className: "flex-1 bg-zinc-800 border border-zinc-700 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#FFE500]" }), _jsx("button", { type: "submit", disabled: saving, className: "bg-[#FFE500] hover:bg-[#FFD000] text-black text-sm font-bold rounded-lg px-4 py-2 disabled:opacity-50", children: "Criar" })] })), groups.length === 0 ? (_jsxs("div", { className: "text-center py-12", children: [_jsx(Layers, { size: 40, className: "mx-auto text-zinc-700 mb-3" }), _jsx("p", { className: "text-zinc-400 text-sm", children: "Nenhum grupo criado." })] })) : (_jsx("div", { className: "space-y-2", children: groups.map(g => (_jsx("div", { className: "bg-zinc-900 border border-zinc-800 rounded-xl p-4 cursor-pointer hover:border-[#FFE500]/30 transition-all group", onClick: () => setSelectedGroup(g.id), children: _jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { className: "flex items-center gap-3", children: [_jsx("div", { className: "w-10 h-10 rounded-lg bg-[#FFE500]/10 flex items-center justify-center", children: _jsx(Layers, { size: 18, className: "text-[#FFE500]" }) }), _jsxs("div", { children: [_jsx("p", { className: "text-white font-bold text-sm", children: g.name }), _jsxs("p", { className: "text-zinc-500 text-xs", children: [addonsInGroup(g.id).length, " adicional(is)"] })] })] }), _jsxs("div", { className: "flex items-center gap-1", onClick: e => e.stopPropagation(), children: [_jsx(ChevronRight, { size: 18, className: "text-zinc-600 group-hover:text-[#FFE500] transition-colors" }), _jsx("button", { onClick: () => deleteGroup(g), className: "text-zinc-500 hover:text-red-400 p-1", children: _jsx(Trash2, { size: 14 }) })] })] }) }, g.id))) }))] }));
}
