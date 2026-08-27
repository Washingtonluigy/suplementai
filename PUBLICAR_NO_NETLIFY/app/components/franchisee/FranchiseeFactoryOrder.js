import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useEffect, useState } from 'react';
import { supabase } from '/app/lib/supabase.js';
import { Package, Plus, Trash2, Send, X, ShoppingCart, ClipboardList, Clock, Check, Truck, PackageCheck, Ban, Loader, FileText } from 'lucide-react';
const STATUS_LABELS = {
    pending: 'Pendente', processing: 'Em preparo', shipped: 'Enviado', delivered: 'Entregue', cancelled: 'Cancelado',
};
const STATUS_COLORS = {
    pending: 'bg-yellow-500/10 text-yellow-400', processing: 'bg-blue-500/10 text-blue-400', shipped: 'bg-purple-500/10 text-purple-400', delivered: 'bg-green-500/10 text-green-400', cancelled: 'bg-red-500/10 text-red-400',
};
const STATUS_ICONS = {
    pending: _jsx(Clock, { size: 12 }), processing: _jsx(Loader, { size: 12 }), shipped: _jsx(Truck, { size: 12 }), delivered: _jsx(PackageCheck, { size: 12 }), cancelled: _jsx(Ban, { size: 12 }),
};
export default function FranchiseeFactoryOrder({ franchiseId }) {
    const [tab, setTab] = useState('shop');
    const [products, setProducts] = useState([]);
    const [orders, setOrders] = useState([]);
    const [policies, setPolicies] = useState([]);
    const [loading, setLoading] = useState(true);
    const [cart, setCart] = useState([]);
    const [showCart, setShowCart] = useState(false);
    const [notes, setNotes] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [success, setSuccess] = useState(false);
    const load = async () => {
        const [{ data: prodData }, { data: orderData }, { data: policyData }] = await Promise.all([
            supabase.from('factory_products').select('*').eq('active', true).order('sort_order').order('name'),
            supabase.from('factory_orders').select('*').eq('franchise_id', franchiseId).order('created_at', { ascending: false }),
            supabase.from('factory_commercial_policy').select('*').eq('active', true).order('created_at'),
        ]);
        if (prodData)
            setProducts(prodData);
        if (orderData)
            setOrders(orderData);
        if (policyData)
            setPolicies(policyData);
        setLoading(false);
    };
    useEffect(() => { load(); }, [franchiseId]);
    const addToCart = (p) => {
        const existing = cart.find(c => c.product_id === p.id);
        if (existing) {
            setCart(cart.map(c => c.product_id === p.id ? { ...c, quantity: c.quantity + 1 } : c));
        }
        else {
            setCart([...cart, { product_id: p.id, name: p.name, quantity: 1, price: p.price }]);
        }
    };
    const updateQty = (id, delta) => {
        setCart(cart.map(c => c.product_id === id ? { ...c, quantity: Math.max(1, c.quantity + delta) } : c));
    };
    const removeFromCart = (id) => {
        setCart(cart.filter(c => c.product_id !== id));
    };
    const cartTotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const submitOrder = async () => {
        setSubmitting(true);
        const { error } = await supabase.from('factory_orders').insert({
            franchise_id: franchiseId,
            items: cart,
            notes: notes || null,
            total: cartTotal,
            status: 'pending',
        });
        if (!error) {
            setCart([]);
            setNotes('');
            setShowCart(false);
            setSuccess(true);
            setTimeout(() => setSuccess(false), 3000);
            load();
        }
        setSubmitting(false);
    };
    if (loading) {
        return _jsx("div", { className: "flex justify-center py-12", children: _jsx("div", { className: "w-6 h-6 border-2 border-zinc-700 border-t-[#FFE500] rounded-full animate-spin" }) });
    }
    const pendingOrders = orders.filter(o => o.status === 'pending' || o.status === 'processing' || o.status === 'shipped').length;
    return (_jsxs("div", { children: [success && (_jsx("div", { className: "bg-green-500/10 border border-green-500/30 text-green-400 rounded-lg p-3 mb-4 text-sm", children: "Pedido enviado com sucesso! O master ir\u00E1 processar seu pedido." })), _jsxs("div", { className: "flex gap-2 mb-4", children: [_jsxs("button", { onClick: () => setTab('shop'), className: `flex items-center gap-2 text-sm font-bold rounded-lg px-4 py-2 transition-colors ${tab === 'shop' ? 'bg-[#FFE500] text-black' : 'bg-zinc-900 text-zinc-400 hover:text-white'}`, children: [_jsx(ShoppingCart, { size: 16 }), " Fazer pedido"] }), _jsxs("button", { onClick: () => setTab('orders'), className: `flex items-center gap-2 text-sm font-bold rounded-lg px-4 py-2 transition-colors ${tab === 'orders' ? 'bg-[#FFE500] text-black' : 'bg-zinc-900 text-zinc-400 hover:text-white'}`, children: [_jsx(ClipboardList, { size: 16 }), " Meus pedidos ", pendingOrders > 0 && _jsx("span", { className: "bg-yellow-500/20 text-yellow-400 text-xs px-1.5 py-0.5 rounded-full", children: pendingOrders })] }), _jsxs("button", { onClick: () => setTab('policy'), className: `flex items-center gap-2 text-sm font-bold rounded-lg px-4 py-2 transition-colors ${tab === 'policy' ? 'bg-[#FFE500] text-black' : 'bg-zinc-900 text-zinc-400 hover:text-white'}`, children: [_jsx(FileText, { size: 16 }), " Pol\u00EDtica Comercial"] })] }), tab === 'shop' && (_jsxs(_Fragment, { children: [_jsxs("div", { className: "flex items-center justify-between mb-4", children: [_jsx("h3", { className: "text-white font-bold text-sm", children: "Produtos dispon\u00EDveis" }), cart.length > 0 && (_jsxs("button", { onClick: () => setShowCart(true), className: "bg-[#FFE500] hover:bg-[#FFD000] text-black text-sm font-bold rounded-lg px-4 py-2 flex items-center gap-1.5 transition-all", children: [_jsx(ShoppingCart, { size: 16 }), " Carrinho (", cart.length, ")"] }))] }), products.length === 0 ? (_jsxs("div", { className: "text-center py-12", children: [_jsx(Package, { size: 40, className: "mx-auto text-zinc-700 mb-3" }), _jsx("p", { className: "text-zinc-400 text-sm", children: "Nenhum produto dispon\u00EDvel para pedido no momento." })] })) : (_jsx("div", { className: "grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3", children: products.map(p => (_jsxs("div", { className: "bg-zinc-900 border border-zinc-800 rounded-xl p-4", children: [p.image_url ? (_jsx("img", { src: p.image_url, alt: p.name, className: "w-full h-24 rounded-lg object-cover mb-3" })) : (_jsx("div", { className: "w-full h-24 rounded-lg bg-zinc-800 flex items-center justify-center mb-3", children: _jsx(Package, { size: 28, className: "text-zinc-600" }) })), _jsx("p", { className: "text-white text-sm font-bold", children: p.name }), p.description && _jsx("p", { className: "text-zinc-500 text-xs mt-0.5 line-clamp-2", children: p.description }), _jsxs("p", { className: "text-[#FFE500] font-bold text-sm mt-2", children: ["R$ ", p.price.toFixed(2)] }), _jsxs("button", { onClick: () => addToCart(p), className: "w-full mt-3 bg-zinc-800 hover:bg-[#FFE500] hover:text-black text-white text-xs font-bold rounded-lg py-2 flex items-center justify-center gap-1 transition-all", children: [_jsx(Plus, { size: 14 }), " Adicionar"] })] }, p.id))) }))] })), tab === 'orders' && (_jsxs(_Fragment, { children: [_jsx("h3", { className: "text-white font-bold text-sm mb-4", children: "Meus pedidos de f\u00E1brica" }), orders.length === 0 ? (_jsxs("div", { className: "text-center py-12", children: [_jsx(ClipboardList, { size: 40, className: "mx-auto text-zinc-700 mb-3" }), _jsx("p", { className: "text-zinc-400 text-sm", children: "Voc\u00EA ainda n\u00E3o fez nenhum pedido de f\u00E1brica." })] })) : (_jsx("div", { className: "space-y-3", children: orders.map(order => (_jsxs("div", { className: "bg-zinc-900 border border-zinc-800 rounded-xl p-4", children: [_jsxs("div", { className: "flex items-start justify-between mb-2", children: [_jsxs("div", { children: [_jsxs("div", { className: "flex items-center gap-2 mb-1", children: [_jsxs("span", { className: `text-xs px-2 py-0.5 rounded-full flex items-center gap-1 ${STATUS_COLORS[order.status]}`, children: [STATUS_ICONS[order.status], " ", STATUS_LABELS[order.status]] }), _jsx("span", { className: "text-zinc-500 text-xs", children: new Date(order.created_at).toLocaleString('pt-BR') })] }), _jsxs("p", { className: "text-zinc-400 text-xs", children: [order.items?.length ?? 0, " item(ns)"] })] }), order.total > 0 && _jsxs("span", { className: "text-[#FFE500] font-bold text-sm", children: ["R$ ", order.total.toFixed(2)] })] }), _jsx("div", { className: "mt-2 space-y-1", children: Array.isArray(order.items) && order.items.map((item, i) => (_jsxs("div", { className: "flex justify-between text-xs", children: [_jsxs("span", { className: "text-zinc-300", children: [item.quantity, "x ", item.name ?? item.title ?? `Item ${i + 1}`] }), item.price && _jsxs("span", { className: "text-zinc-500", children: ["R$ ", ((item.price ?? 0) * (item.quantity ?? 1)).toFixed(2)] })] }, i))) }), order.notes && _jsxs("p", { className: "text-zinc-500 text-xs mt-2 italic", children: ["\"", order.notes, "\""] }), _jsx("div", { className: "flex items-center gap-1 mt-3 pt-3 border-t border-zinc-800", children: ['pending', 'processing', 'shipped', 'delivered'].map((step, i) => {
                                        const stepOrder = ['pending', 'processing', 'shipped', 'delivered'];
                                        const currentIdx = stepOrder.indexOf(order.status);
                                        const stepIdx = i;
                                        const isPast = stepIdx <= currentIdx && order.status !== 'cancelled';
                                        return (_jsxs("div", { className: "flex items-center flex-1", children: [_jsx("div", { className: `w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold ${isPast ? 'bg-[#FFE500] text-black' : 'bg-zinc-800 text-zinc-600'}`, children: stepIdx < currentIdx || (stepIdx === currentIdx && order.status !== 'pending') ? _jsx(Check, { size: 10 }) : stepIdx + 1 }), i < 3 && _jsx("div", { className: `flex-1 h-0.5 mx-1 ${stepIdx < currentIdx ? 'bg-[#FFE500]' : 'bg-zinc-800'}` })] }, step));
                                    }) }), _jsx("div", { className: "flex justify-between mt-1", children: ['Pendente', 'Preparo', 'Enviado', 'Entregue'].map((label, i) => (_jsx("span", { className: "text-[9px] text-zinc-600 flex-1 text-center", children: label }, i))) })] }, order.id))) }))] })), tab === 'policy' && (_jsxs("div", { className: "space-y-4", children: [_jsx("h3", { className: "text-white font-bold text-sm", children: "Pol\u00EDtica Comercial e Ofertas" }), policies.length === 0 ? (_jsx("p", { className: "text-zinc-400 text-sm text-center py-8", children: "Nenhuma pol\u00EDtica comercial dispon\u00EDvel no momento." })) : (policies.map(p => (_jsxs("div", { className: "bg-zinc-900 border border-zinc-800 rounded-xl p-5", children: [_jsxs("h4", { className: "text-[#FFE500] font-bold text-sm mb-2 flex items-center gap-2", children: [_jsx(FileText, { size: 16 }), " ", p.title] }), _jsx("p", { className: "text-zinc-300 text-sm whitespace-pre-wrap", children: p.content }), _jsxs("p", { className: "text-zinc-600 text-xs mt-3", children: ["Atualizado em ", new Date(p.updated_at).toLocaleDateString('pt-BR')] })] }, p.id))))] })), showCart && (_jsx("div", { className: "fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm", onClick: () => setShowCart(false), children: _jsxs("div", { className: "bg-zinc-900 border border-zinc-800 rounded-2xl w-full max-w-md max-h-[80vh] overflow-y-auto", onClick: e => e.stopPropagation(), children: [_jsxs("div", { className: "flex items-center justify-between p-6 border-b border-zinc-800 sticky top-0 bg-zinc-900", children: [_jsx("h3", { className: "text-white font-bold text-lg", children: "Carrinho" }), _jsx("button", { onClick: () => setShowCart(false), className: "text-zinc-400 hover:text-white", children: _jsx(X, { size: 20 }) })] }), _jsx("div", { className: "p-6 space-y-3", children: cart.length === 0 ? (_jsx("p", { className: "text-zinc-400 text-sm text-center py-8", children: "Carrinho vazio." })) : (_jsxs(_Fragment, { children: [cart.map(item => (_jsxs("div", { className: "bg-zinc-800/50 border border-zinc-700 rounded-lg p-3 flex items-center justify-between", children: [_jsxs("div", { children: [_jsx("p", { className: "text-white text-sm font-medium", children: item.name }), _jsxs("p", { className: "text-zinc-500 text-xs", children: ["R$ ", item.price.toFixed(2), " cada"] }), _jsxs("div", { className: "flex items-center gap-2 mt-1", children: [_jsx("button", { onClick: () => updateQty(item.product_id, -1), className: "w-6 h-6 rounded bg-zinc-700 text-white text-sm", children: "\u2212" }), _jsx("span", { className: "text-white text-sm", children: item.quantity }), _jsx("button", { onClick: () => updateQty(item.product_id, 1), className: "w-6 h-6 rounded bg-zinc-700 text-white text-sm", children: "+" })] })] }), _jsxs("div", { className: "text-right", children: [_jsxs("p", { className: "text-[#FFE500] font-bold text-sm", children: ["R$ ", (item.price * item.quantity).toFixed(2)] }), _jsx("button", { onClick: () => removeFromCart(item.product_id), className: "text-zinc-400 hover:text-red-400 p-1.5 mt-1", children: _jsx(Trash2, { size: 15 }) })] })] }, item.product_id))), _jsxs("div", { className: "flex justify-between border-t border-zinc-800 pt-3", children: [_jsx("span", { className: "text-white font-bold", children: "Total" }), _jsxs("span", { className: "text-[#FFE500] font-bold", children: ["R$ ", cartTotal.toFixed(2)] })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-zinc-300 text-xs font-medium mb-1", children: "Observa\u00E7\u00F5es" }), _jsx("textarea", { value: notes, onChange: e => setNotes(e.target.value), rows: 2, placeholder: "Alguma observa\u00E7\u00E3o para o pedido?", className: "w-full bg-zinc-800 border border-zinc-700 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#FFE500] resize-none" })] }), _jsx("button", { onClick: submitOrder, disabled: submitting, className: "w-full bg-[#FFE500] hover:bg-[#FFD000] text-black font-bold rounded-lg py-3 flex items-center justify-center gap-2 transition-all disabled:opacity-50", children: submitting ? _jsx("div", { className: "w-5 h-5 border-2 border-black/30 border-t-black rounded-full animate-spin" }) : _jsxs(_Fragment, { children: [_jsx(Send, { size: 18 }), " Enviar pedido"] }) })] })) })] }) }))] }));
}
