import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useEffect, useState } from 'react';
import { supabase } from '/app/lib/supabase.js';
import { X, Package, Store, CheckCircle2, Search, ChevronDown, ChevronUp, Link2 } from 'lucide-react';
export default function ProductLinkTool({ onClose }) {
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [franchises, setFranchises] = useState([]);
    const [franchiseProducts, setFranchiseProducts] = useState([]);
    const [franchiseCategories, setFranchiseCategories] = useState([]);
    const [franchiseGroups, setFranchiseGroups] = useState([]);
    const [franchiseAddons, setFranchiseAddons] = useState([]);
    const [franchiseLinks, setFranchiseLinks] = useState([]);
    const [masterGroups, setMasterGroups] = useState([]);
    const [masterAddons, setMasterAddons] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('');
    const [expandedProduct, setExpandedProduct] = useState(null);
    const [saving, setSaving] = useState(false);
    const [bulkMode, setBulkMode] = useState(false);
    const [bulkSelectedFranchises, setBulkSelectedFranchises] = useState(new Set());
    const [bulkSelectedProducts, setBulkSelectedProducts] = useState(new Set());
    const [feedback, setFeedback] = useState(null);
    const load = async () => {
        const [{ data: prods }, { data: cats }, { data: frans }, { data: fp }, { data: fCats }, { data: fGrps }, { data: fAdns }, { data: fLinks }, { data: mGrps }, { data: mAdns }] = await Promise.all([
            supabase.from('products').select('*').order('name'),
            supabase.from('product_categories').select('*').order('name'),
            supabase.from('franchises').select('*').order('name'),
            supabase.from('franchise_products').select('*'),
            supabase.from('franchise_categories').select('*'),
            supabase.from('franchise_groups').select('*'),
            supabase.from('franchise_addons').select('*'),
            supabase.from('product_group_links').select('*'),
            supabase.from('product_groups').select('*').order('name'),
            supabase.from('product_addons').select('*').order('name'),
        ]);
        if (prods)
            setProducts(prods);
        if (cats)
            setCategories(cats);
        if (frans)
            setFranchises(frans);
        if (fp)
            setFranchiseProducts(fp);
        if (fCats)
            setFranchiseCategories(fCats);
        if (fGrps)
            setFranchiseGroups(fGrps);
        if (fAdns)
            setFranchiseAddons(fAdns);
        if (fLinks)
            setFranchiseLinks(fLinks);
        if (mGrps)
            setMasterGroups(mGrps);
        if (mAdns)
            setMasterAddons(mAdns);
        setLoading(false);
    };
    useEffect(() => { load(); }, []);
    const isLinked = (productId, franchiseId) => {
        return franchiseProducts.find(fp => fp.franchise_id === franchiseId && fp.source_product_id === productId) ?? null;
    };
    const getLinkState = (productId) => {
        return franchises.map(f => {
            const fp = isLinked(productId, f.id);
            return { productId, franchiseId: f.id, linked: !!fp, franchiseProductId: fp?.id ?? null };
        });
    };
    const syncProductToFranchise = async (product, franchiseId, ctx) => {
        let franchiseCategoryId = null;
        if (product.category_id) {
            const masterCat = categories.find(c => c.id === product.category_id);
            if (masterCat) {
                let existing = ctx.fCats.find(fc => fc.franchise_id === franchiseId && fc.name === masterCat.name);
                if (!existing) {
                    const maxSort = ctx.fCats.filter(fc => fc.franchise_id === franchiseId).reduce((max, fc) => Math.max(max, fc.sort_order), 0);
                    const { data: newCat } = await supabase.from('franchise_categories').insert({
                        franchise_id: franchiseId, name: masterCat.name, sort_order: maxSort + 1,
                    }).select().single();
                    if (newCat) {
                        existing = newCat;
                        ctx.fCats.push(existing);
                    }
                }
                if (existing)
                    franchiseCategoryId = existing.id;
            }
        }
        const existingProduct = ctx.fProds.find(fp => fp.franchise_id === franchiseId && fp.source_product_id === product.id);
        const payload = {
            franchise_id: franchiseId, category_id: franchiseCategoryId,
            name: product.name, description: product.description, price: product.price,
            discount_price: product.discount_price, image_url: product.image_url,
            gallery_urls: product.gallery_urls, long_description: product.long_description,
            ingredients: product.ingredients, nutritional_info: product.nutritional_info,
            usage_instructions: product.usage_instructions, brand: product.brand,
            flavor: product.flavor, weight: product.weight, video_urls: product.video_urls,
            source_product_id: product.id,
        };
        const { data: fpData } = existingProduct
            ? await supabase.from('franchise_products').update(payload).eq('id', existingProduct.id).select().maybeSingle()
            : await supabase.from('franchise_products').insert({ ...payload, stock: 0, sort_order: ctx.fProds.filter(fp => fp.franchise_id === franchiseId).reduce((max, fp) => Math.max(max, fp.sort_order), 0) + 1, active: true }).select().maybeSingle();
        if (!fpData)
            return null;
        const newFp = fpData;
        if (existingProduct) {
            const index = ctx.fProds.findIndex(fp => fp.id === existingProduct.id);
            if (index >= 0)
                ctx.fProds[index] = newFp;
        }
        else {
            ctx.fProds.push(newFp);
        }
        const categoryGroups = masterGroups.filter(g => g.category_id === product.category_id);
        for (const masterGroup of categoryGroups) {
            let existingGroup = ctx.fGrps.find(fg => fg.franchise_id === franchiseId && fg.name === masterGroup.name);
            if (!existingGroup) {
                const { data: newGroup } = await supabase.from('franchise_groups').insert({
                    franchise_id: franchiseId, name: masterGroup.name,
                }).select().single();
                if (newGroup) {
                    existingGroup = newGroup;
                    ctx.fGrps.push(existingGroup);
                }
            }
            if (!existingGroup)
                continue;
            const groupAddons = masterAddons.filter(a => a.group_id === masterGroup.id);
            for (const addon of groupAddons) {
                const exists = ctx.fAdns.find(fa => fa.group_id === existingGroup.id && fa.name === addon.name);
                if (!exists) {
                    const { data: newAddon } = await supabase.from('franchise_addons').insert({
                        group_id: existingGroup.id, name: addon.name, price: addon.price, is_free: addon.price === 0,
                    }).select().single();
                    if (newAddon)
                        ctx.fAdns.push(newAddon);
                }
            }
            const linkExists = ctx.fLinks.some(l => l.product_id === newFp.id && l.group_id === existingGroup.id);
            if (!linkExists) {
                const { data: newLink } = await supabase.from('product_group_links').insert({
                    product_id: newFp.id, group_id: existingGroup.id,
                }).select().single();
                if (newLink)
                    ctx.fLinks.push(newLink);
            }
        }
        return newFp;
    };
    const toggleLink = async (productId, franchiseId) => {
        setSaving(true);
        setFeedback(null);
        const existing = isLinked(productId, franchiseId);
        const product = products.find(p => p.id === productId);
        if (!product) {
            setSaving(false);
            return;
        }
        if (existing) {
            await supabase.from('franchise_products').delete().eq('id', existing.id);
            setFeedback(`"${product.name}" removido de ${franchises.find(f => f.id === franchiseId)?.name}`);
        }
        else {
            const ctx = {
                fCats: [...franchiseCategories],
                fGrps: [...franchiseGroups],
                fAdns: [...franchiseAddons],
                fProds: [...franchiseProducts],
                fLinks: [...franchiseLinks],
            };
            const newFp = await syncProductToFranchise(product, franchiseId, ctx);
            if (newFp) {
                setFranchiseCategories(ctx.fCats);
                setFranchiseGroups(ctx.fGrps);
                setFranchiseAddons(ctx.fAdns);
                setFranchiseProducts(ctx.fProds);
                setFranchiseLinks(ctx.fLinks);
            }
            setFeedback(`"${product.name}" vinculado a ${franchises.find(f => f.id === franchiseId)?.name}`);
        }
        setSaving(false);
        setTimeout(() => setFeedback(null), 3000);
    };
    const handleBulkLink = async () => {
        if (bulkSelectedProducts.size === 0 || bulkSelectedFranchises.size === 0)
            return;
        setSaving(true);
        setFeedback(null);
        let inserted = 0;
        let skipped = 0;
        const selectedProducts = products.filter(p => bulkSelectedProducts.has(p.id));
        const selectedFranchises = franchises.filter(f => bulkSelectedFranchises.has(f.id));
        const ctx = {
            fCats: [...franchiseCategories],
            fGrps: [...franchiseGroups],
            fAdns: [...franchiseAddons],
            fProds: [...franchiseProducts],
            fLinks: [...franchiseLinks],
        };
        for (const product of selectedProducts) {
            for (const franchise of selectedFranchises) {
                if (isLinked(product.id, franchise.id)) {
                    skipped++;
                    continue;
                }
                const newFp = await syncProductToFranchise(product, franchise.id, ctx);
                if (newFp)
                    inserted++;
            }
        }
        setFranchiseCategories(ctx.fCats);
        setFranchiseGroups(ctx.fGrps);
        setFranchiseAddons(ctx.fAdns);
        setFranchiseProducts(ctx.fProds);
        setFranchiseLinks(ctx.fLinks);
        setFeedback(`${inserted} produto(s) vinculado(s) a ${bulkSelectedFranchises.size} franquia(s)${skipped > 0 ? `, ${skipped} já estavam vinculados` : ''}`);
        setBulkSelectedProducts(new Set());
        setBulkSelectedFranchises(new Set());
        setSaving(false);
        setTimeout(() => setFeedback(null), 4000);
    };
    const toggleBulkProduct = (id) => {
        const next = new Set(bulkSelectedProducts);
        next.has(id) ? next.delete(id) : next.add(id);
        setBulkSelectedProducts(next);
    };
    const toggleBulkFranchise = (id) => {
        const next = new Set(bulkSelectedFranchises);
        next.has(id) ? next.delete(id) : next.add(id);
        setBulkSelectedFranchises(next);
    };
    const selectAllFranchises = () => {
        if (bulkSelectedFranchises.size === franchises.length) {
            setBulkSelectedFranchises(new Set());
        }
        else {
            setBulkSelectedFranchises(new Set(franchises.map(f => f.id)));
        }
    };
    const filteredProducts = products.filter(p => {
        const matchesSearch = !search || p.name.toLowerCase().includes(search.toLowerCase());
        const matchesCategory = !categoryFilter || p.category_id === categoryFilter;
        return matchesSearch && matchesCategory;
    });
    const catName = (id) => categories.find(c => c.id === id)?.name ?? 'Sem categoria';
    const linkedCount = (productId) => getLinkState(productId).filter(s => s.linked).length;
    return (_jsx("div", { className: "fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm", onClick: onClose, children: _jsxs("div", { className: "bg-zinc-900 border border-zinc-800 rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto", onClick: e => e.stopPropagation(), children: [_jsxs("div", { className: "flex items-center justify-between p-6 border-b border-zinc-800 sticky top-0 bg-zinc-900 z-10", children: [_jsxs("div", { className: "flex items-center gap-3", children: [_jsx("div", { className: "w-10 h-10 rounded-lg bg-[#FFE500]/10 flex items-center justify-center", children: _jsx(Link2, { size: 20, className: "text-[#FFE500]" }) }), _jsxs("div", { children: [_jsx("h2", { className: "font-bold text-white text-lg", children: "Vincular Produtos" }), _jsx("p", { className: "text-zinc-500 text-xs", children: "Distribua produtos do cat\u00E1logo master para as franquias" })] })] }), _jsx("button", { onClick: onClose, className: "text-zinc-400 hover:text-white transition-colors", children: _jsx(X, { size: 22 }) })] }), _jsxs("div", { className: "p-6 space-y-4", children: [_jsxs("div", { className: "flex gap-2", children: [_jsx("button", { onClick: () => setBulkMode(false), className: `flex-1 text-sm font-bold rounded-lg py-2.5 transition-all ${!bulkMode ? 'bg-[#FFE500] text-black' : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700'}`, children: "Individual" }), _jsx("button", { onClick: () => setBulkMode(true), className: `flex-1 text-sm font-bold rounded-lg py-2.5 transition-all ${bulkMode ? 'bg-[#FFE500] text-black' : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700'}`, children: "Em Lote" })] }), feedback && (_jsxs("div", { className: "bg-green-500/10 border border-green-500/20 rounded-lg p-3 flex items-center gap-2", children: [_jsx(CheckCircle2, { size: 16, className: "text-green-400" }), _jsx("p", { className: "text-green-400 text-sm", children: feedback })] })), bulkMode && (_jsxs("div", { className: "space-y-4", children: [_jsxs("div", { className: "bg-zinc-800/50 border border-zinc-700 rounded-xl p-4", children: [_jsxs("div", { className: "flex items-center justify-between mb-3", children: [_jsxs("h4", { className: "text-white font-bold text-sm flex items-center gap-2", children: [_jsx(Store, { size: 16, className: "text-[#FFE500]" }), " Franquias (", bulkSelectedFranchises.size, "/", franchises.length, ")"] }), _jsx("button", { onClick: selectAllFranchises, className: "text-xs text-[#FFE500] hover:underline font-medium", children: bulkSelectedFranchises.size === franchises.length ? 'Desmarcar todas' : 'Selecionar todas' })] }), _jsx("div", { className: "grid grid-cols-2 sm:grid-cols-3 gap-2", children: franchises.map(f => {
                                                const selected = bulkSelectedFranchises.has(f.id);
                                                return (_jsxs("button", { onClick: () => toggleBulkFranchise(f.id), className: `flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition-all border ${selected ? 'bg-[#FFE500]/10 border-[#FFE500]/40 text-white' : 'bg-zinc-900 border-zinc-700 text-zinc-400 hover:border-zinc-600'}`, children: [_jsx("div", { className: `w-4 h-4 rounded border flex items-center justify-center ${selected ? 'bg-[#FFE500] border-[#FFE500]' : 'border-zinc-600'}`, children: selected && _jsx(CheckCircle2, { size: 12, className: "text-black" }) }), _jsx("span", { className: "truncate", children: f.name })] }, f.id));
                                            }) })] }), _jsxs("div", { className: "bg-zinc-800/50 border border-zinc-700 rounded-xl p-4", children: [_jsxs("div", { className: "flex items-center justify-between mb-3", children: [_jsxs("h4", { className: "text-white font-bold text-sm flex items-center gap-2", children: [_jsx(Package, { size: 16, className: "text-[#FFE500]" }), " Produtos (", bulkSelectedProducts.size, ")"] }), _jsx("button", { onClick: () => bulkSelectedProducts.size === filteredProducts.length ? setBulkSelectedProducts(new Set()) : setBulkSelectedProducts(new Set(filteredProducts.map(p => p.id))), className: "text-xs text-[#FFE500] hover:underline font-medium", children: bulkSelectedProducts.size === filteredProducts.length && filteredProducts.length > 0 ? 'Desmarcar todos' : 'Selecionar todos' })] }), _jsxs("div", { className: "flex gap-2 mb-3", children: [_jsxs("div", { className: "relative flex-1", children: [_jsx(Search, { size: 14, className: "absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" }), _jsx("input", { type: "text", value: search, onChange: e => setSearch(e.target.value), placeholder: "Buscar produto...", className: "w-full bg-zinc-900 border border-zinc-700 text-white rounded-lg pl-9 pr-3 py-2 text-sm focus:outline-none focus:border-[#FFE500]" })] }), _jsxs("select", { value: categoryFilter, onChange: e => setCategoryFilter(e.target.value), className: "bg-zinc-900 border border-zinc-700 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#FFE500]", children: [_jsx("option", { value: "", children: "Todas categorias" }), categories.map(c => _jsx("option", { value: c.id, children: c.name }, c.id))] })] }), _jsx("div", { className: "max-h-48 overflow-y-auto space-y-1.5", children: filteredProducts.length === 0 ? _jsx("p", { className: "text-zinc-500 text-sm text-center py-4", children: "Nenhum produto encontrado." }) :
                                                filteredProducts.map(p => {
                                                    const selected = bulkSelectedProducts.has(p.id);
                                                    return (_jsxs("button", { onClick: () => toggleBulkProduct(p.id), className: `w-full flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition-all border ${selected ? 'bg-[#FFE500]/10 border-[#FFE500]/40' : 'bg-zinc-900 border-zinc-700 hover:border-zinc-600'}`, children: [_jsx("div", { className: `w-4 h-4 rounded border flex items-center justify-center flex-shrink-0 ${selected ? 'bg-[#FFE500] border-[#FFE500]' : 'border-zinc-600'}`, children: selected && _jsx(CheckCircle2, { size: 12, className: "text-black" }) }), p.image_url ? _jsx("img", { src: p.image_url, alt: p.name, className: "w-8 h-8 rounded object-cover" }) :
                                                                _jsx("div", { className: "w-8 h-8 rounded bg-zinc-700 flex items-center justify-center", children: _jsx(Package, { size: 14, className: "text-zinc-400" }) }), _jsx("span", { className: "text-white font-medium truncate flex-1 text-left", children: p.name }), _jsxs("span", { className: "text-[#FFE500] text-xs font-bold", children: ["R$ ", p.price.toFixed(2)] })] }, p.id));
                                                }) })] }), _jsx("button", { onClick: handleBulkLink, disabled: saving || bulkSelectedProducts.size === 0 || bulkSelectedFranchises.size === 0, className: "w-full bg-[#FFE500] hover:bg-[#FFD000] text-black text-sm font-bold rounded-lg py-3 flex items-center justify-center gap-2 transition-all disabled:opacity-50", children: saving ? _jsxs(_Fragment, { children: [_jsx("div", { className: "w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" }), " Vinculando..."] }) : _jsxs(_Fragment, { children: [_jsx(Link2, { size: 16 }), " Vincular ", bulkSelectedProducts.size, " produto(s) a ", bulkSelectedFranchises.size, " franquia(s)"] }) })] })), !bulkMode && (_jsxs(_Fragment, { children: [_jsxs("div", { className: "flex gap-2", children: [_jsxs("div", { className: "relative flex-1", children: [_jsx(Search, { size: 14, className: "absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" }), _jsx("input", { type: "text", value: search, onChange: e => setSearch(e.target.value), placeholder: "Buscar produto...", className: "w-full bg-zinc-900 border border-zinc-700 text-white rounded-lg pl-9 pr-3 py-2 text-sm focus:outline-none focus:border-[#FFE500]" })] }), _jsxs("select", { value: categoryFilter, onChange: e => setCategoryFilter(e.target.value), className: "bg-zinc-900 border border-zinc-700 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#FFE500]", children: [_jsx("option", { value: "", children: "Todas categorias" }), categories.map(c => _jsx("option", { value: c.id, children: c.name }, c.id))] })] }), loading ? _jsx("div", { className: "flex justify-center py-12", children: _jsx("div", { className: "w-6 h-6 border-2 border-zinc-700 border-t-[#FFE500] rounded-full animate-spin" }) }) :
                                    filteredProducts.length === 0 ? (_jsxs("div", { className: "text-center py-12 bg-zinc-800/50 border border-zinc-700 rounded-xl", children: [_jsx(Package, { size: 40, className: "mx-auto text-zinc-700 mb-3" }), _jsx("p", { className: "text-zinc-400 text-sm", children: "Nenhum produto cadastrado no master." })] })) : (_jsx("div", { className: "space-y-2", children: filteredProducts.map(p => {
                                            const expanded = expandedProduct === p.id;
                                            const count = linkedCount(p.id);
                                            return (_jsxs("div", { className: "bg-zinc-800/50 border border-zinc-700 rounded-xl overflow-hidden", children: [_jsxs("div", { className: "flex items-center justify-between p-3", children: [_jsxs("div", { className: "flex items-center gap-3 flex-1 min-w-0", children: [p.image_url ? _jsx("img", { src: p.image_url, alt: p.name, className: "w-10 h-10 rounded-lg object-cover flex-shrink-0" }) :
                                                                        _jsx("div", { className: "w-10 h-10 rounded-lg bg-zinc-700 flex items-center justify-center flex-shrink-0", children: _jsx(Package, { size: 18, className: "text-zinc-400" }) }), _jsxs("div", { className: "min-w-0", children: [_jsx("p", { className: "text-white font-medium text-sm truncate", children: p.name }), _jsxs("p", { className: "text-zinc-500 text-xs", children: [catName(p.category_id), " \u2014 R$ ", p.price.toFixed(2)] })] })] }), _jsxs("div", { className: "flex items-center gap-3 flex-shrink-0", children: [_jsxs("span", { className: `text-xs font-bold px-2.5 py-1 rounded-full ${count > 0 ? 'bg-green-500/10 text-green-400' : 'bg-zinc-700 text-zinc-400'}`, children: [count, "/", franchises.length] }), _jsx("button", { onClick: () => setExpandedProduct(expanded ? null : p.id), className: "text-zinc-400 hover:text-white p-1.5 rounded-lg hover:bg-zinc-700 transition-colors", children: expanded ? _jsx(ChevronUp, { size: 16 }) : _jsx(ChevronDown, { size: 16 }) })] })] }), expanded && (_jsxs("div", { className: "border-t border-zinc-700 p-3 space-y-1.5 bg-zinc-900/50", children: [_jsx("p", { className: "text-zinc-500 text-xs mb-2", children: "Selecione as franquias para vincular este produto:" }), franchises.map(f => {
                                                                const linked = isLinked(p.id, f.id);
                                                                return (_jsxs("button", { onClick: () => toggleLink(p.id, f.id), disabled: saving, className: `w-full flex items-center justify-between rounded-lg px-3 py-2 text-sm transition-all border ${linked ? 'bg-green-500/10 border-green-500/30' : 'bg-zinc-800 border-zinc-700 hover:border-zinc-600'} disabled:opacity-50`, children: [_jsxs("div", { className: "flex items-center gap-2", children: [_jsx(Store, { size: 14, className: linked ? 'text-green-400' : 'text-zinc-500' }), _jsx("span", { className: linked ? 'text-white' : 'text-zinc-300', children: f.name })] }), linked ? (_jsxs("span", { className: "flex items-center gap-1 text-green-400 text-xs font-bold", children: [_jsx(CheckCircle2, { size: 14 }), " Vinculado"] })) : (_jsx("span", { className: "text-zinc-500 text-xs", children: "Clique para vincular" }))] }, f.id));
                                                            })] }))] }, p.id));
                                        }) }))] }))] })] }) }));
}
