import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from 'react';
import { supabase } from '/app/lib/supabase.js';
import { X, Package, Trash2, Eye, Factory, Plus, Edit, ToggleLeft, ToggleRight, ClipboardList, Check, Truck, PackageCheck, Ban, FileText } from 'lucide-react';
const STATUS_LABELS = {
    pending: 'Pendente', processing: 'Em preparo', shipped: 'Enviado', delivered: 'Entregue', cancelled: 'Cancelado',
};
const STATUS_COLORS = {
    pending: 'bg-yellow-500/10 text-yellow-400', processing: 'bg-blue-500/10 text-blue-400', shipped: 'bg-purple-500/10 text-purple-400', delivered: 'bg-green-500/10 text-green-400', cancelled: 'bg-red-500/10 text-red-400',
};
export default function FactoryOrdersTool({ onClose }) {
    const [tab, setTab] = useState('orders');
    return (_jsx("div", { className: "fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm", onClick: onClose, children: _jsxs("div", { className: "bg-zinc-900 border border-zinc-800 rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto", onClick: e => e.stopPropagation(), children: [_jsxs("div", { className: "flex items-center justify-between p-6 border-b border-zinc-800 sticky top-0 bg-zinc-900 z-10", children: [_jsxs("div", { className: "flex items-center gap-3", children: [_jsx("div", { className: "w-10 h-10 rounded-lg bg-[#FFE500]/10 flex items-center justify-center", children: _jsx(Factory, { size: 20, className: "text-[#FFE500]" }) }), _jsxs("div", { children: [_jsx("h2", { className: "font-bold text-white text-lg", children: "Pedidos de F\u00E1brica" }), _jsx("p", { className: "text-zinc-500 text-xs", children: "Gerencie produtos e pedidos das franquias" })] })] }), _jsx("button", { onClick: onClose, className: "text-zinc-400 hover:text-white transition-colors", children: _jsx(X, { size: 22 }) })] }), _jsxs("div", { className: "flex gap-2 p-4 border-b border-zinc-800", children: [_jsxs("button", { onClick: () => setTab('orders'), className: `flex items-center gap-2 text-sm font-bold rounded-lg px-4 py-2 transition-colors ${tab === 'orders' ? 'bg-[#FFE500] text-black' : 'bg-zinc-800 text-zinc-400 hover:text-white'}`, children: [_jsx(ClipboardList, { size: 16 }), " Pedidos"] }), _jsxs("button", { onClick: () => setTab('products'), className: `flex items-center gap-2 text-sm font-bold rounded-lg px-4 py-2 transition-colors ${tab === 'products' ? 'bg-[#FFE500] text-black' : 'bg-zinc-800 text-zinc-400 hover:text-white'}`, children: [_jsx(Package, { size: 16 }), " Produtos"] }), _jsxs("button", { onClick: () => setTab('policy'), className: `flex items-center gap-2 text-sm font-bold rounded-lg px-4 py-2 transition-colors ${tab === 'policy' ? 'bg-[#FFE500] text-black' : 'bg-zinc-800 text-zinc-400 hover:text-white'}`, children: [_jsx(FileText, { size: 16 }), " Pol\u00EDtica"] })] }), tab === 'orders' ? _jsx(OrdersTab, {}) : tab === 'products' ? _jsx(ProductsTab, {}) : _jsx(PolicyTab, {})] }) }));
}
function OrdersTab() {
    const [orders, setOrders] = useState([]);
    const [franchises, setFranchises] = useState([]);
    const [loading, setLoading] = useState(true);
    const [viewOrder, setViewOrder] = useState(null);
    const [filterStatus, setFilterStatus] = useState('all');
    const load = async () => {
        const [{ data: orderData }, { data: franData }] = await Promise.all([
            supabase.from('factory_orders').select('*').order('created_at', { ascending: false }),
            supabase.from('franchises').select('*').order('name'),
        ]);
        if (orderData)
            setOrders(orderData);
        if (franData)
            setFranchises(franData);
        setLoading(false);
    };
    useEffect(() => { load(); }, []);
    const franName = (id) => franchises.find(f => f.id === id)?.name ?? '—';
    const updateStatus = async (order, status) => {
        await supabase.from('factory_orders').update({ status, updated_at: new Date().toISOString() }).eq('id', order.id);
        setViewOrder({ ...order, status: status });
        load();
    };
    const filtered = filterStatus === 'all' ? orders : orders.filter(o => o.status === filterStatus);
    const pendingCount = orders.filter(o => o.status === 'pending').length;
    return (_jsxs("div", { className: "p-6", children: [_jsxs("div", { className: "flex gap-2 mb-4 flex-wrap items-center", children: [_jsx("button", { onClick: () => setFilterStatus('all'), className: `text-xs px-3 py-1.5 rounded-lg font-medium transition-colors ${filterStatus === 'all' ? 'bg-[#FFE500] text-black' : 'bg-zinc-800 text-zinc-400 hover:text-white'}`, children: "Todos" }), Object.entries(STATUS_LABELS).map(([key, label]) => (_jsxs("button", { onClick: () => setFilterStatus(key), className: `text-xs px-3 py-1.5 rounded-lg font-medium transition-colors ${filterStatus === key ? 'bg-[#FFE500] text-black' : 'bg-zinc-800 text-zinc-400 hover:text-white'}`, children: [label, key === 'pending' && pendingCount > 0 && ` (${pendingCount})`] }, key)))] }), loading ? (_jsx("div", { className: "flex justify-center py-8", children: _jsx("div", { className: "w-6 h-6 border-2 border-zinc-700 border-t-[#FFE500] rounded-full animate-spin" }) })) : filtered.length === 0 ? (_jsxs("div", { className: "text-center py-12", children: [_jsx(Package, { size: 40, className: "mx-auto text-zinc-700 mb-3" }), _jsx("p", { className: "text-zinc-400 text-sm", children: "Nenhum pedido recebido." })] })) : (_jsx("div", { className: "space-y-3", children: filtered.map(order => (_jsxs("div", { className: "bg-zinc-800/50 border border-zinc-700 rounded-lg p-4", children: [_jsxs("div", { className: "flex items-start justify-between mb-2", children: [_jsxs("div", { children: [_jsxs("div", { className: "flex items-center gap-2 mb-1", children: [_jsx("h4", { className: "text-white font-bold text-sm", children: franName(order.franchise_id) }), _jsx("span", { className: `text-xs px-2 py-0.5 rounded-full ${STATUS_COLORS[order.status]}`, children: STATUS_LABELS[order.status] })] }), _jsxs("p", { className: "text-zinc-500 text-xs", children: [new Date(order.created_at).toLocaleString('pt-BR'), " \u2014 ", order.items?.length ?? 0, " item(ns)"] })] }), _jsxs("div", { className: "flex items-center gap-2", children: [order.total > 0 && _jsxs("span", { className: "text-[#FFE500] font-bold text-sm", children: ["R$ ", order.total.toFixed(2)] }), _jsx("button", { onClick: () => setViewOrder(order), className: "text-zinc-400 hover:text-[#FFE500] p-1.5 transition-colors", children: _jsx(Eye, { size: 15 }) })] })] }), _jsxs("div", { className: "flex gap-1.5 mt-2 flex-wrap", children: [order.status === 'pending' && (_jsxs("button", { onClick: () => updateStatus(order, 'processing'), className: "text-xs bg-blue-500/20 text-blue-400 hover:bg-blue-500/30 rounded-lg px-3 py-1.5 flex items-center gap-1 transition-colors", children: [_jsx(Check, { size: 12 }), " Aceitar"] })), order.status === 'processing' && (_jsxs("button", { onClick: () => updateStatus(order, 'shipped'), className: "text-xs bg-purple-500/20 text-purple-400 hover:bg-purple-500/30 rounded-lg px-3 py-1.5 flex items-center gap-1 transition-colors", children: [_jsx(Truck, { size: 12 }), " Despachar"] })), order.status === 'shipped' && (_jsxs("button", { onClick: () => updateStatus(order, 'delivered'), className: "text-xs bg-green-500/20 text-green-400 hover:bg-green-500/30 rounded-lg px-3 py-1.5 flex items-center gap-1 transition-colors", children: [_jsx(PackageCheck, { size: 12 }), " Entregue"] })), (order.status === 'pending' || order.status === 'processing') && (_jsxs("button", { onClick: () => updateStatus(order, 'cancelled'), className: "text-xs bg-red-500/20 text-red-400 hover:bg-red-500/30 rounded-lg px-3 py-1.5 flex items-center gap-1 transition-colors", children: [_jsx(Ban, { size: 12 }), " Cancelar"] }))] })] }, order.id))) })), viewOrder && (_jsx("div", { className: "fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm", onClick: () => setViewOrder(null), children: _jsxs("div", { className: "bg-zinc-900 border border-zinc-800 rounded-2xl w-full max-w-md max-h-[80vh] overflow-y-auto", onClick: e => e.stopPropagation(), children: [_jsxs("div", { className: "flex items-center justify-between p-6 border-b border-zinc-800 sticky top-0 bg-zinc-900", children: [_jsxs("h3", { className: "text-white font-bold text-lg", children: ["Pedido \u2014 ", franName(viewOrder.franchise_id)] }), _jsx("button", { onClick: () => setViewOrder(null), className: "text-zinc-400 hover:text-white", children: _jsx(X, { size: 20 }) })] }), _jsxs("div", { className: "p-6 space-y-3", children: [_jsxs("div", { className: "flex items-center gap-2", children: [_jsx("span", { className: `text-xs px-2 py-0.5 rounded-full ${STATUS_COLORS[viewOrder.status]}`, children: STATUS_LABELS[viewOrder.status] }), _jsx("span", { className: "text-zinc-500 text-xs", children: new Date(viewOrder.created_at).toLocaleString('pt-BR') })] }), _jsxs("div", { className: "space-y-2", children: [Array.isArray(viewOrder.items) && viewOrder.items.map((item, i) => (_jsxs("div", { className: "bg-zinc-800/50 border border-zinc-700 rounded-lg p-3", children: [_jsxs("div", { className: "flex justify-between", children: [_jsxs("p", { className: "text-white text-sm font-medium", children: [item.quantity, "x ", item.name ?? item.title ?? `Item ${i + 1}`] }), item.price && _jsxs("p", { className: "text-[#FFE500] text-sm", children: ["R$ ", ((item.price ?? 0) * (item.quantity ?? 1)).toFixed(2)] })] }), item.notes && _jsx("p", { className: "text-zinc-500 text-xs mt-1", children: item.notes })] }, i))), (!viewOrder.items || viewOrder.items.length === 0) && _jsx("p", { className: "text-zinc-400 text-sm", children: "Sem detalhes de itens." })] }), viewOrder.total > 0 && (_jsxs("div", { className: "flex justify-between border-t border-zinc-800 pt-3", children: [_jsx("span", { className: "text-white font-bold", children: "Total" }), _jsxs("span", { className: "text-[#FFE500] font-bold", children: ["R$ ", viewOrder.total.toFixed(2)] })] })), viewOrder.notes && (_jsxs("div", { className: "bg-zinc-800/50 rounded-lg p-3", children: [_jsx("p", { className: "text-zinc-500 text-xs mb-1", children: "Observa\u00E7\u00F5es" }), _jsx("p", { className: "text-white text-sm", children: viewOrder.notes })] })), _jsxs("div", { children: [_jsx("label", { className: "block text-zinc-300 text-xs font-medium mb-2", children: "Alterar status" }), _jsx("div", { className: "flex flex-wrap gap-2", children: Object.entries(STATUS_LABELS).map(([key, label]) => (_jsx("button", { onClick: () => updateStatus(viewOrder, key), className: `text-xs px-3 py-1.5 rounded-lg font-medium transition-colors ${viewOrder.status === key ? 'bg-[#FFE500] text-black' : 'bg-zinc-800 text-zinc-400 hover:text-white'}`, children: label }, key))) })] })] })] }) }))] }));
}
function ProductsTab() {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [editing, setEditing] = useState(null);
    const [form, setForm] = useState({ name: '', description: '', price: '', category: '', image: null });
    const [imageUrl, setImageUrl] = useState(null);
    const [saving, setSaving] = useState(false);
    const load = async () => {
        const { data } = await supabase.from('factory_products').select('*').order('sort_order').order('name');
        if (data)
            setProducts(data);
        setLoading(false);
    };
    useEffect(() => { load(); }, []);
    const handleSave = async (e) => {
        e.preventDefault();
        setSaving(true);
        let img = imageUrl;
        if (form.image) {
            const ext = form.image.name.split('.').pop();
            const path = `factory/factory-${Date.now()}.${ext}`;
            const { error } = await supabase.storage.from('franchise-products').upload(path, form.image);
            if (!error)
                img = supabase.storage.from('franchise-products').getPublicUrl(path).data.publicUrl;
        }
        const payload = {
            name: form.name,
            description: form.description || null,
            price: parseFloat(form.price) || 0,
            category: form.category || null,
            image_url: img,
            active: true,
            sort_order: editing?.sort_order ?? products.length,
        };
        if (editing) {
            await supabase.from('factory_products').update(payload).eq('id', editing.id);
        }
        else {
            await supabase.from('factory_products').insert(payload);
        }
        setForm({ name: '', description: '', price: '', category: '', image: null });
        setImageUrl(null);
        setEditing(null);
        setShowForm(false);
        setSaving(false);
        load();
    };
    const toggleActive = async (p) => {
        await supabase.from('factory_products').update({ active: !p.active }).eq('id', p.id);
        load();
    };
    const remove = async (id) => {
        if (!confirm('Excluir este produto?'))
            return;
        await supabase.from('factory_products').delete().eq('id', id);
        load();
    };
    return (_jsxs("div", { className: "p-6", children: [_jsxs("div", { className: "flex items-center justify-between mb-4", children: [_jsx("p", { className: "text-zinc-400 text-sm", children: "Produtos dispon\u00EDveis para as franquias pedirem" }), _jsxs("button", { onClick: () => { if (editing) {
                            setEditing(null);
                            setForm({ name: '', description: '', price: '', category: '', image: null });
                            setImageUrl(null);
                        } setShowForm(!showForm); }, className: "flex items-center gap-2 bg-[#FFE500] hover:bg-[#FFD000] text-black text-sm font-bold rounded-lg px-4 py-2 transition-colors", children: [_jsx(Plus, { size: 16 }), " ", showForm ? 'Cancelar' : 'Novo produto'] })] }), showForm && (_jsxs("form", { onSubmit: handleSave, className: "bg-zinc-800/50 border border-zinc-700 rounded-xl p-4 mb-4 space-y-3", children: [_jsx("input", { required: true, placeholder: "Nome do produto", value: form.name, onChange: e => setForm({ ...form, name: e.target.value }), className: "w-full bg-zinc-900 border border-zinc-700 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#FFE500]" }), _jsx("textarea", { placeholder: "Descri\u00E7\u00E3o (opcional)", value: form.description, onChange: e => setForm({ ...form, description: e.target.value }), rows: 2, className: "w-full bg-zinc-900 border border-zinc-700 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#FFE500] resize-none" }), _jsxs("div", { className: "grid grid-cols-2 gap-3", children: [_jsx("input", { required: true, type: "number", step: "0.01", placeholder: "Pre\u00E7o (R$)", value: form.price, onChange: e => setForm({ ...form, price: e.target.value }), className: "bg-zinc-900 border border-zinc-700 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#FFE500]" }), _jsx("input", { placeholder: "Categoria (opcional)", value: form.category, onChange: e => setForm({ ...form, category: e.target.value }), className: "bg-zinc-900 border border-zinc-700 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#FFE500]" })] }), _jsxs("label", { className: "flex items-center gap-2 bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 cursor-pointer hover:border-[#FFE500]/50 transition-colors", children: [_jsx(Plus, { size: 16, className: "text-zinc-400" }), _jsx("span", { className: "text-zinc-400 text-sm", children: form.image ? form.image.name : 'Imagem (opcional)' }), _jsx("input", { type: "file", accept: "image/*", className: "hidden", onChange: e => setForm({ ...form, image: e.target.files?.[0] ?? null }) })] }), imageUrl && !form.image && _jsx("img", { src: imageUrl, alt: "", className: "w-full h-32 object-cover rounded-lg" }), _jsx("button", { type: "submit", disabled: saving, className: "bg-[#FFE500] hover:bg-[#FFD000] text-black text-sm font-bold rounded-lg px-4 py-2 disabled:opacity-50", children: saving ? 'Salvando...' : editing ? 'Salvar' : 'Criar produto' })] })), loading ? (_jsx("div", { className: "flex justify-center py-8", children: _jsx("div", { className: "w-6 h-6 border-2 border-zinc-700 border-t-[#FFE500] rounded-full animate-spin" }) })) : products.length === 0 ? (_jsxs("div", { className: "text-center py-12", children: [_jsx(Package, { size: 40, className: "mx-auto text-zinc-700 mb-3" }), _jsx("p", { className: "text-zinc-400 text-sm", children: "Nenhum produto cadastrado." })] })) : (_jsx("div", { className: "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3", children: products.map(p => (_jsxs("div", { className: `bg-zinc-800/50 border rounded-xl p-3 ${p.active ? 'border-zinc-700' : 'border-zinc-800 opacity-50'}`, children: [_jsxs("div", { className: "flex items-start gap-3", children: [_jsx("div", { className: "w-14 h-14 rounded-lg overflow-hidden bg-zinc-900 flex-shrink-0", children: p.image_url ? _jsx("img", { src: p.image_url, alt: "", className: "w-full h-full object-cover" }) : _jsx("div", { className: "w-full h-full flex items-center justify-center", children: _jsx(Package, { size: 18, className: "text-zinc-600" }) }) }), _jsxs("div", { className: "flex-1 min-w-0", children: [_jsx("p", { className: "text-white text-sm font-bold truncate", children: p.name }), p.category && _jsx("span", { className: "text-zinc-500 text-xs", children: p.category }), _jsxs("p", { className: "text-[#FFE500] text-sm font-bold mt-0.5", children: ["R$ ", p.price.toFixed(2)] })] })] }), _jsxs("div", { className: "flex items-center gap-1 mt-2", children: [_jsx("button", { onClick: () => toggleActive(p), className: "text-zinc-500 hover:text-[#FFE500] p-1", children: p.active ? _jsx(ToggleRight, { size: 18 }) : _jsx(ToggleLeft, { size: 18 }) }), _jsx("button", { onClick: () => { setEditing(p); setForm({ name: p.name, description: p.description ?? '', price: String(p.price), category: p.category ?? '', image: null }); setImageUrl(p.image_url); setShowForm(true); }, className: "text-zinc-500 hover:text-[#FFE500] p-1", children: _jsx(Edit, { size: 14 }) }), _jsx("button", { onClick: () => remove(p.id), className: "text-zinc-500 hover:text-red-400 p-1", children: _jsx(Trash2, { size: 14 }) })] })] }, p.id))) }))] }));
}
function PolicyTab() {
    const [policies, setPolicies] = useState([]);
    const [loading, setLoading] = useState(true);
    const [editing, setEditing] = useState(null);
    const [form, setForm] = useState({ title: '', content: '', active: true });
    const [saving, setSaving] = useState(false);
    const load = async () => {
        const { data } = await supabase.from('factory_commercial_policy').select('*').order('created_at');
        setPolicies(data || []);
        setLoading(false);
    };
    useEffect(() => { load(); }, []);
    const save = async (e) => {
        e.preventDefault();
        setSaving(true);
        if (editing) {
            await supabase.from('factory_commercial_policy').update({ ...form, updated_at: new Date().toISOString() }).eq('id', editing.id);
        }
        else {
            await supabase.from('factory_commercial_policy').insert(form);
        }
        setForm({ title: '', content: '', active: true });
        setEditing(null);
        setSaving(false);
        load();
    };
    const remove = async (id) => {
        if (!confirm('Excluir esta política?'))
            return;
        await supabase.from('factory_commercial_policy').delete().eq('id', id);
        load();
    };
    return (_jsxs("div", { className: "p-6", children: [_jsxs("div", { className: "flex items-center justify-between mb-4", children: [_jsx("p", { className: "text-zinc-400 text-sm", children: "Pol\u00EDtica comercial e ofertas do m\u00EAs \u2014 vis\u00EDvel para todas as franquias" }), _jsxs("button", { onClick: () => { setEditing(null); setForm({ title: '', content: '', active: true }); }, className: "flex items-center gap-2 bg-[#FFE500] hover:bg-[#FFD000] text-black text-sm font-bold rounded-lg px-4 py-2", children: [_jsx(Plus, { size: 16 }), " Nova"] })] }), _jsxs("form", { onSubmit: save, className: "bg-zinc-800/50 border border-zinc-700 rounded-xl p-4 mb-4 space-y-3", children: [_jsx("input", { type: "text", value: form.title, onChange: e => setForm({ ...form, title: e.target.value }), required: true, placeholder: "T\u00EDtulo (ex: Pol\u00EDtica Comercial, Ofertas do M\u00EAs)", className: "w-full bg-zinc-900 border border-zinc-700 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#FFE500]" }), _jsx("textarea", { value: form.content, onChange: e => setForm({ ...form, content: e.target.value }), required: true, placeholder: "Conte\u00FAdo da pol\u00EDtica/oferta", rows: 4, className: "w-full bg-zinc-900 border border-zinc-700 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#FFE500] resize-none" }), _jsxs("label", { className: "flex items-center gap-2 cursor-pointer", children: [_jsx("input", { type: "checkbox", checked: form.active, onChange: e => setForm({ ...form, active: e.target.checked }), className: "w-4 h-4 rounded border-zinc-600 bg-zinc-800 text-[#FFE500]" }), _jsx("span", { className: "text-zinc-300 text-sm", children: "Ativo" })] }), _jsx("button", { type: "submit", disabled: saving, className: "bg-[#FFE500] hover:bg-[#FFD000] text-black text-sm font-bold rounded-lg px-4 py-2 disabled:opacity-50", children: saving ? 'Salvando...' : editing ? 'Salvar' : 'Criar' })] }), loading ? _jsx("div", { className: "flex justify-center py-8", children: _jsx("div", { className: "w-6 h-6 border-2 border-zinc-700 border-t-[#FFE500] rounded-full animate-spin" }) }) :
                policies.length === 0 ? _jsx("p", { className: "text-zinc-400 text-sm text-center py-8", children: "Nenhuma pol\u00EDtica criada." }) :
                    _jsx("div", { className: "space-y-2", children: policies.map(p => (_jsxs("div", { className: "bg-zinc-800/50 border border-zinc-700 rounded-lg p-3 flex items-center justify-between", children: [_jsxs("div", { className: "min-w-0", children: [_jsxs("p", { className: "text-white text-sm font-bold", children: [p.title, " ", !p.active && _jsx("span", { className: "text-zinc-500 text-xs", children: "(inativo)" })] }), _jsx("p", { className: "text-zinc-500 text-xs truncate", children: p.content })] }), _jsxs("div", { className: "flex gap-1", children: [_jsx("button", { onClick: () => { setEditing(p); setForm({ title: p.title, content: p.content, active: p.active }); }, className: "text-zinc-400 hover:text-[#FFE500] p-1.5", children: _jsx(Edit, { size: 14 }) }), _jsx("button", { onClick: () => remove(p.id), className: "text-zinc-400 hover:text-red-400 p-1.5", children: _jsx(Trash2, { size: 14 }) })] })] }, p.id))) })] }));
}
