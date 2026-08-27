import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useEffect, useState } from 'react';
import { supabase } from '/app/lib/supabase.js';
import { BarChart3, Plus, Trash2, Lock, Unlock, DollarSign, TrendingUp, TrendingDown, Wallet, ShoppingBag, Receipt, Filter } from 'lucide-react';
export default function FranchiseeFinancial({ franchiseId }) {
    const [entries, setEntries] = useState([]);
    const [orders, setOrders] = useState([]);
    const [sales, setSales] = useState([]);
    const [password, setPassword] = useState(null);
    const [loading, setLoading] = useState(true);
    const [unlocked, setUnlocked] = useState(false);
    const [showForm, setShowForm] = useState(false);
    const [showPasswordForm, setShowPasswordForm] = useState(false);
    const [reportTab, setReportTab] = useState('overview');
    const [filterStart, setFilterStart] = useState('');
    const [filterEnd, setFilterEnd] = useState('');
    const [form, setForm] = useState({ type: 'income', description: '', amount: '', due_date: '' });
    const [pwForm, setPwForm] = useState({ password: '', confirm: '' });
    const [saving, setSaving] = useState(false);
    const load = async () => {
        const [{ data: entryData }, { data: orderData }, { data: saleData }, { data: pwData }] = await Promise.all([
            supabase.from('financial_entries').select('*').eq('franchise_id', franchiseId).order('created_at', { ascending: false }),
            supabase.from('customer_orders').select('*').eq('franchise_id', franchiseId).order('created_at', { ascending: false }),
            supabase.from('sales').select('*').eq('franchise_id', franchiseId).order('created_at', { ascending: false }),
            supabase.from('financial_passwords').select('*').eq('franchise_id', franchiseId).maybeSingle(),
        ]);
        if (entryData)
            setEntries(entryData);
        if (orderData)
            setOrders(orderData);
        if (saleData)
            setSales(saleData);
        if (pwData)
            setPassword(pwData);
        setLoading(false);
    };
    useEffect(() => { load(); }, [franchiseId]);
    const handleSave = async (e) => {
        e.preventDefault();
        setSaving(true);
        await supabase.from('financial_entries').insert({
            franchise_id: franchiseId,
            type: form.type,
            description: form.description,
            amount: parseFloat(form.amount) || 0,
            due_date: form.due_date || null,
        });
        setForm({ type: 'income', description: '', amount: '', due_date: '' });
        setShowForm(false);
        setSaving(false);
        load();
    };
    const handleDelete = async (e) => {
        if (!confirm('Excluir este lançamento?'))
            return;
        await supabase.from('financial_entries').delete().eq('id', e.id);
        load();
    };
    const togglePaid = async (e) => {
        await supabase.from('financial_entries').update({ paid: !e.paid }).eq('id', e.id);
        load();
    };
    const savePassword = async (e) => {
        e.preventDefault();
        if (pwForm.password !== pwForm.confirm) {
            alert('As senhas não conferem');
            return;
        }
        setSaving(true);
        const hash = btoa(pwForm.password);
        if (password) {
            await supabase.from('financial_passwords').update({ password_hash: hash }).eq('id', password.id);
        }
        else {
            await supabase.from('financial_passwords').insert({ franchise_id: franchiseId, password_hash: hash });
        }
        setPwForm({ password: '', confirm: '' });
        setShowPasswordForm(false);
        setSaving(false);
        load();
    };
    const removePassword = async () => {
        if (!confirm('Remover a senha de acesso da área financeira?'))
            return;
        await supabase.from('financial_passwords').delete().eq('franchise_id', franchiseId);
        setPassword(null);
        setUnlocked(false);
    };
    const verifyPassword = (input) => {
        if (password && btoa(input) === password.password_hash) {
            setUnlocked(true);
        }
        else {
            alert('Senha incorreta');
        }
    };
    const totalReceivable = entries.filter(e => e.type === 'receivable' && !e.paid).reduce((s, e) => s + e.amount, 0);
    const totalPayable = entries.filter(e => e.type === 'payable' && !e.paid).reduce((s, e) => s + e.amount, 0);
    const totalIncome = entries.filter(e => e.type === 'income').reduce((s, e) => s + e.amount, 0);
    const totalExpense = entries.filter(e => e.type === 'expense').reduce((s, e) => s + e.amount, 0);
    const balance = totalIncome - totalExpense;
    // Filter orders and sales by date range
    const inDateRange = (dateStr) => {
        const d = new Date(dateStr);
        if (filterStart && d < new Date(filterStart))
            return false;
        if (filterEnd && d > new Date(filterEnd + 'T23:59:59'))
            return false;
        return true;
    };
    const filteredOrders = orders.filter(o => inDateRange(o.created_at));
    const filteredSales = sales.filter(s => inDateRange(s.created_at));
    // Revenue from orders (online catalog) + sales (manual/counter)
    const ordersRevenue = filteredOrders.reduce((s, o) => s + o.total, 0);
    const salesRevenue = filteredSales.filter(s => s.sale_type === 'counter').reduce((s, s2) => s + s2.total, 0);
    const totalRevenue = ordersRevenue + salesRevenue;
    const totalOrders = filteredOrders.length + filteredSales.length;
    const avgTicket = totalOrders > 0 ? totalRevenue / totalOrders : 0;
    // Sales by payment method (from orders + sales)
    const byPaymentMethod = (() => {
        const map = new Map();
        const labels = { pix: 'PIX', credit_card: 'Cartão Crédito', debit_card: 'Cartão Débito', cash: 'Dinheiro', meal_voucher: 'Vale-refeição' };
        const addEntry = (method, total) => {
            const key = method ?? 'other';
            const label = method ? (labels[method] ?? method) : 'Outro';
            const entry = map.get(key) ?? { label, total: 0, count: 0 };
            entry.total += total;
            entry.count += 1;
            map.set(key, entry);
        };
        for (const o of filteredOrders)
            addEntry(o.payment_method, o.total);
        for (const s of filteredSales)
            if (s.sale_type === 'counter')
                addEntry(s.payment_method, s.total);
        return Array.from(map.entries()).map(([key, val]) => ({ key, ...val })).sort((a, b) => b.total - a.total);
    })();
    // Delivery fee breakdown
    const deliveryFees = filteredSales.filter(s => (s.delivery_fee ?? 0) > 0);
    const totalDeliveryFee = deliveryFees.reduce((sum, s) => sum + (s.delivery_fee ?? 0), 0);
    const storePaidDelivery = deliveryFees.filter(s => s.delivery_fee_payer === 'store').reduce((sum, s) => sum + (s.delivery_fee ?? 0), 0);
    const customerPaidDelivery = deliveryFees.filter(s => s.delivery_fee_payer === 'customer').reduce((sum, s) => sum + (s.delivery_fee ?? 0), 0);
    const totalDiscount = filteredSales.reduce((sum, s) => sum + (s.discount ?? 0), 0);
    // Sales by order mode
    const byOrderMode = (() => {
        const delivery = filteredOrders.filter(o => o.order_mode === 'delivery').length + filteredSales.filter(s => s.delivery_source).length;
        const pickup = filteredOrders.filter(o => o.order_mode === 'pickup').length;
        return { delivery, pickup };
    })();
    const typeInfo = (t) => {
        if (t === 'payable')
            return { label: 'Conta a pagar', color: 'text-red-400', icon: _jsx(TrendingDown, { size: 14 }) };
        if (t === 'receivable')
            return { label: 'A receber', color: 'text-green-400', icon: _jsx(TrendingUp, { size: 14 }) };
        if (t === 'income')
            return { label: 'Entrada', color: 'text-green-400', icon: _jsx(DollarSign, { size: 14 }) };
        return { label: 'Saída', color: 'text-red-400', icon: _jsx(Wallet, { size: 14 }) };
    };
    if (password && !unlocked) {
        return (_jsxs("div", { className: "flex flex-col items-center justify-center py-16", children: [_jsx(Lock, { size: 48, className: "text-[#FFE500] mb-4" }), _jsx("h3", { className: "text-white font-bold text-lg mb-2", children: "\u00C1rea protegida" }), _jsx("p", { className: "text-zinc-400 text-sm mb-4", children: "Digite a senha para acessar os relat\u00F3rios financeiros" }), _jsx(PasswordInput, { onVerify: verifyPassword })] }));
    }
    return (_jsxs("div", { children: [_jsxs("div", { className: "flex items-center justify-between mb-4 flex-wrap gap-2", children: [_jsx("h3", { className: "text-white font-bold text-lg", children: "Relat\u00F3rio Financeiro" }), _jsxs("div", { className: "flex gap-2", children: [_jsx("button", { onClick: () => setShowPasswordForm(!showPasswordForm), className: "bg-zinc-800 hover:bg-zinc-700 text-white text-sm font-medium rounded-lg px-3 py-2 flex items-center gap-1.5 transition-colors border border-zinc-700", children: password ? _jsxs(_Fragment, { children: [_jsx(Lock, { size: 14 }), " Alterar senha"] }) : _jsxs(_Fragment, { children: [_jsx(Unlock, { size: 14 }), " Criar senha"] }) }), password && unlocked && (_jsx("button", { onClick: removePassword, className: "bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-red-400 text-sm font-medium rounded-lg px-3 py-2 transition-colors border border-zinc-700", children: "Remover senha" })), _jsxs("button", { onClick: () => setShowForm(!showForm), className: "bg-[#FFE500] hover:bg-[#FFD000] text-black text-sm font-bold rounded-lg px-4 py-2 flex items-center gap-1.5 transition-all", children: [_jsx(Plus, { size: 16 }), " Novo Lan\u00E7amento"] })] })] }), showPasswordForm && (_jsxs("form", { onSubmit: savePassword, className: "bg-zinc-900 border border-zinc-800 rounded-xl p-4 mb-4 space-y-3", children: [_jsx("input", { type: "password", value: pwForm.password, onChange: e => setPwForm({ ...pwForm, password: e.target.value }), required: true, placeholder: "Senha", className: "w-full bg-zinc-800 border border-zinc-700 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#FFE500]" }), _jsx("input", { type: "password", value: pwForm.confirm, onChange: e => setPwForm({ ...pwForm, confirm: e.target.value }), required: true, placeholder: "Confirmar senha", className: "w-full bg-zinc-800 border border-zinc-700 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#FFE500]" }), _jsx("button", { type: "submit", disabled: saving, className: "bg-[#FFE500] hover:bg-[#FFD000] text-black text-sm font-bold rounded-lg px-4 py-2 disabled:opacity-50", children: "Salvar senha" })] })), _jsxs("div", { className: "grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6", children: [_jsxs("div", { className: "bg-zinc-900 border border-zinc-800 rounded-xl p-4", children: [_jsxs("div", { className: "flex items-center justify-between mb-1", children: [_jsx("p", { className: "text-zinc-400 text-xs", children: "A receber" }), _jsx(TrendingUp, { size: 16, className: "text-green-400" })] }), _jsxs("p", { className: "text-green-400 font-bold text-lg", children: ["R$ ", totalReceivable.toFixed(2)] })] }), _jsxs("div", { className: "bg-zinc-900 border border-zinc-800 rounded-xl p-4", children: [_jsxs("div", { className: "flex items-center justify-between mb-1", children: [_jsx("p", { className: "text-zinc-400 text-xs", children: "A pagar" }), _jsx(TrendingDown, { size: 16, className: "text-red-400" })] }), _jsxs("p", { className: "text-red-400 font-bold text-lg", children: ["R$ ", totalPayable.toFixed(2)] })] }), _jsxs("div", { className: "bg-zinc-900 border border-zinc-800 rounded-xl p-4", children: [_jsxs("div", { className: "flex items-center justify-between mb-1", children: [_jsx("p", { className: "text-zinc-400 text-xs", children: "Entradas" }), _jsx(DollarSign, { size: 16, className: "text-green-400" })] }), _jsxs("p", { className: "text-green-400 font-bold text-lg", children: ["R$ ", totalIncome.toFixed(2)] })] }), _jsxs("div", { className: "bg-zinc-900 border border-zinc-800 rounded-xl p-4", children: [_jsxs("div", { className: "flex items-center justify-between mb-1", children: [_jsx("p", { className: "text-zinc-400 text-xs", children: "Saldo" }), _jsx(Wallet, { size: 16, className: "text-[#FFE500]" })] }), _jsxs("p", { className: `font-bold text-lg ${balance >= 0 ? 'text-green-400' : 'text-red-400'}`, children: ["R$ ", balance.toFixed(2)] })] })] }), _jsxs("div", { className: "bg-zinc-900/50 border border-zinc-800 rounded-xl p-4 mb-4", children: [_jsxs("div", { className: "flex items-center gap-2 mb-3", children: [_jsx(Filter, { size: 16, className: "text-[#FFE500]" }), _jsx("span", { className: "text-white text-sm font-medium", children: "Filtrar per\u00EDodo" })] }), _jsxs("div", { className: "grid grid-cols-2 gap-3 mb-4", children: [_jsxs("div", { children: [_jsx("label", { className: "block text-zinc-300 text-xs font-medium mb-1", children: "De" }), _jsx("input", { type: "date", value: filterStart, onChange: e => setFilterStart(e.target.value), className: "w-full bg-zinc-800 border border-zinc-700 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#FFE500]" })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-zinc-300 text-xs font-medium mb-1", children: "At\u00E9" }), _jsx("input", { type: "date", value: filterEnd, onChange: e => setFilterEnd(e.target.value), className: "w-full bg-zinc-800 border border-zinc-700 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#FFE500]" })] })] }), _jsx("div", { className: "flex gap-2 mb-4 flex-wrap", children: [
                            { key: 'overview', label: 'Visão geral', icon: _jsx(BarChart3, { size: 14 }) },
                            { key: 'orders', label: 'Pedidos', icon: _jsx(ShoppingBag, { size: 14 }) },
                            { key: 'entries', label: 'Lançamentos', icon: _jsx(Receipt, { size: 14 }) },
                        ].map(tab => (_jsxs("button", { onClick: () => setReportTab(tab.key), className: `flex items-center gap-1.5 text-xs font-bold rounded-lg px-3 py-2 transition-colors ${reportTab === tab.key ? 'bg-[#FFE500] text-black' : 'bg-zinc-800 text-zinc-400 hover:text-white'}`, children: [tab.icon, " ", tab.label] }, tab.key))) }), reportTab === 'overview' && (_jsxs("div", { className: "space-y-4", children: [_jsxs("div", { className: "grid grid-cols-2 lg:grid-cols-4 gap-3", children: [_jsxs("div", { className: "bg-zinc-800/50 border border-zinc-700 rounded-lg p-3", children: [_jsxs("div", { className: "flex items-center justify-between mb-1", children: [_jsx("p", { className: "text-zinc-400 text-xs", children: "Faturamento" }), _jsx(DollarSign, { size: 14, className: "text-[#FFE500]" })] }), _jsxs("p", { className: "text-white font-bold text-base", children: ["R$ ", totalRevenue.toFixed(2)] })] }), _jsxs("div", { className: "bg-zinc-800/50 border border-zinc-700 rounded-lg p-3", children: [_jsxs("div", { className: "flex items-center justify-between mb-1", children: [_jsx("p", { className: "text-zinc-400 text-xs", children: "Total pedidos" }), _jsx(TrendingUp, { size: 14, className: "text-[#FFE500]" })] }), _jsx("p", { className: "text-white font-bold text-base", children: totalOrders })] }), _jsxs("div", { className: "bg-zinc-800/50 border border-zinc-700 rounded-lg p-3", children: [_jsxs("div", { className: "flex items-center justify-between mb-1", children: [_jsx("p", { className: "text-zinc-400 text-xs", children: "Ticket m\u00E9dio" }), _jsx(Receipt, { size: 14, className: "text-[#FFE500]" })] }), _jsxs("p", { className: "text-white font-bold text-base", children: ["R$ ", avgTicket.toFixed(2)] })] }), _jsxs("div", { className: "bg-zinc-800/50 border border-zinc-700 rounded-lg p-3", children: [_jsxs("div", { className: "flex items-center justify-between mb-1", children: [_jsx("p", { className: "text-zinc-400 text-xs", children: "Saldo" }), _jsx(Wallet, { size: 14, className: "text-[#FFE500]" })] }), _jsxs("p", { className: `font-bold text-base ${balance >= 0 ? 'text-green-400' : 'text-red-400'}`, children: ["R$ ", balance.toFixed(2)] })] })] }), byPaymentMethod.length > 0 && (_jsxs("div", { children: [_jsx("h4", { className: "text-white text-xs font-bold mb-2", children: "Vendas por forma de pagamento" }), _jsx("div", { className: "space-y-1.5", children: byPaymentMethod.map(pm => (_jsxs("div", { className: "flex justify-between text-sm", children: [_jsxs("span", { className: "text-zinc-300", children: [pm.label, " ", _jsxs("span", { className: "text-zinc-500", children: ["(", pm.count, "x)"] })] }), _jsxs("span", { className: "text-[#FFE500] font-bold", children: ["R$ ", pm.total.toFixed(2)] })] }, pm.key))) })] })), totalDiscount > 0 && (_jsxs("div", { children: [_jsx("h4", { className: "text-white text-xs font-bold mb-2", children: "Descontos concedidos" }), _jsxs("div", { className: "flex justify-between text-sm", children: [_jsx("span", { className: "text-green-400", children: "Total em descontos" }), _jsxs("span", { className: "text-green-400 font-bold", children: ["R$ ", totalDiscount.toFixed(2)] })] })] })), totalDeliveryFee > 0 && (_jsxs("div", { children: [_jsx("h4", { className: "text-white text-xs font-bold mb-2", children: "Taxas de entrega" }), _jsxs("div", { className: "space-y-1.5", children: [_jsxs("div", { className: "flex justify-between text-sm", children: [_jsx("span", { className: "text-zinc-300", children: "Total em taxas" }), _jsxs("span", { className: "text-white font-bold", children: ["R$ ", totalDeliveryFee.toFixed(2)] })] }), _jsxs("div", { className: "flex justify-between text-sm", children: [_jsx("span", { className: "text-zinc-300", children: "Pago pelo cliente" }), _jsxs("span", { className: "text-green-400 font-bold", children: ["R$ ", customerPaidDelivery.toFixed(2)] })] }), _jsxs("div", { className: "flex justify-between text-sm", children: [_jsx("span", { className: "text-zinc-300", children: "Absorvido pela loja" }), _jsxs("span", { className: "text-red-400 font-bold", children: ["R$ ", storePaidDelivery.toFixed(2)] })] })] })] })), (byOrderMode.delivery > 0 || byOrderMode.pickup > 0) && (_jsxs("div", { children: [_jsx("h4", { className: "text-white text-xs font-bold mb-2", children: "Pedidos por tipo" }), _jsxs("div", { className: "flex gap-4 text-sm", children: [_jsxs("span", { className: "text-zinc-300", children: ["Entrega: ", _jsx("span", { className: "text-[#FFE500] font-bold", children: byOrderMode.delivery })] }), _jsxs("span", { className: "text-zinc-300", children: ["Retirada: ", _jsx("span", { className: "text-[#FFE500] font-bold", children: byOrderMode.pickup })] })] })] }))] })), reportTab === 'orders' && (_jsx("div", { className: "space-y-2 max-h-96 overflow-y-auto", children: filteredOrders.length === 0 && filteredSales.length === 0 ? (_jsx("p", { className: "text-zinc-400 text-sm text-center py-6", children: "Nenhum pedido no per\u00EDodo." })) : (_jsxs(_Fragment, { children: [filteredOrders.map(o => (_jsxs("div", { className: "bg-zinc-800/50 border border-zinc-700 rounded-lg p-3 flex items-center justify-between", children: [_jsxs("div", { children: [_jsx("p", { className: "text-white text-sm font-medium", children: o.customer_name }), _jsxs("p", { className: "text-zinc-500 text-xs", children: [new Date(o.created_at).toLocaleString('pt-BR'), " \u2014 ", o.order_mode === 'pickup' ? 'Retirada' : 'Entrega'] })] }), _jsxs("div", { className: "text-right", children: [_jsxs("p", { className: "text-[#FFE500] text-sm font-bold", children: ["R$ ", o.total.toFixed(2)] }), _jsx("p", { className: "text-zinc-500 text-xs", children: o.payment_method ?? '—' })] })] }, o.id))), filteredSales.map(s => {
                                    const PAY_LABELS = { pix: 'PIX', credit_card: 'Crédito', debit_card: 'Débito', cash: 'Dinheiro', meal_voucher: 'VR' };
                                    const TYPE_LABELS = { counter: 'Balcão', sponsorship: 'Patrocínio', tasting: 'Degustação', gift: 'Brindes' };
                                    return (_jsxs("div", { className: "bg-zinc-800/50 border border-zinc-700 rounded-lg p-3", children: [_jsxs("div", { className: "flex items-start justify-between", children: [_jsxs("div", { children: [_jsxs("p", { className: "text-white text-sm font-medium", children: [TYPE_LABELS[s.sale_type] ?? s.sale_type, s.campaign_name ? ` — ${s.campaign_name}` : ''] }), _jsxs("p", { className: "text-zinc-500 text-xs", children: [new Date(s.created_at).toLocaleString('pt-BR'), s.payment_method ? ` • ${PAY_LABELS[s.payment_method] ?? s.payment_method}` : '', s.delivery_source ? ` • ${s.delivery_source}` : ''] })] }), _jsxs("p", { className: "text-[#FFE500] text-sm font-bold", children: ["R$ ", s.total.toFixed(2)] })] }), (s.discount ?? 0) > 0 || (s.delivery_fee ?? 0) > 0 ? (_jsxs("div", { className: "flex flex-wrap gap-1.5 mt-1.5", children: [(s.discount ?? 0) > 0 && _jsxs("span", { className: "text-xs bg-green-500/10 text-green-400 px-1.5 py-0.5 rounded", children: ["Desc: R$ ", (s.discount ?? 0).toFixed(2)] }), (s.delivery_fee ?? 0) > 0 && _jsxs("span", { className: "text-xs bg-orange-500/10 text-orange-400 px-1.5 py-0.5 rounded", children: ["Taxa: R$ ", (s.delivery_fee ?? 0).toFixed(2), " (", s.delivery_fee_payer === 'store' ? 'loja' : 'cliente', ")"] }), s.payment_method === 'cash' && (s.change ?? 0) > 0 && _jsxs("span", { className: "text-xs bg-zinc-800 text-zinc-400 px-1.5 py-0.5 rounded", children: ["Troco: R$ ", (s.change ?? 0).toFixed(2)] })] })) : null] }, s.id));
                                })] })) })), reportTab === 'entries' && (_jsx("div", { className: "space-y-2 max-h-96 overflow-y-auto", children: entries.length === 0 ? (_jsx("p", { className: "text-zinc-400 text-sm text-center py-6", children: "Nenhum lan\u00E7amento." })) : (entries.map(e => {
                            const ti = typeInfo(e.type);
                            return (_jsxs("div", { className: "bg-zinc-800/50 border border-zinc-700 rounded-lg p-3 flex items-center justify-between", children: [_jsxs("div", { className: "flex items-center gap-2", children: [_jsx("div", { className: `w-8 h-8 rounded-lg flex items-center justify-center ${e.type === 'income' || e.type === 'receivable' ? 'bg-green-500/10' : 'bg-red-500/10'}`, children: ti.icon }), _jsxs("div", { children: [_jsx("p", { className: "text-white text-sm font-medium", children: e.description }), _jsxs("p", { className: `text-xs ${ti.color}`, children: [ti.label, e.due_date && ` — Venc: ${new Date(e.due_date).toLocaleDateString('pt-BR')}`] })] })] }), _jsxs("div", { className: "flex items-center gap-2", children: [_jsxs("span", { className: `text-sm font-bold ${e.type === 'income' || e.type === 'receivable' ? 'text-green-400' : 'text-red-400'}`, children: ["R$ ", e.amount.toFixed(2)] }), (e.type === 'payable' || e.type === 'receivable') && (_jsx("button", { onClick: () => togglePaid(e), className: `text-xs px-2 py-1 rounded-lg ${e.paid ? 'bg-green-500/20 text-green-400' : 'bg-zinc-800 text-zinc-400'}`, children: e.paid ? 'Pago' : 'Pendente' })), _jsx("button", { onClick: () => handleDelete(e), className: "text-zinc-400 hover:text-red-400 p-1", children: _jsx(Trash2, { size: 14 }) })] })] }, e.id));
                        })) }))] }), showForm && (_jsxs("form", { onSubmit: handleSave, className: "bg-zinc-900 border border-zinc-800 rounded-xl p-4 mb-4 space-y-3", children: [_jsxs("div", { className: "grid grid-cols-1 sm:grid-cols-2 gap-3", children: [_jsxs("select", { value: form.type, onChange: e => setForm({ ...form, type: e.target.value }), className: "bg-zinc-800 border border-zinc-700 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#FFE500]", children: [_jsx("option", { value: "income", children: "Entrada" }), _jsx("option", { value: "expense", children: "Sa\u00EDda" }), _jsx("option", { value: "receivable", children: "A receber" }), _jsx("option", { value: "payable", children: "Conta a pagar" })] }), _jsx("input", { type: "number", step: "0.01", value: form.amount, onChange: e => setForm({ ...form, amount: e.target.value }), required: true, placeholder: "Valor", className: "bg-zinc-800 border border-zinc-700 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#FFE500]" })] }), _jsx("input", { type: "text", value: form.description, onChange: e => setForm({ ...form, description: e.target.value }), required: true, placeholder: "Descri\u00E7\u00E3o", className: "w-full bg-zinc-800 border border-zinc-700 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#FFE500]" }), _jsx("input", { type: "date", value: form.due_date, onChange: e => setForm({ ...form, due_date: e.target.value }), className: "bg-zinc-800 border border-zinc-700 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#FFE500]" }), _jsx("button", { type: "submit", disabled: saving, className: "bg-[#FFE500] hover:bg-[#FFD000] text-black text-sm font-bold rounded-lg px-4 py-2 disabled:opacity-50", children: "Salvar" })] })), loading ? (_jsx("div", { className: "flex justify-center py-12", children: _jsx("div", { className: "w-6 h-6 border-2 border-zinc-700 border-t-[#FFE500] rounded-full animate-spin" }) })) : entries.length === 0 ? (_jsxs("div", { className: "text-center py-12", children: [_jsx(BarChart3, { size: 40, className: "mx-auto text-zinc-700 mb-3" }), _jsx("p", { className: "text-zinc-400 text-sm", children: "Nenhum lan\u00E7amento financeiro." })] })) : (_jsx("div", { className: "space-y-2", children: entries.map(e => {
                    const ti = typeInfo(e.type);
                    return (_jsxs("div", { className: "bg-zinc-900 border border-zinc-800 rounded-xl p-3 flex items-center justify-between", children: [_jsxs("div", { className: "flex items-center gap-3", children: [_jsx("div", { className: `w-9 h-9 rounded-lg flex items-center justify-center ${e.type === 'income' || e.type === 'receivable' ? 'bg-green-500/10' : 'bg-red-500/10'}`, children: ti.icon }), _jsxs("div", { children: [_jsx("p", { className: "text-white text-sm font-bold", children: e.description }), _jsxs("p", { className: `text-xs ${ti.color}`, children: [ti.label, e.due_date && ` — Venc: ${new Date(e.due_date).toLocaleDateString('pt-BR')}`] })] })] }), _jsxs("div", { className: "flex items-center gap-2", children: [_jsxs("span", { className: `text-sm font-bold ${e.type === 'income' || e.type === 'receivable' ? 'text-green-400' : 'text-red-400'}`, children: ["R$ ", e.amount.toFixed(2)] }), (e.type === 'payable' || e.type === 'receivable') && (_jsx("button", { onClick: () => togglePaid(e), className: `text-xs px-2 py-1 rounded-lg ${e.paid ? 'bg-green-500/20 text-green-400' : 'bg-zinc-800 text-zinc-400'}`, children: e.paid ? 'Pago' : 'Pendente' })), _jsx("button", { onClick: () => handleDelete(e), className: "text-zinc-400 hover:text-red-400 p-1", children: _jsx(Trash2, { size: 14 }) })] })] }, e.id));
                }) }))] }));
}
function PasswordInput({ onVerify }) {
    const [pw, setPw] = useState('');
    return (_jsxs("form", { onSubmit: (e) => { e.preventDefault(); onVerify(pw); }, className: "flex flex-col items-center gap-3", children: [_jsx("input", { type: "password", value: pw, onChange: e => setPw(e.target.value), required: true, placeholder: "Senha", className: "bg-zinc-900 border border-zinc-700 text-white rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-[#FFE500] text-center" }), _jsx("button", { type: "submit", className: "bg-[#FFE500] hover:bg-[#FFD000] text-black text-sm font-bold rounded-lg px-6 py-2", children: "Entrar" })] }));
}
