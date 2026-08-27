import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useEffect, useState } from 'react';
import { supabase } from '/app/lib/supabase.js';
import { X, Plus, Trash2, Layers, Package, Tag, Upload, Edit, Link2, ImageIcon, ChevronUp, ChevronDown, Video, ArrowUp, ArrowDown, RefreshCw } from 'lucide-react';
import ProductLinkTool from './ProductLinkTool.js';
export default function TemplatesTool({ onClose }) {
    const [categories, setCategories] = useState([]);
    const [groups, setGroups] = useState([]);
    const [addons, setAddons] = useState([]);
    const [products, setProducts] = useState([]);
    const [franchises, setFranchises] = useState([]);
    const [loading, setLoading] = useState(true);
    const [view, setView] = useState('menu');
    const [showCreate, setShowCreate] = useState(false);
    const [editing, setEditing] = useState(null);
    const [saving, setSaving] = useState(false);
    const [showProductLink, setShowProductLink] = useState(false);
    const [syncing, setSyncing] = useState(false);
    const [syncResult, setSyncResult] = useState(null);
    const [movingCategoryId, setMovingCategoryId] = useState(null);
    const syncAll = async () => {
        setSyncing(true);
        setSyncResult(null);
        try {
            const { data, error } = await supabase.rpc('force_full_sync');
            if (error)
                throw error;
            if (data) {
                const r = data;
                setSyncResult(`Sincronização concluída: ${r.categories_created} categoria(s) criada(s), ${r.categories_synced} atualizada(s), ${r.products_created} produto(s) criado(s), ${r.products_synced} atualizado(s).`);
            }
            else {
                setSyncResult('Sincronização concluída.');
            }
        }
        catch (err) {
            setSyncResult(`Erro: ${err.message}`);
        }
        setSyncing(false);
    };
    const [catForm, setCatForm] = useState({ name: '' });
    const [groupForm, setGroupForm] = useState({ category_id: '', name: '' });
    const [addonForm, setAddonForm] = useState({ group_id: '', name: '', price: '' });
    const [prodForm, setProdForm] = useState({
        category_id: '', name: '', description: '', price: '', discount_price: '', franchise_id: '',
        image: null,
        long_description: '', ingredients: '', nutritional_info: '', usage_instructions: '',
        brand: '', flavor: '', weight: '',
    });
    const [imageUrl, setImageUrl] = useState(null);
    const [galleryFiles, setGalleryFiles] = useState([]);
    const [galleryUrls, setGalleryUrls] = useState([]);
    const [videoFiles, setVideoFiles] = useState([]);
    const [videoUrls, setVideoUrls] = useState([]);
    const load = async () => {
        const [{ data: cats }, { data: grps }, { data: adns }, { data: prods }, { data: frans }] = await Promise.all([
            supabase.from('product_categories').select('*').order('sort_order').order('name'),
            supabase.from('product_groups').select('*').order('name'),
            supabase.from('product_addons').select('*').order('name'),
            supabase.from('products').select('*').order('created_at', { ascending: false }),
            supabase.from('franchises').select('*').order('name'),
        ]);
        if (cats)
            setCategories(cats);
        if (grps)
            setGroups(grps);
        if (adns)
            setAddons(adns);
        if (prods)
            setProducts(prods);
        if (frans)
            setFranchises(frans);
        setLoading(false);
    };
    useEffect(() => { load(); }, []);
    const saveCategory = async (e) => {
        e.preventDefault();
        setSaving(true);
        if (editing) {
            await supabase.from('product_categories').update({ name: catForm.name }).eq('id', editing.id);
        }
        else {
            const maxSort = categories.reduce((max, c) => Math.max(max, c.sort_order ?? 0), 0);
            await supabase.from('product_categories').insert({ name: catForm.name, sort_order: maxSort + 1 });
        }
        setCatForm({ name: '' });
        setEditing(null);
        setShowCreate(false);
        setSaving(false);
        load();
    };
    const moveCategory = async (id, direction) => {
        if (movingCategoryId)
            return;
        const sorted = [...categories].sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0));
        const idx = sorted.findIndex(category => category.id === id);
        const targetIdx = direction === 'up' ? idx - 1 : idx + 1;
        if (idx < 0 || targetIdx < 0 || targetIdx >= sorted.length)
            return;
        const reordered = [...sorted];
        const [moved] = reordered.splice(idx, 1);
        reordered.splice(targetIdx, 0, moved);
        setMovingCategoryId(id);
        try {
            const results = await Promise.all(reordered.map((category, position) => supabase.from('product_categories').update({ sort_order: position }).eq('id', category.id)));
            const failed = results.find(result => result.error);
            if (failed?.error)
                throw failed.error;
            setCategories(reordered.map((category, position) => ({ ...category, sort_order: position })));
        }
        catch (error) {
            console.error('Erro ao reordenar categorias do catálogo:', error);
            alert('Não foi possível alterar a ordem da categoria. Tente novamente.');
            await load();
        }
        finally {
            setMovingCategoryId(null);
        }
    };
    const saveGroup = async (e) => {
        e.preventDefault();
        setSaving(true);
        if (editing) {
            await supabase.from('product_groups').update({ category_id: groupForm.category_id, name: groupForm.name }).eq('id', editing.id);
        }
        else {
            await supabase.from('product_groups').insert({ category_id: groupForm.category_id, name: groupForm.name });
        }
        setGroupForm({ category_id: '', name: '' });
        setEditing(null);
        setShowCreate(false);
        setSaving(false);
        load();
    };
    const saveAddon = async (e) => {
        e.preventDefault();
        setSaving(true);
        const payload = { group_id: addonForm.group_id, name: addonForm.name, price: parseFloat(addonForm.price) || 0 };
        if (editing) {
            await supabase.from('product_addons').update(payload).eq('id', editing.id);
        }
        else {
            await supabase.from('product_addons').insert(payload);
        }
        setAddonForm({ group_id: '', name: '', price: '' });
        setEditing(null);
        setShowCreate(false);
        setSaving(false);
        load();
    };
    const saveProduct = async (e) => {
        e.preventDefault();
        setSaving(true);
        let img = imageUrl;
        if (prodForm.image) {
            const ext = prodForm.image.name.split('.').pop();
            const path = `${Date.now()}.${ext}`;
            const { error } = await supabase.storage.from('product-images').upload(path, prodForm.image);
            if (!error)
                img = supabase.storage.from('product-images').getPublicUrl(path).data.publicUrl;
        }
        // Upload gallery images
        const uploadedGallery = [...galleryUrls];
        for (const file of galleryFiles) {
            const ext = file.name.split('.').pop();
            const path = `gallery-${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
            const { error } = await supabase.storage.from('product-images').upload(path, file);
            if (!error)
                uploadedGallery.push(supabase.storage.from('product-images').getPublicUrl(path).data.publicUrl);
        }
        // Upload videos
        const uploadedVideos = [...videoUrls];
        for (const file of videoFiles) {
            const ext = file.name.split('.').pop() || 'mp4';
            const path = `videos-${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
            const { error } = await supabase.storage.from('product-images').upload(path, file);
            if (!error)
                uploadedVideos.push(supabase.storage.from('product-images').getPublicUrl(path).data.publicUrl);
        }
        const payload = {
            category_id: prodForm.category_id || null,
            name: prodForm.name,
            description: prodForm.description || null,
            price: parseFloat(prodForm.price) || 0,
            discount_price: prodForm.discount_price ? parseFloat(prodForm.discount_price) : null,
            image_url: img,
            franchise_id: prodForm.franchise_id || null,
            long_description: prodForm.long_description || null,
            ingredients: prodForm.ingredients || null,
            nutritional_info: prodForm.nutritional_info || null,
            usage_instructions: prodForm.usage_instructions || null,
            brand: prodForm.brand || null,
            flavor: prodForm.flavor || null,
            weight: prodForm.weight || null,
            gallery_urls: uploadedGallery.length > 0 ? uploadedGallery : null,
            video_urls: uploadedVideos.length > 0 ? uploadedVideos : null,
        };
        if (editing) {
            await supabase.from('products').update(payload).eq('id', editing.id);
        }
        else {
            await supabase.from('products').insert(payload);
        }
        setProdForm({ category_id: '', name: '', description: '', price: '', discount_price: '', franchise_id: '', image: null, long_description: '', ingredients: '', nutritional_info: '', usage_instructions: '', brand: '', flavor: '', weight: '' });
        setImageUrl(null);
        setGalleryFiles([]);
        setGalleryUrls([]);
        setVideoFiles([]);
        setVideoUrls([]);
        setEditing(null);
        setShowCreate(false);
        setSaving(false);
        load();
    };
    const moveGalleryImage = (index, direction) => {
        const nextIndex = direction === 'up' ? index - 1 : index + 1;
        if (nextIndex < 0 || nextIndex >= galleryUrls.length)
            return;
        const next = [...galleryUrls];
        [next[index], next[nextIndex]] = [next[nextIndex], next[index]];
        setGalleryUrls(next);
    };
    const deleteItem = async (table, id) => {
        if (!confirm('Excluir este item?'))
            return;
        await supabase.from(table).delete().eq('id', id);
        load();
    };
    const catName = (id) => categories.find(c => c.id === id)?.name ?? '—';
    const groupName = (id) => groups.find(g => g.id === id)?.name ?? '—';
    const franName = (id) => id ? (franchises.find(f => f.id === id)?.name ?? '—') : 'Todas as franquias';
    return (_jsxs("div", { className: "fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm", onClick: onClose, children: [_jsxs("div", { className: "bg-zinc-900 border border-zinc-800 rounded-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto", onClick: e => e.stopPropagation(), children: [_jsxs("div", { className: "flex items-center justify-between p-6 border-b border-zinc-800 sticky top-0 bg-zinc-900 z-10", children: [_jsxs("div", { className: "flex items-center gap-3", children: [_jsx("div", { className: "w-10 h-10 rounded-lg bg-[#FFE500]/10 flex items-center justify-center", children: _jsx(Layers, { size: 20, className: "text-[#FFE500]" }) }), _jsxs("div", { children: [_jsx("h2", { className: "font-bold text-white text-lg", children: "Templates de Produtos" }), _jsx("p", { className: "text-zinc-500 text-xs", children: "Categorias, grupos, adicionais e produtos" })] })] }), _jsx("button", { onClick: onClose, className: "text-zinc-400 hover:text-white transition-colors", children: _jsx(X, { size: 22 }) })] }), _jsxs("div", { className: "p-6", children: [view === 'menu' && (_jsxs("div", { className: "grid grid-cols-1 sm:grid-cols-2 gap-4", children: [[
                                        { key: 'categories', icon: _jsx(Tag, { size: 22 }), label: 'Categorias', desc: 'Categorias de produtos' },
                                        { key: 'groups', icon: _jsx(Layers, { size: 22 }), label: 'Grupos', desc: 'Grupos de adicionais' },
                                        { key: 'addons', icon: _jsx(Plus, { size: 22 }), label: 'Adicionais', desc: 'Opções dentro dos grupos' },
                                        { key: 'products', icon: _jsx(Package, { size: 22 }), label: 'Produtos', desc: 'Produtos para as franquias' },
                                        { key: 'link', icon: _jsx(Link2, { size: 22 }), label: 'Vincular produtos', desc: 'Distribua produtos para uma ou todas as franquias' },
                                    ].map(item => (_jsxs("button", { onClick: () => {
                                            if (item.key === 'link') {
                                                setShowProductLink(true);
                                            }
                                            else {
                                                setView(item.key);
                                                setShowCreate(false);
                                                setEditing(null);
                                            }
                                        }, className: "bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 hover:border-[#FFE500]/30 rounded-xl p-5 text-left transition-all group", children: [_jsx("div", { className: "w-12 h-12 rounded-lg bg-[#FFE500]/10 flex items-center justify-center mb-3 group-hover:bg-[#FFE500]/20 transition-colors text-[#FFE500]", children: item.icon }), _jsx("h3", { className: "text-white font-bold", children: item.label }), _jsx("p", { className: "text-zinc-400 text-sm mt-1", children: item.desc })] }, item.key))), _jsxs("div", { className: "sm:col-span-2 mt-2", children: [_jsxs("button", { onClick: syncAll, disabled: syncing, className: "w-full bg-[#FFE500]/10 hover:bg-[#FFE500]/20 border border-[#FFE500]/30 hover:border-[#FFE500]/50 rounded-xl p-5 text-left transition-all group flex items-center gap-4 disabled:opacity-60", children: [_jsx("div", { className: "w-12 h-12 rounded-lg bg-[#FFE500]/10 flex items-center justify-center group-hover:bg-[#FFE500]/20 transition-colors text-[#FFE500]", children: syncing ? _jsx("div", { className: "w-6 h-6 border-2 border-[#FFE500]/30 border-t-[#FFE500] rounded-full animate-spin" }) : _jsx(RefreshCw, { size: 22 }) }), _jsxs("div", { className: "flex-1", children: [_jsx("h3", { className: "text-white font-bold", children: "Sincronizar tudo para as unidades" }), _jsx("p", { className: "text-zinc-400 text-sm mt-1", children: "Envia todas as categorias e produtos do master para todas as franquias ativas" })] })] }), syncResult && (_jsx("div", { className: "mt-3 bg-zinc-800/50 border border-zinc-700 rounded-lg p-3", children: _jsx("p", { className: "text-zinc-300 text-sm", children: syncResult }) }))] })] })), view !== 'menu' && (_jsxs("div", { children: [_jsxs("div", { className: "flex items-center justify-between mb-4 flex-wrap gap-2", children: [_jsx("button", { onClick: () => setView('menu'), className: "text-zinc-400 hover:text-white text-sm transition-colors", children: "\u2190 Voltar" }), _jsxs("button", { onClick: () => { setEditing(null); setShowCreate(!showCreate); }, className: "bg-[#FFE500] hover:bg-[#FFD000] text-black text-sm font-bold rounded-lg px-4 py-2 flex items-center gap-1.5 transition-all", children: [_jsx(Plus, { size: 16 }), " Novo"] })] }), view === 'categories' && (_jsxs(_Fragment, { children: [showCreate && (_jsxs("form", { onSubmit: saveCategory, className: "bg-zinc-800/50 border border-zinc-700 rounded-lg p-4 mb-4 flex gap-2", children: [_jsx("input", { type: "text", value: catForm.name, onChange: e => setCatForm({ name: e.target.value }), required: true, placeholder: "Nome da categoria", className: "flex-1 bg-zinc-900 border border-zinc-700 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#FFE500]" }), _jsx("button", { type: "submit", disabled: saving, className: "bg-[#FFE500] hover:bg-[#FFD000] text-black text-sm font-bold rounded-lg px-4 py-2 disabled:opacity-50", children: saving ? '...' : 'Criar' })] })), loading ? _jsx("div", { className: "flex justify-center py-8", children: _jsx("div", { className: "w-6 h-6 border-2 border-zinc-700 border-t-[#FFE500] rounded-full animate-spin" }) }) :
                                                categories.length === 0 ? _jsx("p", { className: "text-zinc-400 text-sm text-center py-8", children: "Nenhuma categoria." }) :
                                                    _jsx("div", { className: "space-y-2", children: categories.map((c, i) => (_jsxs("div", { className: "bg-zinc-800/50 border border-zinc-700 rounded-lg p-3 flex items-center justify-between", children: [_jsxs("div", { className: "flex items-center gap-2", children: [_jsx(Tag, { size: 16, className: "text-[#FFE500]" }), _jsx("p", { className: "text-white text-sm font-medium", children: c.name })] }), _jsxs("div", { className: "flex gap-1", children: [_jsx("button", { onClick: () => moveCategory(c.id, 'up'), disabled: i === 0 || movingCategoryId !== null, className: "text-zinc-400 hover:text-[#FFE500] p-1.5 disabled:opacity-30", children: _jsx(ArrowUp, { size: 14 }) }), _jsx("button", { onClick: () => moveCategory(c.id, 'down'), disabled: i === categories.length - 1 || movingCategoryId !== null, className: "text-zinc-400 hover:text-[#FFE500] p-1.5 disabled:opacity-30", children: _jsx(ArrowDown, { size: 14 }) }), _jsx("button", { onClick: () => { setEditing(c); setCatForm({ name: c.name }); setShowCreate(true); }, className: "text-zinc-400 hover:text-[#FFE500] p-1.5", children: _jsx(Edit, { size: 14 }) }), _jsx("button", { onClick: () => deleteItem('product_categories', c.id), className: "text-zinc-400 hover:text-red-400 p-1.5", children: _jsx(Trash2, { size: 14 }) })] })] }, c.id))) })] })), view === 'groups' && (_jsxs(_Fragment, { children: [showCreate && (_jsxs("form", { onSubmit: saveGroup, className: "bg-zinc-800/50 border border-zinc-700 rounded-lg p-4 mb-4 space-y-3", children: [_jsxs("div", { children: [_jsx("label", { className: "block text-zinc-300 text-xs font-medium mb-1", children: "Categoria" }), _jsxs("select", { value: groupForm.category_id, onChange: e => setGroupForm({ ...groupForm, category_id: e.target.value }), required: true, className: "w-full bg-zinc-900 border border-zinc-700 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#FFE500]", children: [_jsx("option", { value: "", children: "Selecione..." }), categories.map(c => _jsx("option", { value: c.id, children: c.name }, c.id))] })] }), _jsx("input", { type: "text", value: groupForm.name, onChange: e => setGroupForm({ ...groupForm, name: e.target.value }), required: true, placeholder: "Nome do grupo", className: "w-full bg-zinc-900 border border-zinc-700 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#FFE500]" }), _jsx("button", { type: "submit", disabled: saving, className: "bg-[#FFE500] hover:bg-[#FFD000] text-black text-sm font-bold rounded-lg px-4 py-2 disabled:opacity-50", children: "Criar" })] })), loading ? _jsx("div", { className: "flex justify-center py-8", children: _jsx("div", { className: "w-6 h-6 border-2 border-zinc-700 border-t-[#FFE500] rounded-full animate-spin" }) }) :
                                                groups.length === 0 ? _jsx("p", { className: "text-zinc-400 text-sm text-center py-8", children: "Nenhum grupo." }) :
                                                    _jsx("div", { className: "space-y-2", children: groups.map(g => (_jsxs("div", { className: "bg-zinc-800/50 border border-zinc-700 rounded-lg p-3 flex items-center justify-between", children: [_jsxs("div", { children: [_jsx("p", { className: "text-white text-sm font-medium", children: g.name }), _jsx("p", { className: "text-zinc-500 text-xs", children: catName(g.category_id) })] }), _jsxs("div", { className: "flex gap-1", children: [_jsx("button", { onClick: () => { setEditing(g); setGroupForm({ category_id: g.category_id, name: g.name }); setShowCreate(true); }, className: "text-zinc-400 hover:text-[#FFE500] p-1.5", children: _jsx(Edit, { size: 14 }) }), _jsx("button", { onClick: () => deleteItem('product_groups', g.id), className: "text-zinc-400 hover:text-red-400 p-1.5", children: _jsx(Trash2, { size: 14 }) })] })] }, g.id))) })] })), view === 'addons' && (_jsxs(_Fragment, { children: [showCreate && (_jsxs("form", { onSubmit: saveAddon, className: "bg-zinc-800/50 border border-zinc-700 rounded-lg p-4 mb-4 space-y-3", children: [_jsxs("div", { children: [_jsx("label", { className: "block text-zinc-300 text-xs font-medium mb-1", children: "Grupo" }), _jsxs("select", { value: addonForm.group_id, onChange: e => setAddonForm({ ...addonForm, group_id: e.target.value }), required: true, className: "w-full bg-zinc-900 border border-zinc-700 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#FFE500]", children: [_jsx("option", { value: "", children: "Selecione..." }), groups.map(g => _jsxs("option", { value: g.id, children: [g.name, " (", catName(g.category_id), ")"] }, g.id))] })] }), _jsxs("div", { className: "grid grid-cols-2 gap-3", children: [_jsx("input", { type: "text", value: addonForm.name, onChange: e => setAddonForm({ ...addonForm, name: e.target.value }), required: true, placeholder: "Nome do adicional", className: "bg-zinc-900 border border-zinc-700 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#FFE500]" }), _jsx("input", { type: "number", step: "0.01", value: addonForm.price, onChange: e => setAddonForm({ ...addonForm, price: e.target.value }), required: true, placeholder: "Pre\u00E7o", className: "bg-zinc-900 border border-zinc-700 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#FFE500]" })] }), _jsx("button", { type: "submit", disabled: saving, className: "bg-[#FFE500] hover:bg-[#FFD000] text-black text-sm font-bold rounded-lg px-4 py-2 disabled:opacity-50", children: "Criar" })] })), loading ? _jsx("div", { className: "flex justify-center py-8", children: _jsx("div", { className: "w-6 h-6 border-2 border-zinc-700 border-t-[#FFE500] rounded-full animate-spin" }) }) :
                                                addons.length === 0 ? _jsx("p", { className: "text-zinc-400 text-sm text-center py-8", children: "Nenhum adicional." }) :
                                                    _jsx("div", { className: "space-y-2", children: addons.map(a => (_jsxs("div", { className: "bg-zinc-800/50 border border-zinc-700 rounded-lg p-3 flex items-center justify-between", children: [_jsxs("div", { children: [_jsx("p", { className: "text-white text-sm font-medium", children: a.name }), _jsxs("p", { className: "text-zinc-500 text-xs", children: [groupName(a.group_id), " \u2014 R$ ", a.price.toFixed(2)] })] }), _jsxs("div", { className: "flex gap-1", children: [_jsx("button", { onClick: () => { setEditing(a); setAddonForm({ group_id: a.group_id, name: a.name, price: String(a.price) }); setShowCreate(true); }, className: "text-zinc-400 hover:text-[#FFE500] p-1.5", children: _jsx(Edit, { size: 14 }) }), _jsx("button", { onClick: () => deleteItem('product_addons', a.id), className: "text-zinc-400 hover:text-red-400 p-1.5", children: _jsx(Trash2, { size: 14 }) })] })] }, a.id))) })] })), view === 'products' && (_jsxs(_Fragment, { children: [showCreate && (_jsxs("form", { onSubmit: saveProduct, className: "bg-zinc-800/50 border border-zinc-700 rounded-lg p-4 mb-4 space-y-3", children: [_jsxs("div", { className: "grid grid-cols-1 sm:grid-cols-2 gap-3", children: [_jsxs("div", { children: [_jsx("label", { className: "block text-zinc-300 text-xs font-medium mb-1", children: "Categoria" }), _jsxs("select", { value: prodForm.category_id, onChange: e => setProdForm({ ...prodForm, category_id: e.target.value }), className: "w-full bg-zinc-900 border border-zinc-700 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#FFE500]", children: [_jsx("option", { value: "", children: "Sem categoria" }), categories.map(c => _jsx("option", { value: c.id, children: c.name }, c.id))] })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-zinc-300 text-xs font-medium mb-1", children: "Aplicar a" }), _jsxs("select", { value: prodForm.franchise_id, onChange: e => setProdForm({ ...prodForm, franchise_id: e.target.value }), className: "w-full bg-zinc-900 border border-zinc-700 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#FFE500]", children: [_jsx("option", { value: "", children: "Todas as franquias" }), franchises.map(f => _jsx("option", { value: f.id, children: f.name }, f.id))] })] })] }), _jsxs("div", { className: "grid grid-cols-1 sm:grid-cols-2 gap-3", children: [_jsx("input", { type: "text", value: prodForm.name, onChange: e => setProdForm({ ...prodForm, name: e.target.value }), required: true, placeholder: "Nome do produto", className: "bg-zinc-900 border border-zinc-700 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#FFE500]" }), _jsx("input", { type: "number", step: "0.01", value: prodForm.price, onChange: e => setProdForm({ ...prodForm, price: e.target.value }), required: true, placeholder: "Pre\u00E7o", className: "bg-zinc-900 border border-zinc-700 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#FFE500]" }), _jsx("input", { type: "number", step: "0.01", value: prodForm.discount_price, onChange: e => setProdForm({ ...prodForm, discount_price: e.target.value }), placeholder: "Pre\u00E7o promocional (opcional)", className: "bg-zinc-900 border border-zinc-700 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#FFE500]" })] }), _jsx("textarea", { value: prodForm.description, onChange: e => setProdForm({ ...prodForm, description: e.target.value }), rows: 2, placeholder: "Descri\u00E7\u00E3o curta", className: "w-full bg-zinc-900 border border-zinc-700 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#FFE500] resize-none" }), _jsxs("div", { children: [_jsxs("label", { className: "flex items-center gap-2 bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 cursor-pointer hover:border-[#FFE500]/50 transition-colors", children: [_jsx(Upload, { size: 16, className: "text-zinc-400" }), _jsx("span", { className: "text-zinc-400 text-sm", children: prodForm.image ? prodForm.image.name : imageUrl ? 'Capa atual — clique para trocar' : 'Imagem principal (opcional)' }), _jsx("input", { type: "file", accept: "image/*", className: "hidden", onChange: e => setProdForm({ ...prodForm, image: e.target.files?.[0] ?? null }) })] }), (prodForm.image || imageUrl) && _jsxs("div", { className: "mt-2 flex items-center gap-3 bg-zinc-900/50 rounded-lg p-2", children: [_jsx("img", { src: prodForm.image ? URL.createObjectURL(prodForm.image) : imageUrl ?? '', alt: "Pr\u00E9via da capa", className: "w-16 h-16 rounded-lg object-cover" }), _jsxs("div", { children: [_jsx("p", { className: "text-white text-xs font-medium", children: "Capa atual" }), _jsx("p", { className: "text-zinc-500 text-xs", children: "Esta imagem aparece no cat\u00E1logo." })] })] })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-zinc-300 text-xs font-medium mb-1", children: "Galeria de imagens (opcional)" }), _jsxs("label", { className: "flex items-center gap-2 bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 cursor-pointer hover:border-[#FFE500]/50 transition-colors", children: [_jsx(ImageIcon, { size: 16, className: "text-zinc-400" }), _jsx("span", { className: "text-zinc-400 text-sm", children: galleryFiles.length > 0 ? `${galleryFiles.length} nova(s) imagem(ns)` : 'Adicionar múltiplas fotos' }), _jsx("input", { type: "file", accept: "image/*", multiple: true, className: "hidden", onChange: e => setGalleryFiles([...galleryFiles, ...Array.from(e.target.files ?? [])]) })] }), (galleryUrls.length > 0 || galleryFiles.length > 0) && (_jsxs(_Fragment, { children: [_jsx("p", { className: "text-zinc-500 text-xs mt-2", children: "A ordem acima ser\u00E1 usada no cat\u00E1logo: 1\u00AA, 2\u00AA, 3\u00AA..." }), _jsxs("div", { className: "flex gap-2 mt-2 flex-wrap", children: [galleryUrls.map((url, i) => (_jsxs("div", { className: "relative w-20 h-20 rounded-lg overflow-hidden group border border-zinc-700", children: [_jsx("img", { src: url, alt: `Imagem ${i + 1}`, className: "w-full h-full object-cover" }), _jsxs("span", { className: "absolute top-1 left-1 bg-black/70 text-white text-[10px] font-bold rounded px-1.5 py-0.5", children: [i + 1, "\u00BA"] }), _jsxs("div", { className: "absolute inset-x-0 bottom-0 bg-black/75 flex justify-between items-center px-1 py-0.5 opacity-0 group-hover:opacity-100 transition-opacity", children: [_jsx("button", { type: "button", onClick: () => moveGalleryImage(i, 'up'), disabled: i === 0, className: "text-white disabled:opacity-30", children: _jsx(ChevronUp, { size: 14 }) }), _jsx("button", { type: "button", onClick: () => setGalleryUrls(galleryUrls.filter((_, idx) => idx !== i)), className: "text-red-300", children: _jsx(X, { size: 14 }) }), _jsx("button", { type: "button", onClick: () => moveGalleryImage(i, 'down'), disabled: i === galleryUrls.length - 1, className: "text-white disabled:opacity-30", children: _jsx(ChevronDown, { size: 14 }) })] })] }, `u${i}`))), galleryFiles.map((file, i) => (_jsxs("div", { className: "relative w-14 h-14 rounded-lg overflow-hidden group bg-zinc-800 flex items-center justify-center", children: [_jsx("span", { className: "text-xs text-zinc-400 truncate px-1", children: file.name.slice(0, 10) }), _jsx("button", { type: "button", onClick: () => setGalleryFiles(galleryFiles.filter((_, idx) => idx !== i)), className: "absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center", children: _jsx(X, { size: 14, className: "text-white" }) })] }, `f${i}`)))] })] }))] }), _jsxs("div", { children: [_jsx("label", { className: "block text-zinc-300 text-xs font-medium mb-1", children: "V\u00EDdeos do produto (opcional)" }), _jsxs("label", { className: "flex items-center gap-2 bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 cursor-pointer hover:border-[#FFE500]/50 transition-colors", children: [_jsx(Video, { size: 16, className: "text-zinc-400" }), _jsx("span", { className: "text-zinc-400 text-sm", children: videoFiles.length > 0 ? `${videoFiles.length} novo(s) vídeo(s)` : 'Adicionar vídeos do produto' }), _jsx("input", { type: "file", accept: "video/*", multiple: true, className: "hidden", onChange: e => setVideoFiles([...videoFiles, ...Array.from(e.target.files ?? [])]) })] }), (videoUrls.length > 0 || videoFiles.length > 0) && (_jsxs("div", { className: "flex gap-2 mt-2 flex-wrap", children: [videoUrls.map((url, i) => (_jsxs("div", { className: "relative w-20 h-20 rounded-lg overflow-hidden group border border-zinc-700 bg-zinc-800 flex items-center justify-center", children: [_jsx(Video, { size: 18, className: "text-zinc-500" }), _jsx("button", { type: "button", onClick: () => setVideoUrls(videoUrls.filter((_, idx) => idx !== i)), className: "absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center", children: _jsx(X, { size: 14, className: "text-white" }) })] }, `vu${i}`))), videoFiles.map((file, i) => (_jsxs("div", { className: "relative w-14 h-14 rounded-lg overflow-hidden group bg-zinc-800 flex items-center justify-center", children: [_jsx("span", { className: "text-xs text-zinc-400 truncate px-1", children: file.name.slice(0, 10) }), _jsx("button", { type: "button", onClick: () => setVideoFiles(videoFiles.filter((_, idx) => idx !== i)), className: "absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center", children: _jsx(X, { size: 14, className: "text-white" }) })] }, `vf${i}`)))] }))] }), _jsxs("details", { className: "bg-zinc-900/50 border border-zinc-700 rounded-lg", children: [_jsx("summary", { className: "cursor-pointer text-zinc-300 text-sm font-medium px-3 py-2 select-none", children: "Informa\u00E7\u00F5es detalhadas (opcional)" }), _jsxs("div", { className: "p-3 space-y-3", children: [_jsx("textarea", { value: prodForm.long_description, onChange: e => setProdForm({ ...prodForm, long_description: e.target.value }), rows: 3, placeholder: "Descri\u00E7\u00E3o detalhada", className: "w-full bg-zinc-900 border border-zinc-700 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#FFE500] resize-none" }), _jsxs("div", { className: "grid grid-cols-1 sm:grid-cols-3 gap-3", children: [_jsx("input", { type: "text", value: prodForm.brand, onChange: e => setProdForm({ ...prodForm, brand: e.target.value }), placeholder: "Marca", className: "bg-zinc-900 border border-zinc-700 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#FFE500]" }), _jsx("input", { type: "text", value: prodForm.flavor, onChange: e => setProdForm({ ...prodForm, flavor: e.target.value }), placeholder: "Sabor", className: "bg-zinc-900 border border-zinc-700 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#FFE500]" }), _jsx("input", { type: "text", value: prodForm.weight, onChange: e => setProdForm({ ...prodForm, weight: e.target.value }), placeholder: "Peso / Tamanho", className: "bg-zinc-900 border border-zinc-700 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#FFE500]" })] }), _jsx("input", { type: "text", value: prodForm.ingredients, onChange: e => setProdForm({ ...prodForm, ingredients: e.target.value }), placeholder: "Ingredientes", className: "w-full bg-zinc-900 border border-zinc-700 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#FFE500]" }), _jsx("input", { type: "text", value: prodForm.nutritional_info, onChange: e => setProdForm({ ...prodForm, nutritional_info: e.target.value }), placeholder: "Informa\u00E7\u00E3o nutricional", className: "w-full bg-zinc-900 border border-zinc-700 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#FFE500]" }), _jsx("textarea", { value: prodForm.usage_instructions, onChange: e => setProdForm({ ...prodForm, usage_instructions: e.target.value }), rows: 2, placeholder: "Como usar / consumo", className: "w-full bg-zinc-900 border border-zinc-700 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#FFE500] resize-none" })] })] }), _jsx("button", { type: "submit", disabled: saving, className: "bg-[#FFE500] hover:bg-[#FFD000] text-black text-sm font-bold rounded-lg px-4 py-2 disabled:opacity-50", children: saving ? 'Salvando...' : editing ? 'Salvar' : 'Criar produto' })] })), loading ? _jsx("div", { className: "flex justify-center py-8", children: _jsx("div", { className: "w-6 h-6 border-2 border-zinc-700 border-t-[#FFE500] rounded-full animate-spin" }) }) :
                                                products.length === 0 ? _jsx("p", { className: "text-zinc-400 text-sm text-center py-8", children: "Nenhum produto." }) :
                                                    _jsx("div", { className: "grid grid-cols-1 sm:grid-cols-2 gap-3", children: products.map(p => (_jsxs("div", { className: "bg-zinc-800/50 border border-zinc-700 rounded-lg p-3", children: [_jsxs("div", { className: "flex items-start justify-between mb-2", children: [_jsxs("div", { className: "flex items-center gap-2", children: [p.image_url ? _jsx("img", { src: p.image_url, alt: p.name, className: "w-12 h-12 rounded object-cover" }) :
                                                                                    _jsx("div", { className: "w-12 h-12 rounded bg-zinc-700 flex items-center justify-center", children: _jsx(Package, { size: 18, className: "text-zinc-400" }) }), _jsxs("div", { children: [_jsx("p", { className: "text-white text-sm font-medium", children: p.name }), _jsxs("p", { className: "text-[#FFE500] text-xs font-bold", children: ["R$ ", (p.discount_price ?? p.price).toFixed(2), " ", p.discount_price && _jsxs("span", { className: "text-zinc-500 line-through ml-1", children: ["R$ ", p.price.toFixed(2)] })] })] })] }), _jsxs("div", { className: "flex gap-1", children: [_jsx("button", { onClick: () => {
                                                                                        setEditing(p);
                                                                                        setProdForm({ category_id: p.category_id ?? '', name: p.name, description: p.description ?? '', price: String(p.price), discount_price: p.discount_price ? String(p.discount_price) : '', franchise_id: p.franchise_id ?? '', image: null, long_description: p.long_description ?? '', ingredients: p.ingredients ?? '', nutritional_info: p.nutritional_info ?? '', usage_instructions: p.usage_instructions ?? '', brand: p.brand ?? '', flavor: p.flavor ?? '', weight: p.weight ?? '' });
                                                                                        setImageUrl(p.image_url);
                                                                                        setGalleryUrls(p.gallery_urls ?? []);
                                                                                        setGalleryFiles([]);
                                                                                        setVideoUrls(p.video_urls ?? []);
                                                                                        setVideoFiles([]);
                                                                                        setShowCreate(true);
                                                                                    }, className: "text-zinc-400 hover:text-[#FFE500] p-1.5", children: _jsx(Edit, { size: 14 }) }), _jsx("button", { onClick: () => deleteItem('products', p.id), className: "text-zinc-400 hover:text-red-400 p-1.5", children: _jsx(Trash2, { size: 14 }) })] })] }), _jsxs("p", { className: "text-zinc-500 text-xs", children: [catName(p.category_id), " \u2014 ", franName(p.franchise_id)] })] }, p.id))) })] }))] }))] })] }), showProductLink && _jsx(ProductLinkTool, { onClose: () => setShowProductLink(false) })] }));
}
