import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useEffect, useMemo, useState } from 'react';
import { supabase } from '/app/lib/supabase.js';
import { useAuth } from '/app/contexts/AuthContext.js';
import { ClipboardPenLine, Plus, Minus, X, Trash2, Search, Percent, DollarSign, Wallet, Receipt, Check, Bike, Package, ChevronDown, UserPlus, Edit3 } from 'lucide-react';
const SALE_TYPES = [
    { value: 'counter', label: 'Balcão', description: 'Venda normal e faturamento' },
    { value: 'sponsorship', label: 'Patrocínio', description: 'Lançar como despesa' },
    { value: 'tasting', label: 'Degustação', description: 'Lançar como despesa' },
    { value: 'gift', label: 'Brindes', description: 'Lançar como despesa' },
];
const PAYMENT_METHODS = [
    { value: 'pix', label: 'PIX', needsChange: false },
    { value: 'credit_card', label: 'Cartão de Crédito', needsChange: false },
    { value: 'debit_card', label: 'Cartão de Débito', needsChange: false },
    { value: 'cash', label: 'Dinheiro', needsChange: true },
    { value: 'meal_voucher', label: 'Vale-refeição', needsChange: false },
];
const DELIVERY_SOURCES = [
    { value: 'whatsapp', label: 'WhatsApp' },
    { value: 'events', label: 'Eventos' },
    { value: 'referral', label: 'Indicação' },
    { value: 'nutritionist', label: 'Nutricionista' },
    { value: 'ifood', label: 'iFood' },
    { value: 'uber_eats', label: 'Uber Eats' },
    { value: 'rappi', label: 'Rappi' },
    { value: '99delivery', label: '99 Delivery' },
    { value: 'phone', label: 'Telefone' },
    { value: 'other', label: 'Outro' },
];
const QUICK_CASH = [50, 100, 150, 200];
export default function FranchiseeManualOrder({ franchiseId }) {
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [search, setSearch] = useState('');
    const [cart, setCart] = useState([]);
    const [expandedCategory, setExpandedCategory] = useState(null);
    const [saleType, setSaleType] = useState('counter');
    const [campaign, setCampaign] = useState('');
    const [customer, setCustomer] = useState('');
    const [selectedCustomerId, setSelectedCustomerId] = useState(null);
    const [customerSearchResults, setCustomerSearchResults] = useState([]);
    const [showCustomerResults, setShowCustomerResults] = useState(false);
    const [isDelivery, setIsDelivery] = useState(false);
    const [deliverySource, setDeliverySource] = useState('whatsapp');
    const [deliverySourceDetail, setDeliverySourceDetail] = useState('');
    const [deliveryFee, setDeliveryFee] = useState('');
    const [deliveryFeePayer, setDeliveryFeePayer] = useState('customer');
    const [discountType, setDiscountType] = useState('percent');
    const [discountValue, setDiscountValue] = useState('');
    const [paymentMethod, setPaymentMethod] = useState('pix');
    const [installments, setInstallments] = useState(1);
    const [amountPaid, setAmountPaid] = useState('');
    const [saving, setSaving] = useState(false);
    const [showQuickCustomer, setShowQuickCustomer] = useState(false);
    const [quickCustomer, setQuickCustomer] = useState({ name: '', phone: '' });
    const [editingPrice, setEditingPrice] = useState(null);
    const [priceInput, setPriceInput] = useState('');
    const { user } = useAuth();
    const [franchiseUserId, setFranchiseUserId] = useState(null);
    const [franchiseUserName, setFranchiseUserName] = useState(null);
    const [message, setMessage] = useState('');
    const [showCheckout, setShowCheckout] = useState(false);
    useEffect(() => {
        supabase.from('franchise_products').select('*').eq('franchise_id', franchiseId).eq('active', true).order('name').then(({ data }) => setProducts((data ?? [])));
        supabase.from('franchise_categories').select('*').eq('franchise_id', franchiseId).order('sort_order', { ascending: true }).order('created_at', { ascending: true }).order('id', { ascending: true }).then(({ data }) => setCategories((data ?? [])));
    }, [franchiseId]);
    useEffect(() => {
        if (user) {
            supabase.from('franchise_users').select('id, name').eq('auth_user_id', user.id).maybeSingle().then(({ data }) => {
                if (data) {
                    setFranchiseUserId(data.id);
                    setFranchiseUserName(data.name);
                }
            });
        }
    }, [user]);
    const searchCustomers = async (q) => {
        const term = q.trim();
        if (!term) {
            setCustomerSearchResults([]);
            return;
        }
        const { data } = await supabase
            .from('customers')
            .select('*')
            .eq('franchise_id', franchiseId)
            .or(`name.ilike.%${term}%,phone.ilike.%${term}%,cpf_cnpj.ilike.%${term}%`)
            .order('name')
            .limit(12);
        setCustomerSearchResults(data || []);
    };
    const filteredProducts = useMemo(() => {
        let list = products;
        if (search.trim())
            list = list.filter(p => p.name.toLowerCase().includes(search.toLowerCase()));
        return list;
    }, [products, search]);
    const productsByCategory = useMemo(() => {
        const map = new Map();
        for (const p of filteredProducts) {
            const key = p.category_id ?? 'others';
            const arr = map.get(key) ?? [];
            arr.push(p);
            map.set(key, arr);
        }
        return map;
    }, [filteredProducts]);
    const categoryList = [...categories, { id: 'others', name: 'Outros', franchise_id: franchiseId, sort_order: 999, created_at: '' }];
    const subtotal = useMemo(() => cart.reduce((sum, item) => sum + item.price * item.quantity, 0), [cart]);
    const discountAmount = useMemo(() => {
        const val = parseFloat(discountValue) || 0;
        if (val <= 0)
            return 0;
        if (discountType === 'percent')
            return Math.min(subtotal * (val / 100), subtotal);
        return Math.min(val, subtotal);
    }, [discountValue, discountType, subtotal]);
    const deliveryFeeAmount = useMemo(() => {
        if (!isDelivery || saleType !== 'counter')
            return 0;
        return parseFloat(deliveryFee) || 0;
    }, [isDelivery, saleType, deliveryFee]);
    const total = useMemo(() => {
        const base = Math.max(0, subtotal - discountAmount);
        if (!isDelivery || saleType !== 'counter')
            return base;
        return deliveryFeePayer === 'customer' ? base + deliveryFeeAmount : base;
    }, [subtotal, discountAmount, isDelivery, saleType, deliveryFeePayer, deliveryFeeAmount]);
    const change = useMemo(() => {
        if (paymentMethod !== 'cash')
            return 0;
        const paid = parseFloat(amountPaid) || 0;
        if (paid <= 0)
            return 0;
        return Math.max(0, paid - total);
    }, [amountPaid, paymentMethod, total]);
    const add = (product) => setCart(current => {
        const existing = current.find(item => item.id === product.id);
        const line = { ...product, price: product.discount_price ?? product.price, quantity: 1 };
        return existing ? current.map(item => item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item) : [...current, line];
    });
    const editPrice = (id) => {
        const item = cart.find(c => c.id === id);
        if (item) {
            setEditingPrice(id);
            setPriceInput(String(item.price));
        }
    };
    const savePrice = (id) => {
        const newPrice = parseFloat(priceInput) || 0;
        setCart(current => current.map(item => item.id === id ? { ...item, price: Math.max(0, newPrice) } : item));
        setEditingPrice(null);
        setPriceInput('');
    };
    const saveQuickCustomer = async () => {
        if (!quickCustomer.name.trim())
            return;
        const { data } = await supabase.from('customers').insert({
            franchise_id: franchiseId, name: quickCustomer.name.trim(), phone: quickCustomer.phone.trim() || null,
        }).select().single();
        if (data) {
            setCustomer(data.name);
            setSelectedCustomerId(data.id);
        }
        setQuickCustomer({ name: '', phone: '' });
        setShowQuickCustomer(false);
    };
    const changeQty = (id, amount) => setCart(current => current.map(item => item.id === id ? { ...item, quantity: item.quantity + amount } : item).filter(item => item.quantity > 0));
    const removeItem = (id) => setCart(current => current.filter(item => item.id !== id));
    const clearCart = () => { setCart([]); setDiscountValue(''); setAmountPaid(''); setDeliveryFee(''); setShowCheckout(false); };
    const resetForm = () => {
        setCart([]);
        setCustomer('');
        setSelectedCustomerId(null);
        setCampaign('');
        setIsDelivery(false);
        setDeliverySource('whatsapp');
        setDeliverySourceDetail('');
        setDeliveryFee('');
        setDeliveryFeePayer('customer');
        setDiscountValue('');
        setAmountPaid('');
        setPaymentMethod('pix');
        setInstallments(1);
        setShowCheckout(false);
    };
    const finish = async () => {
        if (cart.length === 0)
            return;
        if (paymentMethod === 'cash' && parseFloat(amountPaid) < total)
            return;
        setSaving(true);
        setMessage('');
        const items = cart.map(item => ({ product_id: item.id, name: item.name, price: item.price, quantity: item.quantity }));
        const deliveryFlag = isDelivery && saleType === 'counter';
        const orderResult = await supabase.from('customer_orders').insert({
            franchise_id: franchiseId, customer_name: customer.trim() || 'Venda balcão', items, total,
            subtotal, discount_amount: discountAmount, payment_method: paymentMethod,
            status: 'delivered', delivery: deliveryFlag, delivery_source: deliveryFlag ? deliverySource : null,
            delivery_source_detail: deliveryFlag && deliverySource === 'other' ? deliverySourceDetail.trim() || null : null,
            delivery_fee: deliveryFlag ? deliveryFeeAmount : 0,
            delivery_fee_payer: deliveryFlag ? deliveryFeePayer : null,
            notes: campaign.trim() ? `Campanha: ${campaign.trim()}${deliveryFlag ? ` • Entrega: ${deliverySource} • Taxa: R$ ${deliveryFeeAmount.toFixed(2)} (${deliveryFeePayer === 'store' ? 'loja' : 'cliente'})` : ''}` : (deliveryFlag ? `Entrega: ${deliverySource} • Taxa: R$ ${deliveryFeeAmount.toFixed(2)} (${deliveryFeePayer === 'store' ? 'loja' : 'cliente'})` : null),
            order_type: saleType, campaign_name: campaign.trim() || null,
        });
        if (orderResult.error) {
            setMessage('Não foi possível registrar o pedido.');
            setSaving(false);
            return;
        }
        const saleResult = await supabase.from('sales').insert({
            franchise_id: franchiseId, total, subtotal, items_count: cart.reduce((sum, item) => sum + item.quantity, 0),
            sale_type: saleType, campaign_name: campaign.trim() || null,
            delivery_source: deliveryFlag ? deliverySource : null, items,
            payment_method: paymentMethod, discount: discountAmount, discount_type: discountType === 'percent' && discountAmount > 0 ? 'percent' : discountAmount > 0 ? 'fixed' : null,
            amount_paid: paymentMethod === 'cash' ? parseFloat(amountPaid) || total : total, change: paymentMethod === 'cash' ? change : 0,
            delivery_fee: deliveryFlag ? deliveryFeeAmount : 0, delivery_fee_payer: deliveryFlag ? deliveryFeePayer : null,
            customer_id: selectedCustomerId,
            user_id: franchiseUserId,
            user_name: franchiseUserName,
            installments: paymentMethod === 'credit_card' ? installments : 1,
        });
        if (saleResult.error) {
            setMessage('Pedido salvo, mas o relatório não foi atualizado.');
            setSaving(false);
            return;
        }
        if (saleType !== 'counter')
            await supabase.from('financial_entries').insert({ franchise_id: franchiseId, type: 'expense', description: `${SALE_TYPES.find(type => type.value === saleType)?.label}${campaign.trim() ? ` — ${campaign.trim()}` : ''}`, amount: total, paid: true });
        resetForm();
        setMessage('Venda registrada com sucesso!');
        setSaving(false);
        setTimeout(() => setMessage(''), 4000);
    };
    return (_jsxs("div", { children: [_jsxs("div", { className: "flex items-center justify-between mb-4", children: [_jsxs("div", { children: [_jsx("h3", { className: "text-white font-bold text-lg", children: "Caixa \u2014 PDV" }), _jsx("p", { className: "text-zinc-500 text-xs", children: "Registre vendas no balc\u00E3o, a\u00E7\u00F5es e brindes." })] }), _jsx(ClipboardPenLine, { className: "text-[#FFE500]" })] }), message && (_jsxs("div", { className: "bg-green-500/10 border border-green-500/30 text-green-400 rounded-lg p-3 mb-4 text-sm flex items-center gap-2", children: [_jsx(Check, { size: 16 }), " ", message] })), _jsxs("div", { className: "grid lg:grid-cols-[1fr_380px] gap-5", children: [_jsxs("div", { children: [_jsxs("div", { className: "relative mb-3", children: [_jsx(Search, { size: 18, className: "absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" }), _jsx("input", { type: "text", value: search, onChange: e => setSearch(e.target.value), placeholder: "Buscar produto...", className: "w-full bg-zinc-900 border border-zinc-800 text-white rounded-lg pl-10 pr-4 py-2.5 text-sm placeholder-zinc-500 focus:outline-none focus:border-[#FFE500]/50" })] }), categoryList.length > 1 && !search.trim() && (_jsx("div", { className: "grid grid-cols-2 sm:grid-cols-3 gap-3 mb-4", children: categoryList.map(cat => {
                                    const items = productsByCategory.get(cat.id) ?? [];
                                    if (items.length === 0)
                                        return null;
                                    const isOpen = expandedCategory === cat.id;
                                    return (_jsxs("div", { className: `bg-zinc-900 border rounded-xl overflow-hidden transition-all ${isOpen ? 'border-[#FFE500]/50 col-span-2 sm:col-span-3' : 'border-zinc-800'}`, children: [_jsxs("button", { onClick: () => setExpandedCategory(isOpen ? null : cat.id), className: "w-full flex items-center justify-between p-4 hover:bg-zinc-800/50 transition-colors", children: [_jsxs("div", { className: "flex items-center gap-2", children: [_jsx(ChevronDown, { size: 18, className: `text-[#FFE500] transition-transform ${isOpen ? '' : '-rotate-90'}` }), _jsx("span", { className: "text-white font-bold text-sm", children: cat.name })] }), _jsxs("span", { className: "text-zinc-500 text-xs", children: [items.length, " item(ns)"] })] }), isOpen && (_jsx("div", { className: "grid grid-cols-2 sm:grid-cols-3 gap-3 p-3 pt-0 border-t border-zinc-800", children: items.map(product => (_jsxs("button", { onClick: () => add(product), className: "text-left bg-zinc-800 border border-zinc-700 hover:border-[#FFE500]/50 rounded-xl p-3 transition-colors flex flex-col", children: [product.image_url ? _jsx("img", { src: product.image_url, alt: product.name, className: "w-full h-20 rounded-lg object-contain bg-zinc-900 mb-2" }) : _jsx("div", { className: "w-full h-20 rounded-lg bg-zinc-700 flex items-center justify-center mb-2", children: _jsx(Package, { size: 20, className: "text-zinc-600" }) }), _jsx("p", { className: "text-white font-medium text-sm leading-tight", children: product.name }), _jsxs("p", { className: "text-[#FFE500] text-sm mt-1 font-bold", children: ["R$ ", (product.discount_price ?? product.price).toFixed(2), " ", product.discount_price && _jsxs("span", { className: "text-zinc-500 line-through text-xs ml-1", children: ["R$ ", product.price.toFixed(2)] })] }), _jsxs("span", { className: "text-zinc-500 text-xs flex items-center gap-1 mt-2", children: [_jsx(Plus, { size: 12 }), "Adicionar"] })] }, product.id))) }))] }, cat.id));
                                }) })), (search.trim() || categoryList.length <= 1) && (_jsxs("div", { className: "grid grid-cols-2 sm:grid-cols-3 gap-3", children: [filteredProducts.map(product => (_jsxs("button", { onClick: () => add(product), className: "text-left bg-zinc-900 border border-zinc-800 hover:border-[#FFE500]/50 rounded-xl p-3 transition-colors flex flex-col", children: [product.image_url ? _jsx("img", { src: product.image_url, alt: product.name, className: "w-full h-20 rounded-lg object-contain bg-zinc-800 mb-2" }) : _jsx("div", { className: "w-full h-20 rounded-lg bg-zinc-800 flex items-center justify-center mb-2", children: _jsx(Package, { size: 20, className: "text-zinc-600" }) }), _jsx("p", { className: "text-white font-medium text-sm leading-tight", children: product.name }), _jsxs("p", { className: "text-[#FFE500] text-sm mt-1 font-bold", children: ["R$ ", (product.discount_price ?? product.price).toFixed(2), " ", product.discount_price && _jsxs("span", { className: "text-zinc-500 line-through text-xs ml-1", children: ["R$ ", product.price.toFixed(2)] })] }), _jsxs("span", { className: "text-zinc-500 text-xs flex items-center gap-1 mt-2", children: [_jsx(Plus, { size: 12 }), "Adicionar"] })] }, product.id))), filteredProducts.length === 0 && _jsx("p", { className: "text-zinc-400 text-sm col-span-full text-center py-8", children: "Nenhum produto encontrado." })] }))] }), _jsxs("div", { className: "bg-zinc-900 border border-zinc-800 rounded-xl p-4 h-fit flex flex-col", style: { maxHeight: 'calc(100vh - 200px)' }, children: [_jsxs("div", { className: "flex items-center justify-between mb-3", children: [_jsxs("h4", { className: "text-white font-bold flex items-center gap-2", children: [_jsx(Receipt, { size: 18 }), " Carrinho"] }), cart.length > 0 && _jsxs("button", { onClick: clearCart, className: "text-zinc-500 hover:text-red-400 text-xs flex items-center gap-1", children: [_jsx(Trash2, { size: 12 }), " Limpar"] })] }), _jsxs("div", { className: "flex-1 overflow-y-auto space-y-2 mb-3", children: [cart.map(item => (_jsxs("div", { className: "bg-zinc-800/50 border border-zinc-700 rounded-lg p-2.5 flex items-center gap-2", children: [item.image_url ? _jsx("img", { src: item.image_url, alt: item.name, className: "w-10 h-10 rounded-lg object-contain bg-zinc-900 flex-shrink-0" }) : _jsx("div", { className: "w-10 h-10 rounded-lg bg-zinc-700 flex items-center justify-center flex-shrink-0", children: _jsx(Package, { size: 14, className: "text-zinc-500" }) }), _jsxs("div", { className: "flex-1 min-w-0", children: [_jsx("p", { className: "text-white text-sm truncate", children: item.name }), editingPrice === item.id ? (_jsxs("div", { className: "flex items-center gap-1 mt-0.5", children: [_jsx("input", { type: "number", step: "0.01", value: priceInput, onChange: e => setPriceInput(e.target.value), onKeyDown: e => e.key === 'Enter' && savePrice(item.id), className: "w-20 bg-zinc-900 border border-[#FFE500]/50 text-white rounded px-1.5 py-0.5 text-xs", autoFocus: true }), _jsx("button", { onClick: () => savePrice(item.id), className: "text-green-400", children: _jsx(Check, { size: 12 }) }), _jsx("button", { onClick: () => setEditingPrice(null), className: "text-red-400", children: _jsx(X, { size: 12 }) })] })) : (_jsxs("button", { onClick: () => editPrice(item.id), className: "text-zinc-500 text-xs flex items-center gap-1 hover:text-[#FFE500]", children: ["R$ ", item.price.toFixed(2), " un. ", _jsx(Edit3, { size: 10 })] }))] }), _jsxs("div", { className: "flex items-center gap-1.5", children: [_jsx("button", { type: "button", onClick: () => changeQty(item.id, -1), className: "w-6 h-6 rounded bg-zinc-700 text-white flex items-center justify-center hover:bg-zinc-600", children: _jsx(Minus, { size: 12 }) }), _jsx("span", { className: "text-white text-sm w-6 text-center", children: item.quantity }), _jsx("button", { type: "button", onClick: () => changeQty(item.id, 1), className: "w-6 h-6 rounded bg-zinc-700 text-white flex items-center justify-center hover:bg-zinc-600", children: _jsx(Plus, { size: 12 }) }), _jsx("button", { type: "button", onClick: () => removeItem(item.id), className: "w-6 h-6 rounded text-red-400 hover:bg-red-500/10 flex items-center justify-center", children: _jsx(X, { size: 12 }) })] })] }, item.id))), cart.length === 0 && _jsx("p", { className: "text-zinc-500 text-sm text-center py-8", children: "Carrinho vazio. Selecione produtos." })] }), _jsxs("div", { className: "space-y-1.5 border-t border-zinc-800 pt-3", children: [_jsxs("div", { className: "flex justify-between text-sm", children: [_jsx("span", { className: "text-zinc-400", children: "Subtotal" }), _jsxs("span", { className: "text-zinc-300", children: ["R$ ", subtotal.toFixed(2)] })] }), _jsxs("div", { className: "flex items-center gap-2", children: [_jsxs("div", { className: "flex bg-zinc-800 rounded-lg overflow-hidden border border-zinc-700", children: [_jsx("button", { type: "button", onClick: () => setDiscountType('percent'), className: `px-2 py-1 text-xs ${discountType === 'percent' ? 'bg-[#FFE500] text-black' : 'text-zinc-400'}`, children: _jsx(Percent, { size: 12 }) }), _jsx("button", { type: "button", onClick: () => setDiscountType('fixed'), className: `px-2 py-1 text-xs ${discountType === 'fixed' ? 'bg-[#FFE500] text-black' : 'text-zinc-400'}`, children: _jsx(DollarSign, { size: 12 }) })] }), _jsx("input", { type: "number", step: "0.01", value: discountValue, onChange: e => setDiscountValue(e.target.value), placeholder: "Desconto", className: "flex-1 bg-zinc-800 border border-zinc-700 text-white rounded-lg px-2 py-1 text-sm focus:outline-none focus:border-[#FFE500]" })] }), discountAmount > 0 && (_jsxs("div", { className: "flex justify-between text-sm", children: [_jsxs("span", { className: "text-green-400", children: ["Desconto ", discountType === 'percent' ? `(${discountValue}%)` : ''] }), _jsxs("span", { className: "text-green-400", children: ["- R$ ", discountAmount.toFixed(2)] })] })), isDelivery && saleType === 'counter' && deliveryFeeAmount > 0 && (_jsxs("div", { className: "flex justify-between text-sm", children: [_jsxs("span", { className: "text-zinc-400 flex items-center gap-1", children: [_jsx(Bike, { size: 12 }), " Taxa de entrega (", deliveryFeePayer === 'store' ? 'loja' : 'cliente', ")"] }), _jsxs("span", { className: deliveryFeePayer === 'customer' ? 'text-orange-400' : 'text-zinc-500', children: [deliveryFeePayer === 'customer' ? '+ ' : '', "R$ ", deliveryFeeAmount.toFixed(2)] })] })), _jsxs("div", { className: "flex justify-between font-bold text-base border-t border-zinc-800 pt-2", children: [_jsx("span", { className: "text-white", children: "Total" }), _jsxs("span", { className: "text-[#FFE500]", children: ["R$ ", total.toFixed(2)] })] })] }), _jsxs("div", { className: "space-y-2 mt-3", children: [_jsxs("div", { children: [_jsx("label", { className: "block text-zinc-300 text-xs mb-1", children: "Tipo da opera\u00E7\u00E3o" }), _jsx("select", { value: saleType, onChange: e => setSaleType(e.target.value), className: "w-full bg-zinc-800 border border-zinc-700 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#FFE500]", children: SALE_TYPES.map(type => _jsxs("option", { value: type.value, children: [type.label, " \u2014 ", type.description] }, type.value)) })] }), saleType === 'counter' && (_jsxs("div", { className: "space-y-2", children: [_jsxs("label", { className: "flex items-center gap-2 cursor-pointer", children: [_jsx("input", { type: "checkbox", checked: isDelivery, onChange: e => setIsDelivery(e.target.checked), className: "w-4 h-4 rounded border-zinc-600 bg-zinc-800 text-[#FFE500] focus:ring-[#FFE500]" }), _jsx("span", { className: "text-zinc-300 text-sm", children: "Entrega (delivery)" })] }), isDelivery && (_jsxs("div", { className: "space-y-2", children: [_jsx("select", { value: deliverySource, onChange: e => setDeliverySource(e.target.value), className: "w-full bg-zinc-800 border border-zinc-700 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#FFE500]", children: DELIVERY_SOURCES.map(ds => _jsx("option", { value: ds.value, children: ds.label }, ds.value)) }), deliverySource === 'other' && _jsx("input", { value: deliverySourceDetail, onChange: e => setDeliverySourceDetail(e.target.value), placeholder: "Qual origem?", className: "w-full bg-zinc-800 border border-zinc-700 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#FFE500]" }), _jsxs("div", { className: "grid grid-cols-2 gap-2", children: [_jsxs("div", { children: [_jsx("label", { className: "block text-zinc-400 text-xs mb-1", children: "Taxa de entrega" }), _jsx("input", { type: "number", step: "0.01", value: deliveryFee, onChange: e => setDeliveryFee(e.target.value), placeholder: "R$ 0.00", className: "w-full bg-zinc-800 border border-zinc-700 text-white rounded-lg px-2 py-1.5 text-sm focus:outline-none focus:border-[#FFE500]" })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-zinc-400 text-xs mb-1", children: "Pago por" }), _jsxs("div", { className: "flex bg-zinc-800 rounded-lg overflow-hidden border border-zinc-700", children: [_jsx("button", { type: "button", onClick: () => setDeliveryFeePayer('customer'), className: `flex-1 text-xs py-1.5 ${deliveryFeePayer === 'customer' ? 'bg-[#FFE500] text-black font-bold' : 'text-zinc-400'}`, children: "Cliente" }), _jsx("button", { type: "button", onClick: () => setDeliveryFeePayer('store'), className: `flex-1 text-xs py-1.5 ${deliveryFeePayer === 'store' ? 'bg-[#FFE500] text-black font-bold' : 'text-zinc-400'}`, children: "Loja" })] })] })] })] }))] })), _jsxs("div", { className: "relative", children: [_jsx("input", { value: customer, onChange: e => { setCustomer(e.target.value); setSelectedCustomerId(null); setShowCustomerResults(true); searchCustomers(e.target.value); }, onFocus: () => setShowCustomerResults(true), onBlur: () => setTimeout(() => setShowCustomerResults(false), 200), placeholder: "Cliente (opcional) - digite para buscar", className: "w-full bg-zinc-800 border border-zinc-700 text-white rounded-lg px-3 py-2 text-sm" }), _jsx("button", { type: "button", onClick: () => setShowQuickCustomer(!showQuickCustomer), className: "absolute right-2 top-1/2 -translate-y-1/2 text-[#FFE500] hover:text-[#FFD000]", title: "Novo cliente", children: _jsx(UserPlus, { size: 16 }) }), showCustomerResults && customerSearchResults.length > 0 && (_jsx("div", { className: "absolute z-20 top-full mt-1 w-full bg-zinc-800 border border-zinc-700 rounded-lg shadow-xl max-h-56 overflow-y-auto", children: customerSearchResults.map(c => (_jsxs("button", { type: "button", onMouseDown: () => { setCustomer(c.name); setSelectedCustomerId(c.id); setShowCustomerResults(false); }, className: "w-full text-left px-3 py-2 hover:bg-zinc-700 transition-colors border-b border-zinc-700/50 last:border-0", children: [_jsx("p", { className: "text-white text-sm font-medium", children: c.name }), _jsxs("p", { className: "text-zinc-500 text-xs", children: [c.phone, c.city ? ` · ${c.city}` : ''] })] }, c.id))) }))] }), showQuickCustomer && (_jsxs("div", { className: "flex gap-2", children: [_jsx("input", { type: "text", value: quickCustomer.name, onChange: e => setQuickCustomer({ ...quickCustomer, name: e.target.value }), placeholder: "Nome do cliente", className: "flex-1 bg-zinc-800 border border-zinc-700 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#FFE500]" }), _jsx("input", { type: "text", value: quickCustomer.phone, onChange: e => setQuickCustomer({ ...quickCustomer, phone: e.target.value }), placeholder: "Telefone", className: "w-32 bg-zinc-800 border border-zinc-700 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#FFE500]" }), _jsx("button", { type: "button", onClick: saveQuickCustomer, disabled: !quickCustomer.name.trim(), className: "bg-[#FFE500] hover:bg-[#FFD000] text-black text-xs font-bold rounded-lg px-3 py-2 disabled:opacity-50", children: "Cadastrar" })] })), _jsx("input", { value: campaign, onChange: e => setCampaign(e.target.value), placeholder: "Campanha (opcional)", className: "w-full bg-zinc-800 border border-zinc-700 text-white rounded-lg px-3 py-2 text-sm" })] }), _jsxs("button", { disabled: cart.length === 0, onClick: () => setShowCheckout(true), className: "w-full bg-[#FFE500] hover:bg-[#FFD000] text-black font-bold rounded-lg py-3 mt-3 disabled:opacity-50 transition-colors flex items-center justify-center gap-2", children: [_jsx(Wallet, { size: 18 }), " Ir para pagamento"] })] })] }), showCheckout && (_jsx("div", { className: "fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm", onClick: () => setShowCheckout(false), children: _jsxs("div", { className: "bg-zinc-900 border border-zinc-800 rounded-2xl w-full max-w-md max-h-[90vh] overflow-y-auto", onClick: e => e.stopPropagation(), children: [_jsxs("div", { className: "flex items-center justify-between p-6 border-b border-zinc-800 sticky top-0 bg-zinc-900", children: [_jsxs("h3", { className: "text-white font-bold text-lg flex items-center gap-2", children: [_jsx(Wallet, { size: 20 }), " Pagamento"] }), _jsx("button", { onClick: () => setShowCheckout(false), className: "text-zinc-400 hover:text-white", children: _jsx(X, { size: 20 }) })] }), _jsxs("div", { className: "p-6 space-y-4", children: [_jsxs("div", { className: "bg-zinc-800/50 border border-zinc-700 rounded-lg p-4 space-y-1", children: [_jsxs("div", { className: "flex justify-between text-sm", children: [_jsx("span", { className: "text-zinc-400", children: "Subtotal" }), _jsxs("span", { className: "text-zinc-300", children: ["R$ ", subtotal.toFixed(2)] })] }), discountAmount > 0 && _jsxs("div", { className: "flex justify-between text-sm", children: [_jsx("span", { className: "text-green-400", children: "Desconto" }), _jsxs("span", { className: "text-green-400", children: ["- R$ ", discountAmount.toFixed(2)] })] }), isDelivery && saleType === 'counter' && deliveryFeeAmount > 0 && (_jsxs("div", { className: "flex justify-between text-sm", children: [_jsxs("span", { className: "text-zinc-400", children: ["Taxa de entrega (", deliveryFeePayer === 'store' ? 'loja' : 'cliente', ")"] }), _jsxs("span", { className: deliveryFeePayer === 'customer' ? 'text-orange-400' : 'text-zinc-500', children: [deliveryFeePayer === 'customer' ? '+ ' : '', "R$ ", deliveryFeeAmount.toFixed(2)] })] })), _jsxs("div", { className: "flex justify-between font-bold text-lg border-t border-zinc-700 pt-2", children: [_jsx("span", { className: "text-white", children: "Total a pagar" }), _jsxs("span", { className: "text-[#FFE500]", children: ["R$ ", total.toFixed(2)] })] })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-zinc-300 text-xs font-medium mb-2", children: "Forma de pagamento" }), _jsx("div", { className: "grid grid-cols-2 gap-2", children: PAYMENT_METHODS.map(pm => (_jsx("button", { onClick: () => { setPaymentMethod(pm.value); setAmountPaid(''); }, className: `text-sm font-medium rounded-lg px-3 py-2.5 transition-colors ${paymentMethod === pm.value ? 'bg-[#FFE500] text-black' : 'bg-zinc-800 text-zinc-400 hover:text-white'}`, children: pm.label }, pm.value))) })] }), paymentMethod === 'credit_card' && (_jsxs("div", { children: [_jsx("label", { className: "block text-zinc-300 text-xs font-medium mb-2", children: "Parcelamento" }), _jsx("div", { className: "grid grid-cols-3 gap-2", children: [1, 2, 3].map(n => (_jsxs("button", { onClick: () => setInstallments(n), className: `text-sm font-bold rounded-lg px-3 py-2.5 transition-colors ${installments === n ? 'bg-[#FFE500] text-black' : 'bg-zinc-800 text-zinc-400 hover:text-white'}`, children: [n, "x", n > 1 ? ' s/ juros' : ''] }, n))) }), _jsxs("p", { className: "text-white text-sm font-bold mt-2", children: [installments, "x de R$ ", (total / installments).toFixed(2)] })] })), paymentMethod === 'cash' && (_jsxs("div", { className: "space-y-3", children: [_jsxs("div", { children: [_jsx("label", { className: "block text-zinc-300 text-xs font-medium mb-1", children: "Valor recebido" }), _jsx("input", { type: "number", step: "0.01", value: amountPaid, onChange: e => setAmountPaid(e.target.value), placeholder: "R$ 0.00", className: "w-full bg-zinc-800 border border-zinc-700 text-white rounded-lg px-3 py-2.5 text-lg font-bold focus:outline-none focus:border-[#FFE500]" })] }), _jsxs("div", { className: "flex gap-2 flex-wrap", children: [QUICK_CASH.map(amt => (_jsxs("button", { onClick: () => setAmountPaid(String(amt)), className: "bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-bold rounded-lg px-3 py-1.5 transition-colors", children: ["R$ ", amt] }, amt))), _jsx("button", { onClick: () => setAmountPaid(total.toFixed(2)), className: "bg-[#FFE500]/20 hover:bg-[#FFE500]/30 text-[#FFE500] text-xs font-bold rounded-lg px-3 py-1.5 transition-colors", children: "Valor exato" })] }), parseFloat(amountPaid) > 0 && (_jsxs("div", { className: "bg-zinc-800/50 border border-zinc-700 rounded-lg p-3 flex justify-between items-center", children: [_jsx("span", { className: "text-zinc-400 text-sm", children: "Troco" }), _jsxs("span", { className: `text-lg font-bold ${change >= 0 ? 'text-green-400' : 'text-red-400'}`, children: ["R$ ", change.toFixed(2)] })] })), parseFloat(amountPaid) > 0 && parseFloat(amountPaid) < total && (_jsxs("p", { className: "text-red-400 text-xs", children: ["Valor insuficiente. Faltam R$ ", (total - parseFloat(amountPaid)).toFixed(2)] }))] })), paymentMethod !== 'cash' && (_jsxs("div", { className: "bg-zinc-800/50 border border-zinc-700 rounded-lg p-3 text-sm text-zinc-400", children: ["Pagamento via ", _jsx("span", { className: "text-white font-bold", children: PAYMENT_METHODS.find(p => p.value === paymentMethod)?.label }), " no valor de ", _jsxs("span", { className: "text-[#FFE500] font-bold", children: ["R$ ", total.toFixed(2)] }), "."] })), _jsx("button", { onClick: finish, disabled: saving || (paymentMethod === 'cash' && parseFloat(amountPaid) < total), className: "w-full bg-[#FFE500] hover:bg-[#FFD000] text-black font-bold rounded-lg py-3 flex items-center justify-center gap-2 disabled:opacity-50 transition-colors", children: saving ? _jsx("div", { className: "w-5 h-5 border-2 border-black/30 border-t-black rounded-full animate-spin" }) : _jsxs(_Fragment, { children: [_jsx(Check, { size: 20 }), " Confirmar venda"] }) })] })] }) }))] }));
}
