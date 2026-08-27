import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useEffect, useState } from 'react';
import { supabase } from '/app/lib/supabase.js';
import { Package, Plus, Trash2, Edit, X, Upload, ArrowUp, ArrowDown, Link2, Unlink, ImageIcon, ChevronLeft, ChevronRight, Video, Play } from 'lucide-react';
export default function FranchiseeProducts({ franchiseId }) {
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [groups, setGroups] = useState([]);
    const [addons, setAddons] = useState([]);
    const [links, setLinks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [editing, setEditing] = useState(null);
    const [managingGroups, setManagingGroups] = useState(null);
    const [form, setForm] = useState({
        name: '', description: '', price: '', discount_price: '', category_id: '', stock: '0', image: null,
        long_description: '', ingredients: '', nutritional_info: '', usage_instructions: '',
        brand: '', flavor: '', weight: '',
    });
    const [imageUrl, setImageUrl] = useState(null);
    const [galleryFiles, setGalleryFiles] = useState([]);
    const [galleryUrls, setGalleryUrls] = useState([]);
    const [videoFiles, setVideoFiles] = useState([]);
    const [videoUrls, setVideoUrls] = useState([]);
    const [saving, setSaving] = useState(false);
    const load = async () => {
        const [{ data: prods }, { data: cats }, { data: grps }, { data: adns }, { data: lnks }] = await Promise.all([
            supabase.from('franchise_products').select('*').eq('franchise_id', franchiseId).order('sort_order', { ascending: true }),
            supabase.from('franchise_categories').select('*').eq('franchise_id', franchiseId).order('sort_order', { ascending: true }).order('created_at', { ascending: true }).order('id', { ascending: true }),
            supabase.from('franchise_groups').select('*').eq('franchise_id', franchiseId).order('name'),
            supabase.from('franchise_addons').select('*').order('name'),
            supabase.from('product_group_links').select('*'),
        ]);
        if (prods)
            setProducts(prods);
        if (cats)
            setCategories(cats);
        if (grps)
            setGroups(grps);
        if (adns)
            setAddons(adns);
        if (lnks)
            setLinks(lnks);
        setLoading(false);
    };
    useEffect(() => { load(); }, [franchiseId]);
    const handleSave = async (e) => {
        e.preventDefault();
        setSaving(true);
        let img = imageUrl;
        if (form.image) {
            const ext = form.image.name.split('.').pop();
            const path = `${franchiseId}/${Date.now()}.${ext}`;
            const { error } = await supabase.storage.from('franchise-products').upload(path, form.image);
            if (!error)
                img = supabase.storage.from('franchise-products').getPublicUrl(path).data.publicUrl;
        }
        // Upload gallery images
        const uploadedGallery = [...galleryUrls];
        for (const file of galleryFiles) {
            const ext = file.name.split('.').pop();
            const path = `${franchiseId}/gallery-${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
            const { error } = await supabase.storage.from('franchise-products').upload(path, file);
            if (!error)
                uploadedGallery.push(supabase.storage.from('franchise-products').getPublicUrl(path).data.publicUrl);
        }
        // Upload videos
        const uploadedVideos = [...videoUrls];
        for (const file of videoFiles) {
            const ext = file.name.split('.').pop() || 'mp4';
            const path = `${franchiseId}/video-${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
            const { error } = await supabase.storage.from('franchise-products').upload(path, file);
            if (!error)
                uploadedVideos.push(supabase.storage.from('franchise-products').getPublicUrl(path).data.publicUrl);
        }
        const payload = {
            franchise_id: franchiseId,
            category_id: form.category_id || null,
            name: form.name,
            description: form.description || null,
            price: parseFloat(form.price) || 0,
            discount_price: form.discount_price ? parseFloat(form.discount_price) : null,
            stock: parseInt(form.stock) || 0,
            image_url: img,
            sort_order: editing?.sort_order ?? products.length,
            long_description: form.long_description || null,
            ingredients: form.ingredients || null,
            nutritional_info: form.nutritional_info || null,
            usage_instructions: form.usage_instructions || null,
            brand: form.brand || null,
            flavor: form.flavor || null,
            weight: form.weight || null,
            gallery_urls: uploadedGallery.length > 0 ? uploadedGallery : null,
            video_urls: uploadedVideos.length > 0 ? uploadedVideos : null,
        };
        if (editing) {
            await supabase.from('franchise_products').update(payload).eq('id', editing.id);
        }
        else {
            await supabase.from('franchise_products').insert(payload);
        }
        setForm({ name: '', description: '', price: '', discount_price: '', category_id: '', stock: '0', image: null, long_description: '', ingredients: '', nutritional_info: '', usage_instructions: '', brand: '', flavor: '', weight: '' });
        setImageUrl(null);
        setGalleryFiles([]);
        setGalleryUrls([]);
        setVideoFiles([]);
        setVideoUrls([]);
        setEditing(null);
        setShowForm(false);
        setSaving(false);
        load();
    };
    const moveGalleryImage = (index, direction) => {
        const nextIndex = direction === 'left' ? index - 1 : index + 1;
        if (nextIndex < 0 || nextIndex >= galleryUrls.length)
            return;
        const next = [...galleryUrls];
        [next[index], next[nextIndex]] = [next[nextIndex], next[index]];
        setGalleryUrls(next);
    };
    const handleDelete = async (p) => {
        if (!confirm(`Excluir "${p.name}"?`))
            return;
        await supabase.from('franchise_products').delete().eq('id', p.id);
        load();
    };
    const moveProduct = async (p, dir) => {
        const sorted = [...products].sort((a, b) => a.sort_order - b.sort_order);
        const idx = sorted.findIndex(x => x.id === p.id);
        const swapIdx = dir === 'up' ? idx - 1 : idx + 1;
        if (swapIdx < 0 || swapIdx >= sorted.length)
            return;
        const swap = sorted[swapIdx];
        await Promise.all([
            supabase.from('franchise_products').update({ sort_order: swap.sort_order }).eq('id', p.id),
            supabase.from('franchise_products').update({ sort_order: p.sort_order }).eq('id', swap.id),
        ]);
        load();
    };
    const toggleLink = async (productId, groupId) => {
        const existing = links.find(l => l.product_id === productId && l.group_id === groupId);
        if (existing) {
            await supabase.from('product_group_links').delete().eq('id', existing.id);
        }
        else {
            await supabase.from('product_group_links').insert({ product_id: productId, group_id: groupId });
        }
        load();
    };
    const catName = (id) => categories.find(c => c.id === id)?.name ?? 'Sem categoria';
    const addonsInGroup = (gid) => addons.filter(a => a.group_id === gid);
    const linkedGroups = (pid) => links.filter(l => l.product_id === pid).map(l => l.group_id);
    return (_jsxs("div", { children: [_jsxs("div", { className: "flex items-center justify-between mb-4", children: [_jsx("h3", { className: "text-white font-bold text-lg", children: "Produtos" }), _jsxs("button", { onClick: () => { if (editing) {
                            setEditing(null);
                            setForm({ name: '', description: '', price: '', category_id: '', stock: '0', image: null, long_description: '', ingredients: '', nutritional_info: '', usage_instructions: '', brand: '', flavor: '', weight: '' });
                            setImageUrl(null);
                            setGalleryUrls([]);
                            setGalleryFiles([]);
                            setVideoUrls([]);
                            setVideoFiles([]);
                        } setShowForm(!showForm); }, className: "bg-[#FFE500] hover:bg-[#FFD000] text-black text-sm font-bold rounded-lg px-4 py-2 flex items-center gap-1.5 transition-all", children: [_jsx(Plus, { size: 16 }), " ", editing ? 'Editando...' : 'Novo Produto'] })] }), showForm && (_jsxs("form", { onSubmit: handleSave, className: "bg-zinc-900 border border-zinc-800 rounded-xl p-4 mb-4 space-y-3", children: [_jsxs("div", { className: "grid grid-cols-1 sm:grid-cols-2 gap-3", children: [_jsxs("div", { children: [_jsx("label", { className: "block text-zinc-300 text-xs font-medium mb-1", children: "Nome" }), _jsx("input", { type: "text", value: form.name, onChange: e => setForm({ ...form, name: e.target.value }), required: true, className: "w-full bg-zinc-800 border border-zinc-700 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#FFE500]" })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-zinc-300 text-xs font-medium mb-1", children: "Categoria" }), _jsxs("select", { value: form.category_id, onChange: e => setForm({ ...form, category_id: e.target.value }), className: "w-full bg-zinc-800 border border-zinc-700 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#FFE500]", children: [_jsx("option", { value: "", children: "Sem categoria" }), categories.map(c => _jsx("option", { value: c.id, children: c.name }, c.id))] })] })] }), _jsxs("div", { className: "grid grid-cols-1 sm:grid-cols-3 gap-3", children: [_jsxs("div", { children: [_jsx("label", { className: "block text-zinc-300 text-xs font-medium mb-1", children: "Pre\u00E7o (R$)" }), _jsx("input", { type: "number", step: "0.01", value: form.price, onChange: e => setForm({ ...form, price: e.target.value }), required: true, className: "w-full bg-zinc-800 border border-zinc-700 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#FFE500]" })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-zinc-300 text-xs font-medium mb-1", children: "Pre\u00E7o promocional" }), _jsx("input", { type: "number", step: "0.01", value: form.discount_price, onChange: e => setForm({ ...form, discount_price: e.target.value }), placeholder: "Opcional", className: "w-full bg-zinc-800 border border-zinc-700 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#FFE500]" })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-zinc-300 text-xs font-medium mb-1", children: "Estoque" }), _jsx("input", { type: "number", value: form.stock, onChange: e => setForm({ ...form, stock: e.target.value }), className: "w-full bg-zinc-800 border border-zinc-700 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#FFE500]" })] })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-zinc-300 text-xs font-medium mb-1", children: "Descri\u00E7\u00E3o" }), _jsx("textarea", { value: form.description, onChange: e => setForm({ ...form, description: e.target.value }), rows: 2, className: "w-full bg-zinc-800 border border-zinc-700 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#FFE500] resize-none" })] }), _jsxs("div", { children: [_jsxs("label", { className: "flex items-center gap-2 bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 cursor-pointer hover:border-[#FFE500]/50 transition-colors", children: [_jsx(Upload, { size: 16, className: "text-zinc-400" }), _jsx("span", { className: "text-zinc-400 text-sm", children: form.image ? form.image.name : imageUrl ? 'Capa atual — clique para trocar' : 'Imagem principal (opcional)' }), _jsx("input", { type: "file", accept: "image/*", className: "hidden", onChange: e => setForm({ ...form, image: e.target.files?.[0] ?? null }) })] }), (form.image || imageUrl) && _jsxs("div", { className: "mt-2 flex items-center gap-3 bg-zinc-800/50 rounded-lg p-2", children: [_jsx("img", { src: form.image ? URL.createObjectURL(form.image) : imageUrl ?? '', alt: "Pr\u00E9via da capa", className: "w-16 h-16 rounded-lg object-cover" }), _jsxs("div", { children: [_jsx("p", { className: "text-white text-xs font-medium", children: "Capa do produto" }), _jsx("p", { className: "text-zinc-500 text-xs", children: "Esta imagem aparece no card\u00E1pio." })] })] })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-zinc-300 text-xs font-medium mb-1", children: "Galeria de imagens (opcional)" }), _jsxs("label", { className: "flex items-center gap-2 bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 cursor-pointer hover:border-[#FFE500]/50 transition-colors", children: [_jsx(ImageIcon, { size: 16, className: "text-zinc-400" }), _jsx("span", { className: "text-zinc-400 text-sm", children: galleryFiles.length > 0 ? `${galleryFiles.length} nova(s) imagem(ns)` : 'Adicionar múltiplas fotos' }), _jsx("input", { type: "file", accept: "image/*", multiple: true, className: "hidden", onChange: e => setGalleryFiles([...galleryFiles, ...Array.from(e.target.files ?? [])]) })] }), (galleryUrls.length > 0 || galleryFiles.length > 0) && (_jsxs("div", { className: "flex gap-2 mt-2 flex-wrap", children: [galleryUrls.map((url, i) => (_jsxs("div", { className: "relative w-20 h-20 rounded-lg overflow-hidden group border border-zinc-700", children: [_jsx("img", { src: url, alt: `Imagem ${i + 1}`, className: "w-full h-full object-cover" }), _jsxs("span", { className: "absolute top-1 left-1 bg-black/70 text-white text-[10px] font-bold rounded px-1.5 py-0.5", children: [i + 1, "\u00BA"] }), _jsxs("div", { className: "absolute inset-x-0 bottom-0 bg-black/75 flex justify-between items-center px-1 py-0.5 opacity-0 group-hover:opacity-100 transition-opacity", children: [_jsx("button", { type: "button", onClick: () => moveGalleryImage(i, 'left'), disabled: i === 0, className: "text-white disabled:opacity-30", children: _jsx(ChevronLeft, { size: 14 }) }), _jsx("button", { type: "button", onClick: () => setGalleryUrls(galleryUrls.filter((_, idx) => idx !== i)), className: "text-red-300", children: _jsx(X, { size: 14 }) }), _jsx("button", { type: "button", onClick: () => moveGalleryImage(i, 'right'), disabled: i === galleryUrls.length - 1, className: "text-white disabled:opacity-30", children: _jsx(ChevronRight, { size: 14 }) })] })] }, `u${i}`))), galleryFiles.map((file, i) => (_jsxs("div", { className: "relative w-20 h-20 rounded-lg overflow-hidden group bg-zinc-800 flex items-center justify-center border border-dashed border-zinc-600", children: [_jsx("img", { src: URL.createObjectURL(file), alt: `Nova imagem ${i + 1}`, className: "w-full h-full object-cover" }), _jsx("span", { className: "absolute top-1 left-1 bg-black/70 text-white text-[10px] font-bold rounded px-1.5 py-0.5", children: "nova" }), _jsx("button", { type: "button", onClick: () => setGalleryFiles(galleryFiles.filter((_, idx) => idx !== i)), className: "absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center", children: _jsx(X, { size: 14, className: "text-white" }) })] }, `f${i}`)))] }))] }), _jsxs("div", { children: [_jsx("label", { className: "block text-zinc-300 text-xs font-medium mb-1", children: "V\u00EDdeos curtos do produto (opcional)" }), _jsxs("label", { className: "flex items-center gap-2 bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 cursor-pointer hover:border-[#FFE500]/50 transition-colors", children: [_jsx(Video, { size: 16, className: "text-zinc-400" }), _jsx("span", { className: "text-zinc-400 text-sm", children: videoFiles.length > 0 ? `${videoFiles.length} novo(s) vídeo(s)` : 'Adicionar vídeos curtos' }), _jsx("input", { type: "file", accept: "video/*", multiple: true, className: "hidden", onChange: e => setVideoFiles([...videoFiles, ...Array.from(e.target.files ?? [])]) })] }), (videoUrls.length > 0 || videoFiles.length > 0) && (_jsxs("div", { className: "flex gap-2 mt-2 flex-wrap", children: [videoUrls.map((url, i) => (_jsxs("div", { className: "relative w-20 h-20 rounded-lg overflow-hidden group bg-zinc-800 border border-zinc-700", children: [_jsx("video", { src: url, className: "w-full h-full object-cover" }), _jsxs("span", { className: "absolute top-1 left-1 bg-black/70 text-white text-[10px] font-bold rounded px-1.5 py-0.5", children: [i + 1, "\u00BA"] }), _jsx("button", { type: "button", onClick: () => setVideoUrls(videoUrls.filter((_, idx) => idx !== i)), className: "absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center", children: _jsx(X, { size: 14, className: "text-white" }) })] }, `vu${i}`))), videoFiles.map((file, i) => (_jsxs("div", { className: "relative w-20 h-20 rounded-lg overflow-hidden group bg-zinc-800 flex items-center justify-center border border-dashed border-zinc-600", children: [_jsx(Play, { size: 18, className: "text-zinc-500" }), _jsx("span", { className: "absolute top-1 left-1 bg-black/70 text-white text-[10px] font-bold rounded px-1.5 py-0.5", children: "nova" }), _jsx("button", { type: "button", onClick: () => setVideoFiles(videoFiles.filter((_, idx) => idx !== i)), className: "absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center", children: _jsx(X, { size: 14, className: "text-white" }) })] }, `vf${i}`)))] }))] }), _jsxs("details", { className: "bg-zinc-800/30 border border-zinc-700 rounded-lg", children: [_jsx("summary", { className: "cursor-pointer text-zinc-300 text-sm font-medium px-3 py-2 select-none", children: "Informa\u00E7\u00F5es detalhadas (opcional)" }), _jsxs("div", { className: "p-3 space-y-3", children: [_jsx("textarea", { value: form.long_description, onChange: e => setForm({ ...form, long_description: e.target.value }), rows: 3, placeholder: "Descri\u00E7\u00E3o detalhada", className: "w-full bg-zinc-800 border border-zinc-700 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#FFE500] resize-none" }), _jsxs("div", { className: "grid grid-cols-1 sm:grid-cols-3 gap-3", children: [_jsx("input", { type: "text", value: form.brand, onChange: e => setForm({ ...form, brand: e.target.value }), placeholder: "Marca", className: "bg-zinc-800 border border-zinc-700 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#FFE500]" }), _jsx("input", { type: "text", value: form.flavor, onChange: e => setForm({ ...form, flavor: e.target.value }), placeholder: "Sabor", className: "bg-zinc-800 border border-zinc-700 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#FFE500]" }), _jsx("input", { type: "text", value: form.weight, onChange: e => setForm({ ...form, weight: e.target.value }), placeholder: "Peso / Tamanho", className: "bg-zinc-800 border border-zinc-700 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#FFE500]" })] }), _jsx("input", { type: "text", value: form.ingredients, onChange: e => setForm({ ...form, ingredients: e.target.value }), placeholder: "Ingredientes", className: "w-full bg-zinc-800 border border-zinc-700 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#FFE500]" }), _jsx("input", { type: "text", value: form.nutritional_info, onChange: e => setForm({ ...form, nutritional_info: e.target.value }), placeholder: "Informa\u00E7\u00E3o nutricional", className: "w-full bg-zinc-800 border border-zinc-700 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#FFE500]" }), _jsx("textarea", { value: form.usage_instructions, onChange: e => setForm({ ...form, usage_instructions: e.target.value }), rows: 2, placeholder: "Como usar / consumo", className: "w-full bg-zinc-800 border border-zinc-700 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#FFE500] resize-none" })] })] }), _jsxs("div", { className: "flex gap-2", children: [_jsx("button", { type: "submit", disabled: saving, className: "bg-[#FFE500] hover:bg-[#FFD000] text-black text-sm font-bold rounded-lg px-4 py-2 disabled:opacity-50", children: saving ? 'Salvando...' : editing ? 'Salvar' : 'Criar produto' }), _jsx("button", { type: "button", onClick: () => { setShowForm(false); setEditing(null); }, className: "bg-zinc-700 hover:bg-zinc-600 text-white text-sm font-medium rounded-lg px-4 py-2", children: "Cancelar" })] })] })), loading ? (_jsx("div", { className: "flex justify-center py-12", children: _jsx("div", { className: "w-6 h-6 border-2 border-zinc-700 border-t-[#FFE500] rounded-full animate-spin" }) })) : products.length === 0 ? (_jsxs("div", { className: "text-center py-12", children: [_jsx(Package, { size: 40, className: "mx-auto text-zinc-700 mb-3" }), _jsx("p", { className: "text-zinc-400 text-sm", children: "Nenhum produto criado." })] })) : (_jsx("div", { className: "space-y-2", children: [...products].sort((a, b) => a.sort_order - b.sort_order).map((p, i, arr) => (_jsx("div", { className: "bg-zinc-900 border border-zinc-800 rounded-xl p-3", children: _jsxs("div", { className: "flex items-center gap-3", children: [p.image_url ? _jsx("img", { src: p.image_url, alt: p.name, className: "w-12 h-12 rounded-lg object-cover" }) :
                                _jsx("div", { className: "w-12 h-12 rounded-lg bg-zinc-800 flex items-center justify-center", children: _jsx(Package, { size: 20, className: "text-zinc-600" }) }), _jsxs("div", { className: "flex-1 min-w-0", children: [_jsx("p", { className: "text-white text-sm font-bold", children: p.name }), _jsxs("p", { className: "text-zinc-500 text-xs", children: [catName(p.category_id), " \u2014 ", p.discount_price ? _jsxs(_Fragment, { children: [_jsxs("span", { className: "text-green-400 font-bold", children: ["R$ ", p.discount_price.toFixed(2)] }), " ", _jsxs("span", { className: "line-through ml-1", children: ["R$ ", p.price.toFixed(2)] })] }) : `R$ ${p.price.toFixed(2)}`] }), _jsxs("div", { className: "flex items-center gap-2 mt-0.5", children: [_jsxs("span", { className: `text-xs ${p.stock > 0 ? 'text-green-400' : 'text-red-400'}`, children: ["Estoque: ", p.stock] }), _jsx("span", { className: `text-xs ${p.active ? 'text-green-400' : 'text-zinc-500'}`, children: p.active ? 'Ativo' : 'Inativo' })] })] }), _jsxs("div", { className: "flex items-center gap-1", children: [_jsx("button", { onClick: () => moveProduct(p, 'up'), disabled: i === 0, className: "text-zinc-500 hover:text-[#FFE500] p-1 disabled:opacity-30", children: _jsx(ArrowUp, { size: 14 }) }), _jsx("button", { onClick: () => moveProduct(p, 'down'), disabled: i === arr.length - 1, className: "text-zinc-500 hover:text-[#FFE500] p-1 disabled:opacity-30", children: _jsx(ArrowDown, { size: 14 }) }), _jsx("button", { onClick: () => setManagingGroups(p), className: "text-zinc-500 hover:text-[#FFE500] p-1", title: "Grupos e adicionais", children: _jsx(Link2, { size: 14 }) }), _jsx("button", { onClick: () => { setEditing(p); setForm({ name: p.name, description: p.description ?? '', price: String(p.price), category_id: p.category_id ?? '', stock: String(p.stock), image: null, long_description: p.long_description ?? '', ingredients: p.ingredients ?? '', nutritional_info: p.nutritional_info ?? '', usage_instructions: p.usage_instructions ?? '', brand: p.brand ?? '', flavor: p.flavor ?? '', weight: p.weight ?? '' }); setImageUrl(p.image_url); setGalleryUrls(p.gallery_urls ?? []); setGalleryFiles([]); setVideoUrls(p.video_urls ?? []); setVideoFiles([]); setShowForm(true); }, className: "text-zinc-500 hover:text-[#FFE500] p-1", children: _jsx(Edit, { size: 14 }) }), _jsx("button", { onClick: () => handleDelete(p), className: "text-zinc-500 hover:text-red-400 p-1", children: _jsx(Trash2, { size: 14 }) })] })] }) }, p.id))) })), managingGroups && (_jsx("div", { className: "fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm", onClick: () => setManagingGroups(null), children: _jsxs("div", { className: "bg-zinc-900 border border-zinc-800 rounded-2xl w-full max-w-md max-h-[80vh] overflow-y-auto", onClick: e => e.stopPropagation(), children: [_jsxs("div", { className: "flex items-center justify-between p-6 border-b border-zinc-800 sticky top-0 bg-zinc-900", children: [_jsxs("div", { children: [_jsx("h3", { className: "text-white font-bold text-lg", children: "Grupos do produto" }), _jsx("p", { className: "text-zinc-500 text-xs", children: managingGroups.name })] }), _jsx("button", { onClick: () => setManagingGroups(null), className: "text-zinc-400 hover:text-white", children: _jsx(X, { size: 20 }) })] }), _jsxs("div", { className: "p-6 space-y-3", children: [_jsx("p", { className: "text-zinc-400 text-sm", children: "Selecione quais grupos de adicionais este produto possui:" }), groups.length === 0 ? (_jsx("p", { className: "text-zinc-500 text-sm text-center py-4", children: "Nenhum grupo criado. V\u00E1 em \"Grupos e Adicionais\" para criar." })) : (groups.map(g => {
                                    const isLinked = linkedGroups(managingGroups.id).includes(g.id);
                                    return (_jsxs("div", { className: `border rounded-lg p-3 ${isLinked ? 'border-[#FFE500]/30 bg-[#FFE500]/5' : 'border-zinc-800 bg-zinc-800/50'}`, children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { children: [_jsx("p", { className: "text-white text-sm font-bold", children: g.name }), _jsxs("p", { className: "text-zinc-500 text-xs", children: [addonsInGroup(g.id).length, " adicional(is)"] })] }), _jsx("button", { onClick: () => toggleLink(managingGroups.id, g.id), className: `text-sm font-bold rounded-lg px-3 py-1.5 transition-colors ${isLinked ? 'bg-[#FFE500] text-black' : 'bg-zinc-700 text-zinc-300 hover:text-white'}`, children: isLinked ? _jsxs(_Fragment, { children: [_jsx(Unlink, { size: 14, className: "inline mr-1" }), "Remover"] }) : _jsxs(_Fragment, { children: [_jsx(Link2, { size: 14, className: "inline mr-1" }), "Vincular"] }) })] }), isLinked && addonsInGroup(g.id).length > 0 && (_jsx("div", { className: "mt-2 pl-3 space-y-1", children: addonsInGroup(g.id).map(a => (_jsxs("p", { className: "text-zinc-400 text-xs", children: ["\u2022 ", a.name, " ", a.is_free ? '(Grátis)' : `R$ ${a.price.toFixed(2)}`] }, a.id))) }))] }, g.id));
                                }))] })] }) }))] }));
}
