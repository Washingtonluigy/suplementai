import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from 'react';
import { supabase } from '/app/lib/supabase.js';
import { Tag, Plus, Trash2, ArrowUp, ArrowDown, Edit, X } from 'lucide-react';
export default function FranchiseeCategories({ franchiseId }) {
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [editing, setEditing] = useState(null);
    const [name, setName] = useState('');
    const [saving, setSaving] = useState(false);
    const [movingId, setMovingId] = useState(null);
    const load = async () => {
        const { data } = await supabase.from('franchise_categories').select('*').eq('franchise_id', franchiseId).order('sort_order', { ascending: true }).order('created_at', { ascending: true }).order('id', { ascending: true });
        if (data)
            setCategories(data);
        setLoading(false);
    };
    useEffect(() => { load(); }, [franchiseId]);
    const handleSave = async (e) => {
        e.preventDefault();
        setSaving(true);
        if (editing) {
            await supabase.from('franchise_categories').update({ name }).eq('id', editing.id);
        }
        else {
            const maxSort = categories.reduce((max, category) => Math.max(max, category.sort_order ?? -1), -1);
            await supabase.from('franchise_categories').insert({ franchise_id: franchiseId, name, sort_order: maxSort + 1 });
        }
        setName('');
        setEditing(null);
        setShowForm(false);
        setSaving(false);
        load();
    };
    const handleDelete = async (c) => {
        if (!confirm(`Excluir categoria "${c.name}"?`))
            return;
        await supabase.from('franchise_categories').delete().eq('id', c.id);
        load();
    };
    const move = async (c, dir) => {
        if (movingId)
            return;
        // Usa exatamente a ordem que o usuário está vendo. Se houver sort_order
        // repetido/fora de sequência, o clique também normaliza a lista inteira.
        const sorted = [...categories].sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0) ||
            (a.created_at ?? '').localeCompare(b.created_at ?? '') ||
            a.id.localeCompare(b.id));
        const idx = sorted.findIndex(x => x.id === c.id);
        const targetIdx = dir === 'up' ? idx - 1 : idx + 1;
        if (idx < 0 || targetIdx < 0 || targetIdx >= sorted.length)
            return;
        const reordered = [...sorted];
        const [moved] = reordered.splice(idx, 1);
        reordered.splice(targetIdx, 0, moved);
        setMovingId(c.id);
        try {
            const results = await Promise.all(reordered.map((category, position) => supabase
                .from('franchise_categories')
                .update({ sort_order: position })
                .eq('id', category.id)
                .eq('franchise_id', franchiseId)));
            const failed = results.find(result => result.error);
            if (failed?.error)
                throw failed.error;
            setCategories(reordered.map((category, position) => ({ ...category, sort_order: position })));
        }
        catch (error) {
            console.error('Erro ao reordenar categorias:', error);
            alert('Não foi possível alterar a ordem da categoria. Tente novamente.');
            await load();
        }
        finally {
            setMovingId(null);
        }
    };
    return (_jsxs("div", { children: [_jsxs("div", { className: "flex items-center justify-between mb-4", children: [_jsx("h3", { className: "text-white font-bold text-lg", children: "Categorias" }), _jsxs("button", { onClick: () => { if (editing) {
                            setEditing(null);
                            setName('');
                        } setShowForm(!showForm); }, className: "bg-[#FFE500] hover:bg-[#FFD000] text-black text-sm font-bold rounded-lg px-4 py-2 flex items-center gap-1.5 transition-all", children: [_jsx(Plus, { size: 16 }), " ", editing ? 'Editando...' : 'Nova Categoria'] })] }), showForm && (_jsxs("form", { onSubmit: handleSave, className: "bg-zinc-900 border border-zinc-800 rounded-xl p-4 mb-4 flex gap-2", children: [_jsx("input", { type: "text", value: name, onChange: e => setName(e.target.value), required: true, placeholder: "Nome da categoria", className: "flex-1 bg-zinc-800 border border-zinc-700 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#FFE500]" }), _jsx("button", { type: "submit", disabled: saving, className: "bg-[#FFE500] hover:bg-[#FFD000] text-black text-sm font-bold rounded-lg px-4 py-2 disabled:opacity-50", children: saving ? '...' : 'Salvar' }), _jsx("button", { type: "button", onClick: () => { setShowForm(false); setEditing(null); }, className: "bg-zinc-700 text-white rounded-lg px-3 py-2", children: _jsx(X, { size: 16 }) })] })), loading ? (_jsx("div", { className: "flex justify-center py-12", children: _jsx("div", { className: "w-6 h-6 border-2 border-zinc-700 border-t-[#FFE500] rounded-full animate-spin" }) })) : categories.length === 0 ? (_jsxs("div", { className: "text-center py-12", children: [_jsx(Tag, { size: 40, className: "mx-auto text-zinc-700 mb-3" }), _jsx("p", { className: "text-zinc-400 text-sm", children: "Nenhuma categoria criada." })] })) : (_jsx("div", { className: "space-y-2", children: [...categories].sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0) ||
                    (a.created_at ?? '').localeCompare(b.created_at ?? '') ||
                    a.id.localeCompare(b.id)).map((c, i, arr) => (_jsxs("div", { className: "bg-zinc-900 border border-zinc-800 rounded-xl p-3 flex items-center gap-3", children: [_jsx("div", { className: "w-10 h-10 rounded-lg bg-[#FFE500]/10 flex items-center justify-center", children: _jsx(Tag, { size: 18, className: "text-[#FFE500]" }) }), _jsx("p", { className: "text-white text-sm font-bold flex-1", children: c.name }), _jsxs("div", { className: "flex items-center gap-1", children: [_jsx("button", { onClick: () => move(c, 'up'), disabled: i === 0 || movingId !== null, className: "text-zinc-500 hover:text-[#FFE500] p-1 disabled:opacity-30", children: _jsx(ArrowUp, { size: 14 }) }), _jsx("button", { onClick: () => move(c, 'down'), disabled: i === arr.length - 1 || movingId !== null, className: "text-zinc-500 hover:text-[#FFE500] p-1 disabled:opacity-30", children: _jsx(ArrowDown, { size: 14 }) }), _jsx("button", { onClick: () => { setEditing(c); setName(c.name); setShowForm(true); }, className: "text-zinc-500 hover:text-[#FFE500] p-1", children: _jsx(Edit, { size: 14 }) }), _jsx("button", { onClick: () => handleDelete(c), className: "text-zinc-500 hover:text-red-400 p-1", children: _jsx(Trash2, { size: 14 }) })] })] }, c.id))) }))] }));
}
